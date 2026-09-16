/**
 * tchilo-Pop — Música em posts (fotos) + feed com autoplay/pause no toque
 * Sem edição de trechos. Sem nome de provedor na UI.
 */
(function () {
  'use strict';

  var feedAudio = null;
  var feedAudioPostId = null;
  var feedObserver = null;

  function svgMusic() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
  }

  function getCreateItems() {
    try {
      if (typeof createMediaData !== 'undefined' && createMediaData && createMediaData.items) {
        return createMediaData.items;
      }
    } catch (e) {}
    try {
      if (window.createMediaData && window.createMediaData.items) return window.createMediaData.items;
    } catch (e2) {}
    var preview = document.getElementById('createPreview');
    if (!preview || !preview.classList.contains('has-media')) return [];
    if (preview.querySelector('video')) return [{ type: 'video' }];
    if (preview.querySelector('img')) return [{ type: 'image' }];
    return [];
  }

  function isPhotoOnlyCreate() {
    var items = getCreateItems();
    if (!items.length) return false;
    var hasVideo = items.some(function (m) {
      return m && m.type === 'video';
    });
    var hasImage = items.some(function (m) {
      return m && m.type === 'image';
    });
    return hasImage && !hasVideo;
  }

  function updatePostMusicBtn() {
    var btn = document.getElementById('postMusicBtn');
    if (!btn) return;
    if (isPhotoOnlyCreate()) {
      btn.style.display = '';
      var span = btn.querySelector('span');
      if (span) {
        span.textContent = window._pendingMusic
          ? 'Música: ' + String(window._pendingMusic).slice(0, 32)
          : 'Adicionar música';
      }
    } else {
      btn.style.display = 'none';
    }
  }

  function catalogFetch(pathQuery) {
    return new Promise(function (resolve, reject) {
      var cb = 'tchiloPM_' + Date.now() + '_' + Math.floor(Math.random() * 1e5);
      var timeout = setTimeout(function () {
        cleanup();
        reject(new Error('timeout'));
      }, 12000);
      function cleanup() {
        clearTimeout(timeout);
        try {
          delete window[cb];
        } catch (e) {
          window[cb] = undefined;
        }
        if (script && script.parentNode) script.parentNode.removeChild(script);
      }
      window[cb] = function (data) {
        cleanup();
        resolve(data);
      };
      var script = document.createElement('script');
      var base = 'https://api.deezer.com/' + pathQuery;
      script.src = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'output=jsonp&callback=' + cb;
      script.onerror = function () {
        cleanup();
        reject(new Error('network'));
      };
      document.head.appendChild(script);
    });
  }

  function mapTrack(t) {
    if (!t) return null;
    return {
      id: String(t.id),
      title: t.title || t.title_short || 'Música',
      artist: (t.artist && t.artist.name) || 'Artista',
      preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || ''
    };
  }

  function ensureMusicSheet() {
    if (document.getElementById('tchiloPostMusicSheet')) return;
    var root = document.createElement('div');
    root.id = 'tchiloPostMusicSheet';
    root.innerHTML =
      '<style>' +
      '#tchiloPostMusicSheet{display:none;position:fixed;inset:0;z-index:290;background:rgba(0,0,0,.55);align-items:flex-end;justify-content:center;}' +
      '#tchiloPostMusicSheet.open{display:flex;}' +
      '#tchiloPostMusicSheet .panel{width:min(100%,520px);max-height:78vh;background:#17171a;color:#fff;border-radius:20px 20px 0 0;padding:14px 14px calc(18px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px;border:2px solid #2a2a2e;border-bottom:0;}' +
      '#tchiloPostMusicSheet .search{display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.08);border-radius:12px;padding:10px 12px;}' +
      '#tchiloPostMusicSheet .search input{flex:1;border:0;background:transparent;color:#fff;font-size:15px;outline:none;}' +
      '#tchiloPostMusicSheet .list{overflow:auto;flex:1;min-height:160px;}' +
      '#tchiloPostMusicSheet .track{display:flex;gap:10px;align-items:center;padding:10px 2px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;}' +
      '#tchiloPostMusicSheet .track img{width:48px;height:48px;border-radius:10px;object-fit:cover;background:#333;}' +
      '#tchiloPostMusicSheet .track b{display:block;font-size:14px;}' +
      '#tchiloPostMusicSheet .track span{font-size:12px;opacity:.65;}' +
      '#tchiloPostMusicSheet .close{border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:12px;width:40px;height:40px;font-size:20px;cursor:pointer;}' +
      '#tchiloPostMusicSheet .empty{padding:28px;text-align:center;opacity:.7;}' +
      '</style>' +
      '<div class="panel">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">Música</b><button type="button" class="close" id="pmClose">×</button></div>' +
      '<div class="search"><input id="pmSearch" type="search" placeholder="Pesquisar músicas e artistas" autocomplete="off"></div>' +
      '<div class="list" id="pmList"><div class="empty">A carregar…</div></div>' +
      '</div>';
    document.body.appendChild(root);
    document.getElementById('pmClose').onclick = function () {
      root.classList.remove('open');
      stopSheetPreview();
    };
    var timer = null;
    document.getElementById('pmSearch').oninput = function () {
      var q = this.value;
      clearTimeout(timer);
      timer = setTimeout(function () {
        loadList(q);
      }, 300);
    };
  }

  var sheetAudio = null;
  function stopSheetPreview() {
    if (sheetAudio) {
      try {
        sheetAudio.pause();
      } catch (e) {}
      sheetAudio = null;
    }
  }

  function loadList(q) {
    var list = document.getElementById('pmList');
    list.innerHTML = '<div class="empty">A carregar…</div>';
    var path = q && String(q).trim()
      ? 'search?q=' + encodeURIComponent(q) + '&limit=40'
      : 'chart/0/tracks?limit=40';
    catalogFetch(path)
      .then(function (data) {
        var tracks = ((data && data.data) || []).map(mapTrack).filter(Boolean);
        if (!tracks.length) {
          list.innerHTML = '<div class="empty">Sem resultados</div>';
          return;
        }
        list.innerHTML = tracks
          .map(function (t, i) {
            return (
              '<div class="track" data-i="' +
              i +
              '">' +
              (t.cover
                ? '<img src="' + String(t.cover).replace(/"/g, '') + '" alt="">'
                : '<div style="width:48px;height:48px;border-radius:10px;background:#333"></div>') +
              '<div style="flex:1;min-width:0"><b>' +
              String(t.title).replace(/</g, '<') +
              '</b><span>' +
              String(t.artist).replace(/</g, '<') +
              '</span></div></div>'
            );
          })
          .join('');
        list.querySelectorAll('.track').forEach(function (row) {
          row.onclick = function () {
            var t = tracks[Number(row.getAttribute('data-i'))];
            if (!t) return;
            window._pendingMusic = t.title + ' · ' + t.artist;
            window._pendingMusicMeta = {
              id: t.id,
              title: t.title,
              artist: t.artist,
              preview: t.preview,
              cover: t.cover
            };
            document.getElementById('tchiloPostMusicSheet').classList.remove('open');
            stopSheetPreview();
            updatePostMusicBtn();
            if (typeof showToast === 'function') showToast('Música adicionada');
          };
        });
      })
      .catch(function () {
        list.innerHTML = '<div class="empty">Não foi possível carregar. Tenta outra vez.</div>';
      });
  }

  function openPostMusic() {
    if (!isPhotoOnlyCreate()) {
      if (typeof showToast === 'function') showToast('Música só para publicações com foto');
      return;
    }
    ensureMusicSheet();
    document.getElementById('tchiloPostMusicSheet').classList.add('open');
    document.getElementById('pmSearch').value = '';
    loadList('');
  }

  function injectPostMusicButton() {
    var host = document.getElementById('galleryBtn');
    if (!host || !host.parentNode) return;
    if (document.getElementById('postMusicBtn')) {
      updatePostMusicBtn();
      return;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'postMusicBtn';
    btn.className = 'gallery-btn';
    btn.style.display = 'none';
    btn.innerHTML = svgMusic() + ' <span>Adicionar música</span>';
    btn.onclick = function (e) {
      e.preventDefault();
      openPostMusic();
    };
    host.parentNode.insertBefore(btn, host.nextSibling);
    updatePostMusicBtn();
  }

  function hookMediaInput() {
    var input = document.getElementById('mediaInput');
    if (input && !input.__pmHook) {
      input.__pmHook = true;
      input.addEventListener('change', function () {
        setTimeout(updatePostMusicBtn, 200);
        setTimeout(updatePostMusicBtn, 600);
      });
    }
    var rm = document.getElementById('removeMediaBtn');
    if (rm && !rm.__pmHook) {
      rm.__pmHook = true;
      rm.addEventListener('click', function () {
        window._pendingMusic = null;
        window._pendingMusicMeta = null;
        setTimeout(updatePostMusicBtn, 150);
      });
    }
    // Observe preview class changes
    var preview = document.getElementById('createPreview');
    if (preview && !preview.__pmObs) {
      preview.__pmObs = true;
      try {
        new MutationObserver(function () {
          updatePostMusicBtn();
        }).observe(preview, { attributes: true, childList: true, subtree: true });
      } catch (e) {}
    }
  }

  function hookPublish() {
    if (typeof window.publishPostCore !== 'function' || window.publishPostCore.__pmHook) {
      // try publishPost
      if (typeof window.publishPost === 'function' && !window.publishPost.__pmHook) {
        var op = window.publishPost;
        window.publishPost = function () {
          // ensure musicMeta is available for the post object built inside
          return op.apply(this, arguments);
        };
        window.publishPost.__pmHook = true;
      }
      return;
    }
  }

  // Patch: after post is built, attach musicMeta — intercept save of posts via wrapping publishPostCore if exists later
  function attachMusicToLastPost() {
    try {
      if (!window._pendingMusicMeta && !window._pendingMusic) return;
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!posts.length) return;
      var p = posts[0];
      if (!p) return;
      if (window._pendingMusicMeta) {
        p.musicMeta = window._pendingMusicMeta;
        p.music =
          window._pendingMusicMeta.title + ' · ' + window._pendingMusicMeta.artist;
      } else if (window._pendingMusic) {
        p.music = window._pendingMusic;
      }
      if (typeof save === 'function' && typeof KEYS !== 'undefined') save(KEYS.posts, posts);
      window._pendingMusic = null;
      // keep meta cleared after attach
      window._pendingMusicMeta = null;
    } catch (e) {}
  }

  // Wrap finish: listen for successful publish via mutation of create form clear
  function hookCreateClear() {
    var origClear = window.clearCreateMedia;
    if (typeof origClear === 'function' && !origClear.__pmHook) {
      window.clearCreateMedia = function () {
        // before clear, if we just published, music already on post
        var r = origClear.apply(this, arguments);
        setTimeout(updatePostMusicBtn, 100);
        return r;
      };
      window.clearCreateMedia.__pmHook = true;
    }
  }

  // Better: wrap the assignment in publish by monkey-patching after posts unshift
  var lastPostsLen = 0;
  function watchPostsForMusic() {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (posts.length > lastPostsLen && (window._pendingMusicMeta || window._pendingMusic)) {
        attachMusicToLastPost();
      }
      lastPostsLen = posts.length;
    } catch (e) {}
  }
  setInterval(watchPostsForMusic, 800);

  /* ---- Feed: show music + play/pause on media tap ---- */
  function stopFeedAudio() {
    if (feedAudio) {
      try {
        feedAudio.pause();
      } catch (e) {}
      feedAudio = null;
    }
    feedAudioPostId = null;
    document.querySelectorAll('.post-music.playing').forEach(function (el) {
      el.classList.remove('playing');
    });
  }

  function playPostMusic(postId, previewUrl, row) {
    if (!previewUrl) return;
    if (feedAudioPostId === postId && feedAudio && !feedAudio.paused) {
      stopFeedAudio();
      return;
    }
    stopFeedAudio();
    feedAudio = new Audio(previewUrl);
    feedAudio.loop = true;
    feedAudioPostId = postId;
    feedAudio.play().catch(function () {});
    if (row) row.classList.add('playing');
    feedAudio.onended = function () {
      stopFeedAudio();
    };
  }

  function injectMusicIntoFeed() {
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
      var label = p.music;
      var meta = p.musicMeta || null;
      if (!label && !meta) return;
      if (typeof label === 'object' && label.title) {
        meta = label;
        label = label.title + ' · ' + (label.artist || '');
      }
      if (!label) return;

      if (postEl.querySelector('.post-music')) return;

      var row = document.createElement('div');
      row.className = 'post-music';
      row.setAttribute('data-post-music', id);
      row.innerHTML =
        '<span class="pm-icon">' +
        svgMusic() +
        '</span><span class="pm-text">' +
        String(label).replace(/</g, '<') +
        '</span>';
      row.style.cssText =
        'display:flex;align-items:center;gap:8px;padding:6px 14px 2px;font-size:13px;font-weight:700;color:var(--ink);opacity:.92;';

      var actions = postEl.querySelector('.post-actions');
      if (actions && actions.parentNode) {
        actions.parentNode.insertBefore(row, actions.nextSibling);
      } else {
        postEl.appendChild(row);
      }

      var media = postEl.querySelector('.post-media');
      if (media && meta && meta.preview) {
        media.setAttribute('data-music-preview', meta.preview);
        media.setAttribute('data-music-post', id);
        if (!media.__pmTap) {
          media.__pmTap = true;
          media.addEventListener(
            'click',
            function (ev) {
              // leave video handler; for images with music, toggle
              var prev = media.getAttribute('data-music-preview');
              var pid = media.getAttribute('data-music-post');
              if (!prev) return;
              // if it's a video, existing video logic may apply — still allow music toggle for photo posts
              if (media.querySelector('video') && !media.querySelector('img')) return;
              ev.stopPropagation();
              playPostMusic(pid, prev, row);
            },
            true
          );
        }
      }
    });

    setupFeedMusicAutoplay();
  }

  function setupFeedMusicAutoplay() {
    var feed = document.getElementById('feedList');
    if (!feed) return;
    if (feedObserver) {
      try {
        feedObserver.disconnect();
      } catch (e) {}
    }
    if (!('IntersectionObserver' in window)) return;
    feedObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var media = entry.target;
          var prev = media.getAttribute('data-music-preview');
          var pid = media.getAttribute('data-music-post');
          if (!prev || !pid) return;
          // only autoplay photo posts with music when mostly visible
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            if (feedAudioPostId !== pid) {
              var row = document.querySelector('.post-music[data-post-music="' + pid + '"]');
              playPostMusic(pid, prev, row);
            }
          } else if (feedAudioPostId === pid) {
            stopFeedAudio();
          }
        });
      },
      { root: feed, threshold: [0.55, 0.7] }
    );
    feed.querySelectorAll('.post-media[data-music-preview]').forEach(function (el) {
      feedObserver.observe(el);
    });
  }

  function hookRenderFeed() {
    if (typeof window.renderFeed !== 'function' || window.renderFeed.__pmHook) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      setTimeout(injectMusicIntoFeed, 0);
      setTimeout(injectMusicIntoFeed, 200);
      return r;
    };
    window.renderFeed.__pmHook = true;
  }

  // Hide clip editor controls if media-editor injected them
  function hideClipEditorUI() {
    var clip = document.getElementById('meClipSheet');
    if (clip) clip.remove();
    var editBtn = document.getElementById('meEditClip');
    if (editBtn) editBtn.style.display = 'none';
  }

  function boot() {
    injectPostMusicButton();
    hookMediaInput();
    hookRenderFeed();
    hideClipEditorUI();
    setTimeout(function () {
      injectPostMusicButton();
      hookMediaInput();
      hookRenderFeed();
      injectMusicIntoFeed();
      hideClipEditorUI();
    }, 800);
    setTimeout(function () {
      injectPostMusicButton();
      updatePostMusicBtn();
    }, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tchiloOpenPostMusic = openPostMusic;
  window.tchiloUpdatePostMusicBtn = updatePostMusicBtn;
})();
