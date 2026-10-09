/**
 * Logo LIVE lock v6
 * Guarda o src/HTML do index e repõe se algum script native trocar.
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV6) return;
  window.__tchiloLogoRestoreV6 = true;
  window.__tchiloLogoRestoreV5 = true;

  var SNAP = null;

  function snapshot() {
    try {
      var el = document.querySelector('#screen-feed img.logo-img, .topbar img.logo-img, img.logo-img');
      if (!el) return;
      SNAP = {
        src: el.getAttribute('src') || '',
        style: el.getAttribute('style') || '',
        outer: el.outerHTML
      };
    } catch (e) {}
  }

  function restore() {
    if (!SNAP || !SNAP.src) return;
    try {
      var el = document.querySelector('#screen-feed img.logo-img, .topbar img.logo-img, img.logo-img');
      if (!el) return;
      var cur = el.getAttribute('src') || '';
      if (cur !== SNAP.src) {
        el.setAttribute('src', SNAP.src);
      }
      /* não forçar style se o index já definiu */
    } catch (e) {}
  }

  function boot() {
    snapshot();
    restore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 200);
  setTimeout(function () {
    snapshot();
    restore();
  }, 800);
  setTimeout(restore, 2000);

  try {
    var top = document.querySelector('#screen-feed .topbar, .topbar');
    if (top && !top.__logoLockObs) {
      top.__logoLockObs = true;
      new MutationObserver(function () {
        restore();
      }).observe(top, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    }
  } catch (e) {}
})();
