/**
 * Tchilo — perfil scrollável para ver posts
 * v3: nunca deixa o perfil visível fora de .active
 * - CSS só com .active
 * - CSS de força: :not(.active) { display:none !important }
 * - limpa estilos inline ao sair do perfil (senão display:flex fica colado e divide o feed/notifs)
 */
(function () {
  'use strict';
  if (window.__tchiloProfileScrollV3) return;
  window.__tchiloProfileScrollV3 = true;
  window.__tchiloProfileScrollV2 = true;
  window.__tchiloProfileScrollV1 = true;

  var CSS =
    /* Forçar esconder quando NÃO está ativo — vence estilos inline residuais */
    'html body #screen-profile:not(.active){' +
    'display:none!important;' +
    'visibility:hidden!important;' +
    'pointer-events:none!important;' +
    'height:0!important;' +
    'max-height:0!important;' +
    'overflow:hidden!important;' +
    'flex:0 0 0!important;' +
    'min-height:0!important;}' +
    /* Layout só quando ativo */
    'html body #screen-profile.active{' +
    'display:flex!important;flex-direction:column!important;' +
    'visibility:visible!important;' +
    'pointer-events:auto!important;' +
    'height:100%!important;max-height:100dvh!important;' +
    'overflow:hidden!important;' +
    'flex:1 1 auto!important;}' +
    'html body #screen-profile.active .screen-header{' +
    'flex-shrink:0!important;}' +
    'html body #screen-profile.active .profile-body,' +
    'html body #screen-profile.active #profileBody{' +
    'flex:1 1 auto!important;' +
    'min-height:0!important;' +
    'overflow-y:auto!important;' +
    'overflow-x:hidden!important;' +
    '-webkit-overflow-scrolling:touch!important;' +
    'overscroll-behavior:contain!important;' +
    'padding-bottom:calc(120px + env(safe-area-inset-bottom,0px))!important;}' +
    'html body #screen-profile.active .profile-posts,' +
    'html body #screen-profile.active .posts-grid,' +
    'html body #screen-profile.active .profile-grid,' +
    'html body #screen-profile.active #profileBody .grid{' +
    'display:grid!important;}' +
    'html body #screen-profile.active .profile-body *{' +
    'max-width:100%;}';

  function inject() {
    var st = document.getElementById('tchiloProfileScrollCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloProfileScrollCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS;
  }

  function isProfileActive() {
    var screen = document.getElementById('screen-profile');
    return !!(screen && screen.classList.contains('active'));
  }

  /** Limpa estilos inline que prendiam o perfil visível no feed/notifs */
  function hideProfile() {
    var screen = document.getElementById('screen-profile');
    if (!screen) return;
    try {
      screen.style.removeProperty('display');
      screen.style.removeProperty('overflow');
      screen.style.removeProperty('flex-direction');
      screen.style.removeProperty('height');
      screen.style.removeProperty('max-height');
      screen.style.removeProperty('visibility');
      screen.style.removeProperty('pointer-events');
      screen.style.removeProperty('flex');
      screen.style.removeProperty('min-height');
    } catch (e) {
      screen.style.display = '';
      screen.style.overflow = '';
      screen.style.height = '';
    }
  }

  function unlock() {
    inject();
    if (!isProfileActive()) {
      hideProfile();
      return;
    }

    var body = document.getElementById('profileBody') || document.querySelector('#screen-profile .profile-body');
    if (body) {
      body.style.overflowY = 'auto';
      body.style.webkitOverflowScrolling = 'touch';
      body.style.minHeight = '0';
      body.style.flex = '1 1 auto';
      body.style.paddingBottom = '120px';
    }
    var screen = document.getElementById('screen-profile');
    if (screen) {
      screen.style.overflow = 'hidden';
      screen.style.display = 'flex';
      screen.style.flexDirection = 'column';
      screen.style.height = '100%';
      screen.style.visibility = 'visible';
      screen.style.pointerEvents = 'auto';
    }
  }

  inject();
  /* Ao carregar: se não está no perfil, garantir que está escondido */
  if (isProfileActive()) {
    unlock();
    [200, 800, 2000].forEach(function (ms) {
      setTimeout(unlock, ms);
    });
  } else {
    hideProfile();
    [100, 500, 1500].forEach(function (ms) {
      setTimeout(function () {
        if (!isProfileActive()) hideProfile();
      }, ms);
    });
  }

  try {
    if (typeof window.goTo === 'function' && !window.goTo.__profileScrollV3) {
      var g = window.goTo;
      window.goTo = function (s) {
        var r = g.apply(this, arguments);
        if (s === 'profile') {
          setTimeout(unlock, 30);
          setTimeout(unlock, 120);
        } else {
          /* Ao sair do perfil (feed, notifs, etc.) limpar display inline */
          setTimeout(hideProfile, 0);
          setTimeout(hideProfile, 50);
        }
        return r;
      };
      window.goTo.__profileScrollV3 = true;
      window.goTo.__profileScroll = true;
    }
  } catch (e) {}

  try {
    new MutationObserver(function () {
      var sp = document.getElementById('screen-profile');
      if (!sp) return;
      if (sp.classList.contains('active')) unlock();
      else hideProfile();
    }).observe(document.body || document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });
  } catch (e2) {}
})();
