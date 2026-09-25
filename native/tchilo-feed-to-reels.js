/**
 * Tchilo — tocar num vídeo no feed abre os Reels
 */
(function () {
  'use strict';
  if (window.__tchiloFeedToReels) return;
  window.__tchiloFeedToReels = true;

  function findPostId(el) {
    if (!el) return null;
    var node = el;
    for (var i = 0; i < 12 && node; i++) {
      if (node.getAttribute) {
        var id =
          node.getAttribute('data-post-id') ||
          node.getAttribute('data-id') ||
          node.getAttribute('data-post');
        if (id) return id;
      }
      node = node.parentElement;
    }
    return null;
  }

  function isVideoTarget(el) {
    if (!el || !el.closest) return null;
    /* botões de som / ações não abrem reels */
    if (el.closest('.feed-sound-btn, .post-actions, .pm-sound, button, a')) return null;

    var wrap =
      el.closest('.feed-video-wrap') ||
      el.closest('.post-media video') ||
      null;

    if (el.tagName === 'VIDEO' && el.classList.contains('feed-video')) {
      wrap = el.closest('.feed-video-wrap') || el.parentElement;
    }

    if (!wrap) {
      /* vídeo dentro de post-media sem wrap */
      var vid = el.closest('.post-media') && el.closest('.post-media').querySelector('video.feed-video, video');
      if (vid && (el === vid || vid.contains(el) || el.closest('video'))) {
        wrap = vid.closest('.feed-video-wrap') || vid.parentElement;
      }
    }

    return wrap;
  }

  function openFromFeed(postId, videoEl) {
    if (!postId) return;
    var t = 0;
    try {
      if (videoEl && Number.isFinite(videoEl.currentTime) && videoEl.currentTime > 0.1) {
        t = videoEl.currentTime;
      }
    } catch (e) {}

    try {
      if (typeof openReels === 'function') {
        openReels(postId, t);
        return;
      }
    } catch (e) {
      console.warn('openReels', e);
    }

    /* fallback: ecrã reels se existir */
    try {
      if (typeof goTo === 'function') goTo('reels');
    } catch (e) {}
  }

  function onFeedClick(e) {
    var target = e.target;
    if (!target) return;

    var wrap = isVideoTarget(target);
    if (!wrap) return;

    var postId = findPostId(wrap) || findPostId(target);
    if (!postId) {
      var post = target.closest && target.closest('.post[data-id]');
      if (post) postId = post.getAttribute('data-id');
    }
    if (!postId) return;

    /* confirmar que o post é vídeo */
    var video =
      (wrap.querySelector && wrap.querySelector('video.feed-video, video')) ||
      (target.tagName === 'VIDEO' ? target : null);

    if (!video) {
      /* pode ser overlay/play icon sobre o vídeo */
      var postEl = target.closest('.post[data-id]');
      if (postEl) video = postEl.querySelector('video.feed-video, video');
    }

    if (!video) return;

    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

    openFromFeed(postId, video);
  }

  function bind() {
    var feed = document.getElementById('feedList');
    if (!feed) return false;
    if (feed.__tchiloReelsClick) return true;
    feed.__tchiloReelsClick = true;
    /* capture = true para ganhar a outros handlers */
    feed.addEventListener('click', onFeedClick, true);
    return true;
  }

  function patchRenderFeed() {
    if (typeof window.renderFeed !== 'function') return;
    if (window.renderFeed.__toReels) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      setTimeout(bind, 0);
      return r;
    };
    window.renderFeed.__toReels = true;
  }

  function boot() {
    bind();
    patchRenderFeed();
    setTimeout(function () {
      bind();
      patchRenderFeed();
    }, 800);
    setTimeout(bind, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
