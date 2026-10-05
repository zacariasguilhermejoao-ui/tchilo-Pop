/**
 * Stop Live button from blinking
 * - dedupe buttons
 * - block setInterval that re-injects Live
 */
(function () {
  'use strict';
  if (window.__tchiloLiveBtnStableV2) return;
  window.__tchiloLiveBtnStableV2 = true;
  window.__tchiloLiveBtnStable = true;

  /* Intercept setInterval used by old live.js inject loop */
  var _si = window.setInterval;
  window.setInterval = function (fn, ms) {
    try {
      var src = fn && fn.toString ? fn.toString() : '';
      if (
        ms &&
        ms <= 2000 &&
        (/injectProfileButton/.test(src) ||
          (/data-tchilo-live/.test(src) && /Iniciar Live/.test(src)) ||
          (/profile-actions/.test(src) && /Iniciar Live/.test(src)))
      ) {
        console.log('[live-stable] blocked inject interval', ms);
        return 0;
      }
    } catch (e) {}
    return _si.apply(this, arguments);
  };

  function ensureOnce() {
    try {
      var actions = document.querySelector('#profileBody .profile-actions');
      if (!actions) return;
      var existing = actions.querySelectorAll('[data-tchilo-live]');
      for (var i = 1; i < existing.length; i++) {
        try {
          existing[i].remove();
        } catch (e) {}
      }
    } catch (e2) {}
  }

  ensureOnce();
  [300, 1000, 2500].forEach(function (ms) {
    setTimeout(ensureOnce, ms);
  });

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__liveStable) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(ensureOnce, 60);
      return r;
    };
    window.renderProfile.__liveStable = true;
  }
})();

/* Also replace topbar logo with LIVE pill icon (user request) */
(function () {
  'use strict';
  if (window.__tchiloLiveLogoV1) return;
  window.__tchiloLiveLogoV1 = true;

  function applyLiveLogo() {
    try {
      var img = document.querySelector('.topbar .logo-img, .topbar img.logo-img');
      if (!img) return;
      img.src = 'live-icon.svg';
      img.alt = 'LIVE';
      img.title = 'Lives';
      img.style.cursor = 'pointer';
      img.style.height = '28px';
      img.style.width = 'auto';
      img.setAttribute('role', 'button');
      img.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.tchiloOpenLiveSetup === 'function') {
          window.tchiloOpenLiveSetup();
        } else if (typeof window.openLiveScreen === 'function') {
          window.openLiveScreen();
        } else if (typeof window.openSetup === 'function') {
          window.openSetup();
        } else {
          alert('Lives — em breve. (botão CRIAR LIVE aparece após entrar)');
        }
      };
    } catch (err) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLiveLogo);
  } else {
    applyLiveLogo();
  }
  [150, 600, 1500, 3000].forEach(function (ms) {
    setTimeout(applyLiveLogo, ms);
  });
})();
