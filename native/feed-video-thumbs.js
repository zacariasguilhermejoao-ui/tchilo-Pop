/**
 * tchilo-Pop — vídeos no feed: miniatura rápida + autoplay mudo ao aparecer
 */
(function () {
  'use strict';

  var PLAY =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
  var obs = null;
  var PREVIEW_SEC = 15;

  function injectCSS() {
    if (document.getElementById('tchiloVidThumbCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloVidThumbCSS';
    st.textContent =
      '#feedList .feed-video-wrap{position:relative;min-height:180px;background:#1a1a1a;}' +
      '#feedList .feed-video-wrap video.feed-video{' +
      'display:block!important;width:100%!important;height:auto!important;min-height:180px;' +
      'object-fit:cover!important;background:#1a1a1a!important;opacity:1!important;visibility:visible!important;}' +
      '#feedList .feed-video-wrap .tchilo-vthumb{' +
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;background:#1a1a1a;pointer-events:none;}' +
      '#feedList .feed-video-wrap.playing .tchilo-vthumb{opacity:0;pointer-events:none;}' +
      '#feedList .feed-video-wrap .tchilo-play-badge{' +
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'width:52px;height:52px;border-radius:50%;z-index:3;' +
      'background:rgba(0,0,0,.45);border:2.5px solid #fff;' +
      'display:flex;align-items:center;justify-content:center;pointer-events:none;' +
      'transition:opacity .2s;}' +
      '#feedList .feed-video-wrap.playing .tchilo-play-badge{opacity:0;}' +
      '#feedList .feed-video-wrap .tchilo-play-badge svg{margin-left:3px;}';
    document.head.appendChild(st);
  }

  function ensureBadge(wrap) {
    if (!wrap || wrap.querySelector('.tchilo-play-badge')) return;
    var b = document.createElement('div');
    b.className = 'tchilo-play-badge';
    b.innerHTML = PLAY;
    wrap.appendChild(b);
  }

  function setThumb(wrap, dataUrl) {
    if (!wrap || !dataUrl) return;
    var img = wrap.querySelector('.tchilo-vthumb');
    if (!img) {
      img = document.createElement('img');
      img.className = 'tchilo-vthumb';
      img.alt = '';
      wrap.insertBefore(img, wrap.firstChild);
    }
    img.src = dataUrl;
    var v = wrap.querySelector('video');
    if (v && !v.getAttribute('poster')) v.setAttribute('poster', dataUrl);
  }

  function captureFrame(video, wrap) {
    if (!video || video.dataset.thumbDone === '1') return;
    function tryCap() {
      try {
        if (video.videoWidth < 2 || video.videoHeight < 2) return false;
        var c = document.createElement('canvas');
        var w = Math.min(video.videoWidth, 480);
        var h = Math.round((video.videoHeight / video.videoWidth) * w);
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(video, 0, 0, w, h);
        var url = c.toDataURL('image/jpeg', 0.65);
        video.dataset.thumbDone = '1';
        setThumb(wrap, url);
        return true;
      } catch (e) {
        return false;
      }
    }
    if (tryCap()) return;
    var onMeta = function () {
      try {
        if (video.currentTime < 0.05) video.currentTime = 0.08;
      } catch (e) {}
    };
    var onSeek = function () {
      tryCap();
      video.removeEventListener('seeked', onSeek);
    };
    video.addEventListener('loadeddata', function once() {
      video.removeEventListener('loadeddata', once);
      if (!tryCap()) {
        video.addEventListener('seeked', onSeek);
        onMeta();
      }
    });
    video.addEventListener('loadedmetadata', onMeta);
  }

  function playMuted(video, wrap) {
    if (!video) return;
    try {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.loop = true;
      if (video.preload !== 'auto') {
        video.preload = 'auto';
        try {
          video.load();
        } catch (e0) {}
      }
      var p = video.play();
      if (wrap) wrap.classList.add('playing');
      if (p && p.catch) {
        p.catch(function () {
          video.muted = true;
          video.play().catch(function () {});
        });
      }
    } catch (e) {}
  }

  function pauseVid(video, wrap) {
    if (!video) return;
    try {
      video.pause();
    } catch (e) {}
    if (wrap) wrap.classList.remove('playing');
  }

  function onTimeLimit(video) {
    if (!video || video.dataset.timeBound === '1') return;
    video.dataset.timeBound = '1';
    video.addEventListener('timeupdate', function () {
      try {
        if (video.currentTime >= PREVIEW_SEC) {
          video.currentTime = 0;
        }
      } catch (e) {}
    });
  }

  function ensureObs() {
    if (obs) return obs;
    var feed = document.getElementById('feedList');
    obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var video = en.target;
          var wrap = video.closest('.feed-video-wrap') || video.parentElement;
          if (en.isIntersecting && en.intersectionRatio >= 0.35) {
            playMuted(video, wrap);
            onTimeLimit(video);
          } else {
            pauseVid(video, wrap);
          }
        });
      },
      { root: feed || null, threshold: [0.2, 0.35, 0.5], rootMargin: '80px 0px' }
    );
    return obs;
  }

  function processWrap(wrap) {
    if (!wrap) return;
    ensureBadge(wrap);
    var video = wrap.querySelector('video.feed-video, video');
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.playsInline = true;
    video.loop = true;

    // carregar mais depressa que preload=none do index
    if (video.preload === 'none' || !video.preload) {
      video.preload = 'metadata';
    }

    var poster = video.getAttribute('poster');
    if (poster) {
      setThumb(wrap, poster);
      video.dataset.thumbDone = '1';
    } else {
      captureFrame(video, wrap);
    }

    ensureObs().observe(video);

    // se já está no ecrã, começa já
    try {
      var r = video.getBoundingClientRect();
      var vh = window.innerHeight || 600;
      if (r.top < vh * 0.85 && r.bottom > vh * 0.15) {
        playMuted(video, wrap);
        onTimeLimit(video);
      }
    } catch (e) {}
  }

  function scan() {
    injectCSS();
    var feed = document.getElementById('feedList');
    if (!feed) return;

    document.querySelectorAll('#feedList .feed-video-wrap').forEach(processWrap);
    document.querySelectorAll('#feedList .post-media > video, #feedList video.feed-video').forEach(function (v) {
      var host = v.closest('.feed-video-wrap') || v.parentElement;
      if (host && !host.classList.contains('feed-video-wrap')) host.classList.add('feed-video-wrap');
      processWrap(host);
    });
  }

  // Sobrescrever setup do index que bloqueia autoplay
  function patchIndexAutoplay() {
    window.setupFeedVideoAutoplay = function () {
      scan();
    };
  }

  function boot() {
    injectCSS();
    patchIndexAutoplay();
    scan();
    [200, 600, 1500, 3000].forEach(function (ms) {
      setTimeout(scan, ms);
    });

    if (typeof window.renderFeed === 'function' && !window.renderFeed.__vidAuto) {
      var rf = window.renderFeed;
      window.renderFeed = function () {
        var r = rf.apply(this, arguments);
        setTimeout(scan, 50);
        setTimeout(scan, 300);
        setTimeout(scan, 900);
        return r;
      };
      window.renderFeed.__vidAuto = true;
      window.renderFeed.__vidThumbs = true;
    }

    // re-scan ao scroll (fallback se observer falhar)
    var feed = document.getElementById('feedList');
    if (feed && !feed.__vidScroll) {
      feed.__vidScroll = true;
      var t = null;
      feed.addEventListener(
        'scroll',
        function () {
          if (t) return;
          t = setTimeout(function () {
            t = null;
            scan();
          }, 180);
        },
        { passive: true }
      );
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
