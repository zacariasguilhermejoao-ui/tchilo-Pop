/**
 * Tchilo — ícone de mensagens do topbar (SVG do index)
 * v3 — SEM MutationObserver (evita freeze)
 */
(function () {
  'use strict';
  if (window.__tchiloMsgIconLockV3) return;
  window.__tchiloMsgIconLockV3 = true;

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
    if (document.getElementById('tchiloMsgIconLockCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloMsgIconLockCSS';
    st.textContent =
      'html body .topbar [data-top-messages],html body [data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:44px!important;height:44px!important;border:none!important;background:transparent!important;' +
      'color:#0B0B0C!important;opacity:1!important;}' +
      'html body .topbar [data-top-messages] svg{width:34px!important;height:34px!important;display:block!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function restore() {
    ensureCSS();
    var host = document.querySelector('.topbar [data-top-messages], [data-top-messages]');
    if (!host) return;
    var sv = host.querySelector('svg');
    var ok = sv && (sv.innerHTML || '').indexOf('M184 72') !== -1;
    if (ok) return;
    var tpl = document.createElement('template');
    tpl.innerHTML = ORIGINAL_SVG;
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
  setTimeout(restore, 400);
  setTimeout(restore, 1500);
  setTimeout(restore, 3000);
})();
