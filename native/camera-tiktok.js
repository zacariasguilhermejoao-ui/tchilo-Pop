/**
 * tchilo-Pop — Câmara unificada
 * Lista de efeitos = só os PNG que carregaste (TchiloFxPngAssets)
 * Sem botão "Abrir galeria" no criar post
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

  var FX_META = [
    { id: 'png_none', label: 'Normal', file: null },
    { id: 'png_thug', label: 'Thug Life', file: 'oculos_pixel_thug_life.png', anchor: 'eyes', scale: 2.4, oy: 0 },
    { id: 'png_estrela', label: 'Óculos estrela', file: 'oculos_estrela_rosa.png', anchor: 'eyes', scale: 2.2, oy: 0 },
    { id: 'png_nerd', label: 'Nerd laço', file: 'oculos_nerd_laco_rosa.png', anchor: 'eyes', scale: 2.3, oy: -0.05 },
    { id: 'png_prata', label: 'Óculos prata', file: 'oculos_prata_esportivo.png', anchor: 'eyes', scale: 2.3, oy: 0 },
    { id: 'png_gato', label: 'Gato', file: 'orelha_gato_laco_bigodes.png', anchor: 'face', scale: 1.8, oy: -0.15 },
    { id: 'png_coroa', label: 'Coroa', file: 'coroa_dourada.png', anchor: 'forehead', scale: 1.5, oy: -0.55 },
    { id: 'png_chifres', label: 'Chifres', file: 'chifres_demonio.png', anchor: 'forehead', scale: 1.4, oy: -0.7 },
    { id: 'png_bone', label: 'Boné', file: 'bone_rosa_dodgers.png', anchor: 'forehead', scale: 1.6, oy: -0.45 },
    { id: 'png_bob', label: 'Bob', file: 'peruca_bob_franja.png', anchor: 'forehead', scale: 2.0, oy: -0.35 },
    { id: 'png_afro', label: 'Afro', file: 'cabelo_afro.png', anchor: 'forehead', scale: 2.2, oy: -0.4 },
    { id: 'png_dreads', label: 'Dreads', file: 'dreadlocks_bicolor.png', anchor: 'forehead', scale: 2.1, oy: -0.25 },
    { id: 'png_topo', label: 'Topo', file: 'cabelo_topo_liso.png', anchor: 'forehead', scale: 1.8, oy: -0.5 },
    { id: 'png_beijo', label: 'Beijo', file: 'labios_beijo_rosa.png', anchor: 'mouth', scale: 0.9, oy: 0.05 },
    { id: 'png_gloss', label: 'Gloss', file: 'labios_gloss_vermelho.png', anchor: 'mouth', scale: 0.85, oy: 0.05 },
    { id: 'png_dentes', label: 'Dentes', file: 'mascara_boca_dentes.png', anchor: 'mouth', scale: 1.1, oy: 0.1 },
    { id: 'png_spider', label: 'Spiderman', file: 'mascara_spiderman.png', anchor: 'face', scale: 1.7, oy: -0.05 },
    { id: 'png_robo', label: 'Robô', file: 'cabeca_robo_metal.png', anchor: 'face', scale: 1.75, oy: -0.08 }
  ];

  var imgs = {};
  var fxIndex = 0;
  var landmarker = null;
  var lastLm = null;
  var lastDetect = 0;
  var loopOn = false;

  function assetSrc(file) {
    var A = window.TchiloFxPngAssets || {};
    return A[file] || null;
  }

  function loadImages() {
    FX_META.forEach(function (fx) {
      if (!fx.file || imgs[fx.file]) return;
      var src = assetSrc(fx.file);
      if (!src) return;
      var im = new Image();
      im.onload = function () {
        imgs[fx.file] = im;
      };
      im.src = src;
    });
  }

  function hideCreateGallery() {
    var st = document.getElementById('tchiloHideGalHard');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloHideGalHard';
      st.textContent =
        '#galleryBtn,#faceFxOpenBtn{display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;}' +
        '#screen-create .gallery-btn:not(#tchiloOpenCamBtn):not(.tchilo-keep):not(#removeMediaBtn){display:none!important;}';
      document.head.appendChild(st);
    }
    ['galleryBtn', 'faceFxOpenBtn'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.setAttribute('hidden', 'true');
      }
    });
  }

  function css() {
    return (
      '#tchiloCam{display:none;position:fixed;inset:0;z-index:9999;background:#000;flex-direction:column;font-family:system-ui,sans-serif;-webkit-user-select:none;user-select:none;}' +
      '#tchiloCam.open{display:flex!important;}' +
      '#tchiloCam .cam-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#111;}' +
      '#tchiloCam video,#tchiloCam canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}' +
      '#tchiloCam video{z-index:0;transform:scaleX(-1);}' +
      '#tchiloCam.cam-env video{transform:none;}' +
      '#tchiloCam canvas{z-index:1;pointer-events:none;}' +
      '#tchiloCam .cam-top{position:absolute;top:0;left:0;right:0;z-index:5;padding:calc(12px + env(safe-area-inset-top)) 14px 8px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);}' +
      '#tchiloCam .cam-iconbtn{width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font-size:22px;font-weight:800;cursor:pointer;}' +
      '#tchiloCam .cam-bottom{position:absolute;bottom:0;left:0;right:0;z-index:5;padding:8px 0 calc(20px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(0,0,0,.75),transparent);display:flex;flex-direction:column;align-items:center;gap:10px;}' +
      '#tchiloCam .fx-3d{width:100%;height:84px;overflow:hidden;}' +
      '#tchiloCam .fx-3d-track{display:flex;align-items:center;height:100%;gap:10px;padding:0 36%;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}' +
      '#tchiloCam .fx-3d-track::-webkit-scrollbar{display:none;}' +
      '#tchiloCam .fx-png-chip{flex:0 0 64px;width:64px;height:64px;border-radius:50%;scroll-snap-align:center;border:2.5px solid rgba(255,255,255,.4);background:rgba(0,0,0,.45);overflow:hidden;padding:0;cursor:pointer;opacity:.7;display:flex;align-items:center;justify-content:center;}' +
      '#tchiloCam .fx-png-chip.active{opacity:1;border-color:#c8f560;box-shadow:0 0 0 3px rgba(200,245,96,.4);transform:scale(1.1);}' +
      '#tchiloCam .fx-png-chip img{width:100%;height:100%;object-fit:cover;pointer-events:none;}' +
      '#tchiloCam .fx-png-chip.fx-none{font-size:11px;font-weight:800;color:#fff;}' +
      '#tchiloCam .cam-actions{display:flex;align-items:center;justify-content:center;gap:28px;width:100%;padding:0 24px;}' +
      '#tchiloCam .cam-shutter{width:76px;height:76px;border-radius:50%;border:5px solid #fff;background:#fff;cursor:pointer;position:relative;touch-action:none;}' +
      '#tchiloCam.recording .cam-shutter{background:#ff3b5c;border-color:#ff3b5c;}' +
      '#tchiloCam .cam-shutter::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff;}' +
      '#tchiloCam.recording .cam-shutter::after{inset:18px;border-radius:6px;}' +
      '#tchiloCam .cam-flip{width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.2);color:#fff;font-size:20px;cursor:pointer;}' +
      '#tchiloCam .cam-hint{color:rgba(255,255,255,.85);font-size:12px;font-weight:600;}' +
      '#tchiloCam .rec-dot{display:none;color:#ff3b5c;font-weight:800;font-size:13px;}' +
      '#tchiloCam.recording .rec-dot{display:block;}'
    );
  }

  function buildFxChips() {
    var track = document.getElementById('tchiloCamFxTrack');
    if (!track) return;
    loadImages();
    track.innerHTML = '';
    FX_META.forEach(function (fx, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-png-chip' + (i === fxIndex ? ' active' : '') + (!fx.file ? ' fx-none' : '');
      b.title = fx.label;
      b.setAttribute('data-label', fx.label);
      if (fx.file) {
        var src = assetSrc(fx.file);
        if (src) {
          var img = document.createElement('img');
          img.alt = fx.label;
          img.src = src;
          b.appendChild(img);
        } else {
          b.textContent = fx.label.slice(0, 5);
          b.classList.add('fx-none');
        }
      } else {
        b.textContent = 'Normal';
      }
      b.onclick = function () {
        fxIndex = i;
        window.__tchiloPngFxIndex = i;
        track.querySelectorAll('.fx-png-chip').forEach(function (c, j) {
          c.classList.toggle('active', j === i);
        });
      };
      track.appendChild(b);
    });
  }

  function ensureUI() {
    if (document.getElementById('tchiloCam')) {
      buildFxChips();
      return;
    }
    var root = document.createElement('div');
    root.id = 'tchiloCam';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<style>' +
      css() +
      '</style>' +
      '<div class="cam-stage">' +
      '<video id="tchiloCamVideo" playsinline muted autoplay></video>' +
      '<canvas id="tchiloCamCanvas"></canvas>' +
      '<div class="cam-top">' +
      '<button type="button" class="cam-iconbtn" id="tchiloCamClose">×</button>' +
      '<div class="rec-dot">● REC</div>' +
      '<button type="button" class="cam-iconbtn" id="tchiloCamFlipTop">↺</button>' +
      '</div>' +
      '<div class="cam-bottom">' +
      '<div class="cam-hint" id="tchiloCamHint">Toque foto · Mantém vídeo</div>' +
      '<div class="fx-3d"><div class="fx-3d-track" id="tchiloCamFxTrack"></div></div>' +
      '<div class="cam-actions">' +
      '<div style="width:48px"></div>' +
      '<button type="button" class="cam-shutter" id="tchiloCamShutter" aria-label="Capturar"></button>' +
      '<button type="button" class="cam-flip" id="tchiloCamFlip">↺</button>' +
      '</div></div></div>';
    document.body.appendChild(root);

    document.getElementById('tchiloCamClose').onclick = function (e) {
      e.preventDefault();
      closeCam();
    };
    document.getElementById('tchiloCamFlip').onclick = flipCam;
    document.getElementById('tchiloCamFlipTop').onclick = flipCam;
    bindShutter();
    buildFxChips();
  }

  function bindShutter() {
    var btn = document.getElementById('tchiloCamShutter');
    if (!btn || btn.__bound) return;
    btn.__bound = true;
    function down(e) {
      e.preventDefault();
      pressStart = Date.now();
      holdTimer = setTimeout(startVideoRecord, HOLD_MS);
    }
    function up(e) {
      e.preventDefault();
      clearTimeout(holdTimer);
      holdTimer = null;
      if (recording) stopVideoRecord();
      else if (Date.now() - pressStart < HOLD_MS + 80) takePhoto();
    }
    function cancel() {
      clearTimeout(holdTimer);
      holdTimer = null;
      if (recording) stopVideoRecord();
    }
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', cancel);
    btn.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
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
      console.warn('cam lm', e2);
    }
    return landmarker;
  }

  function lm(L, i, w, h) {
    var p = L[i];
    return { x: p.x * w, y: p.y * h };
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function drawFx(ctx, landmarks, w, h) {
    var fx = FX_META[fxIndex];
    if (!fx || !fx.file || !landmarks || !landmarks.length) return;
    var im = imgs[fx.file];
    if (!im || !im.complete || !im.naturalWidth) return;
    var L = landmarks[0];
    var left = lm(L, 33, w, h);
    var right = lm(L, 263, w, h);
    var faceW = dist(left, right) || 1;
    var midEyes = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
    var angle = Math.atan2(right.y - left.y, right.x - left.x);
    var top = lm(L, 10, w, h);
    var chin = lm(L, 152, w, h);
    var mouthL = lm(L, 61, w, h);
    var mouthR = lm(L, 291, w, h);
    var mouthMid = { x: (mouthL.x + mouthR.x) / 2, y: (mouthL.y + mouthR.y) / 2 };

    var cx = midEyes.x;
    var cy = midEyes.y;
    var targetW = faceW * (fx.scale || 2);
    if (fx.anchor === 'forehead') {
      cx = top.x;
      cy = top.y + faceW * (fx.oy || -0.5);
      targetW = faceW * (fx.scale || 1.6);
    } else if (fx.anchor === 'mouth') {
      cx = mouthMid.x;
      cy = mouthMid.y + faceW * (fx.oy || 0);
      targetW = dist(mouthL, mouthR) * (fx.scale || 1) * 2.2;
    } else if (fx.anchor === 'face') {
      cx = (top.x + chin.x) / 2;
      cy = (top.y + chin.y) / 2 + faceW * (fx.oy || 0);
      targetW = faceW * (fx.scale || 1.7);
    } else {
      cy = midEyes.y + faceW * (fx.oy || 0);
    }
    var targetH = targetW * (im.naturalHeight / im.naturalWidth);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(im, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  }

  function paintLoop() {
    if (!loopOn) return;
    requestAnimationFrame(paintLoop);
    var root = document.getElementById('tchiloCam');
    if (!root || !root.classList.contains('open')) return;
    var video = document.getElementById('tchiloCamVideo');
    var canvas = document.getElementById('tchiloCamCanvas');
    if (!video || !canvas || video.readyState < 2) return;

    var w = video.videoWidth || 640;
    var h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    if (fxIndex === 0) return;

    var now = performance.now();
    if (landmarker && now - lastDetect > 30) {
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
    loadImages();
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
    if (!video || video.readyState < 2) {
      setHint('Aguarda a câmara…');
      return;
    }
    var w = video.videoWidth || 720;
    var h = video.videoHeight || 1280;
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
    out.toBlob(
      function (blob) {
        if (!blob) return;
        var file;
        try {
          file = new File([blob], 'tchilo-cam.jpg', { type: 'image/jpeg', lastModified: Date.now() });
        } catch (e) {
          file = blob;
          file.name = 'tchilo-cam.jpg';
        }
        deliverMedia(file, URL.createObjectURL(blob), 'image');
      },
      'image/jpeg',
      0.92
    );
  }

  function startVideoRecord() {
    if (!stream || recording) return;
    recordedChunks = [];
    try {
      mediaRecorder = new MediaRecorder(stream);
    } catch (e) {
      setHint('Vídeo não suportado');
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
        file = new File([blob], 'tchilo-cam.webm', { type: blob.type, lastModified: Date.now() });
      } catch (e2) {
        file = blob;
        file.name = 'tchilo-cam.webm';
      }
      deliverMedia(file, URL.createObjectURL(blob), 'video');
    };
    mediaRecorder.start(200);
    recording = true;
    var root = document.getElementById('tchiloCam');
    if (root) root.classList.add('recording');
    setHint('A gravar… larga para parar');
  }

  function stopVideoRecord() {
    if (mediaRecorder && recording) {
      try {
        mediaRecorder.stop();
      } catch (e) {}
    }
  }

  function deliverMedia(file, url, mediaType) {
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
    hideCreateGallery();
    try {
      ensureUI();
      loadImages();
      buildFxChips();
      var root = document.getElementById('tchiloCam');
      if (!root) {
        alert('Erro ao criar a câmara.');
        return;
      }
      root.classList.add('open');
      root.setAttribute('aria-hidden', 'false');
      root.style.display = 'flex';
      root.style.zIndex = '9999';
      document.body.style.overflow = 'hidden';
      startCamera();
      loopOn = true;
      paintLoop();
      setTimeout(buildFxChips, 300);
      setTimeout(buildFxChips, 1000);
      setTimeout(buildFxChips, 2000);
      try {
        if (typeof window.__tchiloPngOnOpen === 'function') window.__tchiloPngOnOpen();
      } catch (e) {}
    } catch (e) {
      console.warn('openCam', e);
      alert('Não foi possível abrir a câmara.');
    }
  }

  function closeCam() {
    loopOn = false;
    stopStream();
    clearTimeout(holdTimer);
    var root = document.getElementById('tchiloCam');
    if (root) {
      root.classList.remove('open', 'recording');
      root.setAttribute('aria-hidden', 'true');
      root.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  function ensureCreateEntryBtn() {
    hideCreateGallery();
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
        'display:inline-flex!important;align-items:center;justify-content:center;gap:8px;' +
        'width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;' +
        'border:2px solid var(--ink,#0B0B0C);border-radius:16px;' +
        'background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);' +
        'font-weight:800;font-size:15px;cursor:pointer;box-sizing:border-box;position:relative;z-index:20;';
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

  function hookCreateScreen() {
    hideCreateGallery();
    ensureCreateEntryBtn();
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloCamOk) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        if (screen === 'create' || screen === 'screen-create') {
          setTimeout(function () {
            hideCreateGallery();
            ensureCreateEntryBtn();
          }, 40);
          setTimeout(hideCreateGallery, 200);
        }
        return r;
      };
      window.goTo.__tchiloCamOk = true;
    }
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloCloseCamera = closeCam;

  function boot() {
    hideCreateGallery();
    loadImages();
    ensureLm();
    ensureUI();
    hookCreateScreen();
    setTimeout(hookCreateScreen, 400);
    setTimeout(hookCreateScreen, 1200);
    setTimeout(function () {
      hideCreateGallery();
      loadImages();
      buildFxChips();
    }, 2000);
    try {
      new MutationObserver(function () {
        hideCreateGallery();
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
