/**
 * tchilo-login-gate-fix v2
 * - Mesma interface no site e no app (não altera o visual do login)
 * - Botões Entrar / Criar conta sempre clicáveis
 * - No nativo: só pausa o vídeo se o WebView estiver sob carga (não remove o layout)
 */
(function () {
  'use strict';
  if (window.__tchiloLoginGateFixV2) return;
  window.__tchiloLoginGateFixV2 = true;
  window.__tchiloLoginGateFixV1 = true;

  function isNative() {
    try {
      if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
        return !!window.Capacitor.isNativePlatform();
      }
    } catch (e) {}
    try {
      return !!(window.Capacitor && window.Capacitor.platform && window.Capacitor.platform !== 'web');
    } catch (e2) {}
    return false;
  }

  function hasSession() {
    try {
      var raw = localStorage.getItem('tchilo_session');
      if (!raw) return false;
      var o = JSON.parse(raw);
      return !!(o && (o.id || o.username || o.email));
    } catch (e) {
      return false;
    }
  }

  function injectCSS() {
    if (document.getElementById('tchilo-login-gate-fix-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-login-gate-fix-css';
    st.textContent =
      'body:not(.tchilo-session-on) #loginGate:not(.hidden),' +
      'body:not(.tchilo-session-on) .login-gate:not(.hidden){' +
      'display:flex!important;visibility:visible!important;opacity:1!important;' +
      'pointer-events:auto!important;z-index:2147483000!important;}' +
      '#loginGate .login-video,#loginGate .login-video-overlay,#loginGate video{' +
      'pointer-events:none!important;}' +
      '#loginGate button,#loginGate .login-button,#loginGate .login-create,' +
      '#loginGate a[onclick],#loginGate [onclick]{' +
      'pointer-events:auto!important;touch-action:manipulation!important;' +
      'cursor:pointer!important;position:relative;z-index:5!important;}' +
      '#loginGate input,#loginGate textarea,#loginGate select{' +
      'pointer-events:auto!important;-webkit-user-select:text!important;user-select:text!important;}' +
      'body:not(.tchilo-session-on) #busyOverlay,' +
      'body:not(.tchilo-session-on) .busy-overlay,' +
      'body:not(.tchilo-session-on) #storyViewer:not(.open){' +
      'pointer-events:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function softPauseVideoIfHeavy() {
    if (!isNative()) return;
    try {
      var v = document.getElementById('loginVideo') || document.querySelector('#loginGate video');
      if (!v) return;
      /* Mantém o vídeo visível (mesma UI); só evita autoplay infinito a consumir CPU */
      setTimeout(function () {
        try {
          if (v && !v.paused) v.pause();
        } catch (e) {}
      }, 8000);
    } catch (e2) {}
  }

  function clearFalseSessionClass() {
    if (hasSession()) return;
    try {
      document.body.classList.remove('tchilo-session-on');
      document.body.classList.add('tchilo-logged-out');
      document.body.classList.add('login-locked');
    } catch (e) {}
  }

  function ensureGateVisible() {
    if (hasSession()) return;
    var g = document.getElementById('loginGate');
    if (!g) return;
    try {
      g.classList.remove('hidden');
      g.style.setProperty('display', 'flex', 'important');
      g.style.setProperty('visibility', 'visible', 'important');
      g.style.setProperty('pointer-events', 'auto', 'important');
      g.style.setProperty('z-index', '2147483000', 'important');
      g.removeAttribute('aria-hidden');
    } catch (e) {}
  }

  function wireButtons() {
    var g = document.getElementById('loginGate');
    if (!g || g.getAttribute('data-lgf-wired') === '1') return;

    function openPanel(panel) {
      try {
        if (typeof window.showLoginPanel === 'function') {
          window.showLoginPanel(panel);
          return;
        }
      } catch (e) {
        console.warn('[login-gate-fix] showLoginPanel', e);
      }
    }

    g.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!t) return;
        var btn = t.closest ? t.closest('button, a, [role="button"]') : null;
        if (!btn || !g.contains(btn)) return;
        var label = (btn.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        var oc = btn.getAttribute('onclick') || '';
        if (/showLoginPanel\s*\(\s*['"]access['"]/.test(oc) || label === 'entrar') {
          ev.preventDefault();
          ev.stopPropagation();
          openPanel('access');
          return;
        }
        if (/showLoginPanel\s*\(\s*['"]signup['"]/.test(oc) || label === 'criar conta') {
          ev.preventDefault();
          ev.stopPropagation();
          openPanel('signup');
          return;
        }
      },
      true
    );

    g.setAttribute('data-lgf-wired', '1');
  }

  function run() {
    injectCSS();
    clearFalseSessionClass();
    ensureGateVisible();
    wireButtons();
    softPauseVideoIfHeavy();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  [50, 200, 600, 1500].forEach(function (ms) {
    setTimeout(run, ms);
  });
})();
