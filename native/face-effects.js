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

/* Bloquear seleção / zoom indesejados */
;(function () {
  try {
    if (document.querySelector('script[data-tchilo-touch-lock]')) return;
    var s = document.createElement('script');
    s.src = 'native/tchilo-touch-lock.js?v=1';
    s.setAttribute('data-tchilo-touch-lock', '1');
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();

/* Idioma automático do telefone */
;(function () {
  try {
    if (document.querySelector('script[data-tchilo-auto-lang]')) return;
    var s = document.createElement('script');
    s.src = 'native/tchilo-auto-lang.js?v=1';
    s.setAttribute('data-tchilo-auto-lang', '1');
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
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
    s.src = 'native/tchilo-call.js?v=2';
    s.setAttribute('data-tchilo-call', '1');
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();

/* Chat UX: mic/send, GIF, figurinhas, + */
;(function () {
  try {
    if (document.querySelector('script[data-tchilo-chat-ux]')) return;
    var s = document.createElement('script');
    s.src = 'native/tchilo-chat-ux.js?v=1';
    s.setAttribute('data-tchilo-chat-ux', '1');
    s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();
