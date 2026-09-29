/** tchilo-Pop loaders */
(function () {
  'use strict';
  function add(src) {
    try {
      var name = src.split('?')[0].split('/').pop();
      var existing = document.querySelector('script[src*="' + name + '"]');
      if (existing) {
        var cur = existing.getAttribute('src') || '';
        if (name.indexOf('publish-fix') >= 0 && cur.indexOf('v=2') < 0) {
          existing.remove();
        } else if (name.indexOf('video-pick') >= 0 && cur.indexOf('v=6') < 0) {
          existing.remove();
        } else if (cur === src) {
          return;
        } else if (cur.split('?')[0].split('/').pop() === name) {
          /* same file different query — replace if version bumped */
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
    add('native/tchilo-publish-fix.js?v=2');
    add('native/tchilo-video-pick.js?v=6');
    add('native/tchilo-deeplink.js?v=1');
    add('native/tchilo-password-reset.js?v=4');
    add('native/tchilo-router.js?v=3');
    add('native/tchilo-profile-share.js?v=4');
    add('native/tchilo-profile-boost.js?v=1');
    add('native/tchilo-ads-ui.js?v=5');
    add('native/tchilo-ads-force.js?v=2');
    add('native/tchilo-ads-pro.js?v=2');
    add('native/tchilo-create-buttons.js?v=3');
    add('native/tchilo-cloud-force.js?v=1');
    add('native/tchilo-name-sync.js?v=1');
    add('native/tchilo-cloud-hydrate.js?v=3');
    add('native/tchilo-hide-nav.js?v=2');
    add('native/tchilo-feed-to-reels.js?v=2');
    add('native/tchilo-reels-icon.js?v=2');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
  setTimeout(load, 400);
  setTimeout(load, 1200);
})();
