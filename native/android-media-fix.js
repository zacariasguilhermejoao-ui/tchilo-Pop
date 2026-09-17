/**
 * tchilo-Pop — media no Android WebView (Capacitor)
 * Miniaturas, vídeos muted, play inline, retry de src
 */
(function () {
  'use strict';

  function isAndroid() {
    try {
      if (window.Capacitor && window.Capacitor.getPlatform) {
        return window.Capacitor.getPlatform() === 'android';
      }
    } catch (e) {}
    return /Android/i.test(navigator.userAgent || '');
  }

  function injectCSS() {
    if (document.getElementById('tchiloAndroidMediaCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAndroidMediaCSS';
    st.textContent =
      '#feedList img, #feedList video, .post-media img, .post-media video{' +
      'max-width:100%;background:#e8e6de;}' +
      '#feedList video, .post-media video{' +
      'object-fit:cover;width:100%;min-height:180px;}' +
      '#feedList img, .post-media img{' +
      'object-fit:cover;width:100%;display:block;}' +
      '.story-card img, .story-card video{object-fit:cover;}';
    document.head.appendChild(st);
  }

  function fixVideo(v) {
    if (!v || v.dataset.androidFix === '1') return;
    v.dataset.androidFix = '1';
    try {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('x5-playsinline', '');
      v.playsInline = true;
      v.preload = v.preload === 'none' ? 'metadata' : v.preload || 'metadata';
      // ajuda alguns WebViews a mostrar 1º frame
      if (!v.getAttribute('poster') && v.src) {
        // sem poster externo — força load metadata
        try {
          v.load();
        } catch (e) {}
      }
    } catch (e2) {}
  }

  function fixImg(img) {
    if (!img || img.dataset.androidFix === '1') return;
    img.dataset.androidFix = '1';
    try {
      img.loading = img.loading || 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      // retry uma vez se falhar
      img.addEventListener(
        'error',
        function onErr() {
          img.removeEventListener('error', onErr);
          var src = img.getAttribute('src') || img.src;
          if (!src || img.dataset.retried === '1') return;
          img.dataset.retried = '1';
          var sep = src.indexOf('?') >= 0 ? '&' : '?';
          img.src = src + sep + 't=' + Date.now();
        },
        { once: true }
      );
    } catch (e) {}
  }

  function scan() {
    document.querySelectorAll('#feedList video, .post-media video, .story-card video, #reelsViewer video').forEach(fixVideo);
    document.querySelectorAll('#feedList img, .post-media img, .story-card img').forEach(fixImg);
  }

  function tryPlayVisible() {
    var videos = document.querySelectorAll('#feedList video');
    videos.forEach(function (v) {
      fixVideo(v);
      try {
        var r = v.getBoundingClientRect();
        var visible = r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
        if (visible) {
          v.muted = true;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      } catch (e) {}
    });
  }

  // Android: primeiro toque desbloqueia autoplay
  function unlockAudio() {
    document.removeEventListener('touchstart', unlockAudio, true);
    document.removeEventListener('click', unlockAudio, true);
    tryPlayVisible();
  }

  function hookRender() {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__androidMedia) {
      var orig = window.renderFeed;
      window.renderFeed = function () {
        var r = orig.apply(this, arguments);
        setTimeout(scan, 20);
        setTimeout(scan, 200);
        setTimeout(tryPlayVisible, 400);
        return r;
      };
      window.renderFeed.__androidMedia = true;
    }
  }

  function boot() {
    injectCSS();
    scan();
    hookRender();
    document.addEventListener('touchstart', unlockAudio, true);
    document.addEventListener('click', unlockAudio, true);
    setTimeout(function () {
      scan();
      hookRender();
      tryPlayVisible();
    }, 500);
    setTimeout(scan, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
