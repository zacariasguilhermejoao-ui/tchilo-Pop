/**
 * Tchilo — ícone de mensagens = exactamente o SVG do index.html
 * Não substitui por outro desenho; só restaura se algo o alterar.
 */
(function () {
  'use strict';
  if (window.__tchiloMsgIconLockV4) return;
  window.__tchiloMsgIconLockV4 = true;

  /* SVG exacto do index (data-top-messages) — balão com 3 pontos via mask */
  var INDEX_SVG =
    '<svg viewBox="0 0 512 512" aria-hidden="true" width="34" height="34" style="width:34px;height:34px;display:block;">' +
    '<defs><mask id="tchiloMsgDots" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">' +
    '<rect width="512" height="512" fill="#fff"/>' +
    '<circle cx="168" cy="224" r="24" fill="#000"/>' +
    '<circle cx="256" cy="224" r="24" fill="#000"/>' +
    '<circle cx="344" cy="224" r="24" fill="#000"/>' +
    '</mask></defs>' +
    '<path d="M184 72 H328 a112 112 0 0 1 112 112 V264 a112 112 0 0 1 -112 112 H252 L196 452 V376 H184 a112 112 0 0 1 -112 -112 V184 a112 112 0 0 1 112 -112 Z" ' +
    'fill="currentColor" stroke="currentColor" stroke-width="24" stroke-linejoin="round" mask="url(#tchiloMsgDots)"/>' +
    '</svg>';

  function ensureCSS() {
    if (document.getElementById('tchiloMsgIconLockCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloMsgIconLockCSS';
    st.textContent =
      'html body .topbar [data-top-messages],html body [data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:44px!important;height:44px!important;border:none!important;background:transparent!important;' +
      'opacity:1!important;}' +
      'html body .topbar [data-top-messages] svg{width:34px!important;height:34px!important;display:block!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function isIndexMsgSvg(sv) {
    if (!sv) return false;
    var h = sv.innerHTML || '';
    return h.indexOf('M184 72') !== -1 && (h.indexOf('tchiloMsgDots') !== -1 || h.indexOf('circle') !== -1);
  }

  function restore() {
    ensureCSS();
    var host = document.querySelector('.topbar [data-top-messages], [data-top-messages]');
    if (!host) return;
    var sv = host.querySelector('svg');
    if (isIndexMsgSvg(sv)) return;
    var tpl = document.createElement('template');
    tpl.innerHTML = INDEX_SVG;
    var fresh = tpl.content.firstChild;
    if (sv && sv.parentNode) {
      try { sv.parentNode.replaceChild(fresh, sv); } catch (e) {}
    } else {
      host.insertBefore(fresh, host.firstChild);
    }
  }

  ensureCSS();
  restore();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restore);
  }
  [400, 1200, 3000].forEach(function (ms) { setTimeout(restore, ms); });
})();
