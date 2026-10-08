/**
 * nav-size-fix v4
 * O index.html define os ícones e tamanhos (feed, reels, +, notif, perfil, mensagem, lupa).
 * Este script remove folhas de estilo native que forçam width/height nos ícones.
 */
(function () {
  'use strict';
  if (window.__tchiloNavSizeV4) return;
  window.__tchiloNavSizeV4 = true;
  window.__tchiloNavSizeV3 = true;

  var KILL_IDS = [
    'tchiloReelsIconCSS',
    'tchiloFeedIconCSS',
    'tchiloNavLayoutCSS',
    'tchiloFeeSmsCSS',
    'tchiloUiIconsFixCSS'
  ];

  function stripBadStyles() {
    try {
      KILL_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
      /* limpar regras de size no stable-ui antigo se ainda existirem */
      var st = document.getElementById('tchiloStableUiCSS');
      if (st && st.textContent && /nav-feed-icon|nav-sms-icon|SMS_SIZE|topbar-icons.*width/.test(st.textContent)) {
        /* v4 do stable-ui já não tem isto; se cache antiga, neutraliza */
        st.textContent = st.textContent
          .replace(/\.nav-item \.nav-feed-icon\{[^}]+\}/g, '')
          .replace(/#screen-feed \.topbar-icons[^{]*\{[^}]+\}/g, '')
          .replace(/\.topbar-icons[^{]*nav-sms[^{]*\{[^}]+\}/g, '')
          .replace(/\.topbar-icons \.icon-btn\[onclick\*="search"\][^}]+\}/g, '');
      }
    } catch (e) {}
  }

  stripBadStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stripBadStyles);
  }
  setTimeout(stripBadStyles, 100);
  setTimeout(stripBadStyles, 600);
  setTimeout(stripBadStyles, 1500);
})();
