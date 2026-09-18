/**
 * tchilo-Pop — loaders mínimos + stable-fix
 */
(function () {
  'use strict';

  function loadExtra(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=20260918stable';
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
      '#feedList .post{animation:none!important;}' +
      '#feedList .post-media{background:#e8e6de!important;}' +
      '#feedList .post-media img,#feedList .post-media video{background:#111!important;transition:none!important;}' +
      '#screen-feed .topbar,#screen-feed,#feedList{background:var(--paper,#F3F1E9)!important;}' +
      '.toast,#toast,.toast.show{display:none!important;}' +
      '#galleryBtn,#faceFxOpenBtn{display:none!important;}';
  }

  function silenceToasts() {
    try {
      window.showToast = function () {};
      window.tchiloShowBusy = function () {};
    } catch (e) {}
  }

  setInterval(silenceToasts, 3000);

  function boot() {
    injectCSS();
    silenceToasts();
    // stable-fix PRIMEIRO — câmara + anti-piscar
    loadExtra('native/stable-fix.js', 'data-tchilo-stable');
    // extras úteis (sem re-carregar câmara competindo)
    [
      ['native/deezer-fetch.js', 'data-tchilo-deezer'],
      ['native/music-android-patch.js', 'data-tchilo-music-patch'],
      ['native/boot-fast.js', 'data-tchilo-boot-fast'],
      ['native/android-media-fix.js', 'data-tchilo-android-media'],
      ['native/pt-themes-fix.js', 'data-tchilo-pt-themes'],
      ['native/nav-layout.js', 'data-tchilo-nav-layout'],
      ['native/feed-music-fix.js', 'data-tchilo-feed-music-fix'],
      ['native/reels-fast.js', 'data-tchilo-reels-fast'],
      ['native/reels-follow-fix.js', 'data-tchilo-reels-follow'],
      ['native/offline-cache.js', 'data-tchilo-offline-cache'],
      ['native/face-fx-deliver.js', 'data-tchilo-face-fx-deliver'],
      ['native/password-toggle.js', 'data-tchilo-pw-toggle']
    ].forEach(function (x) {
      loadExtra(x[0], x[1]);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
