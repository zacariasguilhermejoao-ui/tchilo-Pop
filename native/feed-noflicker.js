/**
 * tchilo-Pop — anti-piscar + loaders (nav, music, reels, offline-cache)
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

  function killToastEl() {
    var t = document.getElementById('toast');
    if (t) {
      t.classList.remove('show');
      t.style.cssText = 'display:none!important;opacity:0!important;visibility:hidden!important;height:0!important;';
      t.textContent = '';
    }
    var busy = document.getElementById('tchiloBusy');
    if (busy) {
      busy.classList.remove('show');
      busy.style.display = 'none';
    }
  }

  function silenceToasts() {
    var noop = function () {
      killToastEl();
    };
    try {
      window.showToast = noop;
    } catch (e) {}
    try {
      window.tchiloShowBusy = function () {};
      window.tchiloHideBusy = killToastEl;
    } catch (e2) {}
    killToastEl();
  }

  setInterval(function () {
    silenceToasts();
  }, 1500);

  function portuguesePlaceholders() {
    var title = document.getElementById('createTitle');
    if (title) title.setAttribute('placeholder', 'Texto grande (ex: NOITE ÉPICA)');
  }

  function feedSignature() {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!Array.isArray(posts)) return '';
      var parts = [];
      for (var i = 0; i < Math.min(posts.length, 80); i++) {
        var p = posts[i];
        if (!p) continue;
        parts.push(String(p.id) + ':' + String(p.username || '') + ':' + String(p.likes || 0));
      }
      return parts.join('|') + '#' + posts.length;
    } catch (e) {
      return String(Date.now());
    }
  }

  function wrapRenderFeed() {
    if (typeof window.renderFeed !== 'function' || window.renderFeed.__noflicker) return;
    var orig = window.renderFeed;
    window.renderFeed = function (force) {
      var now = Date.now();
      var sig = feedSignature();
      if (!force && sig && sig === lastSig) {
        var feed = document.getElementById('feedList');
        if (feed && feed.querySelector('.post[data-id]')) return;
      }
      if (!force && now - lastRenderAt < MIN_MS) {
        if (pending) clearTimeout(pending);
        pending = setTimeout(function () {
          pending = null;
          window.renderFeed(true);
        }, MIN_MS - (now - lastRenderAt));
        return;
      }
      lastRenderAt = now;
      lastSig = sig;
      return orig.apply(this, arguments);
    };
    window.renderFeed.__noflicker = true;
  }

  function boot() {
    injectCSS();
    silenceToasts();
    portuguesePlaceholders();
    wrapRenderFeed();
    loadExtra('native/nav-layout.js', 'data-tchilo-nav-layout');
    loadExtra('native/feed-music-fix.js', 'data-tchilo-feed-music-fix');
    loadExtra('native/reels-fast.js', 'data-tchilo-reels-fast');
    loadExtra('native/offline-cache.js', 'data-tchilo-offline-cache');
    setTimeout(function () {
      silenceToasts();
      wrapRenderFeed();
      injectCSS();
      loadExtra('native/nav-layout.js', 'data-tchilo-nav-layout');
      loadExtra('native/feed-music-fix.js', 'data-tchilo-feed-music-fix');
      loadExtra('native/reels-fast.js', 'data-tchilo-reels-fast');
      loadExtra('native/offline-cache.js', 'data-tchilo-offline-cache');
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
