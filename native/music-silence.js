/**
 * tchilo-Pop — silencia pré-visualizações de música
 * Nenhuma música continua a tocar ao selecionar, fechar o sheet, publicar ou sair do ecrã.
 */
(function () {
  'use strict';

  function stopEl(a) {
    if (!a) return;
    try {
      a.pause();
      a.muted = true;
      a.removeAttribute('src');
      a.src = '';
      a.load();
    } catch (e) {}
  }

  function stopAllMusic() {
    // Scripts do app
    try {
      if (typeof window.tchiloStopStoryAudio === 'function') window.tchiloStopStoryAudio();
    } catch (e) {}

    // Todos os <audio> do documento
    try {
      document.querySelectorAll('audio').forEach(stopEl);
    } catch (e) {}

    // Audio() criados em JS (sem nó no DOM) — não há API global;
    // forçamos pause em elementos conhecidos e em window refs se existirem
    try {
      ['_tchiloSheetAudio', '_tchiloFeedAudio', '_tchiloStoryAudio', 'sheetAudio', 'feedAudio'].forEach(function (k) {
        if (window[k]) {
          stopEl(window[k]);
          window[k] = null;
        }
      });
    } catch (e) {}

    // UI de play
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

  // Ao selecionar uma faixa (linha da lista)
  document.addEventListener(
    'click',
    function (e) {
      var row = e.target.closest && e.target.closest('.me-track, #pmList .track');
      if (!row) return;
      // playbtn = só pré-ouvir; o resto = selecionar → silenciar
      if (e.target.closest('.playbtn, .me-play, .favbtn')) return;
      // deixa o handler original correr, depois corta o som
      setTimeout(stopAllMusic, 0);
      setTimeout(stopAllMusic, 50);
      setTimeout(stopAllMusic, 200);
    },
    true
  );

  // Fechar sheets de música
  document.addEventListener(
    'click',
    function (e) {
      if (
        e.target.closest &&
        (e.target.closest('#meMusicClose') ||
          e.target.closest('#pmClose') ||
          e.target.id === 'meMusicClose')
      ) {
        stopAllMusic();
      }
    },
    true
  );

  // Observer: sheet fecha → silêncio
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

  // Publicar / fechar editor
  function hookPublish() {
    if (typeof window.publishStory === 'function' && !window.publishStory.__silence) {
      var ps = window.publishStory;
      window.publishStory = async function () {
        stopAllMusic();
        var r = await ps.apply(this, arguments);
        stopAllMusic();
        return r;
      };
      window.publishStory.__silence = true;
    }
    if (typeof window.publishPost === 'function' && !window.publishPost.__silence) {
      var pp = window.publishPost;
      window.publishPost = function () {
        stopAllMusic();
        return pp.apply(this, arguments);
      };
      window.publishPost.__silence = true;
    }
    // media-editor: não meter título da música no texto do story
    if (typeof window.publishStory === 'function' && !window.publishStory.__noMusicText) {
      var orig = window.publishStory;
      window.publishStory = async function (data) {
        data = data || {};
        // remover linhas ♪ Title · Artist que o editor antigo metia
        if (data.text) {
          data.text = String(data.text)
            .split('\n')
            .filter(function (line) {
              return !/^♪\s*/.test(line.trim());
            })
            .join('\n')
            .trim();
        }
        return orig.call(this, data);
      };
      window.publishStory.__noMusicText = true;
    }
  }

  // Sair do ecrã / mudar de tab
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAllMusic();
  });
  window.addEventListener('pagehide', stopAllMusic);
  window.addEventListener('blur', function () {
    // não silenciar sempre no blur (notificações); só se sheet aberto
    var open =
      document.querySelector('#meMusicSheet.open, #tchiloPostMusicSheet.open');
    if (open) stopAllMusic();
  });

  // goTo / navegação
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
