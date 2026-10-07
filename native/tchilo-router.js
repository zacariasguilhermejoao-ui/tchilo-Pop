/**
 * Tchilo router v4
 * URLs internas: /?s=feed|messages|profile... (sempre 200 no GitHub Pages)
 * Evita /mensagens /feed etc que davam 404 e a pagina caia
 * Perfis /u/user e posts /p/id mantidos (404.html redireciona)
 */
(function () {
  'use strict';
  if (window.__tchiloRouterInstalledV4) return;
  window.__tchiloRouterInstalledV4 = true;
  window.__tchiloRouterInstalledV3 = true;

  var EXTERNAL = {
    terms: '/termos/',
    privacy: '/privacidade/',
    community: '/comunidade/',
    child: '/menores/',
    about: '/sobre/',
    cookies: '/cookies/',
    'delete-account': '/eliminar-conta/'
  };

  var pushing = false;

  function pathFor(name, user, postId) {
    if (name === 'post' && postId) {
      return '/p/' + encodeURIComponent(String(postId));
    }
    if (name === 'profile' && user) {
      return '/u/' + encodeURIComponent(String(user));
    }
    if (EXTERNAL[name]) return EXTERNAL[name];
    /* Interno: fica na raiz com query — nunca 404 */
    if (!name || name === 'feed') return '/';
    return '/?s=' + encodeURIComponent(String(name));
  }

  function screenFromLocation() {
    try {
      var p = location.pathname || '/';
      if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

      var mUser = p.match(/^\/(?:perfil|u)\/([^\/]+)$/i);
      if (mUser) return { screen: 'profile', user: decodeURIComponent(mUser[1]) };

      var mPost = p.match(/^\/(?:p|post)\/([^\/]+)$/i);
      if (mPost) return { screen: 'post', postId: decodeURIComponent(mPost[1]) };

      /* query ?s=messages */
      var params = new URLSearchParams(location.search || '');
      var s = params.get('s');
      if (s) return { screen: s };

      if (p === '/' || p === '') return { screen: 'feed' };

      /* caminhos legados /mensagens etc → tratar como screen */
      var bare = p.replace(/^\//, '');
      var legacy = {
        feed: 'feed',
        mensagens: 'messages',
        messages: 'messages',
        notificacoes: 'notifs',
        notifs: 'notifs',
        perfil: 'profile',
        profile: 'profile',
        criar: 'create',
        create: 'create',
        pesquisar: 'search',
        search: 'search',
        guardados: 'saved',
        definicoes: 'settings'
      };
      if (legacy[bare]) return { screen: legacy[bare] };
      if (document.getElementById('screen-' + bare)) return { screen: bare };
    } catch (e) {}
    return { screen: 'feed' };
  }

  function setUrl(name, replace, user, postId) {
    try {
      if (EXTERNAL[name]) return;
      var path = pathFor(name, user, postId);
      var cur = location.pathname + location.search;
      if (cur === path || (path === '/' && cur === '' )) return;
      /* se ja estamos em /?s=x e e o mesmo */
      if (path.indexOf('?s=') === 1) {
        var curS = new URLSearchParams(location.search).get('s') || (location.pathname === '/' ? 'feed' : '');
        var newS = name === 'feed' ? '' : name;
        if ((curS || 'feed') === (newS || 'feed') && location.pathname === '/') return;
      }
      pushing = true;
      var state = { screen: name, user: user || null, postId: postId || null };
      if (replace) history.replaceState(state, '', path);
      else history.pushState(state, '', path);
      setTimeout(function () { pushing = false; }, 0);
    } catch (e) {}
  }

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
    callGoTo('feed');
    setTimeout(function () {
      try {
        if (typeof openProfilePostViewer === 'function') openProfilePostViewer(postId);
      } catch (e3) {}
    }, 400);
  }

  function install() {
    if (typeof window.goTo !== 'function') return false;
    if (window.goTo.__tchiloRoutedV4) return true;
    var orig = window.goTo._orig || window.goTo;
    function routed(name) {
      try {
        if (EXTERNAL[name]) {
          try {
            location.href = EXTERNAL[name];
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
    routed.__tchiloRoutedV4 = true;
    routed.__tchiloRoutedV3 = true;
    window.goTo = routed;
    return true;
  }

  function bootFromUrl() {
    try {
      var saved = sessionStorage.getItem('tchilo_spa_path');
      if (saved) {
        sessionStorage.removeItem('tchilo_spa_path');
        /* Se era caminho legado 404, so extrai o screen */
        try {
          var u = new URL(saved, location.origin);
          var info0 = null;
          /* fake parse */
          history.replaceState(null, '', '/');
        } catch (e0) {}
      }
    } catch (e) {}

    var info = screenFromLocation();
    var name = info.screen || 'feed';
    var user = info.user || null;
    var postId = info.postId || null;

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
          try { window.viewingProfileUser = user; } catch (e) {}
        }
        /* Evitar loop: so navega se nao estamos ja no ecran */
        try {
          var active = document.querySelector('.screen.active');
          var cur = active && active.id ? active.id.replace(/^screen-/, '') : '';
          if (cur !== name) callGoTo(name, user);
        } catch (e1) {
          callGoTo(name, user);
        }
      } else if (++n > 80) clearInterval(t);
    }, 50);
  }

  window.addEventListener('popstate', function (ev) {
    if (pushing) return;
    var st = ev.state || {};
    var info = screenFromLocation();
    var name = st.screen || info.screen || 'feed';
    var user = st.user || info.user || null;
    var postId = st.postId || info.postId || null;
    if (name === 'post' && postId) {
      openPostById(postId);
      return;
    }
    if (EXTERNAL[name]) {
      try { location.href = EXTERNAL[name]; } catch (e) {}
      return;
    }
    if (user) {
      try { window.viewingProfileUser = user; } catch (e) {}
    } else if (name === 'profile') {
      try { window.viewingProfileUser = null; } catch (e2) {}
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
    return Promise.resolve(url);
  };

  window.tchiloProfilePublicUrl = function (username) {
    var u = encodeURIComponent(String(username || '').trim());
    return (location.origin || 'https://tchilopop.com') + (u ? '/u/' + u : '/');
  };

  window.tchiloPostPublicUrl = function (postId) {
    var id = encodeURIComponent(String(postId || '').trim());
    return (location.origin || 'https://tchilopop.com') + (id ? '/p/' + id : '/');
  };

  window.tchiloOpenPostUrl = openPostById;
  window.tchiloSetPublicUrl = setUrl;
})();
