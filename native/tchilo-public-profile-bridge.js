/**
 * Tchilo — página pública /u/user (SEO) → abrir a app real
 * v1
 *
 * A página preta minimalista é só para Google/partilha.
 * Em browsers reais redireciona para a app com o perfil a visualizar.
 */
(function () {
  'use strict';
  if (window.__tchiloPublicProfileBridgeV1) return;
  window.__tchiloPublicProfileBridgeV1 = true;

  function isMinimalPublicPage() {
    try {
      var t = document.title || '';
      var hasCard = !!document.querySelector('main .card');
      var hasApp =
        !!document.getElementById('appFrame') ||
        !!document.getElementById('screen-feed') ||
        !!document.querySelector('.navbar');
      if (hasApp) return false;
      if (hasCard && /Tchilo/i.test(t)) return true;
      if (document.body && document.body.innerText && document.body.innerText.indexOf('Ver perfil no Tchilo') >= 0)
        return true;
    } catch (e) {}
    return false;
  }

  function usernameFromPath() {
    var m = String(location.pathname || '').match(/^\/u\/([^\/]+)/i);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function goToApp() {
    var user = usernameFromPath();
    /* App SPA na raiz com query para abrir perfil (sem trocar sessão) */
    var url = 'https://tchilopop.com/?view=' + encodeURIComponent(user || '');
    try {
      if (location.hostname.indexOf('tchilopop') >= 0) {
        url = location.origin + '/?view=' + encodeURIComponent(user || '');
      }
    } catch (e) {}
    location.replace(url);
  }

  /* Se estamos na página SEO minimalista e o user é humano (não bot) */
  function boot() {
    if (!isMinimalPublicPage()) return;
    var ua = navigator.userAgent || '';
    if (/bot|googlebot|bingbot|crawler|spider|slurp|facebookexternalhit|twitterbot/i.test(ua)) {
      return; /* deixa bots lerem o HTML SEO */
    }
    goToApp();
  }

  /* Também: na app, se ?view=username, abrir perfil sem login */
  function handleViewQuery() {
    try {
      var q = new URLSearchParams(location.search || '');
      var view = q.get('view');
      if (!view) return;
      window.__tchiloViewingProfileUser = view;
      function open() {
        try {
          if (typeof openUserProfile === 'function') openUserProfile(view);
          else if (typeof goTo === 'function') {
            window.viewingProfileUser = view;
            goTo('profile');
          }
        } catch (e) {}
        try {
          history.replaceState(null, '', location.pathname);
        } catch (e2) {}
      }
      if (document.readyState === 'complete') setTimeout(open, 400);
      else window.addEventListener('load', function () {
        setTimeout(open, 400);
      });
    } catch (e) {}
  }

  boot();
  handleViewQuery();
})();
