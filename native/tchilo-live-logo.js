/**
 * tchilo-Pop — topbar LIVE logo (red pill)
 * Alinhado com live-btn-stable v3
 */
(function () {
  'use strict';
  if (window.__tchiloLiveLogoV3) return;
  window.__tchiloLiveLogoV3 = true;

  function apply() {
    try {
      var img = document.querySelector('.topbar .logo-img, .topbar img.logo-img');
      if (!img) return;
      img.src = 'live-icon.svg?v=3';
      img.alt = 'LIVE';
      img.title = 'Lives';
      img.style.cssText = 'cursor:pointer;height:32px;width:auto;max-height:32px;object-fit:contain;display:block;';
      img.setAttribute('role', 'button');
      if (!img.__liveClickBound) {
        img.__liveClickBound = true;
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  setTimeout(apply, 300);
  setTimeout(apply, 1000);
})();
