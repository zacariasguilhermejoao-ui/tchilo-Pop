/**
 * Tchilo UI Unlock v2 — ultra
 * Mata overlays (storyViewer, loginGate, sheets) e restaura cliques
 */
(function () {
  'use strict';
  if (window.__tchiloUiUnlockV2) return;
  window.__tchiloUiUnlockV2 = true;
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
      /* Login gate morto com sessao */
      'body.tchilo-session-on .login-gate,body.tchilo-session-on #loginGate{' +
      'display:none!important;pointer-events:none!important;visibility:hidden!important;z-index:-1!important;}' +
      '.login-gate.hidden,#loginGate.hidden{' +
      'display:none!important;pointer-events:none!important;visibility:hidden!important;z-index:-1!important;}' +
      /* Story viewer FECHADO nunca cobre a app */
      '#storyViewer:not(.open),.story-viewer:not(.open){' +
      'display:none!important;pointer-events:none!important;visibility:hidden!important;z-index:-1!important;opacity:0!important;}' +
      /* Chrome clicavel com sessao */
      'body.tchilo-session-on .navbar,body.tchilo-session-on .navbar *,' +
      'body.tchilo-session-on .topbar,body.tchilo-session-on .topbar *,' +
      'body.tchilo-session-on .nav-item,body.tchilo-session-on .nav-post,' +
      'body.tchilo-session-on .icon-btn,body.tchilo-session-on .logo-img{' +
      'pointer-events:auto!important;cursor:pointer!important;}' +
      'body.tchilo-session-on .navbar{' +
      'display:flex!important;opacity:1!important;visibility:visible!important;' +
      'transform:none!important;height:auto!important;max-height:none!important;}' +
      'body.tchilo-session-on.tchilo-logged-out .navbar{' +
      'display:flex!important;pointer-events:auto!important;opacity:1!important;visibility:visible!important;}' +
      'body.tchilo-session-on #appFrame,body.tchilo-session-on #feedList,body.tchilo-session-on #screen-feed{' +
      'pointer-events:auto!important;}' +
      /* Sheets fechados */
      '.sheet:not(.open),#tchiloModalHost:not(.open){' +
      'pointer-events:none!important;}' ;
  }

  function killEl(el) {
    if (!el) return;
    try {
      el.classList.remove('open');
      el.classList.add('hidden');
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('z-index', '-1', 'important');
      el.style.setProperty('opacity', '0', 'important');
    } catch (e) {}
  }

  function killOverlays() {
    try {
      /* Story viewer se nao estiver open de proposito */
      var sv = document.getElementById('storyViewer');
      if (sv && !sv.classList.contains('open')) killEl(sv);

      if (hasSession()) {
        killEl(document.getElementById('loginGate'));
        document.querySelectorAll('.login-gate').forEach(killEl);
      }

      /* Sheets e modais fechados */
      document.querySelectorAll('.sheet').forEach(function (el) {
        if (!el.classList.contains('open') && !el.classList.contains('show')) {
          el.style.setProperty('pointer-events', 'none', 'important');
        }
      });

      /* Qualquer fixed full-screen transparente a bloquear */
      document.querySelectorAll('body > div, #appFrame > div').forEach(function (el) {
        try {
          if (el.id === 'appFrame' || el.id === 'feedList') return;
          if (el.classList && el.classList.contains('navbar')) return;
          if (el.classList && el.classList.contains('screen')) return;
          var st = window.getComputedStyle(el);
          if (st.position !== 'fixed') return;
          var zi = parseInt(st.zIndex, 10) || 0;
          if (zi < 50) return;
          var r = el.getBoundingClientRect();
          if (r.width < window.innerWidth * 0.85 || r.height < window.innerHeight * 0.85) return;
          if (st.pointerEvents === 'none') return;
          if (st.display === 'none' || st.visibility === 'hidden') return;
          /* se esta invisivel ou vazio e nao e login/story open */
          var op = parseFloat(st.opacity);
          var isOpen = el.classList.contains('open') || el.classList.contains('show');
          if (isOpen) return;
          if (el.id === 'storyViewer' || el.id === 'loginGate' || (el.classList && el.classList.contains('login-gate'))) {
            killEl(el);
            return;
          }
          if (op === 0 || el.getAttribute('aria-hidden') === 'true') {
            el.style.setProperty('pointer-events', 'none', 'important');
          }
        } catch (e1) {}
      });
    } catch (e) {}
  }

  function restoreChrome() {
    try {
      var b = document.body;
      if (hasSession()) {
        b.classList.add('tchilo-session-on');
        b.classList.remove('tchilo-logged-out');
        b.classList.remove('login-locked');
        b.classList.remove('legal-screen-open');
        b.classList.remove('legal-from-login');
        b.classList.remove('tchilo-no-bottom-nav');
        b.style.overflow = '';
        b.style.position = '';
        b.style.pointerEvents = '';
      }
      var nav = document.querySelector('.navbar');
      if (nav && hasSession()) {
        nav.style.setProperty('display', 'flex', 'important');
        nav.style.setProperty('pointer-events', 'auto', 'important');
        nav.style.setProperty('opacity', '1', 'important');
        nav.style.setProperty('visibility', 'visible', 'important');
        nav.style.setProperty('transform', 'none', 'important');
        nav.removeAttribute('data-legal-hidden');
      }
      document.querySelectorAll('.nav-item,.nav-post,.icon-btn,.logo-img,.topbar').forEach(function (el) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
      });
    } catch (e) {}
  }

  function ensureFeed() {
    if (!hasSession()) return;
    try {
      if (typeof goTo === 'function') {
        var a = document.querySelector('.screen.active');
        if (!a || a.id === 'screen-feed') goTo('feed');
      }
    } catch (e) {}
    try {
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e2) {}
  }

  function unlock() {
    injectCSS();
    if (!hasSession()) {
      try { document.body.classList.remove('tchilo-session-on'); } catch (e) {}
      return;
    }
    restoreChrome();
    killOverlays();
    ensureFeed();
  }

  window.tchiloUiUnlock = unlock;

  unlock();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', unlock);
  [50, 200, 600, 1500, 3000, 5000].forEach(function (ms) {
    setTimeout(unlock, ms);
  });

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
      var sv = document.getElementById('storyViewer');
      if (sv && !sv.classList.contains('open')) {
        var pe = window.getComputedStyle(sv).pointerEvents;
        if (pe !== 'none') unlock();
      }
    });
    mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
  } catch (e) {}
})();
