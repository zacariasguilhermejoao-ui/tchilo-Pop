/**
 * Tchilo — remover TODAS as barras de progresso (cadastro, stories, reels, vídeos)
 */
(function () {
  'use strict';
  if (window.__tchiloHideProgressV2) return;
  window.__tchiloHideProgressV2 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloHideProgressCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloHideProgressCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* Cadastro / login */
      '.signup-progress, .login-gate .signup-progress,' +
      '.signup-progress span, .login-gate .signup-progress span{' +
      'display:none!important;height:0!important;margin:0!important;padding:0!important;' +
      'opacity:0!important;visibility:hidden!important;}' +
      /* Stories */
      '.story-viewer-progress, #storyProgress, .story-viewer-progress .seg,' +
      '.story-viewer-progress .seg i{' +
      'display:none!important;height:0!important;margin:0!important;' +
      'opacity:0!important;visibility:hidden!important;}' +
      /* Reels / scrollbars */
      '.reels-viewer, .reels-track, #reelsTrack, .reel-slide{' +
      'scrollbar-width:none!important;-ms-overflow-style:none!important;}' +
      '.reels-viewer::-webkit-scrollbar, .reels-track::-webkit-scrollbar,' +
      '#reelsTrack::-webkit-scrollbar, .reel-slide::-webkit-scrollbar{' +
      'display:none!important;width:0!important;height:0!important;}' +
      /* Controlos nativos de vídeo */
      'video::-webkit-media-controls,' +
      'video::-webkit-media-controls-enclosure,' +
      'video::-webkit-media-controls-panel,' +
      'video::-webkit-media-controls-timeline,' +
      'video::-webkit-media-controls-current-time-display,' +
      'video::-webkit-media-controls-time-remaining-display,' +
      'video::-webkit-media-controls-progress-bar,' +
      'video::-webkit-progress-bar,' +
      'video::-webkit-progress-value,' +
      'video::-moz-range-track,' +
      'video::-moz-range-progress{' +
      'display:none!important;opacity:0!important;height:0!important;' +
      'width:0!important;visibility:hidden!important;pointer-events:none!important;}' +
      /* Qualquer barra genérica */
      '.reel-progress, .reels-progress, .video-progress, .video-progress-bar,' +
      '.progress-bar, .seek-bar, .scrubber, .media-progress,' +
      '[class*="progress"], [class*="Progress"],' +
      '[class*="seek-bar"], [data-progress], .tp-progress{' +
      'display:none!important;opacity:0!important;height:0!important;margin:0!important;' +
      'visibility:hidden!important;pointer-events:none!important;}';
  }

  function stripVideoControls() {
    document.querySelectorAll('video').forEach(function (v) {
      try {
        v.controls = false;
        v.removeAttribute('controls');
        v.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
      } catch (e) {}
    });
  }

  function removeProgressNodes() {
    document
      .querySelectorAll(
        '.signup-progress, .login-gate .signup-progress,' +
          '.story-viewer-progress, #storyProgress,' +
          '.reel-progress, .reels-progress, .video-progress, .video-progress-bar,' +
          '.progress-bar, .seek-bar, .scrubber, .media-progress, [data-progress]'
      )
      .forEach(function (el) {
        try {
          el.remove();
        } catch (e) {}
      });
  }

  function run() {
    injectCSS();
    stripVideoControls();
    removeProgressNodes();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 100);
  setTimeout(run, 400);
  setTimeout(run, 1200);
  setInterval(run, 2500);

  try {
    new MutationObserver(function () {
      injectCSS();
      removeProgressNodes();
      stripVideoControls();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
