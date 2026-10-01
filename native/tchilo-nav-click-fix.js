/**
 * Tchilo — barra de baixo clicavel (Feed, Reels, +, Notificacoes, Perfil)
 * Corrige: toque nao responde + menu "Pressione para colar"
 */
(function () {
  'use strict';
  if (window.__tchiloNavClickFixV1) return;
  window.__tchiloNavClickFixV1 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloNavClickCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloNavClickCSS';
      document.head.appendChild(st);
    }
    st.textContent = [
      /* Navbar sempre por cima e clicavel (exceto ecras legais) */
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar{',
      '  display:flex!important;',
      '  visibility:visible!important;',
      '  opacity:1!important;',
      '  pointer-events:auto!important;',
      '  z-index:9999!important;',
      '  position:fixed!important;',
      '  bottom:0!important;',
      '  left:0!important;right:0!important;',
      '  transform:none!important;',
      '  height:auto!important;max-height:none!important;',
      '  overflow:visible!important;',
      '  -webkit-user-select:none!important;user-select:none!important;',
      '  -webkit-touch-callout:none!important;',
      '  touch-action:manipulation!important;',
      '}',
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item,',
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item *{',
      '  pointer-events:auto!important;',
      '  -webkit-user-select:none!important;user-select:none!important;',
      '  -webkit-touch-callout:none!important;',
      '  -webkit-user-drag:none!important;',
      '  touch-action:manipulation!important;',
      '  cursor:pointer!important;',
      '}',
      /* Filhos do nav-item nao devem capturar o toque sozinhos de forma estranha */
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item svg,',
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item img,',
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item span,',
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item .dot,',
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item .badge{',
      '  pointer-events:none!important;',
      '}',
      /* O proprio botao recebe o toque */
      'body:not(.legal-screen-open):not(.legal-from-login) .navbar .nav-item{',
      '  pointer-events:auto!important;',
      '  position:relative!important;',
      '  z-index:1!important;',
      '}',
      /* Nada por cima da navbar a bloquear (overlays genericos no fundo) */
      'body:not(.legal-screen-open) .navbar ~ .overlay-block-nav,',
      '#navClickBlocker{display:none!important;pointer-events:none!important;}'
    ].join('');
  }

  function isLegalActive() {
    if (document.body.classList.contains('legal-from-login')) return true;
    var active = document.querySelector('.screen.active');
    if (!active || !active.id) return false;
    var name = active.id.replace(/^screen-/, '');
    return /^(terms|privacy|child|community|about)$/.test(name);
  }

  function clearStuckLegalClass() {
    if (!isLegalActive()) {
      document.body.classList.remove('legal-screen-open');
      // Nao remover legal-from-login aqui se loginGate estiver aberto — legal-navbar trata disso
      var gate = document.getElementById('loginGate');
      var gateOpen = gate && !gate.classList.contains('hidden');
      if (!gateOpen) {
        document.body.classList.remove('legal-from-login');
      }
    }
  }

  function screenFromItem(item) {
    var ds = item.getAttribute('data-screen');
    if (ds) return ds;
    var oc = item.getAttribute('onclick') || '';
    var m = oc.match(/goTo\(['"]([^'"]+)['"]\)/);
    if (m) return m[1];
    m = oc.match(/onNavFeed/);
    if (m) return 'feed';
    var aria = (item.getAttribute('aria-label') || '').toLowerCase();
    if (aria.indexOf('feed') >= 0 || aria.indexOf('fee') >= 0) return 'feed';
    if (aria.indexOf('reel') >= 0) return 'reels';
    if (aria.indexOf('post') >= 0 || aria === '+' || aria.indexOf('criar') >= 0) return 'post';
    if (aria.indexOf('notif') >= 0 || aria.indexOf('like') >= 0 || aria.indexOf('cora') >= 0) return 'notifications';
    if (aria.indexOf('perfil') >= 0 || aria.indexOf('profile') >= 0) return 'profile';
    return '';
  }

  function navigate(screen, item) {
    try {
      if (screen === 'reels') {
        if (typeof openReels === 'function') return openReels();
        if (typeof window.openReels === 'function') return window.openReels();
      }
      if (screen === 'feed' && typeof window.onNavFeed === 'function') {
        return window.onNavFeed();
      }
      if (screen === 'post' || screen === 'create') {
        if (typeof window.openCreate === 'function') return window.openCreate();
        if (typeof window.openComposer === 'function') return window.openComposer();
        if (typeof window.onNavPost === 'function') return window.onNavPost();
      }
      if (typeof goTo === 'function' && screen) return goTo(screen);
      // Fallback: disparar click nativo se tiver onclick original guardado
      if (item && item.__tchiloOrigOnclick) {
        return item.__tchiloOrigOnclick.call(item);
      }
    } catch (e) {
      console.warn('Tchilo nav click', e);
    }
  }

  function bindItem(item) {
    if (!item || item.__tchiloNavBound) return;
    item.__tchiloNavBound = true;

    // Guardar onclick inline se existir
    if (item.onclick && !item.__tchiloOrigOnclick) {
      item.__tchiloOrigOnclick = item.onclick;
    }

    // Impedir selecao de texto / menu colar
    item.setAttribute('draggable', 'false');
    item.style.setProperty('-webkit-user-select', 'none', 'important');
    item.style.setProperty('user-select', 'none', 'important');
    item.style.setProperty('-webkit-touch-callout', 'none', 'important');
    item.style.setProperty('touch-action', 'manipulation', 'important');
    item.style.setProperty('pointer-events', 'auto', 'important');

    var lastTap = 0;
    function onActivate(e) {
      // Evitar double-fire touch+click
      var now = Date.now();
      if (now - lastTap < 350) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      lastTap = now;

      e.preventDefault();
      e.stopPropagation();

      clearStuckLegalClass();

      var screen = screenFromItem(item);
      navigate(screen, item);
    }

    item.addEventListener('click', onActivate, true);
    item.addEventListener(
      'touchend',
      function (e) {
        // So se o toque terminou no proprio item (nao scroll)
        if (e.cancelable) e.preventDefault();
        onActivate(e);
      },
      { passive: false, capture: true }
    );
  }

  function fixNavbar() {
    clearStuckLegalClass();
    if (isLegalActive()) return;

    var nav = document.querySelector('.navbar');
    if (!nav) return;

    nav.style.setProperty('pointer-events', 'auto', 'important');
    nav.style.setProperty('z-index', '9999', 'important');
    nav.style.setProperty('display', 'flex', 'important');
    nav.style.setProperty('visibility', 'visible', 'important');
    nav.style.setProperty('opacity', '1', 'important');
    nav.style.setProperty('transform', 'none', 'important');
    nav.style.removeProperty('height');
    nav.style.removeProperty('max-height');
    nav.removeAttribute('data-legal-hidden');

    var items = nav.querySelectorAll('.nav-item');
    items.forEach(bindItem);
  }

  function boot() {
    injectCSS();
    fixNavbar();
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);

  // Se o DOM da navbar for recriado, voltar a ligar (sem intervalo continuo pesado)
  try {
    var root = document.getElementById('appFrame') || document.body;
    var t = null;
    new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        fixNavbar();
      }, 300);
    }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  } catch (e) {}
})();
