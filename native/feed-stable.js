/**
 * tchilo-Pop — anti-flicker do feed
 */
(function () {
  'use strict';

  var injectTimer = null;
  var lastInjectAt = 0;
  var MIN_GAP = 1500;

  function scheduleStableInject() {
    var now = Date.now();
    if (injectTimer) clearTimeout(injectTimer);
    var wait = Math.max(0, MIN_GAP - (now - lastInjectAt));
    injectTimer = setTimeout(function () {
      injectTimer = null;
      lastInjectAt = Date.now();
      try {
        if (typeof window.__tchiloStableMusicInject === 'function') {
          window.__tchiloStableMusicInject();
        }
      } catch (e) {}
    }, wait || 80);
  }

  function stableMusicInject() {
    var feed = document.getElementById('feedList');
    if (!feed) return;

    var posts = typeof getPosts === 'function' ? getPosts() : [];
    var byId = {};
    posts.forEach(function (p) {
      if (p && p.id) byId[String(p.id)] = p;
    });

    feed.querySelectorAll('.post[data-id]').forEach(function (postEl) {
      var id = postEl.getAttribute('data-id');
      var p = byId[id];
      if (!p) return;

      var meta = p.musicMeta || null;
      var label = p.music;
      if (typeof label === 'object' && label && label.title) {
        meta = label;
        label = label.title + (label.artist ? ' · ' + label.artist : '');
      }
      if (!label && meta) {
        label = (meta.title || 'Música') + (meta.artist ? ' · ' + meta.artist : '');
      }
      if (!label && !meta) return;

      var row = postEl.querySelector('.post-music');
      if (!row) {
        row = document.createElement('div');
        row.className = 'post-music';
        row.setAttribute('data-post-music', id);
        row.style.cssText =
          'display:flex;align-items:center;gap:8px;padding:6px 14px 2px;font-size:13px;font-weight:700;color:var(--ink);';
        row.innerHTML =
          '<span class="pm-icon" aria-hidden="true">♪</span><span class="pm-text"></span>';
        var actions = postEl.querySelector('.post-actions');
        if (actions && actions.parentNode) actions.parentNode.insertBefore(row, actions.nextSibling);
        else postEl.appendChild(row);
      }

      var textEl = row.querySelector('.pm-text');
      var nextText = String(label || 'Música');
      if (textEl && textEl.textContent !== nextText) textEl.textContent = nextText;

      var media = postEl.querySelector('.post-media');
      if (media && meta && meta.preview) {
        if (media.getAttribute('data-music-preview') !== meta.preview) {
          media.setAttribute('data-music-preview', meta.preview);
        }
        media.setAttribute('data-music-post', id);
        if (getComputedStyle(media).position === 'static') media.style.position = 'relative';

        if (!media.querySelector('.feed-sound-btn.pm-sound') && !media.querySelector('video.feed-video')) {
          media.insertAdjacentHTML(
            'beforeend',
            '<button type="button" class="feed-sound-btn pm-sound" data-music-post="' +
              id +
              '" aria-label="Som">' +
              '<svg class="icon-muted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15 9.5l4 4M19 9.5l-4 4"/></svg>' +
              '<svg class="icon-sound" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" style="display:none"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a4 4 0 010 7M18 6a7 7 0 010 12"/></svg>' +
              '</button>'
          );
        }
      }
    });
  }

  window.__tchiloStableMusicInject = stableMusicInject;

  function neutralizeNoisyHooks() {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__stableHook) {
      var orig = window.renderFeed;
      window.renderFeed = function () {
        var r = orig.apply(this, arguments);
        scheduleStableInject();
        return r;
      };
      window.renderFeed.__stableHook = true;
      window.renderFeed.__fmp = true;
      window.renderFeed.__pmHook = true;
    }
  }

  function muteDuplicateIntervals() {
    if (document.getElementById('tchiloFeedStableCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeedStableCSS';
    st.textContent =
      '#feedList .post-media img,#feedList .post-media video{' +
      'transition:none!important;}' +
      '#feedList .post{animation:none!important;}' +
      '#feedList .post-music{animation:none!important;}';
    document.head.appendChild(st);
  }

  function boot() {
    muteDuplicateIntervals();
    neutralizeNoisyHooks();
    scheduleStableInject();
    setTimeout(function () {
      neutralizeNoisyHooks();
      scheduleStableInject();
    }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* Tchilo loaders */
(function () {
  try {
    var h = document.head || document.documentElement;
    function add(src) {
      if (document.querySelector('script[src*="' + src.split('?')[0] + '"]')) return;
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      h.appendChild(s);
    }
    add('native/tchilo-feed-lock.js?v=1');
    add('native/tchilo-router.js?v=3');
    add('native/tchilo-app-fix.js?v=1');
    add('native/tchilo-offline.js?v=1');
    add('native/tchilo-push.js?v=1');
    add('native/tchilo-push-wire.js?v=1');
    add('native/tchilo-video-fix.js?v=3');
    add('native/tchilo-thumb-upload.js?v=2');
    add('native/tchilo-avatar-fix.js?v=2');
    add('native/tchilo-profile-photos.js?v=3');
    add('native/tchilo-avatar-add.js?v=1');
    add('native/tchilo-hide-nav.js?v=1');
  } catch (e) {}
})();
