/**
 * Tchilo router v5 — SEM mudar URL no GitHub Pages
 * pushState para /mensagens causava 404 + crash no telemovel
 * Navegacao fica 100% SPA sem alterar location
 */
(function () {
  'use strict';
  if (window.__tchiloRouterInstalledV5) return;
  window.__tchiloRouterInstalledV5 = true;
  window.__tchiloRouterInstalledV4 = true;

  var EXTERNAL = {
    terms: '/termos/',
    privacy: '/privacidade/',
    community: '/comunidade/',
    child: '/menores/',
    about: '/sobre/',
    cookies: '/cookies/',
    'delete-account': '/eliminar-conta/'
  };

  function callGoTo(name, user) {
    try {
      if (user) {
        try { window.viewingProfileUser = user; } catch (e) {}
      }
      if (typeof window.goTo === 'function') {
        if (window.goTo._orig) return window.goTo._orig.call(window, name);
        return window.goTo(name);
      }
    } catch (e) {}
  }

  function install() {
    if (typeof window.goTo !== 'function') return false;
    if (window.goTo.__tchiloRoutedV5) return true;
    var orig = window.goTo._orig || window.goTo;
    function routed(name) {
      try {
        if (EXTERNAL[name]) {
          /* paginas legais reais — so estas mudam de URL */
          try {
            location.href = EXTERNAL[name];
            return;
          } catch (e) {}
        }
        /* Nao altera location.pathname nem search — evita 404 e reload */
        try {
          localStorage.setItem('tchilo_last_screen', String(name || 'feed'));
        } catch (e2) {}
      } catch (e3) {}
      return orig.apply(this, arguments);
    }
    routed._orig = orig;
    routed.__tchiloRoutedV5 = true;
    routed.__tchiloRoutedV4 = true;
    window.goTo = routed;
    return true;
  }

  function bootFromUrl() {
    /* Se viemos de 404 SPA, limpa path guardado e fica no feed */
    try {
      sessionStorage.removeItem('tchilo_spa_path');
    } catch (e) {}
    /* Se a URL ainda e um caminho legado 404, volta a raiz SEM loop */
    try {
      var p = location.pathname || '/';
      if (p !== '/' && p !== '') {
        var external = false;
        Object.keys(EXTERNAL).forEach(function (k) {
          if (p.indexOf(EXTERNAL[k].replace(/\/$/, '')) === 0) external = true;
        });
        if (!external && !/^\/u\//.test(p) && !/^\/p\//.test(p)) {
          /* caminho legado /mensagens etc — substitui por / sem reload pesado */
          if (typeof history.replaceState === 'function') {
            history.replaceState(null, '', '/');
          }
        }
      }
    } catch (e2) {}
  }

  if (!install()) {
    var tries = 0;
    var iv = setInterval(function () {
      if (install() || ++tries > 80) clearInterval(iv);
    }, 50);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootFromUrl);
  } else {
    bootFromUrl();
  }

  window.tchiloCopyPageLink = function () {
    return Promise.resolve(location.origin + '/');
  };
  window.tchiloProfilePublicUrl = function (username) {
    var u = encodeURIComponent(String(username || '').trim());
    return (location.origin || 'https://tchilopop.com') + (u ? '/u/' + u : '/');
  };
  window.tchiloPostPublicUrl = function (postId) {
    var id = encodeURIComponent(String(postId || '').trim());
    return (location.origin || 'https://tchilopop.com') + (id ? '/p/' + id : '/');
  };
})();
