/**
 * Tchilo — esconde a barra inferior em Definições e ecrãs internos
 */
(function () {
  'use strict';
  if (window.__tchiloHideNavV2) return;
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
    support: 1
  };

  function injectCSS() {
    if (document.getElementById('tchiloHideNavCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloHideNavCSS';
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
      'overflow:hidden!important;' +
      'transform:translateY(120%)!important;}' +
      'body.tchilo-no-bottom-nav #appFrame.chrome-hidden .navbar{' +
      'display:none!important;}' +
      'body.tchilo-no-bottom-nav .screen.active{' +
      'padding-bottom:0!important;' +
      'margin-bottom:0!important;}' +
      'body.tchilo-no-bottom-nav #appFrame{' +
      'padding-bottom:0!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function normalize(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/^screen-/, '')
      .trim();
  }

  function shouldHide(name) {
    var n = normalize(name);
    if (!n) return false;
    if (HIDE_EXACT[n]) return true;
    if (n.indexOf('settings') === 0) return true; /* settings-account, settings-theme… */
    if (n.indexOf('edit') === 0 && n.indexOf('profile') >= 0) return true;
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
    try {
      document.body.classList.toggle('tchilo-no-bottom-nav', !!hide);
      document.documentElement.classList.toggle('tchilo-no-bottom-nav', !!hide);
    } catch (e) {}

    try {
      document.querySelectorAll('.navbar, nav.navbar').forEach(function (nav) {
        if (hide) {
          nav.style.setProperty('display', 'none', 'important');
          nav.style.setProperty('visibility', 'hidden', 'important');
          nav.setAttribute('aria-hidden', 'true');
          nav.setAttribute('data-tchilo-hidden', '1');
        } else {
          if (nav.getAttribute('data-tchilo-hidden') === '1') {
            nav.style.removeProperty('display');
            nav.style.removeProperty('visibility');
            nav.removeAttribute('data-tchilo-hidden');
          }
          nav.setAttribute('aria-hidden', 'false');
        }
      });
    } catch (e) {}
  }

  function patchGoTo() {
    if (typeof window.goTo !== 'function') return false;
    if (window.goTo.__hideNavV2) return true;
    var orig = window.goTo;
    window.goTo = function (name) {
      var r = orig.apply(this, arguments);
      apply(name);
      requestAnimationFrame(function () {
        apply(name || currentScreenName());
      });
      setTimeout(function () {
        apply(currentScreenName());
      }, 50);
      return r;
    };
    window.goTo.__hideNavV2 = true;
    return true;
  }

  function watchScreens() {
    try {
      var root = document.getElementById('appFrame') || document.body;
      if (!root || root.__tchiloNavWatch) return;
      root.__tchiloNavWatch = true;
      new MutationObserver(function () {
        apply(currentScreenName());
      }).observe(root, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
      });
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    patchGoTo();
    apply(currentScreenName());
    watchScreens();
    setTimeout(function () {
      patchGoTo();
      apply(currentScreenName());
    }, 400);
    setTimeout(function () {
      patchGoTo();
      apply(currentScreenName());
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
