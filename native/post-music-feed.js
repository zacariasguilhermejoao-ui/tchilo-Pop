/**
 * tchilo-Pop — Música em posts + feed
 * Tema claro Tchilo · populares em cache · play/pause visível · sem trechos
 */
(function () {
  'use strict';

  var feedAudio = null;
  var feedAudioPostId = null;
  var feedObserver = null;
  var sheetAudio = null;
  var sheetPlayingId = null;
  var topCache = null;
  var topCacheAt = 0;
  var TOP_TTL = 10 * 60 * 1000;

  function svgMusic() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
  }
  function svgPlay() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  function svgPause() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';
  }

  function getCreateItems() {
    try {
      if (typeof createMediaData !== 'undefined' && createMediaData && createMediaData.items) return createMediaData.items;
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
    var hasVideo = items.some(function (m) { return m && m.type === 'video'; });
    var hasImage = items.some(function (m) { return m && m.type === 'image'; });
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
      }, 10000);
      function cleanup() {
        clearTimeout(timeout);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
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

  function loadTopTracks(force) {
    if (!force && topCache && Date.now() - topCacheAt < TOP_TTL) {
      return Promise.resolve(topCache);
    }
    return catalogFetch('chart/0/tracks?limit=40').then(function (data) {
      var list = ((data && data.data) || []).map(mapTrack).filter(Boolean);
      topCache = list;
      topCacheAt = Date.now();
      try {
        sessionStorage.setItem('tchilo_top_tracks', JSON.stringify({ at: topCacheAt, list: list }));
      } catch (e) {}
      return list;
    });
  }

  function restoreTopFromSession() {
    try {
      var raw = sessionStorage.getItem('tchilo_top_tracks');
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && o.list && o.list.length && Date.now() - (o.at || 0) < TOP_TTL) {
        topCache = o.list;
        topCacheAt = o.at;
      }
    } catch (e) {}
  }

  function searchTracks(q) {
    q = String(q || '').trim();
    if (!q) return loadTopTracks(false);
    return catalogFetch('search?q=' + encodeURIComponent(q) + '&limit=40').then(function (data) {
      return ((data && data.data) || []).map(mapTrack).filter(Boolean);
    });
  }

  function ensureMusicSheet() {
    if (document.getElementById('tchiloPostMusicSheet')) return;
    var root = document.createElement('div');
    root.id = 'tchiloPostMusicSheet';
    root.innerHTML =
      '<style>' +
      '#tchiloPostMusicSheet{display:none;position:fixed;inset:0;z-index:290;background:rgba(0,0,0,.35);align-items:flex-end;justify-content:center;}' +
      '#tchiloPostMusicSheet.open{display:flex;}' +
      '#tchiloPostMusicSheet .panel{width:min(100%,520px);max-height:82vh;background:var(--paper,#f6f1e7);color:var(--ink,#17171a);border-radius:20px 20px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px;border:3px solid var(--ink,#17171a);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.18);}' +
      '#tchiloPostMusicSheet .head{display:flex;justify-content:space-between;align-items:center;}' +
      '#tchiloPostMusicSheet .head b{font-size:18px;font-weight:800;}' +
      '#tchiloPostMusicSheet .sub{font-size:12px;font-weight:700;color:var(--muted,#6b6b70);text-transform:uppercase;letter-spacing:.04em;}' +
      '#tchiloPostMusicSheet .close{border:2px solid var(--ink,#17171a);background:var(--mint,#c8f560);color:var(--ink,#17171a);border-radius:12px;width:40px;height:40px;font-size:20px;font-weight:800;cursor:pointer;line-height:1;}' +
      '#tchiloPostMusicSheet .search{display:flex;gap:8px;align-items:center;background:#fff;border:2px solid var(--ink,#17171a);border-radius:14px;padding:10px 12px;}' +
      '#tchiloPostMusicSheet .search input{flex:1;border:0;background:transparent;color:var(--ink,#17171a);font-size:15px;font-weight:600;outline:none;}' +
      '#tchiloPostMusicSheet .list{overflow:auto;flex:1;min-height:180px;-webkit-overflow-scrolling:touch;}' +
      '#tchiloPostMusicSheet .track{display:flex;gap:12px;align-items:center;padding:12px 4px;border-bottom:1px solid rgba(23,23,26,.08);cursor:pointer;}' +
      '#tchiloPostMusicSheet .track:active{background:rgba(200,245,96,.25);}' +
      '#tchiloPostMusicSheet .track img{width:52px;height:52px;border-radius:12px;object-fit:cover;border:2px solid var(--ink,#17171a);background:#ddd;}' +
      '#tchiloPostMusicSheet .track .t{flex:1;min-width:0;}' +
      '#tchiloPostMusicSheet .track .t b{display:block;font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloPostMusicSheet .track .t span{font-size:12px;font-weight:600;color:var(--muted,#6b6b70);}' +
      '#tchiloPostMusicSheet .playbtn{width:42px;height:42px;border-radius:50%;border:2px solid var(--ink,#17171a);background:var(--mint,#c8f560);color:var(--ink,#17171a);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}' +
      '#tchiloPostMusicSheet .playbtn.playing{background:var(--pink,#ff6f7d);color:#fff;}' +
      '#tchiloPostMusicSheet .dots{display:inline-flex;gap:3px;align-items:center;margin-left:6px;vertical-align:middle;}' +
      '#tchiloPostMusicSheet .dots i{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.35;animation:tchiloDots 1s infinite ease-in-out;}' +
      '#tchiloPostMusicSheet .dots i:nth-child(2){animation-delay:.15s;}' +
      '#tchiloPostMusicSheet .dots i:nth-child(3){animation-delay:.3s;}' +
      '@keyframes tchiloDots{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1)}}' +
      '#tchiloPostMusicSheet .empty{padding:28px;text-align:center;font-weight:700;color:var(--muted,#6b6b70);}' +
      '#tchiloPostMusicSheet .badge{display:inline-block;font-size:10px;font-weight:800;background:var(--yellow,#ffe66d);border:1.5px solid var(--ink,#17171a);border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:middle;}' +
      '</style>' +
      '<div class="panel">' +
      '<div class="head"><b>Música</b><button type="button" class="close" id="pmClose" aria-label="Fechar">×</button></div>' +
      '<div class="search"><input id="pmSearch" type="search" placeholder="Pesquisar músicas e artistas" autocomplete="off"></div>' +
      '<div class="sub" id="pmSection">Em destaque</div>' +
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
      }, 280);
    };
  }

  function stopSheetPreview() {
    if (sheetAudio) {
      try { sheetAudio.pause(); } catch (e) {}
      sheetAudio = null;
    }
    sheetPlayingId = null;
    document.querySelectorAll('#pmList .playbtn.playing').forEach(function (b) {
      b.classList.remove('playing');
      b.innerHTML = svgPlay();
    });
    document.querySelectorAll('#pmList .dots').forEach(function (d) {
      d.style.display = 'none';
    });
  }

  function togglePreview(track, btn) {
    if (!track || !track.preview) {
      if (typeof showToast === 'function') showToast('Pré-visualização indisponível');
      return;
    }
    if (sheetPlayingId === track.id && sheetAudio && !sheetAudio.paused) {
      stopSheetPreview();
      return;
    }
    stopSheetPreview();
    sheetAudio = new Audio(track.preview);
    sheetPlayingId = track.id;
    btn.classList.add('playing');
    btn.innerHTML = svgPause();
    var row = btn.closest('.track');
    if (row) {
      var dots = row.querySelector('.dots');
      if (dots) dots.style.display = 'inline-flex';
    }
    sheetAudio.play().catch(function () {
      stopSheetPreview();
      if (typeof showToast === 'function') showToast('Não foi possível reproduzir');
    });
    sheetAudio.onended = function () {
      stopSheetPreview();
    };
  }

  function renderTracks(tracks, isSearch) {
    var list = document.getElementById('pmList');
    var section = document.getElementById('pmSection');
    if (section) section.textContent = isSearch ? 'Resultados' : 'Em destaque';
    if (!tracks.length) {
      list.innerHTML = '<div class="empty">Sem resultados</div>';
      return;
    }
    list.innerHTML = tracks
      .map(function (t, i) {
        var badge = !isSearch && i < 3 ? '<span class="badge">TOP</span>' : '';
        return (
          '<div class="track" data-i="' +
          i +
          '">' +
          (t.cover
            ? '<img src="' + String(t.cover).replace(/"/g, '') + '" alt="">'
            : '<div style="width:52px;height:52px;border-radius:12px;background:#ddd;border:2px solid #17171a"></div>') +
          '<div class="t"><b>' +
          String(t.title).replace(/</g, '<') +
          badge +
          '<span class="dots" style="display:none"><i></i><i></i><i></i></span></b><span>' +
          String(t.artist).replace(/</g, '<') +
          '</span></div>' +
          '<button type="button" class="playbtn" data-play="' +
          i +
          '" aria-label="Pré-ouvir">' +
          svgPlay() +
          '</button></div>'
        );
      })
      .join('');

    list.querySelectorAll('.track').forEach(function (row) {
      row.onclick = function (e) {
        if (e.target.closest('.playbtn')) return;
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
    list.querySelectorAll('.playbtn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var t = tracks[Number(btn.getAttribute('data-play'))];
        togglePreview(t, btn);
      };
    });
  }

  function loadList(q) {
    var list = document.getElementById('pmList');
    var isSearch = !!(q && String(q).trim());
    // Instant: show cache for popular
    if (!isSearch && topCache && topCache.length) {
      renderTracks(topCache, false);
    } else if (!isSearch) {
      list.innerHTML = '<div class="empty">A carregar em destaque…</div>';
    } else {
      list.innerHTML = '<div class="empty">A pesquisar…</div>';
    }
    var fn = isSearch ? searchTracks(q) : loadTopTracks(false);
    fn
      .then(function (tracks) {
        renderTracks(tracks, isSearch);
      })
      .catch(function () {
        if (!topCache || !topCache.length) {
          list.innerHTML = '<div class="empty">Não foi possível carregar. Tenta outra vez.</div>';
        }
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
    // Show cache immediately, refresh in background
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

  function attachMusicToLastPost() {
    try {
      if (!window._pendingMusicMeta && !window._pendingMusic) return;
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!posts.length) return;
      var p = posts[0];
      if (!p) return;
      if (window._pendingMusicMeta) {
        p.musicMeta = window._pendingMusicMeta;
        p.music = window._pendingMusicMeta.title + ' · ' + window._pendingMusicMeta.artist;
      } else if (window._pendingMusic) {
        p.music = window._pendingMusic;
      }
      if (typeof save === 'function' && typeof KEYS !== 'undefined') save(KEYS.posts, posts);
      window._pendingMusic = null;
      window._pendingMusicMeta = null;
    } catch (e) {}
  }

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

  function stopFeedAudio() {
    if (feedAudio) {
      try { feedAudio.pause(); } catch (e) {}
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
      if (actions && actions.parentNode) actions.parentNode.insertBefore(row, actions.nextSibling);
      else postEl.appendChild(row);

      var media = postEl.querySelector('.post-media');
      if (media && meta && meta.preview) {
        media.setAttribute('data-music-preview', meta.preview);
        media.setAttribute('data-music-post', id);
        if (!media.__pmTap) {
          media.__pmTap = true;
          media.addEventListener(
            'click',
            function (ev) {
              var prev = media.getAttribute('data-music-preview');
              var pid = media.getAttribute('data-music-post');
              if (!prev) return;
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
    if (!feed || !('IntersectionObserver' in window)) return;
    if (feedObserver) {
      try { feedObserver.disconnect(); } catch (e) {}
    }
    feedObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var media = entry.target;
          var prev = media.getAttribute('data-music-preview');
          var pid = media.getAttribute('data-music-post');
          if (!prev || !pid) return;
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

  function killClipEditorEverywhere() {
    ['meClipSheet', 'meEditClip', 'meClipStart', 'meClipEnd', 'meClipSave', 'meClipClose', 'meClipLabel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    // Hide any button titled Editar near music bar
    document.querySelectorAll('#meMusicBar button, .me-musicbar button').forEach(function (b) {
      var t = (b.getAttribute('title') || b.textContent || '').toLowerCase();
      if (t.indexOf('editar') >= 0 || t.indexOf('trecho') >= 0) b.remove();
    });
  }

  function restyleMediaEditorMusic() {
    var sheet = document.getElementById('meMusicSheet');
    if (!sheet) return;
    var panel = sheet.querySelector('.me-sheet-panel');
    if (panel) {
      panel.style.background = 'var(--paper,#f6f1e7)';
      panel.style.color = 'var(--ink,#17171a)';
      panel.style.border = '3px solid var(--ink,#17171a)';
    }
  }

  function boot() {
    restoreTopFromSession();
    // Pré-carregar populares já ao arrancar
    loadTopTracks(false).catch(function () {});
    injectPostMusicButton();
    hookMediaInput();
    hookRenderFeed();
    killClipEditorEverywhere();
    setTimeout(function () {
      injectPostMusicButton();
      hookMediaInput();
      hookRenderFeed();
      injectMusicIntoFeed();
      killClipEditorEverywhere();
      restyleMediaEditorMusic();
    }, 600);
    setTimeout(killClipEditorEverywhere, 1500);
    setTimeout(killClipEditorEverywhere, 3500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tchiloOpenPostMusic = openPostMusic;
  window.tchiloUpdatePostMusicBtn = updatePostMusicBtn;
})();
