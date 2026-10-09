/**
 * LIVE bind v2
 * - Clique no ícone LIVE do feed → lobby (pessoas em direto)
 * - Setup da tua live só pelo botão LIVE dentro do lobby
 */
(function () {
  'use strict';
  if (window.__tchiloLiveBindV2) return;
  window.__tchiloLiveBindV2 = true;
  window.__tchiloLiveBindV1 = true;

  function openFromFeed(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (typeof window.tchiloOpenLiveLobby === 'function') {
        window.tchiloOpenLiveLobby();
        return;
      }
    } catch (err) {}
    try {
      if (typeof window.openLiveLobby === 'function') {
        window.openLiveLobby();
        return;
      }
    } catch (err2) {}
    try {
      if (typeof window.tchiloOpenLiveSetup === 'function') window.tchiloOpenLiveSetup();
    } catch (err3) {}
  }

  function bind() {
    try {
      var logos = document.querySelectorAll(
        '#screen-feed img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      for (var i = 0; i < logos.length; i++) {
        var el = logos[i];
        if (el.__tchiloLiveBoundV2) continue;
        el.__tchiloLiveBoundV2 = true;
        el.style.cursor = 'pointer';
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'Lives em direto');
        el.addEventListener('click', openFromFeed, true);
        var p = el.parentElement;
        if (p && !p.__tchiloLiveBoundV2 && (p.classList.contains('logo') || p.classList.contains('topbar-logo'))) {
          p.__tchiloLiveBoundV2 = true;
          p.style.cursor = 'pointer';
          p.addEventListener('click', openFromFeed, true);
        }
      }
    } catch (e) {}
  }

  bind();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  setTimeout(bind, 300);
  setTimeout(bind, 1200);
})();
