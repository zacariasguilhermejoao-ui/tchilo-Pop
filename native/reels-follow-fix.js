/**
 * tchilo-Pop — botão Seguir sempre no topo direito em TODOS os reels
 * (não desce ao mudar de vídeo)
 */
(function () {
  'use strict';

  function injectCSS() {
    var st = document.getElementById('tchiloReelsFollowCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloReelsFollowCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      /* X sempre canto superior esquerdo */
      '#reelsViewer .reels-close,.reels-viewer .reels-close{' +
      'position:absolute!important;top:12px!important;left:12px!important;' +
      'right:auto!important;bottom:auto!important;z-index:30!important;}' +
      /* Seguir SEMPRE canto superior direito de cada slide */
      '#reelsViewer .reel-slide .reel-follow,' +
      '.reels-viewer .reel-slide .reel-follow,' +
      '.reel-slide > button.reel-follow,' +
      'button.reel-follow{' +
      'position:absolute!important;' +
      'top:12px!important;' +
      'right:12px!important;' +
      'left:auto!important;' +
      'bottom:auto!important;' +
      'transform:none!important;' +
      'margin:0!important;' +
      'z-index:25!important;' +
      'align-self:auto!important;' +
      'inset:auto 12px auto auto!important;' +
      '}' +
      /* evita duet-label em cima do seguir */
      '#reelsViewer .duet-label{top:56px!important;right:12px!important;left:auto!important;}';
  }

  function pinAll() {
    document.querySelectorAll('#reelsViewer .reel-follow, .reel-slide .reel-follow').forEach(function (btn) {
      // estilos inline simples (sem max()) para iOS Safari
      btn.style.setProperty('position', 'absolute', 'important');
      btn.style.setProperty('top', '12px', 'important');
      btn.style.setProperty('right', '12px', 'important');
      btn.style.setProperty('left', 'auto', 'important');
      btn.style.setProperty('bottom', 'auto', 'important');
      btn.style.setProperty('transform', 'none', 'important');
      btn.style.setProperty('margin', '0', 'important');
      btn.style.setProperty('z-index', '25', 'important');
    });
    var close = document.querySelector('#reelsViewer .reels-close');
    if (close) {
      close.style.setProperty('top', '12px', 'important');
      close.style.setProperty('left', '12px', 'important');
      close.style.setProperty('right', 'auto', 'important');
      close.style.setProperty('z-index', '30', 'important');
    }
  }

  function watch() {
    var viewer = document.getElementById('reelsViewer');
    if (!viewer || viewer.__followPin) return;
    viewer.__followPin = true;

    try {
      new MutationObserver(function () {
        pinAll();
      }).observe(viewer, { childList: true, subtree: true });
    } catch (e) {}

    var track = document.getElementById('reelsTrack');
    if (track) {
      track.addEventListener(
        'scroll',
        function () {
          pinAll();
        },
        { passive: true }
      );
    }
  }

  function patchOpen() {
    if (typeof window.openReels !== 'function') return;
    if (window.openReels.__followPin) return;
    var orig = window.openReels;
    window.openReels = function () {
      var r = orig.apply(this, arguments);
      injectCSS();
      setTimeout(pinAll, 0);
      setTimeout(pinAll, 50);
      setTimeout(pinAll, 200);
      setTimeout(watch, 0);
      return r;
    };
    window.openReels.__followPin = true;
    // preserva flags de outros patches
    if (orig.__fast) window.openReels.__fast = true;
    if (orig.__followRight) window.openReels.__followRight = true;
  }

  function boot() {
    injectCSS();
    pinAll();
    watch();
    patchOpen();
    setTimeout(function () {
      injectCSS();
      patchOpen();
      pinAll();
      watch();
    }, 600);
    setTimeout(patchOpen, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
