/**
 * Tchilo — links públicos de posts e perfis (partilha tipo TikTok/Facebook)
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloPublicUrlsV1) return;
  window.__tchiloPublicUrlsV1 = true;

  var ORIGIN = 'https://tchilopop.com';

  function origin() {
    try {
      if (location.origin && location.origin.indexOf('http') === 0) return location.origin;
    } catch (e) {}
    return ORIGIN;
  }

  function postUrl(id) {
    if (typeof window.tchiloPostPublicUrl === 'function') return window.tchiloPostPublicUrl(id);
    return origin() + '/p/' + encodeURIComponent(String(id || ''));
  }

  function profileUrl(username) {
    if (typeof window.tchiloProfilePublicUrl === 'function') return window.tchiloProfilePublicUrl(username);
    return origin() + '/u/' + encodeURIComponent(String(username || ''));
  }

  window.tchiloPublicPostUrl = postUrl;
  window.tchiloPublicProfileUrl = profileUrl;

  /* Partilha externa com URL real do post */
  function patchShareOutside() {
    if (typeof window.shareOutside !== 'function') return;
    if (window.shareOutside.__publicUrl) return;
    var orig = window.shareOutside;
    window.shareOutside = function () {
      var postId = window.sharePostId;
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      var p = posts.find(function (x) {
        return x.id === postId;
      });
      if (!p) return orig.apply(this, arguments);
      try {
        if (typeof bumpShareCount === 'function') bumpShareCount(postId);
      } catch (e) {}
      var url = postUrl(postId);
      var text =
        '@' + p.username + (p.caption ? ': ' + p.caption : ' publicou no Tchilo');
      if (navigator.share) {
        navigator
          .share({ title: 'Tchilo', text: text, url: url })
          .then(function () {
            try {
              if (typeof closeShare === 'function') closeShare();
            } catch (e2) {}
            try {
              if (typeof showToast === 'function') showToast('Partilhado');
            } catch (e3) {}
          })
          .catch(function () {
            try {
              if (typeof showToast === 'function') showToast('Partilha cancelada');
            } catch (e4) {}
          });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          try {
            if (typeof showToast === 'function') showToast('Link do post copiado');
          } catch (e5) {}
          try {
            if (typeof closeShare === 'function') closeShare();
          } catch (e6) {}
        });
        return;
      }
      return orig.apply(this, arguments);
    };
    window.shareOutside.__publicUrl = true;
  }

  /* Ao abrir visualizador de post, atualizar URL */
  function patchOpenPost() {
    if (typeof window.openProfilePostViewer !== 'function') return;
    if (window.openProfilePostViewer.__publicUrl) return;
    var orig = window.openProfilePostViewer;
    window.openProfilePostViewer = function (postId) {
      try {
        if (postId && typeof window.tchiloSetPublicUrl === 'function') {
          window.tchiloSetPublicUrl('post', false, null, postId);
        } else if (postId) {
          var path = '/p/' + encodeURIComponent(String(postId));
          if (location.pathname !== path) {
            try {
              history.pushState({ screen: 'post', postId: postId }, '', path);
            } catch (e) {}
          }
        }
      } catch (e2) {}
      return orig.apply(this, arguments);
    };
    window.openProfilePostViewer.__publicUrl = true;
  }

  /* Ao ver perfil de outro user, URL /u/username */
  function patchProfileNav() {
    if (typeof window.renderProfile !== 'function') return;
    if (window.renderProfile.__publicUrl) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      try {
        var user = null;
        try {
          user = window.viewingProfileUser;
        } catch (e) {}
        if (!user) {
          var s = typeof getSession === 'function' ? getSession() : null;
          user = s && s.username;
        }
        if (user && typeof window.tchiloSetPublicUrl === 'function') {
          window.tchiloSetPublicUrl('profile', true, user);
        }
      } catch (e2) {}
      return r;
    };
    window.renderProfile.__publicUrl = true;
  }

  function boot() {
    patchShareOutside();
    patchOpenPost();
    patchProfileNav();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
  setInterval(boot, 5000);
})();
