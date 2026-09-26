/**
 * Tchilo — esconder só barras de progresso (sem bloquear cliques no login)
 */
(function () {
  'use strict';
  if (window.__tchiloHideProgressV3) return;
  window.__tchiloHideProgressV3 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloHideProgressCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloHideProgressCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* Só classes de barra de progresso — NÃO usar [class*="progress"] genérico */
      '.signup-progress,' +
      '.login-gate .signup-progress,' +
      '.signup-progress span,' +
      '.story-viewer-progress,' +
      '#storyProgress,' +
      '.story-viewer-progress .seg,' +
      '.story-viewer-progress .seg i,' +
      '.reel-progress,' +
      '.reels-progress,' +
      '.video-progress,' +
      '.video-progress-bar,' +
      '.media-progress,' +
      '.seek-bar,' +
      '.scrubber{' +
      'display:none!important;height:0!important;margin:0!important;padding:0!important;' +
      'opacity:0!important;visibility:hidden!important;}' +
      /* Scrollbars nos reels */
      '.reels-viewer,.reels-track,#reelsTrack{' +
      'scrollbar-width:none!important;-ms-overflow-style:none!important;}' +
      '.reels-viewer::-webkit-scrollbar,.reels-track::-webkit-scrollbar,#reelsTrack::-webkit-scrollbar{' +
      'display:none!important;width:0!important;height:0!important;}' +
      /* Controlos nativos de vídeo */
      'video::-webkit-media-controls-timeline,' +
      'video::-webkit-media-controls-current-time-display,' +
      'video::-webkit-media-controls-time-remaining-display,' +
      'video::-webkit-progress-bar,' +
      'video::-webkit-progress-value{' +
      'display:none!important;opacity:0!important;height:0!important;}' +
      /* Garantir que login/signup são clicáveis */
      '.login-gate,' +
      '.login-gate *,' +
      '.login-gate button,' +
      '.login-gate a,' +
      '.login-gate input,' +
      '.login-gate select,' +
      '.login-home,' +
      '.login-home button,' +
      '.login-create,' +
      '.login-button{' +
      'pointer-events:auto!important;' +
      'visibility:visible!important;}' +
      '.login-gate{' +
      'z-index:99999!important;' +
      'pointer-events:auto!important;}';
  }

  function stripVideoControls() {
    try {
      document.querySelectorAll('.reels-viewer video, #reelsTrack video, .reel-slide video').forEach(function (v) {
        v.controls = false;
        v.removeAttribute('controls');
      });
    } catch (e) {}
  }

  function hideProgressBars() {
    var sel =
      '.signup-progress, .story-viewer-progress, #storyProgress,' +
      '.reel-progress, .reels-progress, .video-progress, .video-progress-bar,' +
      '.media-progress, .seek-bar, .scrubber';
    try {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('height', '0', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
      });
    } catch (e) {}
  }

  function run() {
    injectCSS();
    hideProgressBars();
    stripVideoControls();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 200);
  setTimeout(run, 1000);
})();
