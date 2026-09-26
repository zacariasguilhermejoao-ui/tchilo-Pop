/**
 * Tchilo — garantir que Entrar / Criar conta respondem ao toque
 */
(function () {
  'use strict';
  if (window.__tchiloLoginClickFix) return;
  window.__tchiloLoginClickFix = true;

  function injectCSS() {
    if (document.getElementById('tchiloLoginClickCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloLoginClickCSS';
    st.textContent =
      '.login-gate{' +
      'z-index:99999!important;pointer-events:auto!important;' +
      'position:fixed!important;inset:0!important;}' +
      '.login-gate button, .login-gate a, .login-gate input, .login-gate select,' +
      '.login-gate .login-create, .login-gate .login-button,' +
      '.login-home button{' +
      'pointer-events:auto!important;cursor:pointer!important;' +
      'position:relative;z-index:100000!important;}' +
      /* nada por cima do login-gate */
      'body > *:not(.login-gate):not(script):not(style){' +
      '}' +
      '.login-gate ~ .navbar, body.login-open .navbar{' +
      'pointer-events:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function bindButtons() {
    var gate = document.querySelector('.login-gate');
    if (!gate) return;

    /* Entrar */
    gate.querySelectorAll('button, a.login-create, [onclick]').forEach(function (btn) {
      if (btn.__tchiloBound) return;
      var oc = btn.getAttribute('onclick') || '';
      var text = (btn.textContent || '').trim().toLowerCase();

      if (oc.indexOf("showLoginPanel('access')") >= 0 || oc.indexOf('showLoginPanel("access")') >= 0 || text === 'entrar') {
        btn.__tchiloBound = true;
        btn.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            try {
              if (typeof showLoginPanel === 'function') showLoginPanel('access');
              else if (typeof showLoginHome === 'function') showLoginHome();
            } catch (err) {
              console.warn(err);
            }
          },
          true
        );
      }

      if (
        oc.indexOf("showLoginPanel('signup')") >= 0 ||
        oc.indexOf('showLoginPanel("signup")') >= 0 ||
        text.indexOf('criar conta') >= 0
      ) {
        btn.__tchiloBound = true;
        btn.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            try {
              if (typeof showLoginPanel === 'function') showLoginPanel('signup');
            } catch (err) {
              console.warn(err);
            }
          },
          true
        );
      }
    });
  }

  function ensureGateOnTop() {
    var gate = document.querySelector('.login-gate');
    if (!gate) return;
    try {
      gate.style.setProperty('z-index', '99999', 'important');
      gate.style.setProperty('pointer-events', 'auto', 'important');
    } catch (e) {}
  }

  function run() {
    injectCSS();
    ensureGateOnTop();
    bindButtons();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setInterval(run, 3000);
})();
