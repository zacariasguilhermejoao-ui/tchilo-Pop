/**
 * Tchilo — esconde barra inferior
 * v4: NUNCA esconde nav quando ha sessao no feed/messages/etc.
 * Corrige: body.tchilo-logged-out a bloquear cliques com sessao activa
 */
(function () {
  'use strict';
  if (window.__tchiloHideNavV4) return;
  window.__tchiloHideNavV4 = true;
  window.__tchiloHideNavV3 = true;

  var HIDE_EXACT = {
    settings: 1,
    editprofile: 1,
    'edit-profile': 1,
    terms: 1,
    privacy: 1,
    community: 1,
    child: 1,
    about: 1,
    cookies: 1,
    saved: 1,
    blocked: 1,
    support: 1,
    access: 1,
    login: 1,
    signup: 1,
    register: 1,
    welcome: 1,
    onboarding: 1,
    legal: 1,
    reembolso: 1,
    faq: 1,
    contacto: 1,
    contact: 1,
    ads: 1,
    'ads-manager': 1,
    admanager: 1,
    premium: 1,
    verified: 1
  };

  function injectCSS() {
    var st = document.getElementById('tchiloHideNavCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloHideNavCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      'body.tchilo-no-bottom-nav .navbar,' +
      'body.tchilo-no-bottom-nav nav.navbar,' +
      'html body.tchilo-no-bottom-nav .navbar{' +
      'display:none!important;' +
      'visibility:hidden!important;' +
      'opacity:0!important;' +
      'pointer-events:none!important;' +
      'height:0!important;' +
      'min-height:0!important;' +
      'max-height:0!important;' +
      'overflow:hidden!important;' +
      'transform:translateY(120%)!important;}' +
      'body.tchilo-no-bottom-nav .screen.active{padding-bottom:0!important;}' +
      'body.tchilo-no-bottom-nav #appFrame{padding-bottom:0!important;}' +
      /* logged-out so aplica se NAO houver tchilo-session-on */
      'body.tchilo-logged-out:not(.tchilo-session-on) .navbar,' +
      'body.tchilo-logged-out:not(.tchilo-session-on) nav.navbar{' +
      'display:none!important;pointer-events:none!important;}' ;
  }

  function normalize(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/^screen-/, '')
      .trim();
  }

  function hasSession() {
    try {
      if (typeof getSession === 'function') {
        var s = getSession();
        if (s && (s.username || s.id || s.email)) return true;
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem('tchilo_session');
      if (!raw) return false;
      var o = JSON.parse(raw);
      return !!(o && (o.id || o.username || o.email));
    } catch (e2) {
      return false;
    }
  }

  function shouldHideNav(name) {
    name = normalize(name);
    if (!name) return false;
    if (HIDE_EXACT[name]) return true;
    if (name.indexOf('settings') === 0) return true;
    if (name.indexOf('legal') === 0) return true;
    return false;
  }

  function getActiveName() {
    try {
      var active = document.querySelector('.screen.active');
      if (active && active.id) return normalize(active.id);
    } catch (e) {}
    return '';
  }

  function sync() {
    injectCSS();
    var session = hasSession();

    if (session) {
      document.body.classList.add('tchilo-session-on');
      document.body.classList.remove('tchilo-logged-out');
    } else {
      document.body.classList.remove('tchilo-session-on');
      document.body.classList.add('tchilo-logged-out');
    }

    /* Com sessao: so esconder em ecras internos (settings etc.) */
    var name = getActiveName();
    if (session && shouldHideNav(name)) {
      document.body.classList.add('tchilo-no-bottom-nav');
    } else if (session) {
      document.body.classList.remove('tchilo-no-bottom-nav');
      try {
        var nav = document.querySelector('.navbar');
        if (nav) {
          nav.style.removeProperty('display');
          nav.style.removeProperty('pointer-events');
          nav.style.removeProperty('opacity');
          nav.style.removeProperty('visibility');
          nav.style.removeProperty('transform');
        }
      } catch (e) {}
    } else {
      document.body.classList.add('tchilo-no-bottom-nav');
    }

    try {
      if (typeof window.tchiloUiUnlock === 'function' && session) {
        window.tchiloUiUnlock();
      }
    } catch (e2) {}
  }

  function patchGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__hideNavV4) return;
    var orig = window.goTo;
    window.goTo = function (name) {
      var r = orig.apply(this, arguments);
      setTimeout(sync, 0);
      setTimeout(sync, 50);
      return r;
    };
    window.goTo.__hideNavV4 = true;
  }

  function boot() {
    injectCSS();
    patchGoTo();
    sync();
    setTimeout(sync, 200);
    setTimeout(sync, 800);
    setTimeout(sync, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
