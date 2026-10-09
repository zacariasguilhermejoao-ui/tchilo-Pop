/**
 * Logo LIVE v8 — só o do index
 * - NÃO troca o desenho (src do index)
 * - Anula o height:28px do icon-lock → 68px como no index
 * - Remove fundos/wrappers pretos quadrados que scripts possam meter
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV8) return;
  window.__tchiloLogoRestoreV8 = true;
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
    /* Ganha ao icon-lock (28px) — mesmo valor do index (.logo-img height:68px)
       Specificidade mais alta + !important */
    st.textContent =
      'html body #screen-feed .topbar img.logo-img,' +
      'html body .topbar img.logo-img,' +
      'html body img.logo-img{' +
      'height:68px!important;' +
      'max-height:68px!important;' +
      'width:auto!important;' +
      'min-width:0!important;' +
      'min-height:0!important;' +
      'object-fit:contain!important;' +
      'display:block!important;' +
      'background:transparent!important;' +
      'border:none!important;' +
      'border-radius:0!important;' +
      'padding:0!important;' +
      'box-shadow:none!important;}' +
      'html body #screen-feed .topbar .logo,' +
      'html body .topbar .logo{' +
      'background:transparent!important;' +
      'border:none!important;' +
      'width:auto!important;' +
      'height:auto!important;}' +
      /* Anular regra 28px do icon-lock se ainda existir no DOM */
      'html body .topbar img.logo-img[src*="data:image/svg"]{' +
      'height:68px!important;max-height:68px!important;width:auto!important;}';
  }

  function capture() {
    try {
      var el = document.querySelector(
        '#screen-feed .topbar img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      if (!el) return;
      var src = el.getAttribute('src') || '';
      /* Só captura o SVG LIVE do index (data:image/svg) */
      if (src.indexOf('data:image/svg') === 0) {
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
      /* limpar estilos inline que possam forçar caixa preta/quadrada */
      el.style.background = 'transparent';
      el.style.border = 'none';
      el.style.borderRadius = '0';
      el.style.height = '68px';
      el.style.maxHeight = '68px';
      el.style.width = 'auto';
      el.style.objectFit = 'contain';
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
  [50, 150, 400, 1000, 2500, 5000].forEach(function (ms) {
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
