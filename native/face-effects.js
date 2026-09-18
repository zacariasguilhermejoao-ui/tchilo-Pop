/**
 * tchilo-Pop — Câmara com efeitos + filtros
 * MediaPipe Face Landmarker (CDN) · filtros de cor em tempo real
 * Efeitos faciais PNG: ver fx-png-effects.js
 */
(function () {
  'use strict';

  var faceLandmarker = null;
  var landmarkerPromise = null;
  var stream = null;
  var rafId = 0;
  var running = false;
  var effectIndex = 0;
  var filterIndex = 0;
  var lastVideoTime = -1;
  var detectEvery = 2;
  var frameCount = 0;
  var lastLandmarks = null;
  var videoEl = null;
  var canvasEl = null;
  var overlayEl = null;
  var statusEl = null;
  var facingMode = 'user';

  var EFFECTS = [
    { id: 'none', label: 'Nenhum' }
  ];

  var FILTERS = [
    { id: 'none', label: 'Original' },
    { id: 'warm', label: 'Quente' },
    { id: 'cool', label: 'Frio' },
    { id: 'bw', label: 'P&B' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'vivid', label: 'Vivo' },
    { id: 'soft', label: 'Suave' },
    { id: 'noir', label: 'Noir' },
    { id: 'sunset', label: 'Pôr-do-sol' },
    { id: 'mint', label: 'Menta' }
  ];

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || '';
  }

  function ensureLandmarker() {
    if (faceLandmarker) return Promise.resolve(faceLandmarker);
    if (landmarkerPromise) return landmarkerPromise;
    landmarkerPromise = (async function () {
      try {
        var vision = await import(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm'
        );
        var fileset = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        var opts = {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false
        };
        try {
          faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
        } catch (e) {
          opts.baseOptions.delegate = 'CPU';
          faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
        }
        setStatus('');
        return faceLandmarker;
      } catch (e) {
        landmarkerPromise = null;
        console.warn('Tchilo FaceLandmarker', e);
        throw e;
      }
    })();
    return landmarkerPromise;
  }

  function preloadModel() {
    try { ensureLandmarker().catch(function () {}); } catch (e) {}
  }

  function ensureUI() {
    if (document.getElementById('tchiloFaceFx')) return;
    var root = document.createElement('div');
    root.id = 'tchiloFaceFx';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<style>' +
      '#tchiloFaceFx{display:none;position:fixed;inset:0;z-index:300;background:#000;flex-direction:column;}' +
      '#tchiloFaceFx.open{display:flex;}' +
      '#tchiloFaceFx .fx-stage{position:relative;flex:1;min-height:0;background:#111;overflow:hidden;}' +
      '#tchiloFaceFx video,#tchiloFaceFx canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}' +
      '#tchiloFaceFx video{z-index:0;transform:scaleX(-1);}' +
      '#tchiloFaceFx.fx-env video{transform:none;}' +
      '#tchiloFaceFx canvas{z-index:1;pointer-events:none;}' +
      '#tchiloFaceFx .fx-top{position:absolute;top:0;left:0;right:0;padding:calc(12px + env(safe-area-inset-top)) 14px 10px;display:flex;align-items:center;justify-content:space-between;z-index:2;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);}' +
      '#tchiloFaceFx .fx-top b{color:#fff;font-size:16px;}' +
      '#tchiloFaceFx .fx-btn{border:0;border-radius:999px;padding:10px 16px;font-weight:800;cursor:pointer;background:rgba(255,255,255,.92);color:#111;}' +
      '#tchiloFaceFx .fx-btn.primary{background:#c8f560;}' +
      '#tchiloFaceFx .fx-btn.ghost{background:rgba(255,255,255,.18);color:#fff;}' +
      '#tchiloFaceFx .fx-bottom{position:absolute;bottom:0;left:0;right:0;padding:10px 12px calc(16px + env(safe-area-inset-bottom));z-index:2;background:linear-gradient(0deg,rgba(0,0,0,.72),transparent);display:flex;flex-direction:column;gap:8px;}' +
      '#tchiloFaceFx .fx-row-label{color:rgba(255,255,255,.7);font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}' +
      '#tchiloFaceFx .fx-effects,#tchiloFaceFx .fx-filters{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;}' +
      '#tchiloFaceFx .fx-chip{flex:0 0 auto;border:2px solid transparent;border-radius:999px;padding:7px 12px;font-weight:700;font-size:12px;background:rgba(255,255,255,.15);color:#fff;cursor:pointer;}' +
      '#tchiloFaceFx .fx-chip.active{border-color:#c8f560;background:rgba(200,245,96,.28);}' +
      '#tchiloFaceFx .fx-chip.filter-chip.active{border-color:#9ed7ff;background:rgba(158,215,255,.28);}' +
      '#tchiloFaceFx .fx-actions{display:flex;gap:10px;align-items:center;justify-content:center;}' +
      '#tchiloFaceFx .fx-shutter{width:68px;height:68px;border-radius:50%;border:4px solid #fff;background:#c8f560;cursor:pointer;}' +
      '#tchiloFaceFx .fx-status{color:rgba(255,255,255,.9);font-size:12px;text-align:center;min-height:16px;}' +
      '</style>' +
      '<div class="fx-stage">' +
      '<video id="tchiloFxVideo" playsinline muted autoplay></video>' +
      '<canvas id="tchiloFxCanvas"></canvas>' +
      '<div class="fx-top">' +
      '<button type="button" class="fx-btn ghost" id="tchiloFxClose">Fechar</button>' +
      '<b>Efeitos & Filtros</b>' +
      '<button type="button" class="fx-btn" id="tchiloFxFlip">Inverter</button>' +
      '</div>' +
      '<div class="fx-bottom">' +
      '<div class="fx-status" id="tchiloFxStatus"></div>' +
      '<div class="fx-row-label">Efeitos</div>' +
      '<div class="fx-effects" id="tchiloFxChips"></div>' +
      '<div class="fx-row-label">Filtros</div>' +
      '<div class="fx-filters" id="tchiloFxFilters"></div>' +
      '<div class="fx-actions">' +
      '<button type="button" class="fx-btn" id="tchiloFxPrev">‹</button>' +
      '<button type="button" class="fx-shutter" id="tchiloFxCapture" aria-label="Tirar foto"></button>' +
      '<button type="button" class="fx-btn primary" id="tchiloFxNext">›</button>' +
      '</div></div></div>';
    document.body.appendChild(root);

    videoEl = document.getElementById('tchiloFxVideo');
    canvasEl = document.getElementById('tchiloFxCanvas');
    overlayEl = root;
    statusEl = document.getElementById('tchiloFxStatus');

    document.getElementById('tchiloFxClose').onclick = closeFaceEffects;
    document.getElementById('tchiloFxPrev').onclick = function () { cycleEffect(-1); };
    document.getElementById('tchiloFxNext').onclick = function () { cycleEffect(1); };
    document.getElementById('tchiloFxCapture').onclick = capturePhoto;
    document.getElementById('tchiloFxFlip').onclick = flipCamera;

    var chips = document.getElementById('tchiloFxChips');
    EFFECTS.forEach(function (ef, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-chip' + (i === 0 ? ' active' : '');
      b.textContent = ef.label;
      b.onclick = function () { effectIndex = i; updateChips(); };
      chips.appendChild(b);
    });

    var fchips = document.getElementById('tchiloFxFilters');
    FILTERS.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-chip filter-chip' + (i === 0 ? ' active' : '');
      b.textContent = f.label;
      b.onclick = function () { filterIndex = i; updateFilterChips(); };
      fchips.appendChild(b);
    });
  }

  function updateChips() {
    document.querySelectorAll('#tchiloFxChips .fx-chip').forEach(function (c, i) {
      c.classList.toggle('active', i === effectIndex);
    });
  }

  function updateFilterChips() {
    document.querySelectorAll('#tchiloFxFilters .fx-chip').forEach(function (c, i) {
      c.classList.toggle('active', i === filterIndex);
    });
  }

  function cycleEffect(dir) {
    effectIndex = (effectIndex + dir + EFFECTS.length) % EFFECTS.length;
    updateChips();
  }

  async function flipCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    if (overlayEl) overlayEl.classList.toggle('fx-env', facingMode === 'environment');
    await startCamera();
  }

  async function startCamera() {
    stopStreamOnly();
    setStatus('A abrir câmara…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640, max: 960 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 24, max: 30 }
        }
      });
      videoEl.srcObject = stream;
      videoEl.setAttribute('playsinline', '');
      videoEl.muted = true;
      var p = videoEl.play();
      if (p && p.catch) p.catch(function () {});
      setStatus(faceLandmarker ? '' : 'Câmara pronta · a carregar efeitos…');
    } catch (err) {
      setStatus('Sem acesso à câmara.');
      console.warn('Tchilo face fx camera', err);
    }
  }

  function stopStreamOnly() {
    if (stream) {
      stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      stream = null;
    }
  }

  function stopLoop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  function drawEffect(ctx, landmarks, w, h) {
    /* efeitos PNG em fx-png-effects.js */
  }

  function applyFilterOverlay(ctx, w, h) {
    var id = FILTERS[filterIndex].id;
    if (id === 'none') return;
    ctx.save();
    if (id === 'warm') { ctx.fillStyle = 'rgba(255,160,60,0.18)'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'cool') { ctx.fillStyle = 'rgba(60,140,255,0.16)'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'bw') { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'vintage') { ctx.fillStyle = 'rgba(180,120,40,0.22)'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'vivid') { ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = 'rgba(255,100,150,0.12)'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'soft') { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'noir') { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'sunset') { ctx.fillStyle = 'rgba(255,80,40,0.2)'; ctx.fillRect(0, 0, w, h); }
    else if (id === 'mint') { ctx.fillStyle = 'rgba(80,220,180,0.16)'; ctx.fillRect(0, 0, w, h); }
    ctx.restore();
  }

  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (!videoEl || videoEl.readyState < 2) return;

    var w = videoEl.videoWidth || 640;
    var h = videoEl.videoHeight || 480;
    if (canvasEl.width !== w || canvasEl.height !== h) {
      canvasEl.width = w;
      canvasEl.height = h;
    }

    var ctx = canvasEl.getContext('2d', { alpha: true });
    var hasEffect = EFFECTS[effectIndex].id !== 'none';
    var hasFilter = FILTERS[filterIndex].id !== 'none';

    if (hasFilter || hasEffect) {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      if (facingMode === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      if (hasFilter) {
        ctx.drawImage(videoEl, 0, 0, w, h);
        applyFilterOverlay(ctx, w, h);
      }
      frameCount++;
      try {
        if (faceLandmarker && videoEl.currentTime !== lastVideoTime && frameCount % detectEvery === 0) {
          lastVideoTime = videoEl.currentTime;
          var res = faceLandmarker.detectForVideo(videoEl, performance.now());
          if (res && res.faceLandmarks && res.faceLandmarks.length) lastLandmarks = res.faceLandmarks;
        }
      } catch (e) {}
      if (hasEffect && lastLandmarks) {
        if (!hasFilter) {
          ctx.restore();
          ctx.clearRect(0, 0, w, h);
          ctx.save();
          if (facingMode === 'user') {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
          }
        }
        drawEffect(ctx, lastLandmarks, w, h);
      }
      ctx.restore();
      if (videoEl) videoEl.style.opacity = hasFilter ? '0' : '1';
    } else {
      ctx.clearRect(0, 0, w, h);
      if (videoEl) videoEl.style.opacity = '1';
      frameCount++;
      try {
        if (faceLandmarker && videoEl.currentTime !== lastVideoTime && frameCount % detectEvery === 0) {
          lastVideoTime = videoEl.currentTime;
          var res2 = faceLandmarker.detectForVideo(videoEl, performance.now());
          if (res2 && res2.faceLandmarks && res2.faceLandmarks.length) lastLandmarks = res2.faceLandmarks;
        }
      } catch (e2) {}
    }
  }

  function enhanceFast(ctx, w, h) {}

  function capturePhoto() {
    if (!videoEl || videoEl.readyState < 2) { setStatus('Câmara não pronta'); return; }
    var w = videoEl.videoWidth || 640;
    var h = videoEl.videoHeight || 480;
    var out = document.createElement('canvas');
    out.width = w; out.height = h;
    var ctx = out.getContext('2d');
    ctx.save();
    if (facingMode === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(videoEl, 0, 0, w, h);
    applyFilterOverlay(ctx, w, h);
    if (lastLandmarks) drawEffect(ctx, lastLandmarks, w, h);
    ctx.restore();

    out.toBlob(function (blob) {
      if (!blob) { setStatus('Erro ao guardar'); return; }
      var url = URL.createObjectURL(blob);
      setStatus('Foto capturada');
      try {
        if (typeof window.onFaceFxCapture === 'function') window.onFaceFxCapture(url, blob);
      } catch (e) {}
      closeFaceEffects();
    }, 'image/jpeg', 0.92);
  }

  function openFaceEffects() {
    ensureUI();
    preloadModel();
    ensureLandmarker().catch(function () {});
    var root = document.getElementById('tchiloFaceFx');
    if (!root) return;
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    running = true;
    startCamera().then(function () {
      stopLoop();
      running = true;
      loop();
    });
  }

  function closeFaceEffects() {
    stopLoop();
    stopStreamOnly();
    var root = document.getElementById('tchiloFaceFx');
    if (root) {
      root.classList.remove('open');
      root.setAttribute('aria-hidden', 'true');
    }
    if (videoEl) {
      videoEl.srcObject = null;
      videoEl.style.opacity = '1';
    }
  }

  function injectCreateButton() {
    /* botão gerido por camera-tiktok.js */
  }

  window.openFaceEffects = openFaceEffects;
  window.closeFaceEffects = closeFaceEffects;

  function boot() {
    ensureUI();
    preloadModel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(injectCreateButton, 800);
})();
