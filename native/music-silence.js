/**
 * tchilo-Pop — silencia pré-visualizações de música
 * Nenhuma música continua a tocar ao selecionar, fechar o sheet, publicar ou sair do ecrã.
 */
(function () {
  'use strict';

  // Regista todos os new Audio() para poder parar depois
  if (!window.__tchiloAudioHooked) {
    window.__tchiloAudioHooked = true;
    window.__tchiloAudios = window.__tchiloAudios || [];
    var OrigAudio = window.Audio;
    window.Audio = function (src) {
      var a = src !== undefined ? new OrigAudio(src) : new OrigAudio();
      try {
        window.__tchiloAudios.push(a);
        // limpa referências mortas
        if (window.__tchiloAudios.length > 40) {
          window.__tchiloAudios = window.__tchiloAudios.filter(function (x) {
            return x && !x.ended;
          });
        }
      } catch (e) {}
      return a;
    };
    window.Audio.prototype = OrigAudio.prototype;
    try {
      Object.keys(OrigAudio).forEach(function (k) {
        try {
          window.Audio[k] = OrigAudio[k];
        } catch (e2) {}
      });
    } catch (e3) {}
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
      document.querySelectorAll('.playbtn.playing, .me-play.playing, #storyMusicChip.playing, .post-music.playing').forEach(function (el) {
        el.classList.remove('playing');
      });
      document.querySelectorAll('#pmList .dots, #meMusicList .dots').forEach(function (d) {
        d.style.display = 'none';
      });
    } catch (e) {}
  }

  window.tchiloStopAllMusic = stopAllMusic;

  // Selecionar faixa (não o botão play) → silêncio imediato
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
          e.target.id === 'meMusicClose' ||
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
        // limpa texto ♪ que o editor antigo metia
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
    if (typeof window.publishPost === 'function' && !window.publishPost.__silence) {
      var pp = window.publishPost;
      window.publishPost = function () {
        stopAllMusic();
        var r = pp.apply(this, arguments);
        stopAllMusic();
        return r;
      };
      window.publishPost.__silence = true;
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAllMusic();
  });
  window.addEventListener('pagehide', stopAllMusic);

  function hookGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__silence) return;
    var g = window.goTo;
    window.goTo = function () {
      stopAllMusic();
      return g.apply(this, arguments);
    };
    window.goTo.__silence = true;
  }

  function boot() {
    watchSheets();
    hookPublish();
    hookGoTo();
    setTimeout(function () {
      watchSheets();
      hookPublish();
      hookGoTo();
    }, 600);
    setTimeout(hookPublish, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
