/**
 * Ícone SMS do topo = SVG exacto do index (balão 3 pontos)
 * v7 — força cor preta/ink, remove fantasmas cinzentos
 */
(function () {
  'use strict';
  if (window.__tchiloMsgIconLockV7) return;
  window.__tchiloMsgIconLockV7 = true;

  var ORIGINAL =
    '<svg viewBox="0 0 512 512" aria-hidden="true" width="34" height="34" style="width:34px;height:34px;display:block;color:#0B0B0C">' +
    '<defs><mask id="tchiloMsgDots" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">' +
    '<rect width="512" height="512" fill="#fff"/>' +
    '<circle cx="168" cy="224" r="24" fill="#000"/>' +
    '<circle cx="256" cy="224" r="24" fill="#000"/>' +
    '<circle cx="344" cy="224" r="24" fill="#000"/>' +
    '</mask></defs>' +
    '<path d="M184 72 H328 a112 112 0 0 1 112 112 V264 a112 112 0 0 1 -112 112 H252 L196 452 V376 H184 a112 112 0 0 1 -112 -112 V184 a112 112 0 0 1 112 -112 Z" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="24" stroke-linejoin="round" mask="url(#tchiloMsgDots)"/>' +
    '</svg>';

  function hostEl() {
    return document.querySelector('.topbar [data-top-messages], [data-top-messages]');
  }

  function ensureCSS() {
    if (document.getElementById('tchiloMsgIconLockCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloMsgIconLockCSS';
    st.textContent =
      'html body .topbar [data-top-messages],html body [data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:44px!important;height:44px!important;border:none!important;background:transparent!important;' +
      'opacity:1!important;background-image:none!important;color:#0B0B0C!important;' +
      '-webkit-text-fill-color:#0B0B0C!important;filter:none!important;}' +
      'html body .topbar [data-top-messages]::before,html body .topbar [data-top-messages]::after,' +
      'html body [data-top-messages]::before,html body [data-top-messages]::after{content:none!important;display:none!important;}' +
      'html body .topbar [data-top-messages] > svg,html body [data-top-messages] > svg,' +
      'html body .topbar [data-top-messages] svg,html body [data-top-messages] svg{' +
      'width:34px!important;height:34px!important;display:block!important;visibility:visible!important;' +
      'opacity:1!important;color:#0B0B0C!important;fill:#0B0B0C!important;stroke:#0B0B0C!important;' +
      'filter:none!important;}' +
      'html body .topbar [data-top-messages] img,html body [data-top-messages] img{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function isGood(sv) {
    if (!sv) return false;
    var h = sv.outerHTML || '';
    return h.indexOf('M184 72') !== -1 && h.indexOf('tchiloMsgDots') !== -1;
  }

  function restore() {
    ensureCSS();
    var host = hostEl();
    if (!host) return;
    host.style.setProperty('color', '#0B0B0C', 'important');
    host.style.setProperty('opacity', '1', 'important');

    var sv = host.querySelector(':scope > svg') || host.querySelector('svg');
    if (isGood(sv)) {
      try {
        sv.style.color = '#0B0B0C';
        sv.setAttribute('style', 'width:34px;height:34px;display:block;color:#0B0B0C');
      } catch (e) {}
      return;
    }

    try {
      Array.prototype.slice.call(host.querySelectorAll('svg, img, canvas')).forEach(function (n) {
        try { n.parentNode.removeChild(n); } catch (e) {}
      });
    } catch (e2) {}

    var tpl = document.createElement('template');
    tpl.innerHTML = ORIGINAL;
    var fresh = tpl.content.firstChild;
    if (fresh) host.insertBefore(fresh, host.firstChild);
  }

  function boot() {
    ensureCSS();
    restore();
  }
  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  [40, 150, 400, 1000, 2500, 5000].forEach(function (ms) {
    setTimeout(restore, ms);
  });
  try {
    var t = null;
    new MutationObserver(function () {
      if (t) clearTimeout(t);
      t = setTimeout(restore, 25);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'src', 'd', 'viewBox', 'fill', 'stroke']
    });
  } catch (e) {}
})();
