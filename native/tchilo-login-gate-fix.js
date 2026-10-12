/**
 * tchilo-login-gate-fix v1
 * - Botões Entrar / Criar conta sempre clicáveis no gate
 * - No Capacitor: pausa o vídeo de login (base64 pesado trava o WebView)
 * - Remove overlays que roubam toques
 * - Não marca sessão se não houver tchilo_session
 */
(function () {
  'use strict';
  if (window.__tchiloLoginGateFixV1) return;
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
    return /capacitor|android|iphone|ipad/i.test(navigator.userAgent || '');
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
      /* Gate visível e por cima de tudo quando NÃO há sessão */
      'body:not(.tchilo-session-on) #loginGate:not(.hidden),' +
      'body:not(.tchilo-session-on) .login-gate:not(.hidden){' +
      'display:flex!important;visibility:visible!important;opacity:1!important;' +
      'pointer-events:auto!important;z-index:2147483000!important;}' +
      'body:not(.tchilo-session-on) #loginGate:not(.hidden) *{' +
      'pointer-events:auto!important;}' +
      /* Vídeo nunca captura toques */
      '#loginGate .login-video,#loginGate .login-video-overlay,' +
      '#loginGate video{pointer-events:none!important;}' +
      /* Botões grandes e tocáveis */
      '#loginGate button,#loginGate .login-button,#loginGate .login-create,' +
      '#loginGate a[onclick],#loginGate [onclick]{' +
      'pointer-events:auto!important;touch-action:manipulation!important;' +
      'cursor:pointer!important;position:relative;z-index:5!important;' +
      '-webkit-tap-highlight-color:rgba(155,107,255,.25);}' +
      /* Inputs */
      '#loginGate input,#loginGate textarea,#loginGate select{' +
      'pointer-events:auto!important;-webkit-user-select:text!important;user-select:text!important;}' +
      /* No nativo: esconde vídeo para não colar */
      'html.tchilo-native #loginGate .login-video,' +
      'html.tchilo-native #loginGate video.login-video{' +
      'display:none!important;visibility:hidden!important;}' +
      'html.tchilo-native #loginGate{background:#0a0a0a!important;}' +
      /* Busy / overlays não cobrem o login */
      'body:not(.tchilo-session-on) #busyOverlay,' +
      'body:not(.tchilo-session-on) .busy-overlay,' +
      'body:not(.tchilo-session-on) #storyViewer:not(.open){' +
      'pointer-events:none!important;display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function stopLoginVideo() {
    try {
      var v = document.getElementById('loginVideo');
      if (!v) v = document.querySelector('#loginGate video');
      if (!v) return;
      try {
        v.pause();
      } catch (e) {}
      try {
        v.removeAttribute('autoplay');
        v.muted = true;
        v.src = '';
        v.removeAttribute('src');
        while (v.firstChild) v.removeChild(v.firstChild);
        v.load();
      } catch (e2) {}
      v.style.setProperty('display', 'none', 'important');
    } catch (e3) {}
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
      /* fallback mínimo */
      try {
        var access = document.getElementById('accessPanel');
        var signup = document.getElementById('signupPanel');
        var welcome = document.getElementById('loginWelcome');
        if (welcome) {
          welcome.style.setProperty('display', 'none', 'important');
          welcome.setAttribute('hidden', '');
        }
        if (panel === 'access' && access) {
          access.classList.add('active');
          access.style.setProperty('display', 'block', 'important');
          if (signup) {
            signup.classList.remove('active');
            signup.style.setProperty('display', 'none', 'important');
          }
        }
        if (panel === 'signup') {
          if (typeof window.tsuOpen === 'function') {
            try {
              window.tsuOpen();
              return;
            } catch (e2) {}
          }
          if (signup) {
            signup.classList.add('active');
            signup.style.setProperty('display', 'block', 'important');
          }
          if (access) {
            access.classList.remove('active');
            access.style.setProperty('display', 'none', 'important');
          }
        }
        g.classList.add('panel-open');
      } catch (e3) {}
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
    if (isNative()) {
      try {
        document.documentElement.classList.add('tchilo-native');
      } catch (e) {}
      stopLoginVideo();
    }
    clearFalseSessionClass();
    ensureGateVisible();
    wireButtons();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  [50, 200, 600, 1500].forEach(function (ms) {
    setTimeout(run, ms);
  });
})();
