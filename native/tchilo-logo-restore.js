/**
 * Só corrige o tamanho do LIVE no topbar (68px → 38px).
 * NÃO troca o ficheiro/src do ícone — o index manda.
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV4) return;
  window.__tchiloLogoRestoreV4 = true;

  function fixSize() {
    try {
      var img = document.querySelector('.topbar .logo-img, .topbar img.logo-img');
      if (!img) return;
      /* manter src, alt, onclick, title, role do index */
      img.style.height = '38px';
      img.style.maxHeight = '40px';
      img.style.width = 'auto';
      img.style.objectFit = 'contain';
      img.style.display = 'block';
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixSize);
  else fixSize();
  setTimeout(fixSize, 80);
  setTimeout(fixSize, 400);
  setTimeout(fixSize, 1200);
})();
