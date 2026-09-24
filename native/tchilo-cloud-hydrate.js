/**
 * Tchilo — noutro browser: carregar feed + foto de perfil da Supabase
 * (não depende do localStorage vazio do dispositivo anterior)
 */
(function () {
  'use strict';
  if (window.__tchiloCloudHydrate) return;
  window.__tchiloCloudHydrate = true;

  var hydrating = false;
  var lastHydrate = 0;

  function getSB() {
    return window.tchiloSupabase || window.SB || null;
  }

  function getSessionSafe() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  function setCacheAvatar(username, url) {
    if (!username || !url) return;
    try {
      if (!window.__tchiloAvatarCache) window.__tchiloAvatarCache = {};
      window.__tchiloAvatarCache[username] = url;
    } catch (e) {}
    try {
      if (typeof getProfileExtra === 'function' && typeof saveProfileExtra === 'function') {
        var extra = getProfileExtra(username) || {};
        extra.avatar = url;
        saveProfileExtra(username, extra);
      }
    } catch (e) {}
  }

  async function hydrateProfile() {
    var SB = getSB();
    if (!SB) return null;
    var session = getSessionSafe();
    if (!session) return null;

    var uid = session.id || window.__tchiloCloudUserId || null;
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

    var profile = null;
    try {
      if (uid) {
        var r = await SB.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (r && r.data) profile = r.data;
      }
      if (!profile && session.username) {
        var r2 = await SB.from('profiles')
          .select('*')
          .ilike('username', session.username)
          .maybeSingle();
        if (r2 && r2.data) profile = r2.data;
      }
    } catch (e) {
      console.warn('Tchilo hydrate profile', e);
    }

    if (!profile) return null;

    var avatar = profile.avatar_url || null;
    var displayName = profile.display_name || profile.username || session.username;
    var username = profile.username || session.username;

    try {
      var next = Object.assign({}, session, {
        id: profile.id || session.id,
        username: username,
        displayName: displayName,
        avatar: avatar || session.avatar || null,
        privateAccount: !!profile.is_private
      });
      if (typeof setSession === 'function') setSession(next);
      else localStorage.setItem('tchilo_session', JSON.stringify(next));
    } catch (e) {}

    if (avatar) setCacheAvatar(username, avatar);

    try {
      if (typeof renderProfile === 'function') renderProfile();
    } catch (e) {}

    return profile;
  }

  async function hydrateFeed() {
    try {
      if (typeof loadPublicFeedFromSupabase === 'function') {
        /* force = true */
        await loadPublicFeedFromSupabase(true);
        return true;
      }
    } catch (e) {
      console.warn('Tchilo hydrate feed fn', e);
    }

    /* Fallback direto se a função nativa falhar */
    var SB = getSB();
    if (!SB) return false;
    try {
      var res = await SB.from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (res.error) throw res.error;
      var rows = res.data || [];
      if (!rows.length) return false;

      var posts = rows.map(function (r) {
        return {
          id: r.id,
          userId: r.user_id,
          username: r.username || 'user',
          displayName: r.display_name || r.username || 'user',
          avatar: r.avatar_url || null,
          caption: r.caption || '',
          media: r.media_url || r.media || null,
          mediaType: r.media_type || r.mediaType || 'image',
          thumbnail: r.thumbnail_url || r.thumbnail || null,
          createdAt: r.created_at,
          likes: r.likes_count || r.likes || 0,
          music: r.music || null,
          musicMeta: r.music_meta || r.musicMeta || null
        };
      });

      try {
        if (typeof save === 'function' && typeof KEYS !== 'undefined') {
          save(KEYS.posts, posts);
        } else {
          localStorage.setItem('tchilo_posts', JSON.stringify(posts));
        }
      } catch (e) {}

      try {
        if (typeof renderFeed === 'function') renderFeed();
      } catch (e) {}
      return true;
    } catch (e) {
      console.warn('Tchilo hydrate feed fallback', e);
      return false;
    }
  }

  async function hydrateAll(reason) {
    if (hydrating) return;
    var now = Date.now();
    if (now - lastHydrate < 2500 && reason !== 'force') return;
    hydrating = true;
    lastHydrate = now;
    try {
      /* recovery: não hidratar para a app */
      if (window.__tchiloPasswordRecoveryActive) return;

      var session = getSessionSafe();
      if (!session || !session.username) return;

      await hydrateProfile();
      await hydrateFeed();

      try {
        if (typeof renderFeed === 'function') renderFeed();
      } catch (e) {}
      try {
        if (typeof renderProfile === 'function') renderProfile();
      } catch (e) {}
    } finally {
      hydrating = false;
    }
  }

  function patchLogin() {
    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__hydrate) {
      var orig = window.hideLoginGate;
      window.hideLoginGate = function () {
        var r = orig.apply(this, arguments);
        setTimeout(function () {
          hydrateAll('login');
        }, 200);
        setTimeout(function () {
          hydrateAll('login-retry');
        }, 1500);
        return r;
      };
      window.hideLoginGate.__hydrate = true;
    }

    if (typeof window.tchiloSyncAuthSession === 'function' && !window.tchiloSyncAuthSession.__hydrate) {
      var origS = window.tchiloSyncAuthSession;
      window.tchiloSyncAuthSession = async function () {
        var r = await origS.apply(this, arguments);
        setTimeout(function () {
          hydrateAll('sync');
        }, 300);
        return r;
      };
      window.tchiloSyncAuthSession.__hydrate = true;
    }

    if (typeof window.goTo === 'function' && !window.goTo.__hydrate) {
      var origG = window.goTo;
      window.goTo = function (name) {
        var r = origG.apply(this, arguments);
        if (name === 'feed' || name === 'profile') {
          setTimeout(function () {
            hydrateAll(name);
          }, 100);
        }
        return r;
      };
      window.goTo.__hydrate = true;
    }
  }

  function boot() {
    patchLogin();
    setTimeout(function () {
      patchLogin();
      hydrateAll('boot');
    }, 800);
    setTimeout(function () {
      hydrateAll('boot2');
    }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.tchiloHydrateCloud = function () {
    return hydrateAll('force');
  };
})();
