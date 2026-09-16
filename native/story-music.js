/**
 * tchilo-Pop — Música nos Stories
 * - Guarda musicMeta no story
 * - Mostra título · artista por cima
 * - Reproduz o áudio ao ver o story
 * - Toque na música (feed ou story): criar story / criar post com a música
 */
(function () {
  'use strict';

  var storyAudio = null;
  var storyAudioKey = null;

  function svgMusic() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
  }

  function stopStoryAudio() {
    if (storyAudio) {
      try {
        storyAudio.pause();
        storyAudio.src = '';
      } catch (e) {}
      storyAudio = null;
    }
    storyAudioKey = null;
  }

  function playStoryAudio(key, url, unmuted) {
    if (!url) return;
    if (storyAudioKey === key && storyAudio) {
      storyAudio.muted = !unmuted;
      if (storyAudio.paused) storyAudio.play().catch(function () {});
      return;
    }
    stopStoryAudio();
    storyAudio = new Audio();
    storyAudio.preload = 'auto';
    storyAudio.loop = true;
    storyAudio.crossOrigin = 'anonymous';
    storyAudio.src = url;
    storyAudio.muted = !unmuted;
    storyAudioKey = key;
    storyAudio.play().catch(function () {
      // browser bloqueou — user pode tocar no chip
    });
  }

  function normalizeMusic(m) {
    if (!m) return null;
    if (typeof m === 'string') {
      // "Title · Artist" or text with ♪
      var s = m.replace(/^♪\s*/, '').trim();
      var parts = s.split(' · ');
      return { title: parts[0] || s, artist: parts[1] || '', preview: '', cover: '' };
    }
    if (typeof m === 'object') {
      return {
        id: m.id || '',
        title: m.title || 'Música',
        artist: m.artist || '',
        preview: m.preview || '',
        cover: m.cover || ''
      };
    }
    return null;
  }

  function getStoryMusic(s) {
    if (!s) return null;
    return normalizeMusic(s.musicMeta || s.music || null);
  }

  /* ---- Persist music on publishStory ---- */
  function hookPublishStory() {
    if (typeof window.publishStory !== 'function' || window.publishStory.__smHook) return;
    var orig = window.publishStory;
    window.publishStory = async function (data) {
      data = data || {};
      var music = data.music || data.musicMeta || window._storyMusicPick || null;
      if (music && typeof music === 'object') {
        data.music = music;
        data.musicMeta = music;
      }
      // Wrap by intercepting the item after local save is hard; patch via monkey on getStoriesStore after
      var result = await orig.call(this, data);
      try {
        if (music) {
          var session = typeof getSession === 'function' ? getSession() : null;
          if (session && typeof getStoriesStore === 'function' && typeof saveStoriesStore === 'function') {
            var all = getStoriesStore();
            var arr = Array.isArray(all[session.username]) ? all[session.username] : [];
            if (arr.length) {
              var last = arr[arr.length - 1];
              var nm = normalizeMusic(music);
              if (nm) {
                last.music = nm.title + (nm.artist ? ' · ' + nm.artist : '');
                last.musicMeta = nm;
                all[session.username] = arr;
                saveStoriesStore(all);
              }
            }
          }
        }
      } catch (e) {}
      window._storyMusicPick = null;
      return result;
    };
    window.publishStory.__smHook = true;
  }

  /* ---- Enrich stories when opening viewer (from store) ---- */
  function enrichOpenStoryPayload(items) {
    try {
      var store = typeof getStoriesStore === 'function' ? getStoriesStore() : {};
      return (items || []).map(function (it) {
        if (!it) return it;
        if (it.musicMeta && it.musicMeta.preview) return it;
        var uname = it.name;
        var raw = store[uname];
        if (!raw) return it;
        var arr = Array.isArray(raw) ? raw : [raw];
        var match = arr.find(function (st) {
          return st && Number(st.createdAt || 0) === Number(it.createdAt || 0);
        }) || arr[arr.length - 1];
        if (match && (match.musicMeta || match.music)) {
          it.musicMeta = match.musicMeta || normalizeMusic(match.music);
          it.music = match.music || it.music;
        }
        return it;
      });
    } catch (e) {
      return items;
    }
  }

  function hookOpenStory() {
    if (typeof window.openStory !== 'function' || window.openStory.__smHook) return;
    var orig = window.openStory;
    window.openStory = function (s) {
      var items = Array.isArray(s) ? s : [s];
      items = enrichOpenStoryPayload(items);
      return orig.call(this, items);
    };
    window.openStory.__smHook = true;
  }

  function hookCloseStory() {
    if (typeof window.closeStory !== 'function' || window.closeStory.__smHook) return;
    var orig = window.closeStory;
    window.closeStory = function () {
      stopStoryAudio();
      removeStoryMusicChip();
      return orig.apply(this, arguments);
    };
    window.closeStory.__smHook = true;
  }

  function removeStoryMusicChip() {
    var el = document.getElementById('storyMusicChip');
    if (el) el.remove();
  }

  function ensureStoryMusicStyles() {
    if (document.getElementById('storyMusicStyles')) return;
    var st = document.createElement('style');
    st.id = 'storyMusicStyles';
    st.textContent =
      '#storyMusicChip{position:absolute;left:14px;right:70px;top:calc(58px + env(safe-area-inset-top));z-index:8;' +
      'display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;' +
      'background:rgba(0,0,0,.55);color:#fff;border:1.5px solid rgba(255,255,255,.35);' +
      'font-weight:800;font-size:13px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;max-width:calc(100% - 88px);}' +
      '#storyMusicChip .sm-ico{flex-shrink:0;display:flex;}' +
      '#storyMusicChip .sm-txt{min-width:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#storyMusicChip .sm-txt b{display:block;font-size:13px;}' +
      '#storyMusicChip .sm-txt span{display:block;font-size:11px;font-weight:600;opacity:.85;}' +
      '#storyMusicChip.playing{border-color:#c8f560;}' +
      '#tchiloMusicUseSheet{display:none;position:fixed;inset:0;z-index:320;background:rgba(0,0,0,.45);align-items:flex-end;justify-content:center;}' +
      '#tchiloMusicUseSheet.open{display:flex;}' +
      '#tchiloMusicUseSheet .panel{width:min(100%,520px);background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);' +
      'border-radius:20px 20px 0 0;padding:18px 16px calc(20px + env(safe-area-inset-bottom));border:3px solid var(--ink,#0B0B0C);border-bottom:0;}' +
      '#tchiloMusicUseSheet .panel h3{margin:0 0 6px;font-size:17px;}' +
      '#tchiloMusicUseSheet .panel .sub{font-size:13px;font-weight:600;opacity:.75;margin-bottom:14px;}' +
      '#tchiloMusicUseSheet .opt{width:100%;border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;padding:14px 16px;' +
      'background:#fff;font-weight:800;font-size:15px;margin-bottom:10px;cursor:pointer;text-align:left;color:var(--ink,#0B0B0C);}' +
      '#tchiloMusicUseSheet .opt:active{background:var(--mint,#c8f560);}' +
      '#tchiloMusicUseSheet .cancel{width:100%;border:0;background:transparent;font-weight:800;padding:12px;cursor:pointer;color:var(--ink,#0B0B0C);}';
    document.head.appendChild(st);
  }

  function showStoryMusicChip(s) {
    ensureStoryMusicStyles();
    removeStoryMusicChip();
    var music = getStoryMusic(s);
    if (!music || (!music.title && !music.preview)) return;

    var body = document.getElementById('storyViewerBody') || document.getElementById('storyViewer');
    if (!body) return;
    if (getComputedStyle(body).position === 'static') body.style.position = 'relative';

    var chip = document.createElement('div');
    chip.id = 'storyMusicChip';
    chip.innerHTML =
      '<span class="sm-ico">' +
      svgMusic() +
      '</span><div class="sm-txt"><b>' +
      String(music.title || 'Música').replace(/</g, '<') +
      '</b><span>' +
      String(music.artist || '').replace(/</g, '<') +
      '</span></div>';
    body.appendChild(chip);

    var key = (s.name || '') + '|' + (s.createdAt || '');
    if (music.preview) {
      playStoryAudio(key, music.preview, true);
      chip.classList.add('playing');
    }

    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (typeof pauseStoryTimer === 'function') pauseStoryTimer();
      openMusicUseSheet(music);
    });
  }

  function hookRenderActiveStory() {
    if (typeof window.renderActiveStory !== 'function' || window.renderActiveStory.__smHook) return;
    var orig = window.renderActiveStory;
    window.renderActiveStory = function () {
      stopStoryAudio();
      removeStoryMusicChip();
      var r = orig.apply(this, arguments);
      try {
        var s =
          typeof getActiveStory === 'function'
            ? getActiveStory()
            : window.activeStoryItems && window.activeStoryItems[window.activeStoryIndex];
        // activeStoryItems is let in index - try global path
        if (!s) {
          try {
            s = activeStoryItems[activeStoryIndex];
          } catch (e2) {}
        }
        setTimeout(function () {
          showStoryMusicChip(s);
        }, 40);
      } catch (e) {}
      return r;
    };
    window.renderActiveStory.__smHook = true;
  }

  /* ---- Use music sheet (story + feed) ---- */
  var pendingUseMusic = null;

  function ensureUseSheet() {
    ensureStoryMusicStyles();
    if (document.getElementById('tchiloMusicUseSheet')) return;
    var root = document.createElement('div');
    root.id = 'tchiloMusicUseSheet';
    root.innerHTML =
      '<div class="panel">' +
      '<h3>Usar esta música</h3>' +
      '<div class="sub" id="musUseSub"></div>' +
      '<button type="button" class="opt" id="musUseStory">Criar story com esta música</button>' +
      '<button type="button" class="opt" id="musUsePost">Fazer post com esta música</button>' +
      '<button type="button" class="cancel" id="musUseCancel">Cancelar</button>' +
      '</div>';
    document.body.appendChild(root);
    document.getElementById('musUseCancel').onclick = closeMusicUseSheet;
    root.addEventListener('click', function (e) {
      if (e.target === root) closeMusicUseSheet();
    });
    document.getElementById('musUseStory').onclick = function () {
      var m = pendingUseMusic;
      closeMusicUseSheet();
      if (!m) return;
      window._pendingMusic = m.title + (m.artist ? ' · ' + m.artist : '');
      window._pendingMusicMeta = m;
      window._storyMusicPick = m;
      if (typeof closeStory === 'function') closeStory();
      if (typeof openStoryCreateSheet === 'function') openStoryCreateSheet();
      else if (typeof goTo === 'function') goTo('feed');
      if (typeof showToast === 'function') showToast('Música pronta — escolhe foto ou vídeo para o story');
    };
    document.getElementById('musUsePost').onclick = function () {
      var m = pendingUseMusic;
      closeMusicUseSheet();
      if (!m) return;
      window._pendingMusic = m.title + (m.artist ? ' · ' + m.artist : '');
      window._pendingMusicMeta = m;
      if (typeof closeStory === 'function') closeStory();
      if (typeof goTo === 'function') goTo('create');
      if (typeof window.tchiloUpdatePostMusicBtn === 'function') {
        setTimeout(window.tchiloUpdatePostMusicBtn, 300);
      }
      if (typeof showToast === 'function') showToast('Música pronta — escolhe uma foto para o post');
    };
  }

  function openMusicUseSheet(music) {
    music = normalizeMusic(music);
    if (!music) return;
    pendingUseMusic = music;
    ensureUseSheet();
    var sub = document.getElementById('musUseSub');
    if (sub) {
      sub.textContent =
        (music.title || 'Música') + (music.artist ? ' · ' + music.artist : '');
    }
    document.getElementById('tchiloMusicUseSheet').classList.add('open');
  }

  function closeMusicUseSheet() {
    var el = document.getElementById('tchiloMusicUseSheet');
    if (el) el.classList.remove('open');
    pendingUseMusic = null;
    if (typeof resumeStoryTimer === 'function') {
      try {
        resumeStoryTimer();
      } catch (e) {}
    }
  }

  /* Feed: tapping music row opens use sheet */
  function hookFeedMusicTap() {
    document.addEventListener(
      'click',
      function (e) {
        var row = e.target.closest && e.target.closest('.post-music');
        if (!row) return;
        // don't steal sound button
        if (e.target.closest('.feed-sound-btn')) return;
        e.preventDefault();
        e.stopPropagation();
        var postId = row.getAttribute('data-post-music');
        var posts = typeof getPosts === 'function' ? getPosts() : [];
        var p = posts.find(function (x) {
          return x && String(x.id) === String(postId);
        });
        var meta = p && (p.musicMeta || (typeof p.music === 'object' ? p.music : null));
        if (!meta && p && p.music) meta = normalizeMusic(p.music);
        if (!meta) {
          var media = document.querySelector('.post[data-id="' + postId + '"] .post-media');
          var prev = media && media.getAttribute('data-music-preview');
          meta = {
            title: (row.querySelector('.pm-text') || {}).textContent || 'Música',
            artist: '',
            preview: prev || ''
          };
        }
        openMusicUseSheet(meta);
      },
      true
    );
  }

  function boot() {
    hookPublishStory();
    hookOpenStory();
    hookCloseStory();
    hookRenderActiveStory();
    hookFeedMusicTap();
    setTimeout(function () {
      hookPublishStory();
      hookOpenStory();
      hookCloseStory();
      hookRenderActiveStory();
    }, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tchiloOpenMusicUseSheet = openMusicUseSheet;
  window.tchiloStopStoryAudio = stopStoryAudio;
})();
