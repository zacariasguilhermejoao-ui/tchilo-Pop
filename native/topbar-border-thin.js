/**
 * Tchilo — bordas ultra finas (0.5px) + headers limpos
 * v4 — navbar, stories, posts; remove risco de cima nos headers
 */
(function () {
  'use strict';
  if (window.__tchiloTopbarBorderV4) return;
  window.__tchiloTopbarBorderV4 = true;
  window.__tchiloTopbarBorderV3 = true;

  function inject() {
    var st = document.getElementById('tchiloTopbarBorderThinCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloTopbarBorderThinCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* sem linha debaixo do topbar / screen-header */
      '.topbar,' +
      '#screen-feed .topbar,' +
      '.screen-header,' +
      '#screen-profile .screen-header,' +
      '#screen-settings .screen-header,' +
      '#screen-messages .screen-header,' +
      '[id^="screen-"] .screen-header,' +
      '.chat-header{' +
      'border-bottom:none!important;' +
      'border-bottom-width:0!important;' +
      'border-top:none!important;' +
      'box-shadow:none!important;' +
      '}' +
      /* linha acima da navbar — 0.5px */
      '.navbar,' +
      'nav.navbar{' +
      'border-top-width:0.5px!important;' +
      'border-top-style:solid!important;' +
      'border-top-color:var(--line, rgba(11,11,12,.12))!important;' +
      '}' +
      /* stories — anéis / contornos 0.5px */
      '.story-card,' +
      '.story-card.unseen,' +
      '.story-card.seen,' +
      '.story-card-create{' +
      'border-width:0.5px!important;' +
      'border-style:solid!important;' +
      'border-color:rgba(11,11,12,.14)!important;' +
      'box-shadow:none!important;' +
      '}' +
      '.story-card.unseen{' +
      'box-shadow:0 0 0 0.5px var(--violet, #9B6BFF)!important;' +
      'border-color:transparent!important;' +
      '}' +
      '.story-card-avatar{' +
      'border-width:0.5px!important;' +
      '}' +
      '.story-ring,' +
      '.stories .avatar,' +
      '.story-item .avatar{' +
      'border-width:0.5px!important;' +
      '}' +
      /* separador entre posts — 0.5px */
      '.post,' +
      '#feedList .post,' +
      '#screen-feed .post{' +
      'border-bottom-width:0.5px!important;' +
      'border-bottom-style:solid!important;' +
      '}' +
      /* media do post */
      '.post-media,' +
      '#feedList .post-media,' +
      '#screen-feed .post-media,' +
      '.post .post-media{' +
      'border-width:0.5px!important;' +
      'border-style:solid!important;' +
      'border-color:var(--ink, #0B0B0C)!important;' +
      '}';
  }

  inject();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  }
})();
