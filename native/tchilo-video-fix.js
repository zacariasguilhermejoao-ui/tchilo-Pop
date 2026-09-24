/**
 * Tchilo — vídeos: miniatura real (compressão leve no cliente) + reels
 */
(function () {
  'use strict';
  if (window.__tchiloVideoFix) return;
  window.__tchiloVideoFix = true;

  var CLIENT_MAX_W = 480;
  var CLIENT_QUALITY = 0.72;

  function injectCSS() {
    if (document.getElementById('tchiloVideoFixCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloVideoFixCSS';
    st.textContent =
      '#feedList .feed-play-icon,.feed-play-icon,.reel-slide .play-overlay,.reel-slide > .big-play{display:none!important;}' +
      '#reelsTrack .reel-slide video,.reel-slide video{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover!important;background:#0a0a0a!important;z-index:0;}' +
      '#reelsTrack .reel-slide{background:#0a0a0a!important;}' +
      '#feedList .feed-video-wrap{background:#0a0a0a;position:relative;overflow:hidden;}' +
      '#feedList video.feed-video{width:100%;height:100%;object-fit:cover;background:#0a0a0a;display:block;}' +
      '#feedList .feed-video-wrap .tchilo-play-mini{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;background:rgba(0,0,0,.4);border:2px solid rgba(255,255,255,.85);display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:3;opacity:.9;}' +
      '#feedList .feed-video-wrap .tchilo-play-mini svg{width:20px;height:20px;margin-left:2px;}' +
      '#feedList .feed-video-wrap.is-playing .tchilo-play-mini{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function capturePoster(video, cb) {
    if (!video || video.dataset.posterDone === '1') return;
    var tryCap = function () {
      try {
        if (video.videoWidth < 2) return false;
        var w = Math.min(CLIENT_MAX_W, video.videoWidth);
        var h = Math.round(w * (video.videoHeight / video.videoWidth));
        var c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        var ctx = c.getContext('2d');
        if (!ctx) return false;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(video, 0, 0, w, h);
        var url = c.toDataURL('image/jpeg', CLIENT_QUALITY);
        if (url && url.length > 200) {
          video.setAttribute('poster', url);
          video.poster = url;
          video.dataset.posterDone = '1';
          if (typeof cb === 'function') cb(url);
          return true;
        }
      } catch (e) {}
      return false;
    };

    if (video.readyState >= 2 && tryCap()) return;

    video.addEventListener('loadeddata', function () {
      tryCap();
    }, { once: true });
    video.addEventListener('loadedmetadata', function () {
      try {
        if (video.currentTime < 0.05) video.currentTime = 0.25;
      } catch (e) {}
    }, { once: true });
    video.addEventListener('seeked', function () {
      tryCap();
    }, { once: true });

    if (video.preload === 'none') video.preload = 'metadata';
    try {
      video.load();
    } catch (e) {}
  }

  function prepareFeedVideo(v) {
    if (!v || v.dataset.tvPrepared === '1') return;
    v.dataset.tvPrepared = '1';
    try {
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.muted = true;
      v.setAttribute('muted', '');
      v.playsInline = true;
      if (!v.getAttribute('poster')) capturePoster(v);
      else v.dataset.posterDone = '1';
      var wrap = v.closest('.feed-video-wrap') || v.parentElement;
      if (wrap) {
        wrap.querySelectorAll('.feed-play-icon').forEach(function (el) {
          el.remove();
        });
        if (!wrap.querySelector('.tchilo-play-mini')) {
          var mini = document.createElement('div');
          mini.className = 'tchilo-play-mini';
          mini.innerHTML = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
          wrap.appendChild(mini);
        }
        v.addEventListener('play', function () {
          wrap.classList.add('is-playing');
        });
        v.addEventListener('pause', function () {
          wrap.classList.remove('is-playing');
        });
      }
    } catch (e) {}
  }

  function prepareReelVideo(v) {
    if (!v || v.dataset.tvReel === '1') return;
    v.dataset.tvReel = '1';
    try {
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.muted = true;
      v.setAttribute('muted', '');
      v.playsInline = true;
      v.preload = 'auto';
      v.setAttribute('preload', 'auto');
      v.removeAttribute('controls');
      v.controls = false;
      if (!v.getAttribute('poster')) capturePoster(v);
      var tryPlay = function () {
        var p = v.play();
        if (p && p.catch) {
          p.catch(function () {
            v.muted = true;
            v.play().catch(function () {});
          });
        }
      };
      if (v.readyState >= 2) tryPlay();
      else v.addEventListener('loadeddata', tryPlay, { once: true });
      try {
        v.load();
      } catch (e) {}
    } catch (e) {}
  }

  function scanFeed() {
    var feed = document.getElementById('feedList');
    if (!feed) return;
    feed.querySelectorAll('video.feed-video').forEach(prepareFeedVideo);
  }

  function scanReels() {
    var track = document.getElementById('reelsTrack');
    if (!track) return;
    track.querySelectorAll('video').forEach(prepareReelVideo);
  }

  function watch() {
    scanFeed();
    scanReels();
    try {
      var feed = document.getElementById('feedList');
      if (feed && !feed.__tvObs) {
        feed.__tvObs = true;
        new MutationObserver(function () {
          scanFeed();
        }).observe(feed, { childList: true, subtree: true });
      }
      var track = document.getElementById('reelsTrack');
      if (track && !track.__tvObs) {
        track.__tvObs = true;
        new MutationObserver(function () {
          scanReels();
        }).observe(track, { childList: true, subtree: true });
      }
    } catch (e) {}
  }

  function patchOpenReels() {
    if (typeof window.openReels !== 'function' || window.openReels.__tvPatch) return;
    var orig = window.openReels;
    window.openReels = function () {
      var r = orig.apply(this, arguments);
      setTimeout(scanReels, 50);
      setTimeout(scanReels, 300);
      setTimeout(scanReels, 800);
      return r;
    };
    window.openReels.__tvPatch = true;
  }

  function boot() {
    injectCSS();
    watch();
    patchOpenReels();
    setTimeout(function () {
      patchOpenReels();
      watch();
    }, 1000);
    setTimeout(watch, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
