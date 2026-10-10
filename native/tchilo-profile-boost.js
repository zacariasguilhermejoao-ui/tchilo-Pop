/**
 * Tchilo — botão Turbinar no viewer do perfil (sem duplicar no menu ⋯)
 * v2 — menu ⋯ fica só com 1 Turbinar (ads-ui)
 */
(function () {
  'use strict';
  if (window.__tchiloProfileBoostV2) return;
  window.__tchiloProfileBoostV2 = true;
  window.__tchiloProfileBoostV1 = true;

  function sessionUser() {
    try {
      if (typeof getSession === 'function') return getSession();
    } catch (e) {}
    return null;
  }

  function myUsername() {
    var s = sessionUser();
    if (s && s.username) return String(s.username);
    try {
      if (s && s.user && s.user.user_metadata && s.user.user_metadata.username)
        return String(s.user.user_metadata.username);
    } catch (e2) {}
    return '';
  }

  function isOwnPostId(postId) {
    try {
      var me = myUsername();
      if (!me || !postId) return false;
      if (typeof getPosts === 'function') {
        var posts = getPosts() || [];
        var p = posts.find(function (x) {
          return x && String(x.id) === String(postId);
        });
        if (p && p.username && String(p.username) === me) return true;
        if (p && p.user_id) {
          var s = sessionUser();
          var uid = s && (s.id || s.user_id || (s.user && s.user.id));
          if (uid && String(p.user_id) === String(uid)) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function doBoost(postId) {
    try {
      if (typeof window.tchiloBoostPost === 'function') {
        window.tchiloBoostPost(postId);
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.openCreateFromPost === 'function') {
        window.openCreateFromPost(postId);
        return;
      }
    } catch (e2) {}
    try {
      if (typeof goTo === 'function') goTo('ads-create');
    } catch (e3) {}
  }

  function injectViewerBoost(postId) {
    if (!postId || !isOwnPostId(postId)) return;
    var viewer = document.getElementById('mediaViewer');
    if (!viewer) return;
    if (viewer.querySelector('[data-tchilo-profile-boost]')) return;

    var actions = viewer.querySelector('.profile-viewer-actions');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-tchilo-profile-boost', '1');
    btn.className = 'pv-action';
    btn.style.cssText =
      'background:none;border:0;color:inherit;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer';
    btn.innerHTML =
      '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:72px;padding:8px 12px;border-radius:999px;border:1.5px solid currentColor;font-weight:800;font-size:12px">Turbinar</span>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      doBoost(postId);
    };

    if (actions) actions.appendChild(btn);
  }

  function patchOpenProfilePostViewer() {
    if (typeof window.openProfilePostViewer !== 'function') return false;
    if (window.openProfilePostViewer.__profileBoost) return true;
    var orig = window.openProfilePostViewer;
    window.openProfilePostViewer = function (postId) {
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        injectViewerBoost(postId);
      }, 40);
      setTimeout(function () {
        injectViewerBoost(postId);
      }, 200);
      return r;
    };
    window.openProfilePostViewer.__profileBoost = true;
    return true;
  }

  /* NÃO injectar no openPostMenu — evita 2 Turbinar */

  function boot() {
    patchOpenProfilePostViewer();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
})();
