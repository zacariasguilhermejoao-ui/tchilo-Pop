/**
 * tchilo-Pop — Câmara única (estilo TikTok / WhatsApp)
 * - Ao criar post: abre logo a câmara (sem 2 botões)
 * - Toque no obturador = foto · Manter = grava vídeo até largar
 * - Efeitos em carrossel 3D
 * - Miniatura da galeria + arrastar para cima
 */
(function () {
  'use strict';

  var HOLD_MS = 280;
  var MAX_VIDEO_MS = 60000;
  var stream = null;
  var mediaRecorder = null;
  var recordedChunks = [];
  var recording = false;
  var holdTimer = null;
  var pressStart = 0;
  var facingMode = 'user';
  var effectIndex = 0;
  var filterIndex = 0;
  var galleryOpen = false;
  var touchStartY = 0;

  var EFFECTS = [
    { id: 'none', label: 'Normal', emoji: '' },
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
      '#tchiloCam{' +
      'display:none;position:fixed;inset:0;z-index:320;background:#000;flex-direction:column;' +
      'font-family:Inter,system-ui,sans-serif;-webkit-user-select:none;user-select:none;}' +
      '#tchiloCam.open{display:flex;}' +
      '#tchiloCam .cam-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#111;}' +
      '#tchiloCam video,#tchiloCam canvas.fx-layer{' +
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}' +
      '#tchiloCam video{z-index:0;transform:scaleX(-1);}' +
      '#tchiloCam.cam-env video{transform:none;}' +
      '#tchiloCam canvas.fx-layer{z-index:1;pointer-events:none;}' +
      '#tchiloCam .cam-top{' +
      'position:absolute;top:0;left:0;right:0;z-index:5;' +
      'padding:calc(10px + env(safe-area-inset-top)) 14px 8px;' +
      'display:flex;align-items:center;justify-content:space-between;' +
      'background:linear-gradient(180deg,rgba(0,0,0,.5),transparent);}' +
      '#tchiloCam .cam-iconbtn{' +
      'width:42px;height:42px;border:0;border-radius:50%;' +
      'background:rgba(255,255,255,.18);color:#fff;font-size:20px;font-weight:800;cursor:pointer;}' +
      '#tchiloCam .cam-bottom{' +
      'position:absolute;bottom:0;left:0;right:0;z-index:5;' +
      'padding:8px 0 calc(18px + env(safe-area-inset-bottom));' +
      'background:linear-gradient(0deg,rgba(0,0,0,.75),transparent);' +
      'display:flex;flex-direction:column;align-items:center;gap:10px;}' +
      /* carrossel 3D de efeitos */
      '#tchiloCam .fx-3d{' +
      'width:100%;height:88px;perspective:900px;overflow:hidden;position:relative;}' +
      '#tchiloCam .fx-3d-track{' +
      'display:flex;align-items:center;height:100%;gap:10px;' +
      'padding:0 42%;overflow-x:auto;scroll-snap-type:x mandatory;' +
      '-webkit-overflow-scrolling:touch;scrollbar-width:none;}' +
      '#tchiloCam .fx-3d-track::-webkit-scrollbar{display:none;}' +
      '#tchiloCam .fx-3d-item{' +
      'flex:0 0 64px;height:64px;border-radius:50%;scroll-snap-align:center;' +
      'border:2.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);' +
      'color:#fff;font-weight:800;font-size:11px;display:flex;align-items:center;' +
      'justify-content:center;text-align:center;padding:4px;cursor:pointer;' +
      'transition:transform .25s ease,border-color .2s,box-shadow .25s;' +
      'transform:scale(.78) rotateY(28deg);opacity:.55;}' +
      '#tchiloCam .fx-3d-item.active{' +
      'transform:scale(1.08) rotateY(0);opacity:1;' +
      'border-color:#c8f560;box-shadow:0 0 0 3px rgba(200,245,96,.35),0 8px 24px rgba(0,0,0,.4);' +
      'background:rgba(200,245,96,.22);}' +
      '#tchiloCam .fx-filters-row{' +
      'display:flex;gap:6px;overflow-x:auto;width:100%;padding:0 14px;' +
      'scrollbar-width:none;-webkit-overflow-scrolling:touch;}' +
      '#tchiloCam .fx-filters-row::-webkit-scrollbar{display:none;}' +
      '#tchiloCam .fx-fchip{' +
      'flex:0 0 auto;border:0;border-radius:999px;padding:6px 12px;' +
      'background:rgba(255,255,255,.14);color:#fff;font-weight:700;font-size:12px;cursor:pointer;}' +
      '#tchiloCam .fx-fchip.on{background:#c8f560;color:#111;}' +
      /* barra de captura */
      '#tchiloCam .cam-actions{' +
      'display:flex;align-items:center;justify-content:center;gap:28px;width:100%;padding:0 24px;}' +
      '#tchiloCam .cam-gallery{' +
      'width:48px;height:48px;border-radius:12px;overflow:hidden;' +
      'border:2px solid #fff;background:#333;padding:0;cursor:pointer;position:relative;}' +
      '#tchiloCam .cam-gallery img{width:100%;height:100%;object-fit:cover;display:block;}' +
      '#tchiloCam .cam-gallery .ph{' +
      'width:100%;height:100%;display:flex;align-items:center;justify-content:center;' +
      'color:#fff;font-size:18px;background:#444;}' +
      '#tchiloCam .cam-shutter{' +
      'width:76px;height:76px;border-radius:50%;border:5px solid #fff;' +
      'background:#fff;cursor:pointer;position:relative;touch-action:none;' +
      'box-shadow:0 0 0 3px rgba(0,0,0,.25);transition:transform .12s,background .15s;}' +
      '#tchiloCam .cam-shutter:active,#tchiloCam.recording .cam-shutter{' +
      'transform:scale(.92);background:#ff3b5c;border-color:#ff3b5c;}' +
      '#tchiloCam .cam-shutter::after{' +
      'content:"";position:absolute;inset:6px;border-radius:50%;background:#fff;' +
      'transition:inset .15s,background .15s,border-radius .15s;}' +
      '#tchiloCam.recording .cam-shutter::after{' +
      'inset:18px;border-radius:6px;background:#fff;}' +
      '#tchiloCam .cam-flip{' +
      'width:48px;height:48px;border-radius:50%;border:0;' +
      'background:rgba(255,255,255,.2);color:#fff;font-size:20px;cursor:pointer;}' +
      '#tchiloCam .cam-hint{color:rgba(255,255,255,.75);font-size:12px;font-weight:600;}' +
      '#tchiloCam .rec-dot{' +
      'display:none;align-items:center;gap:6px;color:#ff3b5c;font-weight:800;font-size:13px;}' +
      '#tchiloCam.recording .rec-dot{display:flex;}' +
      '#tchiloCam .rec-dot i{width:8px;height:8px;border-radius:50%;background:#ff3b5c;animation:camPulse 1s infinite;}' +
      '@keyframes camPulse{0%,100%{opacity:1}50%{opacity:.35}}' +
      /* sheet galeria WhatsApp-like */
      '#tchiloCam .gal-sheet{' +
      'position:absolute;left:0;right:0;bottom:0;z-index:8;' +
      'height:0;max-height:70%;background:#1a1a1c;border-radius:18px 18px 0 0;' +
      'transition:height .28s cubic-bezier(.2,.8,.2,1);overflow:hidden;' +
      'display:flex;flex-direction:column;}' +
      '#tchiloCam .gal-sheet.open{height:55%;}' +
      '#tchiloCam .gal-handle{' +
      'width:40px;height:4px;border-radius:4px;background:rgba(255,255,255,.35);' +
      'margin:10px auto 6px;flex-shrink:0;}' +
      '#tchiloCam .gal-title{color:#fff;font-weight:800;font-size:14px;padding:0 14px 8px;}' +
      '#tchiloCam .gal-grid{' +
      'flex:1;overflow:auto;-webkit-overflow-scrolling:touch;' +
      'display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:0 2px 12px;}' +
      '#tchiloCam .gal-grid button{' +
      'aspect-ratio:1;border:0;padding:0;background:#2a2a2e;overflow:hidden;cursor:pointer;}' +
      '#tchiloCam .gal-grid img{width:100%;height:100%;object-fit:cover;display:block;}' +
      '#tchiloCam .gal-empty{color:rgba(255,255,255,.5);text-align:center;padding:24px;font-size:13px;grid-column:1/-1;}' +
      /* esconder botões antigos no create */
      '#faceFxOpenBtn,#galleryBtn.tchilo-hide-dual,button#galleryBtn.tchilo-hide-dual{' +
      'display:none!important;}' +
      '.create-media-actions .gallery-btn:not(.tchilo-keep){display:none!important;}'
    );
  }

  function ensureUI() {
    if (document.getElementById('tchiloCam')) return;
    var root = document.createElement('div');
    root.id = 'tchiloCam';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML =
      '<style>' +
      css() +
      '</style>' +
      '<div class="cam-stage">' +
      '<video id="tchiloCamVideo" playsinline muted autoplay></video>' +
      '<canvas class="fx-layer" id="tchiloCamCanvas"></canvas>' +
      '<div class="cam-top">' +
      '<button type="button" class="cam-iconbtn" id="tchiloCamClose" aria-label="Fechar">×</button>' +
      '<div class="rec-dot"><i></i><span id="tchiloCamRecTime">0:00</span></div>' +
      '<button type="button" class="cam-iconbtn" id="tchiloCamFlipTop" aria-label="Inverter">↺</button>' +
      '</div>' +
      '<div class="cam-bottom">' +
      '<div class="cam-hint" id="tchiloCamHint">Toque foto · Mantém vídeo</div>' +
      '<div class="fx-3d"><div class="fx-3d-track" id="tchiloCamFxTrack"></div></div>' +
      '<div class="fx-filters-row" id="tchiloCamFilters"></div>' +
      '<div class="cam-actions">' +
      '<button type="button" class="cam-gallery" id="tchiloCamGalBtn" aria-label="Galeria"><div class="ph">▦</div></button>' +
      '<button type="button" class="cam-shutter" id="tchiloCamShutter" aria-label="Capturar"></button>' +
      '<button type="button" class="cam-flip" id="tchiloCamFlip" aria-label="Inverter">↺</button>' +
      '</div></div>' +
      '<div class="gal-sheet" id="tchiloCamGalSheet">' +
      '<div class="gal-handle"></div>' +
      '<div class="gal-title">Recentes</div>' +
      '<div class="gal-grid" id="tchiloCamGalGrid"><div class="gal-empty">Abre a galeria do telefone</div></div>' +
      '</div></div>' +
      '<input type="file" id="tchiloCamFile" accept="image/*,video/*" multiple style="display:none">';
    document.body.appendChild(root);

    EFFECTS.forEach(function (ef, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-3d-item' + (i === 0 ? ' active' : '');
      b.textContent = ef.label;
      b.dataset.i = String(i);
      b.onclick = function () {
        effectIndex = i;
        syncFxActive();
        centerFxItem(i);
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

    document.getElementById('tchiloCamClose').onclick = closeCam;
    document.getElementById('tchiloCamFlip').onclick = flipCam;
    document.getElementById('tchiloCamFlipTop').onclick = flipCam;
    document.getElementById('tchiloCamGalBtn').onclick = function () {
      openGalleryPicker();
    };
    document.getElementById('tchiloCamFile').onchange = onGalleryFiles;

    bindShutter();
    bindSwipeGallery();
    bindFxScroll();
  }

  function syncFxActive() {
    document.querySelectorAll('#tchiloCamFxTrack .fx-3d-item').forEach(function (c, i) {
      c.classList.toggle('active', i === effectIndex);
    });
  }

  function centerFxItem(i) {
    var track = document.getElementById('tchiloCamFxTrack');
    var item = track && track.children[i];
    if (!item) return;
    var left = item.offsetLeft - track.clientWidth / 2 + item.clientWidth / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }

  function bindFxScroll() {
    var track = document.getElementById('tchiloCamFxTrack');
    if (!track || track.__bound) return;
    track.__bound = true;
    var t = null;
    track.addEventListener(
      'scroll',
      function () {
        clearTimeout(t);
        t = setTimeout(function () {
          var mid = track.scrollLeft + track.clientWidth / 2;
          var best = 0;
          var bestDist = 1e9;
          Array.prototype.forEach.call(track.children, function (el, i) {
            var c = el.offsetLeft + el.clientWidth / 2;
            var d = Math.abs(c - mid);
            if (d < bestDist) {
              bestDist = d;
              best = i;
            }
          });
          effectIndex = best;
          syncFxActive();
        }, 80);
      },
      { passive: true }
    );
  }

  function bindShutter() {
    var btn = document.getElementById('tchiloCamShutter');
    if (!btn || btn.__bound) return;
    btn.__bound = true;

    function onDown(e) {
      e.preventDefault();
      pressStart = Date.now();
      holdTimer = setTimeout(function () {
        startVideoRecord();
      }, HOLD_MS);
    }
    function onUp(e) {
      e.preventDefault();
      clearTimeout(holdTimer);
      holdTimer = null;
      var held = Date.now() - pressStart;
      if (recording) {
        stopVideoRecord();
      } else if (held < HOLD_MS + 80) {
        takePhoto();
      }
    }
    function onCancel() {
      clearTimeout(holdTimer);
      holdTimer = null;
      if (recording) stopVideoRecord();
    }

    btn.addEventListener('pointerdown', onDown);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onCancel);
    btn.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') onCancel();
    });
    // evita menu de contexto no hold
    btn.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
  }

  function bindSwipeGallery() {
    var root = document.getElementById('tchiloCam');
    if (!root || root.__swipe) return;
    root.__swipe = true;
    root.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches[0]) return;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );
    root.addEventListener(
      'touchend',
      function (e) {
        if (!e.changedTouches[0]) return;
        var dy = touchStartY - e.changedTouches[0].clientY;
        // swipe up from bottom area
        if (dy > 70 && touchStartY > window.innerHeight * 0.55) {
          openGalSheet(true);
        } else if (dy < -70) {
          openGalSheet(false);
        }
      },
      { passive: true }
    );
  }

  function openGalSheet(open) {
    galleryOpen = !!open;
    var sheet = document.getElementById('tchiloCamGalSheet');
    if (sheet) sheet.classList.toggle('open', galleryOpen);
  }

  function openGalleryPicker() {
    var input = document.getElementById('tchiloCamFile');
    if (input) input.click();
  }

  function onGalleryFiles(ev) {
    var files = ev.target.files;
    if (!files || !files.length) return;
    var file = files[0];
    var isVideo = (file.type || '').indexOf('video') === 0;
    var url = URL.createObjectURL(file);
    deliverMedia(file, url, isVideo ? 'video' : 'image');
    ev.target.value = '';
  }

  async function startCamera() {
    stopStream();
    var video = document.getElementById('tchiloCamVideo');
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
    } catch (e1) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: facingMode } }
        });
      } catch (e2) {
        setHint('Sem acesso à câmara');
        return;
      }
    }
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    try {
      await video.play();
    } catch (e3) {}
    resizeCanvas();
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

  function resizeCanvas() {
    var video = document.getElementById('tchiloCamVideo');
    var canvas = document.getElementById('tchiloCamCanvas');
    if (!video || !canvas) return;
    var w = video.videoWidth || 720;
    var h = video.videoHeight || 1280;
    canvas.width = w;
    canvas.height = h;
  }

  function setHint(t) {
    var el = document.getElementById('tchiloCamHint');
    if (el) el.textContent = t || '';
  }

  function applyFilterCss(ctx, w, h) {
    var id = FILTERS[filterIndex].id;
    if (id === 'none') return;
    try {
      var img = ctx.getImageData(0, 0, w, h);
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        if (id === 'bw' || id === 'noir') {
          var y = 0.299 * r + 0.587 * g + 0.114 * b;
          d[i] = d[i + 1] = d[i + 2] = y;
        } else if (id === 'warm') {
          d[i] = Math.min(255, r * 1.08 + 8);
          d[i + 2] = Math.max(0, b * 0.92);
        } else if (id === 'cool') {
          d[i] = Math.max(0, r * 0.94);
          d[i + 2] = Math.min(255, b * 1.08);
        } else if (id === 'vivid') {
          d[i] = Math.min(255, r * 1.12);
          d[i + 1] = Math.min(255, g * 1.08);
          d[i + 2] = Math.min(255, b * 1.1);
        } else if (id === 'soft') {
          d[i] = Math.min(255, r * 0.95 + 12);
          d[i + 1] = Math.min(255, g * 0.95 + 12);
          d[i + 2] = Math.min(255, b * 0.95 + 12);
        } else if (id === 'vintage') {
          d[i] = Math.min(255, r * 1.05 + 10);
          d[i + 1] = Math.min(255, g * 0.98 + 5);
          d[i + 2] = Math.max(0, b * 0.88);
        }
      }
      ctx.putImageData(img, 0, 0);
    } catch (e) {}
  }

  function snapshotCanvas() {
    var video = document.getElementById('tchiloCamVideo');
    var canvas = document.getElementById('tchiloCamCanvas');
    if (!video || video.readyState < 2) return null;
    var w = video.videoWidth || 720;
    var h = video.videoHeight || 1280;
    var out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    var ctx = out.getContext('2d');
    ctx.save();
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();
    applyFilterCss(ctx, w, h);
    // efeitos simples desenhados (círculos decorativos se não none)
    if (EFFECTS[effectIndex].id !== 'none') {
      drawSimpleEffect(ctx, w, h, EFFECTS[effectIndex].id);
    }
    return out;
  }

  function drawSimpleEffect(ctx, w, h, id) {
    ctx.save();
    var cx = w / 2,
      cy = h * 0.38,
      s = Math.min(w, h) * 0.12;
    if (id === 'glasses' || id === 'sunglasses') {
      ctx.strokeStyle = id === 'sunglasses' ? '#111' : 'rgba(30,30,30,.9)';
      ctx.lineWidth = s * 0.12;
      ctx.fillStyle = id === 'sunglasses' ? 'rgba(0,0,0,.55)' : 'rgba(80,140,255,.25)';
      ctx.beginPath();
      ctx.ellipse(cx - s * 1.1, cy, s * 0.9, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + s * 1.1, cy, s * 0.9, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy);
      ctx.lineTo(cx + s * 0.2, cy);
      ctx.stroke();
    } else if (id === 'hearts') {
      ctx.fillStyle = '#ff4d6d';
      [[cx - s * 1.2, cy], [cx + s * 1.2, cy]].forEach(function (p) {
        ctx.beginPath();
        ctx.moveTo(p[0], p[1] + s * 0.3);
        ctx.bezierCurveTo(p[0] - s, p[1] - s * 0.4, p[0] - s * 0.5, p[1] - s, p[0], p[1] - s * 0.55);
        ctx.bezierCurveTo(p[0] + s * 0.5, p[1] - s, p[0] + s, p[1] - s * 0.4, p[0], p[1] + s * 0.3);
        ctx.fill();
      });
    } else if (id === 'hat' || id === 'crown') {
      ctx.fillStyle = id === 'crown' ? '#f5c542' : '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(cx, cy - s * 1.6, s * 2.2, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      if (id === 'hat') {
        ctx.fillStyle = '#2d2d2d';
        ctx.beginPath();
        ctx.ellipse(cx, cy - s * 2.2, s * 1.4, s * 1.1, 0, Math.PI, 0);
        ctx.fill();
      }
    } else if (id === 'blush') {
      ctx.fillStyle = 'rgba(255,120,140,.35)';
      ctx.beginPath();
      ctx.ellipse(cx - s * 1.8, cy + s * 0.8, s * 0.7, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + s * 1.8, cy + s * 0.8, s * 0.7, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'mustache') {
      ctx.fillStyle = '#2a1a12';
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 1.5, s * 1.4, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'cat' || id === 'dog' || id === 'flower') {
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - s * 2, cy - s * 2, s * 4, s * 4);
    }
    ctx.restore();
  }

  function takePhoto() {
    var out = snapshotCanvas();
    if (!out) {
      setHint('Aguarda a câmara…');
      return;
    }
    out.toBlob(
      function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var file;
        try {
          file = new File([blob], 'tchilo-cam.jpg', { type: 'image/jpeg', lastModified: Date.now() });
        } catch (e) {
          file = blob;
          file.name = 'tchilo-cam.jpg';
        }
        deliverMedia(file, url, 'image');
      },
      'image/jpeg',
      0.92
    );
  }

  var recStartedAt = 0;
  var recTimer = null;

  function startVideoRecord() {
    if (!stream || recording) return;
    recordedChunks = [];
    var mime = '';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) mime = 'video/webm;codecs=vp9,opus';
      else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) mime = 'video/webm;codecs=vp8,opus';
      else if (MediaRecorder.isTypeSupported('video/webm')) mime = 'video/webm';
      else if (MediaRecorder.isTypeSupported('video/mp4')) mime = 'video/mp4';
    } else {
      setHint('Vídeo não suportado neste dispositivo');
      return;
    }
    try {
      mediaRecorder = mime
        ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2500000 })
        : new MediaRecorder(stream);
    } catch (e) {
      try {
        mediaRecorder = new MediaRecorder(stream);
      } catch (e2) {
        setHint('Não foi possível gravar');
        return;
      }
    }
    mediaRecorder.ondataavailable = function (ev) {
      if (ev.data && ev.data.size) recordedChunks.push(ev.data);
    };
    mediaRecorder.onstop = function () {
      clearInterval(recTimer);
      var type = (mediaRecorder && mediaRecorder.mimeType) || 'video/webm';
      var blob = new Blob(recordedChunks, { type: type });
      recordedChunks = [];
      recording = false;
      var root = document.getElementById('tchiloCam');
      if (root) root.classList.remove('recording');
      if (!blob.size) {
        setHint('Gravação vazia');
        return;
      }
      var ext = type.indexOf('mp4') >= 0 ? 'mp4' : 'webm';
      var file;
      try {
        file = new File([blob], 'tchilo-cam.' + ext, { type: type, lastModified: Date.now() });
      } catch (e3) {
        file = blob;
        file.name = 'tchilo-cam.' + ext;
      }
      var url = URL.createObjectURL(blob);
      deliverMedia(file, url, 'video');
    };
    mediaRecorder.start(200);
    recording = true;
    recStartedAt = Date.now();
    var root = document.getElementById('tchiloCam');
    if (root) root.classList.add('recording');
    setHint('A gravar… larga para parar');
    recTimer = setInterval(function () {
      var sec = Math.floor((Date.now() - recStartedAt) / 1000);
      var el = document.getElementById('tchiloCamRecTime');
      if (el) {
        el.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
      }
      if (Date.now() - recStartedAt >= MAX_VIDEO_MS) stopVideoRecord();
    }, 250);
  }

  function stopVideoRecord() {
    if (!recording || !mediaRecorder) return;
    try {
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    } catch (e) {}
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

    try {
      if (typeof window.tchiloOpenMediaEditor === 'function') {
        window.tchiloOpenMediaEditor({
          mode: 'post',
          mediaType: mediaType,
          src: url,
          file: file
        });
        return;
      }
    } catch (e3) {}

    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e4) {}
    var preview = document.getElementById('createPreview');
    if (preview) {
      preview.classList.add('has-media');
      preview.innerHTML = '';
      if (mediaType === 'video') {
        var v = document.createElement('video');
        v.src = url;
        v.controls = true;
        v.playsInline = true;
        v.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        preview.appendChild(v);
      } else {
        var img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        preview.appendChild(img);
      }
    }
  }

  function flipCam() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    var root = document.getElementById('tchiloCam');
    if (root) root.classList.toggle('cam-env', facingMode === 'environment');
    startCamera();
  }

  function openCam() {
    ensureUI();
    hideDualButtons();
    var root = document.getElementById('tchiloCam');
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    openGalSheet(false);
    startCamera();
    // reutiliza face-effects landmarker se disponível
    try {
      if (typeof window.tchiloPreloadFaceFx === 'function') window.tchiloPreloadFaceFx();
    } catch (e) {}
  }

  function closeCam() {
    stopStream();
    clearTimeout(holdTimer);
    clearInterval(recTimer);
    var root = document.getElementById('tchiloCam');
    if (root) {
      root.classList.remove('open', 'recording');
      root.setAttribute('aria-hidden', 'true');
    }
    openGalSheet(false);
    document.body.style.overflow = '';
  }

  function hideDualButtons() {
    var fx = document.getElementById('faceFxOpenBtn');
    if (fx) fx.style.display = 'none';
    var gal = document.getElementById('galleryBtn');
    if (gal) {
      gal.classList.add('tchilo-hide-dual');
      gal.style.display = 'none';
    }
    document.querySelectorAll('#screen-create .gallery-btn, #screen-create button').forEach(function (b) {
      var t = (b.textContent || '').toLowerCase();
      if (t.indexOf('galeria') >= 0 || t.indexOf('câmara') >= 0 || t.indexOf('camera') >= 0 || t.indexOf('efeitos') >= 0) {
        if (b.id !== 'postMusicBtn' && b.id !== 'publishBtn' && b.id !== 'createPublishBtn') {
          b.style.display = 'none';
        }
      }
    });
  }

  function hookCreateScreen() {
    hideDualButtons();

    // ao entrar em create → abrir câmara se ainda não há media
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloCam) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        try {
          if (screen === 'create' || screen === 'screen-create') {
            setTimeout(function () {
              hideDualButtons();
              var has =
                (window.createMediaData && window.createMediaData.items && window.createMediaData.items.length) ||
                (document.getElementById('createPreview') &&
                  document.getElementById('createPreview').classList.contains('has-media'));
              if (!has) openCam();
            }, 60);
          }
        } catch (e) {}
        return r;
      };
      window.goTo.__tchiloCam = true;
    }

    // botão + / criar na nav
    document.querySelectorAll('[data-screen="create"], #navCreate, .nav-create, button[aria-label*="Criar"]').forEach(function (btn) {
      if (btn.__camHook) return;
      btn.__camHook = true;
      btn.addEventListener(
        'click',
        function () {
          setTimeout(function () {
            hideDualButtons();
            openCam();
          }, 40);
        },
        true
      );
    });

    // intercepta faceFxOpenBtn se ainda existir
    var fx = document.getElementById('faceFxOpenBtn');
    if (fx && !fx.__camRedirect) {
      fx.__camRedirect = true;
      fx.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openCam();
      };
    }
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloCloseCamera = closeCam;

  function boot() {
    ensureUI();
    hookCreateScreen();
    setTimeout(hookCreateScreen, 500);
    setTimeout(hookCreateScreen, 1500);
    setTimeout(hideDualButtons, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
