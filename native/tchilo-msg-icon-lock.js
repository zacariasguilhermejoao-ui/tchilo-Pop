/**
 * Ícone de mensagens = exactamente o do index.html
 * v6 — captura o SVG do index e repõe sempre que for alterado
 */
(function () {
  'use strict';
  if (window.__tchiloMsgIconLockV6) return;
  window.__tchiloMsgIconLockV6 = true;

  var savedHTML = null;

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
      'opacity:1!important;background-image:none!important;}' +
      'html body .topbar [data-top-messages]::before,html body .topbar [data-top-messages]::after,' +
      'html body [data-top-messages]::before,html body [data-top-messages]::after{content:none!important;display:none!important;}' +
      'html body .topbar [data-top-messages] > svg,html body [data-top-messages] > svg{' +
      'width:34px!important;height:34px!important;display:block!important;visibility:visible!important;opacity:1!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function capture() {
    var host = hostEl();
    if (!host) return false;
    var sv = host.querySelector(':scope > svg') || host.querySelector('svg');
    if (!sv) return false;
    var html = sv.outerHTML;
    /* só guarda se parecer o do index (path do balão) */
    if (html.indexOf('M184 72') === -1 && html.indexOf('viewBox="0 0 512 512"') === -1) {
      /* ainda assim guarda o que estiver no index no 1º paint */
    }
    savedHTML = html;
    return true;
  }

  function restore() {
    ensureCSS();
    var host = hostEl();
    if (!host) return;
    if (!savedHTML) capture();
    if (!savedHTML) return;

    var sv = host.querySelector(':scope > svg') || host.querySelector('svg');
    var ok = false;
    if (sv) {
      try {
        ok = sv.outerHTML.replace(/\s+/g, ' ') === savedHTML.replace(/\s+/g, ' ');
        if (!ok && savedHTML.indexOf('M184 72') !== -1) {
          ok = (sv.innerHTML || '').indexOf('M184 72') !== -1;
        }
      } catch (e) {}
    }
    if (ok) return;

    try {
      Array.prototype.slice.call(host.querySelectorAll('svg, img')).forEach(function (n) {
        try { n.parentNode.removeChild(n); } catch (e) {}
      });
    } catch (e2) {}

    var tpl = document.createElement('template');
    tpl.innerHTML = savedHTML;
    var fresh = tpl.content.firstChild;
    if (fresh) host.insertBefore(fresh, host.firstChild);
  }

  function boot() {
    ensureCSS();
    capture();
    restore();
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  [50, 200, 600, 1500, 3000, 6000].forEach(function (ms) {
    setTimeout(function () {
      if (!savedHTML) capture();
      restore();
    }, ms);
  });

  try {
    var t = null;
    new MutationObserver(function () {
      if (t) clearTimeout(t);
      t = setTimeout(restore, 30);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'src', 'd', 'viewBox', 'innerHTML']
    });
  } catch (e) {}
})();
