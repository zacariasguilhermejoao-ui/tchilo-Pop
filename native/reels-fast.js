/**
 * tchilo-Pop — Reels a abrir e tocar de imediato
 * 1) Só monta os primeiros vídeos (resto sob demanda)
 * 2) play() no primeiro frame sem esperar loadedmetadata
 * 3) preload=auto só no ativo; resto metadata
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
          // fallback: muted autoplay (política do browser)
          try {
            video.muted = true;
            video.play().catch(function () {});
          } catch (e2) {}
        });
      }
    } catch (e) {}
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
      // primeiros N para abrir rápido
      return all.slice(0, MAX_INITIAL);
    };
    window.getVideoPosts.__reelsFast = true;
    window.getVideoPosts.__orig = orig;
    return orig;
  }

  function restoreGetVideoPosts(orig) {
    if (orig) {
      window.getVideoPosts = orig;
    }
  }

  function afterOpen(resumeAt) {
    var track = document.getElementById('reelsTrack');
    if (!track) return;
    var videos = track.querySelectorAll('video');
    videos.forEach(function (v, i) {
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      // só o primeiro com preload auto
      v.preload = i === 0 ? 'auto' : 'metadata';
      // remove poster pesado se houver
    });
    var first = videos[0];
    if (first) {
      // play imediato — não espera metadata
      forcePlay(first, resumeAt);
      // reforço nos eventos rápidos
      first.addEventListener(
        'loadeddata',
        function () {
          forcePlay(first, resumeAt);
        },
        { once: true }
      );
      first.addEventListener(
        'canplay',
        function () {
          forcePlay(first, resumeAt);
        },
        { once: true }
      );
    }

    // observer: ao entrar no ecrã, play sem atraso
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
              // ativa preload no visível
              vid.preload = 'auto';
              forcePlay(vid, 0);
              // preload vizinho seguinte
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

      // play no próximo tick (DOM já montado)
      setTimeout(function () {
        afterOpen(resumeAt);
      }, 0);
      // reforço curto
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
