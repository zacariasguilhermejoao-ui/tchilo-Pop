/**
 * tchilo-Pop — loaders
 */
(function () {
  'use strict';

  function loadExtra(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=20260921ads3';
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
      '#feedList video{animation:none!important;}' +
      '#galleryBtn,#faceFxOpenBtn{display:none!important;}' +
      '.toast.busy,#toast.busy{display:none!important;}' +
      '#tchiloCamFxTrack .chip img{object-fit:contain!important;object-position:center!important;background:#1a1a1a!important;}';
  }

  function silenceBusyOnly() {
    try {
      if (typeof showToast === 'function' && !window.__tchiloRealShowToast) {
        window.__tchiloRealShowToast = showToast;
      }
      if (typeof window.tchiloShowBusy === 'function') {
        window.tchiloShowBusy = function () {};
      }
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    silenceBusyOnly();
    loadExtra('native/fx-live-patch.js', 'data-tchilo-fx-live');
    loadExtra('native/paddle-premium.js', 'data-tchilo-paddle');
    loadExtra('native/paddle-ad-guard.js', 'data-tchilo-paddle-guard');
    loadExtra('native/tchilo-ads.js', 'data-tchilo-ads');
    loadExtra('native/tchilo-ads-ui.js', 'data-tchilo-ads-ui');
    loadExtra('native/gal-thumb.js', 'data-tchilo-gal-thumb');
    loadExtra('native/feed-video-thumbs.js', 'data-tchilo-vid-thumbs');
    loadExtra('native/chat-audio-fix.js', 'data-tchilo-chat-audio');
    loadExtra('native/chat-send-fix.js', 'data-tchilo-chat-send');
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
      ['native/password-toggle.js', 'data-tchilo-pw-toggle']
    ].forEach(function (x) {
      loadExtra(x[0], x[1]);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
