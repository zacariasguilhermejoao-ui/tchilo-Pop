/**
 * Só corrige tamanho dos ícones da barra de baixo (notificações pequeno)
 */
(function () {
  'use strict';
  if (window.__tchiloNavSizeV2) return;
  window.__tchiloNavSizeV2 = true;

  function injectCSS() {
    if (document.getElementById('tchiloNavSizeCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloNavSizeCSS';
    st.textContent =
      '.navbar .nav-item{' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'min-width:48px;min-height:48px;' +
      '}' +
      '.navbar .nav-item img,' +
      '.navbar .nav-item svg{' +
      'width:28px!important;height:28px!important;' +
      'min-width:28px!important;min-height:28px!important;' +
      'max-width:28px!important;max-height:28px!important;' +
      'object-fit:contain!important;display:block!important;' +
      'flex-shrink:0!important;' +
      '}' +
      '.navbar .nav-item .nav-reels-icon,' +
      '.navbar .nav-item img.nav-reels-icon{' +
      'width:30px!important;height:30px!important;' +
      'min-width:30px!important;min-height:30px!important;' +
      '}' +
      '.navbar .nav-item.nav-create,' +
      '.navbar .nav-item[data-screen="create"],' +
      '.navbar .nav-item .create-btn,' +
      '.navbar .nav-plus{' +
      'width:auto!important;height:auto!important;' +
      '}';
    (document.head || document.documentElement).appendChild(st);
  }

  injectCSS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  }
  setTimeout(injectCSS, 400);
})();
