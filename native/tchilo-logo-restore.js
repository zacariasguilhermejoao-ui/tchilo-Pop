/**
 * Logo LIVE v7 — só o do index
 * - NÃO troca o desenho (src do index)
 * - Anula o height:28px do icon-lock → 68px como no index
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV7) return;
  window.__tchiloLogoRestoreV7 = true;
  window.__tchiloLogoRestoreV6 = true;

  var INDEX_SRC = null;

  function injectCSS() {
    var st = document.getElementById('tchilo-live-logo-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchilo-live-logo-css';
      (document.head || document.documentElement).appendChild(st);
    }
    /* Ganha ao icon-lock (28px) — mesmo valor do index (.logo-img height:68px) */
    st.textContent =
      'html body .topbar img.logo-img,' +
      'html body #screen-feed .topbar img.logo-img,' +
      'html body img.logo-img{' +
      'height:68px!important;' +
      'max-height:68px!important;' +
      'width:auto!important;' +
      'object-fit:contain!important;' +
      'display:block!important;}';
  }

  function capture() {
    try {
      var el = document.querySelector(
        '#screen-feed .topbar img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      if (!el) return;
      var src = el.getAttribute('src') || '';
      /* Só captura o SVG LIVE do index (data:image/svg) */
      if (src.indexOf('data:image/svg') === 0 || src.indexOf('svg') >= 0) {
        INDEX_SRC = src;
      } else if (!INDEX_SRC && src) {
        INDEX_SRC = src;
      }
    } catch (e) {}
  }

  function enforce() {
    injectCSS();
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

  injectCSS();
  capture();
  enforce();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      capture();
      enforce();
    });
  }
  [100, 400, 1000, 2500].forEach(function (ms) {
    setTimeout(function () {
      capture();
      enforce();
    }, ms);
  });

  try {
    var top = document.querySelector('#screen-feed .topbar, .topbar');
    if (top && !top.__logoLiveObs) {
      top.__logoLiveObs = true;
      new MutationObserver(function () {
        enforce();
      }).observe(top, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'style', 'class']
      });
    }
  } catch (e) {}
})();
