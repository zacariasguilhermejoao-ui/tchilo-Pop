/**
 * Hidratar avatar/stories sem chamar renderProfile em loop (evita + a piscar)
 */
(function () {
  'use strict';
  if (window.__tchiloCloudPersistV3) return;
  window.__tchiloCloudPersistV3 = true;

  function SB() {
    return window.tchiloSupabase || null;
  }

  async function uid() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    var s = SB();
    if (!s) return null;
    try {
      var a = await s.auth.getSession();
      var id =
        a && a.data && a.data.session && a.data.session.user && a.data.session.user.id;
      if (id) window.__tchiloCloudUserId = id;
      return id || null;
    } catch (e) {
      return null;
    }
  }

  async function hydrateFromCloud() {
    var s = SB();
    var id = await uid();
    if (!s || !id) return;

    try {
      var pr = await s
        .from('profiles')
        .select('avatar_url,display_name,username')
        .eq('id', id)
        .maybeSingle();
      var row = pr && pr.data;
      if (row && row.avatar_url && String(row.avatar_url).indexOf('http') === 0) {
        var sess = typeof getSession === 'function' ? getSession() : null;
        if (sess) {
          var prev = sess.avatar;
          sess.avatar = row.avatar_url;
          if (row.display_name) sess.displayName = row.display_name;
          setSession(sess);
          try {
            if (typeof saveProfileExtra === 'function') {
              var extra = getProfileExtra(sess.username) || {};
              extra.avatar = row.avatar_url;
              saveProfileExtra(sess.username, extra);
            }
          } catch (e) {}
          if (prev !== row.avatar_url) {
            var img = document.querySelector('#screen-profile .profile-avatar img');
            if (img) img.src = row.avatar_url;
          }
        }
      }
    } catch (e) {
      console.warn('[hydrate avatar]', e);
    }

    try {
      if (window.tchiloCloud && typeof window.tchiloCloud.loadCloudStories === 'function') {
        await window.tchiloCloud.loadCloudStories();
      }
      if (typeof renderStories === 'function') renderStories();
    } catch (e2) {
      console.warn('[hydrate stories]', e2);
    }
  }

  setTimeout(hydrateFromCloud, 700);
  try {
    var s = SB();
    if (s && s.auth && s.auth.onAuthStateChange) {
      s.auth.onAuthStateChange(function (ev) {
        if (ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION') {
          setTimeout(hydrateFromCloud, 900);
        }
      });
    }
  } catch (e) {}

  window.tchiloHydrateCloud = hydrateFromCloud;
})();
