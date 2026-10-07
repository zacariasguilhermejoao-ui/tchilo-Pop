/**
 * Tchilo UI Unlock v1
 * Corrige: icones nao clicaveis + feed vazio apos login
 * Remove overlays, classes bloqueadoras e forca render do feed
 */
(function () {
  'use strict';
  if (window.__tchiloUiUnlockV1) return;
  window.__tchiloUiUnlockV1 = true;

  function hasSession() {
    try {
      if (typeof getSession === 'function') {
        var s = getSession();
        if (s && (s.id || s.username || s.email)) return true;
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem('tchilo_session');
      if (!raw) return false;
      var o = JSON.parse(raw);
      return !!(o && (o.id || o.username || o.email));
    } catch (e2) {
      return false;
    }
  }

  function injectCSS() {
    var id = 'tchiloUiUnlockCSS';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* Login gate nunca bloqueia quando escondido */
      '.login-gate.hidden,#loginGate.hidden{' +
      'display:none!important;pointer-events:none!important;visibility:hidden!important;z-index:-1!important;}' +
      /* Com sessao: gate fora de jogo */
      'body.tchilo-session-on .login-gate,body.tchilo-session-on #loginGate{' +
      'display:none!important;pointer-events:none!important;visibility:hidden!important;z-index:-1!important;}' +
      /* Nunca pointer-events none no chrome principal com sessao */
      'body.tchilo-session-on .navbar,body.tchilo-session-on .navbar *,' +
      'body.tchilo-session-on .topbar,body.tchilo-session-on .topbar *,' +
      'body.tchilo-session-on .nav-item,body.tchilo-session-on .nav-post,' +
      'body.tchilo-session-on .icon-btn,body.tchilo-session-on .topbar-icons{' +
      'pointer-events:auto!important;visibility:visible!important;}' +
      'body.tchilo-session-on .navbar{' +
      'display:flex!important;opacity:1!important;height:auto!important;max-height:none!important;' +
      'transform:none!important;}' +
      /* Remover estados logged-out falsos */
      'body.tchilo-session-on.tchilo-logged-out .navbar{' +
      'display:flex!important;pointer-events:auto!important;opacity:1!important;' +
      'visibility:visible!important;height:auto!important;max-height:none!important;transform:none!important;}' +
      'body.tchilo-session-on #appFrame,body.tchilo-session-on .frame{' +
      'pointer-events:auto!important;}' +
      'body.tchilo-session-on #feedList,body.tchilo-session-on #screen-feed{' +
      'pointer-events:auto!important;visibility:visible!important;}';
  }

  function killGate() {
    try {
      var g = document.getElementById('loginGate');
      if (!g) return;
      g.classList.add('hidden');
      g.style.setProperty('display', 'none', 'important');
      g.style.setProperty('pointer-events', 'none', 'important');
      g.style.setProperty('visibility', 'hidden', 'important');
      g.style.setProperty('z-index', '-1', 'important');
      g.setAttribute('aria-hidden', 'true');
    } catch (e) {}
  }

  function clearBlockingClasses() {
    try {
      var b = document.body;
      b.classList.remove('login-locked');
      b.classList.remove('legal-screen-open');
      b.classList.remove('legal-from-login');
      b.classList.remove('tchilo-logged-out');
      b.classList.remove('tchilo-no-bottom-nav');
      b.style.overflow = '';
      b.style.position = '';
      b.style.pointerEvents = '';
      b.style.touchAction = '';
      b.style.width = '';
      b.style.height = '';
      if (hasSession()) b.classList.add('tchilo-session-on');
      else b.classList.remove('tchilo-session-on');
    } catch (e) {}
  }

  function unlockChrome() {
    try {
      var selectors = [
        '.navbar',
        'nav.navbar',
        '.topbar',
        '.stories',
        '#appFrame',
        '.frame',
        '#screen-feed',
        '#feedList',
        '.nav-item',
        '.nav-post',
        '.icon-btn',
        '.topbar-icons',
        '.logo-img'
      ];
      selectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          try {
            el.style.removeProperty('pointer-events');
            el.style.removeProperty('display');
            el.style.removeProperty('visibility');
            el.style.removeProperty('opacity');
            el.style.removeProperty('transform');
            el.style.removeProperty('height');
            el.style.removeProperty('max-height');
            el.style.pointerEvents = 'auto';
          } catch (e) {}
        });
      });
      var nav = document.querySelector('.navbar');
      if (nav && hasSession()) {
        nav.style.setProperty('display', 'flex', 'important');
        nav.style.setProperty('pointer-events', 'auto', 'important');
        nav.style.setProperty('opacity', '1', 'important');
        nav.style.setProperty('visibility', 'visible', 'important');
        nav.style.setProperty('transform', 'none', 'important');
        nav.removeAttribute('data-legal-hidden');
      }
    } catch (e) {}
  }

  function killStuckOverlays() {
    try {
      /* Camadas full-screen transparentes que bloqueiam cliques */
      document.querySelectorAll('div,section,aside').forEach(function (el) {
        try {
          if (el.id === 'loginGate' || (el.classList && el.classList.contains('login-gate'))) return;
          if (el.id === 'tchiloModalHost' || el.id === 'imageFullscreen') return;
          var st = window.getComputedStyle(el);
          if (st.position !== 'fixed' && st.position !== 'absolute') return;
          var zi = parseInt(st.zIndex, 10) || 0;
          if (zi < 500) return;
          var r = el.getBoundingClientRect();
          if (r.width < window.innerWidth * 0.9 || r.height < window.innerHeight * 0.9) return;
          /* overlay quase invisivel a bloquear */
          var op = parseFloat(st.opacity);
          var bg = st.backgroundColor || '';
          var pe = st.pointerEvents;
          if (pe === 'none') return;
          var transparent =
            op === 0 ||
            bg === 'transparent' ||
            bg === 'rgba(0, 0, 0, 0)' ||
            bg === 'rgba(0,0,0,0)';
          var empty = !el.innerText || el.innerText.trim().length < 2;
          if (transparent || (empty && zi >= 9999)) {
            el.style.setProperty('pointer-events', 'none', 'important');
            if (transparent && empty) {
              el.style.setProperty('display', 'none', 'important');
            }
          }
        } catch (e1) {}
      });
    } catch (e) {}
  }

  function ensureFeed() {
    if (!hasSession()) return;
    try {
      if (typeof goTo === 'function') {
        var active = document.querySelector('.screen.active');
        if (!active || active.id === 'screen-feed' || !active.id) {
          goTo('feed');
        }
      }
    } catch (e) {}
    try {
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e2) {}
    try {
      if (typeof renderStories === 'function') renderStories();
    } catch (e3) {}
    try {
      var feed = document.getElementById('feedList');
      if (feed) {
        feed.style.pointerEvents = 'auto';
        feed.style.visibility = 'visible';
        feed.style.display = '';
      }
      var screen = document.getElementById('screen-feed');
      if (screen) {
        screen.classList.add('active');
        screen.style.pointerEvents = 'auto';
      }
    } catch (e4) {}
  }

  function unlock() {
    injectCSS();
    if (!hasSession()) {
      try {
        document.body.classList.remove('tchilo-session-on');
      } catch (e) {}
      return;
    }
    clearBlockingClasses();
    killGate();
    unlockChrome();
    killStuckOverlays();
    ensureFeed();
  }

  /* Expor para login fix chamar */
  window.tchiloUiUnlock = unlock;

  unlock();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', unlock);
  }
  setTimeout(unlock, 50);
  setTimeout(unlock, 200);
  setTimeout(unlock, 600);
  setTimeout(unlock, 1500);
  setTimeout(unlock, 3000);
  setTimeout(unlock, 5000);

  /* Observer: se alguem voltar a meter logged-out ou gate, desbloqueia */
  try {
    var mo = new MutationObserver(function () {
      if (!hasSession()) return;
      var b = document.body;
      if (
        b.classList.contains('tchilo-logged-out') ||
        b.classList.contains('login-locked') ||
        b.classList.contains('legal-screen-open')
      ) {
        unlock();
      }
      var g = document.getElementById('loginGate');
      if (g && !g.classList.contains('hidden')) {
        unlock();
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style']
    });
  } catch (e) {}
})();
