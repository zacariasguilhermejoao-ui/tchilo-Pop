/**
 * tchilo-Pop — anti-flicker do feed + loaders
 */
(function () {
  'use strict';

  function add(src) {
    try {
      if (document.querySelector('script[src="' + src.split('?')[0] + '"]')) return;
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      (document.body || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  function loadExtras() {
    add('native/tchilo-password-reset.js?v=2');
    add('native/tchilo-cloud-hydrate.js?v=3');
    add('native/tchilo-feed-lock.js?v=2');
    add('native/tchilo-router.js?v=2');
    add('native/tchilo-app-fix.js?v=2');
    add('native/tchilo-offline.js?v=2');
    add('native/tchilo-push.js?v=2');
    add('native/tchilo-push-wire.js?v=2');
    add('native/tchilo-video-fix.js?v=2');
    add('native/tchilo-reels-sound.js?v=2');
    add('native/tchilo-thumb-upload.js?v=2');
    add('native/tchilo-avatar-fix.js?v=3');
    add('native/tchilo-profile-photos.js?v=3');
    add('native/tchilo-avatar-add.js?v=3');
    add('native/tchilo-av-plus-out.js?v=2');
    add('native/tchilo-hide-nav.js?v=2');
    add('native/tchilo-feed-to-reels.js?v=2');
    add('native/tchilo-reels-icon.js?v=2');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExtras);
  } else {
    loadExtras();
  }
  setTimeout(loadExtras, 500);
})();
