/**
 * Nav icons lock v1
 * O index define os ícones (incl. notificações / sino).
 * Se algum script native trocar o SVG, repomos o original uma vez.
 */
(function () {
  'use strict';
  if (window.__tchiloNavIconsLockV1) return;
  window.__tchiloNavIconsLockV1 = true;

  var SNAP = null;

  function snapshot() {
    try {
      var btn = document.querySelector('.navbar .nav-item[data-screen="notifs"]');
      if (!btn) return;
      var svg = btn.querySelector('svg');
      if (!svg) return;
      SNAP = svg.outerHTML;
    } catch (e) {}
  }

  function restore() {
    if (!SNAP) return;
    try {
      var btn = document.querySelector('.navbar .nav-item[data-screen="notifs"]');
      if (!btn) return;
      var svg = btn.querySelector('svg');
      if (!svg) {
        btn.insertAdjacentHTML('afterbegin', SNAP);
        return;
      }
      if (svg.outerHTML !== SNAP) {
        svg.outerHTML = SNAP;
      }
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
  setTimeout(boot, 100);
  setTimeout(function () {
    snapshot();
    restore();
  }, 400);
  setTimeout(restore, 1200);

  try {
    var nav = document.querySelector('.navbar');
    if (nav && !nav.__notifIconLock) {
      nav.__notifIconLock = true;
      new MutationObserver(function () {
        restore();
      }).observe(nav, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
