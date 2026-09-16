/**
 * tchilo-Pop — Reels rápidos + Seguir à direita
 */
(function () {
  'use strict';

  var MAX_INITIAL = 6;

  function forcePlay(video, resumeAt) {
    if (!video) return;
    try {
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.loop = true;
      video.preload = 'auto';
      if (typeof resumeAt === 'number' && resumeAt > 0.15) {
        try {
          video.currentTime = resumeAt;
        } catch (e) {}
      }
      var p = video.play();
      if (p && p.catch) {
        p.catch(function () {
          try {
            video.muted = true;
            video.play().catch(function () {});
          } catch (e2) {}
        });
      }
    } catch (e) {}
  }

  function placeFollowRight() {
    document.querySelectorAll('#reelsViewer .reel-follow, .reel-slide .reel-follow').forEach(function (btn) {
      btn.style.cssText =
        'position:absolute!important;top:max(14px,calc(env(safe-area-inset-top,0px)+10px))!important;' +
        'right:12px!important;left:auto!important;z-index:19!important;margin:0!important;' +
        'min-width:72px;padding:8px 14px;border:2px solid #fff;border-radius:10px;' +
        'background:rgba(0,0,0,.45);color:#fff;font:800 12px Inter,system-ui,sans-serif;';
    });
    var close = document.querySelector('#reelsViewer .reels-close');
    if (close) {
      close.style.setProperty('left', '12px', 'important');
      close.style.setProperty('right', 'auto', 'important');
      close.style.setProperty('z-index', '20', 'important');
    }
  }

  function limitVideoPosts(startId) {
    if (typeof window.getVideoPosts !== 'function') return null;
    if (window.getVideoPosts.__reelsFast) return null;
    var orig = window.getVideoPosts;
    window.getVideoPosts = function () {
      var all = [];
      try {
        all = orig.apply(this, arguments) || [];
      } catch (e) {
        all = [];
      }
      if (!Array.isArray(all)) all = [];
      if (startId) {
        var i = all.findIndex(function (p) {
          return p && p.id === startId;
        });
        if (i > 0) {
          var one = all.splice(i, 1)[0];
          all.unshift(one);
        }
      }
      return all.slice(0, MAX_INITIAL);
    };
    window.getVideoPosts.__reelsFast = true;
    return orig;
  }

  function restoreGetVideoPosts(orig) {
    if (orig) window.getVideoPosts = orig;
  }

  function afterOpen(resumeAt) {
    placeFollowRight();
    var track = document.getElementById('reelsTrack');
    if (!track) return;
    var videos = track.querySelectorAll('video');
    videos.forEach(function (v, i) {
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = i === 0 ? 'auto' : 'metadata';
    });
    var first = videos[0];
    if (first) {
      forcePlay(first, resumeAt);
      first.addEventListener('loadeddata', function () { forcePlay(first, resumeAt); }, { once: true });
      first.addEventListener('canplay', function () { forcePlay(first, resumeAt); }, { once: true });
    }

    if (window._reelsObs) {
      try {
        window._reelsObs.disconnect();
      } catch (e) {}
    }
    if ('IntersectionObserver' in window) {
      window._reelsObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            var vid = en.target.querySelector('video');
            if (!vid) return;
            if (en.isIntersecting && en.intersectionRatio > 0.5) {
              vid.preload = 'auto';
              forcePlay(vid, 0);
              placeFollowRight();
              var next = en.target.nextElementSibling;
              if (next) {
                var nv = next.querySelector('video');
                if (nv) nv.preload = 'auto';
              }
            } else {
              try {
                vid.pause();
              } catch (e2) {}
            }
          });
        },
        { root: track, threshold: [0.5, 0.7] }
      );
      track.querySelectorAll('.reel-slide').forEach(function (s) {
        window._reelsObs.observe(s);
      });
    }
  }

  function patchOpenReels() {
    if (typeof window.openReels !== 'function') return;
    if (window.openReels.__fast) return;
    var orig = window.openReels;
    window.openReels = function (startId, startTime) {
      var resumeAt =
        typeof startTime === 'number' && startTime > 0.15 ? startTime : 0;
      if (!resumeAt && startId) {
        try {
          var feedVid = document.querySelector(
            '.feed-video-wrap[data-post-id="' + startId + '"] video.feed-video'
          );
          if (feedVid && Number.isFinite(feedVid.currentTime)) {
            resumeAt = feedVid.currentTime;
          }
        } catch (e) {}
      }

      var origGet = limitVideoPosts(startId);
      try {
        orig.call(this, startId, startTime);
      } finally {
        restoreGetVideoPosts(origGet);
      }

      setTimeout(function () {
        afterOpen(resumeAt);
      }, 0);
      setTimeout(function () {
        afterOpen(resumeAt);
      }, 80);
    };
    window.openReels.__fast = true;
  }

  function boot() {
    patchOpenReels();
    setTimeout(patchOpenReels, 400);
    setTimeout(patchOpenReels, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
