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
