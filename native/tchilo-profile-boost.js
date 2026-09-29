/**
 * Tchilo — botão Turbinar ao ver os próprios posts no perfil
 */
(function () {
  'use strict';
  if (window.__tchiloProfileBoostV1) return;
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
    try {
      if (typeof showToast === 'function') showToast('A abrir Turbinar…');
    } catch (e4) {}
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
      '<span style="display:inline-flex;align-items:center;justify-content:center;min-width:72px;padding:8px 12px;border-radius:999px;border:2px solid currentColor;font-weight:800;font-size:12px;letter-spacing:0.02em">Turbinar</span>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      doBoost(postId);
    };

    if (actions) {
      actions.appendChild(btn);
    } else {
      btn.style.cssText =
        'position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:30;padding:12px 20px;border-radius:999px;border:2px solid #fff;background:rgba(0,0,0,.55);color:#fff;font-weight:800;font-size:14px;cursor:pointer';
      btn.textContent = 'Turbinar';
      btn.innerHTML = '';
      btn.textContent = 'Turbinar';
      if (viewer.style.position === '' || viewer.style.position === 'static') {
        viewer.style.position = 'relative';
      }
      viewer.appendChild(btn);
    }
  }

  function patchOpenProfilePostViewer() {
    if (typeof window.openProfilePostViewer !== 'function') return false;
    if (window.openProfilePostViewer.__profileBoost) return true;
    var orig = window.openProfilePostViewer;
    window.openProfilePostViewer = function (postId) {
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        injectViewerBoost(postId);
      }, 30);
      setTimeout(function () {
        injectViewerBoost(postId);
      }, 150);
      setTimeout(function () {
        injectViewerBoost(postId);
      }, 400);
      return r;
    };
    window.openProfilePostViewer.__profileBoost = true;
    return true;
  }

  function patchOpenPostMenu() {
    if (typeof window.openPostMenu !== 'function') return false;
    if (window.openPostMenu.__profileBoostMenu) return true;
    var orig = window.openPostMenu;
    window.openPostMenu = function (postId) {
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        try {
          if (!isOwnPostId(postId)) return;
          var box =
            document.getElementById('postMenuOptions') ||
            document.querySelector('.post-menu-options, .share-sheet, #shareSheet');
          if (!box) return;
          if (box.querySelector('[data-tchilo-profile-boost-menu]')) return;
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'share-opt';
          b.setAttribute('data-tchilo-profile-boost-menu', '1');
          b.innerHTML =
            '<div class="so-icon" style="background:var(--mint,#c8f560);color:#0B0B0C;font-weight:900;display:flex;align-items:center;justify-content:center;border-radius:12px;width:40px;height:40px">T</div>' +
            '<div><b>Turbinar</b><span style="display:block;opacity:.75;font-size:12px">Promover este post</span></div>';
          b.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            try {
              if (typeof closePostMenu === 'function') closePostMenu();
            } catch (err) {}
            doBoost(postId);
          };
          box.insertBefore(b, box.firstChild);
        } catch (e) {}
      }, 40);
      return r;
    };
    window.openPostMenu.__profileBoostMenu = true;
    return true;
  }

  function ensureCSS() {
    if (document.getElementById('tchiloProfileBoostCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloProfileBoostCSS';
    st.textContent =
      '#mediaViewer [data-tchilo-profile-boost]{pointer-events:auto!important;z-index:25!important;}' +
      '#mediaViewer .profile-viewer-actions{flex-wrap:wrap;row-gap:10px;}' +
      '[data-tchilo-profile-boost-menu]{display:flex!important;align-items:center;gap:12px;width:100%;text-align:left;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function boot() {
    ensureCSS();
    patchOpenProfilePostViewer();
    patchOpenPostMenu();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
  setInterval(boot, 4000);
})();
