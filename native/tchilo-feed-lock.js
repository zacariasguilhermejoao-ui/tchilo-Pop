/**
 * Tchilo — trava o feed contra piscar (re-renders em cascata)
 * v3: muito menos agressivo — deixa posts aparecerem sempre
 * - só evita re-render idêntico nos últimos 800ms
 * - NÃO bloqueia quando o DOM está vazio
 * - sem setInterval contínuo
 */
(function () {
  'use strict';
  if (window.__tchiloFeedLockV3) return;
  window.__tchiloFeedLockV3 = true;
  window.__tchiloFeedLock = true;

  var lastFingerprint = '';
  var lastRenderAt = 0;
  var MIN_RENDER_GAP = 600;
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
      'html,body,#appFrame,#screen-feed,#feedList{background-color:var(--paper,#F7F6F2)!important;}' +
      '#feedList .post-media{background:#111!important;}' +
      '.post{background:var(--paper,#F7F6F2)!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function fingerprintPosts() {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!Array.isArray(posts) || !posts.length) return '';
      return posts
        .slice(0, 30)
        .map(function (p) {
          if (!p) return '';
          return String(p.id || '') + ':' + String(p.likes || 0);
        })
        .join('|');
    } catch (e) {
      return '';
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
    if (window.renderFeed.__feedLockedV3) return true;

    var orig = window.renderFeed;
    window.renderFeed = function () {
      var now = Date.now();
      var fp = fingerprintPosts();
      var domFp = fingerprintDOM();

      /* Se o DOM está vazio e existem posts → SEMPRE renderiza */
      if (fp && !domFp) {
        lastRenderAt = now;
        lastFingerprint = fp;
        return orig.apply(this, arguments);
      }

      /* Mesmos posts + DOM já alinhado + render recente → evita piscar */
      if (fp && fp === lastFingerprint && domFp) {
        var ids = fp.split('|').map(function (x) { return x.split(':')[0]; }).join('|');
        if (ids === domFp && now - lastRenderAt < 2500) {
          return;
        }
      }

      /* Gap mínimo só para cascata de chamadas muito próximas */
      if (now - lastRenderAt < MIN_RENDER_GAP && lastFingerprint) {
        clearTimeout(pendingRender);
        pendingRender = setTimeout(function () {
          pendingRender = null;
          lastRenderAt = 0;
          window.renderFeed();
        }, MIN_RENDER_GAP - (now - lastRenderAt));
        return;
      }

      lastRenderAt = now;
      lastFingerprint = fp || lastFingerprint;
      return orig.apply(this, arguments);
    };
    window.renderFeed.__feedLockedV3 = true;
    window.renderFeed.__feedLocked = true;
    window.renderFeed.__stableHook = true;
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 1800);

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
        }, 300);
      }).observe(feed, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
