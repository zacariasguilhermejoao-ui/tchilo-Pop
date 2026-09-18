/**
 * tchilo-Pop — Gato Neon (estilo da imagem do utilizador)
 * Ícone no círculo + overlay na câmara (MediaPipe Face Landmarker)
 */
(function () {
  'use strict';

  /* Réplica visual da imagem: orelhas roxas + bigodes + coração branco */
  var SVG_ICON =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
        '<defs>' +
        '<filter id="glow" x="-40%" y="-40%" width="180%" height="180%">' +
        '<feGaussianBlur stdDeviation="2.5" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
        '</filter>' +
        '</defs>' +
        /* orelha esquerda — forma roxa preenchida */
        '<path filter="url(#glow)" d="M28 95 C22 50 40 22 72 48 C78 55 70 78 62 95 C50 110 35 108 28 95Z" fill="#5a1a5e" stroke="#e8b8ff" stroke-width="3"/>' +
        '<path d="M40 88 C42 58 55 42 65 55" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M44 82 C48 62 55 52 60 58" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
        /* orelha direita */
        '<path filter="url(#glow)" d="M172 95 C178 50 160 22 128 48 C122 55 130 78 138 95 C150 110 165 108 172 95Z" fill="#5a1a5e" stroke="#e8b8ff" stroke-width="3"/>' +
        '<path d="M160 88 C158 58 145 42 135 55" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M156 82 C152 62 145 52 140 58" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
        /* bloco bigodes + nariz */
        '<path filter="url(#glow)" d="M55 118 C70 105 85 108 100 115 C115 108 130 105 145 118 C155 128 148 145 130 148 C115 150 100 145 100 145 C100 145 85 150 70 148 C52 145 45 128 55 118Z" fill="#5a1a5e" stroke="#e8b8ff" stroke-width="3"/>' +
        /* bigodes */
        '<g stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none">' +
        '<path d="M88 125 L58 118"/><path d="M88 132 L52 132"/><path d="M88 139 L58 148"/>' +
        '<path d="M112 125 L142 118"/><path d="M112 132 L148 132"/><path d="M112 139 L142 148"/>' +
        '</g>' +
        /* coração */
        '<path filter="url(#glow)" d="M100 142 C94 136 88 130 88 124 C88 119 92 116 96 116 C98 116 100 118 100 120 C100 118 102 116 104 116 C108 116 112 119 112 124 C112 130 106 136 100 142Z" fill="#fff"/>' +
      '</svg>'
    );

  var ICON_URL = window.__TCHILO_CAT_ICON || SVG_ICON;
  var OVERLAY_URL = window.__TCHILO_CAT_ICON || SVG_ICON;

  var overlayImg = null;
  var landmarker = null;
  var lastFace = null;
  var lastDetect = 0;

  function loadImages() {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        overlayImg = img;
        resolve(img);
      };
      img.onerror = function () {
        resolve(null);
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
        im.style.cssText = 'width:56px;height:56px;object-fit:contain;pointer-events:none;display:block;';
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
    var drawW = faceW * 1.7;
    var nh = overlayImg.naturalHeight || overlayImg.height || 200;
    var nw = overlayImg.naturalWidth || overlayImg.width || 200;
    var drawH = drawW * (nh / Math.max(1, nw));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.drawImage(overlayImg, -drawW / 2, -drawH * 0.36, drawW, drawH);
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
      'background:rgba(40,5,50,.55)!important;overflow:visible!important;}' +
      '#tchiloFxChips .fx-chip[data-fx="cat-neon"] img,#tchiloCamFxTrack .fx-3d-item[data-fx="cat-neon"] img{' +
      'width:56px!important;height:56px!important;object-fit:contain!important;}';
    document.head.appendChild(st);
  }

  function boot() {
    injectCSS();
    ICON_URL = window.__TCHILO_CAT_ICON || SVG_ICON;
    OVERLAY_URL = window.__TCHILO_CAT_ICON || SVG_ICON;
    loadImages();
    ensureLandmarker();
    applyChipIcons();
    setTimeout(applyChipIcons, 500);
    setTimeout(applyChipIcons, 1500);
    setTimeout(applyChipIcons, 3000);
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
