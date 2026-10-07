/**
 * Tchilo — ícone Reels (claquete + play, SVG) 34px
 * perf: aplica no boot; observer com debounce; não reescreve se já estiver certo
 */
(function () {
  'use strict';
  if (window.__tchiloReelsIcon) return;
  window.__tchiloReelsIcon = true;

  var ICON_SRC = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9Im5vbmUiPjxnIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iNC41Ii8+PHBhdGggZD0iTTMuMiA4LjVoMTcuNiIvPjxwYXRoIGQ9Ik04LjYgMy4ybDIuNCA1LjMiLz48cGF0aCBkPSJNMTQuNCAzLjJsMi40IDUuMyIvPjxwYXRoIGQ9Ik0xMC40IDExLjh2Nmw1LTN6Ii8+PC9nPjwvc3ZnPg==';

  function injectCSS() {
    if (document.getElementById('tchiloReelsIconCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloReelsIconCSS';
    st.textContent =
      '.nav-item .nav-reels-icon,' +
      '.nav-item img.nav-reels-icon{' +
      'width:34px!important;height:34px!important;' +
      'display:block!important;object-fit:contain;' +
      'flex-shrink:0;}' +
      '.nav-item svg.nav-reels-icon{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function replaceIn(btn) {
    if (!btn) return;
    var existing = btn.querySelector('img.nav-reels-icon');
    if (existing && existing.getAttribute('src') === ICON_SRC) return;
    if (existing) {
      existing.src = ICON_SRC;
      return;
    }
    btn.querySelectorAll('svg, .nav-text-icon, .nav-sms-text').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var img = document.createElement('img');
    img.className = 'nav-reels-icon';
    img.alt = 'Reels';
    img.width = 34;
    img.height = 34;
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

  var _t = null;
  function debouncedApply() {
    if (_t) return;
    _t = setTimeout(function () {
      _t = null;
      apply();
    }, 200);
  }

  function boot() {
    apply();
    setTimeout(apply, 500);
    setTimeout(apply, 2000);
    try {
      var nav = document.querySelector('.navbar');
      if (nav && !nav.__reelsIconObs) {
        nav.__reelsIconObs = true;
        new MutationObserver(debouncedApply).observe(nav, { childList: true, subtree: true });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
