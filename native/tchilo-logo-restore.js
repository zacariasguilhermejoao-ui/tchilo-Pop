/**
 * Restaura o logo original (logo.svg) no topbar.
 * O index tinha live-icon.svg com height 68px (bloco preto).
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV1) return;
  window.__tchiloLogoRestoreV1 = true;

  function restore() {
    try {
      var img = document.querySelector('.topbar .logo-img, .topbar img.logo-img');
      if (!img) return;
      var src = img.getAttribute('src') || '';
      if (src.indexOf('live-icon') >= 0 || src.indexOf('logo.svg') < 0) {
        img.src = 'logo.svg';
        img.alt = 'Tchilo';
        img.removeAttribute('title');
        img.removeAttribute('role');
        img.style.cssText = '';
        img.onclick = null;
      }
      // tamanho normal
      img.style.height = '';
      img.style.maxHeight = '36px';
      img.style.width = 'auto';
      img.style.objectFit = 'contain';
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore);
  else restore();
  setTimeout(restore, 100);
  setTimeout(restore, 500);
  setTimeout(restore, 1500);
})();
