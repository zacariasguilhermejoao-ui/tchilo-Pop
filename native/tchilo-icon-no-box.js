/**
 * Remove bordas/caixas à volta dos ícones do topo (LIVE, amizade, lupa, mensagem).
 * Só ícones, sem caixas.
 */
(function () {
  'use strict';
  if (window.__tchiloIconNoBox) return;
  window.__tchiloIconNoBox = true;

  if (document.getElementById('tchilo-icon-no-box')) return;
  var s = document.createElement('style');
  s.id = 'tchilo-icon-no-box';
  s.textContent = [
    '.topbar .icon-btn,',
    '.topbar button.icon-btn,',
    '.topbar .icon-btn[data-index-live],',
    '.topbar > button,',
    '.topbar > .icon-btn {',
    '  border: none !important;',
    '  border-width: 0 !important;',
    '  border-radius: 0 !important;',
    '  background: transparent !important;',
    '  box-shadow: none !important;',
    '  outline: none !important;',
    '}',
    '.topbar .icon-btn svg,',
    '.topbar button.icon-btn svg {',
    '  display: block;',
    '}',
  ].join('\n');
  (document.head || document.documentElement).appendChild(s);
})();
