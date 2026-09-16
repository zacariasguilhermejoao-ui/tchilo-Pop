/*
 * Fix nomes no feed sem re-render completo (evita piscar / flash verde).
 */
(function () {
  'use strict';

  var resolving = false;
  var ranOnce = false;

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

  function patchDomNames(posts) {
    if (!Array.isArray(posts)) return;
    var byId = {};
    posts.forEach(function (p) {
      if (p && p.id) byId[String(p.id)] = p;
    });
    document.querySelectorAll('#feedList .post[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id');
      var p = byId[id];
      if (!p) return;
      var name = !isPlaceholderName(p.displayName)
        ? p.displayName
        : !isPlaceholderName(p.username)
          ? p.username
          : null;
      if (!name) return;
      var b = el.querySelector('.post-user .who b');
      if (b && b.textContent !== name) b.textContent = name;
      var capB = el.querySelector('.post-caption > b.user-tap, .post-caption > b');
      if (capB && capB.textContent !== name) capB.textContent = name;
      var span = el.querySelector('.post-user .who span');
      if (span && p.username && !isPlaceholderName(p.username)) {
        var timePart = span.textContent.replace(/^@[^·]*/, '').replace(/^\s*·?\s*/, '');
        var next = '@' + p.username + (timePart ? ' · ' + timePart.replace(/^·\s*/, '') : '');
        // simplify: only replace @user part
        next = span.textContent.replace(/^@\S+/, '@' + p.username);
        if (span.textContent !== next) span.textContent = next;
      }
    });
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
        var id = p && (p.userId || p.user_id);
        if (id) needIds[String(id)] = 1;
      });
      var ids = Object.keys(needIds);
      if (!ids.length) return;

      var profileMap = await fetchProfilesByIds(SB, ids);
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
        // SEM renderFeed completo — só texto no DOM
        patchDomNames(next);
      }
    } catch (err) {
      console.warn('Tchilo feed-names-fix:', err && err.message ? err.message : err);
    } finally {
      resolving = false;
      ranOnce = true;
    }
  }

  function hookFeedLoader() {
    if (typeof window.loadPublicFeedFromSupabase === 'function' && !window.loadPublicFeedFromSupabase.__namesHooked) {
      var orig = window.loadPublicFeedFromSupabase;
      window.loadPublicFeedFromSupabase = async function (force) {
        var result = await orig.apply(this, arguments);
        // Uma só resolução após o cloud (antes eram 2 → 2 re-renders)
        setTimeout(resolveAllFeedNames, 500);
        return result;
      };
      window.loadPublicFeedFromSupabase.__namesHooked = true;
    }
  }

  function boot() {
    hookFeedLoader();
    setTimeout(resolveAllFeedNames, 1200);
    setTimeout(hookFeedLoader, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
