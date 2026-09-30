/**
 * Tchilo — navegação com endereços reais
 * v3 — perfis /u/user e posts /p/id (estilo TikTok/Facebook)
 */
(function () {
  'use strict';
  if (window.__tchiloRouterInstalledV3) return;
  window.__tchiloRouterInstalledV3 = true;
  window.__tchiloRouterInstalledV2 = true;
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
    terms: true,
    privacy: true,
    community: true,
    child: true,
    about: true,
    cookies: true,
    'delete-account': true
  };

  var pushing = false;

  function normalizePath(p) {
    if (!p) return '/';
    p = String(p).split('?')[0].split('#')[0];
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p || '/';
  }

  function pathFor(name, user, postId) {
    if (name === 'post' && postId) {
      return '/p/' + encodeURIComponent(String(postId));
    }
    if (name === 'profile' && user) {
      return '/u/' + encodeURIComponent(String(user));
    }
    if (PATHS[name]) return PATHS[name];
    return '/' + encodeURIComponent(String(name || 'feed'));
  }

  function screenFromPath(pathname) {
    var p = normalizePath(pathname);
    if (REV[p]) return REV[p];
    if (REV[p + '/']) return REV[p + '/'];
    var mUser = p.match(/^\/(?:perfil|u)\/([^\/]+)$/i);
    if (mUser) return { screen: 'profile', user: decodeURIComponent(mUser[1]) };
    var mPost = p.match(/^\/(?:p|post)\/([^\/]+)$/i);
    if (mPost) return { screen: 'post', postId: decodeURIComponent(mPost[1]) };
    var bare = p.replace(/^\//, '');
    if (bare && document.getElementById('screen-' + bare)) return bare;
    return null;
  }

  function setUrl(name, replace, user, postId) {
    try {
      var path = pathFor(name, user, postId);
      if (EXTERNAL[name] && path.slice(-1) !== '/') path += '/';
      if (normalizePath(location.pathname) === normalizePath(path)) return;
      pushing = true;
      var state = { screen: name, user: user || null, postId: postId || null };
      if (replace) history.replaceState(state, '', path);
      else history.pushState(state, '', path);
      setTimeout(function () {
        pushing = false;
      }, 0);
    } catch (e) {}
  }

  function callGoTo(name, user) {
    try {
      if (user) {
        try {
          window.viewingProfileUser = user;
        } catch (e) {}
      }
      if (typeof window.goTo === 'function') {
        if (window.goTo._orig) return window.goTo._orig.call(window, name);
        return window.goTo(name);
      }
    } catch (e) {}
  }

  function openPostById(postId) {
    if (!postId) return;
    window.__tchiloPendingPostId = postId;
    setUrl('post', false, null, postId);
    try {
      if (typeof openProfilePostViewer === 'function') {
        openProfilePostViewer(postId);
        return;
      }
    } catch (e) {}
    try {
      if (typeof openShare === 'function') {
        /* fallback: scroll feed */
      }
    } catch (e2) {}
    /* tenta ir ao feed e abrir */
    callGoTo('feed');
    setTimeout(function () {
      try {
        if (typeof openProfilePostViewer === 'function') openProfilePostViewer(postId);
      } catch (e3) {}
    }, 400);
  }

  function install() {
    if (typeof window.goTo !== 'function') return false;
    if (window.goTo.__tchiloRoutedV3) return true;
    var orig = window.goTo._orig || window.goTo;
    function routed(name) {
      try {
        if (EXTERNAL[name]) {
          var p = pathFor(name);
          if (p.slice(-1) !== '/') p += '/';
          try {
            location.href = p;
            return;
          } catch (e) {}
        }
        var user = null;
        try {
          if (name === 'profile' && window.viewingProfileUser) user = window.viewingProfileUser;
        } catch (e2) {}
        setUrl(name, false, user);
      } catch (e3) {}
      return orig.apply(this, arguments);
    }
    routed._orig = orig;
    routed.__tchiloRoutedV3 = true;
    routed.__tchiloRoutedV2 = true;
    window.goTo = routed;
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
    var user = typeof info === 'object' && info.user ? info.user : null;
    var postId = typeof info === 'object' && info.postId ? info.postId : null;

    if (name === 'post' && postId) {
      openPostById(postId);
      return;
    }

    if (EXTERNAL[name]) return;

    var n = 0;
    var t = setInterval(function () {
      if (typeof window.goTo === 'function') {
        clearInterval(t);
        if (user) {
          try {
            window.viewingProfileUser = user;
          } catch (e) {}
        }
        callGoTo(name, user);
        try {
          if (name === 'profile' && typeof renderProfile === 'function') renderProfile();
        } catch (e2) {}
      } else if (++n > 80) clearInterval(t);
    }, 50);
  }

  window.addEventListener('popstate', function (ev) {
    if (pushing) return;
    var st = ev.state || {};
    var info = screenFromPath(location.pathname);
    var name = st.screen || (typeof info === 'string' ? info : info && info.screen) || 'feed';
    var user = st.user || (info && info.user) || null;
    var postId = st.postId || (info && info.postId) || null;
    if (typeof name === 'object' && name.screen) {
      user = name.user || user;
      postId = name.postId || postId;
      name = name.screen;
    }
    if (name === 'post' && postId) {
      openPostById(postId);
      return;
    }
    if (EXTERNAL[name]) {
      var p = pathFor(name);
      if (p.slice(-1) !== '/') p += '/';
      location.href = p;
      return;
    }
    if (user) {
      try {
        window.viewingProfileUser = user;
      } catch (e) {}
    } else if (name === 'profile') {
      try {
        window.viewingProfileUser = null;
      } catch (e2) {}
    }
    callGoTo(name, user);
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

  window.tchiloProfilePublicUrl = function (username) {
    var u = encodeURIComponent(String(username || '').trim());
    return (location.origin || 'https://tchilopop.com') + (u ? '/u/' + u : '/perfil');
  };

  window.tchiloPostPublicUrl = function (postId) {
    var id = encodeURIComponent(String(postId || '').trim());
    return (location.origin || 'https://tchilopop.com') + (id ? '/p/' + id : '/feed');
  };

  window.tchiloOpenPostUrl = openPostById;
  window.tchiloSetPublicUrl = setUrl;
})();
