/**
 * Tchilo — esconde a barra inferior (Fee, Reels, +…) em ecrãs internos
 * como Definições e Editar perfil.
 */
(function () {
  'use strict';
  if (window.__tchiloHideNav) return;
  window.__tchiloHideNav = true;

  /* Ecrãs sem menu inferior */
  var HIDE_ON = {
    settings: 1,
    editprofile: 1,
    'edit-profile': 1,
    privacy: 1,
    support: 1,
    cookies: 1,
    legal: 1,
    about: 1,
    premium: 1,
    ads: 1,
    adsmanager: 1,
    'ads-manager': 1
  };

  function injectCSS() {
    if (document.getElementById('tchiloHideNavCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloHideNavCSS';
    st.textContent =
      'body.tchilo-no-bottom-nav .navbar,' +
      'body.tchilo-no-bottom-nav #appFrame > .navbar,' +
      'body.tchilo-no-bottom-nav nav.navbar{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important;}' +
      /* dá espaço ao conteúdo quando a barra some */
      'body.tchilo-no-bottom-nav .screen.active,' +
      'body.tchilo-no-bottom-nav #appFrame{' +
      'padding-bottom:0!important;}' +
      'body.tchilo-no-bottom-nav .screen-body,' +
      'body.tchilo-no-bottom-nav .settings-body{' +
      'padding-bottom:max(16px, env(safe-area-inset-bottom, 0px))!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function shouldHide(name) {
    if (!name) return false;
    var n = String(name).toLowerCase().replace(/^screen-/, '');
    if (HIDE_ON[n]) return true;
    /* fallback: id do ecrã ativo */
    try {
      var active = document.querySelector('.screen.active');
      if (active && active.id) {
        var id = active.id.replace(/^screen-/, '').toLowerCase();
        if (HIDE_ON[id]) return true;
      }
    } catch (e) {}
    return false;
  }

  function apply(name) {
    injectCSS();
    var hide = shouldHide(name);
    try {
      document.body.classList.toggle('tchilo-no-bottom-nav', hide);
    } catch (e) {}
    try {
      var nav = document.querySelector('.navbar');
      if (nav) {
        if (hide) {
          nav.style.setProperty('display', 'none', 'important');
          nav.setAttribute('aria-hidden', 'true');
        } else {
          nav.style.removeProperty('display');
          nav.setAttribute('aria-hidden', 'false');
        }
      }
    } catch (e) {}
  }

  function currentScreenName() {
    try {
      var active = document.querySelector('.screen.active');
      if (active && active.id) return active.id.replace(/^screen-/, '');
    } catch (e) {}
    return '';
  }

  function patchGoTo() {
    if (typeof window.goTo !== 'function') return false;
    if (window.goTo.__hideNav) return true;
    var orig = window.goTo;
    window.goTo = function (name) {
      var r = orig.apply(this, arguments);
      try {
        apply(name);
        setTimeout(function () {
          apply(name || currentScreenName());
        }, 0);
        setTimeout(function () {
          apply(currentScreenName());
        }, 80);
      } catch (e) {}
      return r;
    };
    window.goTo.__hideNav = true;
    return true;
  }

  function boot() {
    injectCSS();
    patchGoTo();
    apply(currentScreenName());
    setTimeout(function () {
      patchGoTo();
      apply(currentScreenName());
    }, 600);
    setTimeout(function () {
      patchGoTo();
      apply(currentScreenName());
    }, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
