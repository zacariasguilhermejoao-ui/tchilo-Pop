/**
 * Tchilo — perfil scrollável para ver posts
 * Só aplica layout quando #screen-profile tem .active
 * (nunca força o perfil a aparecer em cima/junto do feed)
 */
(function () {
  'use strict';
  if (window.__tchiloProfileScrollV2) return;
  window.__tchiloProfileScrollV2 = true;

  var CSS =
    'html body #screen-profile.active{' +
    'display:flex!important;flex-direction:column!important;' +
    'height:100%!important;max-height:100dvh!important;overflow:hidden!important;}' +
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

  function unlock() {
    inject();
    /* Nunca forçar display no ecrã de perfil se não estiver ativo —
       isso fazia o perfil aparecer junto com o feed e dividir o ecrã. */
    if (!isProfileActive()) return;

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
    }
  }

  inject();
  /* Só desbloqueia se o perfil já estiver ativo (ex.: refresh na página de perfil) */
  if (isProfileActive()) {
    unlock();
    [200, 800, 2000].forEach(function (ms) {
      setTimeout(unlock, ms);
    });
  }

  try {
    if (typeof window.goTo === 'function' && !window.goTo.__profileScroll) {
      var g = window.goTo;
      window.goTo = function (s) {
        var r = g.apply(this, arguments);
        if (s === 'profile') setTimeout(unlock, 50);
        return r;
      };
      window.goTo.__profileScroll = true;
    }
  } catch (e) {}

  try {
    new MutationObserver(function () {
      var sp = document.getElementById('screen-profile');
      if (sp && sp.classList.contains('active')) unlock();
    }).observe(document.body || document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });
  } catch (e2) {}
})();
