/**
 * Tchilo — título da música no post do feed
 * v2 — label fiável (musicMeta / music / music_title) + injeção após render
 */
(function () {
  'use strict';
  if (window.__tchiloMusicFeedFixV2) return;
  window.__tchiloMusicFeedFixV2 = true;
  window.__tchiloMusicFeedFixV1 = true;

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function musicLabel(p) {
    if (!p) return '';
    var meta = p.musicMeta || p.music_meta || null;
    if (typeof p.music === 'object' && p.music) meta = meta || p.music;

    var title =
      (meta && (meta.title || meta.name || meta.track)) ||
      p.music_title ||
      p.musicTitle ||
      '';
    var artist =
      (meta && (meta.artist || meta.artistName || meta.artist_name)) ||
      p.music_artist ||
      p.musicArtist ||
      '';

    title = String(title || '').trim();
    artist = String(artist || '').trim();

    if (title && artist) return title + ' · ' + artist;
    if (title) return title;
    if (artist) return artist;

    if (typeof p.music === 'string' && p.music.trim()) {
      var s = p.music.trim();
      /* evita strings técnicas */
      if (s.indexOf('http') === 0) return '';
      return s;
    }
    return '';
  }

  function musicPreview(p) {
    if (!p) return '';
    var meta = p.musicMeta || p.music_meta || (typeof p.music === 'object' ? p.music : null);
    if (meta && (meta.preview || meta.previewUrl || meta.preview_url))
      return meta.preview || meta.previewUrl || meta.preview_url;
    return p.musicPreview || p.music_preview || '';
  }

  function injectCSS() {
    if (document.getElementById('tchiloMusicFeedCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloMusicFeedCSS';
    st.textContent =
      '.post-music,.tchilo-post-music{' +
      'display:flex!important;align-items:center!important;gap:8px!important;' +
      'padding:8px 14px!important;margin:0!important;' +
      'font:700 13px Inter,system-ui,sans-serif!important;' +
      'color:var(--ink,#0B0B0C)!important;' +
      'background:transparent!important;border:0!important;' +
      'cursor:pointer!important;position:relative!important;z-index:2!important;}' +
      '.post-music .pm-icon,.tchilo-post-music .pm-icon{' +
      'display:inline-flex!important;align-items:center!important;flex-shrink:0!important;}' +
      '.post-music .pm-text,.tchilo-post-music .tchilo-pm-text{' +
      'overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;' +
      'flex:1!important;}' +
      '.post-music.playing .pm-icon{animation:tchiloMusicPulse 1s ease-in-out infinite;}' +
      '@keyframes tchiloMusicPulse{0%,100%{opacity:1}50%{opacity:.45}}';
    document.head.appendChild(st);
  }

  function svgMusic() {
    return (
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
    );
  }

  function findPostData(id) {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      return posts.find(function (x) {
        return String(x.id) === String(id);
      });
    } catch (e) {
      return null;
    }
  }

  function injectOne(postEl, p) {
    if (!postEl) return;
    if (!p) {
      var id =
        postEl.getAttribute('data-id') ||
        postEl.getAttribute('data-post-id') ||
        postEl.id;
      p = findPostData(id);
    }
    if (!p) return;

    var label = musicLabel(p);
    if (!label) return;

    injectCSS();

    var existing = postEl.querySelector('.post-music, .tchilo-post-music');
    if (existing) {
      var text = existing.querySelector('.pm-text, .tchilo-pm-text');
      if (text) text.textContent = label;
      existing.style.display = 'flex';
      return;
    }

    var row = document.createElement('div');
    row.className = 'post-music tchilo-post-music';
    row.setAttribute('data-post-music', String(p.id || ''));
    row.innerHTML =
      '<span class="pm-icon">' +
      svgMusic() +
      '</span><span class="pm-text tchilo-pm-text">' +
      esc(label) +
      '</span>';

    var preview = musicPreview(p);
    if (preview) row.setAttribute('data-preview', preview);

    row.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (typeof openMusicUseSheet === 'function') openMusicUseSheet(p.musicMeta || p.music);
        else if (typeof playPostMusic === 'function') playPostMusic(p.id, preview);
      } catch (err) {}
    });

    /* inserir depois da media / antes das ações */
    var actions =
      postEl.querySelector('.post-actions') ||
      postEl.querySelector('.post-footer') ||
      postEl.querySelector('.post-caption');
    var media =
      postEl.querySelector('.post-media') ||
      postEl.querySelector('.feed-video-wrap') ||
      postEl.querySelector('.post-image');

    if (actions && actions.parentNode) {
      actions.parentNode.insertBefore(row, actions);
    } else if (media && media.parentNode) {
      if (media.nextSibling) media.parentNode.insertBefore(row, media.nextSibling);
      else media.parentNode.appendChild(row);
    } else {
      postEl.appendChild(row);
    }
  }

  function injectAll() {
    injectCSS();
    var nodes = document.querySelectorAll(
      '#feedList .post, #feedList [data-id], #feedList .feed-post'
    );
    nodes.forEach(function (el) {
      var id = el.getAttribute('data-id') || el.getAttribute('data-post-id');
      var p = id ? findPostData(id) : null;
      injectOne(el, p);
    });
  }

  function boot() {
    injectAll();
  }

  if (typeof window.renderFeed === 'function' && !window.renderFeed.__musicTitleV2) {
    var rf = window.renderFeed;
    window.renderFeed = function () {
      var r = rf.apply(this, arguments);
      setTimeout(injectAll, 30);
      setTimeout(injectAll, 200);
      setTimeout(injectAll, 600);
      return r;
    };
    window.renderFeed.__musicTitleV2 = true;
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setInterval(injectAll, 5000);

  try {
    var feed = document.getElementById('feedList');
    if (feed && !feed.__musicObsV2) {
      feed.__musicObsV2 = true;
      new MutationObserver(function () {
        setTimeout(injectAll, 50);
      }).observe(feed, { childList: true, subtree: false });
    }
  } catch (e) {}
})();
