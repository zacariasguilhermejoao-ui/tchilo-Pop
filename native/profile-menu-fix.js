/**
 * Menu perfil ⋯ v4
 * Live vermelho só via CSS (já no final-css). Aqui só ícones do menu.
 */
(function () {
  'use strict';
  if (window.__tchiloProfileMenuFixV4) return;
  window.__tchiloProfileMenuFixV4 = true;
  window.__tchiloProfileMenuFixV3 = true;

  var GEAR_SVG =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="3"></circle>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' +
    '</svg>';

  function patchSettingsIcon() {
    try {
      var ic = document.querySelector(
        '#tchiloProfileShareSheet .opt[data-act="settings"] .ic, ' +
          '.profile-action-sheet .opt[data-act="settings"] .ic'
      );
      if (!ic || ic.getAttribute('data-gear') === '1') return;
      ic.innerHTML = GEAR_SVG;
      ic.setAttribute('data-gear', '1');
    } catch (e) {}
  }

  setTimeout(patchSettingsIcon, 200);
  if (typeof window.openProfileShareSheet === 'function' && !window.openProfileShareSheet.__gear) {
    var o = window.openProfileShareSheet;
    window.openProfileShareSheet = function () {
      var r = o.apply(this, arguments);
      setTimeout(patchSettingsIcon, 30);
      return r;
    };
    window.openProfileShareSheet.__gear = true;
  }
})();
