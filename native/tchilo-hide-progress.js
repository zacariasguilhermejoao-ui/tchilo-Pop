/**
 * Tchilo — remover barras finas de progresso (Reels e resto do app)
 */
(function () {
  'use strict';
  if (window.__tchiloHideProgress) return;
  window.__tchiloHideProgress = true;

  function injectCSS() {
    if (document.getElementById('tchiloHideProgressCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloHideProgressCSS';
    st.textContent =
      /* Reels: sem scrollbars finos */
      '.reels-viewer, .reels-track, #reelsTrack, .reel-slide{' +
      'scrollbar-width:none!important;-ms-overflow-style:none!important;}' +
      '.reels-viewer::-webkit-scrollbar, .reels-track::-webkit-scrollbar,' +
      '#reelsTrack::-webkit-scrollbar, .reel-slide::-webkit-scrollbar{' +
      'display:none!important;width:0!important;height:0!important;}' +
      /* Nunca mostrar controlos nativos de vídeo (barra de progresso) */
      '.reels-viewer video, #reelsTrack video, .reel-slide video,' +
      '.feed-video, video.feed-video, .post-media video{' +
      'controls:none!important;}' +
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
      /* Qualquer barra de progresso custom no app */
      '.reel-progress, .reels-progress, .video-progress, .video-progress-bar,' +
      '.progress-bar, .seek-bar, .scrubber, .media-progress,' +
      '[class*="video-progress"], [class*="reel-progress"],' +
      '[class*="seek-bar"], [data-progress], .tp-progress{' +
      'display:none!important;opacity:0!important;height:0!important;' +
      'visibility:hidden!important;pointer-events:none!important;}' +
      /* story progress só no story viewer — esconder se aparecer fora */
      '.reels-viewer .story-viewer-progress{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function stripVideoControls() {
    document.querySelectorAll('video').forEach(function (v) {
      try {
        v.controls = false;
        v.removeAttribute('controls');
        v.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
        v.setAttribute('disablePictureInPicture', 'true');
      } catch (e) {}
    });
  }

  function removeProgressNodes() {
    document
      .querySelectorAll(
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
  setTimeout(run, 300);
  setTimeout(run, 1200);
  setInterval(run, 4000);

  try {
    new MutationObserver(function () {
      stripVideoControls();
      removeProgressNodes();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
