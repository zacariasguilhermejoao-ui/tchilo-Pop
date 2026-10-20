/**
 * Tchilo — traços finos (1px) + ícones pretos
 * Topbar: sem caixas à volta dos ícones.
 */
(function () {
  if (document.getElementById('tchilo-thin-borders')) return;
  var s = document.createElement('style');
  s.id = 'tchilo-thin-borders';
  s.textContent = [
    '/* topbar ícones: SEM caixa */',
    '.topbar .icon-btn, .topbar button.icon-btn {',
    '  border: none !important;',
    '  border-width: 0 !important;',
    '  border-radius: 0 !important;',
    '  background: transparent !important;',
    '  box-shadow: none !important;',
    '}',
    '/* restantes ícones (não topbar) */',
    '.icon-btn:not(.topbar .icon-btn), button.icon-btn:not(.topbar button) {',
    '  border-width: 1px !important;',
    '  border-style: solid !important;',
    '  border-color: var(--ink, #0B0B0C) !important;',
    '}',
    '.saved-remove, button.saved-remove {',
    '  border: 1px solid var(--ink, #0B0B0C) !important;',
    '  color: var(--ink, #0B0B0C) !important;',
    '  background: var(--paper, #fff) !important;',
    '  box-shadow: none !important;',
    '}',
    '.saved-tab { border-width: 0 !important; }',
    '.saved-tabs { border-bottom-width: 1px !important; }',
    '.follow-btn, button.follow-btn { border-width: 1px !important; }',
    '.msg-item, .saved-card {',
    '  border-bottom-width: 1px !important;',
    '  border-bottom-style: solid !important;',
    '  border-bottom-color: #e8e8e8 !important;',
    '}',
    'input, select, textarea, .login-input, .search-input, .compose-input {',
    '  border-width: 1px !important;',
    '}',
    '.card, .sheet, .modal, .playlist-card, .notif-item {',
    '  border-width: 1px !important;',
    '}',
    '.topbar, .bottom-nav, .tabbar {',
    '  border-top-width: 1px !important;',
    '  border-bottom-width: 1px !important;',
    '}',
    '/* o ícone de mensagens do topo (data-top-messages) fica de fora: tem máscara (os 3 pontos)',
    '   e estas regras pintavam a máscara de preto, deixando o balão quase transparente/cinzento */',
    '.icon-btn:not([data-top-messages]) svg, .icon-btn:not([data-top-messages]) svg * {',
    '  stroke: var(--ink, #0B0B0C) !important;',
    '  fill: none !important;',
    '}',
    '.icon-btn:not([data-top-messages]) svg [fill]:not([fill="none"]) {',
    '  fill: var(--ink, #0B0B0C) !important;',
    '}',
    '.bottom-nav svg, .bottom-nav svg *, .tabbar svg, .tabbar svg * {',
    '  stroke: var(--ink, #0B0B0C) !important;',
    '  color: var(--ink, #0B0B0C) !important;',
    '}',
  ].join('\n');
  (document.head || document.documentElement).appendChild(s);
})();
