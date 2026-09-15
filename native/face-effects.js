/**
 * tchilo-Pop — Efeitos de câmara (rápido)
 * Câmara abre já; MediaPipe carrega em paralelo / em pré-carga.
 */
(function () {
  'use strict';

  var faceLandmarker = null;
  var landmarkerPromise = null;
  var stream = null;
  var rafId = 0;
  var running = false;
  var effectIndex = 0;
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
    { id: 'none', label: 'Nenhum' },
    { id: 'glasses', label: 'Óculos' },
    { id: 'hat', label: 'Chapéu' },
    { id: 'ears', label: 'Orelhas' },
    { id: 'mustache', label: 'Bigode' },
    { id: 'dog', label: 'Cãozinho' }
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
        } catch (gpuErr) {
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
    try {
      ensureLandmarker().catch(function () {});
    } catch (e) {}
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
      '#tchiloFaceFx .fx-bottom{position:absolute;bottom:0;left:0;right:0;padding:12px 14px calc(18px + env(safe-area-inset-bottom));z-index:2;background:linear-gradient(0deg,rgba(0,0,0,.65),transparent);display:flex;flex-direction:column;gap:12px;}' +
      '#tchiloFaceFx .fx-effects{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;}' +
      '#tchiloFaceFx .fx-chip{flex:0 0 auto;border:2px solid transparent;border-radius:999px;padding:8px 14px;font-weight:700;font-size:13px;background:rgba(255,255,255,.15);color:#fff;cursor:pointer;}' +
      '#tchiloFaceFx .fx-chip.active{border-color:#c8f560;background:rgba(200,245,96,.25);}' +
      '#tchiloFaceFx .fx-actions{display:flex;gap:10px;align-items:center;justify-content:center;}' +
      '#tchiloFaceFx .fx-shutter{width:72px;height:72px;border-radius:50%;border:4px solid #fff;background:#c8f560;cursor:pointer;}' +
      '#tchiloFaceFx .fx-status{color:rgba(255,255,255,.9);font-size:13px;text-align:center;min-height:18px;}' +
      '</style>' +
      '<div class="fx-stage">' +
      '<video id="tchiloFxVideo" playsinline muted autoplay></video>' +
      '<canvas id="tchiloFxCanvas"></canvas>' +
      '<div class="fx-top">' +
      '<button type="button" class="fx-btn ghost" id="tchiloFxClose">Fechar</button>' +
      '<b>Efeitos</b>' +
      '<button type="button" class="fx-btn" id="tchiloFxFlip">Inverter</button>' +
      '</div>' +
      '<div class="fx-bottom">' +
      '<div class="fx-status" id="tchiloFxStatus"></div>' +
      '<div class="fx-effects" id="tchiloFxChips"></div>' +
      '<div class="fx-actions">' +
      '<button type="button" class="fx-btn" id="tchiloFxPrev">‹ Efeito</button>' +
      '<button type="button" class="fx-shutter" id="tchiloFxCapture" aria-label="Tirar foto"></button>' +
      '<button type="button" class="fx-btn primary" id="tchiloFxNext">Efeito ›</button>' +
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
  }

  function updateChips() {
    document.querySelectorAll('#tchiloFxChips .fx-chip').forEach(function (c, i) {
      c.classList.toggle('active', i === effectIndex);
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
      stream.getTracks().forEach(function (t) {
        try { t.stop(); } catch (e) {}
      });
      stream = null;
    }
  }

  function stopLoop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  function lm(L, idx, w, h) {
    var p = L[idx];
    return { x: p.x * w, y: p.y * h };
  }

  function dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function drawGlasses(ctx, L, w, h) {
    var left = lm(L, 33, w, h), right = lm(L, 263, w, h);
    var mid = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
    var width = dist(left, right) * 2.1, height = width * 0.38;
    var angle = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(mid.x, mid.y); ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(20,20,20,0.92)';
    ctx.lineWidth = Math.max(3, width * 0.04);
    ctx.fillStyle = 'rgba(80,140,255,0.28)';
    ctx.beginPath(); ctx.ellipse(-width * 0.28, 0, width * 0.22, height * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(width * 0.28, 0, width * 0.22, height * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-width * 0.06, 0); ctx.lineTo(width * 0.06, 0); ctx.stroke();
    ctx.restore();
  }

  function drawHat(ctx, L, w, h) {
    var forehead = lm(L, 10, w, h), left = lm(L, 234, w, h), right = lm(L, 454, w, h);
    var width = dist(left, right) * 1.35, height = width * 0.55;
    var angle = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(forehead.x, forehead.y - height * 0.35); ctx.rotate(angle);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(0, height * 0.42, width * 0.58, height * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2d2d2d';
    ctx.beginPath(); ctx.ellipse(0, 0, width * 0.38, height * 0.42, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#c8f560';
    ctx.fillRect(-width * 0.38, height * 0.18, width * 0.76, height * 0.08);
    ctx.restore();
  }

  function drawEars(ctx, L, w, h) {
    var left = lm(L, 234, w, h), right = lm(L, 454, w, h), top = lm(L, 10, w, h);
    var earH = dist(left, right) * 0.55;
    function ear(x, y, flip) {
      ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -1 : 1, 1);
      ctx.fillStyle = '#ff8fab';
      ctx.beginPath(); ctx.moveTo(0, earH * 0.2);
      ctx.quadraticCurveTo(earH * 0.35, -earH * 0.9, earH * 0.55, earH * 0.15);
      ctx.quadraticCurveTo(earH * 0.25, earH * 0.05, 0, earH * 0.2); ctx.fill();
      ctx.fillStyle = '#ffc2d1';
      ctx.beginPath(); ctx.moveTo(earH * 0.08, earH * 0.12);
      ctx.quadraticCurveTo(earH * 0.28, -earH * 0.5, earH * 0.42, earH * 0.1); ctx.fill();
      ctx.restore();
    }
    ear(left.x - earH * 0.15, top.y - earH * 0.1, false);
    ear(right.x + earH * 0.15, top.y - earH * 0.1, true);
  }

  function drawMustache(ctx, L, w, h) {
    var upper = lm(L, 0, w, h), leftMouth = lm(L, 61, w, h), rightMouth = lm(L, 291, w, h), nose = lm(L, 2, w, h);
    var mid = { x: (leftMouth.x + rightMouth.x) / 2, y: (nose.y + upper.y) / 2 };
    var width = dist(leftMouth, rightMouth) * 1.15;
    var angle = Math.atan2(rightMouth.y - leftMouth.y, rightMouth.x - leftMouth.x);
    ctx.save(); ctx.translate(mid.x, mid.y); ctx.rotate(angle);
    ctx.fillStyle = '#2a1a12';
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-width * 0.15, -width * 0.08, -width * 0.45, -width * 0.02, -width * 0.5, width * 0.12);
    ctx.bezierCurveTo(-width * 0.25, width * 0.02, -width * 0.1, width * 0.04, 0, 0);
    ctx.bezierCurveTo(width * 0.1, width * 0.04, width * 0.25, width * 0.02, width * 0.5, width * 0.12);
    ctx.bezierCurveTo(width * 0.45, -width * 0.02, width * 0.15, -width * 0.08, 0, 0); ctx.fill();
    ctx.restore();
  }

  function drawDog(ctx, L, w, h) {
    drawEars(ctx, L, w, h);
    var nose = lm(L, 1, w, h), left = lm(L, 98, w, h), right = lm(L, 327, w, h);
    var r = dist(left, right) * 0.55;
    ctx.save();
    ctx.fillStyle = '#5c4033';
    ctx.beginPath(); ctx.ellipse(nose.x, nose.y + r * 0.15, r, r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(nose.x, nose.y, r * 0.35, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawEffect(ctx, landmarks, w, h) {
    var id = EFFECTS[effectIndex].id;
    if (id === 'none' || !landmarks || !landmarks.length) return;
    var L = landmarks[0];
    if (id === 'glasses') drawGlasses(ctx, L, w, h);
    else if (id === 'hat') drawHat(ctx, L, w, h);
    else if (id === 'ears') drawEars(ctx, L, w, h);
    else if (id === 'mustache') drawMustache(ctx, L, w, h);
    else if (id === 'dog') drawDog(ctx, L, w, h);
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
    ctx.clearRect(0, 0, w, h);

    // Só desenha efeitos no canvas (vídeo nativo fica por baixo → câmara imediata)
    var hasEffect = EFFECTS[effectIndex].id !== 'none';
    if (!hasEffect) return;

    frameCount++;
    try {
      if (faceLandmarker && videoEl.currentTime !== lastVideoTime && frameCount % detectEvery === 0) {
        lastVideoTime = videoEl.currentTime;
        var res = faceLandmarker.detectForVideo(videoEl, performance.now());
        if (res && res.faceLandmarks && res.faceLandmarks.length) {
          lastLandmarks = res.faceLandmarks;
        }
      }
    } catch (e) {}

    if (!lastLandmarks) return;

    ctx.save();
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    drawEffect(ctx, lastLandmarks, w, h);
    ctx.restore();
  }

  function enhanceFast(ctx, w, h) {
    try {
      var img = ctx.getImageData(0, 0, w, h);
      var d = img.data;
      var brightness = 10;
      var contrast = 1.1;
      var factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
      for (var i = 0; i < d.length; i += 4) {
        for (var c = 0; c < 3; c++) {
          var v = factor * (d[i + c] - 128) + 128 + brightness;
          d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
        }
      }
      ctx.putImageData(img, 0, 0);
    } catch (e) {}
  }

  function capturePhoto() {
    if (!videoEl || videoEl.readyState < 2) {
      setStatus('Aguarda a câmara…');
      return;
    }
    var w = videoEl.videoWidth || 640;
    var h = videoEl.videoHeight || 480;
    var out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    var ctx = out.getContext('2d');
    ctx.save();
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoEl, 0, 0, w, h);
    if (lastLandmarks) drawEffect(ctx, lastLandmarks, w, h);
    ctx.restore();
    enhanceFast(ctx, w, h);

    out.toBlob(
      function (blob) {
        if (!blob) {
          setStatus('Erro ao guardar');
          return;
        }
        var url = URL.createObjectURL(blob);
        try {
          window.createMediaData = {
            type: 'image',
            items: [{ type: 'image', url: url, name: 'face-fx.jpg', file: blob }]
          };
          var preview = document.getElementById('createPreview');
          if (preview) {
            preview.classList.add('has-media');
            preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) {
              n.remove();
            });
            var imgEl = document.createElement('img');
            imgEl.src = url;
            imgEl.alt = 'Foto com efeito';
            imgEl.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            preview.appendChild(imgEl);
          }
          var rm = document.getElementById('removeMediaBtn');
          if (rm) rm.style.display = '';
          if (typeof setThemeSectionVisible === 'function') setThemeSectionVisible(false);
        } catch (e2) {}
        if (typeof showToast === 'function') showToast('Foto capturada!');
        closeFaceEffects();
        if (typeof goTo === 'function') goTo('create');
      },
      'image/jpeg',
      0.9
    );
  }

  function openFaceEffects() {
    ensureUI();
    overlayEl.classList.add('open');
    overlayEl.setAttribute('aria-hidden', 'false');
    if (facingMode === 'environment') overlayEl.classList.add('fx-env');
    else overlayEl.classList.remove('fx-env');
    document.body.style.overflow = 'hidden';

    // Câmara já — não espera pelo modelo
    startCamera();
    running = true;
    lastVideoTime = -1;
    frameCount = 0;
    lastLandmarks = null;
    loop();

    // Modelo em paralelo
    if (!faceLandmarker) setStatus('Câmara a abrir · a carregar efeitos…');
    ensureLandmarker()
      .then(function () {
        if (running) setStatus('');
      })
      .catch(function () {
        if (running) setStatus('Efeitos offline — podes tirar foto sem filtro facial.');
      });
  }

  function closeFaceEffects() {
    stopLoop();
    stopStreamOnly();
    if (overlayEl) {
      overlayEl.classList.remove('open');
      overlayEl.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  window.openFaceEffects = openFaceEffects;
  window.closeFaceEffects = closeFaceEffects;
  window.tchiloPreloadFaceFx = preloadModel;

  function injectCreateButton() {
    if (document.getElementById('faceFxOpenBtn')) return;
    var gallery = document.getElementById('galleryBtn');
    if (!gallery || !gallery.parentNode) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'faceFxOpenBtn';
    btn.className = 'gallery-btn';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-2h6l2 2h3v12H4V8z"/><circle cx="12" cy="13" r="4"/></svg> <span>Câmara com efeitos</span>';
    btn.onclick = function () {
      openFaceEffects();
    };
    // Pré-carga ao tocar no ecrã create (hover/focus)
    btn.addEventListener('pointerdown', preloadModel, { once: true });
    gallery.parentNode.insertBefore(btn, gallery.nextSibling);
  }

  function boot() {
    injectCreateButton();
    // Pré-carga em idle (depois de 2s no app)
    var schedule = window.requestIdleCallback || function (cb) {
      setTimeout(cb, 2000);
    };
    schedule(function () {
      setTimeout(preloadModel, 1500);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(injectCreateButton, 800);
})();
