/**
 * Esconde barras de progresso — SEM alterar a área Entrar/Criar conta do index.
 */
(function () {
  'use strict';
  if (window.__tchiloHideProgressV4) return;
  window.__tchiloHideProgressV4 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloHideProgressCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloHideProgressCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.signup-progress,' +
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
      '.reels-viewer,.reels-track,#reelsTrack{' +
      'scrollbar-width:none!important;-ms-overflow-style:none!important;}' +
      '.reels-viewer::-webkit-scrollbar,.reels-track::-webkit-scrollbar,#reelsTrack::-webkit-scrollbar{' +
      'display:none!important;width:0!important;height:0!important;}' +
      'video::-webkit-media-controls-timeline,' +
      'video::-webkit-media-controls-current-time-display,' +
      'video::-webkit-media-controls-time-remaining-display,' +
      'video::-webkit-progress-bar,' +
      'video::-webkit-progress-value{' +
      'display:none!important;opacity:0!important;height:0!important;}';
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
    try {
      document.querySelectorAll(
        '.signup-progress, .story-viewer-progress, #storyProgress, .reel-progress, .reels-progress, .video-progress, .video-progress-bar, .media-progress, .seek-bar, .scrubber'
      ).forEach(function (el) {
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 200);
  setTimeout(run, 1000);
})();
