/**
 * Stop Live button from blinking — dedupe + no re-inject loops
 */
(function () {
  'use strict';
  if (window.__tchiloLiveBtnStable) return;
  window.__tchiloLiveBtnStable = true;

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
    } catch (e) {}
  }

  ensureOnce();
  [200, 800, 2000].forEach(function (ms) {
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
