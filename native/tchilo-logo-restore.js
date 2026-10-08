/**
 * Mantém o ícone LIVE no topbar (live-icon.svg).
 * Só corrige o tamanho excessivo (68px) que causava bloco preto.
 * NÃO substitui por logo.svg.
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV2) return;
  window.__tchiloLogoRestoreV2 = true;

  function restore() {
    try {
      var img = document.querySelector('.topbar .logo-img, .topbar img.logo-img');
      if (!img) return;

      var src = (img.getAttribute('src') || '').toLowerCase();

      /* Se for live-icon → manter e só ajustar tamanho */
      if (src.indexOf('live-icon') >= 0) {
        img.style.height = '40px';
        img.style.maxHeight = '40px';
        img.style.width = 'auto';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        /* manter onclick / role / title originais */
        return;
      }

      /* Se alguém tirou o live-icon, devolve */
      if (src.indexOf('logo.svg') >= 0 || !src) {
        img.src = 'live-icon.svg';
        img.alt = 'LIVE';
        img.setAttribute('title', 'Lives');
        img.setAttribute('role', 'button');
        img.style.cssText = 'cursor:pointer;height:40px;width:auto;object-fit:contain;display:block;';
        if (!img.onclick) {
          img.onclick = function () {
            if (typeof tchiloOpenLiveSetup === 'function') tchiloOpenLiveSetup();
            else if (typeof openLiveScreen === 'function') openLiveScreen();
            else if (typeof openSetup === 'function') openSetup();
            else alert('Lives em breve');
          };
        }
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore);
  else restore();
  setTimeout(restore, 80);
  setTimeout(restore, 400);
  setTimeout(restore, 1200);
})();
