/**
 * tchilo-Pop — vídeos no feed estáveis (sem piscar)
 * Miniatura + autoplay mudo suave quando visível
 */
(function () {
  'use strict';

  var PLAY =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
  var obs = null;
  var playingId = null;

  function injectCSS() {
    var st = document.getElementById('tchiloVidThumbCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloVidThumbCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#feedList .feed-video-wrap{position:relative;min-height:200px;background:#111;overflow:hidden;}' +
      '#feedList .feed-video-wrap video.feed-video{' +
      'display:block!important;width:100%!important;min-height:200px;' +
      'object-fit:cover!important;background:#111!important;' +
      'opacity:1!important;visibility:visible!important;}' +
      '#feedList .feed-video-wrap .tchilo-vthumb{' +
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;' +
      'z-index:1;background:#111;pointer-events:none;transition:opacity .25s;}' +
      '#feedList .feed-video-wrap.is-playing .tchilo-vthumb{opacity:0;}' +
      '#feedList .feed-video-wrap .tchilo-play-badge{' +
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'width:52px;height:52px;border-radius:50%;z-index:3;' +
      'background:rgba(0,0,0,.45);border:2.5px solid #fff;' +
      'display:flex;align-items:center;justify-content:center;pointer-events:none;' +
      'transition:opacity .2s;}' +
      '#feedList .feed-video-wrap.is-playing .tchilo-play-badge{opacity:0;}' +
      '#feedList .post{animation:none!important;}' +
      '#feedList video.feed-video{animation:none!important;}';
  }

  function ensureBadge(wrap) {
    if (!wrap || wrap.querySelector('.tchilo-play-badge')) return;
    var b = document.createElement('div');
    b.className = 'tchilo-play-badge';
    b.innerHTML = PLAY;
    wrap.appendChild(b);
  }

  function setPoster(wrap, video, url) {
    if (!url) return;
    try {
      if (video && !video.getAttribute('poster')) video.setAttribute('poster', url);
    } catch (e) {}
    var img = wrap && wrap.querySelector('.tchilo-vthumb');
    if (wrap && !img) {
      img = document.createElement('img');
      img.className = 'tchilo-vthumb';
      img.alt = '';
      wrap.insertBefore(img, wrap.firstChild);
    }
    if (img && img.src !== url) img.src = url;
  }

  function captureOnce(video, wrap) {
    if (!video || video.dataset.thumbDone === '1') return;
    if (video.readyState < 2 || video.videoWidth < 2) return;
    try {
      var c = document.createElement('canvas');
      var w = Math.min(video.videoWidth, 480);
      var h = Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w);
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(video, 0, 0, w, h);
      var url = c.toDataURL('image/jpeg', 0.6);
      video.dataset.thumbDone = '1';
      setPoster(wrap, video, url);
    } catch (e) {
      /* CORS pode bloquear — ignora */
      video.dataset.thumbDone = '1';
    }
  }

  function pauseAllExcept(keep) {
    document.querySelectorAll('#feedList video.feed-video').forEach(function (v) {
      if (v === keep) return;
      try {
        if (!v.paused) v.pause();
      } catch (e) {}
      var w = v.closest('.feed-video-wrap');
      if (w) w.classList.remove('is-playing');
    });
  }

  function playSoft(video, wrap) {
    if (!video) return;
    // evita restart contínuo
    if (!video.paused && video.dataset.playing === '1') {
      if (wrap) wrap.classList.add('is-playing');
      return;
    }
    pauseAllExcept(video);
    try {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.loop = true;
      var p = video.play();
      video.dataset.playing = '1';
      if (wrap) wrap.classList.add('is-playing');
      if (p && p.catch) {
        p.catch(function () {
          video.dataset.playing = '0';
          if (wrap) wrap.classList.remove('is-playing');
        });
      }
    } catch (e) {
      video.dataset.playing = '0';
    }
  }

  function pauseSoft(video, wrap) {
    if (!video) return;
    try {
      if (!video.paused) video.pause();
    } catch (e) {}
    video.dataset.playing = '0';
    if (wrap) wrap.classList.remove('is-playing');
  }

  function ensureObs() {
    if (obs) return obs;
    var feed = document.getElementById('feedList');
    obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var video = en.target;
          var wrap = video.closest('.feed-video-wrap');
          if (en.isIntersecting && en.intersectionRatio >= 0.4) {
            if (video.preload === 'none') {
              video.preload = 'metadata';
            }
            // carregar dados uma vez
            if (video.dataset.loadedMeta !== '1' && video.readyState < 1) {
              video.dataset.loadedMeta = '1';
              try {
                /* não chamar load() em loop — só se ainda não começou */
                if (video.networkState === 0) video.load();
              } catch (e) {}
            }
            playSoft(video, wrap);
          } else {
            pauseSoft(video, wrap);
          }
        });
      },
      { root: feed || null, threshold: [0.4, 0.6], rootMargin: '40px 0px' }
    );
    return obs;
  }

  function processVideo(video) {
    if (!video || video.dataset.stableVid === '1') return;
    video.dataset.stableVid = '1';

    var wrap = video.closest('.feed-video-wrap') || video.parentElement;
    if (wrap && !wrap.classList.contains('feed-video-wrap')) {
      wrap.classList.add('feed-video-wrap');
    }
    ensureBadge(wrap);

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.playsInline = true;
    video.loop = true;

    // metadata é suficiente para poster; auto só quando visível
    if (!video.preload || video.preload === 'none') {
      video.preload = 'metadata';
    }

    var poster = video.getAttribute('poster');
    if (poster) setPoster(wrap, video, poster);

    video.addEventListener(
      'loadeddata',
      function () {
        captureOnce(video, wrap);
        video.classList.add('media-ready');
      },
      { once: true }
    );
    video.addEventListener(
      'error',
      function () {
        video.classList.add('media-ready');
        video.classList.add('media-error');
      },
      { once: true }
    );

    ensureObs().observe(video);
  }

  function scan() {
    injectCSS();
    document.querySelectorAll('#feedList video.feed-video, #feedList .feed-video-wrap video').forEach(processVideo);
  }

  // Não deixar o index forçar preload=none / pausar tudo de forma agressiva
  function patchIndex() {
    window.setupFeedVideoAutoplay = function () {
      scan();
    };
  }

  var scanTimer = null;
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(function () {
      scanTimer = null;
      scan();
    }, 120);
  }

  function boot() {
    injectCSS();
    patchIndex();
    scan();
    setTimeout(scan, 400);
    setTimeout(scan, 1200);

    if (typeof window.renderFeed === 'function' && !window.renderFeed.__stableVid) {
      var rf = window.renderFeed;
      window.renderFeed = function () {
        var r = rf.apply(this, arguments);
        // limpar flags só em elementos novos — processVideo usa dataset.stableVid
        // após re-render o DOM é novo, flags somem sozinhas
        scheduleScan();
        setTimeout(scan, 350);
        return r;
      };
      window.renderFeed.__stableVid = true;
      window.renderFeed.__vidThumbs = true;
      window.renderFeed.__vidAuto = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
