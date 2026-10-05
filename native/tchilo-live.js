/**
 * tchilo-Pop — Live loader (restaura implementação completa)
 * Carrega versão estável e desativa inject em loop.
 */
(function () {
  'use strict';
  if (window.__tchiloLiveLoaderV1) return;
  window.__tchiloLiveLoaderV1 = true;

  var SRC =
    'https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@bd7604032eaf1eb68f4697e7a4a7f5e43f3cdfa6/native/tchilo-live.js';

  var s = document.createElement('script');
  s.src = SRC;
  s.async = false;
  s.onload = function () {
    try {
      /* Após carregar, o script antigo tem setInterval(injectProfileButton, 1500).
         Não podemos limpar intervals cegamente; o live-btn-stable remove duplicados.
         Substituímos inject se existir no escopo global — não está exportado.
         Mitigação: o botão está no renderProfile (data-tchilo-live); inject no-ops. */
      window.tchiloOpenLiveSetup = window.tchiloOpenLiveSetup || window.openSetup;
    } catch (e) {}
  };
  s.onerror = function () {
    console.warn('[live] falha a carregar live.js remoto');
  };
  document.head.appendChild(s);
})();
