/**
 * Tchilo — navbar 0.5px + headers limpos
 * v5 — força a linha acima dos ícones (feed/reels/…) a 0.5px
 */
(function () {
  'use strict';
  if (window.__tchiloTopbarBorderV5) return;
  window.__tchiloTopbarBorderV5 = true;
  window.__tchiloTopbarBorderV4 = true;

  function inject() {
    var st = document.getElementById('tchiloTopbarBorderThinCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloTopbarBorderThinCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.topbar, #screen-feed .topbar, .screen-header,' +
      '#screen-profile .screen-header, #screen-settings .screen-header,' +
      '#screen-messages .screen-header, [id^="screen-"] .screen-header,' +
      '.chat-header{' +
      'border-bottom:none!important;border-bottom-width:0!important;' +
      'border-top:none!important;box-shadow:none!important;}' +
      /* risco que separa o feed dos ícones — 0.5px */
      'html body .navbar,' +
      'html body nav.navbar,' +
      'html body #appFrame .navbar,' +
      'html body .app .navbar,' +
      'html body footer.navbar,' +
      'html body .bottom-nav{' +
      'border-top-width:0.5px!important;' +
      'border-top-style:solid!important;' +
      'border-top-color:var(--line, rgba(11,11,12,.14))!important;' +
      'border-bottom-width:0!important;' +
      'box-shadow:none!important;}' +
      '.story-card, .story-card.unseen, .story-card.seen, .story-card-create{' +
      'border-width:0.5px!important;border-style:solid!important;' +
      'border-color:rgba(11,11,12,.14)!important;box-shadow:none!important;}' +
      '.story-card.unseen{' +
      'box-shadow:0 0 0 0.5px var(--violet, #9B6BFF)!important;' +
      'border-color:transparent!important;}' +
      '.story-card-avatar, .story-ring, .stories .avatar, .story-item .avatar{' +
      'border-width:0.5px!important;}' +
      '.post, #feedList .post, #screen-feed .post{' +
      'border-bottom-width:0.5px!important;border-bottom-style:solid!important;}' +
      '.post-media, #feedList .post-media, #screen-feed .post-media, .post .post-media{' +
      'border-width:0.5px!important;border-style:solid!important;' +
      'border-color:var(--ink, #0B0B0C)!important;}';
  }

  function force() {
    try {
      document.querySelectorAll('.navbar, nav.navbar, .bottom-nav').forEach(function (nav) {
        nav.style.setProperty('border-top-width', '0.5px', 'important');
        nav.style.setProperty('border-top-style', 'solid', 'important');
        nav.style.setProperty('border-bottom-width', '0', 'important');
        nav.style.setProperty('box-shadow', 'none', 'important');
      });
    } catch (e) {}
  }

  inject();
  force();
  [100, 500, 1500, 3000].forEach(function (ms) {
    setTimeout(function () {
      inject();
      force();
    }, ms);
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      inject();
      force();
    });
  }
})();
