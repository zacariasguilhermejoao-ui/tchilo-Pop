/** tchilo-Pop loaders — no login: NÃO carregar scripts pesados (telemóvel não cola) */
(function () {
  'use strict';
  if (window.__TCHILO_FEED_STABLE_V101) return;
  window.__TCHILO_FEED_STABLE_V101 = true;

  function hasSession() {
    try {
      var s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return !!(s && (s.id || s.username || s.email));
    } catch (e) {
      return false;
    }
  }

  function loginGateOpen() {
    try {
      var g = document.getElementById('loginGate');
      if (!g) return !hasSession();
      var st = window.getComputedStyle(g);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      if (g.classList.contains('hidden')) return false;
      return true;
    } catch (e) {
      return !hasSession();
    }
  }

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
    add('native/tchilo-perf-throttle.js?v=1');
    add('native/tchilo-perf-boost.js?v=1');
    add('native/tchilo-final-css.js?v=4');
    add('native/tchilo-ui-unlock.js?v=3');
    add('native/tchilo-router.js?v=5');
    add('native/tchilo-header-ui.js?v=5');
    add('native/tchilo-session-lock.js?v=1');
    add('native/tchilo-hide-nav.js?v=4');
    add('native/tchilo-feed-lock.js?v=4');
    add('native/feed-noflicker.js?v=5');
    add('native/tchilo-ui-stable.js?v=2');
    add('native/tchilo-nav-size-fix.js?v=4');
    add('native/tchilo-navbar-hairline.js?v=1');
    add('native/topbar-border-thin.js?v=5');
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
      'native/tchilo-settings-icons.js?v=29',
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
      'native/tchilo-play-billing.js?v=1',
      'native/tchilo-saldo-play.js?v=1',
      'native/tchilo-saldo-menu.js?v=1',
      'native/music-catalog-fix.js?v=1',
      'native/tchilo-music-picker-fix.js?v=2',
      'native/tchilo-music-sheet.js?v=1',
      'native/tchilo-publish-fix.js?v=5',
      'native/tchilo-video-pick.js?v=6',
      'native/tchilo-deeplink.js?v=2',
      'native/tchilo-profile-share.js?v=12',
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
        requestIdleCallback(function () { fn(); }, { timeout: fallbackMs || 2500 });
        return;
      }
    } catch (e) {}
    setTimeout(fn, fallbackMs || 1200);
  }

  var started = false;
  function loadApp() {
    if (started) return;
    started = true;
    loadCritical();
    setTimeout(loadFeedLayer, 200);
    whenIdle(loadSecondary, 1500);
    whenIdle(loadAds, 3500);
    console.log('[Tchilo] feed-stable: scripts da app após login');
  }

  function tryStart() {
    if (hasSession() && !loginGateOpen()) {
      loadApp();
      return true;
    }
    return false;
  }

  // No ecrã de login: não carregar nada daqui (index + legal-navbar bastam)
  if (!tryStart()) {
    console.log('[Tchilo] feed-stable: à espera do login (sem scripts pesados)');
    var t = setInterval(function () {
      if (tryStart()) clearInterval(t);
    }, 400);
    setTimeout(function () {
      clearInterval(t);
      if (!started && hasSession()) loadApp();
    }, 120000);
    try {
      var obs = new MutationObserver(function () {
        if (tryStart()) obs.disconnect();
      });
      if (document.body) obs.observe(document.body, { attributes: true, childList: true, subtree: true });
    } catch (e) {}
  }
})();
