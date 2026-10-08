/**
 * Tchilo feed-lock v4 — só CSS anti-flicker + quiet music
 * NÃO faz patch em renderFeed — o index controla os posts.
 */
(function () {
  'use strict';
  if (window.__tchiloFeedLockV4) return;
  window.__tchiloFeedLockV4 = true;
  window.__tchiloFeedLock = true;

  function injectCSS() {
    if (document.getElementById('tchiloFeedLockCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeedLockCSS';
    st.textContent =
      '#feedList{' +
      'contain:layout style paint;' +
      'content-visibility:auto;' +
      '}' +
      '#feedList .post{' +
      'animation:none!important;' +
      'transition:none!important;' +
      'contain:layout style;' +
      'content-visibility:auto;' +
      'contain-intrinsic-size:auto 420px;' +
      '}' +
      '#feedList .post-media,' +
      '#feedList .post-media img,' +
      '#feedList .post-media video,' +
      '#feedList .feed-video-wrap,' +
      '#feedList .post-music,' +
      '#feedList .post-actions{' +
      'animation:none!important;' +
      'transition:none!important;' +
      '}' +
      '#feedList img,#feedList video{' +
      'background:#111;' +
      '}' +
      'html,body,#appFrame,#screen-feed,#feedList{background-color:var(--paper,#F7F6F2)!important;}' +
      '#feedList .post-media{background:#111!important;}' +
      '.post{background:var(--paper,#F7F6F2)!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function quietMusicInject() {
    try {
      if (typeof window.__tchiloStableMusicInject === 'function') {
        var inject = window.__tchiloStableMusicInject;
        if (inject.__quiet) return;
        var t = null;
        var last = 0;
        window.__tchiloStableMusicInject = function () {
          var now = Date.now();
          if (now - last < 2000) {
            clearTimeout(t);
            t = setTimeout(function () {
              last = Date.now();
              inject();
            }, 2000);
            return;
          }
          last = now;
          return inject.apply(this, arguments);
        };
        window.__tchiloStableMusicInject.__quiet = true;
      }
    } catch (e) {}
  }

  function hardenMediaNodes(root) {
    root = root || document.getElementById('feedList');
    if (!root) return;
    root.querySelectorAll('img[src], video[src]').forEach(function (el) {
      if (el.__srcGuard) return;
      el.__srcGuard = true;
      try {
        el.addEventListener(
          'load',
          function () {
            el.classList.add('media-ready');
          },
          { once: true }
        );
      } catch (e) {}
    });
  }

  function boot() {
    injectCSS();
    quietMusicInject();
    hardenMediaNodes();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);

  try {
    var feed = document.getElementById('feedList');
    if (feed && !feed.__lockObs) {
      feed.__lockObs = true;
      var deb = null;
      new MutationObserver(function () {
        clearTimeout(deb);
        deb = setTimeout(function () {
          hardenMediaNodes(feed);
        }, 300);
      }).observe(feed, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
