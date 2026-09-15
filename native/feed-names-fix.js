/*
 * Fix: no feed, outras pessoas viam "user_xxx" / "Utilizador" em vez do nome real.
 * Este script força a resolução de username + display_name a partir da tabela profiles.
 */
(function () {
  'use strict';

  var resolving = false;

  function isPlaceholderName(name) {
    if (!name) return true;
    var s = String(name);
    if (s.indexOf('user_') === 0) return true;
    if (s === 'Utilizador' || s === 'utilizador' || s === 'User' || s === 'user') return true;
    return false;
  }

  async function fetchProfilesByIds(SB, ids) {
    var map = {};
    if (!ids || !ids.length) return map;
    // batches de 80
    for (var i = 0; i < ids.length; i += 80) {
      var chunk = ids.slice(i, i + 80);
      try {
        var res = await SB.from('profiles')
          .select('id,username,display_name,avatar_url,is_private')
          .in('id', chunk);
        if (res && res.data) {
          res.data.forEach(function (pr) {
            if (pr && pr.id) map[pr.id] = pr;
          });
        }
      } catch (e) {
        console.warn('Tchilo feed-names batch:', e && e.message ? e.message : e);
      }
    }
    return map;
  }

  async function resolveAllFeedNames() {
    if (resolving) return;
    var SB = window.tchiloSupabase || window.SB || null;
    if (!SB) return;
    resolving = true;
    try {
      var posts = [];
      try {
        if (typeof getPosts === 'function') posts = getPosts() || [];
        else {
          var raw = localStorage.getItem('tchilo_posts') || localStorage.getItem('posts');
          posts = raw ? JSON.parse(raw) : [];
        }
      } catch (e) {
        posts = [];
      }
      if (!Array.isArray(posts) || !posts.length) return;

      var needIds = {};
      posts.forEach(function (p) {
        if (!p) return;
        var id = p.userId || p.user_id;
        if (!id) return;
        if (isPlaceholderName(p.username) || isPlaceholderName(p.displayName)) {
          needIds[String(id)] = 1;
        }
      });

      // Também resolver TODOS os userIds do feed (mais fiável)
      posts.forEach(function (p) {
        var id = p && (p.userId || p.user_id);
        if (id) needIds[String(id)] = 1;
      });

      var ids = Object.keys(needIds);
      if (!ids.length) return;

      var profileMap = await fetchProfilesByIds(SB, ids);

      // Fallback: se ainda faltarem e houver sessão, preencher a própria
      try {
        if (typeof getSession === 'function') {
          var session = getSession();
          if (session && session.id && session.username) {
            profileMap[session.id] = profileMap[session.id] || {
              id: session.id,
              username: session.username,
              display_name: session.displayName || session.username,
              avatar_url: session.avatar || null
            };
          }
        }
      } catch (e2) {}

      var changed = false;
      var next = posts.map(function (p) {
        if (!p) return p;
        var id = p.userId || p.user_id;
        if (!id || !profileMap[String(id)]) return p;
        var pr = profileMap[String(id)];
        if (!pr.username) return p;

        var newUsername = pr.username;
        var newDisplay = pr.display_name || pr.username;
        var newAvatar = pr.avatar_url || p.avatar || null;

        if (
          p.username !== newUsername ||
          p.displayName !== newDisplay ||
          (newAvatar && p.avatar !== newAvatar)
        ) {
          changed = true;
          try {
            if (typeof cacheUserProfile === 'function') {
              cacheUserProfile(newUsername, {
                avatar: newAvatar,
                displayName: newDisplay
              });
            }
          } catch (e3) {}
          return Object.assign({}, p, {
            username: newUsername,
            displayName: newDisplay,
            initials: String(newDisplay).slice(0, 2).toUpperCase(),
            avatar: newAvatar,
            userId: id
          });
        }
        return p;
      });

      if (changed) {
        try {
          if (typeof save === 'function' && typeof KEYS !== 'undefined' && KEYS.posts) {
            save(KEYS.posts, next);
          } else {
            localStorage.setItem('tchilo_posts', JSON.stringify(next));
          }
        } catch (e4) {
          try {
            localStorage.setItem('tchilo_posts', JSON.stringify(next));
          } catch (e5) {}
        }
        try {
          if (typeof renderFeed === 'function') {
            var feed = document.getElementById('screen-feed');
            if (feed && feed.classList.contains('active')) renderFeed();
          }
        } catch (e6) {}
        try {
          if (typeof renderProfile === 'function') {
            var prof = document.getElementById('screen-profile');
            if (prof && prof.classList.contains('active')) renderProfile();
          }
        } catch (e7) {}
        console.log('Tchilo: nomes do feed resolvidos a partir de profiles');
      }
    } catch (err) {
      console.warn('Tchilo feed-names-fix:', err && err.message ? err.message : err);
    } finally {
      resolving = false;
    }
  }

  // Correr depois do feed cloud carregar
  function hookFeedLoader() {
    if (typeof window.loadPublicFeedFromSupabase === 'function' && !window.loadPublicFeedFromSupabase.__namesHooked) {
      var orig = window.loadPublicFeedFromSupabase;
      window.loadPublicFeedFromSupabase = async function (force) {
        var result = await orig.apply(this, arguments);
        setTimeout(function () {
          resolveAllFeedNames();
        }, 300);
        setTimeout(function () {
          resolveAllFeedNames();
        }, 1500);
        return result;
      };
      window.loadPublicFeedFromSupabase.__namesHooked = true;
    }
  }

  function boot() {
    hookFeedLoader();
    setTimeout(resolveAllFeedNames, 800);
    setTimeout(resolveAllFeedNames, 2500);
    setTimeout(hookFeedLoader, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
