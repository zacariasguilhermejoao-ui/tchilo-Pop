/*
 * Fix definitivo: Termos / Privacidade / Segurança infantil / Diretrizes
 * NUNCA mostram a barra de baixo (feed, mensagens, +, likes, perfil).
 * Funciona na web e no app nativo (Android / iOS).
 */
(function () {
  'use strict';

  var LEGAL_SCREENS = {
    terms: 1,
    privacy: 1,
    child: 1,
    community: 1,
    about: 1
  };

  function injectCss() {
    if (document.getElementById('tchilo-legal-navbar-fix')) return;
    var style = document.createElement('style');
    style.id = 'tchilo-legal-navbar-fix';
    style.textContent = [
      'body.legal-screen-open .navbar,',
      'body.legal-from-login .navbar,',
      'body.legal-screen-open .topbar,',
      'body.legal-from-login .topbar,',
      'body.legal-screen-open .stories,',
      'body.legal-from-login .stories {',
      '  display: none !important;',
      '  visibility: hidden !important;',
      '  pointer-events: none !important;',
      '  opacity: 0 !important;',
      '  transform: translateY(120%) !important;',
      '  height: 0 !important;',
      '  max-height: 0 !important;',
      '  overflow: hidden !important;',
      '}',
      'body.legal-screen-open .screen.active,',
      'body.legal-from-login .screen.active {',
      '  padding-bottom: 0 !important;',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function isLegalScreen(name) {
    if (!name) return false;
    name = String(name).replace(/^screen-/, '');
    return !!LEGAL_SCREENS[name];
  }

  function getActiveScreenName() {
    var active = document.querySelector('.screen.active');
    if (!active || !active.id) return '';
    return active.id.replace(/^screen-/, '');
  }

  function hideNav() {
    document.body.classList.add('legal-screen-open');
    var nav = document.querySelector('.navbar');
    if (nav) {
      nav.style.setProperty('display', 'none', 'important');
      nav.setAttribute('data-legal-hidden', '1');
    }
    var topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.setProperty('display', 'none', 'important');
    var stories = document.querySelector('.stories');
    if (stories) stories.style.setProperty('display', 'none', 'important');
  }

  function showNav() {
    document.body.classList.remove('legal-screen-open');
    document.body.classList.remove('legal-from-login');
    var nav = document.querySelector('.navbar');
    if (nav) {
      nav.style.removeProperty('display');
      nav.removeAttribute('data-legal-hidden');
    }
    var topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.removeProperty('display');
    var stories = document.querySelector('.stories');
    if (stories) stories.style.removeProperty('display');
  }

  function syncNavWithScreen() {
    var name = getActiveScreenName();
    if (isLegalScreen(name) || document.body.classList.contains('legal-from-login')) {
      hideNav();
      return;
    }
    var gate = document.getElementById('loginGate');
    var gateOpen = gate && !gate.classList.contains('hidden');
    if (gateOpen) {
      hideNav();
      return;
    }
    showNav();
  }

  function patchGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__legalNavPatched) return;
    var orig = window.goTo;
    window.goTo = function (name) {
      var result = orig.apply(this, arguments);
      try {
        if (isLegalScreen(name)) hideNav();
        else if (!document.body.classList.contains('legal-from-login')) {
          var gate = document.getElementById('loginGate');
          if (!gate || gate.classList.contains('hidden')) showNav();
        }
        setTimeout(syncNavWithScreen, 0);
        setTimeout(syncNavWithScreen, 50);
      } catch (e) {}
      return result;
    };
    window.goTo.__legalNavPatched = true;
  }

  function patchLegalFromLogin() {
    window.openLegalFromLogin = function (name) {
      try {
        window.legalReturnScreen = 'login';
      } catch (e) {}
      document.body.classList.add('legal-from-login');
      var gate = document.getElementById('loginGate');
      if (gate) gate.classList.add('hidden');
      document.body.style.overflow = '';
      hideNav();
      if (typeof window.goTo === 'function') window.goTo(name);
      setTimeout(hideNav, 0);
      setTimeout(hideNav, 50);
      setTimeout(hideNav, 200);
    };

    window.legalBack = function () {
      var ret = window.legalReturnScreen;
      if (ret === 'login') {
        document.querySelectorAll('.screen').forEach(function (s) {
          s.classList.remove('active');
        });
        var gate = document.getElementById('loginGate');
        if (gate) gate.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.body.classList.remove('legal-from-login');
        document.body.classList.remove('legal-screen-open');
        hideNav();
        try {
          if (typeof playLoginVideo === 'function') playLoginVideo();
        } catch (e) {}
        try {
          window.legalReturnScreen = 'settings';
        } catch (e2) {}
      } else {
        document.body.classList.remove('legal-from-login');
        if (typeof window.goTo === 'function') {
          window.goTo(ret || 'settings-legal');
        }
        setTimeout(syncNavWithScreen, 0);
      }
    };
  }

  function observeScreens() {
    try {
      var root = document.getElementById('appFrame') || document.body;
      var obs = new MutationObserver(function () {
        syncNavWithScreen();
      });
      obs.observe(root, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
      });
    } catch (e) {}
  }

  function patch() {
    injectCss();
    patchGoTo();
    patchLegalFromLogin();
    syncNavWithScreen();
  }

  function boot() {
    patch();
    observeScreens();
    setTimeout(patch, 400);
    setTimeout(patch, 1200);
    setTimeout(syncNavWithScreen, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
