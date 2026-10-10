/**
 * Tchilo performance boost v1
 * - Debounce renderFeed (menos re-renders)
 * - Pausar vídeos fora do ecrã
 * - lazy-load imagens do feed
 * - content-visibility nos posts
 * - Throttle MutationObserver callbacks pesados
 */
(function () {
  'use strict';
  if (window.__tchiloPerfBoostV1) return;
  window.__tchiloPerfBoostV1 = true;

  /* ===== CSS leve ===== */
  function injectCSS() {
    if (document.getElementById('tchiloPerfBoostCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloPerfBoostCSS';
    st.textContent =
      '#feedList .post, #feedList [data-id]{' +
      'content-visibility:auto;' +
      'contain-intrinsic-size:auto 420px;}' +
      '#feedList img, #feedList video{' +
      'content-visibility:auto;}' +
      'img[loading="lazy"]{content-visibility:auto;}';
    (document.head || document.documentElement).appendChild(st);
  }

  /* ===== Debounce renderFeed ===== */
  function patchRenderFeed() {
    if (typeof window.renderFeed !== 'function' || window.renderFeed.__perfDebounced) return;
    var orig = window.renderFeed;
    var t = null;
    var pending = false;
    window.renderFeed = function () {
      var args = arguments;
      var ctx = this;
      pending = true;
      if (t) clearTimeout(t);
      t = setTimeout(function () {
        t = null;
        if (!pending) return;
        pending = false;
        try {
          orig.apply(ctx, args);
        } catch (e) {
          console.warn('renderFeed', e);
        }
        setTimeout(function () {
          lazyImages();
          pauseOffscreenVideos();
        }, 40);
      }, 48);
    };
    window.renderFeed.__perfDebounced = true;
    window.renderFeed.__orig = orig;
  }

  /* ===== Lazy images ===== */
  function lazyImages() {
    try {
      document.querySelectorAll('#feedList img:not([loading]), #screen-feed img:not([loading])').forEach(function (img) {
        try {
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
        } catch (e) {}
      });
    } catch (e) {}
  }

  /* ===== Pausar vídeos fora do ecrã ===== */
  var videoObs = null;
  function pauseOffscreenVideos() {
    try {
      if (!('IntersectionObserver' in window)) return;
      if (!videoObs) {
        videoObs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (en) {
              var v = en.target;
              if (!v || v.tagName !== 'VIDEO') return;
              try {
                if (en.isIntersecting && en.intersectionRatio > 0.35) {
                  /* deixa o player nativo decidir play; não forçamos autoplay */
                } else {
                  if (!v.paused) v.pause();
                }
              } catch (e) {}
            });
          },
          { root: null, rootMargin: '80px', threshold: [0, 0.35, 0.6] }
        );
      }
      document.querySelectorAll('#feedList video, #screen-feed video, #screen-reels video').forEach(function (v) {
        if (v.__tchiloVidObs) return;
        v.__tchiloVidObs = true;
        try {
          videoObs.observe(v);
        } catch (e) {}
      });
    } catch (e) {}
  }

  /* ===== Throttle MutationObserver (wrappers) ===== */
  try {
    if (!window.MutationObserver.__tchiloThrottled) {
      var NativeMO = window.MutationObserver;
      window.MutationObserver = function (cb) {
        var t = null;
        var queued = null;
        function wrapped(mutations, obs) {
          queued = mutations;
          if (t) return;
          t = setTimeout(function () {
            t = null;
            var m = queued;
            queued = null;
            try {
              cb(m, obs);
            } catch (e) {}
          }, 80);
        }
        return new NativeMO(wrapped);
      };
      window.MutationObserver.prototype = NativeMO.prototype;
      window.MutationObserver.__tchiloThrottled = true;
      window.MutationObserver.__native = NativeMO;
    }
  } catch (e) {}

  /* ===== Reduzir work quando tab escondida ===== */
  document.addEventListener(
    'visibilitychange',
    function () {
      if (document.hidden) {
        try {
          document.querySelectorAll('video').forEach(function (v) {
            try {
              if (!v.paused) v.pause();
            } catch (e) {}
          });
          document.querySelectorAll('audio').forEach(function (a) {
            try {
              if (!a.paused) a.pause();
            } catch (e2) {}
          });
        } catch (e) {}
      }
    },
    false
  );

  function boot() {
    injectCSS();
    patchRenderFeed();
    lazyImages();
    pauseOffscreenVideos();
    setTimeout(patchRenderFeed, 600);
    setTimeout(function () {
      lazyImages();
      pauseOffscreenVideos();
    }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
