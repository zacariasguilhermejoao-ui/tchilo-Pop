/**
 * tchilo-Pop — câmara legada desativada (usa camera-tiktok)
 * Sem efeitos faciais.
 */
(function () {
  'use strict';
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
  function boot() {
    hideLegacy();
    setInterval(hideLegacy, 2000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* Live (Realtime SFU) */
;(function () {
  try {
    if (document.querySelector('script[data-tchilo-live]')) return;
    var s = document.createElement('script');
    s.src = 'native/tchilo-live.js?v=3';
    s.setAttribute('data-tchilo-live', '1');
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();

/* Calls 1-1 no chat */
;(function () {
  try {
    if (document.querySelector('script[data-tchilo-call]')) return;
    var s = document.createElement('script');
    s.src = 'native/tchilo-call.js?v=1';
    s.setAttribute('data-tchilo-call', '1');
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();
