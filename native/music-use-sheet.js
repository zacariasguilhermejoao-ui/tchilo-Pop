/**
 * tchilo-Pop — Ao tocar na música (feed ou story):
 * opções "Criar story" e "Fazer post" com essa música
 * + silencia pré-visualizações ao selecionar/fechar/publicar
 */
(function () {
  'use strict';

  var pending = null;

  /* ---- Silêncio global de pré-views ---- */
  if (!window.__tchiloAudioHooked) {
    window.__tchiloAudioHooked = true;
    window.__tchiloAudios = window.__tchiloAudios || [];
    var OrigAudio = window.Audio;
    window.Audio = function (src) {
      var a = src !== undefined ? new OrigAudio(src) : new OrigAudio();
      try {
        window.__tchiloAudios.push(a);
        if (window.__tchiloAudios.length > 40) {
          window.__tchiloAudios = window.__tchiloAudios.filter(function (x) {
            return x && !x.ended;
          });
        }
      } catch (e) {}
      return a;
    };
    window.Audio.prototype = OrigAudio.prototype;
  }

  function stopEl(a) {
    if (!a) return;
    try {
      a.pause();
      a.muted = true;
      a.currentTime = 0;
      a.removeAttribute('src');
      a.src = '';
      a.load();
    } catch (e) {}
  }

  function stopAllMusic() {
    try {
      if (typeof window.tchiloStopStoryAudio === 'function') window.tchiloStopStoryAudio();
    } catch (e) {}
    try {
      (window.__tchiloAudios || []).forEach(stopEl);
      window.__tchiloAudios = [];
    } catch (e) {}
    try {
      document.querySelectorAll('audio').forEach(stopEl);
    } catch (e) {}
    try {
      document
        .querySelectorAll('.playbtn.playing, .me-play.playing, #storyMusicChip.playing, .post-music.playing')
        .forEach(function (el) {
          el.classList.remove('playing');
        });
      document.querySelectorAll('#pmList .dots, #meMusicList .dots').forEach(function (d) {
        d.style.display = 'none';
      });
    } catch (e) {}
  }
  window.tchiloStopAllMusic = stopAllMusic;

  // Selecionar faixa (não o play) → parar
  document.addEventListener(
    'click',
    function (e) {
      var row = e.target.closest && e.target.closest('.me-track, #pmList .track');
      if (!row) return;
      if (e.target.closest('.playbtn, .me-play, .favbtn')) return;
      setTimeout(stopAllMusic, 0);
      setTimeout(stopAllMusic, 80);
      setTimeout(stopAllMusic, 250);
    },
    true
  );

  document.addEventListener(
    'click',
    function (e) {
      if (
        e.target.closest &&
        (e.target.closest('#meMusicClose') ||
          e.target.closest('#pmClose') ||
          e.target.closest('#meClose') ||
          e.target.closest('#mePublish'))
      ) {
        stopAllMusic();
      }
    },
    true
  );

  function watchSheets() {
    ['meMusicSheet', 'tchiloPostMusicSheet'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.__silenceObs) return;
      el.__silenceObs = true;
      try {
        new MutationObserver(function () {
          if (!el.classList.contains('open')) stopAllMusic();
        }).observe(el, { attributes: true, attributeFilter: ['class'] });
      } catch (e) {}
    });
  }

  function hookPublish() {
    if (typeof window.publishStory === 'function' && !window.publishStory.__silence) {
      var ps = window.publishStory;
      window.publishStory = async function (data) {
        stopAllMusic();
        data = data || {};
        if (data.text) {
          data.text = String(data.text)
            .split('\n')
            .filter(function (line) {
              return !/^♪\s*/.test(String(line).trim());
            })
            .join('\n')
            .trim();
        }
        var r = await ps.call(this, data);
        stopAllMusic();
        return r;
      };
      window.publishStory.__silence = true;
    }
  }

  function hookGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__silence) return;
    var g = window.goTo;
    window.goTo = function () {
      stopAllMusic();
      return g.apply(this, arguments);
    };
    window.goTo.__silence = true;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAllMusic();
  });
  window.addEventListener('pagehide', stopAllMusic);

  setTimeout(function () {
    watchSheets();
    hookPublish();
    hookGoTo();
  }, 400);
  setTimeout(function () {
    watchSheets();
    hookPublish();
    hookGoTo();
  }, 1200);

  /* ---- Sheet usar música ---- */

  function normalize(m) {
    if (!m) return null;
    if (typeof m === 'string') {
      var s = m.replace(/^♪\s*/, '').trim();
      var p = s.split(' · ');
      return { title: p[0] || s, artist: p[1] || '', preview: '', cover: '' };
    }
    if (typeof m === 'object') {
      return {
        id: m.id || '',
        title: m.title || 'Música',
        artist: m.artist || '',
        preview: m.preview || m.url || '',
        cover: m.cover || ''
      };
    }
    return null;
  }

  function ensureSheet() {
    if (document.getElementById('tchiloMusicUseSheet')) return;
    var root = document.createElement('div');
    root.id = 'tchiloMusicUseSheet';
    root.innerHTML =
      '<style>' +
      '#tchiloMusicUseSheet{display:none;position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.5);align-items:flex-end;justify-content:center;}' +
      '#tchiloMusicUseSheet.open{display:flex!important;}' +
      '#tchiloMusicUseSheet .panel{width:min(100%,520px);background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);' +
      'border-radius:20px 20px 0 0;padding:18px 16px calc(22px + env(safe-area-inset-bottom));' +
      'border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.2);}' +
      '#tchiloMusicUseSheet h3{margin:0 0 4px;font-size:18px;font-weight:900;}' +
      '#tchiloMusicUseSheet .sub{font-size:13px;font-weight:600;opacity:.75;margin-bottom:14px;}' +
      '#tchiloMusicUseSheet .opt{width:100%;border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;padding:14px 16px;' +
      'background:#fff;font-weight:800;font-size:15px;margin-bottom:10px;cursor:pointer;text-align:left;color:var(--ink,#0B0B0C);}' +
      '#tchiloMusicUseSheet .opt:active{background:var(--mint,#c8f560);}' +
      '#tchiloMusicUseSheet .cancel{width:100%;border:0;background:transparent;font-weight:800;padding:12px;cursor:pointer;}' +
      '</style>' +
      '<div class="panel" role="dialog" aria-label="Usar esta música">' +
      '<h3>Usar esta música</h3>' +
      '<div class="sub" id="musUseSub"></div>' +
      '<button type="button" class="opt" id="musUseStory">Criar story com esta música</button>' +
      '<button type="button" class="opt" id="musUsePost">Fazer post com esta música</button>' +
      '<button type="button" class="cancel" id="musUseCancel">Cancelar</button>' +
      '</div>';
    document.body.appendChild(root);

    document.getElementById('musUseCancel').onclick = closeSheet;
    root.addEventListener('click', function (e) {
      if (e.target === root) closeSheet();
    });

    document.getElementById('musUseStory').onclick = function () {
      var m = pending;
      closeSheet();
      stopAllMusic();
      if (!m) return;
      applyMusic(m);
      if (typeof closeStory === 'function') {
        try {
          closeStory();
        } catch (e) {}
      }
      if (typeof openStoryCreateSheet === 'function') openStoryCreateSheet();
      else if (typeof goTo === 'function') goTo('feed');
      if (typeof showToast === 'function') showToast('Música pronta — escolhe foto ou vídeo para o story');
    };

    document.getElementById('musUsePost').onclick = function () {
      var m = pending;
      closeSheet();
      stopAllMusic();
      if (!m) return;
      applyMusic(m);
      if (typeof closeStory === 'function') {
        try {
          closeStory();
        } catch (e) {}
      }
      if (typeof goTo === 'function') goTo('create');
      setTimeout(function () {
        if (typeof window.tchiloUpdatePostMusicBtn === 'function') window.tchiloUpdatePostMusicBtn();
      }, 300);
      if (typeof showToast === 'function') showToast('Música pronta — escolhe uma foto para o post');
    };
  }

  function applyMusic(m) {
    m = normalize(m);
    if (!m) return;
    window._pendingMusic = m.title + (m.artist ? ' · ' + m.artist : '');
    window._pendingMusicMeta = m;
    window._storyMusicPick = m;
    try {
      sessionStorage.setItem('tchilo_last_music_meta', JSON.stringify(m));
    } catch (e) {}
  }

  function openSheet(music) {
    music = normalize(music);
    if (!music) {
      if (typeof showToast === 'function') showToast('Música indisponível');
      return;
    }
    pending = music;
    ensureSheet();
    var sub = document.getElementById('musUseSub');
    if (sub) sub.textContent = (music.title || 'Música') + (music.artist ? ' · ' + music.artist : '');
    document.getElementById('tchiloMusicUseSheet').classList.add('open');
    if (typeof pauseStoryTimer === 'function') {
      try {
        pauseStoryTimer();
      } catch (e) {}
    }
  }

  function closeSheet() {
    var el = document.getElementById('tchiloMusicUseSheet');
    if (el) el.classList.remove('open');
    pending = null;
    if (typeof resumeStoryTimer === 'function') {
      try {
        resumeStoryTimer();
      } catch (e) {}
    }
  }

  function musicFromPostId(postId) {
    var posts = typeof getPosts === 'function' ? getPosts() : [];
    var p = posts.find(function (x) {
      return x && String(x.id) === String(postId);
    });
    if (!p) return null;
    if (p.musicMeta) return normalize(p.musicMeta);
    if (p.music && typeof p.music === 'object') return normalize(p.music);
    if (p.music) {
      var n = normalize(p.music);
      var media = document.querySelector('.post[data-id="' + postId + '"] .post-media');
      if (media && media.getAttribute('data-music-preview')) {
        n.preview = media.getAttribute('data-music-preview');
      }
      return n;
    }
    return null;
  }

  function musicFromStoryChip() {
    try {
      var s =
        typeof getActiveStory === 'function'
          ? getActiveStory()
          : typeof activeStoryItems !== 'undefined'
            ? activeStoryItems[activeStoryIndex]
            : null;
      if (!s) return null;
      return normalize(s.musicMeta || s.music);
    } catch (e) {
      return null;
    }
  }

  function onTap(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    if (t.closest('.feed-sound-btn')) return;
    if (t.closest('.playbtn, .me-play, .favbtn')) return;

    var row = t.closest('.post-music');
    if (row) {
      e.preventDefault();
      e.stopPropagation();
      var id = row.getAttribute('data-post-music');
      var meta = musicFromPostId(id);
      if (!meta) {
        var txt = (row.querySelector('.pm-text') || {}).textContent || 'Música';
        meta = normalize(txt);
        var media = document.querySelector('.post[data-id="' + id + '"] .post-media');
        if (media && media.getAttribute('data-music-preview')) {
          meta.preview = media.getAttribute('data-music-preview');
        }
      }
      openSheet(meta);
      return;
    }

    var chip = t.closest('#storyMusicChip');
    if (chip) {
      e.preventDefault();
      e.stopPropagation();
      openSheet(musicFromStoryChip() || { title: 'Música', artist: '' });
    }
  }

  document.addEventListener('click', onTap, true);
  document.addEventListener(
    'touchend',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('.post-music') || t.closest('#storyMusicChip')) onTap(e);
    },
    { capture: true, passive: false }
  );

  window.tchiloOpenMusicUseSheet = openSheet;
  window.tchiloCloseMusicUseSheet = closeSheet;
})();
