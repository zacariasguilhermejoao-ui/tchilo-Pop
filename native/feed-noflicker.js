/**
 * tchilo-Pop — loaders (Android-ready)
 */
(function () {
  'use strict';

  var lastRenderAt = 0;
  var pending = null;
  var MIN_MS = 400;

  function loadExtra(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=20260918b';
    s.defer = true;
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
      '#screen-feed .topbar,#screen-feed,#feedList{background:var(--paper,#F3F1E9)!important;}' +
      '.toast,#toast,.toast.show{display:none!important;opacity:0!important;visibility:hidden!important;height:0!important;}' +
      '#tchiloBusy.tchilo-busy,.tchilo-busy.show{display:none!important;}' +
      '#galleryBtn,#faceFxOpenBtn{display:none!important;}';
  }

  function silenceToasts() {
    try {
      window.showToast = function () {};
      window.tchiloShowBusy = function () {};
    } catch (e) {}
  }

  setInterval(silenceToasts, 2000);

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
    [
      ['native/open-cam-now.js', 'data-tchilo-open-cam-now'],
      ['native/deezer-fetch.js', 'data-tchilo-deezer'],
      ['native/music-android-patch.js', 'data-tchilo-music-patch'],
      ['native/boot-fast.js', 'data-tchilo-boot-fast'],
      ['native/android-media-fix.js', 'data-tchilo-android-media'],
      ['native/pt-themes-fix.js', 'data-tchilo-pt-themes'],
      ['native/fx-anchor-fix.js', 'data-tchilo-fx-anchor'],
      ['native/camera-tiktok.js', 'data-tchilo-camera-tiktok'],
      ['native/camera-open-fix.js', 'data-tchilo-camera-open-fix'],
      ['native/camera-no-autoopen.js', 'data-tchilo-camera-no-auto'],
      ['native/nav-layout.js', 'data-tchilo-nav-layout'],
      ['native/feed-music-fix.js', 'data-tchilo-feed-music-fix'],
      ['native/reels-fast.js', 'data-tchilo-reels-fast'],
      ['native/reels-follow-fix.js', 'data-tchilo-reels-follow'],
      ['native/offline-cache.js', 'data-tchilo-offline-cache'],
      ['native/face-fx-pro.js', 'data-tchilo-face-fx-pro'],
      ['native/face-fx-icons.js', 'data-tchilo-face-fx-icons'],
      ['native/fx-chip-icons.js', 'data-tchilo-fx-chip-icons'],
      ['native/fx-cat-neon.js', 'data-tchilo-fx-cat-neon'],
      ['native/face-fx-deliver.js', 'data-tchilo-face-fx-deliver'],
      ['native/password-toggle.js', 'data-tchilo-pw-toggle'],
      ['native/video-preview.js', 'data-tchilo-video-preview']
    ].forEach(function (x) {
      loadExtra(x[0], x[1]);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
