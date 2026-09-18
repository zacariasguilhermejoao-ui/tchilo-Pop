/**
 * tchilo-Pop — Câmara + efeitos PNG nos sítios certos (MediaPipe)
 */
(function () {
  'use strict';

  var HOLD_MS = 280;
  var stream = null;
  var mediaRecorder = null;
  var recordedChunks = [];
  var recording = false;
  var holdTimer = null;
  var pressStart = 0;
  var facingMode = 'user';
  var fxIndex = 0;
  var imgs = {};
  var landmarker = null;
  var lastLm = null;
  var lastDetect = 0;
  var loopOn = false;

  var FX = [
    { id: 'none', label: 'Normal', file: null },
    { label: 'Thug Life', file: 'oculos_pixel_thug_life.png', anchor: 'eyes', scale: 2.55, oy: 0.02 },
    { label: 'Óculos estrela', file: 'oculos_estrela_rosa.png', anchor: 'eyes', scale: 2.45, oy: 0 },
    { label: 'Nerd laço', file: 'oculos_nerd_laco_rosa.png', anchor: 'eyes', scale: 2.5, oy: -0.02 },
    { label: 'Óculos prata', file: 'oculos_prata_esportivo.png', anchor: 'eyes', scale: 2.5, oy: 0 },
    { label: 'Gato', file: 'orelha_gato_laco_bigodes.png', anchor: 'face', scale: 1.95, oy: -0.08 },
    { label: 'Coroa', file: 'coroa_dourada.png', anchor: 'forehead', scale: 1.35, oy: -0.22 },
    { label: 'Chifres', file: 'chifres_demonio.png', anchor: 'forehead', scale: 1.45, oy: -0.35 },
    { label: 'Boné', file: 'bone_rosa_dodgers.png', anchor: 'forehead', scale: 1.55, oy: -0.18 },
    { label: 'Bob', file: 'peruca_bob_franja.png', anchor: 'hair', scale: 2.05, oy: -0.12 },
    { label: 'Afro', file: 'cabelo_afro.png', anchor: 'hair', scale: 2.25, oy: -0.15 },
    { label: 'Dreads', file: 'dreadlocks_bicolor.png', anchor: 'hair', scale: 2.15, oy: -0.08 },
    { label: 'Topo', file: 'cabelo_topo_liso.png', anchor: 'hair', scale: 1.9, oy: -0.2 },
    { label: 'Beijo', file: 'labios_beijo_rosa.png', anchor: 'mouth', scale: 1.35, oy: 0.02 },
    { label: 'Gloss', file: 'labios_gloss_vermelho.png', anchor: 'mouth', scale: 1.3, oy: 0.02 },
    { label: 'Dentes', file: 'mascara_boca_dentes.png', anchor: 'mouth', scale: 1.55, oy: 0.05 },
    { label: 'Spiderman', file: 'mascara_spiderman.png', anchor: 'face', scale: 1.85, oy: -0.02 },
    { label: 'Robô', file: 'cabeca_robo_metal.png', anchor: 'face', scale: 1.9, oy: -0.04 }
  ];

  function asset(file) {
    var A = window.TchiloFxPngAssets || {};
    return A[file] || null;
  }

  function loadImgs() {
    FX.forEach(function (fx) {
      if (!fx.file || imgs[fx.file]) return;
      var src = asset(fx.file);
      if (!src) return;
      var im = new Image();
      im.onload = function () {
        imgs[fx.file] = im;
      };
      im.src = src;
    });
  }

  function hideGal() {
    if (!document.getElementById('tchiloHideGal2')) {
      var st = document.createElement('style');
      st.id = 'tchiloHideGal2';
      st.textContent =
        '#galleryBtn,#faceFxOpenBtn{display:none!important;}' +
        '#screen-create .gallery-btn:not(#tchiloOpenCamBtn):not(.tchilo-keep):not(#removeMediaBtn){display:none!important;}';
      document.head.appendChild(st);
    }
  }

  function ensureUI() {
    if (document.getElementById('tchiloCam')) {
      buildChips();
      return;
    }
    var root = document.createElement('div');
    root.id = 'tchiloCam';
    root.innerHTML =
      '<style>' +
      '#tchiloCam{display:none;position:fixed;inset:0;z-index:9999;background:#000;flex-direction:column;font-family:system-ui,sans-serif;}' +
      '#tchiloCam.open{display:flex!important;}' +
      '#tchiloCam .stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#111;}' +
      '#tchiloCam video,#tchiloCam canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}' +
      '#tchiloCam video{transform:scaleX(-1);}' +
      '#tchiloCam.cam-env video{transform:none;}' +
      '#tchiloCam canvas{z-index:1;pointer-events:none;}' +
      '#tchiloCam .top{position:absolute;top:0;left:0;right:0;z-index:5;padding:calc(12px + env(safe-area-inset-top)) 14px 8px;display:flex;justify-content:space-between;}' +
      '#tchiloCam .icon{width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font-size:22px;font-weight:800;}' +
      '#tchiloCam .bot{position:absolute;bottom:0;left:0;right:0;z-index:5;padding:8px 0 calc(20px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(0,0,0,.75),transparent);display:flex;flex-direction:column;align-items:center;gap:10px;}' +
      '#tchiloCam .track{display:flex;align-items:center;gap:10px;width:100%;padding:0 36%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;height:80px;}' +
      '#tchiloCam .track::-webkit-scrollbar{display:none;}' +
      '#tchiloCam .chip{flex:0 0 64px;width:64px;height:64px;border-radius:50%;border:2.5px solid rgba(255,255,255,.4);background:rgba(0,0,0,.45);overflow:hidden;padding:0;scroll-snap-align:center;opacity:.7;}' +
      '#tchiloCam .chip.active{opacity:1;border-color:#c8f560;transform:scale(1.1);}' +
      '#tchiloCam .chip img{width:100%;height:100%;object-fit:cover;}' +
      '#tchiloCam .chip.none{font-size:11px;font-weight:800;color:#fff;}' +
      '#tchiloCam .acts{display:flex;align-items:center;justify-content:center;gap:28px;}' +
      '#tchiloCam .shut{width:76px;height:76px;border-radius:50%;border:5px solid #fff;background:#fff;position:relative;touch-action:none;}' +
      '#tchiloCam.recording .shut{background:#ff3b5c;border-color:#ff3b5c;}' +
      '#tchiloCam .shut::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff;}' +
      '#tchiloCam.recording .shut::after{inset:18px;border-radius:6px;}' +
      '#tchiloCam .flip{width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.2);color:#fff;font-size:20px;}' +
      '#tchiloCam .hint{color:rgba(255,255,255,.85);font-size:12px;font-weight:600;}' +
      '</style>' +
      '<div class="stage">' +
      '<video id="tchiloCamVideo" playsinline muted autoplay></video>' +
      '<canvas id="tchiloCamCanvas"></canvas>' +
      '<div class="top"><button type="button" class="icon" id="tchiloCamClose">×</button>' +
      '<button type="button" class="icon" id="tchiloCamFlipTop">↺</button></div>' +
      '<div class="bot"><div class="hint" id="tchiloCamHint">Toque foto · Mantém vídeo</div>' +
      '<div class="track" id="tchiloCamFxTrack"></div>' +
      '<div class="acts"><div style="width:48px"></div>' +
      '<button type="button" class="shut" id="tchiloCamShutter"></button>' +
      '<button type="button" class="flip" id="tchiloCamFlip">↺</button></div></div></div>';
    document.body.appendChild(root);
    document.getElementById('tchiloCamClose').onclick = function (e) {
      e.preventDefault();
      closeCam();
    };
    document.getElementById('tchiloCamFlip').onclick = flipCam;
    document.getElementById('tchiloCamFlipTop').onclick = flipCam;
    bindShutter();
    buildChips();
  }

  function buildChips() {
    var track = document.getElementById('tchiloCamFxTrack');
    if (!track) return;
    loadImgs();
    track.innerHTML = '';
    FX.forEach(function (fx, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (i === fxIndex ? ' active' : '') + (!fx.file ? ' none' : '');
      b.title = fx.label;
      if (fx.file) {
        var src = asset(fx.file);
        if (src) {
          var img = document.createElement('img');
          img.src = src;
          img.alt = fx.label;
          b.appendChild(img);
        } else b.textContent = fx.label.slice(0, 5);
      } else b.textContent = 'Normal';
      b.onclick = function () {
        fxIndex = i;
        window.__tchiloPngFxIndex = i;
        track.querySelectorAll('.chip').forEach(function (c, j) {
          c.classList.toggle('active', j === i);
        });
      };
      track.appendChild(b);
    });
  }

  function bindShutter() {
    var btn = document.getElementById('tchiloCamShutter');
    if (!btn || btn.__b) return;
    btn.__b = true;
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pressStart = Date.now();
      holdTimer = setTimeout(startRec, HOLD_MS);
    });
    btn.addEventListener('pointerup', function (e) {
      e.preventDefault();
      clearTimeout(holdTimer);
      if (recording) stopRec();
      else if (Date.now() - pressStart < HOLD_MS + 80) takePhoto();
    });
    btn.addEventListener('pointercancel', function () {
      clearTimeout(holdTimer);
      if (recording) stopRec();
    });
  }

  function pt(L, i, w, h) {
    var p = L[i];
    return { x: p.x * w, y: p.y * h };
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function drawFx(ctx, landmarks, w, h) {
    var fx = FX[fxIndex];
    if (!fx || !fx.file || !landmarks || !landmarks.length) return;
    var im = imgs[fx.file];
    if (!im || !im.complete || !im.naturalWidth) return;
    if (typeof window.__tchiloBetterDrawFx === 'function') {
      window.__tchiloBetterDrawFx(ctx, landmarks, w, h, fx, im);
      return;
    }
    var L = landmarks[0];
    var le = pt(L, 33, w, h),
      re = pt(L, 263, w, h),
      top = pt(L, 10, w, h),
      chin = pt(L, 152, w, h),
      cL = pt(L, 234, w, h),
      cR = pt(L, 454, w, h),
      mL = pt(L, 61, w, h),
      mR = pt(L, 291, w, h),
      lipU = pt(L, 13, w, h),
      lipD = pt(L, 14, w, h);
    var eyeW = dist(le, re) || 1;
    var faceW = dist(cL, cR) || eyeW * 2.1;
    var faceH = dist(top, chin) || faceW * 1.25;
    var angle = Math.atan2(re.y - le.y, re.x - le.x);
    var midE = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
    var mouth = { x: (mL.x + mR.x) / 2, y: (lipU.y + lipD.y) / 2 };
    var center = { x: (cL.x + cR.x) / 2, y: (top.y + chin.y) / 2 };
    var cx = midE.x,
      cy = midE.y,
      tw = eyeW * (fx.scale || 2.4);
    if (fx.anchor === 'eyes') {
      cx = midE.x;
      cy = midE.y + eyeW * (fx.oy || 0);
      tw = eyeW * (fx.scale || 2.4);
    } else if (fx.anchor === 'forehead') {
      cx = top.x;
      cy = top.y + faceH * (fx.oy || -0.2);
      tw = faceW * (fx.scale || 1.4);
    } else if (fx.anchor === 'hair') {
      cx = center.x;
      cy = top.y + faceH * (fx.oy || -0.12);
      tw = faceW * (fx.scale || 2);
    } else if (fx.anchor === 'mouth') {
      var mw = dist(mL, mR) || eyeW * 0.55;
      cx = mouth.x;
      cy = mouth.y + mw * (fx.oy || 0);
      tw = mw * (fx.scale || 1.4);
    } else {
      cx = center.x;
      cy = center.y + faceH * (fx.oy || 0);
      tw = faceW * (fx.scale || 1.85);
    }
    var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  async function ensureLm() {
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
    } catch (e2) {
      console.warn(e2);
    }
    return landmarker;
  }

  function paintLoop() {
    if (!loopOn) return;
    requestAnimationFrame(paintLoop);
    var root = document.getElementById('tchiloCam');
    if (!root || !root.classList.contains('open')) return;
    var video = document.getElementById('tchiloCamVideo');
    var canvas = document.getElementById('tchiloCamCanvas');
    if (!video || !canvas || video.readyState < 2) return;
    var w = video.videoWidth || 640,
      h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (fxIndex === 0) return;
    var now = performance.now();
    if (landmarker && now - lastDetect > 28) {
      lastDetect = now;
      try {
        var res = landmarker.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks.length) lastLm = res.faceLandmarks;
      } catch (e) {}
    }
    if (!lastLm) return;
    ctx.save();
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    drawFx(ctx, lastLm, w, h);
    ctx.restore();
  }

  async function startCamera() {
    stopStream();
    var video = document.getElementById('tchiloCamVideo');
    if (!video) return;
    setHint('A abrir câmara…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
    } catch (e1) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: facingMode } }
        });
      } catch (e2) {
        setHint('Permite a câmara nas definições');
        return;
      }
    }
    video.srcObject = stream;
    video.muted = true;
    video.setAttribute('playsinline', '');
    try {
      await video.play();
    } catch (e3) {}
    setHint('Toque foto · Mantém vídeo · Escolhe efeito');
    ensureLm();
    loadImgs();
  }

  function stopStream() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (e) {}
    }
    mediaRecorder = null;
    recording = false;
    if (stream) {
      stream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
      stream = null;
    }
    var root = document.getElementById('tchiloCam');
    if (root) root.classList.remove('recording');
  }

  function setHint(t) {
    var el = document.getElementById('tchiloCamHint');
    if (el) el.textContent = t || '';
  }

  function takePhoto() {
    var video = document.getElementById('tchiloCamVideo');
    var overlay = document.getElementById('tchiloCamCanvas');
    if (!video || video.readyState < 2) return;
    var w = video.videoWidth || 720,
      h = video.videoHeight || 1280;
    var out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    var ctx = out.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    if (overlay && overlay.width) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (facingMode === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(overlay, 0, 0, w, h);
    }
    out.toBlob(function (blob) {
      if (!blob) return;
      var file;
      try {
        file = new File([blob], 'tchilo-cam.jpg', { type: 'image/jpeg' });
      } catch (e) {
        file = blob;
        file.name = 'tchilo-cam.jpg';
      }
      deliver(file, URL.createObjectURL(blob), 'image');
    }, 'image/jpeg', 0.92);
  }

  function startRec() {
    if (!stream || recording) return;
    recordedChunks = [];
    try {
      mediaRecorder = new MediaRecorder(stream);
    } catch (e) {
      return;
    }
    mediaRecorder.ondataavailable = function (ev) {
      if (ev.data && ev.data.size) recordedChunks.push(ev.data);
    };
    mediaRecorder.onstop = function () {
      var blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/webm' });
      recording = false;
      var root = document.getElementById('tchiloCam');
      if (root) root.classList.remove('recording');
      if (!blob.size) return;
      var file;
      try {
        file = new File([blob], 'tchilo-cam.webm', { type: blob.type });
      } catch (e2) {
        file = blob;
        file.name = 'tchilo-cam.webm';
      }
      deliver(file, URL.createObjectURL(blob), 'video');
    };
    mediaRecorder.start(200);
    recording = true;
    var root = document.getElementById('tchiloCam');
    if (root) root.classList.add('recording');
    setHint('A gravar… larga para parar');
  }

  function stopRec() {
    if (mediaRecorder && recording) {
      try {
        mediaRecorder.stop();
      } catch (e) {}
    }
  }

  function deliver(file, url, mediaType) {
    closeCam();
    try {
      window.createMediaData = {
        type: mediaType,
        items: [{ type: mediaType, url: url, name: file.name, file: file }],
        files: [file]
      };
      window.createMediaFiles = [file];
    } catch (e) {}
    if (typeof window.tchiloDeliverFaceFxPhoto === 'function' && mediaType === 'image') {
      try {
        window.tchiloDeliverFaceFxPhoto(file, url);
        return;
      } catch (e2) {}
    }
    if (typeof window.tchiloOpenMediaEditor === 'function') {
      try {
        window.tchiloOpenMediaEditor({ mode: 'post', mediaType: mediaType, src: url, file: file });
        return;
      } catch (e3) {}
    }
    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e4) {}
  }

  function flipCam() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    var root = document.getElementById('tchiloCam');
    if (root) root.classList.toggle('cam-env', facingMode === 'environment');
    startCamera();
  }

  function openCam() {
    hideGal();
    ensureUI();
    loadImgs();
    buildChips();
    var root = document.getElementById('tchiloCam');
    if (!root) return;
    root.classList.add('open');
    root.style.display = 'flex';
    root.style.zIndex = '9999';
    document.body.style.overflow = 'hidden';
    startCamera();
    loopOn = true;
    paintLoop();
    setTimeout(buildChips, 400);
    setTimeout(buildChips, 1200);
  }

  function closeCam() {
    loopOn = false;
    stopStream();
    clearTimeout(holdTimer);
    var root = document.getElementById('tchiloCam');
    if (root) {
      root.classList.remove('open', 'recording');
      root.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  function ensureBtn() {
    hideGal();
    var screen = document.getElementById('screen-create');
    if (!screen) return;
    var btn = document.getElementById('tchiloOpenCamBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloOpenCamBtn';
      btn.className = 'gallery-btn tchilo-keep';
      btn.innerHTML = '<span>Foto ou vídeo</span>';
      btn.style.cssText =
        'display:inline-flex!important;align-items:center;justify-content:center;width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;border:2px solid var(--ink,#0B0B0C);border-radius:16px;background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);font-weight:800;font-size:15px;z-index:20;';
      var preview = document.getElementById('createPreview');
      if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
      else screen.insertBefore(btn, screen.firstChild);
    }
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCam();
    };
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloCloseCamera = closeCam;

  function boot() {
    hideGal();
    loadImgs();
    ensureLm();
    ensureUI();
    ensureBtn();
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloCamOk) {
      var orig = window.goTo;
      window.goTo = function (s) {
        var r = orig.apply(this, arguments);
        if (s === 'create' || s === 'screen-create') setTimeout(ensureBtn, 40);
        return r;
      };
      window.goTo.__tchiloCamOk = true;
    }
    setTimeout(ensureBtn, 500);
    setTimeout(function () {
      loadImgs();
      buildChips();
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
