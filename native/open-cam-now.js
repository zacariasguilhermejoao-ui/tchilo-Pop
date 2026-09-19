/**
 * tchilo-Pop — botão "Foto ou vídeo" abre a câmara COM efeitos
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
      '#tchiloOpenCamBtn{display:inline-flex!important;visibility:visible!important;height:auto!important;opacity:1!important;}';
    document.head.appendChild(st);
  }

  function openFxCamera() {
    if (typeof window.tchiloOpenCamera === 'function') {
      window.tchiloOpenCamera();
      return;
    }
    if (typeof window.openFaceEffects === 'function') {
      window.openFaceEffects();
      return;
    }
  }

  function ensureBtn() {
    css();
    var screen = document.getElementById('screen-create');
    if (!screen) return;

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
      openFxCamera();
    };
  }

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
      if (typeof window.tchiloOpenCamera === 'function') {
        ev.preventDefault();
        ev.stopPropagation();
        openFxCamera();
      }
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
