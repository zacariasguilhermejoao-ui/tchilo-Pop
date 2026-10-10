/**
 * Música: Cancelar branco nos sheets escuros + parar áudio ao publicar
 */
(function () {
  'use strict';
  if (window.__tchiloMusicStopV1) return;
  window.__tchiloMusicStopV1 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloMusicStopCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloMusicStopCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* Cancelar legível em sheets escuros (música / ações) */
      '.sheet button.cancel,' +
      '.sheet .cancel,' +
      '[id*="Music"] button.cancel,' +
      '[id*="music"] button.cancel,' +
      '.music-use-sheet .cancel,' +
      '.tchilo-music-use .cancel,' +
      'button[data-a="cancel"],' +
      '.sheet-panel button.cancel{' +
      'background:#ffffff!important;' +
      'color:#0B0B0C!important;' +
      'border:2px solid rgba(255,255,255,.35)!important;' +
      'font-weight:800!important;}' +
      /* botão texto Cancelar no fundo preto */
      '.sheet .sheet-panel button:last-child,' +
      '[role="dialog"] button.cancel{' +
      'background:#fff!important;color:#0B0B0C!important;}';
  }

  function stopAllMusic() {
    try {
      document.querySelectorAll('audio').forEach(function (a) {
        try {
          a.pause();
          a.currentTime = 0;
        } catch (e) {}
      });
    } catch (e) {}
    try {
      if (window.__tchiloMusicAudio) {
        window.__tchiloMusicAudio.pause();
        window.__tchiloMusicAudio = null;
      }
    } catch (e2) {}
    try {
      /* audio criado em music-sheet */
      if (window.__tchiloPreviewAudio) {
        window.__tchiloPreviewAudio.pause();
        window.__tchiloPreviewAudio = null;
      }
    } catch (e3) {}
  }

  window.tchiloStopAllMusic = stopAllMusic;

  function patchPublish() {
    ['publishPostCore', 'publishPost', 'publish'].forEach(function (name) {
      try {
        if (typeof window[name] !== 'function' || window[name].__musicStop) return;
        var orig = window[name];
        window[name] = function () {
          stopAllMusic();
          var r = orig.apply(this, arguments);
          try {
            if (r && typeof r.then === 'function') {
              r.then(function () {
                stopAllMusic();
              }).catch(function () {
                stopAllMusic();
              });
            }
          } catch (e) {}
          setTimeout(stopAllMusic, 100);
          setTimeout(stopAllMusic, 800);
          return r;
        };
        window[name].__musicStop = true;
      } catch (e) {}
    });
  }

  injectCSS();
  patchPublish();
  setTimeout(patchPublish, 500);
  setTimeout(patchPublish, 2000);

  /* reforço: ao sair do create */
  document.addEventListener(
    'click',
    function (e) {
      var t = e.target && e.target.closest ? e.target.closest('button, [role="button"]') : null;
      if (!t) return;
      var txt = (t.textContent || '').trim().toLowerCase();
      if (txt === 'publicar' || txt === 'partilhar' || txt === 'postar') {
        setTimeout(stopAllMusic, 50);
        setTimeout(stopAllMusic, 500);
      }
    },
    true
  );
})();
