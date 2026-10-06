/**
 * Tchilo compose + music sheet polish v8b
 * - PUBLICAR right, same style as POST/STORY/TEMA
 * - Mode tabs clickable (does NOT block native handlers)
 * - Music list: no soft shadows, larger hi-res covers
 */
(function () {
  if (window.__TCHILO_COMPOSE_MUSIC_V8b) return;
  window.__TCHILO_COMPOSE_MUSIC_V8b = true;
  window.__TCHILO_COMPOSE_MUSIC_V8 = true;
  window.__TCHILO_COMPOSE_MUSIC_V7 = true;
  window.__TCHILO_COMPOSE_MUSIC_V6 = true;

  var composeAudio = null;
  var lastPreview = null;
  var audioUnlocked = false;
  var playAttempts = 0;

  function inject() {
    var st = document.getElementById('tchilo-compose-v8-css');
    if (st) return;
    st = document.createElement('style');
    st.id = 'tchilo-compose-v8-css';
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
      '#tchiloMediaPicker .mp-eq{display:flex;align-items:flex-end;gap:2px;height:14px;}',
      '#tchiloMediaPicker .mp-eq i{width:3px;background:#fff;border-radius:1px;animation:mpEqV8 .9s ease-in-out infinite;transform-origin:bottom;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(1){height:6px;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(2){height:12px;animation-delay:.15s;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(3){height:8px;animation-delay:.3s;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(4){height:14px;animation-delay:.45s;}',
      '@keyframes mpEqV8{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}',
      '#tchiloMediaPicker .mp-music-float.paused .mp-eq i{animation:none;opacity:.45;}',
      '#tchiloMediaPicker .mp-music-float .mp-music-x{border:0!important;background:transparent!important;color:#fff!important;',
      'padding:0!important;width:22px!important;height:22px!important;border-radius:0!important;',
      'font:700 16px/1 system-ui,sans-serif;cursor:pointer;line-height:1;box-shadow:none!important;filter:none!important;}',
      '#tchiloMediaPicker .mp-top{display:flex!important;align-items:center!important;gap:8px!important;',
      'padding:10px 12px!important;padding-top:max(10px,env(safe-area-inset-top))!important;}',
      '#tchiloMediaPicker .mp-modes{flex:1!important;display:flex!important;align-items:center!important;justify-content:center!important;',
      'min-width:0!important;pointer-events:auto!important;z-index:5!important;}',
      '#tchiloMediaPicker .mp-modes.mp-modes-hidden{display:none!important;}',
      '#tchiloMediaPicker .mp-mode{border:0!important;background:transparent!important;color:rgba(11,11,12,.28)!important;',
      'font:800 22px/1.1 system-ui,-apple-system,sans-serif!important;letter-spacing:0.04em!important;',
      'text-transform:uppercase!important;padding:6px 10px!important;cursor:pointer!important;',
      'pointer-events:auto!important;-webkit-tap-highlight-color:transparent!important;}',
      '#tchiloMediaPicker .mp-mode.on{color:#0B0B0C!important;}',
      '#tchiloMediaPicker .mp-publish,#tchiloMediaPicker #mpPublishBtn{',
      'margin-left:auto!important;margin-right:0!important;order:99!important;',
      'background:transparent!important;background-color:transparent!important;',
      'color:#0B0B0C!important;border:0!important;border-radius:0!important;',
      'box-shadow:none!important;filter:none!important;padding:6px 4px!important;',
      'font:800 18px/1.1 system-ui,-apple-system,sans-serif!important;',
      'text-transform:uppercase!important;letter-spacing:0.04em!important;',
      'cursor:pointer!important;-webkit-appearance:none!important;appearance:none!important;',
      'flex-shrink:0!important;}',
      '#tchiloPostMusicSheet .close,#tchiloPostMusicSheet .favbtn,#tchiloPostMusicSheet .usebtn,',
      '#tchiloPostMusicSheet .cover-play,#tchiloPostMusicSheet .tab,#tchiloPostMusicSheet .track,',
      '#tchiloPostMusicSheet .panel,#tchiloPostMusicSheet .search{',
      'box-shadow:none!important;filter:none!important;-webkit-filter:none!important;',
      'text-shadow:none!important;}',
      '#tchiloPostMusicSheet .favbtn,#tchiloPostMusicSheet .usebtn{',
      'background:transparent!important;border:0!important;box-shadow:none!important;',
      'width:36px!important;height:36px!important;}',
      '#tchiloPostMusicSheet .favbtn.on{background:transparent!important;}',
      '#tchiloPostMusicSheet .close{',
      'background:transparent!important;box-shadow:none!important;filter:none!important;',
      'border:0!important;}',
      '#tchiloPostMusicSheet .cover-play{',
      'width:64px!important;height:64px!important;border-radius:8px!important;',
      'box-shadow:none!important;filter:none!important;overflow:hidden!important;',
      'background:transparent!important;padding:0!important;border:0!important;}',
      '#tchiloPostMusicSheet .cover-play img{',
      'width:100%!important;height:100%!important;object-fit:cover!important;',
      'border-radius:8px!important;box-shadow:none!important;filter:none!important;',
      'image-rendering:auto!important;}',
      '#tchiloPostMusicSheet .cover-ico{',
      'background:rgba(0,0,0,.28)!important;box-shadow:none!important;filter:none!important;}',
      '#tchiloPostMusicSheet .track img{',
      'width:64px!important;height:64px!important;border-radius:8px!important;',
      'box-shadow:none!important;filter:none!important;}'
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
    sheet.querySelectorAll('.cover-play img, .track img').forEach(function (img) {
      var s = img.getAttribute('src') || '';
      var n = hiResCover(s);
      if (n && n !== s) img.setAttribute('src', n);
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
      '<span class="mp-eq"><i></i><i></i><i></i><i></i></span>' +
      '<span class="mp-music-float-title" id="mpMusicFloatTitle">Música</span>' +
      '<button type="button" class="mp-music-x" id="mpMusicFloatX" aria-label="Remover">✕</button>';
    body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target.closest('.mp-music-x')) return;
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
        window._pendingMusicMeta = null;
        window._pendingMusic = null;
      });
    }
    return el;
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
    btn.style.marginRight = '0';
    btn.style.order = '99';
    btn.style.background = 'transparent';
    btn.style.backgroundColor = 'transparent';
    btn.style.color = '#0B0B0C';
    btn.style.border = '0';
    btn.style.borderRadius = '0';
    btn.style.boxShadow = 'none';
    btn.style.textTransform = 'uppercase';
    btn.style.fontWeight = '800';
    btn.style.fontSize = '18px';
    btn.style.letterSpacing = '0.04em';
    btn.style.padding = '6px 4px';
    var top = root.querySelector('.mp-top') || root.querySelector('#mpTop');
    if (top && btn.parentNode === top && top.lastElementChild !== btn) {
      top.appendChild(btn);
    }
  }

  function rebindModes(root) {
    var host = root.querySelector('#mpModes');
    if (!host) return;
    host.style.pointerEvents = 'auto';
    host.style.zIndex = '6';
    host.querySelectorAll('.mp-mode').forEach(function (btn) {
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
      if (btn.__v8bound) return;
      btn.__v8bound = true;
      /* bubble phase only — never capture/stop so native bindModeTabs runs */
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

  function showMusic(meta) {
    var root = document.getElementById('tchiloMediaPicker');
    if (!root || !meta) return;
    inject();
    var el = ensureFloat(root);
    ensureAa(root);
    fixPublish(root);
    if (!el) return;
    el.style.display = 'flex';
    var ti = document.getElementById('mpMusicFloatTitle');
    if (ti) ti.textContent = meta.title || 'Música';
    if (meta.preview) {
      if (lastPreview !== meta.preview || !composeAudio || composeAudio.paused) {
        playA(meta.preview);
      }
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
      if (meta) showMusic(meta);
    }
    upgradeCovers();
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
    else {
      var meta = getMeta();
      if (meta && meta.preview) {
        var root = document.getElementById('tchiloMediaPicker');
        if (root && root.classList.contains('open')) {
          var step = root.querySelector('#mpStepCompose.on, #mpStepStory.on');
          if (step) showMusic(meta);
        }
      }
    }
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
        var meta = getMeta();
        if (meta) showMusic(meta);
        else {
          setTimeout(function () {
            var m2 = getMeta();
            if (m2) showMusic(m2);
          }, 400);
          setTimeout(function () {
            var m3 = getMeta();
            if (m3) showMusic(m3);
          }, 1000);
        }
      }, 50);
    },
    true
  );

  var covObs = null;
  function watchSheet() {
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (!sheet) return;
    upgradeCovers();
    if (!covObs) {
      try {
        covObs = new MutationObserver(function () { upgradeCovers(); });
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
