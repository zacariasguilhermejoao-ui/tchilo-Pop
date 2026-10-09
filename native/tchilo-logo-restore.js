/**
 * Logo LIVE v9 — só o desenho do index
 * - Protege APENAS o src (ícone do index)
 * - NÃO mexe em height/width/size (fica o do index)
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV9) return;
  window.__tchiloLogoRestoreV9 = true;
  window.__tchiloLogoRestoreV8 = true;
  window.__tchiloLogoRestoreV7 = true;
  window.__tchiloLogoRestoreV6 = true;

  var INDEX_SRC = null;

  function capture() {
    try {
      var el = document.querySelector(
        '#screen-feed .topbar img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      if (!el) return;
      var src = el.getAttribute('src') || '';
      if (src.indexOf('data:image/svg') === 0) {
        INDEX_SRC = src;
      } else if (!INDEX_SRC && src) {
        INDEX_SRC = src;
      }
    } catch (e) {}
  }

  function enforce() {
    try {
      var el = document.querySelector(
        '#screen-feed .topbar img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      if (!el) return;
      if (!INDEX_SRC) capture();
      if (INDEX_SRC) {
        var cur = el.getAttribute('src') || '';
        if (cur !== INDEX_SRC) el.setAttribute('src', INDEX_SRC);
      }
    } catch (e) {}
  }

  capture();
  enforce();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      capture();
      enforce();
    });
  }
  [100, 500, 1500].forEach(function (ms) {
    setTimeout(function () {
      capture();
      enforce();
    }, ms);
  });

  try {
    var top = document.querySelector('#screen-feed .topbar, .topbar');
    if (top && !top.__logoLiveObsV9) {
      top.__logoLiveObsV9 = true;
      new MutationObserver(function () {
        enforce();
      }).observe(top, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
      });
    }
  } catch (e) {}
})();
