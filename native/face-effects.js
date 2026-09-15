/**
 * tchilo-Pop — Câmara com efeitos + filtros
 * MediaPipe Face Landmarker (CDN) · acessórios · filtros de cor em tempo real
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
    { id: 'none', label: 'Nenhum' },
    { id: 'glasses', label: 'Óculos' },
    { id: 'sunglasses', label: 'Escuros' },
    { id: 'hat', label: 'Chapéu' },
    { id: 'crown', label: 'Coroa' },
    { id: 'ears', label: 'Orelhas' },
    { id: 'cat', label: 'Gato' },
    { id: 'dog', label: 'Cão' },
    { id: 'mustache', label: 'Bigode' },
    { id: 'hearts', label: 'Corações' },
    { id: 'freckles', label: 'Sardas' },
    { id: 'blush', label: 'Blush' },
    { id: 'flower', label: 'Flor' },
    { id: 'tears', label: 'Lágrimas' }
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

  function lm(L, idx, w, h) {
    var p = L[idx];
    return { x: p.x * w, y: p.y * h };
  }

  function dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* ---- Accessories ---- */
  function drawGlasses(ctx, L, w, h, dark) {
    var left = lm(L, 33, w, h), right = lm(L, 263, w, h);
    var mid = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
    var width = dist(left, right) * 2.1, height = width * 0.38;
    var angle = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(mid.x, mid.y); ctx.rotate(angle);
    ctx.strokeStyle = dark ? '#111' : 'rgba(20,20,20,0.92)';
    ctx.lineWidth = Math.max(3, width * 0.04);
    ctx.fillStyle = dark ? 'rgba(10,10,10,0.72)' : 'rgba(80,140,255,0.28)';
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

  function drawCrown(ctx, L, w, h) {
    var top = lm(L, 10, w, h), left = lm(L, 234, w, h), right = lm(L, 454, w, h);
    var width = dist(left, right) * 1.15;
    var height = width * 0.45;
    var angle = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(top.x, top.y - height * 0.55); ctx.rotate(angle);
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(-width * 0.5, height * 0.35);
    ctx.lineTo(-width * 0.45, 0);
    ctx.lineTo(-width * 0.25, height * 0.28);
    ctx.lineTo(0, -height * 0.15);
    ctx.lineTo(width * 0.25, height * 0.28);
    ctx.lineTo(width * 0.45, 0);
    ctx.lineTo(width * 0.5, height * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ff6b8a';
    [[0, -height * 0.05], [-width * 0.32, height * 0.12], [width * 0.32, height * 0.12]].forEach(function (p) {
      ctx.beginPath(); ctx.arc(p[0], p[1], width * 0.05, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }

  function drawEars(ctx, L, w, h, colorOuter, colorInner) {
    var left = lm(L, 234, w, h), right = lm(L, 454, w, h), top = lm(L, 10, w, h);
    var earH = dist(left, right) * 0.55;
    colorOuter = colorOuter || '#ff8fab';
    colorInner = colorInner || '#ffc2d1';
    function ear(x, y, flip) {
      ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -1 : 1, 1);
      ctx.fillStyle = colorOuter;
      ctx.beginPath(); ctx.moveTo(0, earH * 0.2);
      ctx.quadraticCurveTo(earH * 0.35, -earH * 0.9, earH * 0.55, earH * 0.15);
      ctx.quadraticCurveTo(earH * 0.25, earH * 0.05, 0, earH * 0.2); ctx.fill();
      ctx.fillStyle = colorInner;
      ctx.beginPath(); ctx.moveTo(earH * 0.08, earH * 0.12);
      ctx.quadraticCurveTo(earH * 0.28, -earH * 0.5, earH * 0.42, earH * 0.1); ctx.fill();
      ctx.restore();
    }
    ear(left.x - earH * 0.15, top.y - earH * 0.1, false);
    ear(right.x + earH * 0.15, top.y - earH * 0.1, true);
  }

  function drawCat(ctx, L, w, h) {
    drawEars(ctx, L, w, h, '#ff9f43', '#ffe0b2');
    var nose = lm(L, 1, w, h);
    var r = dist(lm(L, 98, w, h), lm(L, 327, w, h)) * 0.35;
    ctx.save();
    ctx.fillStyle = '#ff6b8a';
    ctx.beginPath();
    ctx.moveTo(nose.x, nose.y - r * 0.2);
    ctx.lineTo(nose.x - r * 0.5, nose.y + r * 0.4);
    ctx.lineTo(nose.x + r * 0.5, nose.y + r * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(40,40,40,0.55)';
    ctx.lineWidth = 2;
    var cheekL = lm(L, 234, w, h), cheekR = lm(L, 454, w, h);
    [[cheekL.x + r, nose.y], [cheekR.x - r, nose.y]].forEach(function (o) {
      for (var i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(o[0], o[1] + i * r * 0.35);
        ctx.lineTo(o[0] + (o[0] < nose.x ? -r * 1.2 : r * 1.2), o[1] + i * r * 0.55);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  function drawDog(ctx, L, w, h) {
    drawEars(ctx, L, w, h, '#8d6e63', '#d7ccc8');
    var nose = lm(L, 1, w, h), left = lm(L, 98, w, h), right = lm(L, 327, w, h);
    var r = dist(left, right) * 0.55;
    ctx.save();
    ctx.fillStyle = '#5c4033';
    ctx.beginPath(); ctx.ellipse(nose.x, nose.y + r * 0.15, r, r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(nose.x, nose.y, r * 0.35, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
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

  function drawHearts(ctx, L, w, h) {
    var eyeL = lm(L, 33, w, h), eyeR = lm(L, 263, w, h);
    var s = dist(eyeL, eyeR) * 0.22;
    function heart(x, y, size) {
      ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size, -size * 0.4, -size * 0.5, -size, 0, -size * 0.55);
      ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.4, 0, size * 0.3);
      ctx.fill(); ctx.restore();
    }
    heart(eyeL.x, eyeL.y - s * 0.2, s);
    heart(eyeR.x, eyeR.y - s * 0.2, s);
  }

  function drawFreckles(ctx, L, w, h) {
    var nose = lm(L, 1, w, h);
    var scale = dist(lm(L, 234, w, h), lm(L, 454, w, h)) * 0.015;
    ctx.fillStyle = 'rgba(139,90,43,0.55)';
    var offsets = [[-18, 8], [-12, 14], [-6, 6], [6, 7], [12, 13], [18, 6], [-15, 20], [15, 19], [0, 16]];
    offsets.forEach(function (o) {
      ctx.beginPath();
      ctx.arc(nose.x + o[0] * scale * 4, nose.y + o[1] * scale * 4, scale * 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBlush(ctx, L, w, h) {
    var left = lm(L, 50, w, h), right = lm(L, 280, w, h);
    var r = dist(lm(L, 234, w, h), lm(L, 454, w, h)) * 0.12;
    ctx.save();
    ctx.fillStyle = 'rgba(255,120,140,0.35)';
    ctx.beginPath(); ctx.ellipse(left.x, left.y + r * 0.5, r * 1.4, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(right.x, right.y + r * 0.5, r * 1.4, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawFlower(ctx, L, w, h) {
    var top = lm(L, 10, w, h), left = lm(L, 234, w, h), right = lm(L, 454, w, h);
    var size = dist(left, right) * 0.18;
    var x = top.x + size * 1.8, y = top.y - size * 0.3;
    ctx.save(); ctx.translate(x, y);
    var colors = ['#ff6b8a', '#ffd166', '#9b5de5', '#00bbf9'];
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * size * 0.55, Math.sin(a) * size * 0.55, size * 0.4, size * 0.28, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffe66d';
    ctx.beginPath(); ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawTears(ctx, L, w, h) {
    var eyeL = lm(L, 33, w, h), eyeR = lm(L, 263, w, h);
    var s = dist(eyeL, eyeR) * 0.08;
    ctx.fillStyle = 'rgba(120,200,255,0.75)';
    function tear(x, y) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x - s, y + s * 2, x, y + s * 3.5);
      ctx.quadraticCurveTo(x + s, y + s * 2, x, y);
      ctx.fill();
    }
    tear(eyeL.x, eyeL.y + s * 2);
    tear(eyeR.x, eyeR.y + s * 2);
  }

  function drawEffect(ctx, landmarks, w, h) {
    var id = EFFECTS[effectIndex].id;
    if (id === 'none' || !landmarks || !landmarks.length) return;
    var L = landmarks[0];
    if (id === 'glasses') drawGlasses(ctx, L, w, h, false);
    else if (id === 'sunglasses') drawGlasses(ctx, L, w, h, true);
    else if (id === 'hat') drawHat(ctx, L, w, h);
    else if (id === 'crown') drawCrown(ctx, L, w, h);
    else if (id === 'ears') drawEars(ctx, L, w, h);
    else if (id === 'cat') drawCat(ctx, L, w, h);
    else if (id === 'dog') drawDog(ctx, L, w, h);
    else if (id === 'mustache') drawMustache(ctx, L, w, h);
    else if (id === 'hearts') drawHearts(ctx, L, w, h);
    else if (id === 'freckles') drawFreckles(ctx, L, w, h);
    else if (id === 'blush') drawBlush(ctx, L, w, h);
    else if (id === 'flower') drawFlower(ctx, L, w, h);
    else if (id === 'tears') drawTears(ctx, L, w, h);
  }

  /* ---- Color filters (CSS-like overlays on canvas, fast) ---- */
  function applyFilterOverlay(ctx, w, h) {
    var id = FILTERS[filterIndex].id;
    if (id === 'none') return;
    ctx.save();
    if (id === 'warm') {
      ctx.fillStyle = 'rgba(255,160,80,0.18)';
      ctx.fillRect(0, 0, w, h);
    } else if (id === 'cool') {
      ctx.fillStyle = 'rgba(80,140,255,0.18)';
      ctx.fillRect(0, 0, w, h);
    } else if (id === 'bw') {
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    } else if (id === 'vintage') {
      ctx.fillStyle = 'rgba(180,140,80,0.22)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(40,20,0,0.12)';
      ctx.fillRect(0, 0, w, h);
    } else if (id === 'vivid') {
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255,80,120,0.06)';
      ctx.fillRect(0, 0, w, h);
    } else if (id === 'soft') {
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(0, 0, w, h);
    } else if (id === 'noir') {
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    } else if (id === 'sunset') {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,120,80,0.2)');
      g.addColorStop(1, 'rgba(120,40,120,0.22)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    } else if (id === 'mint') {
      ctx.fillStyle = 'rgba(100,220,180,0.16)';
      ctx.fillRect(0, 0, w, h);
    }
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

    // Se só há filtro ou efeito, precisamos do frame no canvas
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
          // só efeito: canvas transparente por cima do vídeo nativo
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

      // Esconder vídeo nativo se filtro ativo (canvas mostra tudo)
      if (videoEl) videoEl.style.opacity = hasFilter ? '0' : '1';
    } else {
      ctx.clearRect(0, 0, w, h);
      if (videoEl) videoEl.style.opacity = '1';
    }
  }

  function enhanceFast(ctx, w, h) {
    try {
      var img = ctx.getImageData(0, 0, w, h);
      var d = img.data;
      var brightness = 10, contrast = 1.1;
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
    out.width = w; out.height = h;
    var ctx = out.getContext('2d');
    ctx.save();
    if (facingMode === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(videoEl, 0, 0, w, h);
    applyFilterOverlay(ctx, w, h);
    if (lastLandmarks) drawEffect(ctx, lastLandmarks, w, h);
    ctx.restore();
    enhanceFast(ctx, w, h);

    out.toBlob(function (blob) {
      if (!blob) { setStatus('Erro ao guardar'); return; }
      var url = URL.createObjectURL(blob);
      try {
        window.createMediaData = {
          type: 'image',
          items: [{ type: 'image', url: url, name: 'face-fx.jpg', file: blob }]
        };
        var preview = document.getElementById('createPreview');
        if (preview) {
          preview.classList.add('has-media');
          preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) { n.remove(); });
          var imgEl = document.createElement('img');
          imgEl.src = url; imgEl.alt = 'Foto com efeito';
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
    }, 'image/jpeg', 0.9);
  }

  function openFaceEffects() {
    ensureUI();
    overlayEl.classList.add('open');
    overlayEl.setAttribute('aria-hidden', 'false');
    if (facingMode === 'environment') overlayEl.classList.add('fx-env');
    else overlayEl.classList.remove('fx-env');
    document.body.style.overflow = 'hidden';
    startCamera();
    running = true;
    lastVideoTime = -1;
    frameCount = 0;
    lastLandmarks = null;
    loop();
    if (!faceLandmarker) setStatus('Câmara a abrir · a carregar efeitos…');
    ensureLandmarker()
      .then(function () { if (running) setStatus(''); })
      .catch(function () {
        if (running) setStatus('Efeitos offline — filtros de cor ainda funcionam.');
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
    btn.onclick = function () { openFaceEffects(); };
    btn.addEventListener('pointerdown', preloadModel, { once: true });
    gallery.parentNode.insertBefore(btn, gallery.nextSibling);
  }

  function boot() {
    injectCreateButton();
    var schedule = window.requestIdleCallback || function (cb) { setTimeout(cb, 2000); };
    schedule(function () { setTimeout(preloadModel, 1500); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(injectCreateButton, 800);
})();
