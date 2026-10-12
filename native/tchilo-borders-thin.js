/**
 * Tchilo — bordas finas
 * v2 — navbar / posts / stories a 0.5px (não voltar a forçar 1px)
 */
(function () {
  'use strict';
  if (window.__tchiloBordersThinV2) return;
  window.__tchiloBordersThinV2 = true;
  window.__tchiloBordersThinV1 = true;

  var CSS2 =
    'html body input:not([type="checkbox"]):not([type="radio"]),' +
    'html body textarea, html body select,' +
    'html body .search-bar input, html body .search-input,' +
    'html body #screen-search input, html body #screen-explore input,' +
    'html body #screen-search .search-wrap input,' +
    'html body [placeholder="Pesquisar"], html body input[placeholder*="Pesquis"]{' +
    'border-width:1px!important;}' +
    'html body .chip, html body .tab, html body .tabs > *,' +
    'html body .explore-tabs > *, html body .seg > *,' +
    'html body .filter-row button, html body .chips button{' +
    'border-width:1px!important;}' +
    'html body .post-media, html body .post .media,' +
    'html body .card, html body .sheet-panel,' +
    'html body .tm-panel, html body .modal-body,' +
    'html body .attach-opt, html body .ao-icon{' +
    'border-width:0.5px!important;}' +
    'html body .avatar, html body .story-avatar,' +
    'html body .theme-dot, html body .swatch{' +
    'border-width:0.5px!important;}' +
    /* separadores: 0.5px */
    'html body .post,' +
    'html body .notif-item, html body .settings-item,' +
    'html body .list-row{' +
    'border-bottom-width:0.5px!important;}' +
    /* navbar — risco de cima 0.5px (entre feed e ícones) */
    'html body .navbar,' +
    'html body nav.navbar,' +
    'html body #appFrame .navbar,' +
    'html body .app .navbar{' +
    'border-top-width:0.5px!important;' +
    'border-top-style:solid!important;' +
    'border-top-color:var(--line, rgba(11,11,12,.14))!important;' +
    'border-bottom-width:0!important;}' +
    /* headers sem risco de cima/baixo */
    'html body .screen-header,' +
    'html body .topbar,' +
    'html body .chat-header{' +
    'border-top-width:0!important;' +
    'border-bottom-width:0!important;}' +
    'html body .login-choice button{' +
    'border-width:1px!important;}' +
    'html body .login-input, html body select.login-input{' +
    'border-width:1px!important;}' +
    'html body .icon-btn, html body .lang-btn,' +
    'html body .chat-call-btns button{' +
    'border-width:0!important;}' +
    'html body .post-follow, html body button.post-follow{' +
    'border-width:1px!important;}' +
    'html body .premium-card, html body .verified-card,' +
    'html body .saldo-card{' +
    'border-width:1px!important;}' +
    'html body .story-card,' +
    'html body .story-card.unseen,' +
    'html body .story-card-create{' +
    'border-width:0.5px!important;}';

  function inject() {
    var st = document.getElementById('tchiloBordersThinCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloBordersThinCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS2;
  }

  function forceNavbar() {
    try {
      document.querySelectorAll('.navbar, nav.navbar').forEach(function (nav) {
        nav.style.setProperty('border-top-width', '0.5px', 'important');
        nav.style.setProperty('border-top-style', 'solid', 'important');
        nav.style.setProperty('border-bottom-width', '0', 'important');
      });
    } catch (e) {}
  }

  function walkInline() {
    try {
      var nodes = document.querySelectorAll('[style*="border"]');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.classList && (el.classList.contains('navbar') || el.tagName === 'NAV')) {
          el.style.setProperty('border-top-width', '0.5px', 'important');
          continue;
        }
        var s = el.getAttribute('style') || '';
        if (/border[^;]*:\s*[23](\.5)?px/i.test(s)) {
          el.style.borderWidth = '0.5px';
        }
      }
    } catch (e) {}
  }

  inject();
  forceNavbar();
  walkInline();
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(function () {
      inject();
      forceNavbar();
      walkInline();
    }, ms);
  });

  try {
    new MutationObserver(function () {
      forceNavbar();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  } catch (e) {}
})();
