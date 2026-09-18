/**
 * tchilo-Pop — STABLE FIX
 * 1) Câmara abre no Foto ou vídeo
 * 2) Feed deixa de piscar
 * 3) Vídeos param de reiniciar em loop
 */
(function () {
  'use strict';

  /* ========== CSS: esconder galeria + câmara fullscreen ========= */
  function injectCSS() {
    if (document.getElementById('tchiloStableCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloStableCSS';
    st.textContent =
      '#galleryBtn,#faceFxOpenBtn{display:none!important;}' +
      '#screen-create .gallery-btn:not(#tchiloOpenCamBtn):not(.tchilo-keep):not(#removeMediaBtn){display:none!important;}' +
      '#tchiloOpenCamBtn{display:inline-flex!important;z-index:60!important;}' +
      '#tchiloStableCam{display:none;position:fixed;inset:0;z-index:2147483646;background:#000;flex-direction:column;}' +
      '#tchiloStableCam.on{display:flex!important;}' +
      '#tchiloStableCam video{flex:1;width:100%;object-fit:cover;background:#000;}' +
      '#tchiloStableCam.mir video{transform:scaleX(-1);}' +
      '#tchiloStableCam .tb{display:flex;justify-content:space-between;padding:calc(12px + env(safe-area-inset-top)) 14px 8px;}' +
      '#tchiloStableCam .tb button{width:48px;height:48px;border:0;border-radius:50%;background:rgba(255,255,255,.25);color:#fff;font-size:22px;font-weight:800;}' +
      '#tchiloStableCam .msg{color:#c8f560;text-align:center;padding:6px 12px;font-size:13px;font-weight:600;}' +
      '#tchiloStableCam .bb{padding:12px;padding-bottom:calc(18px + env(safe-area-inset-bottom));display:flex;justify-content:center;gap:20px;}' +
      '#tchiloStableCam .sh{width:72px;height:72px;border-radius:50%;border:4px solid #fff;background:#fff;}' +
      /* anti-piscar no feed */
      '#feedList .post{animation:none!important;transition:none!important;}' +
      '#feedList video{background:#111;}' +
      '#feedList img{background:#e8e6de;}';
    document.head.appendChild(st);
  }

  /* ========== FEED: não reconstruir a cada 400ms ========= */
  function hardenFeed() {
    if (typeof window.renderFeed !== 'function') return;
    if (window.renderFeed.__stable) return;
    var orig = window.renderFeed;
    var lastAt = 0;
    var lastSig = '';
    var timer = null;
    window.renderFeed = function (force) {
      var now = Date.now();
      try {
        var posts = typeof getPosts === 'function' ? getPosts() : [];
        var sig = (posts || [])
          .map(function (p) {
            return (p && p.id) || '';
          })
          .join('|');
        // mesma lista e < 1.2s → não redesenha (para o piscar)
        if (!force && sig === lastSig && now - lastAt < 1200) return;
        if (!force && now - lastAt < 800) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(function () {
            window.renderFeed(true);
          }, 800);
          return;
        }
        lastSig = sig;
        lastAt = now;
      } catch (e) {
        lastAt = now;
      }
      // pausar vídeos antes de destruir o DOM evita o flash
      try {
        document.querySelectorAll('#feedList video').forEach(function (v) {
          try {
            v.pause();
          } catch (e2) {}
        });
      } catch (e3) {}
      return orig.apply(this, arguments);
    };
    window.renderFeed.__stable = true;
    window.renderFeed.__noflicker = true;
  }

  /* ========== VÍDEOS: não auto-play em loop ========= */
  function hardenVideos() {
    // desliga pré-visualização agressiva que reinicia vídeos
    try {
      window.__tchiloDisableVideoPreview = true;
    } catch (e) {}
    // um toque no vídeo = play/pause estável
    if (document.__tchiloVidTap) return;
    document.__tchiloVidTap = true;
    document.addEventListener(
      'click',
      function (ev) {
        var v = ev.target;
        if (!v || v.tagName !== 'VIDEO') return;
        if (!v.closest || !v.closest('#feedList')) return;
        ev.preventDefault();
        ev.stopPropagation();
        try {
          if (v.paused) {
            document.querySelectorAll('#feedList video').forEach(function (o) {
              if (o !== v) {
                try {
                  o.pause();
                } catch (e) {}
              }
            });
            v.muted = false;
            var p = v.play();
            if (p && p.catch) p.catch(function () {
              v.muted = true;
              v.play().catch(function () {});
            });
          } else {
            v.pause();
          }
        } catch (e2) {}
      },
      true
    );
  }

  /* ========== CÂMARA simples e fiável ========= */
  var camStream = null;
  var facing = 'user';

  function stopCam() {
    if (camStream) {
      camStream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
      camStream = null;
    }
  }

  function closeCam() {
    stopCam();
    var el = document.getElementById('tchiloStableCam');
    if (el) {
      el.classList.remove('on');
      el.style.display = 'none';
    }
    // também fechar overlays antigos se existirem
    ['tchiloCam', 'tchiloCamLive', 'tchiloFaceFx'].forEach(function (id) {
      var x = document.getElementById(id);
      if (x) {
        x.classList.remove('open', 'on');
        x.style.display = 'none';
      }
    });
    document.body.style.overflow = '';
  }

  function ensureCamUI() {
    var el = document.getElementById('tchiloStableCam');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'tchiloStableCam';
    el.className = 'mir';
    el.innerHTML =
      '<div class="tb">' +
      '<button type="button" id="tscClose">×</button>' +
      '<button type="button" id="tscFlip">↺</button>' +
      '</div>' +
      '<div class="msg" id="tscMsg">A abrir câmara…</div>' +
      '<video id="tscVideo" playsinline muted autoplay></video>' +
      '<div class="bb"><button type="button" class="sh" id="tscSnap"></button></div>';
    document.body.appendChild(el);
    document.getElementById('tscClose').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeCam();
    };
    document.getElementById('tscFlip').onclick = function (e) {
      e.preventDefault();
      facing = facing === 'user' ? 'environment' : 'user';
      el.classList.toggle('mir', facing === 'user');
      startCam();
    };
    document.getElementById('tscSnap').onclick = function (e) {
      e.preventDefault();
      snap();
    };
    return el;
  }

  function setMsg(t) {
    var m = document.getElementById('tscMsg');
    if (m) m.textContent = t || '';
  }

  function startCam() {
    stopCam();
    var video = document.getElementById('tscVideo');
    if (!video) return;
    setMsg('A abrir câmara…');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg('Câmara indisponível neste dispositivo');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      .then(function (s) {
        camStream = s;
        video.srcObject = s;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.play().catch(function () {});
        setMsg('Toque no círculo para tirar foto');
      })
      .catch(function (err) {
        console.warn(err);
        setMsg('Permite a CÂMARA nas definições do telemóvel / app');
      });
  }

  function snap() {
    var video = document.getElementById('tscVideo');
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
      closeCam();
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

  function openCam() {
    injectCSS();
    var el = ensureCamUI();
    el.classList.add('on');
    el.style.display = 'flex';
    el.style.zIndex = '2147483646';
    document.body.style.overflow = 'hidden';
    startCam();
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloOpenCameraNow = openCam;
  window.tchiloCloseCamera = closeCam;

  function ensureBtn() {
    injectCSS();
    var screen = document.getElementById('screen-create');
    if (!screen) return;
    var gal = document.getElementById('galleryBtn');
    if (gal) {
      gal.style.display = 'none';
      gal.onclick = function (e) {
        e.preventDefault();
        openCam();
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
        'font-weight:800;font-size:15px;cursor:pointer;z-index:60;';
      var preview = document.getElementById('createPreview');
      if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
      else {
        var body = screen.querySelector('.create-body') || screen;
        body.insertBefore(btn, body.firstChild);
      }
    }
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCam();
    };
  }

  // clique global no botão
  document.addEventListener(
    'click',
    function (ev) {
      var t = ev.target;
      if (!t) return;
      var btn = t.closest ? t.closest('#tchiloOpenCamBtn') : null;
      if (!btn) {
        var txt = ((t.textContent || '') + '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (txt.indexOf('foto ou vídeo') >= 0 || txt.indexOf('foto ou video') >= 0) {
          btn = t.closest('button') || t;
        }
      }
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      openCam();
    },
    true
  );

  function boot() {
    injectCSS();
    hardenFeed();
    hardenVideos();
    ensureBtn();
    [50, 200, 600, 1500, 3000].forEach(function (ms) {
      setTimeout(function () {
        injectCSS();
        hardenFeed();
        ensureBtn();
      }, ms);
    });
    if (typeof window.goTo === 'function' && !window.goTo.__stableCam) {
      var orig = window.goTo;
      window.goTo = function (s) {
        var r = orig.apply(this, arguments);
        if (s === 'create' || s === 'screen-create') {
          setTimeout(ensureBtn, 20);
          setTimeout(ensureBtn, 120);
        }
        if (s === 'feed' || s === 'screen-feed') {
          setTimeout(hardenFeed, 50);
        }
        return r;
      };
      window.goTo.__stableCam = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
