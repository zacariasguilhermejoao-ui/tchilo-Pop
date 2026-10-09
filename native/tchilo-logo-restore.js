/**
 * Logo LIVE v10 — só o desenho do index
 * - Protege APENAS o src (ícone do index)
 * - Remove a regra do icon-lock que forçava height no logo
 * - NÃO define height/width (fica 100% o CSS do index)
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV10) return;
  window.__tchiloLogoRestoreV10 = true;
  window.__tchiloLogoRestoreV9 = true;
  window.__tchiloLogoRestoreV8 = true;
  window.__tchiloLogoRestoreV7 = true;
  window.__tchiloLogoRestoreV6 = true;

  var INDEX_SRC = null;

  function stripIconLockLogoSize() {
    try {
      var st = document.getElementById('tchilo-icon-lock-css');
      if (!st || !st.textContent) return;
      var next = st.textContent.replace(
        /html\s+body\s+\.topbar\s+img\.logo-img\s*\{[^}]*\}/gi,
        ''
      );
      if (next !== st.textContent) st.textContent = next;
    } catch (e) {}
  }

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
    stripIconLockLogoSize();
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

  stripIconLockLogoSize();
  capture();
  enforce();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      stripIconLockLogoSize();
      capture();
      enforce();
    });
  }
  [100, 500, 1500].forEach(function (ms) {
    setTimeout(function () {
      stripIconLockLogoSize();
      capture();
      enforce();
    }, ms);
  });

  try {
    var top = document.querySelector('#screen-feed .topbar, .topbar');
    if (top && !top.__logoLiveObsV10) {
      top.__logoLiveObsV10 = true;
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
