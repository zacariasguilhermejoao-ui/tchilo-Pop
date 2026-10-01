/**
 * Tchilo — ícone play no meio dos vídeos do feed + toque abre Reels
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloFeedVideoUiV1) return;
  window.__tchiloFeedVideoUiV1 = true;

  function injectCSS() {
    if (document.getElementById('tchiloFeedVideoUiCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeedVideoUiCSS';
    st.textContent =
      '.feed-video-wrap,.post-media:has(video){position:relative!important;}' +
      '.tchilo-feed-play{' +
      'position:absolute!important;left:50%!important;top:50%!important;' +
      'transform:translate(-50%,-50%)!important;' +
      'width:56px!important;height:56px!important;border-radius:50%!important;' +
      'background:rgba(0,0,0,.45)!important;border:2.5px solid #fff!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'pointer-events:none!important;z-index:6!important;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.35)!important;}' +
      '.tchilo-feed-play svg{width:22px!important;height:22px!important;margin-left:3px;' +
      'fill:#fff!important;}' +
      '.feed-video-wrap.is-playing .tchilo-feed-play{opacity:0!important;transition:opacity .2s;}';
    document.head.appendChild(st);
  }

  function playSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  }

  function findPostId(el) {
    var n = el;
    for (var i = 0; i < 14 && n; i++) {
      if (n.getAttribute) {
        var id =
          n.getAttribute('data-post-id') ||
          n.getAttribute('data-id') ||
          n.getAttribute('data-post');
        if (id) return id;
      }
      n = n.parentElement;
    }
    return null;
  }

  function enhance() {
    injectCSS();
    var nodes = document.querySelectorAll(
      '#feedList video.feed-video, #feedList .feed-video-wrap video, #feedList .post-media video'
    );
    nodes.forEach(function (vid) {
      var wrap =
        vid.closest('.feed-video-wrap') ||
        vid.closest('.post-media') ||
        vid.parentElement;
      if (!wrap || wrap.__tchiloPlayUi) return;
      wrap.__tchiloPlayUi = true;
      wrap.style.position = wrap.style.position || 'relative';

      if (!wrap.querySelector('.tchilo-feed-play')) {
        var badge = document.createElement('div');
        badge.className = 'tchilo-feed-play';
        badge.innerHTML = playSvg();
        wrap.appendChild(badge);
      }

      vid.addEventListener('playing', function () {
        wrap.classList.add('is-playing');
      });
      vid.addEventListener('pause', function () {
        wrap.classList.remove('is-playing');
      });
    });
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.post-actions, .feed-sound-btn, button, a, .pm-sound')) return;

    var vid =
      t.tagName === 'VIDEO'
        ? t
        : t.closest('.feed-video-wrap, .post-media') &&
          t.closest('.feed-video-wrap, .post-media').querySelector('video');
    if (!vid) return;

    var wrap = vid.closest('.feed-video-wrap') || vid.closest('.post-media') || vid.parentElement;
    var postId = findPostId(wrap) || findPostId(vid);
    if (!postId) return;

    e.preventDefault();
    e.stopPropagation();

    var time = 0;
    try {
      if (Number.isFinite(vid.currentTime)) time = vid.currentTime;
    } catch (err) {}

    try {
      if (typeof openReels === 'function') {
        openReels(postId, time);
        return;
      }
    } catch (err2) {
      console.warn('[Tchilo feed→reels]', err2);
    }
  }

  document.addEventListener('click', onClick, true);

  function boot() {
    enhance();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  if (!window.__tchiloFeedVideoUiObs) {
    window.__tchiloFeedVideoUiObs = true;
    try {
      var feed = document.getElementById('feedList');
      if (feed) {
        new MutationObserver(function () {
          enhance();
        }).observe(feed, { childList: true, subtree: true });
      }
    } catch (e) {}
  }
  if (typeof window.renderFeed === 'function' && !window.renderFeed.__videoUi) {
    var rf = window.renderFeed;
    window.renderFeed = function () {
      var r = rf.apply(this, arguments);
      setTimeout(enhance, 50);
      setTimeout(enhance, 300);
      return r;
    };
    window.renderFeed.__videoUi = true;
  }
})();
