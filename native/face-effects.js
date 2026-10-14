/**
 * tchilo-Pop — no login não injeta scripts extra (telemóvel não cola)
 */
(function () {
  'use strict';

  function hasSession() {
    try {
      var s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return !!(s && (s.id || s.username || s.email));
    } catch (e) {
      return false;
    }
  }

  function hideLegacy() {
    var el = document.getElementById('tchiloFaceFx');
    if (el) {
      el.style.display = 'none';
      el.classList.remove('open');
    }
  }

  window.openFaceEffects = function () {
    if (typeof window.tchiloOpenCamera === 'function') window.tchiloOpenCamera();
  };
  window.closeFaceEffects = function () {
    if (typeof window.tchiloCloseCamera === 'function') window.tchiloCloseCamera();
  };

  function inject(src, attr) {
    try {
      if (document.querySelector('script[' + attr + ']')) return;
      var s = document.createElement('script');
      s.src = src;
      s.setAttribute(attr, '1');
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  function loadExtras() {
    if (window.__tchiloFaceFxExtras) return;
    window.__tchiloFaceFxExtras = true;
    inject('native/tchilo-feed-icon.js?v=2', 'data-tchilo-feed-icon');
    inject('native/tchilo-touch-lock.js?v=1', 'data-tchilo-touch-lock');
    inject('native/tchilo-auto-lang.js?v=1', 'data-tchilo-auto-lang');
    inject('native/tchilo-live.js?v=3', 'data-tchilo-live');
    inject('native/tchilo-call.js?v=2', 'data-tchilo-call');
    inject('native/tchilo-chat-ux.js?v=2', 'data-tchilo-chat-ux');
  }

  function boot() {
    hideLegacy();
    if (hasSession()) loadExtras();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 800);
  setInterval(function () {
    if (hasSession()) loadExtras();
  }, 2000);
})();
