/**
 * Tchilo — perfil scrollável para ver posts
 */
(function () {
  'use strict';
  if (window.__tchiloProfileScrollV1) return;
  window.__tchiloProfileScrollV1 = true;

  var CSS =
    'html body #screen-profile.active,' +
    'html body #screen-profile{' +
    'display:flex!important;flex-direction:column!important;' +
    'height:100%!important;max-height:100dvh!important;overflow:hidden!important;}' +
    'html body #screen-profile .screen-header{' +
    'flex-shrink:0!important;}' +
    'html body #screen-profile .profile-body,' +
    'html body #screen-profile #profileBody{' +
    'flex:1 1 auto!important;' +
    'min-height:0!important;' +
    'overflow-y:auto!important;' +
    'overflow-x:hidden!important;' +
    '-webkit-overflow-scrolling:touch!important;' +
    'overscroll-behavior:contain!important;' +
    'padding-bottom:calc(120px + env(safe-area-inset-bottom,0px))!important;}' +
    'html body #screen-profile .profile-posts,' +
    'html body #screen-profile .posts-grid,' +
    'html body #screen-profile .profile-grid,' +
    'html body #profileBody .grid{' +
    'display:grid!important;}' +
    'html body #screen-profile .profile-body *{' +
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

  function unlock() {
    inject();
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
  unlock();
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(unlock, ms);
  });

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
