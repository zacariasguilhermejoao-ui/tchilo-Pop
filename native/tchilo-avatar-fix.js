/**
 * Tchilo — foto de perfil aparece no perfil, feed e ícones
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarFix) return;
  window.__tchiloAvatarFix = true;

  function injectCSS() {
    if (document.getElementById('tchiloAvatarFixCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAvatarFixCSS';
    st.textContent =
      '.profile-avatar{overflow:hidden!important;position:relative;}' +
      '.profile-avatar img,' +
      '.user-avatar img,' +
      '.msg-item .user-avatar img,' +
      '.post-avatar img,' +
      '.story-ring img,' +
      '[class*="avatar"] img{' +
      'width:100%!important;height:100%!important;' +
      'object-fit:cover!important;border-radius:50%!important;' +
      'display:block!important;position:absolute;inset:0;}' +
      '.profile-avatar,.user-avatar,.post-avatar{' +
      'background-size:cover!important;background-position:center!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function setCache(username, url) {
    if (!username || !url) return;
    try {
      if (!window.__tchiloAvatarCache) window.__tchiloAvatarCache = {};
      window.__tchiloAvatarCache[username] = url;
    } catch (e) {}
  }

  function getSessionSafe() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  function persistLocalAvatar(username, url) {
    if (!username || !url) return;
    setCache(username, url);
    try {
      var session = getSessionSafe();
      if (session && session.username === username) {
        session.avatar = url;
        if (typeof setSession === 'function') setSession(session);
        else localStorage.setItem('tchilo_session', JSON.stringify(session));
      }
    } catch (e) {}
    try {
      if (typeof getProfileExtra === 'function' && typeof saveProfileExtra === 'function') {
        var extra = getProfileExtra(username) || {};
        extra.avatar = url;
        saveProfileExtra(username, extra);
      } else {
        var all = {};
        try {
          all = JSON.parse(localStorage.getItem('tchilo_profiles') || '{}');
        } catch (e2) {}
        all[username] = all[username] || {};
        all[username].avatar = url;
        localStorage.setItem('tchilo_profiles', JSON.stringify(all));
      }
    } catch (e) {}
    /* Atualiza posts locais do próprio user */
    try {
      if (typeof getPosts === 'function' && typeof save === 'function' && typeof KEYS !== 'undefined') {
        var posts = getPosts() || [];
        var changed = false;
        posts.forEach(function (p) {
          if (p && p.username === username && p.avatar !== url) {
            p.avatar = url;
            changed = true;
          }
        });
        if (changed) save(KEYS.posts, posts);
      }
    } catch (e) {}
  }

  async function pullAvatarFromCloud() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return null;
      var session = getSessionSafe();
      if (!session || !session.username) return null;

      var uid = window.__tchiloCloudUserId || null;
      if (!uid) {
        try {
          var auth = await SB.auth.getSession();
          uid =
            auth &&
            auth.data &&
            auth.data.session &&
            auth.data.session.user &&
            auth.data.session.user.id;
          if (uid) window.__tchiloCloudUserId = uid;
        } catch (e) {}
      }

      var url = null;
      if (uid) {
        var r = await SB.from('profiles')
          .select('avatar_url,username')
          .eq('id', uid)
          .maybeSingle();
        if (r && r.data && r.data.avatar_url) url = r.data.avatar_url;
      }
      if (!url && session.username) {
        var r2 = await SB.from('profiles')
          .select('avatar_url')
          .ilike('username', session.username)
          .maybeSingle();
        if (r2 && r2.data && r2.data.avatar_url) url = r2.data.avatar_url;
      }
      if (url) {
        persistLocalAvatar(session.username, url);
        return url;
      }
    } catch (e) {
      console.warn('Tchilo avatar pull', e);
    }
    return null;
  }

  function paintElement(el, url, initials, bg) {
    if (!el) return;
    if (url) {
      el.style.background = bg || 'transparent';
      el.style.overflow = 'hidden';
      el.style.position = el.style.position || 'relative';
      var existing = el.querySelector('img.tchilo-av');
      if (existing && existing.src === url) return;
      el.innerHTML =
        '<img class="tchilo-av" src="' +
        String(url).replace(/"/g, '&quot;') +
        '" alt="" loading="lazy" ' +
        'style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;position:absolute;inset:0" ' +
        'onerror="this.style.display=\'none\'">';
    } else if (initials) {
      if (!el.querySelector('img')) {
        el.textContent = String(initials).slice(0, 2).toUpperCase();
      }
    }
  }

  function refreshAllAvatars() {
    try {
      var session = getSessionSafe();
      if (!session || !session.username) return;
      var url =
        (window.__tchiloAvatarCache && window.__tchiloAvatarCache[session.username]) ||
        session.avatar ||
        null;
      try {
        var extra =
          typeof getProfileExtra === 'function'
            ? getProfileExtra(session.username)
            : null;
        if (extra && extra.avatar) url = extra.avatar;
      } catch (e) {}

      if (!url) return;
      setCache(session.username, url);

      /* Perfil grande */
      document.querySelectorAll('.profile-avatar').forEach(function (el) {
        paintElement(el, url, null, 'transparent');
      });

      /* Preview editar */
      var box = document.getElementById('editAvatarPreview');
      if (box) paintElement(box, url, null, 'transparent');

      /* Feed / posts do próprio user */
      document.querySelectorAll('.post[data-id]').forEach(function (post) {
        var uname = post.getAttribute('data-user') || post.getAttribute('data-username');
        if (!uname) {
          var nameEl = post.querySelector('.post-user, .user-tap, b.user-tap');
          if (nameEl) {
            var t = (nameEl.textContent || '').replace(/^@/, '').trim();
            if (t) uname = t.split(/\s|·/)[0];
          }
        }
        if (uname && uname === session.username) {
          var av = post.querySelector('.post-avatar, .user-avatar, .avatar');
          if (av) paintElement(av, url, null, 'transparent');
        }
      });

      /* Navbar perfil */
      var nav =
        document.querySelector('.navbar .nav-item[data-screen="profile"]') ||
        document.querySelector('.navbar .nav-item[onclick*="profile"]');
      if (nav) {
        var navAv = nav.querySelector('.user-avatar, .avatar, img');
        if (navAv && navAv.tagName === 'IMG') navAv.src = url;
      }
    } catch (e) {}
  }

  function patchApplyAvatar() {
    if (typeof window.applyAvatarToElement !== 'function') return;
    if (window.applyAvatarToElement.__avFix) return;
    var orig = window.applyAvatarToElement;
    window.applyAvatarToElement = function (el, username, initials, bg) {
      var url = null;
      try {
        if (window.__tchiloAvatarCache && window.__tchiloAvatarCache[username]) {
          url = window.__tchiloAvatarCache[username];
        }
      } catch (e) {}
      if (!url && typeof resolveUserAvatarUrl === 'function') {
        try {
          url = resolveUserAvatarUrl(username);
        } catch (e) {}
      }
      if (url) {
        paintElement(el, url, initials, bg);
        return;
      }
      return orig.apply(this, arguments);
    };
    window.applyAvatarToElement.__avFix = true;
  }

  function patchSaveProfile() {
    if (typeof window.saveProfile !== 'function') return;
    if (window.saveProfile.__avFix) return;
    var orig = window.saveProfile;
    window.saveProfile = async function () {
      var r = await orig.apply(this, arguments);
      try {
        var session = getSessionSafe();
        if (session && session.avatar) {
          persistLocalAvatar(session.username, session.avatar);
        }
        /* se ainda for data: e cloud falhou, mantém local */
        if (window.editAvatarData && String(window.editAvatarData).indexOf('data:') === 0) {
          var s = getSessionSafe();
          if (s && (!s.avatar || String(s.avatar).indexOf('http') !== 0)) {
            persistLocalAvatar(s.username, window.editAvatarData);
          }
        }
        setTimeout(refreshAllAvatars, 100);
        setTimeout(function () {
          if (typeof renderProfile === 'function') renderProfile();
          refreshAllAvatars();
        }, 400);
        pullAvatarFromCloud().then(function () {
          refreshAllAvatars();
          if (typeof renderProfile === 'function') renderProfile();
        });
      } catch (e) {}
      return r;
    };
    window.saveProfile.__avFix = true;
  }

  function patchRenderProfile() {
    if (typeof window.renderProfile !== 'function') return;
    if (window.renderProfile.__avFix) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      setTimeout(refreshAllAvatars, 50);
      setTimeout(refreshAllAvatars, 400);
      return r;
    };
    window.renderProfile.__avFix = true;
  }

  function boot() {
    injectCSS();
    patchApplyAvatar();
    patchSaveProfile();
    patchRenderProfile();

    /* Hidrata avatar da cloud ao abrir */
    pullAvatarFromCloud().then(function (url) {
      if (url) {
        refreshAllAvatars();
        if (typeof renderProfile === 'function') {
          try {
            renderProfile();
          } catch (e) {}
        }
      } else {
        refreshAllAvatars();
      }
    });

    setTimeout(function () {
      patchApplyAvatar();
      patchSaveProfile();
      patchRenderProfile();
      refreshAllAvatars();
    }, 1200);

    setTimeout(function () {
      pullAvatarFromCloud().then(refreshAllAvatars);
    }, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
