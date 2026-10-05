/**
 * Tchilo — borda do topbar fina (1px), sem mexer nas stories/posts/nav
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloTopbarBorderThin) return;
  window.__tchiloTopbarBorderThin = true;

  function inject() {
    if (document.getElementById('tchiloTopbarBorderThinCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloTopbarBorderThinCSS';
    st.textContent =
      '#screen-feed .topbar,' +
      '.screen#screen-feed .topbar,' +
      '.topbar{' +
      'border-bottom-width:1px!important;' +
      'border-bottom-style:solid!important;' +
      'border-bottom-color:var(--line)!important;' +
      '}';
    (document.head || document.documentElement).appendChild(st);
  }

  inject();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  }
})();
