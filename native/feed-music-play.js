/**
 * tchilo-Pop — música no feed (sem re-injeções que fazem piscar)
 */
(function () {
  'use strict';

  var feedAudio = null;
  var feedAudioPostId = null;
  var feedObserver = null;
  var injectQueued = false;

  function stopFeedAudio() {
    if (feedAudio) {
      try {
        feedAudio.pause();
        feedAudio.src = '';
      } catch (e) {}
      feedAudio = null;
    }
    feedAudioPostId = null;
    document.querySelectorAll('.post-music.playing').forEach(function (el) {
      el.classList.remove('playing');
    });
    document.querySelectorAll('.feed-sound-btn.pm-sound.on').forEach(function (b) {
      b.classList.remove('on');
    });
  }

  function playUrl(postId, url, unmuted) {
    if (!url) return Promise.resolve(false);
    if (feedAudioPostId === postId && feedAudio) {
      feedAudio.muted = !unmuted;
      if (feedAudio.paused) {
        return feedAudio.play().then(function () {
          return true;
        }).catch(function () {
          return false;
        });
      }
      return Promise.resolve(true);
    }
    stopFeedAudio();
    feedAudio = new Audio();
    feedAudio.preload = 'auto';
    feedAudio.loop = true;
    try {
      feedAudio.crossOrigin = 'anonymous';
    } catch (e) {}
    feedAudio.src = url;
    feedAudio.muted = !unmuted;
    feedAudioPostId = postId;
    return feedAudio
      .play()
      .then(function () {
        var row = document.querySelector('.post-music[data-post-music="' + postId + '"]');
        if (row) row.classList.add('playing');
        var btn = document.querySelector('.feed-sound-btn.pm-sound[data-music-post="' + postId + '"]');
        if (btn) btn.classList.toggle('on', unmuted);
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function getMeta(p) {
    if (!p) return null;
    if (p.musicMeta) return p.musicMeta;
    if (p.music && typeof p.music === 'object' && p.music.preview) return p.music;
    if (p.musicPreview) {
      return { preview: p.musicPreview, title: p.musicTitle || p.music, artist: p.musicArtist || '' };
    }
    return null;
  }

  function injectOnce() {
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
      var meta = getMeta(p);
      var label = p.music;
      if (typeof label === 'object' && label && label.title) {
        label = label.title + (label.artist ? ' · ' + label.artist : '');
      }
      if (!label && meta) label = (meta.title || 'Música') + (meta.artist ? ' · ' + meta.artist : '');
      if (!label && !meta) return;

      var row = postEl.querySelector('.post-music');
      if (!row) {
        row = document.createElement('div');
        row.className = 'post-music';
        row.setAttribute('data-post-music', id);
        row.style.cssText =
          'display:flex;align-items:center;gap:8px;padding:6px 14px 2px;font-size:13px;font-weight:700;color:var(--ink)';
        row.innerHTML =
          '<span class="pm-icon" aria-hidden="true">♪</span><span class="pm-text"></span>';
        var actions = postEl.querySelector('.post-actions');
        if (actions && actions.parentNode) actions.parentNode.insertBefore(row, actions.nextSibling);
        else postEl.appendChild(row);
      }
      var textEl = row.querySelector('.pm-text');
      var next = String(label || 'Música');
      if (textEl && textEl.textContent !== next) textEl.textContent = next;

      var media = postEl.querySelector('.post-media');
      if (!media || !meta || !meta.preview) return;
      if (getComputedStyle(media).position === 'static') media.style.position = 'relative';
      if (media.getAttribute('data-music-preview') !== meta.preview) {
        media.setAttribute('data-music-preview', meta.preview);
      }
      media.setAttribute('data-music-post', id);

      if (!media.querySelector('.feed-sound-btn.pm-sound') && !media.querySelector('video.feed-video')) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'feed-sound-btn pm-sound';
        btn.setAttribute('data-music-post', id);
        btn.setAttribute('aria-label', 'Som');
        btn.innerHTML =
          '<svg class="icon-muted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15 9.5l4 4M19 9.5l-4 4"/></svg>' +
          '<svg class="icon-sound" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" style="display:none"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a4 4 0 010 7M18 6a7 7 0 010 12"/></svg>';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var prev = media.getAttribute('data-music-preview');
          if (!prev) return;
          if (feedAudioPostId === id && feedAudio && !feedAudio.paused) {
            var nowOn = !btn.classList.contains('on');
            feedAudio.muted = !nowOn;
            btn.classList.toggle('on', nowOn);
          } else {
            playUrl(id, prev, true);
          }
        });
        media.appendChild(btn);
      }
    });

    setupObserverOnce();
  }

  function queueInject() {
    if (injectQueued) return;
    injectQueued = true;
    requestAnimationFrame(function () {
      injectQueued = false;
      injectOnce();
    });
  }

  function setupObserverOnce() {
    if (!('IntersectionObserver' in window)) return;
    if (!feedObserver) {
      feedObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var media = entry.target;
            var prev = media.getAttribute('data-music-preview');
            var pid = media.getAttribute('data-music-post');
            if (!prev || !pid) return;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              if (feedAudioPostId !== pid) playUrl(pid, prev, false);
            } else if (feedAudioPostId === pid && entry.intersectionRatio < 0.15) {
              stopFeedAudio();
            }
          });
        },
        { root: null, threshold: [0.15, 0.5] }
      );
    }
    document.querySelectorAll('.post-media[data-music-preview]').forEach(function (el) {
      if (!el.__pmObs) {
        el.__pmObs = true;
        feedObserver.observe(el);
      }
    });
  }

  function persistMetaOnce() {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!posts.length) return;
      var p = posts[0];
      if (!p || !p.music || p.musicMeta) return;
      var raw = sessionStorage.getItem('tchilo_last_music_meta');
      if (!raw) return;
      var meta = JSON.parse(raw);
      if (!meta || !meta.preview) return;
      p.musicMeta = meta;
      if (typeof save === 'function' && typeof KEYS !== 'undefined') save(KEYS.posts, posts);
    } catch (e) {}
  }

  function hookRenderFeed() {
    if (typeof window.renderFeed !== 'function') return;
    if (window.renderFeed.__fmpQuiet) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      queueInject();
      setTimeout(persistMetaOnce, 300);
      return r;
    };
    window.renderFeed.__fmpQuiet = true;
    window.renderFeed.__fmp = true;
  }

  function boot() {
    hookRenderFeed();
    queueInject();
    setTimeout(hookRenderFeed, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tchiloFeedPlayMusic = playUrl;
  window.tchiloFeedStopMusic = stopFeedAudio;
})();
