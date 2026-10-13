/**
 * tchilo-Pop — arranque rápido no Android/iOS
 * Mostra posts guardados já no 1º frame; rede actualiza em segundo plano.
 * v2: só 1 paint + 1 refresh (antes eram 4+2 → colava / reprocessava)
 */
(function () {
  'use strict';
  if (window.__tchiloBootFastV2) return;
  window.__tchiloBootFastV2 = true;

  var booted = false;
  var refreshed = false;

  function readLocalPosts() {
    var keys = ['tchilo_posts', 'tchilo_offline_meta_v1'];
    try {
      if (typeof KEYS !== 'undefined' && KEYS.posts) keys.unshift(KEYS.posts);
    } catch (e) {}

    for (var i = 0; i < keys.length; i++) {
      try {
        var raw = localStorage.getItem(keys[i]);
        if (!raw) continue;
        var data = JSON.parse(raw);
        if (Array.isArray(data) && data.length) return data;
        if (data && Array.isArray(data.posts) && data.posts.length) return data.posts;
      } catch (e2) {}
    }
    return [];
  }

  function paintNow() {
    if (booted) return;
    var posts = [];
    try {
      if (typeof getPosts === 'function') posts = getPosts() || [];
    } catch (e) {}
    if (!posts.length) posts = readLocalPosts();
    if (!posts.length) return;

    booted = true;
    try {
      if (typeof save === 'function' && typeof KEYS !== 'undefined' && KEYS.posts) {
        var cur = [];
        try {
          cur = getPosts() || [];
        } catch (e3) {}
        if (!cur.length) save(KEYS.posts, posts);
      }
    } catch (e4) {}

    try {
      if (typeof renderFeed === 'function') renderFeed(true);
    } catch (e5) {}
    try {
      if (typeof renderStories === 'function') renderStories();
    } catch (e6) {}
  }

  function softNetworkRefresh() {
    if (refreshed) return;
    refreshed = true;
    try {
      if (typeof softRefreshFeed === 'function') softRefreshFeed(false);
      else if (typeof loadPostsFromCloud === 'function') loadPostsFromCloud();
      else if (typeof fetchPosts === 'function') fetchPosts();
      else if (typeof tchiloSyncFeed === 'function') tchiloSyncFeed();
      else if (typeof loadPublicFeedFromSupabase === 'function') {
        loadPublicFeedFromSupabase(!window.__publicFeedLoaded);
      }
    } catch (e) {}
  }

  function boot() {
    paintNow();
    // Uma única tentativa extra se o 1º frame ainda não tinha dados
    setTimeout(function () {
      if (!booted) paintNow();
    }, 80);
    setTimeout(softNetworkRefresh, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('resume', function () {
    refreshed = false;
    softNetworkRefresh();
  });
})();

;(function(){try{if(!document.querySelector('script[data-tchilo-flash]')){var s=document.createElement('script');s.src='native/cam-flash-svg.js?v=1';s.setAttribute('data-tchilo-flash','1');(document.head||document.documentElement).appendChild(s);}}catch(e){}})();

/* Live (Realtime SFU) */
;(function(){try{if(!document.querySelector('script[data-tchilo-live]')){var s=document.createElement('script');s.src='native/tchilo-live.js?v=1';s.setAttribute('data-tchilo-live','1');s.defer=true;(document.head||document.documentElement).appendChild(s);}}catch(e){}})();
