/** Anti-piscar v2 — CSS leve, sem reescrever + */
(function () {
  'use strict';
  if (window.__tchiloUiStableV2) return;
  window.__tchiloUiStableV2 = true;
  window.__tchiloUiStableV1 = true;

  if (document.getElementById('tchiloUiStableCSS')) return;
  var st = document.createElement('style');
  st.id = 'tchiloUiStableCSS';
  st.textContent =
    '#feedList .post{backface-visibility:hidden;}' +
    '#tchiloProfileAvatarPlus,.tchilo-av-add{' +
    'animation:none!important;transition:none!important;}';
  (document.head || document.documentElement).appendChild(st);
})();
