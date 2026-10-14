/** bootstrap no login: só o mínimo. Editor/câmara depois da sessão. */
(function () {
  'use strict';
  if (window.__tchiloMediaEditorBoot) return;
  window.__tchiloMediaEditorBoot = true;

  function hasSession() {
    try {
      var s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return !!(s && (s.id || s.username || s.email));
    } catch (e) {
      return false;
    }
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
    s.async = true;
    s.onerror = function () { console.warn('[tchilo] fail', src); };
    (document.head || document.documentElement).appendChild(s);
  }

  // Mínimo no login (sem alterar UI Entrar/Criar)
  loadScript('native/tchilo-stuck-fix.js?v=1');

  function loadAfterLogin() {
    if (window.__tchiloMediaAfterLogin) return;
    window.__tchiloMediaAfterLogin = true;
    loadScript('native/tchilo-cam-lazy-lm.js?v=1');
    loadScript('native/tchilo-icon-no-box.js?v=1');
    loadScript('native/tchilo-media-editor-ui-v10.js?v=3');
  }

  if (hasSession()) {
    loadAfterLogin();
  } else {
    var t = setInterval(function () {
      if (hasSession()) {
        clearInterval(t);
        loadAfterLogin();
      }
    }, 500);
  }
})();
