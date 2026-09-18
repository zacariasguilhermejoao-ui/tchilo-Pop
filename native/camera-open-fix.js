/**
 * tchilo-Pop — esconde Galeria no criar post + abre câmara de forma fiável
 */
(function () {
  'use strict';

  function hideGalleryButtons() {
    ['galleryBtn', 'faceFxOpenBtn'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.height = '0';
      el.style.overflow = 'hidden';
      el.style.margin = '0';
      el.style.padding = '0';
      el.style.border = '0';
      el.setAttribute('hidden', 'true');
      el.setAttribute('aria-hidden', 'true');
    });
    // qualquer botão com texto Abrir galeria no create
    var screen = document.getElementById('screen-create');
    if (screen) {
      screen.querySelectorAll('button, a').forEach(function (b) {
        if (b.id === 'tchiloOpenCamBtn' || b.classList.contains('tchilo-keep')) return;
        var t = (b.textContent || '').toLowerCase();
        if (t.indexOf('galeria') >= 0 || t.indexOf('câmara com efeitos') >= 0 || t.indexOf('camera com efeitos') >= 0) {
          b.style.display = 'none';
          b.setAttribute('hidden', 'true');
        }
      });
    }
  }

  function injectCSS() {
    if (document.getElementById('tchiloHideGalleryCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloHideGalleryCSS';
    st.textContent =
      '#galleryBtn,#faceFxOpenBtn{display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;border:0!important;}' +
      '#screen-create button.gallery-btn:not(#tchiloOpenCamBtn):not(.tchilo-keep){display:none!important;}' +
      '#tchiloCam.open,#tchiloCam[style*="display: flex"],#tchiloCam[style*="display:flex"]{display:flex!important;z-index:9999!important;}';
    document.head.appendChild(st);
  }

  function ensureOpenBtn() {
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
    function open() {
      hideGalleryButtons();
      if (typeof window.tchiloOpenCamera === 'function') {
        try {
          window.tchiloOpenCamera();
          return;
        } catch (e) {
          console.warn(e);
        }
      }
      // fallback direto
      forceOpenCamera();
    }
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      open();
    };
  }

  function forceOpenCamera() {
    var root = document.getElementById('tchiloCam');
    if (!root) {
      // criar UI mínima
      root = document.createElement('div');
      root.id = 'tchiloCam';
      root.innerHTML =
        '<style>#tchiloCam{position:fixed;inset:0;z-index:9999;background:#000;display:none;flex-direction:column;}' +
        '#tchiloCam.open{display:flex!important;}' +
        '#tchiloCam video{flex:1;width:100%;object-fit:cover;transform:scaleX(-1);}' +
        '#tchiloCam .bar{padding:12px;display:flex;justify-content:space-between;}' +
        '#tchiloCam button{width:48px;height:48px;border-radius:50%;border:0;background:#fff;font-size:20px;}</style>' +
        '<div class="bar"><button type="button" id="tchiloCamCloseForce">×</button></div>' +
        '<video id="tchiloCamVideo" playsinline muted autoplay></video>';
      document.body.appendChild(root);
      document.getElementById('tchiloCamCloseForce').onclick = function () {
        root.classList.remove('open');
        root.style.display = 'none';
        var v = document.getElementById('tchiloCamVideo');
        if (v && v.srcObject) {
          v.srcObject.getTracks().forEach(function (t) {
            t.stop();
          });
        }
      };
    }
    root.classList.add('open');
    root.style.display = 'flex';
    root.style.zIndex = '9999';
    var video = document.getElementById('tchiloCamVideo');
    if (!video) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Este dispositivo não permite abrir a câmara neste browser.');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.play().catch(function () {});
      })
      .catch(function (err) {
        console.warn(err);
        alert('Permite o acesso à câmara nas definições do telemóvel / browser.');
      });
  }

  // captura global: qualquer toque em Foto ou vídeo
  document.addEventListener(
    'click',
    function (ev) {
      var t = ev.target;
      if (!t) return;
      var btn = t.closest ? t.closest('#tchiloOpenCamBtn') : null;
      if (!btn) {
        var text = (t.textContent || '').trim().toLowerCase();
        if (text === 'foto ou vídeo' || text === 'foto ou video') {
          btn = t.closest('button') || t;
        }
      }
      if (!btn) return;
      if (btn.id !== 'tchiloOpenCamBtn' && (btn.textContent || '').toLowerCase().indexOf('foto ou') < 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof window.tchiloOpenCamera === 'function') window.tchiloOpenCamera();
      else forceOpenCamera();
    },
    true
  );

  function boot() {
    injectCSS();
    hideGalleryButtons();
    ensureOpenBtn();
    setTimeout(function () {
      injectCSS();
      hideGalleryButtons();
      ensureOpenBtn();
    }, 300);
    setTimeout(function () {
      hideGalleryButtons();
      ensureOpenBtn();
    }, 1000);
    setTimeout(hideGalleryButtons, 2500);

    if (typeof window.goTo === 'function' && !window.goTo.__tchiloHideGal) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        if (screen === 'create' || screen === 'screen-create') {
          setTimeout(function () {
            hideGalleryButtons();
            ensureOpenBtn();
          }, 40);
        }
        return r;
      };
      window.goTo.__tchiloHideGal = true;
    }

    try {
      new MutationObserver(function () {
        hideGalleryButtons();
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
