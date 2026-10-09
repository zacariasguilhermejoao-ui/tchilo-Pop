/** tchilo-Pop loaders v63 — app grátis, Premium no site */
(function () {
  'use strict';
  if (window.__TCHILO_FEED_STABLE_V63) return;
  window.__TCHILO_FEED_STABLE_V63 = true;

  function add(src, sync) {
    try {
      var name = src.split('?')[0].split('/').pop();
      var existing = document.querySelector('script[src*="' + name + '"]');
      if (existing) {
        var cur = existing.getAttribute('src') || '';
        if (cur === src) return;
        var oldV = (cur.match(/[?&]v=([^&]+)/) || [])[1];
        var newV = (src.match(/[?&]v=([^&]+)/) || [])[1];
        if (oldV && newV && oldV !== newV) existing.remove();
        else if (cur.split('?')[0].split('/').pop() === name && newV) existing.remove();
        else if (cur.split('?')[0].split('/').pop() === name) return;
      }
      var s = document.createElement('script');
      s.src = src;
      if (!sync) s.async = true;
      (document.body || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  function load() {
    add('native/tchilo-final-css.js?v=3', true);
    add('native/tchilo-store-policy.js?v=1', true);
    add('native/tchilo-nav-icons-lock.js?v=1', true);
    add('native/tchilo-perf-throttle.js?v=1', true);
    add('native/tchilo-logo-restore.js?v=7', true);
    add('native/tchilo-live-bind.js?v=1', true);
    add('native/tchilo-feed-lock.js?v=4', true);
    add('native/feed-noflicker.js?v=5', true);
    add('native/tchilo-ui-stable.js?v=2', true);
    add('native/live-btn-stable.js?v=4', true);
    add('native/tchilo-nav-size-fix.js?v=4', true);
    add('native/tchilo-sheet-swipe.js?v=1', true);

    add('native/tchilo-ui-unlock.js?v=3', true);
    add('native/tchilo-login-session-fix.js?v=9', true);
    add('native/tchilo-hide-nav.js?v=4');
    add('native/tchilo-router.js?v=5');
    add('native/tchilo-header-ui.js?v=5');
    add('native/tchilo-story-pick-fix.js?v=1');
    add('native/tchilo-reels-open-fix.js?v=9');
    add('native/tchilo-feed-video-ui.js?v=3');
    add('native/tchilo-stable-ui.js?v=6');
    add('native/tchilo-settings-icons.js?v=27');
    add('native/tchilo-product-copy.js?v=2');
    add('native/tchilo-legal-links.js?v=1');
    add('native/tchilo-session-lock.js?v=1');
    add('native/tchilo-public-profile-bridge.js?v=1');
    add('native/tchilo-site-url-fix.js?v=1');
    add('native/tchilo-no-busy-select.js?v=1');
    add('native/tchilo-chat-composer.js?v=1');
    add('native/tchilo-password-reset.js?v=6');
    add('native/tchilo-public-urls.js?v=1');
    add('native/tchilo-og-meta.js?v=1');
    add('native/tchilo-avatar-cloud.js?v=4');
    add('native/tchilo-avatar-viewer.js?v=1');
    add('native/tchilo-premium.js?v=3');
    add('native/paddle-premium.js?v=2');
    add('native/paddle-ad-guard.js?v=1');
    add('native/tchilo-theme-premium-gate.js?v=1');
    add('native/tchilo-verified.js?v=5');
    add('native/music-catalog-fix.js?v=1');
    add('native/tchilo-music-picker-fix.js?v=2');
    add('native/tchilo-music-sheet.js?v=1');
    add('native/tchilo-music-feed-fix.js?v=3');
    add('native/tchilo-publish-fix.js?v=5');
    add('native/tchilo-video-pick.js?v=6');
    add('native/tchilo-deeplink.js?v=2');
    add('native/tchilo-profile-share.js?v=11');
    add('native/tchilo-profile-boost.js?v=1');
    add('native/tchilo-ads-ui.js?v=7');
    add('native/tchilo-ads-force.js?v=2');
    add('native/tchilo-ads-pro.js?v=4');
    add('native/tchilo-create-buttons.js?v=5');
    add('native/tchilo-cloud-force.js?v=2');
    add('native/tchilo-name-sync.js?v=1');
    add('native/tchilo-cloud-hydrate.js?v=3');
    add('native/tchilo-feed-to-reels.js?v=2');
    add('native/tchilo-share-target.js?v=1');
    add('native/reels-follow-fix.js?v=3');
    add('native/tchilo-profile-avatar-plus.js?v=5');
    add('native/topbar-border-thin.js?v=2');
    add('native/feed-stories-scroll.js?v=3');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
  setTimeout(load, 1200);
})();
