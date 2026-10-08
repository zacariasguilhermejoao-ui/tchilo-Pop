/**
 * tchilo-Pop — tamanhos iguais na barra de baixo + LIVE topbar
 * Corrige ícone de notificações/pessoas pequeno e "Fee" texto
 */
(function () {
  'use strict';
  if (window.__tchiloNavSizeV1) return;
  window.__tchiloNavSizeV1 = true;

  function injectCSS() {
    if (document.getElementById('tchiloNavSizeCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloNavSizeCSS';
    st.textContent =
      /* todos os ícones da navbar com o mesmo tamanho */
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
      /* botão + central mantém o tamanho dele */
      '.navbar .nav-item.nav-create,' +
      '.navbar .nav-item[data-screen="create"],' +
      '.navbar .nav-item .create-btn,' +
      '.navbar .nav-plus{' +
      'width:auto!important;height:auto!important;' +
      '}' +
      /* esconder texto Fee residual */
      '.navbar .nav-item .nav-fee,' +
      '.navbar .nav-item .nav-text-icon.nav-fee{' +
      'display:none!important;' +
      '}' +
      /* LIVE topbar */
      '.topbar .logo-img, .topbar img.logo-img{' +
      'height:32px!important;width:auto!important;max-height:32px!important;' +
      'object-fit:contain!important;' +
      '}' +
      /* topbar SMS/search sem caixa preta */
      '.topbar-icons .icon-btn{' +
      'background:transparent!important;border:0!important;box-shadow:none!important;' +
      'width:auto!important;height:auto!important;padding:6px!important;' +
      '}' +
      '.topbar-icons .icon-btn img,' +
      '.topbar-icons .icon-btn svg{' +
      'width:26px!important;height:26px!important;object-fit:contain!important;' +
      '}';
    (document.head || document.documentElement).appendChild(st);
  }

  function fixFeedLabel() {
    try {
      var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
      if (!btn) return;
      btn.querySelectorAll('.nav-fee, .nav-text-icon').forEach(function (n) {
        try { n.remove(); } catch (e) {}
      });
      if (!btn.querySelector('img.nav-feed-icon, img[src*="feed"]')) {
        var img = document.createElement('img');
        img.className = 'nav-feed-icon';
        img.src = 'native/icons/feed.svg?v=5';
        img.alt = 'Feed';
        img.width = 28;
        img.height = 28;
        img.style.cssText = 'width:28px;height:28px;object-fit:contain;display:block;';
        var dot = btn.querySelector('.dot');
        if (dot) btn.insertBefore(img, dot);
        else btn.insertBefore(img, btn.firstChild);
      }
      btn.setAttribute('aria-label', 'Feed');
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    fixFeedLabel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1200);
})();
