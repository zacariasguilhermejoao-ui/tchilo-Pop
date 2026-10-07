/**
 * Tchilo — botões Entrar / Criar conta (home) + painéis de login
 * Não intercepta submit do formulário.
 */
(function () {
  'use strict';
  if (window.__tchiloLoginClickFixV3) return;
  window.__tchiloLoginClickFixV3 = true;

  function injectCSS() {
    if (document.getElementById('tchiloLoginClickCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloLoginClickCSS';
    st.textContent =
      '.login-gate{z-index:99999!important;pointer-events:auto!important;}' +
      '.login-gate button,.login-gate a,.login-gate input,.login-gate select,' +
      '.login-gate .login-create,.login-gate .login-button,' +
      '.login-gate [onclick*="showLoginPanel"]{' +
      'pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;}' +
      '.login-gate.panel-open #accessPanel,.login-gate.panel-open #signupPanel,' +
      '.login-gate.panel-open #recoverPanel,.login-gate.panel-open #recoverNewPassPanel{' +
      'pointer-events:auto!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function openPanel(name) {
    try {
      if (typeof showLoginPanel === 'function') {
        showLoginPanel(name);
        return true;
      }
    } catch (e) {}
    try {
      var gate = document.querySelector('.login-gate');
      if (gate) {
        gate.classList.add('panel-open');
        gate.querySelectorAll('.login-panel,.signup-panel-wide').forEach(function (p) {
          p.classList.remove('active');
        });
        var map = {
          access: 'accessPanel',
          signup: 'signupPanel',
          recover: 'recoverPanel',
          'recover-new': 'recoverNewPassPanel'
        };
        var id = map[name] || 'accessPanel';
        var el = document.getElementById(id);
        if (el) el.classList.add('active');
      }
    } catch (e2) {}
    return false;
  }

  function bindHomeButtons() {
    var gate = document.querySelector('.login-gate');
    if (!gate) return;

    var candidates = gate.querySelectorAll(
      'button, a, [role="button"], .login-create, .login-button'
    );
    candidates.forEach(function (btn) {
      if (btn.__tchiloBoundV3) return;
      if (btn.type === 'submit') return;

      var oc = (btn.getAttribute('onclick') || '') + ' ' + (btn.textContent || '');
      var label = (btn.textContent || '').trim().toLowerCase();

      var target = null;
      if (
        oc.indexOf("showLoginPanel('access')") >= 0 ||
        oc.indexOf('showLoginPanel("access")') >= 0 ||
        label === 'entrar' ||
        /^entrar\b/.test(label)
      ) {
        target = 'access';
      } else if (
        oc.indexOf("showLoginPanel('signup')") >= 0 ||
        oc.indexOf('showLoginPanel("signup")') >= 0 ||
        label.indexOf('criar conta') >= 0 ||
        label.indexOf('criar') >= 0
      ) {
        target = 'signup';
      } else if (
        oc.indexOf("showLoginPanel('recover')") >= 0 ||
        oc.indexOf('showLoginPanel("recover")') >= 0
      ) {
        target = 'recover';
      }

      if (!target) return;

      btn.__tchiloBoundV3 = true;
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';

      btn.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          openPanel(target);
        },
        true
      );
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
  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(run, 2000);

  try {
    var mo = new MutationObserver(function () {
      bindHomeButtons();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
