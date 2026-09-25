/**
 * Tchilo — ícone Reels (claquete + play) no tamanho do ícone antigo (26px)
 */
(function () {
  'use strict';
  if (window.__tchiloReelsIcon) return;
  window.__tchiloReelsIcon = true;

  var ICON_SRC = 'data:image/png;base64,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';

  function injectCSS() {
    if (document.getElementById('tchiloReelsIconCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloReelsIconCSS';
    st.textContent =
      '.nav-item .nav-reels-icon,' +
      '.nav-item img.nav-reels-icon{' +
      'width:26px!important;height:26px!important;' +
      'display:block!important;object-fit:contain;' +
      'flex-shrink:0;}' +
      '.nav-item svg.nav-reels-icon{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function replaceIn(btn) {
    if (!btn) return;
    var existing = btn.querySelector('img.nav-reels-icon');
    if (existing) {
      if (existing.getAttribute('src') !== ICON_SRC) existing.src = ICON_SRC;
      return;
    }
    btn.querySelectorAll('svg, .nav-text-icon, .nav-sms-text').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var img = document.createElement('img');
    img.className = 'nav-reels-icon';
    img.alt = 'Reels';
    img.width = 26;
    img.height = 26;
    img.src = ICON_SRC;
    img.draggable = false;
    var dot = btn.querySelector('.dot');
    if (dot) btn.insertBefore(img, dot);
    else btn.insertBefore(img, btn.firstChild);
  }

  function apply() {
    injectCSS();
    var btn =
      document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
      document.querySelector('.navbar .nav-item[aria-label="Reels"]');
    if (!btn) {
      var items = document.querySelectorAll('.navbar .nav-item');
      if (items.length >= 2) btn = items[1];
    }
    if (btn) replaceIn(btn);
  }

  function boot() {
    apply();
    setTimeout(apply, 400);
    setTimeout(apply, 1200);
    setTimeout(apply, 3000);
    try {
      var nav = document.querySelector('.navbar');
      if (nav && !nav.__reelsIconObs) {
        nav.__reelsIconObs = true;
        new MutationObserver(function () {
          apply();
        }).observe(nav, { childList: true, subtree: true });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
