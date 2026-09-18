/**
 * tchilo-Pop — vídeos no feed
 * Com stable-fix ativo: só ícone play, sem auto-preview que faz piscar
 */
(function () {
  'use strict';

  // se stable-fix pediu para desligar pré-visualização em loop
  if (window.__tchiloDisableVideoPreview) {
    // só garante badge de play sem autoplay
  }

  var PREVIEW_SEC = 15;
  var feedObs = null;
  var storyObs = null;
  var activeFeedVideo = null;
  var DISABLE_AUTO = true; // anti-piscar: sem auto-play em loop

  var PLAY_SVG =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden="true">' +
    '<path d="M8 5v14l11-7z"/>' +
    '</svg>';

  function injectCSS() {
    if (document.getElementById('tchiloVideoPreviewCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloVideoPreviewCSS';
    st.textContent =
      '#feedList .post-media, #feedList .feed-video-wrap, #feedList .post-media .feed-video-wrap{position:relative;}' +
      '#feedList video.feed-video, #feedList .post-media > video, #feedList .feed-video-wrap video{display:block;width:100%;}' +
      '.tchilo-play-badge{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'width:56px;height:56px;border-radius:50%;background:rgba(0,0,0,.45);border:2.5px solid rgba(255,255,255,.92);' +
      'display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:4;}' +
      '.tchilo-play-badge svg{margin-left:3px;}' +
      '.story-card{position:relative;}' +
      '.story-card .tchilo-play-badge{width:36px;height:36px;border-width:2px;}';
    document.head.appendChild(st);
  }

  function findVideoHost(video) {
    return video.closest('.feed-video-wrap') || video.closest('.post-media') || video.parentElement;
  }

  function ensurePlayBadge(host) {
    if (!host) return null;
    var badge = host.querySelector(':scope > .tchilo-play-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'tchilo-play-badge';
      badge.innerHTML = PLAY_SVG;
      badge.setAttribute('aria-hidden', 'true');
      host.appendChild(badge);
    }
    return badge;
  }

  function markFeedVideos() {
    var list = document.querySelectorAll(
      '#feedList video.feed-video, #feedList .post-media video, #feedList .feed-video-wrap video'
    );
    list.forEach(function (video) {
      if (video.dataset.tchiloMarked === '1') return;
      video.dataset.tchiloMarked = '1';
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'metadata');
      // não autoplay — evita piscar
      video.removeAttribute('autoplay');
      video.muted = true;
      try {
        video.pause();
      } catch (e) {}
      var host = findVideoHost(video);
      ensurePlayBadge(host);
    });
  }

  function boot() {
    injectCSS();
    markFeedVideos();
    setTimeout(markFeedVideos, 500);
    setTimeout(markFeedVideos, 2000);
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__vidBadge) {
      var rf = window.renderFeed;
      window.renderFeed = function () {
        var r = rf.apply(this, arguments);
        setTimeout(markFeedVideos, 80);
        return r;
      };
      window.renderFeed.__vidBadge = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
