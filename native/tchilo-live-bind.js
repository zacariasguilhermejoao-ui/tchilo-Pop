/**
 * LIVE bind v3
 * - Só liga o clique no .logo-img do index
 * - NÃO troca src, HTML, tamanho nem desenho
 * - Se algo nativo alterar o src, repõe o do index
 * - Remove fundo/círculo/caixa à volta do logo
 */
(function () {
  'use strict';
  if (window.__tchiloLiveBindV3) return;
  window.__tchiloLiveBindV3 = true;
  window.__tchiloLiveBindV2 = true;
  window.__tchiloLiveBindV1 = true;

  var INDEX_SRC = null;

  function injectProtectCSS() {
    var st = document.getElementById('tchilo-live-logo-protect');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchilo-live-logo-protect';
      (document.head || document.documentElement).appendChild(st);
    }
    /* Anula círculo/quadrado/fundo forçados por native — o SVG do index já é a pílula */
    st.textContent =
      'html body .topbar img.logo-img,' +
      'html body #screen-feed .topbar img.logo-img,' +
      'html body img.logo-img{' +
      'border-radius:0!important;' +
      'background:transparent!important;' +
      'background-color:transparent!important;' +
      'box-shadow:none!important;' +
      'border:0!important;' +
      'outline:none!important;' +
      'padding:0!important;' +
      'margin:0!important;' +
      'object-fit:contain!important;' +
      'display:block!important;' +
      'height:68px!important;' +
      'max-height:72px!important;' +
      'width:auto!important;' +
      'max-width:none!important;' +
      'min-width:0!important;' +
      'min-height:0!important;' +
      'clip-path:none!important;' +
      'filter:none!important;' +
      'transform:none!important;' +
      'animation:none!important;' +
      '}' +
      'html body .topbar .logo,' +
      'html body .topbar .topbar-logo,' +
      'html body .topbar img.logo-img + *,' +
      'html body .topbar .logo-badge,' +
      'html body .topbar .live-badge{' +
      'background:transparent!important;' +
      'border:0!important;' +
      'box-shadow:none!important;' +
      '}';
  }

  function captureIndexSrc() {
    try {
      var el = document.querySelector(
        '#screen-feed .topbar img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      if (!el) return;
      var src = el.getAttribute('src') || '';
      /* Preferir o SVG data: do index */
      if (src.indexOf('data:image/svg') === 0) {
        INDEX_SRC = src;
      } else if (!INDEX_SRC && src) {
        INDEX_SRC = src;
      }
    } catch (e) {}
  }

  function enforceSrcOnly() {
    if (!INDEX_SRC) captureIndexSrc();
    if (!INDEX_SRC) return;
    try {
      var els = document.querySelectorAll(
        '#screen-feed .topbar img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var cur = el.getAttribute('src') || '';
        if (cur !== INDEX_SRC) {
          el.setAttribute('src', INDEX_SRC);
        }
        /* limpar style inline que native possa ter metido */
        if (el.getAttribute('style')) {
          el.removeAttribute('style');
        }
      }
    } catch (e) {}
  }

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
      if (typeof window.tchiloOpenLiveSetup === 'function') {
        window.tchiloOpenLiveSetup();
      }
    } catch (err3) {}
  }

  function bind() {
    injectProtectCSS();
    captureIndexSrc();
    enforceSrcOnly();
    try {
      var logos = document.querySelectorAll(
        '#screen-feed img.logo-img, .topbar img.logo-img, img.logo-img'
      );
      for (var i = 0; i < logos.length; i++) {
        var el = logos[i];
        if (el.__tchiloLiveBoundV3) continue;
        el.__tchiloLiveBoundV3 = true;
        el.style.cursor = 'pointer';
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'Lives em direto');
        el.addEventListener('click', openFromFeed, true);
        var p = el.parentElement;
        if (
          p &&
          !p.__tchiloLiveBoundV3 &&
          (p.classList.contains('logo') || p.classList.contains('topbar-logo'))
        ) {
          p.__tchiloLiveBoundV3 = true;
          p.style.cursor = 'pointer';
          p.addEventListener('click', openFromFeed, true);
        }
      }
    } catch (e) {}
  }

  injectProtectCSS();
  bind();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  }
  [80, 300, 900, 2000].forEach(function (ms) {
    setTimeout(function () {
      captureIndexSrc();
      enforceSrcOnly();
      bind();
    }, ms);
  });

  try {
    var top = document.querySelector('#screen-feed .topbar, .topbar');
    if (top && !top.__tchiloLiveSrcObs) {
      top.__tchiloLiveSrcObs = true;
      new MutationObserver(function () {
        enforceSrcOnly();
      }).observe(top, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'style', 'class']
      });
    }
  } catch (e) {}
})();
