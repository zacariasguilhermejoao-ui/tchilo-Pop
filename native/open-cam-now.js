/**
 * tchilo-Pop — ABRE A CÂMARA já (sem falhar)
 * Esconde Abrir galeria · um toque = Foto ou vídeo
 */
(function () {
  'use strict';

  function css() {
    if (document.getElementById('tchiloOpenNowCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloOpenNowCSS';
    st.textContent =
      '#galleryBtn,#faceFxOpenBtn{display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;}' +
      '#screen-create button.gallery-btn:not(#tchiloOpenCamBtn):not(.tchilo-keep):not(#removeMediaBtn){display:none!important;}' +
      '#tchiloOpenCamBtn{display:inline-flex!important;visibility:visible!important;height:auto!important;opacity:1!important;}' +
      '#tchiloCamLive{display:none;position:fixed;inset:0;z-index:2147483000;background:#000;flex-direction:column;}' +
      '#tchiloCamLive.on{display:flex!important;}' +
      '#tchiloCamLive video{flex:1;width:100%;object-fit:cover;background:#111;}' +
      '#tchiloCamLive.mirror video{transform:scaleX(-1);}' +
      '#tchiloCamLive .bar{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));}' +
      '#tchiloCamLive .bar button{width:48px;height:48px;border:0;border-radius:50%;background:rgba(255,255,255,.25);color:#fff;font-size:22px;font-weight:800;}' +
      '#tchiloCamLive .hint{color:#fff;text-align:center;padding:8px;font-size:13px;font-weight:600;}' +
      '#tchiloCamLive .bottom{padding:12px;padding-bottom:calc(20px + env(safe-area-inset-bottom));display:flex;justify-content:center;gap:24px;align-items:center;}' +
      '#tchiloCamLive .shut{width:72px;height:72px;border-radius:50%;border:4px solid #fff;background:#fff;}' +
      '#tchiloCamLive .msg{color:#c8f560;text-align:center;padding:8px;font-size:13px;}';
    document.head.appendChild(st);
  }

  var stream = null;
  var facing = 'user';

  function ensureShell() {
    var el = document.getElementById('tchiloCamLive');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'tchiloCamLive';
    el.className = 'mirror';
    el.innerHTML =
      '<div class="bar">' +
      '<button type="button" id="tchiloCamLiveX">×</button>' +
      '<button type="button" id="tchiloCamLiveFlip">↺</button>' +
      '</div>' +
      '<div class="msg" id="tchiloCamLiveMsg">A abrir câmara…</div>' +
      '<video id="tchiloCamLiveVideo" playsinline muted autoplay></video>' +
      '<div class="hint">Toque no círculo para foto</div>' +
      '<div class="bottom"><button type="button" class="shut" id="tchiloCamLiveShut"></button></div>';
    document.body.appendChild(el);
    document.getElementById('tchiloCamLiveX').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeLive();
    };
    document.getElementById('tchiloCamLiveFlip').onclick = function (e) {
      e.preventDefault();
      facing = facing === 'user' ? 'environment' : 'user';
      el.classList.toggle('mirror', facing === 'user');
      startLive();
    };
    document.getElementById('tchiloCamLiveShut').onclick = function (e) {
      e.preventDefault();
      snapLive();
    };
    return el;
  }

  function setMsg(t) {
    var m = document.getElementById('tchiloCamLiveMsg');
    if (m) m.textContent = t || '';
  }

  function stopLiveStream() {
    if (stream) {
      stream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
      stream = null;
    }
  }

  function startLive() {
    stopLiveStream();
    var video = document.getElementById('tchiloCamLiveVideo');
    if (!video) return;
    setMsg('A abrir câmara…');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg('Câmara não disponível neste browser');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      .then(function (s) {
        stream = s;
        video.srcObject = s;
        video.muted = true;
        video.setAttribute('playsinline', '');
        video.play().catch(function () {});
        setMsg('');
      })
      .catch(function (err) {
        console.warn(err);
        setMsg('Permite o acesso à CÂMARA nas definições do telemóvel');
      });
  }

  function closeLive() {
    stopLiveStream();
    var el = document.getElementById('tchiloCamLive');
    if (el) {
      el.classList.remove('on');
      el.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  function snapLive() {
    var video = document.getElementById('tchiloCamLiveVideo');
    if (!video || video.readyState < 2) {
      setMsg('Aguarda a câmara…');
      return;
    }
    var w = video.videoWidth || 720;
    var h = video.videoHeight || 1280;
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');
    if (facing === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    c.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var file;
      try {
        file = new File([blob], 'tchilo.jpg', { type: 'image/jpeg' });
      } catch (e) {
        file = blob;
        file.name = 'tchilo.jpg';
      }
      closeLive();
      try {
        window.createMediaData = {
          type: 'image',
          items: [{ type: 'image', url: url, name: 'tchilo.jpg', file: file }],
          files: [file]
        };
        window.createMediaFiles = [file];
      } catch (e2) {}
      if (typeof window.tchiloDeliverFaceFxPhoto === 'function') {
        try {
          window.tchiloDeliverFaceFxPhoto(file, url);
          return;
        } catch (e3) {}
      }
      if (typeof window.tchiloOpenMediaEditor === 'function') {
        try {
          window.tchiloOpenMediaEditor({ mode: 'post', mediaType: 'image', src: url, file: file });
          return;
        } catch (e4) {}
      }
      if (typeof goTo === 'function') goTo('create');
    }, 'image/jpeg', 0.92);
  }

  function openNow() {
    css();
    try {
      // prefer full camera if available
      if (typeof window.tchiloOpenCamera === 'function') {
        window.tchiloOpenCamera();
        // if full cam didn't show in 400ms, force live shell
        setTimeout(function () {
          var full = document.getElementById('tchiloCam');
          var fullOpen = full && (full.classList.contains('open') || full.style.display === 'flex');
          if (!fullOpen) openLiveShell();
        }, 450);
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    openLiveShell();
  }

  function openLiveShell() {
    css();
    var el = ensureShell();
    el.classList.add('on');
    el.style.display = 'flex';
    el.style.zIndex = '2147483000';
    document.body.style.overflow = 'hidden';
    startLive();
  }

  window.tchiloOpenCameraNow = openNow;

  function ensureBtn() {
    css();
    var screen = document.getElementById('screen-create');
    if (!screen) return;

    // esconder galeria sempre
    var gal = document.getElementById('galleryBtn');
    if (gal) {
      gal.style.display = 'none';
      gal.onclick = function (e) {
        e.preventDefault();
        openNow();
      };
    }
    var fx = document.getElementById('faceFxOpenBtn');
    if (fx) fx.style.display = 'none';

    var btn = document.getElementById('tchiloOpenCamBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloOpenCamBtn';
      btn.className = 'gallery-btn tchilo-keep';
      btn.innerHTML = '<span>Foto ou vídeo</span>';
      btn.style.cssText =
        'display:inline-flex!important;align-items:center;justify-content:center;' +
        'width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;' +
        'border:2px solid #0B0B0C;border-radius:16px;background:#c8f560;color:#0B0B0C;' +
        'font-weight:800;font-size:15px;cursor:pointer;position:relative;z-index:50;';
      var preview = document.getElementById('createPreview');
      if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
      else screen.insertBefore(btn, screen.firstChild);
    }
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openNow();
    };
  }

  // captura global — não falha
  document.addEventListener(
    'click',
    function (ev) {
      var t = ev.target;
      if (!t) return;
      var btn = t.closest ? t.closest('#tchiloOpenCamBtn') : null;
      if (!btn) {
        var txt = (t.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (txt.indexOf('foto ou vídeo') >= 0 || txt.indexOf('foto ou video') >= 0) {
          btn = t.closest('button') || t;
        }
      }
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      openNow();
    },
    true
  );

  function boot() {
    css();
    ensureBtn();
    [100, 400, 1000, 2000, 4000].forEach(function (ms) {
      setTimeout(function () {
        css();
        ensureBtn();
      }, ms);
    });
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloOpenNow) {
      var orig = window.goTo;
      window.goTo = function (s) {
        var r = orig.apply(this, arguments);
        if (s === 'create' || s === 'screen-create') {
          setTimeout(ensureBtn, 30);
          setTimeout(ensureBtn, 150);
        }
        return r;
      };
      window.goTo.__tchiloOpenNow = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
