/**
 * Perfil — botão Iniciar Live
 * Garante que data-tchilo-live abre o setup (CDN live.js)
 */
(function () {
  'use strict';
  if (window.__tchiloProfileLiveV1) return;
  window.__tchiloProfileLiveV1 = true;

  function ensureLiveScript(cb) {
    if (typeof window.tchiloOpenLiveSetup === 'function') {
      cb && cb();
      return;
    }
    if (document.querySelector('script[src*="tchilo-live.js"][data-profile-live]')) {
      setTimeout(function () {
        cb && cb();
      }, 800);
      return;
    }
    var s = document.createElement('script');
    s.src =
      'https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@bd7604032eaf1eb68f4697e7a4a7f5e43f3cdfa6/native/tchilo-live.js';
    s.async = true;
    s.setAttribute('data-profile-live', '1');
    s.onload = function () {
      try {
        if (!window.tchiloOpenLiveSetup && typeof window.openSetup === 'function') {
          window.tchiloOpenLiveSetup = window.openSetup;
        }
      } catch (e) {}
      cb && cb();
    };
    s.onerror = function () {
      cb && cb();
    };
    document.head.appendChild(s);
  }

  function openLive() {
    try {
      if (typeof window.tchiloOpenLiveSetup === 'function') {
        window.tchiloOpenLiveSetup();
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.openSetup === 'function') {
        window.openSetup();
        return;
      }
    } catch (e2) {}
    try {
      if (typeof showToast === 'function') showToast('A carregar live…');
    } catch (e3) {}
    ensureLiveScript(function () {
      try {
        if (typeof window.tchiloOpenLiveSetup === 'function') window.tchiloOpenLiveSetup();
        else if (typeof window.openSetup === 'function') window.openSetup();
        else if (typeof showToast === 'function') showToast('Live indisponível. Atualiza a página.');
      } catch (e4) {}
    });
  }

  window.tchiloOpenLiveSetup = window.tchiloOpenLiveSetup || openLive;

  function bind() {
    try {
      document.querySelectorAll('[data-tchilo-live], button.profile-btn').forEach(function (btn) {
        var label = (btn.textContent || '').trim().toLowerCase();
        var isLive =
          btn.hasAttribute('data-tchilo-live') ||
          label.indexOf('live') >= 0 ||
          label.indexOf('iniciar live') >= 0;
        if (!isLive) return;
        if (btn.__tchiloProfileLiveBound) return;
        btn.__tchiloProfileLiveBound = true;
        btn.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            openLive();
          },
          true
        );
      });
    } catch (e) {}
  }

  ensureLiveScript();
  bind();
  [300, 1000, 2500].forEach(function (ms) {
    setTimeout(bind, ms);
  });

  try {
    if (typeof window.renderProfile === 'function' && !window.renderProfile.__liveBind) {
      var rp = window.renderProfile;
      window.renderProfile = function () {
        var r = rp.apply(this, arguments);
        setTimeout(bind, 50);
        setTimeout(bind, 300);
        return r;
      };
      window.renderProfile.__liveBind = true;
    }
  } catch (e) {}

  try {
    new MutationObserver(function () {
      bind();
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (e2) {}
})();
