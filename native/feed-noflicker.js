/**
 * tchilo-Pop — loaders
 */
(function () {
  'use strict';

  function loadExtra(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=20260918audio';
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
      '#galleryBtn,#faceFxOpenBtn{display:none!important;}' +
      '.toast,#toast,.toast.show{display:none!important;}';
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
    loadExtra(
      'https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@40b50f4d0007135b7ed210db4a1de2422d87cb3d/native/stable-fix.js',
      'data-tchilo-stable'
    );
    loadExtra('native/gal-thumb.js', 'data-tchilo-gal-thumb');
    loadExtra('native/feed-video-thumbs.js', 'data-tchilo-vid-thumbs');
    loadExtra('native/chat-audio-fix.js', 'data-tchilo-chat-audio');
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
