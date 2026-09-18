/**
 * tchilo-Pop — loop de efeitos na câmara TikTok (MediaPipe + TchiloCamFx)
 */
(function () {
  'use strict';
  var faceLandmarker = null, landmarkerPromise = null;
  var running = false, rafId = 0, lastVideoTime = -1, frameCount = 0, lastLandmarks = null;
  var detectEvery = 2;
  var effectId = 'none', filterId = 'none';

  function ensureLandmarker() {
    if (faceLandmarker) return Promise.resolve(faceLandmarker);
    if (landmarkerPromise) return landmarkerPromise;
    landmarkerPromise = (async function () {
      try {
        var vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
        var fileset = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        var opts = {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO', numFaces: 1
        };
        try {
          faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
        } catch (e) {
          opts.baseOptions.delegate = 'CPU';
          faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
        }
        return faceLandmarker;
      } catch (e) {
        landmarkerPromise = null;
        console.warn('cam-fx-live landmarker', e);
        throw e;
      }
    })();
    return landmarkerPromise;
  }

  function getFacing() {
    var root = document.getElementById('tchiloCam');
    return root && root.classList.contains('cam-env') ? 'environment' : 'user';
  }

  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    var root = document.getElementById('tchiloCam');
    if (!root || !root.classList.contains('open')) return;
    var video = document.getElementById('tchiloCamVideo');
    var canvas = document.getElementById('tchiloCamCanvas');
    if (!video || !canvas || video.readyState < 2) return;
    var w = video.videoWidth || 640, h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    var ctx = canvas.getContext('2d', { alpha: true });
    var hasEffect = effectId !== 'none';
    var hasFilter = filterId !== 'none';
    var fx = window.TchiloCamFx;
    if (!hasFilter && !hasEffect) {
      ctx.clearRect(0, 0, w, h);
      video.style.opacity = '1';
      return;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (getFacing() === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1); }
    if (hasFilter) {
      ctx.drawImage(video, 0, 0, w, h);
      if (fx) fx.applyFilter(ctx, w, h, filterId);
      video.style.opacity = '0';
    } else {
      video.style.opacity = '1';
    }
    frameCount++;
    try {
      if (faceLandmarker && video.currentTime !== lastVideoTime && frameCount % detectEvery === 0) {
        lastVideoTime = video.currentTime;
        var res = faceLandmarker.detectForVideo(video, performance.now());
        if (res && res.faceLandmarks && res.faceLandmarks.length) lastLandmarks = res.faceLandmarks;
      }
    } catch (e) {}
    if (hasEffect && lastLandmarks && fx) {
      if (!hasFilter) {
        ctx.restore();
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        if (getFacing() === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1); }
      }
      fx.drawEffect(ctx, lastLandmarks, w, h, effectId);
    }
    ctx.restore();
  }

  function start() {
    running = true; lastVideoTime = -1; frameCount = 0; lastLandmarks = null;
    if (rafId) cancelAnimationFrame(rafId);
    loop();
    ensureLandmarker().catch(function () {});
  }
  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    var video = document.getElementById('tchiloCamVideo');
    if (video) video.style.opacity = '1';
  }

  function syncSelection() {
    var map = {
      'Normal':'none','Óculos':'glasses','Escuros':'sunglasses','Chapéu':'hat','Coroa':'crown',
      'Gato':'cat','Cão':'dog','Bigode':'mustache','Corações':'hearts','Blush':'blush','Flor':'flower',
      'Original':'none','Quente':'warm','Frio':'cool','P&B':'bw','Vivo':'vivid','Suave':'soft','Filme':'vintage'
    };
    var activeFx = document.querySelector('#tchiloCamFxTrack .fx-3d-item.active');
    var activeFi = document.querySelector('#tchiloCamFilters .fx-fchip.on');
    if (activeFx) effectId = map[activeFx.textContent.trim()] || 'none';
    if (activeFi) filterId = map[activeFi.textContent.trim()] || 'none';
  }

  function watch() {
    var root = document.getElementById('tchiloCam');
    if (!root) return;
    if (!root.__fxLiveObs) {
      root.__fxLiveObs = true;
      new MutationObserver(function () {
        if (root.classList.contains('open')) { syncSelection(); start(); }
        else stop();
      }).observe(root, { attributes: true, attributeFilter: ['class'] });
    }
    root.addEventListener('click', function () { setTimeout(syncSelection, 0); }, true);
    if (root.classList.contains('open')) { syncSelection(); start(); }
  }

  function boot() {
    watch();
    setTimeout(watch, 800);
    setTimeout(watch, 2000);
    try { ensureLandmarker().catch(function () {}); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
