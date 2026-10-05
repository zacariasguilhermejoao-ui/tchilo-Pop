/**
 * tchilo-Pop — Replace topbar Tchilo logo with LIVE pill icon
 * and make it open the live setup.
 */
(function () {
  'use strict';
  if (window.__tchiloLiveLogoV1) return;
  window.__tchiloLiveLogoV1 = true;

  function apply() {
    try {
      var img = document.querySelector('.topbar .logo-img, .topbar img.logo-img');
      if (!img) return;
      // Use the exact user-provided LIVE icon
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
          alert('Lives — em breve. (CRIAR LIVE disponível após entrar)');
        }
      };
    } catch (err) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
  // Also after possible late renders
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(apply, ms);
  });
})();
