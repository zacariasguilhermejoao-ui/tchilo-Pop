/**
 * Tchilo — navegação dinâmica com endereços reais (SPA + GitHub Pages)
 * Cada ecrã tem URL copiável. Voltar do browser restaura o ecrã certo.
 */
(function () {
  'use strict';
  if (window.__tchiloRouterInstalled) return;
  window.__tchiloRouterInstalled = true;

  var PATHS = {
    feed: '/feed',
    search: '/pesquisar',
    messages: '/mensagens',
    notifs: '/notificacoes',
    profile: '/perfil',
    create: '/criar',
    saved: '/guardados',
    editprofile: '/editar-perfil',
    settings: '/definicoes',
    'settings-account': '/definicoes/conta',
    'settings-theme': '/definicoes/tema',
    'settings-language': '/definicoes/idioma',
    'settings-legal': '/definicoes/legal',
    'settings-privacy': '/definicoes/privacidade',
    'settings-notifications': '/definicoes/notificacoes',
    'settings-stories': '/definicoes/stories',
    'settings-advanced': '/definicoes/avancado',
    terms: '/termos/',
    privacy: '/privacidade/',
    community: '/comunidade/',
    child: '/menores/',
    about: '/sobre/',
    'delete-account': '/eliminar-conta/',
    cookies: '/cookies/'
  };

  var REV = {};
  Object.keys(PATHS).forEach(function (k) {
    var p = PATHS[k].replace(/\/+$/, '') || '/';
    REV[p] = k;
    REV[PATHS[k]] = k;
  });
  REV['/'] = 'feed';
  REV[''] = 'feed';

  var EXTERNAL = {
    terms: true, privacy: true, community: true, child: true, about: true, cookies: true,
    'delete-account': true
  };

  var pushing = false;

  function normalizePath(p) {
    if (!p) return '/';
    p = String(p).split('?')[0].split('#')[0];
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p || '/';
  }

  function pathFor(name) {
    if (PATHS[name]) return PATHS[name];
    return '/' + encodeURIComponent(String(name || 'feed'));
  }

  function screenFromPath(pathname) {
    var p = normalizePath(pathname);
    if (REV[p]) return REV[p];
    if (REV[p + '/']) return REV[p + '/'];
    var m = p.match(/^\/(?:perfil|u)\/([^\/]+)$/i);
    if (m) return { screen: 'profile', user: decodeURIComponent(m[1]) };
    var bare = p.replace(/^\//, '');
    if (bare && document.getElementById('screen-' + bare)) return bare;
    return null;
  }

  function setUrl(name, replace) {
    try {
      var path = pathFor(name);
      if (EXTERNAL[name] && path.slice(-1) !== '/') path += '/';
      if (normalizePath(location.pathname) === normalizePath(path)) return;
      pushing = true;
      if (replace) history.replaceState({ screen: name }, '', path);
      else history.pushState({ screen: name }, '', path);
      pushing = false;
    } catch (e) {
      pushing = false;
    }
  }

  function callGoTo(name) {
    if (typeof window.goTo === 'function') {
      try { window.__tchiloRouterSilent = true; window.goTo(name); }
      finally { window.__tchiloRouterSilent = false; }
    }
  }

  function install() {
    if (typeof window.goTo !== 'function') return false;
    if (window.goTo.__tchiloRouted) return true;
    var orig = window.goTo;
    function routed(name) {
      if (!window.__tchiloRouterSilent) {
        if (EXTERNAL[name]) {
          var p = pathFor(name);
          if (p.slice(-1) !== '/') p += '/';
          try { location.href = p; return; } catch (e) {}
        }
        setUrl(name, false);
      }
      return orig.apply(this, arguments);
    }
    routed.__tchiloRouted = true;
    routed._orig = orig;
    window.goTo = routed;
    window.__tchiloSetPath = setUrl;
    return true;
  }

  function bootFromUrl() {
    try {
      var saved = sessionStorage.getItem('tchilo_spa_path');
      if (saved) {
        sessionStorage.removeItem('tchilo_spa_path');
        var onlyPath = saved.split('?')[0].split('#')[0];
        if (onlyPath && onlyPath !== '/' && onlyPath !== location.pathname) {
          history.replaceState(null, '', saved);
        }
      }
    } catch (e) {}

    var info = screenFromPath(location.pathname);
    if (!info) return;
    var name = typeof info === 'string' ? info : info.screen;
    if (!name || name === 'feed') return;
    if (EXTERNAL[name]) return;
    var n = 0;
    var t = setInterval(function () {
      if (install()) {
        clearInterval(t);
        callGoTo(name);
      } else if (++n > 80) clearInterval(t);
    }, 50);
  }

  window.addEventListener('popstate', function (ev) {
    if (pushing) return;
    var name = (ev.state && ev.state.screen) || screenFromPath(location.pathname) || 'feed';
    if (typeof name === 'object' && name.screen) name = name.screen;
    if (EXTERNAL[name]) {
      var p = pathFor(name);
      if (p.slice(-1) !== '/') p += '/';
      location.href = p;
      return;
    }
    callGoTo(name);
  });

  if (!install()) {
    var tries = 0;
    var iv = setInterval(function () {
      if (install() || ++tries > 100) clearInterval(iv);
    }, 40);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootFromUrl);
  } else {
    bootFromUrl();
  }

  window.tchiloCopyPageLink = function () {
    var url = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url).then(function () {
        if (typeof showToast === 'function') showToast('Link copiado');
        return url;
      });
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (typeof showToast === 'function') showToast('Link copiado');
    } catch (e) {}
    return Promise.resolve(url);
  };
})();
