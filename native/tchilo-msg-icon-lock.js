/**
 * Tchilo — tranca o ícone de mensagens do topbar
 * SVG do index (bolha com 3 pontos) — NADA substitui
 * v2
 */
(function () {
  'use strict';
  if (window.__tchiloMsgIconLockV2) return;
  window.__tchiloMsgIconLockV2 = true;
  window.__tchiloMsgIconLockV1 = true;

  /* Bolha preenchida + 3 pontos (sem mask — mais estável) */
  var ORIGINAL_SVG =
    '<svg viewBox="0 0 512 512" aria-hidden="true" width="34" height="34" ' +
    'style="width:34px;height:34px;display:block;color:var(--ink,#0B0B0C)">' +
    '<path d="M184 72 H328 a112 112 0 0 1 112 112 V264 a112 112 0 0 1 -112 112 H252 L196 452 V376 H184 a112 112 0 0 1 -112 -112 V184 a112 112 0 0 1 112 -112 Z" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="24" stroke-linejoin="round"/>' +
    '<circle cx="168" cy="224" r="22" fill="#fff"/>' +
    '<circle cx="256" cy="224" r="22" fill="#fff"/>' +
    '<circle cx="344" cy="224" r="22" fill="#fff"/>' +
    '</svg>';

  function ensureCSS() {
    var st = document.getElementById('tchiloMsgIconLockCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloMsgIconLockCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      'html body .topbar [data-top-messages],' +
      'html body [data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:44px!important;height:44px!important;border:none!important;background:transparent!important;' +
      'color:#0B0B0C!important;opacity:1!important;visibility:visible!important;}' +
      'html body.theme-dark .topbar [data-top-messages],' +
      'html body[data-theme="dark"] .topbar [data-top-messages]{' +
      'color:#F6F1E7!important;}' +
      'html body .topbar [data-top-messages] svg,' +
      'html body [data-top-messages] svg{' +
      'width:34px!important;height:34px!important;display:block!important;' +
      'opacity:1!important;visibility:visible!important;}' +
      'html body .topbar [data-top-messages] img,' +
      'html body .topbar [data-top-messages] canvas,' +
      'html body .topbar [data-top-messages] i{' +
      'display:none!important;}' +
      'html body .topbar [data-top-messages]::before,' +
      'html body .topbar [data-top-messages]::after{content:none!important;display:none!important;}';
    try {
      document.head.appendChild(st);
    } catch (e) {}
  }

  function isOurSvg(sv) {
    if (!sv) return false;
    var h = sv.innerHTML || '';
    return h.indexOf('M184 72') !== -1;
  }

  function restore() {
    ensureCSS();
    var host = document.querySelector('.topbar [data-top-messages], [data-top-messages]');
    if (!host) return;

    host.querySelectorAll('img,canvas,i').forEach(function (n) {
      try {
        n.remove();
      } catch (e) {}
    });

    var sv = host.querySelector('svg');
    if (!isOurSvg(sv)) {
      var tpl = document.createElement('template');
      tpl.innerHTML = ORIGINAL_SVG;
      var fresh = tpl.content.firstChild;
      if (sv && sv.parentNode) {
        try {
          sv.parentNode.replaceChild(fresh, sv);
        } catch (e2) {
          host.insertBefore(fresh, host.firstChild);
          try {
            sv.remove();
          } catch (e3) {}
        }
      } else {
        host.insertBefore(fresh, host.firstChild);
      }
    } else {
      sv.setAttribute('width', '34');
      sv.setAttribute('height', '34');
      sv.style.width = '34px';
      sv.style.height = '34px';
      sv.style.display = 'block';
      sv.style.opacity = '1';
    }

    host.style.setProperty('color', '#0B0B0C', 'important');
    host.style.setProperty('opacity', '1', 'important');
    host.style.setProperty('visibility', 'visible', 'important');
  }

  function boot() {
    restore();
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  [50, 150, 400, 1000, 2000, 4000, 8000].forEach(function (ms) {
    setTimeout(restore, ms);
  });

  try {
    var mo = new MutationObserver(function () {
      restore();
    });
    function observe() {
      var host = document.querySelector('.topbar [data-top-messages], [data-top-messages]');
      var topbar = document.querySelector('.topbar');
      if (host) {
        mo.observe(host, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class', 'src', 'fill', 'stroke', 'opacity']
        });
      }
      if (topbar) {
        mo.observe(topbar, { childList: true, subtree: true });
      }
    }
    observe();
    setTimeout(observe, 500);
  } catch (e) {}

  if (typeof window.goTo === 'function' && !window.goTo.__msgIconLock) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(restore, 30);
      setTimeout(restore, 150);
      return r;
    };
    window.goTo.__msgIconLock = true;
  }
})();
