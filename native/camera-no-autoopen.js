/**
 * tchilo-Pop — o botão + NÃO abre a câmara de imediato
 * Não fecha a câmara quando o utilizador toca em "Foto ou vídeo".
 */
(function () {
  'use strict';

  function boot() {
    // Só garante que o + não força a câmara; o camera-tiktok.js trata do botão.
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloNoAutoOpen) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        // Não chama closeCamera aqui — isso matava a câmara ao abrir
        if (screen === 'create' || screen === 'screen-create') {
          setTimeout(function () {
            var fx = document.getElementById('faceFxOpenBtn');
            if (fx) fx.style.display = 'none';
          }, 50);
        }
        return r;
      };
      window.goTo.__tchiloNoAutoOpen = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
})();
