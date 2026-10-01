/**
 * Tchilo — esconde barra inferior
 * v3: definições, ecrãs internos, e quando NÃO há sessão (login/logout)
 */
(function () {
  'use strict';
  if (window.__tchiloHideNavV3) return;
  window.__tchiloHideNavV3 = true;
  window.__tchiloHideNavV2 = true;

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
      'html body.tchilo-no-bottom-nav .navbar,' +
      'body.tchilo-logged-out .navbar,' +
      'body.tchilo-logged-out nav.navbar{' +
      'display:none!important;' +
      'visibility:hidden!important;' +
      'opacity:0!important;' +
      'pointer-events:none!important;' +
      'height:0!important;' +
      'min-height:0!important;' +
      'max-height:0!important;' +
      'overflow:hidden!important;' +
      'transform:translateY(120%)!important;}' +
      'body.tchilo-no-bottom-nav .screen.active,' +
      'body.tchilo-logged-out .screen.active{' +
      'padding-bottom:0!important;}' +
      'body.tchilo-no-bottom-nav #appFrame,' +
      'body.tchilo-logged-out #appFrame{' +
      'padding-bottom:0!important;}';
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
      if (raw && raw !== 'null' && raw !== '{}') {
        var o = JSON.parse(raw);
        if (o && (o.username || o.id || o.email)) return true;
      }
    } catch (e2) {}
    return false;
  }

  function shouldHide(name) {
    if (!hasSession()) return true; /* logout / ecrã de entrar */
    var n = normalize(name);
    if (!n) return false;
    if (HIDE_EXACT[n]) return true;
    if (n.indexOf('settings') === 0) return true;
    if (n.indexOf('edit') >= 0 && n.indexOf('profile') >= 0) return true;
    if (n.indexOf('access') >= 0) return true;
    if (n.indexOf('login') >= 0 || n.indexOf('signup') >= 0) return true;
    if (n.indexOf('legal') >= 0 || n.indexOf('term') >= 0) return true;
    if (n.indexOf('privacy') >= 0 || n.indexOf('cookie') >= 0) return true;
    if (n.indexOf('ad') === 0 || n.indexOf('ads') >= 0) return true;
    return false;
  }

  function currentScreenName() {
    try {
      var active = document.querySelector('.screen.active');
      if (active && active.id) return active.id.replace(/^screen-/, '');
    } catch (e) {}
    return '';
  }

  function apply(name) {
    injectCSS();
    var hide = shouldHide(name || currentScreenName());
    var loggedOut = !hasSession();
    try {
      document.body.classList.toggle('tchilo-no-bottom-nav', !!hide);
      document.body.classList.toggle('tchilo-logged-out', !!loggedOut);
      document.documentElement.classList.toggle('tchilo-no-bottom-nav', !!hide);
      document.documentElement.classList.toggle('tchilo-logged-out', !!loggedOut);
    } catch (e) {}

    try {
      document.querySelectorAll('.navbar, nav.navbar, .bottom-nav').forEach(function (nav) {
        if (hide || loggedOut) {
          nav.style.setProperty('display', 'none', 'important');
          nav.style.setProperty('visibility', 'hidden', 'important');
          nav.setAttribute('aria-hidden', 'true');
          nav.setAttribute('data-tchilo-hidden', '1');
        } else if (nav.getAttribute('data-tchilo-hidden') === '1') {
          nav.style.removeProperty('display');
          nav.style.removeProperty('visibility');
          nav.removeAttribute('data-tchilo-hidden');
          nav.setAttribute('aria-hidden', 'false');
        }
      });
    } catch (e2) {}
  }

  function patchGoTo() {
    if (typeof window.goTo !== 'function') return false;
    if (window.goTo.__hideNavV3) return true;
    var orig = window.goTo;
    window.goTo = function (name) {
      var r = orig.apply(this, arguments);
      try {
        apply(name);
      } catch (e) {}
      setTimeout(function () {
        apply(name);
      }, 40);
      return r;
    };
    window.goTo.__hideNavV3 = true;
    window.goTo.__hideNavV2 = true;
    return true;
  }

  function patchLogout() {
    ['logout', 'signOut', 'tchiloLogout', 'doLogout', 'endSession'].forEach(function (fn) {
      if (typeof window[fn] !== 'function' || window[fn].__hideNavV3) return;
      var o = window[fn];
      window[fn] = function () {
        var r = o.apply(this, arguments);
        try {
          document.body.classList.add('tchilo-logged-out', 'tchilo-no-bottom-nav');
        } catch (e) {}
        setTimeout(function () {
          apply('access');
        }, 50);
        setTimeout(function () {
          apply('access');
        }, 400);
        return r;
      };
      window[fn].__hideNavV3 = true;
    });
  }

  function boot() {
    injectCSS();
    patchGoTo();
    patchLogout();
    apply(currentScreenName());
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);

  try {
    var root = document.getElementById('app') || document.body;
    if (root && !root.__hideNavObsV3) {
      root.__hideNavObsV3 = true;
      new MutationObserver(function () {
        apply(currentScreenName());
      }).observe(root, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'style']
      });
    }
  } catch (e) {}

  setInterval(function () {
    apply(currentScreenName());
  }, 1500);
})();
