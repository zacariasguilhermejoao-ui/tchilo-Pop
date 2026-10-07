/**
 * Tchilo feed video v2
 * - media-ready (videos visiveis)
 * - autoplay muted quando visivel
 * - toque abre Reels / play
 */
(function () {
  'use strict';
  if (window.__tchiloFeedVideoUiV2) return;
  window.__tchiloFeedVideoUiV2 = true;

  function injectCSS() {
    if (document.getElementById('tchiloFeedVideoUiCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeedVideoUiCSS';
    st.textContent =
      '.feed-video-wrap,.post-media:has(video){position:relative!important;}' +
      '.post-media video.feed-video,.feed-video-wrap video{' +
      'opacity:1!important;background:#000!important;}' +
      '.tchilo-feed-play{' +
      'position:absolute!important;left:50%!important;top:50%!important;' +
      'transform:translate(-50%,-50%)!important;' +
      'width:56px!important;height:56px!important;border-radius:50%!important;' +
      'background:rgba(0,0,0,.45)!important;border:2.5px solid #fff!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'pointer-events:none!important;z-index:6!important;}' +
      '.tchilo-feed-play svg{width:22px!important;height:22px!important;margin-left:3px;fill:#fff!important;}' +
      '.feed-video-wrap.is-playing .tchilo-feed-play{opacity:0!important;transition:opacity .2s;}';
    document.head.appendChild(st);
  }

  function playSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  }

  function enhanceOne(vid) {
    if (!vid || vid.__tchiloVidV2) return;
    vid.__tchiloVidV2 = true;
    try {
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.setAttribute('webkit-playsinline', '');
      vid.preload = 'metadata';
      vid.classList.add('media-ready');
      vid.style.opacity = '1';
    } catch (e) {}

    var wrap =
      vid.closest('.feed-video-wrap') ||
      vid.closest('.post-media') ||
      vid.parentElement;
    if (wrap && !wrap.querySelector('.tchilo-feed-play')) {
      wrap.style.position = wrap.style.position || 'relative';
      var badge = document.createElement('div');
      badge.className = 'tchilo-feed-play';
      badge.innerHTML = playSvg();
      wrap.appendChild(badge);
    }

    vid.addEventListener('playing', function () {
      if (wrap) wrap.classList.add('is-playing');
    });
    vid.addEventListener('pause', function () {
      if (wrap) wrap.classList.remove('is-playing');
    });
    vid.addEventListener('loadeddata', function () {
      vid.classList.add('media-ready');
      vid.style.opacity = '1';
    });
    vid.addEventListener('error', function () {
      vid.classList.add('media-ready');
      vid.style.opacity = '1';
    });
  }

  function enhanceAll() {
    injectCSS();
    document
      .querySelectorAll('#feedList video.feed-video, #feedList .feed-video-wrap video, #feedList .post-media video')
      .forEach(enhanceOne);
  }

  function setupObserver() {
    var feed = document.getElementById('feedList');
    if (!feed || feed.__tchiloVidObsV2) return;
    feed.__tchiloVidObsV2 = true;

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (!v || v.tagName !== 'VIDEO') return;
          enhanceOne(v);
          if (en.isIntersecting && en.intersectionRatio >= 0.35) {
            try {
              v.muted = true;
              var p = v.play();
              if (p && p.catch) p.catch(function () {});
            } catch (e) {}
          } else {
            try {
              v.pause();
            } catch (e2) {}
          }
        });
      },
      { root: feed, threshold: [0.35, 0.6] }
    );

    function observeAll() {
      feed.querySelectorAll('video.feed-video, video').forEach(function (v) {
        enhanceOne(v);
        try {
          obs.observe(v);
        } catch (e) {}
      });
    }
    observeAll();

    try {
      new MutationObserver(function () {
        observeAll();
      }).observe(feed, { childList: true, subtree: true });
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    enhanceAll();
    setupObserver();
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 3000);

  /* apos renderFeed */
  if (typeof window.renderFeed === 'function' && !window.renderFeed.__vidV2) {
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      setTimeout(boot, 30);
      setTimeout(boot, 200);
      return r;
    };
    window.renderFeed.__vidV2 = true;
  }
})();
