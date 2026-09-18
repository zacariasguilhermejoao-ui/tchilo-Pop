/**
 * tchilo-Pop — Câmara (Foto ou vídeo)
 * Toque = foto · Manter = vídeo · Galeria ao lado
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
  var effectIndex = 0;
  var filterIndex = 0;

  var EFFECTS = [
    { id: 'none', label: 'Normal' },
    { id: 'glasses', label: 'Óculos' },
    { id: 'sunglasses', label: 'Escuros' },
    { id: 'hat', label: 'Chapéu' },
    { id: 'crown', label: 'Coroa' },
    { id: 'cat', label: 'Gato' },
    { id: 'dog', label: 'Cão' },
    { id: 'mustache', label: 'Bigode' },
    { id: 'hearts', label: 'Corações' },
    { id: 'blush', label: 'Blush' },
    { id: 'flower', label: 'Flor' }
  ];

  var FILTERS = [
    { id: 'none', label: 'Original' },
    { id: 'warm', label: 'Quente' },
    { id: 'cool', label: 'Frio' },
    { id: 'bw', label: 'P&B' },
    { id: 'vivid', label: 'Vivo' },
    { id: 'soft', label: 'Suave' },
    { id: 'vintage', label: 'Filme' }
  ];

  function css() {
    return (
      '#tchiloCam{display:none;position:fixed;inset:0;z-index:400;background:#000;flex-direction:column;font-family:system-ui,sans-serif;-webkit-user-select:none;user-select:none;}' +
      '#tchiloCam.open{display:flex!important;}' +
      '#tchiloCam .cam-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#111;}' +
      '#tchiloCam video,#tchiloCam canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}' +
      '#tchiloCam video{z-index:0;transform:scaleX(-1);}' +
      '#tchiloCam.cam-env video{transform:none;}' +
      '#tchiloCam canvas{z-index:1;pointer-events:none;}' +
      '#tchiloCam .cam-top{position:absolute;top:0;left:0;right:0;z-index:5;padding:calc(12px + env(safe-area-inset-top)) 14px 8px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);}' +
      '#tchiloCam .cam-iconbtn{width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font-size:22px;font-weight:800;cursor:pointer;}' +
      '#tchiloCam .cam-bottom{position:absolute;bottom:0;left:0;right:0;z-index:5;padding:8px 0 calc(20px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(0,0,0,.75),transparent);display:flex;flex-direction:column;align-items:center;gap:10px;}' +
      '#tchiloCam .fx-3d{width:100%;height:80px;overflow:hidden;}' +
      '#tchiloCam .fx-3d-track{display:flex;align-items:center;height:100%;gap:10px;padding:0 40%;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}' +
      '#tchiloCam .fx-3d-track::-webkit-scrollbar{display:none;}' +
      '#tchiloCam .fx-3d-item{flex:0 0 60px;height:60px;border-radius:50%;scroll-snap-align:center;border:2.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:.6;}' +
      '#tchiloCam .fx-3d-item.active{opacity:1;border-color:#c8f560;background:rgba(200,245,96,.25);transform:scale(1.08);}' +
      '#tchiloCam .fx-filters-row{display:flex;gap:6px;overflow-x:auto;width:100%;padding:0 14px;scrollbar-width:none;}' +
      '#tchiloCam .fx-fchip{flex:0 0 auto;border:0;border-radius:999px;padding:6px 12px;background:rgba(255,255,255,.14);color:#fff;font-weight:700;font-size:12px;cursor:pointer;}' +
      '#tchiloCam .fx-fchip.on{background:#c8f560;color:#111;}' +
      '#tchiloCam .cam-actions{display:flex;align-items:center;justify-content:center;gap:28px;width:100%;padding:0 24px;}' +
      '#tchiloCam .cam-gallery{width:48px;height:48px;border-radius:12px;border:2px solid #fff;background:#333;color:#fff;font-size:18px;cursor:pointer;}' +
      '#tchiloCam .cam-shutter{width:76px;height:76px;border-radius:50%;border:5px solid #fff;background:#fff;cursor:pointer;position:relative;touch-action:none;}' +
      '#tchiloCam.recording .cam-shutter{background:#ff3b5c;border-color:#ff3b5c;}' +
      '#tchiloCam .cam-shutter::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff;}' +
      '#tchiloCam.recording .cam-shutter::after{inset:18px;border-radius:6px;}' +
      '#tchiloCam .cam-flip{width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.2);color:#fff;font-size:20px;cursor:pointer;}' +
      '#tchiloCam .cam-hint{color:rgba(255,255,255,.8);font-size:12px;font-weight:600;}' +
      '#tchiloCam .rec-dot{display:none;color:#ff3b5c;font-weight:800;font-size:13px;}' +
      '#tchiloCam.recording .rec-dot{display:block;}' +
      '#faceFxOpenBtn{display:none!important;}'
    );
  }

  function ensureUI() {
    if (document.getElementById('tchiloCam')) return;
    var root = document.createElement('div');
    root.id = 'tchiloCam';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<style>' + css() + '</style>' +
      '<div class="cam-stage">' +
      '<video id="tchiloCamVideo" playsinline muted autoplay></video>' +
      '<canvas id="tchiloCamCanvas"></canvas>' +
      '<div class="cam-top">' +
      '<button type="button" class="cam-iconbtn" id="tchiloCamClose">×</button>' +
      '<div class="rec-dot" id="tchiloCamRecTime">0:00</div>' +
      '<button type="button" class="cam-iconbtn" id="tchiloCamFlipTop">↺</button>' +
      '</div>' +
      '<div class="cam-bottom">' +
      '<div class="cam-hint" id="tchiloCamHint">Toque foto · Mantém vídeo</div>' +
      '<div class="fx-3d"><div class="fx-3d-track" id="tchiloCamFxTrack"></div></div>' +
      '<div class="fx-filters-row" id="tchiloCamFilters"></div>' +
      '<div class="cam-actions">' +
      '<button type="button" class="cam-gallery" id="tchiloCamGalBtn">▦</button>' +
      '<button type="button" class="cam-shutter" id="tchiloCamShutter" aria-label="Capturar"></button>' +
      '<button type="button" class="cam-flip" id="tchiloCamFlip">↺</button>' +
      '</div></div></div>' +
      '<input type="file" id="tchiloCamFile" accept="image/*,video/*" multiple style="display:none">';
    document.body.appendChild(root);

    EFFECTS.forEach(function (ef, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-3d-item' + (i === 0 ? ' active' : '');
      b.textContent = ef.label;
      b.onclick = function () {
        effectIndex = i;
        document.querySelectorAll('#tchiloCamFxTrack .fx-3d-item').forEach(function (c, j) {
          c.classList.toggle('active', j === i);
        });
      };
      document.getElementById('tchiloCamFxTrack').appendChild(b);
    });

    FILTERS.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-fchip' + (i === 0 ? ' on' : '');
      b.textContent = f.label;
      b.onclick = function () {
        filterIndex = i;
        document.querySelectorAll('#tchiloCamFilters .fx-fchip').forEach(function (c, j) {
          c.classList.toggle('on', j === i);
        });
      };
      document.getElementById('tchiloCamFilters').appendChild(b);
    });

    document.getElementById('tchiloCamClose').onclick = function (e) {
      e.preventDefault();
      closeCam();
    };
    document.getElementById('tchiloCamFlip').onclick = flipCam;
    document.getElementById('tchiloCamFlipTop').onclick = flipCam;
    document.getElementById('tchiloCamGalBtn').onclick = function () {
      document.getElementById('tchiloCamFile').click();
    };
    document.getElementById('tchiloCamFile').onchange = onGalleryFiles;
    bindShutter();
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

  function onGalleryFiles(ev) {
    var files = ev.target.files;
    if (!files || !files[0]) return;
    var file = files[0];
    var isVideo = (file.type || '').indexOf('video') === 0;
    deliverMedia(file, URL.createObjectURL(file), isVideo ? 'video' : 'image');
    ev.target.value = '';
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
        setHint('Sem acesso à câmara. Permite nas definições.');
        return;
      }
    }
    video.srcObject = stream;
    video.muted = true;
    video.setAttribute('playsinline', '');
    try {
      await video.play();
    } catch (e3) {}
    setHint('Toque foto · Mantém vídeo');
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
    try {
      ensureUI();
      var root = document.getElementById('tchiloCam');
      if (!root) {
        alert('Erro ao criar a câmara.');
        return;
      }
      root.classList.add('open');
      root.setAttribute('aria-hidden', 'false');
      root.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      startCamera();
    } catch (e) {
      console.warn('openCam', e);
      alert('Não foi possível abrir a câmara.');
    }
  }

  function closeCam() {
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
        'display:inline-flex;align-items:center;justify-content:center;gap:8px;' +
        'width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;' +
        'border:2px solid var(--ink,#0B0B0C);border-radius:16px;' +
        'background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);' +
        'font-weight:800;font-size:15px;cursor:pointer;box-sizing:border-box;position:relative;z-index:5;';
      var preview = document.getElementById('createPreview');
      if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
      else screen.insertBefore(btn, screen.firstChild);
    }
    // rebind sempre
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCam();
    };
  }

  function hookCreateScreen() {
    ensureCreateEntryBtn();
    var fx = document.getElementById('faceFxOpenBtn');
    if (fx) fx.style.display = 'none';

    if (typeof window.goTo === 'function' && !window.goTo.__tchiloCamOk) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        if (screen === 'create' || screen === 'screen-create') {
          setTimeout(ensureCreateEntryBtn, 40);
          setTimeout(ensureCreateEntryBtn, 200);
        }
        return r;
      };
      window.goTo.__tchiloCamOk = true;
    }
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloCloseCamera = closeCam;

  function boot() {
    ensureUI();
    hookCreateScreen();
    setTimeout(hookCreateScreen, 400);
    setTimeout(hookCreateScreen, 1200);
    setTimeout(hookCreateScreen, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
