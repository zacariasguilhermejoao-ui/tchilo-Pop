/** bootstrap: login v8 + media editor */
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
  loadScript('native/tchilo-login-session-fix.js?v=8');
  loadScript('native/tchilo-login-click-fix.js?v=5');

  var SHA = 'acac5780f3459d23c0c9dd06e46340567fbb685b';
  var BASE = 'https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/' + SHA + '/native/media-editor.js';
  loadScript(BASE, function () {
    loadScript('native/tchilo-media-editor-ui-v10.js?v=2');
  });
})();
