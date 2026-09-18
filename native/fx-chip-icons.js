/** tchilo-Pop — chip icons: só deixa PNG chips (já têm img) */
(function () {
  'use strict';
  function injectCSS() {
    if (document.getElementById('tchiloFxChipIconCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFxChipIconCSS';
    st.textContent =
      '#tchiloFxFilters .fx-chip{font-size:12px!important;line-height:1.2!important;color:#fff!important;' +
      'width:auto!important;height:auto!important;min-width:0!important;border-radius:999px!important;padding:7px 12px!important;}';
    document.head.appendChild(st);
  }
  function boot() {
    injectCSS();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
