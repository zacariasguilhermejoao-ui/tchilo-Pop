/**
 * Tchilo — bordas/círculos grossos → 1px em todo o app
 * (não mexe nas cores de Entrar / Criar conta)
 */
(function () {
  'use strict';
  if (window.__tchiloBordersThinV1) return;
  window.__tchiloBordersThinV1 = true;

  var CSS =
    /* inputs e pesquisa */
    'input, textarea, select,' +
    '.search-input, .explore-search, [class*="search"] input,' +
    '#screen-search input, #screen-explore input,' +
    '.login-input:not(.field-invalid),' +
    '.edit-form input, .edit-form textarea, .edit-form select,' +
    '.chat-input-bar input, #chatInput{' +
    'border-width:1px!important;}' +
    /* chips / tabs (Para ti, Em alta, Pesquisa, etc.) */
    '.chip, .tab, .tabs button, .explore-tabs button,' +
    '[class*="chip"], [class*="tab-btn"], .seg-btn,' +
    'button.chip, .filter-chip, .pill{' +
    'border-width:1px!important;}' +
    /* botões com contorno (não os de fundo sólido do login) */
    '.btn-outline, .follow-btn, .post-follow,' +
    'button.post-follow, .secondary-btn, .outline-btn{' +
    'border-width:1px!important;}' +
    /* cartões e media */
    '.post-media, .card, .sheet-panel, .modal-panel,' +
    '.attach-opt, .ao-icon, .gitem, .tsu-card{' +
    'border-width:1px!important;}' +
    /* avatares / círculos decorativos */
    '.avatar, .story-ring, .theme-swatch, .radio-dot,' +
    '.check-circle, .icon-btn-outline{' +
    'border-width:1px!important;}' +
    /* headers e separadores */
    '.screen-header, .chat-header, .topbar, .navbar,' +
    '.post, .notif-item, .msg-item, .settings-row{' +
    'border-bottom-width:1px!important;' +
    'border-top-width:1px!important;}' +
    /* explorar — força específica */
    '#screen-search input, #screen-explore input,' +
    '#screen-search .search-bar input,' +
    '#screen-explore .search-bar input,' +
    '#screen-search button, #screen-explore button.chip,' +
    '#screen-search .tabs button, #screen-explore .tabs button{' +
    'border-width:1px!important;}' +
    /* generic: qualquer border 2px+ solid ink → 1px */
    '*{' +
    'border-top-width:min(1px, var(--tchilo-bw, 100px));}' +
    /* fallbacks fortes por seletor comum do index */
    '[style*="border:2.5px"], [style*="border: 2.5px"],' +
    '[style*="border:3px"], [style*="border: 3px"],' +
    '[style*="border:2px"], [style*="border: 2px"]{' +
    'border-width:1px!important;}';

  /* CSS mais seguro e completo — sem min() problemático */
  var CSS2 =
    'html body input:not([type="checkbox"]):not([type="radio"]),' +
    'html body textarea, html body select,' +
    'html body .search-bar input, html body .search-input,' +
    'html body #screen-search input, html body #screen-explore input,' +
    'html body #screen-search .search-wrap input,' +
    'html body [placeholder="Pesquisar"], html body input[placeholder*="Pesquis"]{' +
    'border-width:1px!important;}' +
    'html body button,' +
    'html body .chip, html body .tab, html body .tabs > *,' +
    'html body .explore-tabs > *, html body .seg > *,' +
    'html body .filter-row button, html body .chips button{' +
    'border-width:1px!important;}' +
    'html body .post-media, html body .post .media,' +
    'html body .card, html body .sheet-panel,' +
    'html body .tm-panel, html body .modal-body,' +
    'html body .attach-opt, html body .ao-icon{' +
    'border-width:1px!important;}' +
    'html body .avatar, html body .story-avatar,' +
    'html body .theme-dot, html body .swatch{' +
    'border-width:1px!important;}' +
    'html body .screen-header, html body .chat-header,' +
    'html body .navbar, html body .post,' +
    'html body .notif-item, html body .settings-item,' +
    'html body .list-row{' +
    'border-bottom-width:1px!important;}' +
    'html body .navbar{border-top-width:1px!important;}' +
    /* login choice — linha fina mas mantém cores */
    'html body .login-choice button{' +
    'border-width:1px!important;}' +
    'html body .login-input, html body select.login-input{' +
    'border-width:1px!important;}' +
    /* botões icon */
    'html body .icon-btn, html body .lang-btn,' +
    'html body .chat-call-btns button{' +
    'border-width:0!important;}' +
    /* post follow */
    'html body .post-follow, html body button.post-follow{' +
    'border-width:1px!important;}' +
    /* sticky / premium cards */
    'html body .premium-card, html body .verified-card,' +
    'html body .saldo-card{' +
    'border-width:1px!important;}';

  function inject() {
    var st = document.getElementById('tchiloBordersThinCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloBordersThinCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS2;
  }

  function walkInline() {
    try {
      var nodes = document.querySelectorAll('[style*="border"]');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var s = el.getAttribute('style') || '';
        if (/border[^;]*:\s*[23](\.5)?px/i.test(s)) {
          el.style.borderWidth = '1px';
        }
      }
    } catch (e) {}
  }

  inject();
  walkInline();
  [200, 1000, 3000].forEach(function (ms) {
    setTimeout(function () {
      inject();
      walkInline();
    }, ms);
  });

  try {
    new MutationObserver(function () {
      walkInline();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  } catch (e) {}
})();
