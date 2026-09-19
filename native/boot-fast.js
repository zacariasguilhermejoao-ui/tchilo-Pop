/**
 * tchilo-Pop — arranque rápido no Android/iOS
 * Mostra posts guardados já no 1º frame; rede actualiza em segundo plano.
 */
(function () {
  'use strict';

  var booted = false;

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
    try {
      if (typeof softRefreshFeed === 'function') softRefreshFeed(false);
      else if (typeof loadPostsFromCloud === 'function') loadPostsFromCloud();
      else if (typeof fetchPosts === 'function') fetchPosts();
      else if (typeof tchiloSyncFeed === 'function') tchiloSyncFeed();
    } catch (e) {}
  }

  function boot() {
    paintNow();
    setTimeout(paintNow, 0);
    setTimeout(paintNow, 50);
    setTimeout(paintNow, 150);
    setTimeout(softNetworkRefresh, 200);
    setTimeout(softNetworkRefresh, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('resume', function () {
    softNetworkRefresh();
  });
})();

;(function(){try{if(!document.querySelector('script[data-tchilo-flash]')){var s=document.createElement('script');s.src='native/cam-flash-svg.js?v=1';s.setAttribute('data-tchilo-flash','1');(document.head||document.documentElement).appendChild(s);}}catch(e){}})();
