/**
 * tchilo-Pop — Música em posts/story + feed
 * Favoritas · play animado · mute nas fotos · tema Tchilo · sem trechos
 */
(function () {
  'use strict';

  var feedAudio = null;
  var feedAudioPostId = null;
  var feedObserver = null;
  var feedMusicMuted = true; // como vídeos: começa silenciado até o user ligar
  var sheetAudio = null;
  var sheetPlayingId = null;
  var topCache = null;
  var topCacheAt = 0;
  var TOP_TTL = 10 * 60 * 1000;
  var musicTab = 'destaque'; // destaque | favoritas

  function svgMusic() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
  }
  function svgPlay() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  function svgPause() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';
  }
  function svgStar(on) {
    if (on) {
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/></svg>';
  }

  function getFavs() {
    try {
      var a = JSON.parse(localStorage.getItem('tchilo_fav_music') || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }
  function saveFavs(list) {
    try {
      localStorage.setItem('tchilo_fav_music', JSON.stringify(list.slice(0, 80)));
    } catch (e) {}
  }
  function isFav(id) {
    return getFavs().some(function (t) {
      return String(t.id) === String(id);
    });
  }
  function toggleFav(track) {
    if (!track || !track.id) return;
    var list = getFavs();
    var i = list.findIndex(function (t) {
      return String(t.id) === String(track.id);
    });
    if (i >= 0) list.splice(i, 1);
    else
      list.unshift({
        id: track.id,
        title: track.title,
        artist: track.artist,
        preview: track.preview,
        cover: track.cover
      });
    saveFavs(list);
    return i < 0;
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
      }, 10000);
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
      '#tchiloPostMusicSheet .panel{width:min(100%,520px);max-height:82vh;background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px 20px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px;border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.18);}' +
      '#tchiloPostMusicSheet .head{display:flex;justify-content:space-between;align-items:center;}' +
      '#tchiloPostMusicSheet .head b{font-size:18px;font-weight:800;}' +
      '#tchiloPostMusicSheet .tabs{display:flex;gap:8px;}' +
      '#tchiloPostMusicSheet .tab{flex:1;border:2px solid var(--ink,#0B0B0C);border-radius:12px;padding:10px;font-weight:800;font-size:13px;background:#fff;color:var(--ink,#0B0B0C);cursor:pointer;}' +
      '#tchiloPostMusicSheet .tab.on{background:var(--mint,#c8f560);}' +
      '#tchiloPostMusicSheet .close{border:2px solid var(--ink,#0B0B0C);background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);border-radius:12px;width:40px;height:40px;font-size:20px;font-weight:800;cursor:pointer;line-height:1;}' +
      '#tchiloPostMusicSheet .search{display:flex;gap:8px;align-items:center;background:#fff;border:2px solid var(--ink,#0B0B0C);border-radius:14px;padding:10px 12px;}' +
      '#tchiloPostMusicSheet .search input{flex:1;border:0;background:transparent;color:var(--ink,#0B0B0C);font-size:15px;font-weight:600;outline:none;}' +
      '#tchiloPostMusicSheet .list{overflow:auto;flex:1;min-height:180px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}' +
      '#tchiloPostMusicSheet .list::-webkit-scrollbar{display:none;}' +
      '#tchiloPostMusicSheet .track{display:flex;gap:10px;align-items:center;padding:12px 4px;border-bottom:1px solid rgba(23,23,26,.08);cursor:pointer;}' +
      '#tchiloPostMusicSheet .track:active{background:rgba(200,245,96,.25);}' +
      '#tchiloPostMusicSheet .track img{width:52px;height:52px;border-radius:12px;object-fit:cover;border:2px solid var(--ink,#0B0B0C);background:#ddd;}' +
      '#tchiloPostMusicSheet .track .t{flex:1;min-width:0;}' +
      '#tchiloPostMusicSheet .track .t b{display:block;font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloPostMusicSheet .track .t span{font-size:12px;font-weight:600;color:var(--muted,#6b6b70);}' +
      '#tchiloPostMusicSheet .playbtn,#tchiloPostMusicSheet .favbtn{width:40px;height:40px;border-radius:50%;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}' +
      '#tchiloPostMusicSheet .playbtn{background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);}' +
      '#tchiloPostMusicSheet .playbtn.playing{background:var(--pink,#ff6f7d);color:#fff;animation:tchiloPulse 1s ease-in-out infinite;}' +
      '#tchiloPostMusicSheet .favbtn{background:#fff;color:var(--ink,#0B0B0C);}' +
      '#tchiloPostMusicSheet .favbtn.on{background:var(--yellow,#ffe66d);}' +
      '@keyframes tchiloPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}' +
      '#tchiloPostMusicSheet .dots{display:inline-flex;gap:3px;align-items:center;margin-left:6px;vertical-align:middle;}' +
      '#tchiloPostMusicSheet .dots i{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.35;animation:tchiloDots 1s infinite ease-in-out;}' +
      '#tchiloPostMusicSheet .dots i:nth-child(2){animation-delay:.15s;}' +
      '#tchiloPostMusicSheet .dots i:nth-child(3){animation-delay:.3s;}' +
      '@keyframes tchiloDots{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1)}}' +
      '#tchiloPostMusicSheet .empty{padding:28px;text-align:center;font-weight:700;color:var(--muted,#6b6b70);}' +
      '#tchiloPostMusicSheet .badge{display:inline-block;font-size:10px;font-weight:800;background:var(--yellow,#ffe66d);border:1.5px solid var(--ink,#0B0B0C);border-radius:999px;padding:2px 8px;margin-left:6px;}' +
      '[data-theme="dark"] #tchiloPostMusicSheet .search,[data-theme="dark"] #tchiloPostMusicSheet .tab,[data-theme="dark"] #tchiloPostMusicSheet .favbtn{background:rgba(255,255,255,.08);}' +
      /* hide accidental scroll indicators in media editor */
      '#tchiloMediaEd .me-tools,#tchiloMediaEd .me-panel,#tchiloMediaEd .me-list{scrollbar-width:none;-ms-overflow-style:none;}' +
      '#tchiloMediaEd .me-tools::-webkit-scrollbar,#tchiloMediaEd .me-panel::-webkit-scrollbar,#tchiloMediaEd .me-list::-webkit-scrollbar{display:none;width:0;height:0;}' +
      '#tchiloMediaEd .me-range{accent-color:var(--mint,#c8f560);}' +
      /* remove any sheet drag-handle look */
      '#tchiloMediaEd .me-sheet-panel::before,#tchiloPostMusicSheet .panel::before{display:none!important;content:none!important;}' +
      '</style>' +
      '<div class="panel">' +
      '<div class="head"><b>Música</b><button type="button" class="close" id="pmClose" aria-label="Fechar">×</button></div>' +
      '<div class="tabs">' +
      '<button type="button" class="tab on" id="pmTabDestaque">Em destaque</button>' +
      '<button type="button" class="tab" id="pmTabFav">Favoritas</button>' +
      '</div>' +
      '<div class="search" id="pmSearchWrap"><input id="pmSearch" type="search" placeholder="Pesquisar músicas e artistas" autocomplete="off"></div>' +
      '<div class="list" id="pmList"><div class="empty">A carregar…</div></div>' +
      '</div>';
    document.body.appendChild(root);
    document.getElementById('pmClose').onclick = function () {
      root.classList.remove('open');
      stopSheetPreview();
    };
    document.getElementById('pmTabDestaque').onclick = function () {
      musicTab = 'destaque';
      document.getElementById('pmTabDestaque').classList.add('on');
      document.getElementById('pmTabFav').classList.remove('on');
      document.getElementById('pmSearchWrap').style.display = '';
      loadList(document.getElementById('pmSearch').value || '');
    };
    document.getElementById('pmTabFav').onclick = function () {
      musicTab = 'favoritas';
      document.getElementById('pmTabFav').classList.add('on');
      document.getElementById('pmTabDestaque').classList.remove('on');
      document.getElementById('pmSearchWrap').style.display = 'none';
      renderTracks(getFavs(), false, true);
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
      try {
        sheetAudio.pause();
      } catch (e) {}
      sheetAudio = null;
    }
    sheetPlayingId = null;
    document.querySelectorAll('#pmList .playbtn.playing, #meMusicList .me-play.playing').forEach(function (b) {
      b.classList.remove('playing');
      b.innerHTML = svgPlay();
    });
    document.querySelectorAll('#pmList .dots, #meMusicList .dots').forEach(function (d) {
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
    var row = btn.closest('.track, .me-track');
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

  function selectTrack(t) {
    if (!t) return;
    window._pendingMusic = t.title + ' · ' + t.artist;
    window._pendingMusicMeta = {
      id: t.id,
      title: t.title,
      artist: t.artist,
      preview: t.preview,
      cover: t.cover
    };
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (sheet) sheet.classList.remove('open');
    stopSheetPreview();
    updatePostMusicBtn();
    if (typeof showToast === 'function') showToast('Música adicionada');
  }

  function renderTracks(tracks, isSearch, isFavTab) {
    var list = document.getElementById('pmList');
    if (!tracks.length) {
      list.innerHTML =
        '<div class="empty">' +
        (isFavTab ? 'Ainda não tens músicas favoritas. Guarda com a estrela.' : 'Sem resultados') +
        '</div>';
      return;
    }
    list.innerHTML = tracks
      .map(function (t, i) {
        var fav = isFav(t.id);
        var badge = !isSearch && !isFavTab && i < 3 ? '<span class="badge">TOP</span>' : '';
        return (
          '<div class="track" data-i="' +
          i +
          '">' +
          (t.cover
            ? '<img src="' + String(t.cover).replace(/"/g, '') + '" alt="">'
            : '<div style="width:52px;height:52px;border-radius:12px;background:#ddd;border:2px solid #0B0B0C"></div>') +
          '<div class="t"><b>' +
          String(t.title).replace(/</g, '<') +
          badge +
          '<span class="dots" style="display:none"><i></i><i></i><i></i></span></b><span>' +
          String(t.artist).replace(/</g, '<') +
          '</span></div>' +
          '<button type="button" class="favbtn' +
          (fav ? ' on' : '') +
          '" data-fav="' +
          i +
          '" aria-label="Favorita">' +
          svgStar(fav) +
          '</button>' +
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
        if (e.target.closest('.playbtn') || e.target.closest('.favbtn')) return;
        selectTrack(tracks[Number(row.getAttribute('data-i'))]);
      };
    });
    list.querySelectorAll('.playbtn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        togglePreview(tracks[Number(btn.getAttribute('data-play'))], btn);
      };
    });
    list.querySelectorAll('.favbtn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var t = tracks[Number(btn.getAttribute('data-fav'))];
        var on = toggleFav(t);
        btn.classList.toggle('on', on);
        btn.innerHTML = svgStar(on);
        if (isFavTab && !on) {
          renderTracks(getFavs(), false, true);
        }
        if (typeof showToast === 'function') showToast(on ? 'Guardada nas favoritas' : 'Removida das favoritas');
      };
    });
  }

  function loadList(q) {
    if (musicTab === 'favoritas') {
      renderTracks(getFavs(), false, true);
      return;
    }
    var list = document.getElementById('pmList');
    var isSearch = !!(q && String(q).trim());
    if (!isSearch && topCache && topCache.length) {
      renderTracks(topCache, false, false);
    } else if (!isSearch) {
      list.innerHTML = '<div class="empty">A carregar em destaque…</div>';
    } else {
      list.innerHTML = '<div class="empty">A pesquisar…</div>';
    }
    var fn = isSearch ? searchTracks(q) : loadTopTracks(false);
    fn
      .then(function (tracks) {
        if (musicTab === 'favoritas') return;
        renderTracks(tracks, isSearch, false);
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
    musicTab = 'destaque';
    document.getElementById('pmTabDestaque').classList.add('on');
    document.getElementById('pmTabFav').classList.remove('on');
    document.getElementById('pmSearchWrap').style.display = '';
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
  setInterval(function () {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (posts.length > lastPostsLen && (window._pendingMusicMeta || window._pendingMusic)) attachMusicToLastPost();
      lastPostsLen = posts.length;
    } catch (e) {}
  }, 800);

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
    document.querySelectorAll('.feed-sound-btn.pm-sound.on').forEach(function (b) {
      b.classList.remove('on');
    });
  }

  function playPostMusic(postId, previewUrl, row, forceUnmute) {
    if (!previewUrl) return;
    if (feedAudioPostId === postId && feedAudio && !feedAudio.paused) {
      // toggle via same post handled by mute btn mostly
      return;
    }
    stopFeedAudio();
    feedAudio = new Audio(previewUrl);
    feedAudio.loop = true;
    feedAudio.muted = forceUnmute ? false : feedMusicMuted;
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
  }

  function soundBtnHtml(postId) {
    return (
      '<button type="button" class="feed-sound-btn pm-sound" data-music-post="' +
      postId +
      '" aria-label="Som">' +
      '<svg class="icon-muted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15 9.5l4 4M19 9.5l-4 4"/></svg>' +
      '<svg class="icon-sound" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" style="display:none"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a4 4 0 010 7M18 6a7 7 0 010 12"/></svg>' +
      '</button>'
    );
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

      if (!postEl.querySelector('.post-music')) {
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
      }

      var media = postEl.querySelector('.post-media');
      if (!media || !meta || !meta.preview) return;
      media.setAttribute('data-music-preview', meta.preview);
      media.setAttribute('data-music-post', id);

      // Botão de som igual aos vídeos (só em fotos com música)
      if (!media.querySelector('.feed-sound-btn.pm-sound') && !media.querySelector('video')) {
        media.style.position = media.style.position || 'relative';
        media.insertAdjacentHTML('beforeend', soundBtnHtml(id));
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
            if (feedMusicMuted) {
              // silenciado mas continua “a tocar” em mute — ou para?
              // UX: como vídeo — fica a tocar mudo
            }
          } else {
            feedMusicMuted = false;
            playPostMusic(pid, prev, postEl.querySelector('.post-music'), true);
            sbtn.classList.add('on');
          }
        };
      }
    });
    setupFeedMusicAutoplay();
  }

  function setupFeedMusicAutoplay() {
    var feed = document.getElementById('feedList');
    if (!feed || !('IntersectionObserver' in window)) return;
    if (feedObserver) {
      try {
        feedObserver.disconnect();
      } catch (e) {}
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
              playPostMusic(pid, prev, row, false);
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

  /* ---- Story editor: play + favoritas + hide swipe track ---- */
  function enhanceStoryMusicList() {
    if (typeof window.renderMusicList === 'function' && window.renderMusicList.__pm) return;
    // Patch after media-editor loads: observe meMusicList mutations
    var obs = new MutationObserver(function () {
      var list = document.getElementById('meMusicList');
      if (!list || list.__pmEnhanced) return;
      // add play buttons if missing
      list.querySelectorAll('.me-track').forEach(function (row) {
        if (row.querySelector('.me-play')) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'me-play playbtn';
        btn.style.cssText =
          'width:40px;height:40px;border-radius:50%;border:2px solid var(--ink,#0B0B0C);background:var(--mint,#c8f560);color:var(--ink);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;';
        btn.innerHTML = svgPlay();
        btn.onclick = function (e) {
          e.stopPropagation();
          var img = row.querySelector('img');
          var title = (row.querySelector('b') || {}).textContent || '';
          var artist = (row.querySelector('span') || {}).textContent || '';
          // find preview from data if we stored it
          var prev = row.getAttribute('data-preview') || '';
          if (!prev) {
            if (typeof showToast === 'function') showToast('Pré-visualização indisponível');
            return;
          }
          togglePreview({ id: row.getAttribute('data-id') || title, preview: prev, title: title, artist: artist }, btn);
        };
        row.appendChild(btn);
      });
    });
    setInterval(function () {
      var list = document.getElementById('meMusicList');
      if (list && !list.__pmObs) {
        list.__pmObs = true;
        obs.observe(list, { childList: true, subtree: true });
      }
    }, 500);
  }

  // Override media-editor renderMusicList when available
  function patchStoryMusicRenderer() {
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      // inject play into story music by wrapping catalog at selection time
      var list = document.getElementById('meMusicList');
      if (!list) {
        if (tries > 40) clearInterval(t);
        return;
      }
      // monkey-patch: replace tracks click handler enrichment
      if (!window.__tchiloStoryMusicPlay) {
        window.__tchiloStoryMusicPlay = true;
        var origOpen = null;
        // Re-bind when sheet opens
        document.addEventListener(
          'click',
          function (ev) {
            var tool = ev.target.closest && ev.target.closest('[data-tool="music"]');
            if (!tool) return;
            setTimeout(function () {
              enrichMeMusicList();
            }, 400);
            setTimeout(enrichMeMusicList, 900);
          },
          true
        );
      }
      if (tries > 20) clearInterval(t);
    }, 500);
  }

  function enrichMeMusicList() {
    var list = document.getElementById('meMusicList');
    if (!list) return;
    // Fetch top tracks and rebuild with play if list only has plain tracks without preview
    loadTopTracks(false).then(function (tracks) {
      if (!document.getElementById('meMusicSheet') || !document.getElementById('meMusicSheet').classList.contains('open')) return;
      if (!tracks.length) return;
      list.innerHTML = tracks
        .map(function (t, i) {
          return (
            '<div class="me-track" data-i="' +
            i +
            '" data-id="' +
            t.id +
            '" data-preview="' +
            String(t.preview || '').replace(/"/g, '') +
            '">' +
            (t.cover
              ? '<img src="' + String(t.cover).replace(/"/g, '') + '" alt="">'
              : '<div style="width:48px;height:48px;border-radius:10px;background:#ddd"></div>') +
            '<div class="t"><b>' +
            String(t.title).replace(/</g, '<') +
            '<span class="dots" style="display:none"><i></i><i></i><i></i></span></b><span>' +
            String(t.artist).replace(/</g, '<') +
            '</span></div>' +
            '<button type="button" class="favbtn' +
            (isFav(t.id) ? ' on' : '') +
            '" data-fav="' +
            i +
            '" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--ink);background:' +
            (isFav(t.id) ? 'var(--yellow)' : '#fff') +
            ';display:flex;align-items:center;justify-content:center;margin-right:4px">' +
            svgStar(isFav(t.id)) +
            '</button>' +
            '<button type="button" class="me-play playbtn" data-play="' +
            i +
            '" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--ink);background:var(--mint);display:flex;align-items:center;justify-content:center">' +
            svgPlay() +
            '</button></div>'
          );
        })
        .join('');

      list.querySelectorAll('.me-track').forEach(function (row) {
        row.onclick = function (e) {
          if (e.target.closest('.me-play') || e.target.closest('.favbtn')) return;
          var t = tracks[Number(row.getAttribute('data-i'))];
          if (!t) return;
          // set into media-editor state via synthetic path
          try {
            if (window.tchiloOpenMediaEditor) {
              /* state is internal; dispatch selection by clicking-compatible storage */
            }
          } catch (err) {}
          // Store and close sheet — media-editor reads state.music on publish
          var bar = document.getElementById('meMusicBar');
          // Trigger media-editor internal by setting a global the publish can use
          window._storyMusicPick = {
            id: t.id,
            title: t.title,
            artist: t.artist,
            preview: t.preview,
            cover: t.cover
          };
          // Try to call into closed-over state via custom event
          document.dispatchEvent(new CustomEvent('tchilo-story-music', { detail: window._storyMusicPick }));
          document.getElementById('meMusicSheet').classList.remove('open');
          if (bar) {
            bar.style.display = 'flex';
            bar.innerHTML =
              (t.cover ? '<img src="' + t.cover + '" alt="" style="width:40px;height:40px;border-radius:8px">' : '') +
              '<div class="meta" style="flex:1"><b>' +
              String(t.title).replace(/</g, '<') +
              '</b><span>' +
              String(t.artist).replace(/</g, '<') +
              '</span></div>';
          }
          if (typeof showToast === 'function') showToast('Música adicionada');
        };
      });
      list.querySelectorAll('.me-play').forEach(function (btn) {
        btn.onclick = function (e) {
          e.stopPropagation();
          togglePreview(tracks[Number(btn.getAttribute('data-play'))], btn);
        };
      });
      list.querySelectorAll('.favbtn').forEach(function (btn) {
        btn.onclick = function (e) {
          e.stopPropagation();
          var tr = tracks[Number(btn.getAttribute('data-fav'))];
          var on = toggleFav(tr);
          btn.classList.toggle('on', on);
          btn.style.background = on ? 'var(--yellow)' : '#fff';
          btn.innerHTML = svgStar(on);
          if (typeof showToast === 'function') showToast(on ? 'Guardada nas favoritas' : 'Removida das favoritas');
        };
      });
    });
  }

  // Bridge story music into media-editor publish if it listens
  document.addEventListener('tchilo-story-music', function (ev) {
    window._storyMusicPick = ev.detail;
  });

  function killClipAndSwipeChrome() {
    ['meClipSheet', 'meEditClip', 'meClipStart', 'meClipEnd', 'meClipSave', 'meClipClose', 'meClipLabel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    // Hide horizontal scrollbar tracks / drag lines in editor
    var st = document.getElementById('tchiloSwipeHide');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloSwipeHide';
      st.textContent =
        '#tchiloMediaEd .me-tools::-webkit-scrollbar,#tchiloMediaEd .me-panel::-webkit-scrollbar{display:none!important;height:0!important;}' +
        '#tchiloMediaEd .me-tools,#tchiloMediaEd .me-panel{scrollbar-width:none!important;}' +
        '#tchiloMediaEd .me-sheet-panel::before{display:none!important;}' +
        /* common swipe handle bars */
        '.sheet-handle,.swipe-indicator,.drag-handle{display:none!important;}';
      document.head.appendChild(st);
    }
  }

  function boot() {
    restoreTopFromSession();
    loadTopTracks(false).catch(function () {});
    injectPostMusicButton();
    hookMediaInput();
    hookRenderFeed();
    killClipAndSwipeChrome();
    patchStoryMusicRenderer();
    setTimeout(function () {
      injectPostMusicButton();
      hookMediaInput();
      hookRenderFeed();
      injectMusicIntoFeed();
      killClipAndSwipeChrome();
    }, 600);
    setTimeout(killClipAndSwipeChrome, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tchiloOpenPostMusic = openPostMusic;
  window.tchiloUpdatePostMusicBtn = updatePostMusicBtn;
  window.tchiloEnrichStoryMusic = enrichMeMusicList;
})();
