/**
 * Tchilo — trava o feed contra piscar (re-renders e injeções em cascata)
 * perf: sem setInterval 400ms — só boot + observer com debounce
 */
(function () {
  'use strict';
  if (window.__tchiloFeedLock) return;
  window.__tchiloFeedLock = true;

  var lastFingerprint = '';
  var lastRenderAt = 0;
  var MIN_RENDER_GAP = 1200;
  var pendingRender = null;

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
      /* evita flash verde/branco de fundo */
      'html,body,#appFrame,#screen-feed,#feedList{background-color:var(--paper,#F7F6F2)!important;}' +
      '#feedList .post-media{background:#111!important;}' +
      '.post{background:var(--paper,#F7F6F2)!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function fingerprintPosts() {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!Array.isArray(posts)) return '';
      return posts
        .slice(0, 40)
        .map(function (p) {
          if (!p) return '';
          return String(p.id) + ':' + String(p.likes || 0) + ':' + String((p.caption || '').length);
        })
        .join('|');
    } catch (e) {
      return String(Date.now());
    }
  }

  function fingerprintDOM() {
    try {
      var feed = document.getElementById('feedList');
      if (!feed) return '';
      var ids = [];
      feed.querySelectorAll('.post[data-id]').forEach(function (el) {
        ids.push(el.getAttribute('data-id'));
      });
      return ids.join('|');
    } catch (e) {
      return '';
    }
  }

  function patchRenderFeed() {
    if (typeof window.renderFeed !== 'function') return false;
    if (window.renderFeed.__feedLocked) return true;

    var orig = window.renderFeed;
    window.renderFeed = function () {
      var now = Date.now();
      var fp = fingerprintPosts();
      var domFp = fingerprintDOM();

      /* Mesmos posts e DOM já está alinhado → não re-renderiza */
      if (fp && fp === lastFingerprint && domFp) {
        var ids = fp.split('|').map(function (x) { return x.split(':')[0]; }).join('|');
        if (ids === domFp) return;
      }

      if (fp && domFp) {
        var ids2 = fp.split('|').map(function (x) {
          return x.split(':')[0];
        }).join('|');
        if (ids2 === domFp && now - lastRenderAt < 5000) {
          lastFingerprint = fp;
          return;
        }
      }

      if (now - lastRenderAt < MIN_RENDER_GAP) {
        clearTimeout(pendingRender);
        pendingRender = setTimeout(function () {
          pendingRender = null;
          lastRenderAt = 0;
          window.renderFeed();
        }, MIN_RENDER_GAP - (now - lastRenderAt));
        return;
      }

      lastRenderAt = now;
      lastFingerprint = fp;
      return orig.apply(this, arguments);
    };
    window.renderFeed.__feedLocked = true;
    window.renderFeed.__stableHook = true;
    window.renderFeed.__fmp = true;
    window.renderFeed.__pmHook = true;
    window.renderFeed.__offlineWarm = true;
    return true;
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

  function quietVideoPosters() {
    try {
      var feed = document.getElementById('feedList');
      if (!feed || feed.__posterQuiet) return;
      feed.__posterQuiet = true;
      feed.querySelectorAll('video').forEach(function (v) {
        if (v.getAttribute('poster') || v.dataset.posterDone === '1') {
          v.dataset.posterDone = '1';
        }
      });
    } catch (e) {}
  }

  function lockChrome() {
    try {
      window.feedChromeLock = true;
      window.feedChromeState = 'shown';
      var frame = document.getElementById('appFrame');
      if (frame) frame.classList.remove('chrome-hidden');
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    lockChrome();
    patchRenderFeed();
    quietMusicInject();
    quietVideoPosters();
    hardenMediaNodes();
  }

  /* só boot pontual — SEM setInterval contínuo */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 900);
  setTimeout(boot, 2000);

  try {
    var feed = document.getElementById('feedList');
    if (feed && !feed.__lockObs) {
      feed.__lockObs = true;
      var deb = null;
      new MutationObserver(function () {
        clearTimeout(deb);
        deb = setTimeout(function () {
          hardenMediaNodes(feed);
          quietVideoPosters();
          patchRenderFeed();
        }, 250);
      }).observe(feed, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
