/**
 * Tchilo — só o botão da home "Entrar" / "Criar conta"
 * NÃO intercepta o submit do formulário de login
 */
(function () {
  'use strict';
  if (window.__tchiloLoginClickFixV2) return;
  window.__tchiloLoginClickFixV2 = true;

  function injectCSS() {
    if (document.getElementById('tchiloLoginClickCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloLoginClickCSS';
    st.textContent =
      '.login-gate{' +
      'z-index:99999!important;pointer-events:auto!important;}' +
      '.login-gate button, .login-gate a, .login-gate input, .login-gate select,' +
      '.login-gate .login-create, .login-gate .login-button{' +
      'pointer-events:auto!important;cursor:pointer!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function bindHomeButtons() {
    var gate = document.querySelector('.login-gate');
    if (!gate) return;

    /* Só botões com onclick explícito de navegação — nunca type=submit */
    gate.querySelectorAll('button[onclick], a[onclick]').forEach(function (btn) {
      if (btn.__tchiloBoundV2) return;
      if (btn.type === 'submit') return; /* formulário de login/cadastro */
      if (btn.classList && btn.classList.contains('login-button')) return;

      var oc = btn.getAttribute('onclick') || '';

      if (oc.indexOf("showLoginPanel('access')") >= 0 || oc.indexOf('showLoginPanel("access")') >= 0) {
        btn.__tchiloBoundV2 = true;
        btn.addEventListener(
          'click',
          function (e) {
            try {
              if (typeof showLoginPanel === 'function') showLoginPanel('access');
            } catch (err) {}
          },
          false
        );
      }

      if (oc.indexOf("showLoginPanel('signup')") >= 0 || oc.indexOf('showLoginPanel("signup")') >= 0) {
        btn.__tchiloBoundV2 = true;
        btn.addEventListener(
          'click',
          function (e) {
            try {
              if (typeof showLoginPanel === 'function') showLoginPanel('signup');
            } catch (err) {}
          },
          false
        );
      }
    });
  }

  function run() {
    injectCSS();
    bindHomeButtons();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 300);
  setTimeout(run, 1200);
})();
