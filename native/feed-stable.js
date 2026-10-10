/** tchilo-Pop loaders v92 — perfil escondido fora de .active */
(function () {
  'use strict';
  if (window.__TCHILO_FEED_STABLE_V92) return;
  window.__TCHILO_FEED_STABLE_V92 = true;
  window.__TCHILO_FEED_STABLE_V91 = true;
  window.__TCHILO_FEED_STABLE_V90 = true;

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

  function addMany(list) {
    for (var i = 0; i < list.length; i++) add(list[i]);
  }

  function loadCritical() {
    add('native/tchilo-perf-throttle.js?v=1', true);
    add('native/tchilo-perf-boost.js?v=1', true);
    add('native/tchilo-click-sounds.js?v=1', true);
    add('native/tchilo-final-css.js?v=4', true);
    add('native/tchilo-modal-ui.js?v=2', true);
    add('native/tchilo-store-policy.js?v=2', true);
    add('native/tchilo-nav-icons-lock.js?v=1', true);
    add('native/tchilo-logo-restore.js?v=10', true);
    add('native/tchilo-feed-lock.js?v=4', true);
    add('native/feed-noflicker.js?v=5', true);
    add('native/tchilo-ui-stable.js?v=2', true);
    add('native/tchilo-nav-size-fix.js?v=4', true);
    add('native/tchilo-sheet-swipe.js?v=2', true);
    add('native/tchilo-ptr-fix.js?v=1', true);
    add('native/topbar-border-thin.js?v=3', true);
    add('native/tchilo-ui-unlock.js?v=3', true);
    add('native/tchilo-login-session-fix.js?v=9', true);
    add('native/tchilo-hide-nav.js?v=4');
    add('native/tchilo-router.js?v=5');
    add('native/tchilo-header-ui.js?v=5');
    add('native/tchilo-session-lock.js?v=1');
  }

  function loadFeedLayer() {
    addMany([
      'native/tchilo-live-lobby.js?v=1',
      'native/tchilo-live-bind.js?v=3',
      'native/live-btn-stable.js?v=4',
      'native/tchilo-profile-live.js?v=1',
      'native/tchilo-story-pick-fix.js?v=1',
      'native/tchilo-reels-open-fix.js?v=9',
      'native/tchilo-feed-video-ui.js?v=3',
      'native/tchilo-stable-ui.js?v=6',
      'native/tchilo-gift-notifs.js?v=1',
      'native/tchilo-gifts.js?v=7',
      'native/tchilo-cloud-force.js?v=2',
      'native/tchilo-cloud-hydrate.js?v=3',
      'native/tchilo-avatar-cloud.js?v=4',
      'native/feed-stories-scroll.js?v=3',
      'native/tchilo-music-stop.js?v=2',
      'native/tchilo-music-feed-fix.js?v=3',
      'native/tchilo-menu-clean.js?v=1',
      'native/tchilo-chat-ui-clean.js?v=6',
      'native/tchilo-chat-attach.js?v=4',
      'native/tchilo-chat-msg-actions.js?v=2',
      'native/tchilo-chat-supabase.js?v=1',
      'native/tchilo-chat-nav.js?v=1',
      'native/tchilo-profile-scroll.js?v=3'
    ]);
  }

  function loadSecondary() {
    addMany([
      'native/tchilo-settings-icons.js?v=27',
      'native/tchilo-product-copy.js?v=2',
      'native/tchilo-legal-links.js?v=1',
      'native/tchilo-public-profile-bridge.js?v=1',
      'native/tchilo-site-url-fix.js?v=1',
      'native/tchilo-no-busy-select.js?v=1',
      'native/tchilo-chat-composer.js?v=1',
      'native/tchilo-password-reset.js?v=6',
      'native/tchilo-public-urls.js?v=1',
      'native/tchilo-og-meta.js?v=1',
      'native/tchilo-avatar-viewer.js?v=1',
      'native/tchilo-premium.js?v=3',
      'native/paddle-premium.js?v=2',
      'native/paddle-ad-guard.js?v=1',
      'native/tchilo-theme-premium-gate.js?v=1',
      'native/tchilo-verified.js?v=5',
      'native/tchilo-saldo.js?v=2',
      'native/tchilo-saldo-menu.js?v=1',
      'native/music-catalog-fix.js?v=1',
      'native/tchilo-music-picker-fix.js?v=2',
      'native/tchilo-music-sheet.js?v=1',
      'native/tchilo-publish-fix.js?v=5',
      'native/tchilo-video-pick.js?v=6',
      'native/tchilo-deeplink.js?v=2',
      'native/tchilo-profile-share.js?v=11',
      'native/tchilo-profile-boost.js?v=2',
      'native/tchilo-create-buttons.js?v=5',
      'native/tchilo-name-sync.js?v=1',
      'native/tchilo-feed-to-reels.js?v=2',
      'native/tchilo-share-target.js?v=1',
      'native/reels-follow-fix.js?v=3',
      'native/tchilo-profile-avatar-plus.js?v=5'
    ]);
  }

  function loadAds() {
    addMany([
      'native/tchilo-ads-ui.js?v=7',
      'native/tchilo-ads-force.js?v=2',
      'native/tchilo-ads-pro.js?v=4'
    ]);
  }

  function whenIdle(fn, fallbackMs) {
    try {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(function () {
          fn();
        }, { timeout: fallbackMs || 2500 });
        return;
      }
    } catch (e) {}
    setTimeout(fn, fallbackMs || 1200);
  }

  function load() {
    loadCritical();
    setTimeout(loadFeedLayer, 180);
    whenIdle(loadSecondary, 1500);
    whenIdle(loadAds, 3500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
