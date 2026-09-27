/** tchilo-Pop — loaders */
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
  function loadExtras() {
    add('native/tchilo-video-pick.js?v=5');
    add('native/tchilo-cloud-force.js?v=1');
    add('native/tchilo-gallery-force.js?v=3');
    add('native/tchilo-name-sync.js?v=1');
    add('native/tchilo-avatar-cloud.js?v=1');
    add('native/tchilo-ui-icons-fix.js?v=2');
    add('native/tchilo-login-click-fix.js?v=2');
    add('native/tchilo-hide-progress.js?v=4');
    add('native/tchilo-cloud-hydrate.js?v=3');
    add('native/tchilo-hide-nav.js?v=2');
    add('native/tchilo-feed-to-reels.js?v=2');
    add('native/tchilo-reels-icon.js?v=2');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadExtras);
  else loadExtras();
  setTimeout(loadExtras, 400);
  setTimeout(loadExtras, 1200);
})();
