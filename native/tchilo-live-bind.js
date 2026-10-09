/**
 * LIVE bind v1
 * - NÃO altera src, HTML nem tamanho do .logo-img (index manda)
 * - Só liga o clique → abrir Live
 */
(function () {
  'use strict';
  if (window.__tchiloLiveBindV1) return;
  window.__tchiloLiveBindV1 = true;

  function openLive(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (typeof window.tchiloOpenLiveSetup === 'function') {
        window.tchiloOpenLiveSetup();
        return;
      }
    } catch (err) {}
    try {
      if (typeof window.openLive === 'function') {
        window.openLive();
        return;
      }
    } catch (err2) {}
    try {
      if (typeof goTo === 'function') goTo('live');
    } catch (err3) {}
  }

  function bind() {
    try {
      var logos = document.querySelectorAll(
        '#screen-feed img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      for (var i = 0; i < logos.length; i++) {
        var el = logos[i];
        if (el.__tchiloLiveBound) continue;
        el.__tchiloLiveBound = true;
        el.style.cursor = 'pointer';
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', el.getAttribute('aria-label') || 'Live');
        el.addEventListener('click', openLive);
        /* pai clicável se for o logo wrap */
        var p = el.parentElement;
        if (p && !p.__tchiloLiveBound && (p.classList.contains('logo') || p.classList.contains('topbar-logo'))) {
          p.__tchiloLiveBound = true;
          p.style.cursor = 'pointer';
          p.addEventListener('click', openLive);
        }
      }
    } catch (e) {}
  }

  bind();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  setTimeout(bind, 300);
  setTimeout(bind, 1200);
})();
