/**
 * tchilo-Pop — boot critico (Reels icon + loaders)
 * perf: aplica uma vez no boot; observer com debounce (sem setInterval)
 */
(function () {
  'use strict';
  if (window.__tchiloCritBootV4) return;
  window.__tchiloCritBootV4 = true;

  var REELS_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9Im5vbmUiPjxnIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iNC41Ii8+PHBhdGggZD0iTTMuMiA4LjVoMTcuNiIvPjxwYXRoIGQ9Ik04LjYgMy4ybDIuNCA1LjMiLz48cGF0aCBkPSJNMTQuNCAzLjJsMi40IDUuMyIvPjxwYXRoIGQ9Ik0xMC40IDExLjh2Nmw1LTN6Ii8+PC9nPjwvc3ZnPg==";

  function injectCriticalCSS() {
    if (document.getElementById('tchiloCriticalCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloCriticalCSS';
    st.textContent =
      '.nav-item .nav-text-icon.nav-fee{display:inline-flex;align-items:center;justify-content:center;width:36px;height:32px;font:900 19px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;letter-spacing:-.04em;color:currentColor}' +
      '.nav-item .nav-reels-icon,.nav-item img.nav-reels-icon{width:34px!important;height:34px!important;display:block!important;object-fit:contain;flex-shrink:0}' +
      '.nav-item svg.nav-reels-icon{display:none!important}' +
      '.nav-sms-text{display:inline-flex;align-items:center;justify-content:center;font:900 18px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif!important;color:currentColor;border:none!important;background:none!important}' +
      '#screen-feed .topbar-icons .icon-btn,.topbar-icons .icon-btn{width:auto!important;height:auto!important;min-width:0!important;border:0!important;background:transparent!important;box-shadow:none!important;padding:4px!important}';
    (document.head || document.documentElement).appendChild(st);
  }

  function setReelsIcon() {
    injectCriticalCSS();
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    var btn =
      nav.querySelector('.nav-item[data-screen="reels"]') ||
      nav.querySelector('.nav-item[aria-label="Reels"]') ||
      nav.querySelectorAll('.nav-item')[1];
    if (!btn) return;

    if (btn.getAttribute('data-screen') === 'messages') {
      btn.setAttribute('data-screen', 'reels');
      btn.setAttribute('aria-label', 'Reels');
      btn.onclick = function (e) {
        e.preventDefault();
        if (typeof openReels === 'function') openReels();
      };
    }

    /* já tem o ícone certo — não mexer (evita piscar) */
    var img = btn.querySelector('img.nav-reels-icon');
    if (img && img.getAttribute('src') === REELS_ICON) return;

    btn.querySelectorAll('svg, .nav-text-icon, .nav-sms-text').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });

    if (!img) {
      img = document.createElement('img');
      img.className = 'nav-reels-icon';
      img.alt = 'Reels';
      img.width = 34;
      img.height = 34;
      img.draggable = false;
      var dot = btn.querySelector('.dot');
      if (dot) btn.insertBefore(img, dot);
      else btn.insertBefore(img, btn.firstChild);
    }
    img.src = REELS_ICON;
  }

  function setFee() {
    var feedBtn =
      document.querySelector('.navbar .nav-item[data-screen="feed"]') ||
      document.querySelector('.navbar .nav-item[onclick*="onNavFeed"]');
    if (!feedBtn) return;
    feedBtn.querySelectorAll('.nav-fee').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
  }

  function bootUI() {
    setFee();
    setReelsIcon();
  }

  var _t = null;
  function debouncedBoot() {
    if (_t) return;
    _t = setTimeout(function () {
      _t = null;
      bootUI();
    }, 200);
  }

  injectCriticalCSS();
  bootUI();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootUI);
  setTimeout(bootUI, 400);
  setTimeout(bootUI, 1500);
  /* sem setInterval — só observer com debounce */
  try {
    var nav = document.querySelector('.navbar');
    if (nav && !nav.__reelsObs) {
      nav.__reelsObs = true;
      new MutationObserver(debouncedBoot).observe(nav, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
