/**
 * Tchilo — garante música no post e título visível no feed
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloMusicFeedFixV1) return;
  window.__tchiloMusicFeedFixV1 = true;

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function musicLabel(p) {
    if (!p) return '';
    var meta = p.musicMeta || null;
    if (typeof p.music === 'object' && p.music && p.music.title) {
      meta = p.music;
    }
    if (meta && (meta.title || meta.artist)) {
      var t = meta.title || '';
      var a = meta.artist || '';
      return a ? t + ' · ' + a : t;
    }
    if (typeof p.music === 'string' && p.music) return p.music;
    return '';
  }

  function musicPreview(p) {
    if (!p) return '';
    var meta = p.musicMeta || (typeof p.music === 'object' ? p.music : null);
    if (meta && meta.preview) return meta.preview;
    if (p.musicPreview) return p.musicPreview;
    return '';
  }

  function svgMusic() {
    return (
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
    );
  }

  function injectOne(postEl, p) {
    if (!postEl || !p) return;
    var label = musicLabel(p);
    if (!label) return;

    var existing = postEl.querySelector('.post-music, .tchilo-post-music');
    if (existing) {
      var text = existing.querySelector('.pm-text, .tchilo-pm-text');
      if (text) text.textContent = label;
      return;
    }

    var row = document.createElement('div');
    row.className = 'post-music tchilo-post-music';
    row.setAttribute('data-post-music', String(p.id || ''));
    row.innerHTML =
      '<span class="pm-icon" style="display:inline-flex;align-items:center">' +
      svgMusic() +
      '</span><span class="pm-text tchilo-pm-text">' +
      esc(label) +
      '</span>';
    row.style.cssText =
      'display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:13px;font-weight:700;' +
      'color:var(--ink,#0B0B0C);opacity:.92;cursor:pointer;';

    var preview = musicPreview(p);
    if (preview) {
      row.setAttribute('data-preview', preview);
      row.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (typeof playPostMusic === 'function') {
            playPostMusic(p.id, preview, row, true);
            return;
          }
        } catch (err) {}
        try {
          if (!window.__tchiloFeedMusicAudio) window.__tchiloFeedMusicAudio = new Audio();
          var a = window.__tchiloFeedMusicAudio;
          if (a.src === preview && !a.paused) {
            a.pause();
            return;
          }
          a.src = preview;
          a.play().catch(function () {});
        } catch (err2) {}
      };
    }

    /* inserir após a media / antes das ações */
    var media =
      postEl.querySelector('.post-media, .feed-media, .media-wrap, .feed-video-wrap, img, video');
    var actions = postEl.querySelector('.post-actions, .feed-actions');
    if (media && media.parentNode) {
      if (media.nextSibling) media.parentNode.insertBefore(row, media.nextSibling);
      else media.parentNode.appendChild(row);
    } else if (actions && actions.parentNode) {
      actions.parentNode.insertBefore(row, actions);
    } else {
      postEl.appendChild(row);
    }
  }

  function injectAll() {
    var feed = document.getElementById('feedList');
    if (!feed) return;
    var posts = typeof getPosts === 'function' ? getPosts() : [];
    var byId = {};
    posts.forEach(function (p) {
      if (p && p.id) byId[String(p.id)] = p;
    });
    feed.querySelectorAll('.post[data-id], [data-post-id], article[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id') || el.getAttribute('data-post-id');
      var p = byId[String(id)];
      if (p) injectOne(el, p);
    });
  }

  /* Quando seleciona música, normalizar meta */
  window.tchiloSetPendingMusic = function (track) {
    if (!track) {
      window._pendingMusic = null;
      window._pendingMusicMeta = null;
      return;
    }
    var meta = {
      id: track.id || track.trackId || '',
      title: track.title || track.name || 'Música',
      artist: track.artist || track.artistName || track.artist_name || '',
      preview: track.preview || track.previewUrl || track.preview_url || '',
      cover: track.cover || track.albumCover || track.image || ''
    };
    window._pendingMusicMeta = meta;
    window._pendingMusic = meta.title + (meta.artist ? ' · ' + meta.artist : '');
    try {
      if (typeof showToast === 'function') showToast('Música: ' + window._pendingMusic);
    } catch (e) {}
    try {
      var btn = document.getElementById('tchiloCreateMusicBtn') || document.getElementById('postMusicBtn');
      if (btn) {
        var span = btn.querySelector('span');
        if (span) span.textContent = 'Música: ' + meta.title;
        else btn.textContent = 'Música: ' + meta.title;
      }
    } catch (e2) {}
  };

  /* Garantir botão música visível só com foto */
  function ensureMusicBtn() {
    var screen = document.getElementById('screen-create');
    if (!screen) return;
    var btn = document.getElementById('tchiloCreateMusicBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloCreateMusicBtn';
      btn.textContent = 'Adicionar música';
      btn.style.cssText =
        'margin:10px 0;width:100%;font-weight:800;border:2.5px solid var(--ink,#0B0B0C);' +
        'padding:12px;border-radius:14px;background:var(--paper,#F3F1E9);cursor:pointer;' +
        'box-shadow:3px 3px 0 var(--ink,#0B0B0C);display:none';
      btn.onclick = function (e) {
        e.preventDefault();
        try {
          if (typeof openPostMusic === 'function') return openPostMusic();
        } catch (err) {}
        try {
          if (typeof tchiloOpenPostMusic === 'function') return tchiloOpenPostMusic();
        } catch (err2) {}
        try {
          if (typeof window.openMusicPicker === 'function') return window.openMusicPicker();
        } catch (err3) {}
      };
      var pub =
        screen.querySelector('.publish-btn') ||
        screen.querySelector('button[onclick*="publishPost"]');
      if (pub && pub.parentNode) pub.parentNode.insertBefore(btn, pub);
      else screen.appendChild(btn);
    }
    /* mostrar só se há imagem e não vídeo */
    var hasVideo = false;
    var hasImage = false;
    try {
      var d = window.createMediaData;
      if (d && d.items) {
        d.items.forEach(function (it) {
          var t = String((it && it.type) || '').toLowerCase();
          var m = String((it && it.mime) || '').toLowerCase();
          if (t === 'video' || m.indexOf('video/') === 0) hasVideo = true;
          else hasImage = true;
        });
      }
    } catch (e) {}
    if (hasImage && !hasVideo) {
      btn.style.display = 'block';
      if (window._pendingMusicMeta && window._pendingMusicMeta.title) {
        btn.textContent = 'Música: ' + window._pendingMusicMeta.title;
      }
    } else {
      btn.style.display = 'none';
    }
  }

  function patchRenderFeed() {
    if (typeof window.renderFeed !== 'function') return;
    if (window.renderFeed.__musicFixV1) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      setTimeout(injectAll, 30);
      setTimeout(injectAll, 200);
      setTimeout(injectAll, 600);
      return r;
    };
    window.renderFeed.__musicFixV1 = true;
  }

  function boot() {
    patchRenderFeed();
    ensureMusicBtn();
    injectAll();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setInterval(function () {
    ensureMusicBtn();
    injectAll();
  }, 2500);
})();
