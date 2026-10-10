/**
 * Tchilo — topbar sem borda; navbar e posts com linha fina (1px)
 * v3 — quadrado do post-media fino
 */
(function () {
  'use strict';
  if (window.__tchiloTopbarBorderV3) return;
  window.__tchiloTopbarBorderV3 = true;
  window.__tchiloTopbarBorderV2 = true;

  function inject() {
    var st = document.getElementById('tchiloTopbarBorderThinCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloTopbarBorderThinCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* remove line under top header */
      '#screen-feed .topbar,' +
      '.screen#screen-feed .topbar,' +
      '.topbar{' +
      'border-bottom:none!important;' +
      'border-bottom-width:0!important;' +
      '}' +
      /* thin line above bottom nav */
      '.navbar{' +
      'border-top-width:1px!important;' +
      'border-top-style:solid!important;' +
      'border-top-color:var(--line)!important;' +
      '}' +
      /* separador entre posts — fino */
      '.post,' +
      '#feedList .post,' +
      '#screen-feed .post{' +
      'border-bottom-width:1px!important;' +
      'border-bottom-style:solid!important;' +
      '}' +
      /* quadrado à volta da foto/vídeo do post — fino */
      '.post-media,' +
      '#feedList .post-media,' +
      '#screen-feed .post-media,' +
      '.post .post-media{' +
      'border-width:1px!important;' +
      'border-style:solid!important;' +
      'border-color:var(--ink, #0B0B0C)!important;' +
      '}';
  }

  inject();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  }
})();
