/**
 * Tchilo — foto de perfil estável (sem piscar)
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarFixV2) return;
  window.__tchiloAvatarFixV2 = true;

  var lastCloudUrl = '';
  var painted = {};
  var refreshTimer = null;
  var pulledOnce = false;

  function injectCSS() {
    if (document.getElementById('tchiloAvatarFixCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAvatarFixCSS';
    st.textContent =
      '.profile-avatar{overflow:hidden!important;position:relative;}' +
      '.profile-avatar img.tchilo-av,' +
      '.user-avatar img.tchilo-av,' +
      '.post-avatar img.tchilo-av,' +
      '[class*="avatar"] img.tchilo-av{' +
      'width:100%!important;height:100%!important;' +
      'object-fit:cover!important;border-radius:50%!important;' +
      'display:block!important;position:absolute;inset:0;' +
      'animation:none!important;transition:none!important;}' +
      '.profile-avatar img,.user-avatar img,.post-avatar img{' +
      'animation:none!important;transition:none!important;}';
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

  function resolveUrl(username) {
    if (!username) return null;
    try {
      if (window.__tchiloAvatarCache && window.__tchiloAvatarCache[username]) {
        return window.__tchiloAvatarCache[username];
      }
    } catch (e) {}
    try {
      var session = getSessionSafe();
      if (session && session.username === username && session.avatar) return session.avatar;
    } catch (e) {}
    try {
      if (typeof getProfileExtra === 'function') {
        var extra = getProfileExtra(username);
        if (extra && extra.avatar) return extra.avatar;
      }
    } catch (e) {}
    try {
      if (typeof resolveUserAvatarUrl === 'function') {
        var u = resolveUserAvatarUrl(username);
        if (u) return u;
      }
    } catch (e) {}
    return null;
  }

  function persistLocalAvatar(username, url) {
    if (!username || !url) return;
    if (lastCloudUrl === url && painted[username] === url) return;
    setCache(username, url);
    lastCloudUrl = url;
    try {
      var session = getSessionSafe();
      if (session && session.username === username && session.avatar !== url) {
        session.avatar = url;
        if (typeof setSession === 'function') setSession(session);
        else localStorage.setItem('tchilo_session', JSON.stringify(session));
      }
    } catch (e) {}
    try {
      if (typeof getProfileExtra === 'function' && typeof saveProfileExtra === 'function') {
        var extra = getProfileExtra(username) || {};
        if (extra.avatar !== url) {
          extra.avatar = url;
          saveProfileExtra(username, extra);
        }
      }
    } catch (e) {}
  }

  /** Só altera o DOM se a URL mudou — evita piscar */
  function paintElement(el, url) {
    if (!el || !url) return false;
    var key = el.getAttribute('data-av-key') || '';
    if (!key) {
      key = 'av-' + Math.random().toString(36).slice(2, 8);
      el.setAttribute('data-av-key', key);
    }
    if (el.getAttribute('data-av-url') === url) {
      var img0 = el.querySelector('img.tchilo-av');
      if (img0 && img0.getAttribute('src') === url) return false;
    }

    var img = el.querySelector('img.tchilo-av');
    if (img) {
      if (img.getAttribute('src') === url) {
        el.setAttribute('data-av-url', url);
        return false;
      }
      /* troca src sem destruir o nó (menos flash) */
      img.setAttribute('src', url);
      el.setAttribute('data-av-url', url);
      return true;
    }

    el.style.overflow = 'hidden';
    if (!el.style.position || el.style.position === 'static') el.style.position = 'relative';
    el.textContent = '';
    img = document.createElement('img');
    img.className = 'tchilo-av';
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.style.cssText =
      'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;position:absolute;inset:0;animation:none;transition:none';
    img.onerror = function () {
      img.style.display = 'none';
    };
    img.src = url;
    el.appendChild(img);
    el.setAttribute('data-av-url', url);
    return true;
  }

  function refreshAllAvatars() {
    try {
      var session = getSessionSafe();
      if (!session || !session.username) return;
      var url = resolveUrl(session.username);
      if (!url) return;

      if (painted[session.username] === url) {
        /* Já pintámos esta URL — só preenche nós novos sem avatar */
        document.querySelectorAll('.profile-avatar').forEach(function (el) {
          if (el.getAttribute('data-av-url') !== url) paintElement(el, url);
        });
        return;
      }

      painted[session.username] = url;
      setCache(session.username, url);

      document.querySelectorAll('.profile-avatar').forEach(function (el) {
        paintElement(el, url);
      });

      var box = document.getElementById('editAvatarPreview');
      if (box) paintElement(box, url);

      document.querySelectorAll('.post .post-avatar, .post .user-avatar, .post .avatar').forEach(function (av) {
        var post = av.closest('.post');
        if (!post) return;
        var nameEl = post.querySelector('.user-tap, .post-user b, .post-user');
        var uname = '';
        if (nameEl) {
          uname = (nameEl.getAttribute('data-user') || nameEl.textContent || '')
            .replace(/^@/, '')
            .trim()
            .split(/\s|·/)[0];
        }
        if (uname === session.username) paintElement(av, url);
      });
    } catch (e) {}
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshAllAvatars, 120);
  }

  async function pullAvatarFromCloud() {
    if (pulledOnce && lastCloudUrl) return lastCloudUrl;
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
        var r = await SB.from('profiles').select('avatar_url').eq('id', uid).maybeSingle();
        if (r && r.data && r.data.avatar_url) url = r.data.avatar_url;
      }
      if (!url) {
        var r2 = await SB.from('profiles')
          .select('avatar_url')
          .ilike('username', session.username)
          .maybeSingle();
        if (r2 && r2.data && r2.data.avatar_url) url = r2.data.avatar_url;
      }

      pulledOnce = true;
      if (url) {
        if (url === lastCloudUrl) return url;
        lastCloudUrl = url;
        persistLocalAvatar(session.username, url);
        scheduleRefresh();
        return url;
      }
    } catch (e) {}
    return null;
  }

  function patchApplyAvatar() {
    if (typeof window.applyAvatarToElement !== 'function') return;
    if (window.applyAvatarToElement.__avStable) return;
    var orig = window.applyAvatarToElement;
    window.applyAvatarToElement = function (el, username, initials, bg) {
      var url = resolveUrl(username);
      if (url) {
        paintElement(el, url);
        return;
      }
      return orig.apply(this, arguments);
    };
    window.applyAvatarToElement.__avStable = true;
  }

  function patchSaveProfile() {
    if (typeof window.saveProfile !== 'function') return;
    if (window.saveProfile.__avStable) return;
    var orig = window.saveProfile;
    window.saveProfile = async function () {
      var r = await orig.apply(this, arguments);
      try {
        pulledOnce = false;
        painted = {};
        var session = getSessionSafe();
        if (session && session.avatar) {
          lastCloudUrl = session.avatar;
          persistLocalAvatar(session.username, session.avatar);
        }
        scheduleRefresh();
        setTimeout(function () {
          pullAvatarFromCloud();
        }, 500);
      } catch (e) {}
      return r;
    };
    window.saveProfile.__avStable = true;
  }

  function patchRenderProfile() {
    if (typeof window.renderProfile !== 'function') return;
    if (window.renderProfile.__avStable) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      /* Uma única atualização após o render nativo */
      scheduleRefresh();
      return r;
    };
    window.renderProfile.__avStable = true;
  }

  function boot() {
    injectCSS();
    patchApplyAvatar();
    patchSaveProfile();
    patchRenderProfile();

    /* Local primeiro (sem flash), cloud depois uma vez */
    scheduleRefresh();
    setTimeout(function () {
      pullAvatarFromCloud();
    }, 600);

    setTimeout(function () {
      patchApplyAvatar();
      patchSaveProfile();
      patchRenderProfile();
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
