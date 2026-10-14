/**
 * Login responsivo no telemóvel:
 * - Botões Entrar / Criar conta clicáveis de imediato
 * - Adia trabalho pesado enquanto o gate de login está visível
 */
(function () {
  'use strict';
  if (window.__tchiloLoginResponsiveV1) return;
  window.__tchiloLoginResponsiveV1 = true;

  // 1) CSS: botões sempre por cima e clicáveis
  if (!document.getElementById('tchilo-login-responsive-css')) {
    var st = document.createElement('style');
    st.id = 'tchilo-login-responsive-css';
    st.textContent = [
      '#loginGate, .login-gate, #screen-login, [data-login-gate] {',
      '  pointer-events: auto !important;',
      '  z-index: 99990 !important;',
      '}',
      '#loginGate button, .login-gate button, #screen-login button,',
      'button.login-btn, #btnEntrar, #btnCriarConta, #btnLogin, #btnSignup,',
      '.login-actions button, .auth-actions button {',
      '  pointer-events: auto !important;',
      '  touch-action: manipulation !important;',
      '  z-index: 99999 !important;',
      '  position: relative !important;',
      '  opacity: 1 !important;',
      '  visibility: visible !important;',
      '  -webkit-user-select: none !important;',
      '  user-select: none !important;',
      '}',
      '/* enquanto o gate está aberto, não deixar overlays bloquear */',
      'body.tchilo-login-open #loginGate ~ * {',
      '  pointer-events: none !important;',
      '}',
      'body.tchilo-login-open #loginGate, body.tchilo-login-open #loginGate * {',
      '  pointer-events: auto !important;',
      '}',
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  function isLoginVisible() {
    var gate =
      document.getElementById('loginGate') ||
      document.querySelector('.login-gate') ||
      document.getElementById('screen-login');
    if (!gate) {
      // heurística: botão Entrar visível
      var btns = document.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        var t = (btns[i].textContent || '').trim();
        if (t === 'Entrar' || t === 'Criar conta') {
          var r = btns[i].getBoundingClientRect();
          if (r.width > 0 && r.height > 0) return true;
        }
      }
      return false;
    }
    var style = window.getComputedStyle(gate);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    return true;
  }

  function unlockButtons() {
    document.querySelectorAll('button').forEach(function (btn) {
      var t = (btn.textContent || '').trim();
      if (t === 'Entrar' || t === 'Criar conta' || /entrar|criar conta|sign up|log in/i.test(t)) {
        btn.style.pointerEvents = 'auto';
        btn.style.zIndex = '99999';
        btn.disabled = false;
        btn.removeAttribute('disabled');
        btn.style.opacity = '1';
      }
    });
    if (isLoginVisible()) {
      document.body.classList.add('tchilo-login-open');
    } else {
      document.body.classList.remove('tchilo-login-open');
    }
  }

  // 2) Flag global: scripts pesados devem respeitar
  window.__tchiloLoginBusy = true;
  function markReady() {
    if (!isLoginVisible()) {
      window.__tchiloLoginBusy = false;
      document.body.classList.remove('tchilo-login-open');
    }
  }

  // 3) Desativar setInterval pesados no gate (não mexe em áudio/chamadas)
  var _si = window.setInterval;
  window.setInterval = function (fn, ms) {
    try {
      if (window.__tchiloLoginBusy && typeof fn === 'function') {
        var src = '';
        try { src = fn.toString() || ''; } catch (e) {}
        if (/inject|boot|ensure|patch|renderFeed|settings|boost|chip|logo|nav|hydrate|watchAssets|thinSvg|obs\.observe/i.test(src) &&
            !/pollIncoming|callId|webrtc|rtc|audio|ring/i.test(src)) {
          // adia até ao login
          return _si.call(this, function () {
            if (window.__tchiloLoginBusy) return;
            try { fn(); } catch (e2) {}
          }, Math.max(ms || 0, 5000));
        }
      }
    } catch (e3) {}
    return _si.apply(this, arguments);
  };

  unlockButtons();
  setTimeout(unlockButtons, 0);
  setTimeout(unlockButtons, 100);
  setTimeout(unlockButtons, 500);
  setTimeout(unlockButtons, 1500);
  setTimeout(markReady, 0);

  // quando o gate desaparece (login feito)
  try {
    var obs = new MutationObserver(function () {
      unlockButtons();
      markReady();
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  } catch (e) {}

  // hook hideLoginGate
  function patchHide() {
    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__responsive) {
      var orig = window.hideLoginGate;
      window.hideLoginGate = function () {
        window.__tchiloLoginBusy = false;
        document.body.classList.remove('tchilo-login-open');
        return orig.apply(this, arguments);
      };
      window.hideLoginGate.__responsive = true;
    }
  }
  patchHide();
  setTimeout(patchHide, 300);
  setTimeout(patchHide, 1200);

  console.log('[Tchilo] login-responsive: botões prioritários');
})();
