/**
 * Tchilo Reels — som ligado; tocar no vídeo alterna mudo / com som
 */
(function () {
  'use strict';
  if (window.__tchiloReelsSound) return;
  window.__tchiloReelsSound = true;

  /* Preferência: começar com som (se o browser permitir) */
  var preferMuted = false;

  function injectCSS() {
    if (document.getElementById('tchiloReelsSoundCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloReelsSoundCSS';
    st.textContent =
      '#reelsTrack .reel-slide video{cursor:pointer;}' +
      '.tchilo-reel-mute-badge{' +
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'width:56px;height:56px;border-radius:50%;' +
      'background:rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.85);' +
      'display:none;align-items:center;justify-content:center;' +
      'pointer-events:none;z-index:6;}' +
      '.tchilo-reel-mute-badge.show{display:flex!important;}' +
      '.tchilo-reel-mute-badge svg{width:26px;height:26px;fill:#fff;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function showMuteBadge(slide, muted) {
    if (!slide) return;
    var badge = slide.querySelector('.tchilo-reel-mute-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'tchilo-reel-mute-badge';
      slide.appendChild(badge);
    }
    badge.innerHTML = muted
      ? '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15 9.5l4 4M19 9.5l-4 4" stroke="#fff" stroke-width="2" fill="none"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a4 4 0 010 7M18 6a7 7 0 010 12" stroke="#fff" stroke-width="2" fill="none"/></svg>';
    badge.classList.add('show');
    clearTimeout(badge._hide);
    badge._hide = setTimeout(function () {
      badge.classList.remove('show');
    }, 700);
  }

  function setMuted(video, muted) {
    if (!video) return;
    video.muted = !!muted;
    if (muted) video.setAttribute('muted', '');
    else video.removeAttribute('muted');
    try {
      video.volume = muted ? 0 : 1;
    } catch (e) {}
    preferMuted = !!muted;
  }

  function playWithSound(video) {
    if (!video) return;
    setMuted(video, false);
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        /* browser bloqueou som → mudo e play */
        setMuted(video, true);
        video.play().catch(function () {});
      });
    }
  }

  /** Toque no vídeo = mudo / com som (não pausa) */
  function toggleReelSound(video) {
    if (!video) return;
    var next = !video.muted;
    setMuted(video, next);
    if (video.paused) {
      video.play().catch(function () {});
    }
    var slide = video.closest('.reel-slide');
    showMuteBadge(slide, next);
  }

  window.toggleReelPlayback = function (video) {
    toggleReelSound(video);
  };

  function prepareReelVideo(v) {
    if (!v) return;
    try {
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.playsInline = true;
      v.loop = true;
      v.removeAttribute('controls');
      v.controls = false;

      /* tentar com som */
      if (!preferMuted) {
        setMuted(v, false);
      } else {
        setMuted(v, true);
      }

      if (!v.__reelSoundClick) {
        v.__reelSoundClick = true;
        v.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleReelSound(v);
          },
          true
        );
      }

      var tryPlay = function () {
        if (preferMuted) {
          setMuted(v, true);
          v.play().catch(function () {});
        } else {
          playWithSound(v);
        }
      };

      if (v.readyState >= 2) tryPlay();
      else v.addEventListener('loadeddata', tryPlay, { once: true });
    } catch (e) {}
  }

  function scanReels() {
    var track = document.getElementById('reelsTrack');
    if (!track) return;
    track.querySelectorAll('video').forEach(prepareReelVideo);
  }

  function observeActive() {
    var track = document.getElementById('reelsTrack');
    if (!track || track.__soundObs) return;
    track.__soundObs = true;

    try {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            var v = en.target;
            if (!(v instanceof HTMLVideoElement)) return;
            if (en.isIntersecting && en.intersectionRatio > 0.55) {
              prepareReelVideo(v);
              if (preferMuted) {
                setMuted(v, true);
                v.play().catch(function () {});
              } else {
                playWithSound(v);
              }
            } else {
              try {
                v.pause();
              } catch (e) {}
            }
          });
        },
        { root: track, threshold: [0.55] }
      );
      track.querySelectorAll('video').forEach(function (v) {
        io.observe(v);
      });
      track.__soundIO = io;
    } catch (e) {}
  }

  function patchOpenReels() {
    if (typeof window.openReels !== 'function') return;
    if (window.openReels.__soundPatch) return;
    var orig = window.openReels;
    window.openReels = function () {
      /* veio de um toque no feed → browser permite som */
      preferMuted = false;
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        scanReels();
        observeActive();
        var first = document.querySelector('#reelsTrack .reel-slide video');
        if (first) playWithSound(first);
      }, 50);
      setTimeout(scanReels, 300);
      setTimeout(scanReels, 800);
      return r;
    };
    window.openReels.__soundPatch = true;
  }

  function boot() {
    injectCSS();
    patchOpenReels();
    scanReels();
    setTimeout(function () {
      patchOpenReels();
      scanReels();
      observeActive();
    }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
