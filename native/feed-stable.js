/** tchilo-Pop loaders */
(function () {
  'use strict';
  function add(src) {
    try {
      var name = src.split('?')[0].split('/').pop();
      if (document.querySelector('script[src*="' + name + '"]')) return;
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      (document.body || document.documentElement).appendChild(s);
    } catch (e) {}
  }
  function load() {
    add('native/tchilo-router.js?v=3');
    add('native/tchilo-profile-share.js?v=2');
    add('native/tchilo-profile-boost.js?v=1');
    add('native/tchilo-ads-ui.js?v=5');
    add('native/tchilo-ads-force.js?v=2');
    add('native/tchilo-ads-pro.js?v=2');
    add('native/tchilo-create-buttons.js?v=3');
    add('native/tchilo-video-pick.js?v=5');
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
