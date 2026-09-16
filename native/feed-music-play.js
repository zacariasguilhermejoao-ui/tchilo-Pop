/**
 * tchilo-Pop — Reprodução de música no feed (fiável)
 * Garante musicMeta, botão de som e play com gesto do utilizador
 */
(function () {
  'use strict';

  var feedAudio = null;
  var feedAudioPostId = null;
  var feedObserver = null;
  var unlocked = false;

  function svgMusic() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
  }

  function stopFeedAudio() {
    if (feedAudio) {
      try {
        feedAudio.pause();
        feedAudio.src = '';
      } catch (e) {}
      feedAudio = null;
    }
    feedAudioPostId = null;
    document.querySelectorAll('.post-music.playing').forEach(function (el) {
      el.classList.remove('playing');
    });
    document.querySelectorAll('.feed-sound-btn.pm-sound.on').forEach(function (b) {
      b.classList.remove('on');
    });
  }

  function playUrl(postId, url, unmuted) {
    if (!url) return Promise.resolve(false);
    if (feedAudioPostId === postId && feedAudio) {
      feedAudio.muted = !unmuted;
      if (feedAudio.paused) {
        return feedAudio.play().then(function () {
          return true;
        }).catch(function () {
          return false;
        });
      }
      return Promise.resolve(true);
    }
    stopFeedAudio();
    feedAudio = new Audio();
    feedAudio.preload = 'auto';
    feedAudio.loop = true;
    feedAudio.crossOrigin = 'anonymous';
    feedAudio.src = url;
    feedAudio.muted = !unmuted;
    feedAudioPostId = postId;
    return feedAudio
      .play()
      .then(function () {
        unlocked = true;
        var row = document.querySelector('.post-music[data-post-music="' + postId + '"]');
        if (row) row.classList.add('playing');
        var btn = document.querySelector('.feed-sound-btn.pm-sound[data-music-post="' + postId + '"]');
        if (btn) btn.classList.toggle('on', unmuted);
        return true;
      })
      .catch(function (err) {
        console.warn('Tchilo feed music play', err);
        // Autoplay bloqueado: espera gesto
        return false;
      });
  }

  function soundBtnHtml(postId) {
    return (
      '<button type="button" class="feed-sound-btn pm-sound" data-music-post="' +
      String(postId).replace(/"/g, '') +
      '" aria-label="Som" style="position:absolute;right:10px;bottom:10px;z-index:6">' +
      '<svg class="icon-muted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15 9.5l4 4M19 9.5l-4 4"/></svg>' +
      '<svg class="icon-sound" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" style="display:none"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a4 4 0 010 7M18 6a7 7 0 010 12"/></svg>' +
      '</button>'
    );
  }

  function getMeta(p) {
    if (!p) return null;
    var meta = p.musicMeta || null;
    if (!meta && p.music && typeof p.music === 'object' && p.music.preview) meta = p.music;
    if (!meta && p.musicPreview) {
      meta = {
        preview: p.musicPreview,
        title: p.musicTitle || p.music,
        artist: p.musicArtist || ''
      };
    }
    return meta;
  }

  function inject() {
    var feed = document.getElementById('feedList');
    if (!feed) return;
    var posts = typeof getPosts === 'function' ? getPosts() : [];
    var byId = {};
    posts.forEach(function (p) {
      if (p && p.id) byId[String(p.id)] = p;
    });

    feed.querySelectorAll('.post[data-id]').forEach(function (postEl) {
      var id = postEl.getAttribute('data-id');
      var p = byId[id];
      if (!p) return;
      var meta = getMeta(p);
      var label = p.music;
      if (typeof label === 'object' && label && label.title) {
        label = label.title + (label.artist ? ' · ' + label.artist : '');
      }
      if (!label && meta) label = (meta.title || 'Música') + (meta.artist ? ' · ' + meta.artist : '');
      if (!label && !meta) return;

      var row = postEl.querySelector('.post-music');
      if (!row) {
        row = document.createElement('div');
        row.className = 'post-music';
        row.setAttribute('data-post-music', id);
        row.style.cssText =
          'display:flex;align-items:center;gap:8px;padding:6px 14px 2px;font-size:13px;font-weight:700;color:var(--ink);';
        row.innerHTML =
          '<span class="pm-icon">' +
          svgMusic() +
          '</span><span class="pm-text">' +
          String(label || 'Música').replace(/</g, '<') +
          '</span>';
        var actions = postEl.querySelector('.post-actions');
        if (actions && actions.parentNode) actions.parentNode.insertBefore(row, actions.nextSibling);
        else postEl.appendChild(row);

        row.addEventListener('click', function (e) {
          e.stopPropagation();
          var prev = postEl.querySelector('.post-media') && postEl.querySelector('.post-media').getAttribute('data-music-preview');
          if (!prev) {
            if (typeof showToast === 'function') showToast('Áudio indisponível neste post');
            return;
          }
          playUrl(id, prev, true);
        });
      }

      var media = postEl.querySelector('.post-media');
      if (!media) return;
      if (getComputedStyle(media).position === 'static') media.style.position = 'relative';

      if (meta && meta.preview) {
        media.setAttribute('data-music-preview', meta.preview);
        media.setAttribute('data-music-post', id);

        if (!media.querySelector('.feed-sound-btn.pm-sound') && !media.querySelector('video.feed-video')) {
          media.insertAdjacentHTML('beforeend', soundBtnHtml(id));
          var sbtn = media.querySelector('.feed-sound-btn.pm-sound');
          sbtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var prev = media.getAttribute('data-music-preview');
            if (!prev) return;
            if (feedAudioPostId === id && feedAudio && !feedAudio.paused) {
              var nowOn = !sbtn.classList.contains('on');
              feedAudio.muted = !nowOn;
              sbtn.classList.toggle('on', nowOn);
              if (nowOn) {
                feedAudio.play().catch(function () {});
              }
            } else {
              playUrl(id, prev, true).then(function (ok) {
                if (!ok && typeof showToast === 'function') {
                  showToast('Toca outra vez no botão de som');
                }
              });
            }
          });
        }
      }
    });

    setupObserver();
  }

  function setupObserver() {
    if (!('IntersectionObserver' in window)) return;
    if (feedObserver) {
      try {
        feedObserver.disconnect();
      } catch (e) {}
    }
    // root null = viewport (o scroll real não é sempre #feedList)
    feedObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var media = entry.target;
          var prev = media.getAttribute('data-music-preview');
          var pid = media.getAttribute('data-music-post');
          if (!prev || !pid) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            if (feedAudioPostId !== pid) {
              // tenta autoplay mudo (política do browser); som só com botão
              playUrl(pid, prev, false);
            }
          } else if (feedAudioPostId === pid && entry.intersectionRatio < 0.2) {
            stopFeedAudio();
          }
        });
      },
      { root: null, threshold: [0.2, 0.45, 0.7] }
    );
    document.querySelectorAll('.post-media[data-music-preview]').forEach(function (el) {
      feedObserver.observe(el);
    });
  }

  function persistMetaOnPublish() {
    // Antes de limpar, copia meta para um backup curto
    var prevMeta = null;
    Object.defineProperty(window, '_pendingMusicMeta', {
      configurable: true,
      enumerable: true,
      get: function () {
        return prevMeta;
      },
      set: function (v) {
        prevMeta = v;
        if (v && v.preview) {
          try {
            sessionStorage.setItem('tchilo_last_music_meta', JSON.stringify(v));
          } catch (e) {}
        }
      }
    });
    // Se já havia valor simples
    try {
      if (window._pendingMusicMeta && window._pendingMusicMeta.preview) {
        sessionStorage.setItem('tchilo_last_music_meta', JSON.stringify(window._pendingMusicMeta));
      }
    } catch (e) {}

    // Após publish, repor meta no post mais recente se faltar
    setInterval(function () {
      try {
        var posts = typeof getPosts === 'function' ? getPosts() : [];
        if (!posts.length) return;
        var p = posts[0];
        if (!p) return;
        if (p.music && !p.musicMeta) {
          var raw = sessionStorage.getItem('tchilo_last_music_meta');
          if (raw) {
            var meta = JSON.parse(raw);
            if (meta && meta.preview) {
              p.musicMeta = meta;
              if (!p.musicPreview) p.musicPreview = meta.preview;
              if (typeof save === 'function' && typeof KEYS !== 'undefined') save(KEYS.posts, posts);
            }
          }
        }
      } catch (e) {}
    }, 1000);
  }

  function hookRenderFeed() {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__fmp) {
      var orig = window.renderFeed;
      window.renderFeed = function () {
        var r = orig.apply(this, arguments);
        setTimeout(inject, 0);
        setTimeout(inject, 250);
        setTimeout(inject, 800);
        return r;
      };
      window.renderFeed.__fmp = true;
    }
    inject();
  }

  function boot() {
    persistMetaOnPublish();
    hookRenderFeed();
    setTimeout(hookRenderFeed, 1000);
    setTimeout(inject, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
