/**
 * Stop Live button from blinking on profile
 * - dedupe buttons
 * - block setInterval that re-injects Live
 * NÃO substitui o logo do topbar (logo original fica)
 */
(function () {
  'use strict';
  if (window.__tchiloLiveBtnStableV4) return;
  window.__tchiloLiveBtnStableV4 = true;
  window.__tchiloLiveBtnStable = true;

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
