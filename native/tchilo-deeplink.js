/**
 * Tchilo — deep links (App Links / Universal Links / tchilo://)
 * Abre recuperação de senha, perfis /u/username e share target.
 */
(function () {
  'use strict';
  if (window.__tchiloDeepLinkV1) return;
  window.__tchiloDeepLinkV1 = true;

  function handleUrl(url) {
    if (!url) return;
    try {
      var u = String(url);
      var lower = u.toLowerCase();

      /* Share Target — payload nativo já injectado ou a injectar */
      if (
        lower.indexOf('tchilo://share') === 0 ||
        lower.indexOf('share-target') >= 0 ||
        (lower.indexOf('pending=1') >= 0 && lower.indexOf('share') >= 0)
      ) {
        try {
          if (window.__tchiloSharePayload && window.TchiloShareTarget) {
            window.TchiloShareTarget.handle(window.__tchiloSharePayload);
            window.__tchiloSharePayload = null;
          }
        } catch (e0) {}
        return;
      }

      /* Recuperação de senha */
      if (
        lower.indexOf('type=recovery') >= 0 ||
        lower.indexOf('redefinir-senha') >= 0 ||
        lower.indexOf('reset-password') >= 0
      ) {
        try {
          sessionStorage.setItem('tchilo_password_recovery', '1');
          window.__tchiloPasswordRecoveryActive = true;
        } catch (e) {}
        try {
          var hashIdx = u.indexOf('#');
          if (hashIdx >= 0) {
            var h = u.slice(hashIdx);
            if (h && location.hash !== h) {
              try {
                history.replaceState(null, '', '/' + h);
              } catch (e2) {
                location.hash = h.replace(/^#/, '');
              }
            }
          }
        } catch (e3) {}
        try {
          if (typeof showLoginPanel === 'function') showLoginPanel('recover-new');
        } catch (e4) {}
        try {
          document.body.classList.add('tchilo-recovery-mode');
          var gate = document.getElementById('loginGate');
          if (gate) {
            gate.classList.remove('hidden');
            gate.style.setProperty('display', 'flex', 'important');
          }
        } catch (e5) {}
        return;
      }

      /* Perfil público /u/username */
      var m = u.match(/\/(?:u|perfil)\/([^\/?#]+)/i);
      if (m && m[1]) {
        try {
          window.viewingProfileUser = decodeURIComponent(m[1]);
          if (typeof goTo === 'function') goTo('profile');
          if (typeof renderProfile === 'function') setTimeout(renderProfile, 100);
        } catch (e6) {}
      }
    } catch (err) {
      console.warn('[Tchilo] deeplink', err);
    }
  }

  function wireCapacitor() {
    try {
      var Cap = window.Capacitor;
      if (!Cap || !Cap.Plugins || !Cap.Plugins.App) return false;
      var App = Cap.Plugins.App;

      App.addListener('appUrlOpen', function (data) {
        if (data && data.url) handleUrl(data.url);
      });

      if (typeof App.getLaunchUrl === 'function') {
        App.getLaunchUrl()
          .then(function (res) {
            if (res && res.url) handleUrl(res.url);
          })
          .catch(function () {});
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function boot() {
    wireCapacitor();
    try {
      handleUrl(location.href);
    } catch (e) {}
  }

  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
