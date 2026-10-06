/**
 * Tchilo compose + music polish v9
 * - Clean covers (no gray/black frame), hi-res
 * - Star/fav works (capture-safe)
 * - Loading spinner on music chip until track found
 * - PUBLICAR right, mode tabs, Aa, autoplay
 */
(function () {
  if (window.__TCHILO_COMPOSE_MUSIC_V9) return;
  window.__TCHILO_COMPOSE_MUSIC_V9 = true;
  window.__TCHILO_COMPOSE_MUSIC_V8b = true;
  window.__TCHILO_COMPOSE_MUSIC_V8 = true;

  var composeAudio = null;
  var lastPreview = null;
  var audioUnlocked = false;
  var playAttempts = 0;
  var musicLoading = false;

  function inject() {
    if (document.getElementById('tchilo-compose-v9-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-compose-v9-css';
    st.textContent = [
      '#tchiloMediaPicker .mp-music-chip{display:none!important;}',
      '#tchiloMediaPicker .mp-caption-bar:not(.open){display:none!important;}',
      '#tchiloMediaPicker .mp-caption-bar.open{display:block!important;}',
      '#tchiloMediaPicker .mp-side button{background:#fff!important;color:#0B0B0C!important;',
      'box-shadow:0 2px 10px rgba(0,0,0,.18)!important;backdrop-filter:none!important;border:0!important;}',
      '#tchiloMediaPicker .mp-side button svg{stroke:#0B0B0C!important;fill:none!important;}',
      '#tchiloMediaPicker .mp-side .mp-aa{font:800 15px/1 system-ui,sans-serif;color:#0B0B0C!important;}',
      '#tchiloMediaPicker .mp-music-float{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:8;',
      'display:flex;align-items:center;gap:8px;max-width:min(86%,320px);padding:8px 12px;border-radius:999px;',
      'background:rgba(0,0,0,.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;cursor:pointer;}',
      '#tchiloMediaPicker .mp-music-float-title{font:600 13px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}',
      '#tchiloMediaPicker .mp-music-float-sub{font:500 11px system-ui,sans-serif;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;}',
      '#tchiloMediaPicker .mp-music-float-meta{display:flex;flex-direction:column;min-width:0;}',
      '#tchiloMediaPicker .mp-eq{display:flex;align-items:flex-end;gap:2px;height:14px;flex-shrink:0;}',
      '#tchiloMediaPicker .mp-eq i{width:3px;background:#fff;border-radius:1px;animation:mpEqV9 .9s ease-in-out infinite;transform-origin:bottom;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(1){height:6px;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(2){height:12px;animation-delay:.15s;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(3){height:8px;animation-delay:.3s;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(4){height:14px;animation-delay:.45s;}',
      '@keyframes mpEqV9{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}',
      '#tchiloMediaPicker .mp-music-float.paused .mp-eq i{animation:none;opacity:.45;}',
      '#tchiloMediaPicker .mp-music-float.loading .mp-eq{display:none!important;}',
      '#tchiloMediaPicker .mp-spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;',
      'border-radius:50%;animation:mpSpinV9 .7s linear infinite;flex-shrink:0;display:none;}',
      '#tchiloMediaPicker .mp-music-float.loading .mp-spin{display:block!important;}',
      '@keyframes mpSpinV9{to{transform:rotate(360deg)}}',
      '#tchiloMediaPicker .mp-music-float .mp-music-x{border:0!important;background:transparent!important;color:#fff!important;',
      'padding:0!important;width:22px!important;height:22px!important;border-radius:0!important;',
      'font:700 16px/1 system-ui,sans-serif;cursor:pointer;line-height:1;box-shadow:none!important;filter:none!important;}',
      '#tchiloMediaPicker .mp-music-float.loading .mp-music-x{display:none!important;}',
      '#tchiloMediaPicker .mp-top{display:flex!important;align-items:center!important;gap:8px!important;}',
      '#tchiloMediaPicker .mp-modes{flex:1!important;pointer-events:auto!important;z-index:5!important;}',
      '#tchiloMediaPicker .mp-mode{pointer-events:auto!important;cursor:pointer!important;}',
      '#tchiloMediaPicker .mp-publish,#tchiloMediaPicker #mpPublishBtn{',
      'margin-left:auto!important;order:99!important;background:transparent!important;',
      'color:#0B0B0C!important;border:0!important;border-radius:0!important;box-shadow:none!important;',
      'font:800 18px/1.1 system-ui,-apple-system,sans-serif!important;text-transform:uppercase!important;',
      'letter-spacing:0.04em!important;padding:6px 4px!important;cursor:pointer!important;}',
      '#tchiloPostMusicSheet .cover-play,',
      '#tchiloPostMusicSheet .track > img,',
      '#tchiloPostMusicSheet .track .cover-play{',
      'width:56px!important;height:56px!important;min-width:56px!important;min-height:56px!important;',
      'padding:0!important;margin:0!important;border:0!important;border-radius:8px!important;',
      'overflow:hidden!important;background:transparent!important;background-color:transparent!important;',
      'box-shadow:none!important;filter:none!important;outline:none!important;',
      'flex-shrink:0!important;position:relative!important;}',
      '#tchiloPostMusicSheet .cover-play img,',
      '#tchiloPostMusicSheet .track img,',
      '#tchiloPostMusicSheet .track .cover-play img{',
      'width:56px!important;height:56px!important;max-width:56px!important;max-height:56px!important;',
      'object-fit:cover!important;object-position:center!important;display:block!important;',
      'border:0!important;border-radius:8px!important;padding:0!important;margin:0!important;',
      'background:transparent!important;box-shadow:none!important;filter:none!important;}',
      '#tchiloPostMusicSheet .cover-ph{',
      'width:56px!important;height:56px!important;background:rgba(11,11,12,.08)!important;',
      'border-radius:8px!important;box-shadow:none!important;}',
      '#tchiloPostMusicSheet .cover-ico{',
      'position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;',
      'justify-content:center!important;background:rgba(0,0,0,.3)!important;color:#fff!important;',
      'pointer-events:none!important;border-radius:8px!important;}',
      '#tchiloPostMusicSheet .favbtn,#tchiloPostMusicSheet .usebtn,#tchiloPostMusicSheet .close{',
      'background:transparent!important;background-color:transparent!important;',
      'box-shadow:none!important;filter:none!important;border:0!important;}',
      '#tchiloPostMusicSheet .favbtn.on{background:transparent!important;color:#0B0B0C!important;}',
      '#tchiloPostMusicSheet .favbtn.on svg{fill:#0B0B0C!important;}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  function hiResCover(url) {
    if (!url || typeof url !== 'string') return url;
    return url
      .replace(/\/250x250-/g, '/500x500-')
      .replace(/\/120x120-/g, '/500x500-')
      .replace(/\/56x56-/g, '/500x500-')
      .replace(/cover_medium/g, 'cover_big')
      .replace(/cover_small/g, 'cover_big');
  }

  function upgradeCovers() {
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (!sheet) return;
    sheet.querySelectorAll('.cover-play img, .track img, .track > img').forEach(function (img) {
      var s = img.getAttribute('src') || '';
      var n = hiResCover(s);
      if (n && n !== s) img.setAttribute('src', n);
      img.style.width = '56px';
      img.style.height = '56px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.background = 'transparent';
      img.style.boxShadow = 'none';
    });
    sheet.querySelectorAll('.cover-play').forEach(function (b) {
      b.style.background = 'transparent';
      b.style.boxShadow = 'none';
      b.style.padding = '0';
      b.style.width = '56px';
      b.style.height = '56px';
    });
  }

  function wireFavButtons() {
    var list = document.getElementById('pmList');
    if (!list) return;
    var tracks = list._pmTracks || window.__lastPmTracks || [];
    list.querySelectorAll('.favbtn').forEach(function (btn) {
      if (btn.__v9fav) return;
      btn.__v9fav = true;
      btn.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          var i = Number(btn.getAttribute('data-fav'));
          var t = tracks[i];
          if (!t && window.__lastPmTracks) t = window.__lastPmTracks[i];
          if (!t) return;
          try {
            var key = 'tchilo_fav_music';
            var listFav = [];
            try { listFav = JSON.parse(localStorage.getItem(key) || '[]'); } catch (x) {}
            if (!Array.isArray(listFav)) listFav = [];
            var idx = listFav.findIndex(function (x) { return String(x.id) === String(t.id); });
            var on;
            if (idx >= 0) {
              listFav.splice(idx, 1);
              on = false;
            } else {
              listFav.unshift({
                id: t.id,
                title: t.title,
                artist: t.artist,
                preview: t.preview,
                cover: t.cover
              });
              on = true;
            }
            localStorage.setItem(key, JSON.stringify(listFav.slice(0, 80)));
            btn.classList.toggle('on', on);
            btn.innerHTML = on
              ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/></svg>'
              : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/></svg>';
            if (typeof showToast === 'function') showToast(on ? 'Guardada nas favoritas' : 'Removida das favoritas');
          } catch (err) {}
        },
        true
      );
    });
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        if (!window.__tchiloAudioCtx) window.__tchiloAudioCtx = new Ctx();
        if (window.__tchiloAudioCtx.state === 'suspended') {
          window.__tchiloAudioCtx.resume().catch(function () {});
        }
      }
    } catch (e) {}
    try {
      var a = new Audio();
      a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      a.volume = 0.01;
      var p = a.play();
      if (p && p.then) p.then(function () { try { a.pause(); } catch (x) {} audioUnlocked = true; }).catch(function () {});
      else audioUnlocked = true;
    } catch (e2) {}
    audioUnlocked = true;
  }

  function stopA() {
    if (composeAudio) {
      try { composeAudio.pause(); composeAudio.src = ''; } catch (e) {}
      composeAudio = null;
    }
  }

  function markPlaying(ok) {
    var el = document.getElementById('mpMusicFloat');
    if (!el) return;
    if (ok) el.classList.remove('paused');
    else el.classList.add('paused');
  }

  function playA(url) {
    if (!url) return;
    lastPreview = url;
    unlockAudio();
    stopA();
    try {
      var a = new Audio();
      a.crossOrigin = 'anonymous';
      a.preload = 'auto';
      a.loop = true;
      a.volume = 0.9;
      a.src = url;
      composeAudio = a;
      a.onplaying = function () { markPlaying(true); playAttempts = 0; };
      a.onpause = function () { markPlaying(false); };
      a.onerror = function () { markPlaying(false); };
      function tryPlay() {
        if (!composeAudio || composeAudio !== a) return;
        var pr = a.play();
        if (pr && pr.then) {
          pr.then(function () { markPlaying(true); }).catch(function () {
            markPlaying(false);
            if (playAttempts < 8) {
              playAttempts++;
              setTimeout(tryPlay, 200 + playAttempts * 150);
            }
          });
        } else markPlaying(true);
      }
      playAttempts = 0;
      tryPlay();
      setTimeout(tryPlay, 80);
      setTimeout(tryPlay, 250);
      setTimeout(tryPlay, 600);
      setTimeout(tryPlay, 1200);
    } catch (e) {
      markPlaying(false);
    }
  }

  function ensureFloat(root) {
    var el = document.getElementById('mpMusicFloat');
    if (el) return el;
    var body = root.querySelector('.mp-compose-body') || root.querySelector('#mpStepCompose') || root;
    el = document.createElement('div');
    el.id = 'mpMusicFloat';
    el.className = 'mp-music-float';
    el.style.display = 'none';
    el.innerHTML =
      '<span class="mp-spin" aria-hidden="true"></span>' +
      '<span class="mp-eq"><i></i><i></i><i></i><i></i></span>' +
      '<span class="mp-music-float-meta">' +
      '<span class="mp-music-float-title" id="mpMusicFloatTitle">Música</span>' +
      '<span class="mp-music-float-sub" id="mpMusicFloatArtist"></span>' +
      '</span>' +
      '<button type="button" class="mp-music-x" id="mpMusicFloatX" aria-label="Remover">✕</button>';
    body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target.closest('.mp-music-x')) return;
      if (el.classList.contains('loading')) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        if (typeof window.tchiloOpenCreateMusic === 'function') window.tchiloOpenCreateMusic();
        else if (typeof window.tchiloOpenPostMusic === 'function') window.tchiloOpenPostMusic();
      } catch (err) {}
    });
    var xbtn = document.getElementById('mpMusicFloatX');
    if (xbtn) {
      xbtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        stopA();
        el.style.display = 'none';
        el.classList.add('paused');
        el.classList.remove('loading');
        window._pendingMusicMeta = null;
        window._pendingMusic = null;
        musicLoading = false;
      });
    }
    return el;
  }

  function showLoading() {
    var root = document.getElementById('tchiloMediaPicker');
    if (!root) return;
    inject();
    var el = ensureFloat(root);
    if (!el) return;
    musicLoading = true;
    el.style.display = 'flex';
    el.classList.add('loading');
    el.classList.remove('paused');
    var ti = document.getElementById('mpMusicFloatTitle');
    var ar = document.getElementById('mpMusicFloatArtist');
    if (ti) ti.textContent = 'A procurar música…';
    if (ar) ar.textContent = '';
  }

  function showMusic(meta) {
    var root = document.getElementById('tchiloMediaPicker');
    if (!root || !meta) return;
    inject();
    var el = ensureFloat(root);
    ensureAa(root);
    fixPublish(root);
    if (!el) return;
    musicLoading = false;
    el.style.display = 'flex';
    el.classList.remove('loading');
    var ti = document.getElementById('mpMusicFloatTitle');
    var ar = document.getElementById('mpMusicFloatArtist');
    if (ti) ti.textContent = meta.title || 'Música';
    if (ar) ar.textContent = meta.artist || '';
    if (meta.preview) {
      if (lastPreview !== meta.preview || !composeAudio || composeAudio.paused) {
        playA(meta.preview);
      }
    }
  }

  function ensureAa(root) {
    var side = root.querySelector('.mp-side');
    if (!side || side.querySelector('[data-a="caption"]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-a', 'caption');
    btn.title = 'Texto';
    btn.innerHTML = '<span class="mp-aa">Aa</span>';
    side.appendChild(btn);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var bar = root.querySelector('#mpCaptionBar') || root.querySelector('.mp-caption-bar');
      if (!bar) return;
      var open = bar.classList.toggle('open');
      bar.style.display = open ? 'block' : 'none';
      if (open) {
        var ta = bar.querySelector('textarea');
        if (ta) setTimeout(function () { try { ta.focus(); } catch (x) {} }, 40);
      }
    });
  }

  function fixPublish(root) {
    var btn = root.querySelector('#mpPublishBtn') || root.querySelector('.mp-publish');
    if (!btn) return;
    var t = (btn.textContent || '').trim();
    if (t.toLowerCase() === 'publicar' || t === 'Publicar') btn.textContent = 'PUBLICAR';
    btn.style.marginLeft = 'auto';
    btn.style.order = '99';
    btn.style.background = 'transparent';
    btn.style.color = '#0B0B0C';
    btn.style.border = '0';
    btn.style.boxShadow = 'none';
    btn.style.textTransform = 'uppercase';
    btn.style.fontWeight = '800';
    btn.style.fontSize = '18px';
    var top = root.querySelector('.mp-top') || root.querySelector('#mpTop');
    if (top && btn.parentNode === top && top.lastElementChild !== btn) top.appendChild(btn);
  }

  function rebindModes(root) {
    var host = root.querySelector('#mpModes');
    if (!host) return;
    host.style.pointerEvents = 'auto';
    host.style.zIndex = '6';
    host.querySelectorAll('.mp-mode').forEach(function (btn) {
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
      if (btn.__v9bound) return;
      btn.__v9bound = true;
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-mode');
        if (window.__tchiloSetCreateMode) {
          try { window.__tchiloSetCreateMode(mode); } catch (err) {}
        }
      }, false);
    });
  }

  function getMeta() {
    var m = window._pendingMusicMeta;
    if (m && m.preview) return m;
    try {
      var tracks = window.__lastPmTracks || [];
      if (tracks.length && tracks[0] && tracks[0].preview) {
        var t0 = tracks[0];
        return {
          id: t0.id,
          title: t0.title || 'Música',
          artist: t0.artist || '',
          preview: t0.preview,
          cover: t0.cover || ''
        };
      }
    } catch (e) {}
    return null;
  }

  function fetchAndAttachMusic() {
    var existing = getMeta();
    if (existing && existing.preview) {
      showMusic(existing);
      return;
    }
    showLoading();
    var done = false;
    function finish(meta) {
      if (done) return;
      if (!meta || !meta.preview) return;
      done = true;
      window._pendingMusicMeta = meta;
      window._pendingMusic = (meta.title || '') + (meta.artist ? ' · ' + meta.artist : '');
      showMusic(meta);
    }
    try {
      var tracks = window.__lastPmTracks || [];
      if (tracks.length && tracks[0] && tracks[0].preview) {
        var t0 = tracks[0];
        finish({
          id: t0.id,
          title: t0.title || 'Música',
          artist: t0.artist || '',
          preview: t0.preview,
          cover: t0.cover || ''
        });
        return;
      }
    } catch (e) {}
    try {
      var cb = 'tchiloMP9_' + Date.now();
      window[cb] = function (data) {
        try { delete window[cb]; } catch (e2) {}
        var list = (data && data.data) || [];
        if (!list.length) {
          musicLoading = false;
          var el = document.getElementById('mpMusicFloat');
          if (el) el.style.display = 'none';
          return;
        }
        var x = list[0];
        finish({
          id: x.id || '',
          title: x.title || 'Música',
          artist: (x.artist && x.artist.name) || '',
          preview: x.preview || '',
          cover: (x.album && (x.album.cover_big || x.album.cover_medium || x.album.cover)) || ''
        });
      };
      var s = document.createElement('script');
      s.src = 'https://api.deezer.com/chart/0/tracks?limit=10&output=jsonp&callback=' + cb;
      document.head.appendChild(s);
      setTimeout(function () {
        if (!done) {
          musicLoading = false;
          var el = document.getElementById('mpMusicFloat');
          if (el && el.classList.contains('loading')) el.style.display = 'none';
        }
      }, 8000);
    } catch (e4) {
      musicLoading = false;
    }
  }

  function watchCompose() {
    var root = document.getElementById('tchiloMediaPicker');
    if (!root) return;
    inject();
    if (!root.classList.contains('open')) return;
    ensureFloat(root);
    ensureAa(root);
    fixPublish(root);
    rebindModes(root);
    root.querySelectorAll('.mp-music-chip').forEach(function (el) {
      el.style.display = 'none';
    });
    root.querySelectorAll('.mp-caption-bar').forEach(function (bar) {
      if (!bar.classList.contains('open')) bar.style.display = 'none';
    });
    root.querySelectorAll('.mp-side button').forEach(function (b) {
      b.style.background = '#fff';
      b.style.boxShadow = '0 2px 10px rgba(0,0,0,.18)';
    });
    var step = root.querySelector('#mpStepCompose.on, #mpStepStory.on');
    if (step) {
      var meta = getMeta();
      if (meta && meta.preview) showMusic(meta);
    }
    upgradeCovers();
    wireFavButtons();
  }

  function onMusic(ev) {
    unlockAudio();
    var d = (ev && ev.detail) || {};
    var meta = d.meta || window._pendingMusicMeta;
    if (meta) {
      window._pendingMusicMeta = meta;
      showMusic(meta);
    }
  }

  function onGesture() {
    unlockAudio();
    if (composeAudio && composeAudio.paused && lastPreview) playA(lastPreview);
  }

  document.addEventListener('touchstart', onGesture, { passive: true, capture: true });
  document.addEventListener('click', onGesture, true);
  window.addEventListener('tchilo-music-selected', onMusic);

  document.addEventListener(
    'click',
    function (e) {
      var cell = e.target && e.target.closest && e.target.closest('#tchiloMediaPicker [data-a="pick"], #tchiloMediaPicker .mp-cell');
      if (!cell) return;
      unlockAudio();
      setTimeout(function () {
        var root = document.getElementById('tchiloMediaPicker');
        if (!root || !root.classList.contains('open')) return;
        var step = root.querySelector('#mpStepCompose.on, #mpStepStory.on');
        if (!step) {
          setTimeout(function () {
            var s2 = root.querySelector('#mpStepCompose.on, #mpStepStory.on');
            if (s2) fetchAndAttachMusic();
          }, 200);
          return;
        }
        fetchAndAttachMusic();
      }, 80);
    },
    true
  );

  var covObs = null;
  function watchSheet() {
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (!sheet) return;
    upgradeCovers();
    wireFavButtons();
    if (!covObs) {
      try {
        covObs = new MutationObserver(function () {
          upgradeCovers();
          wireFavButtons();
        });
        covObs.observe(sheet, { childList: true, subtree: true });
      } catch (e) {}
    }
  }

  setInterval(function () {
    watchCompose();
    watchSheet();
  }, 500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      inject();
      watchCompose();
    });
  } else {
    inject();
    watchCompose();
  }
})();
