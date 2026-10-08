/**
 * NO-OP v3 — o index já trata vídeos do feed e stories (tchiloStoriesAutoplay).
 * Native não adiciona ícones de play/pause.
 */
(function () {
  'use strict';
  if (window.__tchiloFeedVideoUiV3) return;
  window.__tchiloFeedVideoUiV3 = true;
  window.__tchiloFeedVideoUiV2 = true;
})();
