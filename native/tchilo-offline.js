/**
 * Tchilo — cliente offline: regista SW, aquece cache de media do feed
 */
(function () {
  'use strict';
  if (window.__tchiloOfflineBoot) return;
  window.__tchiloOfflineBoot = true;

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then(function (reg) {
        try {
          reg.update();
        } catch (e) {}
        if (reg.waiting) {
          try {
            reg.waiting.postMessage({ type: 'TCHILO_SKIP_WAITING' });
          } catch (e) {}
        }
        reg.addEventListener('updatefound', function () {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function () {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              try {
                nw.postMessage({ type: 'TCHILO_SKIP_WAITING' });
              } catch (e) {}
            }
          });
        });
      })
      .catch(function () {});

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      /* nova versão ativa — não forçar reload para não interromper o user */
    });
  }

  function warmFromFeed() {
    try {
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
      var urls = [];
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      (posts || []).slice(0, 30).forEach(function (p) {
        if (!p) return;
        if (p.media) urls.push(p.media);
        if (p.thumbnail) urls.push(p.thumbnail);
        if (p.poster) urls.push(p.poster);
        if (Array.isArray(p.mediaItems)) {
          p.mediaItems.forEach(function (m) {
            if (m && m.url) urls.push(m.url);
            if (m && (m.thumbnail || m.poster)) urls.push(m.thumbnail || m.poster);
          });
        }
      });
      document.querySelectorAll('#feedList img[src], #feedList video[src], #feedList video[poster]').forEach(function (el) {
        if (el.src && el.src.indexOf('blob:') !== 0) urls.push(el.src);
        if (el.poster) urls.push(el.poster);
      });
      urls = urls.filter(Boolean).filter(function (u, i, a) {
        return a.indexOf(u) === i;
      });
      if (urls.length) {
        navigator.serviceWorker.controller.postMessage({ type: 'TCHILO_WARM', urls: urls });
      }
    } catch (e) {}
  }

  function boot() {
    registerSW();
    setTimeout(warmFromFeed, 1500);
    setTimeout(warmFromFeed, 5000);
    window.addEventListener('online', function () {
      setTimeout(warmFromFeed, 800);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* re-aquece depois de render do feed */
  if (typeof window.renderFeed === 'function' && !window.renderFeed.__offlineWarm) {
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      setTimeout(warmFromFeed, 600);
      return r;
    };
    window.renderFeed.__offlineWarm = true;
  } else {
    setTimeout(function () {
      if (typeof window.renderFeed === 'function' && !window.renderFeed.__offlineWarm) {
        var o = window.renderFeed;
        window.renderFeed = function () {
          var r = o.apply(this, arguments);
          setTimeout(warmFromFeed, 600);
          return r;
        };
        window.renderFeed.__offlineWarm = true;
      }
    }, 2000);
  }
})();
