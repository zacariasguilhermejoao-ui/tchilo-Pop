/**
 * Unifica ícones dos menus ⋯ (posts, reels, story, share) ao estilo Opções do perfil
 * + fonte do sistema em toda a app UI
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloMenuIconsUnifyV1) return;
  window.__tchiloMenuIconsUnifyV1 = true;

  var SYS =
    'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Helvetica Neue",Arial,sans-serif';

  var st = document.createElement('style');
  st.id = 'tchilo-menu-icons-unify';
  st.textContent = [
    'html,body,button,input,textarea,select,.sheet,.share-opt,.opt,',
    '.profile-action-row,.settings-item,.navbar,.topbar{',
    '  font-family:' + SYS + '!important;',
    '}',
    /* menus 3 pontos / share sheets */
    '.share-opt,.post-menu-options .share-opt,#postMenuOptions .share-opt,',
    '#reelMenuOptions .share-opt,#storyMenuOptions .share-opt,',
    '.sheet .share-opt{',
    '  display:flex!important;align-items:center!important;gap:12px!important;',
    '  width:100%!important;padding:14px 12px!important;border:0!important;',
    '  background:transparent!important;text-align:left!important;',
    '  font:500 15px ' + SYS + '!important;color:var(--ink,#0B0B0C)!important;',
    '  border-radius:12px!important;box-shadow:none!important;',
    '}',
    '.share-opt .so-icon, .share-opt .ic{',
    '  width:28px!important;height:28px!important;display:flex!important;',
    '  align-items:center!important;justify-content:center!important;',
    '  flex-shrink:0!important;border:0!important;background:transparent!important;',
    '  box-shadow:none!important;border-radius:0!important;',
    '}',
    '.share-opt .so-icon svg, .share-opt svg{',
    '  width:22px!important;height:22px!important;',
    '  stroke:currentColor!important;fill:none!important;',
    '  color:var(--ink,#0B0B0C)!important;',
    '}',
    '.share-opt b, .share-opt span{',
    '  font:500 15px ' + SYS + '!important;font-weight:500!important;',
    '}',
    /* sheet titles */
    '.sheet-title, #tchiloProfileShareSheet .tchilo-ps-title{',
    '  font-family:' + SYS + '!important;text-align:center!important;',
    '}'
  ].join('');
  document.head.appendChild(st);
})();
