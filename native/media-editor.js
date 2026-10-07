/** media-editor bootstrap + login fixes + UI overlay */
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

  // 1) Botões Entrar / Criar conta
  loadScript('native/tchilo-login-click-fix.js?v=5');
  // 2) Sessão persistente (não voltar ao ecrã de login após autenticar)
  loadScript('native/tchilo-login-session-fix.js?v=6');

  var SHA = 'acac5780f3459d23c0c9dd06e46340567fbb685b';
  var BASE = 'https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/' + SHA + '/native/media-editor.js';

  loadScript(BASE + '?t=' + Date.now(), function () {
    loadScript('native/tchilo-media-editor-ui-v10.js?v=2');
  });
})();
