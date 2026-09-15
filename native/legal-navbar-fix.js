/*
 * Fix: ao abrir Termos / Privacidade / etc. a partir do ecrã de login,
 * a barra de baixo (feed, mensagens, +, likes, perfil) NÃO pode aparecer.
 * Também melhora o botão voltar do Android nesses ecrãs.
 */
(function () {
  'use strict';

  function hideAppChrome() {
    document.body.classList.add('legal-from-login');
    var nav = document.querySelector('.navbar');
    if (nav) {
      nav.style.display = 'none';
      nav.setAttribute('data-legal-hidden', '1');
    }
    var topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.display = 'none';
    var stories = document.querySelector('.stories');
    if (stories) stories.style.display = 'none';
    var appFrame = document.getElementById('appFrame');
    if (appFrame) appFrame.classList.add('chrome-hidden');
  }

  function showAppChromeIfLoggedIn() {
    document.body.classList.remove('legal-from-login');
    var nav = document.querySelector('.navbar');
    if (nav && nav.getAttribute('data-legal-hidden') === '1') {
      nav.style.display = '';
      nav.removeAttribute('data-legal-hidden');
    }
    var topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.display = '';
    var stories = document.querySelector('.stories');
    if (stories) stories.style.display = '';
    // Só tira chrome-hidden se o utilizador estiver logado e no feed normal
    try {
      if (typeof getSession === 'function' && getSession()) {
        var appFrame = document.getElementById('appFrame');
        if (appFrame) appFrame.classList.remove('chrome-hidden');
      }
    } catch (e) {}
  }

  // CSS de segurança (mesmo se JS correr tarde)
  function injectCss() {
    if (document.getElementById('tchilo-legal-navbar-fix')) return;
    var style = document.createElement('style');
    style.id = 'tchilo-legal-navbar-fix';
    style.textContent =
      'body.legal-from-login .navbar,' +
      'body.legal-from-login .topbar,' +
      'body.legal-from-login .stories,' +
      'body.legal-from-login .nav-post,' +
      '#appFrame.legal-no-nav .navbar{display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;}' +
      'body.legal-from-login .screen{padding-bottom:0!important;}';
    document.head.appendChild(style);
  }

  function patch() {
    injectCss();

    // Guardar originais se existirem
    var origOpen = window.openLegalFromLogin;
    var origBack = window.legalBack;

    window.openLegalFromLogin = function (name) {
      try {
        window.legalReturnScreen = 'login';
      } catch (e) {}
      var gate = document.getElementById('loginGate');
      if (gate) gate.classList.add('hidden');
      document.body.style.overflow = '';
      hideAppChrome();
      if (typeof window.goTo === 'function') {
        window.goTo(name);
      } else if (typeof origOpen === 'function') {
        origOpen(name);
      }
      // Re-aplicar após goTo (pode repor classes)
      setTimeout(hideAppChrome, 0);
      setTimeout(hideAppChrome, 50);
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
        showAppChromeIfLoggedIn();
        // chrome fica escondido atrás do login gate — ok
        try {
          if (typeof playLoginVideo === 'function') playLoginVideo();
        } catch (e) {}
        try {
          window.legalReturnScreen = 'settings';
        } catch (e2) {}
      } else if (typeof origBack === 'function') {
        origBack();
      } else if (typeof window.goTo === 'function') {
        window.goTo(ret || 'settings-legal');
      }
    };

    // Android hardware back: se estiver em legal a partir do login, volta ao login
    document.addEventListener(
      'backbutton',
      function (e) {
        if (document.body.classList.contains('legal-from-login')) {
          e.preventDefault();
          e.stopPropagation();
          window.legalBack();
          return false;
        }
      },
      true
    );

    // Capacitor App back button
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('backButton', function (data) {
          if (document.body.classList.contains('legal-from-login')) {
            window.legalBack();
            return;
          }
          // Se há ecrã com back-btn ativo (não feed principal), tenta voltar
          var active = document.querySelector('.screen.active');
          if (active && active.id && active.id !== 'screen-feed') {
            var backBtn = active.querySelector('.back-btn');
            if (backBtn) {
              backBtn.click();
              return;
            }
          }
          // Caso contrário deixa o sistema tratar (pode sair da app)
          if (data && data.canGoBack === false) {
            // opcional: minimizar em vez de sair — não forçamos
          }
        });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }
  // Patch again late in case index defines functions after our script
  setTimeout(patch, 500);
  setTimeout(patch, 1500);
})();
