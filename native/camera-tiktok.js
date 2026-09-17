/**
 * tchilo-Pop — Câmara única (TikTok/WhatsApp)
 * Botão + NÃO abre a câmara. Só o botão "Foto ou vídeo".
 */
(function () {
  'use strict';
  var HOLD_MS = 280, MAX_VIDEO_MS = 60000;
  var stream = null, mediaRecorder = null, recordedChunks = [], recording = false;
  var holdTimer = null, pressStart = 0, facingMode = 'user';
  var effectIndex = 0, filterIndex = 0, galleryOpen = false, touchStartY = 0;
  var EFFECTS = [{id:'none',label:'Normal'},{id:'glasses',label:'Óculos'},{id:'sunglasses',label:'Escuros'},{id:'hat',label:'Chapéu'},{id:'crown',label:'Coroa'},{id:'cat',label:'Gato'},{id:'dog',label:'Cão'},{id:'mustache',label:'Bigode'},{id:'hearts',label:'Corações'},{id:'blush',label:'Blush'},{id:'flower',label:'Flor'}];
  var FILTERS = [{id:'none',label:'Original'},{id:'warm',label:'Quente'},{id:'cool',label:'Frio'},{id:'bw',label:'P&B'},{id:'vivid',label:'Vivo'},{id:'soft',label:'Suave'},{id:'vintage',label:'Filme'}];

  function ensureUI() {
    if (document.getElementById('tchiloCam')) return;
    var root = document.createElement('div');
    root.id = 'tchiloCam';
    root.innerHTML = '<style>#tchiloCam{display:none;position:fixed;inset:0;z-index:320;background:#000;flex-direction:column;font-family:system-ui,sans-serif;-webkit-user-select:none}#tchiloCam.open{display:flex}#tchiloCam .cam-stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#111}#tchiloCam video,#tchiloCam canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}#tchiloCam video{z-index:0;transform:scaleX(-1)}#tchiloCam.cam-env video{transform:none}#tchiloCam canvas{z-index:1;pointer-events:none}#tchiloCam .cam-top{position:absolute;top:0;left:0;right:0;z-index:5;padding:calc(10px + env(safe-area-inset-top)) 14px 8px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(0,0,0,.5),transparent)}#tchiloCam .cam-iconbtn{width:42px;height:42px;border:0;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:20px;font-weight:800;cursor:pointer}#tchiloCam .cam-bottom{position:absolute;bottom:0;left:0;right:0;z-index:5;padding:8px 0 calc(18px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(0,0,0,.75),transparent);display:flex;flex-direction:column;align-items:center;gap:10px}#tchiloCam .fx-3d{width:100%;height:88px;perspective:900px;overflow:hidden}#tchiloCam .fx-3d-track{display:flex;align-items:center;height:100%;gap:10px;padding:0 42%;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}#tchiloCam .fx-3d-track::-webkit-scrollbar{display:none}#tchiloCam .fx-3d-item{flex:0 0 64px;height:64px;border-radius:50%;scroll-snap-align:center;border:2.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:#fff;font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;transform:scale(.78);opacity:.55;transition:transform .25s,border-color .2s}#tchiloCam .fx-3d-item.active{transform:scale(1.08);opacity:1;border-color:#c8f560;background:rgba(200,245,96,.22)}#tchiloCam .fx-filters-row{display:flex;gap:6px;overflow-x:auto;width:100%;padding:0 14px;scrollbar-width:none}#tchiloCam .fx-fchip{flex:0 0 auto;border:0;border-radius:999px;padding:6px 12px;background:rgba(255,255,255,.14);color:#fff;font-weight:700;font-size:12px;cursor:pointer}#tchiloCam .fx-fchip.on{background:#c8f560;color:#111}#tchiloCam .cam-actions{display:flex;align-items:center;justify-content:center;gap:28px;width:100%;padding:0 24px}#tchiloCam .cam-gallery{width:48px;height:48px;border-radius:12px;overflow:hidden;border:2px solid #fff;background:#333;padding:0;cursor:pointer;color:#fff;font-size:18px}#tchiloCam .cam-shutter{width:76px;height:76px;border-radius:50%;border:5px solid #fff;background:#fff;cursor:pointer;position:relative;touch-action:none}#tchiloCam.recording .cam-shutter{background:#ff3b5c;border-color:#ff3b5c}#tchiloCam .cam-shutter::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff}#tchiloCam.recording .cam-shutter::after{inset:18px;border-radius:6px}#tchiloCam .cam-flip{width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.2);color:#fff;font-size:20px;cursor:pointer}#tchiloCam .cam-hint{color:rgba(255,255,255,.75);font-size:12px;font-weight:600}#tchiloCam .rec-dot{display:none;color:#ff3b5c;font-weight:800;font-size:13px}#tchiloCam.recording .rec-dot{display:block}#faceFxOpenBtn,#galleryBtn{display:none!important}</style><div class="cam-stage"><video id="tchiloCamVideo" playsinline muted autoplay></video><canvas id="tchiloCamCanvas"></canvas><div class="cam-top"><button type="button" class="cam-iconbtn" id="tchiloCamClose">×</button><div class="rec-dot" id="tchiloCamRecTime">0:00</div><button type="button" class="cam-iconbtn" id="tchiloCamFlipTop">↺</button></div><div class="cam-bottom"><div class="cam-hint" id="tchiloCamHint">Toque foto · Mantém vídeo</div><div class="fx-3d"><div class="fx-3d-track" id="tchiloCamFxTrack"></div></div><div class="fx-filters-row" id="tchiloCamFilters"></div><div class="cam-actions"><button type="button" class="cam-gallery" id="tchiloCamGalBtn">▦</button><button type="button" class="cam-shutter" id="tchiloCamShutter"></button><button type="button" class="cam-flip" id="tchiloCamFlip">↺</button></div></div></div><input type="file" id="tchiloCamFile" accept="image/*,video/*" style="display:none">';
    document.body.appendChild(root);
    EFFECTS.forEach(function (ef, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-3d-item' + (i === 0 ? ' active' : '');
      b.textContent = ef.label;
      b.onclick = function () { effectIndex = i; document.querySelectorAll('#tchiloCamFxTrack .fx-3d-item').forEach(function (c, j) { c.classList.toggle('active', j === i); }); };
      document.getElementById('tchiloCamFxTrack').appendChild(b);
    });
    FILTERS.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-fchip' + (i === 0 ? ' on' : '');
      b.textContent = f.label;
      b.onclick = function () { filterIndex = i; document.querySelectorAll('#tchiloCamFilters .fx-fchip').forEach(function (c, j) { c.classList.toggle('on', j === i); }); };
      document.getElementById('tchiloCamFilters').appendChild(b);
    });
    document.getElementById('tchiloCamClose').onclick = closeCam;
    document.getElementById('tchiloCamFlip').onclick = flipCam;
    document.getElementById('tchiloCamFlipTop').onclick = flipCam;
    document.getElementById('tchiloCamGalBtn').onclick = function () { document.getElementById('tchiloCamFile').click(); };
    document.getElementById('tchiloCamFile').onchange = function (ev) {
      var files = ev.target.files; if (!files || !files[0]) return;
      var file = files[0], isVideo = (file.type || '').indexOf('video') === 0;
      deliverMedia(file, URL.createObjectURL(file), isVideo ? 'video' : 'image');
      ev.target.value = '';
    };
    bindShutter();
  }

  function bindShutter() {
    var btn = document.getElementById('tchiloCamShutter');
    if (!btn || btn.__b) return; btn.__b = true;
    function down(e) { e.preventDefault(); pressStart = Date.now(); holdTimer = setTimeout(startVideoRecord, HOLD_MS); }
    function up(e) { e.preventDefault(); clearTimeout(holdTimer); holdTimer = null; if (recording) stopVideoRecord(); else if (Date.now() - pressStart < HOLD_MS + 80) takePhoto(); }
    function cancel() { clearTimeout(holdTimer); holdTimer = null; if (recording) stopVideoRecord(); }
    btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', cancel);
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  async function startCamera() {
    stopStream();
    var video = document.getElementById('tchiloCamVideo');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } } });
    } catch (e1) {
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: facingMode } } }); }
      catch (e2) { setHint('Sem acesso à câmara'); return; }
    }
    video.srcObject = stream; video.muted = true; video.playsInline = true;
    try { await video.play(); } catch (e3) {}
    setHint('Toque foto · Mantém vídeo');
  }
  function stopStream() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') try { mediaRecorder.stop(); } catch (e) {}
    mediaRecorder = null; recording = false;
    if (stream) { stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); stream = null; }
    var root = document.getElementById('tchiloCam'); if (root) root.classList.remove('recording');
  }
  function setHint(t) { var el = document.getElementById('tchiloCamHint'); if (el) el.textContent = t || ''; }
  function takePhoto() {
    var video = document.getElementById('tchiloCamVideo');
    if (!video || video.readyState < 2) { setHint('Aguarda a câmara…'); return; }
    var w = video.videoWidth || 720, h = video.videoHeight || 1280;
    var out = document.createElement('canvas'); out.width = w; out.height = h;
    var ctx = out.getContext('2d');
    if (facingMode === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, w, h);
    out.toBlob(function (blob) {
      if (!blob) return;
      var file; try { file = new File([blob], 'tchilo-cam.jpg', { type: 'image/jpeg' }); } catch (e) { file = blob; file.name = 'tchilo-cam.jpg'; }
      deliverMedia(file, URL.createObjectURL(blob), 'image');
    }, 'image/jpeg', 0.92);
  }
  function startVideoRecord() {
    if (!stream || recording) return;
    recordedChunks = [];
    try { mediaRecorder = new MediaRecorder(stream); } catch (e) { setHint('Vídeo não suportado'); return; }
    mediaRecorder.ondataavailable = function (ev) { if (ev.data && ev.data.size) recordedChunks.push(ev.data); };
    mediaRecorder.onstop = function () {
      var blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/webm' });
      recording = false; var root = document.getElementById('tchiloCam'); if (root) root.classList.remove('recording');
      if (!blob.size) return;
      var file; try { file = new File([blob], 'tchilo-cam.webm', { type: blob.type }); } catch (e) { file = blob; file.name = 'tchilo-cam.webm'; }
      deliverMedia(file, URL.createObjectURL(blob), 'video');
    };
    mediaRecorder.start(200); recording = true;
    var root = document.getElementById('tchiloCam'); if (root) root.classList.add('recording');
    setHint('A gravar… larga para parar');
  }
  function stopVideoRecord() { if (mediaRecorder && recording) try { mediaRecorder.stop(); } catch (e) {} }
  function deliverMedia(file, url, mediaType) {
    closeCam();
    try { window.createMediaData = { type: mediaType, items: [{ type: mediaType, url: url, name: file.name, file: file }], files: [file] }; window.createMediaFiles = [file]; } catch (e) {}
    if (typeof window.tchiloDeliverFaceFxPhoto === 'function' && mediaType === 'image') { try { window.tchiloDeliverFaceFxPhoto(file, url); return; } catch (e2) {} }
    if (typeof window.tchiloOpenMediaEditor === 'function') { try { window.tchiloOpenMediaEditor({ mode: 'post', mediaType: mediaType, src: url, file: file }); return; } catch (e3) {} }
    try { if (typeof goTo === 'function') goTo('create'); } catch (e4) {}
  }
  function flipCam() { facingMode = facingMode === 'user' ? 'environment' : 'user'; var root = document.getElementById('tchiloCam'); if (root) root.classList.toggle('cam-env', facingMode === 'environment'); startCamera(); }
  function openCam() { ensureUI(); var root = document.getElementById('tchiloCam'); root.classList.add('open'); document.body.style.overflow = 'hidden'; startCamera(); }
  function closeCam() { stopStream(); clearTimeout(holdTimer); var root = document.getElementById('tchiloCam'); if (root) { root.classList.remove('open', 'recording'); } document.body.style.overflow = ''; }

  function ensureCreateEntryBtn() {
    if (document.getElementById('tchiloOpenCamBtn')) return;
    var screen = document.getElementById('screen-create'); if (!screen) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.id = 'tchiloOpenCamBtn'; btn.className = 'gallery-btn tchilo-keep';
    btn.innerHTML = '<span>Foto ou vídeo</span>';
    btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;gap:8px;width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;border:2px solid var(--ink,#0B0B0C);border-radius:16px;background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);font-weight:800;font-size:15px;cursor:pointer;box-sizing:border-box;';
    btn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openCam(); };
    var preview = document.getElementById('createPreview');
    if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling); else screen.appendChild(btn);
  }

  function hookCreateScreen() {
    var fx = document.getElementById('faceFxOpenBtn'); if (fx) fx.style.display = 'none';
    var gal = document.getElementById('galleryBtn'); if (gal) gal.style.display = 'none';
    ensureCreateEntryBtn();
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloCamNoAuto) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        if (screen === 'create' || screen === 'screen-create') {
          setTimeout(function () { closeCam(); ensureCreateEntryBtn(); var fx2 = document.getElementById('faceFxOpenBtn'); if (fx2) fx2.style.display = 'none'; var g2 = document.getElementById('galleryBtn'); if (g2) g2.style.display = 'none'; }, 30);
        }
        return r;
      };
      window.goTo.__tchiloCamNoAuto = true;
    }
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloCloseCamera = closeCam;

  function boot() { ensureUI(); hookCreateScreen(); setTimeout(hookCreateScreen, 500); setTimeout(hookCreateScreen, 1500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
