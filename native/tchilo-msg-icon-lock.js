/**
 * Tchilo — tranca o ícone de mensagens do topbar
 * O SVG do index (bolha com 3 pontos) NÃO pode ser substituído.
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloMsgIconLockV1) return;
  window.__tchiloMsgIconLockV1 = true;

  /* SVG exacto do index.html — bolha preenchida com 3 pontos via mask */
  var ORIGINAL_SVG =
    '<svg viewBox="0 0 512 512" aria-hidden="true" width="34" height="34" style="width:34px;height:34px;display:block">' +
    '<defs><mask id="tchiloMsgDotsLock" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">' +
    '<rect width="512" height="512" fill="#fff"/>' +
    '<circle cx="168" cy="224" r="24" fill="#000"/>' +
    '<circle cx="256" cy="224" r="24" fill="#000"/>' +
    '<circle cx="344" cy="224" r="24" fill="#000"/>' +
    '</mask></defs>' +
    '<path d="M184 72 H328 a112 112 0 0 1 112 112 V264 a112 112 0 0 1 -112 112 H252 L196 452 V376 H184 a112 112 0 0 1 -112 -112 V184 a112 112 0 0 1 112 -112 Z" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="24" stroke-linejoin="round" mask="url(#tchiloMsgDotsLock)"/>' +
    '</svg>';

  function ensureCSS() {
    if (document.getElementById('tchiloMsgIconLockCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloMsgIconLockCSS';
    st.textContent =
      'html body .topbar [data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:44px!important;height:44px!important;border:none!important;background:transparent!important;' +
      'color:var(--ink,#0B0B0C)!important;opacity:1!important;visibility:visible!important;}' +
      'html body .topbar [data-top-messages] svg{' +
      'width:34px!important;height:34px!important;display:block!important;' +
      'color:var(--ink,#0B0B0C)!important;fill:currentColor!important;opacity:1!important;}' +
      'html body .topbar [data-top-messages] img,' +
      'html body .topbar [data-top-messages] canvas,' +
      'html body .topbar [data-top-messages] i{' +
      'display:none!important;}' +
      /* impedir pseudo-elementos a cobrir o ícone */
      'html body .topbar [data-top-messages]::before,' +
      'html body .topbar [data-top-messages]::after{content:none!important;display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function restore() {
    ensureCSS();
    var host = document.querySelector('.topbar [data-top-messages], [data-top-messages]');
    if (!host) return;

    /* Remover img/canvas/i que scripts metem por cima */
    host.querySelectorAll('img,canvas,i').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });

    var sv = host.querySelector('svg');
    var ok =
      sv &&
      sv.innerHTML &&
      (sv.innerHTML.indexOf('tchiloMsgDots') !== -1 || sv.innerHTML.indexOf('M184 72') !== -1);

    if (!ok) {
      /* Repor SVG original do index */
      var tpl = document.createElement('template');
      tpl.innerHTML = ORIGINAL_SVG;
      var fresh = tpl.content.firstChild;
      if (sv) {
        try {
          sv.parentNode.replaceChild(fresh, sv);
        } catch (e2) {
          host.insertBefore(fresh, host.firstChild);
          try { sv.remove(); } catch (e3) {}
        }
      } else {
        host.insertBefore(fresh, host.firstChild);
      }
    } else {
      /* Garantir cor e tamanho */
      sv.setAttribute('width', '34');
      sv.setAttribute('height', '34');
      sv.style.width = '34px';
      sv.style.height = '34px';
      sv.style.display = 'block';
      sv.style.color = 'var(--ink, #0B0B0C)';
      sv.style.opacity = '1';
    }

    host.style.color = 'var(--ink, #0B0B0C)';
    host.style.opacity = '1';
    host.style.visibility = 'visible';
  }

  function boot() {
    restore();
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  [100, 400, 1000, 2000, 4000].forEach(function (ms) {
    setTimeout(restore, ms);
  });

  /* Observar mudanças no topbar para sempre repor */
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
      setTimeout(restore, 40);
      setTimeout(restore, 200);
      return r;
    };
    window.goTo.__msgIconLock = true;
  }
})();
