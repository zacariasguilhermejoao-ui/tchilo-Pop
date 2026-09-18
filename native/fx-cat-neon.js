/**
 * tchilo-Pop — Gato Neon (imagem do utilizador)
 * Ícone no círculo + overlay na câmara (MediaPipe)
 * Assets: carrega ICON/OVERLAY embutidos ou de ficheiros auxiliares
 */
(function () {
  'use strict';

  // SVG fallback idêntico ao estilo (se PNG ainda não carregou)
  var SVG_ICON =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
        '<defs><filter id="g" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
        '<g filter="url(#g)" fill="none" stroke="#e8c0ff" stroke-width="6" stroke-linecap="round">' +
        '<path d="M45 85 C50 35 75 25 90 55" stroke="#fff" stroke-width="8"/>' +
        '<path d="M55 80 C60 50 72 42 82 58" stroke="#fff" stroke-width="4"/>' +
        '<path d="M155 85 C150 35 125 25 110 55" stroke="#fff" stroke-width="8"/>' +
        '<path d="M145 80 C140 50 128 42 118 58" stroke="#fff" stroke-width="4"/>' +
        '<path d="M88 120 L50 108" stroke="#fff" stroke-width="5"/>' +
        '<path d="M88 128 L45 128" stroke="#fff" stroke-width="5"/>' +
        '<path d="M88 136 L50 148" stroke="#fff" stroke-width="5"/>' +
        '<path d="M112 120 L150 108" stroke="#fff" stroke-width="5"/>' +
        '<path d="M112 128 L155 128" stroke="#fff" stroke-width="5"/>' +
        '<path d="M112 136 L150 148" stroke="#fff" stroke-width="5"/>' +
        '</g>' +
        '<path filter="url(#g)" d="M100 145 C90 136 82 128 82 118 C82 110 88 105 95 105 C98 105 100 107 100 112 C100 107 102 105 105 105 C112 105 118 110 118 118 C118 128 110 136 100 145 Z" fill="#fff"/>' +
      '</svg>'
    );

  var ICON_URL = window.__TCHILO_CAT_ICON || SVG_ICON;
  var OVERLAY_URL =
    window.__TCHILO_CAT_OV1 && window.__TCHILO_CAT_OV2
      ? 'data:image/png;base64,' + window.__TCHILO_CAT_OV1 + window.__TCHILO_CAT_OV2
      : window.__TCHILO_CAT_ICON || SVG_ICON;

  var overlayImg = null;
  var landmarker = null;
  var lastFace = null;
  var lastDetect = 0;

  function loadImages() {
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        overlayImg = img;
        resolve(img);
      };
      img.onerror = function () {
        // fallback SVG as image
        var img2 = new Image();
        img2.onload = function () {
          overlayImg = img2;
          resolve(img2);
        };
        img2.src = SVG_ICON;
      };
      img.src = OVERLAY_URL;
    });
  }

  function lm(L, i, w, h) {
    var p = L[i];
    return { x: p.x * w, y: p.y * h };
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function isCatSelected() {
    var nodes = document.querySelectorAll(
      '#tchiloFxChips .fx-chip.active, #tchiloCamFxTrack .fx-3d-item.active, #tchiloFxProBar .fx-chip.active'
    );
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute('data-fx') === 'cat-neon') return true;
      var t = (el.getAttribute('data-label') || el.getAttribute('aria-label') || el.title || '').toLowerCase();
      if (t.indexOf('gato') >= 0 || t.indexOf('cat') >= 0) return true;
    }
    return false;
  }

  function applyChipIcons() {
    document
      .querySelectorAll('#tchiloFxChips .fx-chip, #tchiloCamFxTrack .fx-3d-item, #tchiloFxProBar .fx-chip')
      .forEach(function (btn) {
        var label = (btn.getAttribute('data-label') || btn.getAttribute('aria-label') || btn.title || btn.textContent || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (label.indexOf('gato') < 0 && label.indexOf('cat') < 0 && label.indexOf('orelha') < 0) return;
        if (btn.getAttribute('data-fx') === 'cat-neon' && btn.querySelector('img')) return;
        btn.setAttribute('data-fx', 'cat-neon');
        btn.setAttribute('data-label', 'Gato');
        btn.setAttribute('aria-label', 'Gato');
        btn.title = 'Gato';
        btn.innerHTML = '';
        var im = document.createElement('img');
        im.src = ICON_URL;
        im.alt = 'Gato';
        im.style.cssText = 'width:54px;height:54px;object-fit:contain;pointer-events:none;display:block;';
        btn.appendChild(im);
        btn.__fxIcon = true;
      });
  }

  function getPair() {
    var face = document.getElementById('tchiloFaceFx');
    if (face && face.classList.contains('open')) {
      return {
        video: document.getElementById('tchiloFxVideo'),
        canvas: document.getElementById('tchiloFxCanvas'),
        mirror: !face.classList.contains('fx-env')
      };
    }
    var cam = document.getElementById('tchiloCam');
    if (cam && cam.classList.contains('open')) {
      return {
        video: document.getElementById('tchiloCamVideo'),
        canvas: document.getElementById('tchiloCamCanvas'),
        mirror: !cam.classList.contains('cam-env')
      };
    }
    return null;
  }

  async function ensureLandmarker() {
    if (landmarker) return landmarker;
    try {
      var vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
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
        numFaces: 1
      };
      try {
        landmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
      } catch (e) {
        opts.baseOptions.delegate = 'CPU';
        landmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
      }
    } catch (e) {
      console.warn('cat-neon landmarker', e);
    }
    return landmarker;
  }

  function drawOverlay(ctx, face, w, h) {
    if (!overlayImg || !face) return;
    var left = lm(face, 234, w, h);
    var right = lm(face, 454, w, h);
    var top = lm(face, 10, w, h);
    var nose = lm(face, 1, w, h);
    var faceW = dist(left, right);
    if (faceW < 8) return;
    var cx = (left.x + right.x) / 2;
    var cy = (top.y + nose.y) / 2;
    var ang = Math.atan2(right.y - left.y, right.x - left.x);
    var drawW = faceW * 1.65;
    var nh = overlayImg.naturalHeight || overlayImg.height || 200;
    var nw = overlayImg.naturalWidth || overlayImg.width || 200;
    var drawH = drawW * (nh / Math.max(1, nw));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.drawImage(overlayImg, -drawW / 2, -drawH * 0.38, drawW, drawH);
    ctx.restore();
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!isCatSelected()) return;
    var pair = getPair();
    if (!pair || !pair.video || !pair.canvas) return;
    var video = pair.video;
    var canvas = pair.canvas;
    if (video.readyState < 2) return;
    var w = video.videoWidth || 640;
    var h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    var now = performance.now();
    if (landmarker && now - lastDetect > 33) {
      lastDetect = now;
      try {
        var res = landmarker.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks[0]) lastFace = res.faceLandmarks[0];
      } catch (e) {}
    }
    if (!lastFace || !overlayImg) return;
    var face = lastFace;
    if (pair.mirror) {
      face = lastFace.map(function (p) {
        return { x: 1 - p.x, y: p.y, z: p.z };
      });
    }
    drawOverlay(canvas.getContext('2d'), face, w, h);
  }

  function injectCSS() {
    if (document.getElementById('tchiloCatNeonCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloCatNeonCSS';
    st.textContent =
      '#tchiloFxChips .fx-chip[data-fx="cat-neon"],#tchiloCamFxTrack .fx-3d-item[data-fx="cat-neon"]{' +
      'background:rgba(40,5,50,.5)!important;overflow:visible!important;}' +
      '#tchiloFxChips .fx-chip[data-fx="cat-neon"] img,#tchiloCamFxTrack .fx-3d-item[data-fx="cat-neon"] img{' +
      'width:56px!important;height:56px!important;object-fit:contain!important;}';
    document.head.appendChild(st);
  }

  function boot() {
    injectCSS();
    // carregar assets PNG se existirem
    var s1 = document.createElement('script');
    s1.src = 'native/fx-cat-neon-icon.js';
    s1.onload = function () {
      ICON_URL = window.__TCHILO_CAT_ICON || ICON_URL;
      applyChipIcons();
    };
    document.head.appendChild(s1);
    var s2 = document.createElement('script');
    s2.src = 'native/fx-cat-neon-ov1.js';
    s2.onload = function () {
      var s3 = document.createElement('script');
      s3.src = 'native/fx-cat-neon-ov2.js';
      s3.onload = function () {
        if (window.__TCHILO_CAT_OV1 && window.__TCHILO_CAT_OV2) {
          OVERLAY_URL = 'data:image/png;base64,' + window.__TCHILO_CAT_OV1 + window.__TCHILO_CAT_OV2;
        }
        loadImages().then(function () {
          applyChipIcons();
        });
      };
      document.head.appendChild(s3);
    };
    document.head.appendChild(s2);

    loadImages();
    ensureLandmarker();
    applyChipIcons();
    setTimeout(applyChipIcons, 600);
    setTimeout(applyChipIcons, 2000);
    try {
      new MutationObserver(function () {
        applyChipIcons();
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
