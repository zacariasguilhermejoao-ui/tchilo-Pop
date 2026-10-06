/** tchilo-Pop loaders v24 */
(function () {
  'use strict';
  if (window.__TCHILO_FEED_STABLE_V24) return;
  window.__TCHILO_FEED_STABLE_V24 = true;

  function add(src) {
    try {
      var name = src.split('?')[0].split('/').pop();
      var existing = document.querySelector('script[src*="' + name + '"]');
      if (existing) {
        var cur = existing.getAttribute('src') || '';
        if (cur === src) return;
        var oldV = (cur.match(/[?&]v=([^&]+)/) || [])[1];
        var newV = (src.match(/[?&]v=([^&]+)/) || [])[1];
        if (oldV && newV && oldV !== newV) existing.remove();
        else if (cur.split('?')[0].split('/').pop() === name) return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      (document.body || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  function load() {
    add('native/tchilo-settings-icons.js?v=24');
    add('native/tchilo-product-copy.js?v=2');
    add('native/tchilo-legal-links.js?v=1');
    add('native/tchilo-session-lock.js?v=1');
    add('native/tchilo-public-profile-bridge.js?v=1');
    add('native/tchilo-site-url-fix.js?v=1');
    add('native/tchilo-no-busy-select.js?v=1');
    add('native/tchilo-ui-stable.js?v=1');
    add('native/tchilo-hide-nav.js?v=3');
    add('native/tchilo-chat-composer.js?v=1');
    add('native/tchilo-password-reset.js?v=6');
    add('native/tchilo-router.js?v=3');
    add('native/tchilo-public-urls.js?v=1');
    add('native/tchilo-og-meta.js?v=1');
    add('native/tchilo-avatar-cloud.js?v=4');
    add('native/tchilo-avatar-viewer.js?v=1');
    add('native/tchilo-premium.js?v=1');
    add('native/paddle-premium.js?v=1');
    add('native/paddle-ad-guard.js?v=1');
    add('native/tchilo-theme-premium-gate.js?v=1');
    add('native/tchilo-verified.js?v=2');
    add('native/tchilo-reels-open-fix.js?v=6');
    add('native/tchilo-feed-video-ui.js?v=1');
    add('native/music-catalog-fix.js?v=1');
    add('native/tchilo-music-picker-fix.js?v=1');
    add('native/tchilo-music-sheet.js?v=1');
    add('native/tchilo-music-feed-fix.js?v=3');
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
    add('native/tchilo-feed-to-reels.js?v=2');
    add('native/tchilo-reels-icon.js?v=2');
    add('native/tchilo-share-target.js?v=1');
    add('native/nav-layout.js?v=4');
    add('native/tchilo-feed-icon.js?v=5');
    add('native/tchilo-ui-icons-fix.js?v=6');
    add('native/reels-follow-fix.js?v=2');
    add('native/tchilo-profile-avatar-plus.js?v=1');
    add('native/topbar-border-thin.js?v=2');
    add('native/fee-sms-final.js?v=11');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
  setTimeout(load, 400);
  setTimeout(load, 1200);
})();
