/** bootstrap: login + media editor UI + stuck-fix */
(function () {
  'use strict';
  if (window.__tchiloMediaEditorBoot) return;
  window.__tchiloMediaEditorBoot = true;

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
    s.async = false;
    if (cb) s.onload = cb;
    s.onerror = function () { console.warn('[tchilo] fail', src); if (cb) cb(); };
    (document.head || document.documentElement).appendChild(s);
  }

  // Login session MUST load first
  loadScript('native/tchilo-login-session-fix.js?v=9');
  loadScript('native/tchilo-login-click-fix.js?v=5');

  // Para de ficar preso a processar
  loadScript('native/tchilo-stuck-fix.js?v=1');

  // MediaPipe só quando a câmara abre com efeito (não no boot)
  loadScript('native/tchilo-cam-lazy-lm.js?v=1');

  // Editor UI local
  loadScript('native/tchilo-media-editor-ui-v10.js?v=3');
})();
