/**
 * Tchilo — ícone de mensagens = o que está no index.html
 * v5 — NÃO força um SVG inventado. Guarda o SVG original do index
 * e só o repõe se outro script o alterar/remover.
 */
(function () {
  'use strict';
  if (window.__tchiloMsgIconLockV5) return;
  window.__tchiloMsgIconLockV5 = true;

  var savedHTML = null;
  var savedOuter = null;

  function ensureCSS() {
    if (document.getElementById('tchiloMsgIconLockCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloMsgIconLockCSS';
    st.textContent =
      'html body .topbar [data-top-messages],html body [data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:44px!important;height:44px!important;border:none!important;background:transparent!important;' +
      'opacity:1!important;background-image:none!important;}' +
      'html body .topbar [data-top-messages]::before,html body .topbar [data-top-messages]::after,' +
      'html body [data-top-messages]::before,html body [data-top-messages]::after{' +
      'content:none!important;display:none!important;}' +
      'html body .topbar [data-top-messages] > svg,' +
      'html body [data-top-messages] > svg{' +
      'width:34px!important;height:34px!important;display:block!important;' +
      'visibility:visible!important;opacity:1!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function hostEl() {
    return document.querySelector('.topbar [data-top-messages], [data-top-messages]');
  }

  function capture() {
    var host = hostEl();
    if (!host) return false;
    var sv = host.querySelector(':scope > svg') || host.querySelector('svg');
    if (!sv) return false;
    /* guarda exactamente o que está no index */
    savedHTML = sv.outerHTML;
    savedOuter = sv.cloneNode(true);
    return true;
  }

  function looksLikeSaved(sv) {
    if (!sv || !savedHTML) return false;
    try {
      /* comparação leve: path principal + tamanho */
      var a = (sv.innerHTML || '').replace(/\s+/g, ' ').trim();
      var b = (savedOuter.innerHTML || '').replace(/\s+/g, ' ').trim();
      if (a === b) return true;
      /* se tiver o mesmo path d principal */
      var pa = sv.querySelector('path');
      var pb = savedOuter.querySelector('path');
      if (pa && pb && pa.getAttribute('d') === pb.getAttribute('d')) return true;
    } catch (e) {}
    return false;
  }

  function restore() {
    ensureCSS();
    var host = hostEl();
    if (!host) return;
    if (!savedHTML && !capture()) return;

    var sv = host.querySelector(':scope > svg') || host.querySelector('svg');
    if (looksLikeSaved(sv)) return;

    /* remove SVGs/imgs intrusos e repõe o original do index */
    try {
      Array.prototype.slice.call(host.querySelectorAll('svg, img')).forEach(function (n) {
        try { n.parentNode.removeChild(n); } catch (e) {}
      });
    } catch (e2) {}

    var tpl = document.createElement('template');
    tpl.innerHTML = savedHTML;
    var fresh = tpl.content.firstChild;
    if (fresh) {
      host.insertBefore(fresh, host.firstChild);
    }
  }

  function boot() {
    ensureCSS();
    capture();
    restore();
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  [100, 400, 1000, 2500, 5000].forEach(function (ms) {
    setTimeout(function () {
      if (!savedHTML) capture();
      restore();
    }, ms);
  });

  try {
    var moT = null;
    new MutationObserver(function () {
      if (moT) clearTimeout(moT);
      moT = setTimeout(restore, 40);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'src', 'd', 'viewBox']
    });
  } catch (e) {}
})();
