/**
 * Tchilo — nome de perfil sempre na Supabase (profiles + posts)
 * para aparecer nos outros telemóveis
 */
(function () {
  'use strict';
  if (window.__tchiloNameSyncV1) return;
  window.__tchiloNameSyncV1 = true;

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

  async function resolveUid(SB, session) {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    try {
      var auth = await SB.auth.getSession();
      var uid =
        auth &&
        auth.data &&
        auth.data.session &&
        auth.data.session.user &&
        auth.data.session.user.id;
      if (uid) {
        window.__tchiloCloudUserId = uid;
        return uid;
      }
    } catch (e) {}
    if (session && session.id && String(session.id).length > 20) return session.id;
    return null;
  }

  /**
   * Grava display_name em profiles e em todos os posts do utilizador
   */
  window.tchiloSyncDisplayName = async function (displayName) {
    var SB = getSB();
    var session = getSessionSafe();
    if (!session || !session.username) throw new Error('Sem sessão');
    var name = String(displayName || '').trim() || session.username;

    /* local */
    try {
      session.displayName = name;
      if (typeof setSession === 'function') setSession(session);
      else localStorage.setItem('tchilo_session', JSON.stringify(session));
    } catch (e) {}
    try {
      if (typeof getProfileExtra === 'function' && typeof saveProfileExtra === 'function') {
        var extra = getProfileExtra(session.username) || {};
        extra.displayName = name;
        saveProfileExtra(session.username, extra);
      }
    } catch (e) {}
    try {
      if (!window.__tchiloNameCache) window.__tchiloNameCache = {};
      window.__tchiloNameCache[session.username] = name;
    } catch (e) {}

    if (!SB) return name;

    var uid = await resolveUid(SB, session);
    if (!uid) throw new Error('Sem ID cloud — inicia sessão de novo');

    var up = await SB.from('profiles').upsert(
      {
        id: uid,
        username: session.username,
        display_name: name,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );
    if (up.error) {
      var up2 = await SB.from('profiles').update({ display_name: name }).eq('id', uid);
      if (up2.error) console.warn('profiles name', up2.error);
    }

    /* posts.display_name — para o feed público sem join de profiles */
    try {
      var pr = await SB.from('posts').update({ display_name: name }).eq('user_id', uid);
      if (pr.error) {
        /* coluna pode não existir — tenta só username nos posts locais */
        console.warn('posts.display_name', pr.error);
      }
    } catch (e) {}

    /* cache local dos posts */
    try {
      if (typeof getPosts === 'function' && typeof save === 'function' && typeof KEYS !== 'undefined') {
        var posts = getPosts() || [];
        posts.forEach(function (p) {
          if (p && p.username === session.username) {
            p.displayName = name;
            p.display_name = name;
          }
        });
        save(KEYS.posts, posts);
      }
    } catch (e) {}

    try {
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e) {}
    try {
      if (typeof renderProfile === 'function') renderProfile();
    } catch (e) {}

    return name;
  };

  /* Interceptar saveProfile para garantir sync cloud do nome */
  function patchSaveProfile() {
    if (typeof window.saveProfile !== 'function' || window.saveProfile.__nameSync) return;
    var orig = window.saveProfile;
    window.saveProfile = async function () {
      var r = await orig.apply(this, arguments);
      try {
        var el = document.getElementById('editDisplayName');
        var name = el && el.value ? el.value.trim() : '';
        if (name) await window.tchiloSyncDisplayName(name);
      } catch (e) {
        console.warn('name sync after save', e);
      }
      return r;
    };
    window.saveProfile.__nameSync = true;
  }

  /* No feed: preferir display_name da cloud */
  function patchResolveName() {
    if (typeof window.resolveDisplayName === 'function' && !window.resolveDisplayName.__nameSync) {
      var orig = window.resolveDisplayName;
      window.resolveDisplayName = function (username) {
        try {
          if (window.__tchiloNameCache && window.__tchiloNameCache[username]) {
            return window.__tchiloNameCache[username];
          }
        } catch (e) {}
        return orig.apply(this, arguments);
      };
      window.resolveDisplayName.__nameSync = true;
    }
  }

  function boot() {
    patchSaveProfile();
    patchResolveName();
  }
  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
})();
