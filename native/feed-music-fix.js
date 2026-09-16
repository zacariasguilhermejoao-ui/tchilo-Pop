/**
 * tchilo-Pop — música no feed a tocar de novo
 * - IntersectionObserver no contentor de scroll certo (#screen-feed)
 * - áudio do feed não é morto pelo silenciador de pré-views
 */
(function () {
  'use strict';

  var feedAudio = null;
  var feedAudioPostId = null;
  var feedMusicMuted = true; // começa muted (política browsers); botão de som desmuta
  var observer = null;

  function stopFeedAudio() {
    if (feedAudio) {
      try {
        feedAudio.pause();
        feedAudio.removeAttribute('src');
        feedAudio.load();
      } catch (e) {}
      feedAudio = null;
    }
    feedAudioPostId = null;
    document.querySelectorAll('.post-music.playing').forEach(function (el) {
      el.classList.remove('playing');
    });
  }

  // Expõe para o silenciador não matar isto
  window.__tchiloFeedMusic = {
    stop: stopFeedAudio,
    getAudio: function () {
      return feedAudio;
    },
    isFeedAudio: function (a) {
      return a && feedAudio && a === feedAudio;
    }
  };

  function playPostMusic(postId, previewUrl, row, forceUnmute) {
    if (!previewUrl) return;
    if (feedAudioPostId === postId && feedAudio) {
      if (forceUnmute) {
        feedMusicMuted = false;
        feedAudio.muted = false;
        feedAudio.play().catch(function () {});
      }
      return;
    }
    stopFeedAudio();
    try {
      feedAudio = new Audio(previewUrl);
      feedAudio.loop = true;
      feedAudio.crossOrigin = 'anonymous';
      feedAudio.setAttribute('data-tchilo-feed-music', '1');
      // marcar para o hook de silence
      feedAudio.__tchiloFeedMusic = true;
      feedAudio.muted = forceUnmute ? false : feedMusicMuted;
      if (forceUnmute) feedMusicMuted = false;
      feedAudioPostId = postId;
      feedAudio.play().catch(function () {});
      if (row) row.classList.add('playing');
      if (!feedAudio.muted) {
        var btn = document.querySelector('.feed-sound-btn.pm-sound[data-music-post="' + postId + '"]');
        if (btn) btn.classList.add('on');
      }
      feedAudio.onended = function () {
        stopFeedAudio();
      };
    } catch (e) {
      console.warn('Tchilo feed music', e);
    }
  }

  function getScrollRoot() {
    var screen = document.getElementById('screen-feed');
    if (screen && screen.classList.contains('active')) return screen;
    return null; // viewport
  }

  function setupObserver() {
    if (!('IntersectionObserver' in window)) return;
    if (observer) {
      try {
        observer.disconnect();
      } catch (e) {}
    }
    var root = getScrollRoot();
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var media = entry.target;
          var prev = media.getAttribute('data-music-preview');
          var pid = media.getAttribute('data-music-post');
          if (!prev || !pid) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            if (feedAudioPostId !== pid) {
              var row = document.querySelector('.post-music[data-post-music="' + pid + '"]');
              playPostMusic(pid, prev, row, false);
            }
          } else if (feedAudioPostId === pid) {
            stopFeedAudio();
          }
        });
      },
      { root: root, threshold: [0.45, 0.6, 0.75], rootMargin: '0px' }
    );
    document.querySelectorAll('#feedList .post-media[data-music-preview]').forEach(function (el) {
      observer.observe(el);
    });
  }

  function ensureMusicAttrs() {
    var posts = typeof getPosts === 'function' ? getPosts() : [];
    var byId = {};
    posts.forEach(function (p) {
      if (p && p.id) byId[String(p.id)] = p;
    });
    document.querySelectorAll('#feedList .post[data-id]').forEach(function (postEl) {
      var id = postEl.getAttribute('data-id');
      var p = byId[id];
      if (!p) return;
      var meta = p.musicMeta || (typeof p.music === 'object' ? p.music : null);
      if (!meta && typeof p.music === 'string') {
        // sem preview URL — não dá para tocar
        return;
      }
      if (!meta || !meta.preview) return;
      var media = postEl.querySelector('.post-media');
      if (!media) return;
      media.setAttribute('data-music-preview', meta.preview);
      media.setAttribute('data-music-post', id);

      // botão de som se for foto
      if (!media.querySelector('video') && !media.querySelector('.feed-sound-btn.pm-sound')) {
        media.style.position = media.style.position || 'relative';
        media.insertAdjacentHTML(
          'beforeend',
          '<button type="button" class="feed-sound-btn pm-sound" data-music-post="' +
            id +
            '" aria-label="Som">' +
            '<svg class="icon-muted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15 9.5l4 4M19 9.5l-4 4"/></svg>' +
            '<svg class="icon-sound" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" style="display:none"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a4 4 0 010 7M18 6a7 7 0 010 12"/></svg>' +
            '</button>'
        );
        var sbtn = media.querySelector('.feed-sound-btn.pm-sound');
        sbtn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          var prev = media.getAttribute('data-music-preview');
          var pid = media.getAttribute('data-music-post');
          if (!prev) return;
          if (feedAudioPostId === pid && feedAudio && !feedAudio.paused) {
            feedMusicMuted = !feedMusicMuted;
            feedAudio.muted = feedMusicMuted;
            sbtn.classList.toggle('on', !feedMusicMuted);
          } else {
            playPostMusic(pid, prev, postEl.querySelector('.post-music'), true);
            sbtn.classList.add('on');
          }
        };
      }
    });
    setupObserver();
  }

  // Não deixar o silenciador matar o áudio do feed
  function protectFromSilence() {
    if (window.tchiloStopAllMusic && !window.tchiloStopAllMusic.__feedProtected) {
      var orig = window.tchiloStopAllMusic;
      window.tchiloStopAllMusic = function () {
        // guarda o áudio do feed
        var keep = feedAudio;
        var keepId = feedAudioPostId;
        orig.apply(this, arguments);
        // se o feed estava a tocar, retoma
        if (keep && keepId) {
          feedAudio = keep;
          feedAudioPostId = keepId;
          try {
            if (feedAudio.paused) feedAudio.play().catch(function () {});
          } catch (e) {}
        }
      };
      window.tchiloStopAllMusic.__feedProtected = true;
    }
  }

  function hookRender() {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__fmFix) {
      var orig = window.renderFeed;
      window.renderFeed = function () {
        var r = orig.apply(this, arguments);
        setTimeout(ensureMusicAttrs, 50);
        setTimeout(ensureMusicAttrs, 300);
        return r;
      };
      window.renderFeed.__fmFix = true;
    }
  }

  function boot() {
    ensureMusicAttrs();
    hookRender();
    protectFromSilence();
    setTimeout(function () {
      ensureMusicAttrs();
      hookRender();
      protectFromSilence();
    }, 600);
    setTimeout(ensureMusicAttrs, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
