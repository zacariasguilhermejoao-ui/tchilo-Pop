/** media-editor bootstrap + UI overlay + login fix */
(function () {
  'use strict';
  if (window.__tchiloMediaEditorBoot) return;
  window.__tchiloMediaEditorBoot = true;

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    if (cb) s.onload = cb;
    s.onerror = function () { console.warn('[tchilo] fail', src); if (cb) cb(); };
    (document.head || document.documentElement).appendChild(s);
  }

  var SHA = 'acac5780f3459d23c0c9dd06e46340567fbb685b';
  var BASE = 'https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/' + SHA + '/native/media-editor.js';

  // 1) Full media-editor from known-good
  loadScript(BASE + '?t=' + Date.now(), function () {
    // 2) UI overlay
    loadScript('native/tchilo-media-editor-ui-v10.js?v=2');
  });

  // 3) Login fix v4 — não intercepta o formulário
  loadScript('native/tchilo-login-click-fix.js?v=4');
})();
