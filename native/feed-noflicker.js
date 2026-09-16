/**
 * tchilo-Pop — loaders: nav, music, reels, offline, face-fx-pro
 */
(function () {
  'use strict';

  var lastSig = '';
  var lastRenderAt = 0;
  var pending = null;
  var MIN_MS = 600;

  function loadExtra(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.setAttribute(attr, '1');
    (document.head || document.documentElement).appendChild(s);
  }

  function injectCSS() {
    var st = document.getElementById('tchiloNoFlickerCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloNoFlickerCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#feedList .post-media{background:#e8e6de!important;}' +
      '#feedList .post-media img,#feedList .post-media video{background:#e8e6de!important;transition:none!important;}' +
      '#feedList .post{animation:none!important;}' +
      '#screen-feed .topbar{background:var(--paper,#F3F1E9)!important;}' +
      '#screen-feed,#feedList{background:var(--paper,#F3F1E9)!important;}' +
      '.toast,#toast,.toast.show{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;height:0!important;padding:0!important;margin:0!important;}' +
      '#tchiloBusy.tchilo-busy,#tchiloBusy.tchilo-busy.show,.tchilo-busy.show{display:none!important;opacity:0!important;visibility:hidden!important;}';
  }

  function silenceToasts() {
    try {
      window.showToast = function () {};
      window.tchiloShowBusy = function () {};
      window.tchiloHideBusy = function () {};
    } catch (e) {}
    var t = document.getElementById('toast');
    if (t) {
      t.classList.remove('show');
      t.style.display = 'none';
    }
  }

  setInterval(silenceToasts, 1500);

  function wrapRenderFeed() {
    if (typeof window.renderFeed !== 'function' || window.renderFeed.__noflicker) return;
    var orig = window.renderFeed;
    window.renderFeed = function (force) {
      var now = Date.now();
      if (!force && now - lastRenderAt < MIN_MS) {
        if (pending) clearTimeout(pending);
        pending = setTimeout(function () {
          pending = null;
          window.renderFeed(true);
        }, MIN_MS - (now - lastRenderAt));
        return;
      }
      lastRenderAt = now;
      return orig.apply(this, arguments);
    };
    window.renderFeed.__noflicker = true;
  }

  function boot() {
    injectCSS();
    silenceToasts();
    wrapRenderFeed();
    loadExtra('native/nav-layout.js', 'data-tchilo-nav-layout');
    loadExtra('native/feed-music-fix.js', 'data-tchilo-feed-music-fix');
    loadExtra('native/reels-fast.js', 'data-tchilo-reels-fast');
    loadExtra('native/offline-cache.js', 'data-tchilo-offline-cache');
    loadExtra('native/face-fx-pro.js', 'data-tchilo-face-fx-pro');
    setTimeout(function () {
      wrapRenderFeed();
      loadExtra('native/face-fx-pro.js', 'data-tchilo-face-fx-pro');
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
