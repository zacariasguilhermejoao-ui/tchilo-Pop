/**
 * Tchilo — topbar SEM borda; navbar com borda fina (1px)
 * Não mexe em stories, posts, cartões
 * v2
 */
(function () {
  'use strict';
  if (window.__tchiloTopbarBorderV2) return;
  window.__tchiloTopbarBorderV2 = true;

  function inject() {
    var st = document.getElementById('tchiloTopbarBorderThinCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloTopbarBorderThinCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* remove completely the line under the top header */
      '#screen-feed .topbar,' +
      '.screen#screen-feed .topbar,' +
      '.topbar{' +
      'border-bottom:none!important;' +
      'border-bottom-width:0!important;' +
      '}' +
      /* thin line above bottom nav (Feed, Reels, +, heart, profile) */
      '.navbar{' +
      'border-top-width:1px!important;' +
      'border-top-style:solid!important;' +
      'border-top-color:var(--line)!important;' +
      '}';
  }

  inject();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  }
})();
