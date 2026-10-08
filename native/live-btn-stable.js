/**
 * Stop Live button from blinking + topbar LIVE logo
 * - dedupe profile buttons
 * - block aggressive inject intervals
 * - LIVE icon: red pill, height 32px (not huge black box)
 */
(function () {
  'use strict';
  if (window.__tchiloLiveBtnStableV3) return;
  window.__tchiloLiveBtnStableV3 = true;
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
  setTimeout(ensureOnce, 400);
  setTimeout(ensureOnce, 1500);

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

/* Topbar LIVE logo — red pill, tamanho normal */
(function () {
  'use strict';
  if (window.__tchiloLiveLogoV3) return;
  window.__tchiloLiveLogoV3 = true;

  var LIVE_SRC = 'live-icon.svg?v=3';

  function applyLiveLogo() {
    try {
      var img = document.querySelector('.topbar .logo-img, .topbar img.logo-img');
      if (!img) return;
      if (img.getAttribute('src') && img.getAttribute('src').indexOf('live-icon.svg') >= 0 && img.style.height === '32px') return;
      img.src = LIVE_SRC;
      img.alt = 'LIVE';
      img.title = 'Lives';
      img.style.cssText = 'cursor:pointer;height:32px;width:auto;max-height:32px;object-fit:contain;display:block;';
      img.setAttribute('role', 'button');
      if (!img.__liveClick) {
        img.__liveClick = true;
        img.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.tchiloOpenLiveSetup === 'function') window.tchiloOpenLiveSetup();
          else if (typeof window.openLiveScreen === 'function') window.openLiveScreen();
          else if (typeof window.openSetup === 'function') window.openSetup();
          else alert('Lives — em breve.');
        });
      }
    } catch (err) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyLiveLogo);
  else applyLiveLogo();
  setTimeout(applyLiveLogo, 200);
  setTimeout(applyLiveLogo, 900);
})();
