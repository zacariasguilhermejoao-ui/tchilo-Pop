/**
 * tchilo-Pop — vídeos no feed e stories
 * - Ícone de play no centro (sinaliza que é vídeo)
 * - Pré-visualização automática de 15s (muted) quando visível
 * - Stories de vídeo: trecho de 15s no cartão, sem abrir
 */
(function () {
  'use strict';

  var PREVIEW_SEC = 15;
  var feedObs = null;
  var storyObs = null;
  var activeFeedVideo = null;

  var PLAY_SVG =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden="true">' +
    '<path d="M8 5v14l11-7z"/>' +
    '</svg>';

  function injectCSS() {
    if (document.getElementById('tchiloVideoPreviewCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloVideoPreviewCSS';
    st.textContent =
      /* Feed: contentor do vídeo */
      '#feedList .post-media, #feedList .feed-video-wrap, #feedList .post-media .feed-video-wrap{' +
      'position:relative;}' +
      '#feedList video.feed-video, #feedList .post-media > video, #feedList .feed-video-wrap video{' +
      'display:block;width:100%;}' +
      /* Ícone play no meio */
      '.tchilo-play-badge{' +
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'width:56px;height:56px;border-radius:50%;' +
      'background:rgba(0,0,0,.45);border:2.5px solid rgba(255,255,255,.92);' +
      'display:flex;align-items:center;justify-content:center;' +
      'pointer-events:none;z-index:4;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.35);' +
      'transition:opacity .2s ease, transform .2s ease;}' +
      '.tchilo-play-badge svg{margin-left:3px;}' +
      /* enquanto pré-visualiza, badge mais subtil */
      '.tchilo-vid-previewing .tchilo-play-badge{opacity:.35;transform:translate(-50%,-50%) scale(.85);}' +
      '.tchilo-vid-previewing.tchilo-vid-ended .tchilo-play-badge,' +
      '.tchilo-vid-ended .tchilo-play-badge{opacity:1;transform:translate(-50%,-50%) scale(1);}' +
      /* Stories: play badge pequeno no cartão de vídeo */
      '.story-card, .stories .story-card, #storiesBar .story-card{position:relative;}' +
      '.story-card .tchilo-play-badge{' +
      'width:36px;height:36px;border-width:2px;}' +
      '.story-card .tchilo-play-badge svg{width:18px;height:18px;margin-left:2px;}' +
      '.story-card video.tchilo-story-preview{' +
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;' +
      'border-radius:inherit;pointer-events:none;z-index:1;}' +
      '.story-card.tchilo-vid-previewing .tchilo-play-badge{opacity:.3;}';
    document.head.appendChild(st);
  }

  function findVideoHost(video) {
    return (
      video.closest('.feed-video-wrap') ||
      video.closest('.post-media') ||
      video.parentElement
    );
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

  function stopVideo(video) {
    if (!video) return;
    try {
      video.pause();
      if (video.dataset.previewStart) {
        try {
          video.currentTime = parseFloat(video.dataset.previewStart) || 0;
        } catch (e) {}
      }
    } catch (e) {}
    var host = findVideoHost(video);
    if (host) {
      host.classList.remove('tchilo-vid-previewing');
      host.classList.add('tchilo-vid-ended');
    }
    if (activeFeedVideo === video) activeFeedVideo = null;
  }

  function startFeedPreview(video) {
    if (!video) return;
    if (activeFeedVideo && activeFeedVideo !== video) stopVideo(activeFeedVideo);

    var host = findVideoHost(video);
    ensurePlayBadge(host);

    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.loop = false;
    video.preload = 'auto';

    if (!video.dataset.previewStart) {
      video.dataset.previewStart = String(video.currentTime || 0);
    }

    if (host) {
      host.classList.add('tchilo-vid-previewing');
      host.classList.remove('tchilo-vid-ended');
    }

    activeFeedVideo = video;

    var startAt = parseFloat(video.dataset.previewStart) || 0;
    var endAt = startAt + PREVIEW_SEC;

    function onTime() {
      if (video.currentTime >= endAt - 0.05) {
        video.removeEventListener('timeupdate', onTime);
        stopVideo(video);
      }
    }
    video.removeEventListener('timeupdate', onTime);
    video.addEventListener('timeupdate', onTime);

    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        // autoplay bloqueado — badge continua visível
        if (host) {
          host.classList.remove('tchilo-vid-previewing');
          host.classList.add('tchilo-vid-ended');
        }
      });
    }
  }

  function enhanceFeedVideos() {
    var videos = document.querySelectorAll(
      '#feedList video.feed-video, #feedList .post-media video, #feedList .feed-video-wrap video'
    );
    videos.forEach(function (video) {
      if (video.dataset.tchiloPreview === '1') return;
      video.dataset.tchiloPreview = '1';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.preload = video.preload || 'metadata';

      var host = findVideoHost(video);
      if (host) {
        if (getComputedStyle(host).position === 'static') {
          host.style.position = 'relative';
        }
        ensurePlayBadge(host);
        host.classList.add('tchilo-vid-ended');
      }
    });
    setupFeedObserver();
  }

  function setupFeedObserver() {
    var root = document.getElementById('screen-feed') || null;
    if (feedObs) {
      try {
        feedObs.disconnect();
      } catch (e) {}
    }
    if (!('IntersectionObserver' in window)) return;

    feedObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            startFeedPreview(video);
          } else {
            stopVideo(video);
          }
        });
      },
      { root: root, threshold: [0.55, 0.7], rootMargin: '0px' }
    );

    document
      .querySelectorAll(
        '#feedList video.feed-video[data-tchilo-preview="1"], #feedList .post-media video[data-tchilo-preview="1"], #feedList .feed-video-wrap video[data-tchilo-preview="1"]'
      )
      .forEach(function (v) {
        feedObs.observe(v);
      });
  }

  /* ---- Stories: preview 15s no cartão ---- */
  function enhanceStoryCards() {
    var cards = document.querySelectorAll(
      '#storiesBar .story-card, .stories .story-card, #storiesBar [data-story], .story-card'
    );
    cards.forEach(function (card) {
      if (card.classList.contains('story-card-create')) return;
      if (card.dataset.tchiloStoryPrev === '1') return;

      // já tem vídeo?
      var existing = card.querySelector('video');
      var src = null;
      if (existing && existing.src) {
        src = existing.currentSrc || existing.src;
      }
      // data attributes comuns
      if (!src) {
        src =
          card.getAttribute('data-video') ||
          card.getAttribute('data-media') ||
          card.getAttribute('data-src') ||
          null;
      }
      // procurar URL de vídeo em img poster + data
      if (!src) {
        var img = card.querySelector('img');
        if (img && img.dataset && img.dataset.video) src = img.dataset.video;
      }

      // Heurística: se o post/story associado for vídeo via window helpers
      if (!src && typeof window.getStories === 'function') {
        try {
          var stories = window.getStories() || [];
          var uid = card.getAttribute('data-user') || card.getAttribute('data-username');
          var sid = card.getAttribute('data-id') || card.getAttribute('data-story-id');
          var match = stories.find(function (s) {
            return (
              (sid && String(s.id) === String(sid)) ||
              (uid && String(s.username) === String(uid))
            );
          });
          if (match) {
            var m =
              match.media ||
              match.mediaUrl ||
              (match.mediaItems && match.mediaItems[0] && match.mediaItems[0].url);
            var isVid =
              match.mediaType === 'video' ||
              (typeof m === 'string' && /\.(mp4|webm|mov)(\?|$)/i.test(m));
            if (isVid && m) src = m;
          }
        } catch (e) {}
      }

      if (!src || !/\.(mp4|webm|mov|m4v)(\?|$)/i.test(src) && src.indexOf('blob:') !== 0 && !/video/i.test(src)) {
        // se não for claramente vídeo, mas existir <video>, usar
        if (!existing) return;
        src = existing.currentSrc || existing.src;
        if (!src) return;
      }

      card.dataset.tchiloStoryPrev = '1';
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }

      var video = existing;
      if (!video) {
        video = document.createElement('video');
        video.className = 'tchilo-story-preview';
        video.src = src;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.preload = 'metadata';
        video.loop = false;
        card.insertBefore(video, card.firstChild);
      } else {
        video.classList.add('tchilo-story-preview');
        video.muted = true;
        video.playsInline = true;
      }

      ensurePlayBadge(card);
      card.classList.add('tchilo-vid-ended');
    });

    setupStoryObserver();
  }

  function setupStoryObserver() {
    if (storyObs) {
      try {
        storyObs.disconnect();
      } catch (e) {}
    }
    if (!('IntersectionObserver' in window)) return;

    var root =
      document.querySelector('#screen-feed .stories') ||
      document.getElementById('storiesBar') ||
      document.getElementById('screen-feed');

    storyObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var card = entry.target;
          var video = card.querySelector('video');
          if (!video) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            video.muted = true;
            video.dataset.previewStart = video.dataset.previewStart || '0';
            try {
              video.currentTime = parseFloat(video.dataset.previewStart) || 0;
            } catch (e) {}
            card.classList.add('tchilo-vid-previewing');
            card.classList.remove('tchilo-vid-ended');
            var endAt = (parseFloat(video.dataset.previewStart) || 0) + PREVIEW_SEC;
            function onTime() {
              if (video.currentTime >= endAt - 0.05) {
                video.removeEventListener('timeupdate', onTime);
                try {
                  video.pause();
                  video.currentTime = parseFloat(video.dataset.previewStart) || 0;
                } catch (e2) {}
                card.classList.remove('tchilo-vid-previewing');
                card.classList.add('tchilo-vid-ended');
              }
            }
            video.removeEventListener('timeupdate', onTime);
            video.addEventListener('timeupdate', onTime);
            video.play().catch(function () {
              card.classList.remove('tchilo-vid-previewing');
              card.classList.add('tchilo-vid-ended');
            });
          } else {
            try {
              video.pause();
            } catch (e) {}
            card.classList.remove('tchilo-vid-previewing');
            card.classList.add('tchilo-vid-ended');
          }
        });
      },
      { root: root && root.scrollWidth > root.clientWidth ? root : null, threshold: [0.4, 0.6] }
    );

    document.querySelectorAll('.story-card[data-tchilo-story-prev="1"]').forEach(function (c) {
      storyObs.observe(c);
    });
  }

  function hookRenders() {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__vidPrev) {
      var rf = window.renderFeed;
      window.renderFeed = function () {
        var r = rf.apply(this, arguments);
        setTimeout(enhanceFeedVideos, 30);
        setTimeout(enhanceFeedVideos, 250);
        return r;
      };
      window.renderFeed.__vidPrev = true;
    }
    if (typeof window.renderStories === 'function' && !window.renderStories.__vidPrev) {
      var rs = window.renderStories;
      window.renderStories = function () {
        var r = rs.apply(this, arguments);
        setTimeout(enhanceStoryCards, 30);
        setTimeout(enhanceStoryCards, 250);
        return r;
      };
      window.renderStories.__vidPrev = true;
    }
  }

  function boot() {
    injectCSS();
    enhanceFeedVideos();
    enhanceStoryCards();
    hookRenders();
    setTimeout(function () {
      injectCSS();
      enhanceFeedVideos();
      enhanceStoryCards();
      hookRenders();
    }, 600);
    setTimeout(function () {
      enhanceFeedVideos();
      enhanceStoryCards();
    }, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
