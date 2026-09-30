/** tchilo-Pop loaders */
(function () {
  'use strict';
  function add(src) {
    try {
      var name = src.split('?')[0].split('/').pop();
      var existing = document.querySelector('script[src*="' + name + '"]');
      if (existing) {
        var cur = existing.getAttribute('src') || '';
        if (name.indexOf('reels-open-fix') >= 0 && cur.indexOf('v=2') < 0) existing.remove();
        else if (name.indexOf('music-feed-fix') >= 0 && cur.indexOf('v=1') < 0) existing.remove();
        else if (name.indexOf('avatar-cloud') >= 0 && cur.indexOf('v=2') < 0) existing.remove();
        else if (cur === src) return;
        else if (cur.split('?')[0].split('/').pop() === name) {
          var oldV = (cur.match(/[?&]v=([^&]+)/) || [])[1];
          var newV = (src.match(/[?&]v=([^&]+)/) || [])[1];
          if (oldV && newV && oldV !== newV) existing.remove();
          else return;
        } else return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      (document.body || document.documentElement).appendChild(s);
    } catch (e) {}
  }
  function load() {
    add('native/tchilo-site-url-fix.js?v=1');
    add('native/tchilo-password-reset.js?v=6');
    add('native/tchilo-router.js?v=3');
    add('native/tchilo-public-urls.js?v=1');
    add('native/tchilo-og-meta.js?v=1');
    add('native/tchilo-avatar-cloud.js?v=2');
    add('native/tchilo-reels-open-fix.js?v=2');
    add('native/music-catalog-fix.js?v=1');
    add('native/tchilo-music-picker-fix.js?v=1');
    add('native/tchilo-music-sheet.js?v=1');
    add('native/tchilo-music-feed-fix.js?v=1');
    add('native/tchilo-publish-fix.js?v=5');
    add('native/tchilo-video-pick.js?v=6');
    add('native/tchilo-deeplink.js?v=2');
    add('native/tchilo-profile-share.js?v=10');
    add('native/tchilo-profile-boost.js?v=1');
    add('native/tchilo-ads-ui.js?v=5');
    add('native/tchilo-ads-force.js?v=2');
    add('native/tchilo-ads-pro.js?v=2');
    add('native/tchilo-create-buttons.js?v=4');
    add('native/tchilo-cloud-force.js?v=1');
    add('native/tchilo-name-sync.js?v=1');
    add('native/tchilo-cloud-hydrate.js?v=3');
    add('native/tchilo-hide-nav.js?v=2');
    add('native/tchilo-feed-to-reels.js?v=2');
    add('native/tchilo-reels-icon.js?v=2');
    add('native/tchilo-share-target.js?v=1');
    add('native/nav-layout.js?v=2');
    add('native/tchilo-ui-icons-fix.js?v=3');
    add('native/reels-follow-fix.js?v=2');
    add('native/tchilo-profile-avatar-plus.js?v=1');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
  setTimeout(load, 400);
  setTimeout(load, 1200);
})();
