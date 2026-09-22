/**
 * tchilo-Pop — layout de navegação
 * Fee | SMS no topbar | Reels na barra de baixo (não mensagens)
 */
(function () {
  'use strict';

  var ICON_FEE =
    '<span class="nav-text-icon nav-fee" aria-hidden="true">Fee</span>';

  var ICON_SMS =
    '<span class="nav-sms-text" aria-hidden="true">SMS</span>';

  var SVG_REELS =
    '<svg class="nav-reels-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="2" y="5" width="20" height="14" rx="2.5"/>' +
    '<path d="M7 5V3M12 5V3M17 5V3"/>' +
    '<path d="M10 10.5v5l4.5-2.5L10 10.5z" fill="currentColor" stroke="none"/>' +
    '</svg>';

  function injectNavIconCSS() {
    var st = document.getElementById('tchiloNavIconCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloNavIconCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '.nav-item .nav-text-icon.nav-fee{' +
      'display:inline-flex;align-items:center;justify-content:center;' +
      'width:36px;height:32px;line-height:1;' +
      'font:900 19px Inter,system-ui,sans-serif;' +
      'letter-spacing:-0.04em;color:currentColor;' +
      'user-select:none;-webkit-user-select:none;}' +

      '.nav-sms-text,' +
      '#screen-feed .topbar-icons .icon-btn .nav-sms-text{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'font:900 18px Inter,system-ui,sans-serif!important;' +
      'letter-spacing:0.03em;line-height:1;color:currentColor;' +
      'border:none!important;background:none!important;box-shadow:none!important;' +
      'user-select:none;-webkit-user-select:none;}' +

      '.nav-item .nav-reels-icon{width:26px;height:26px;display:block;}' +

      '#screen-feed .topbar .topbar-icons .icon-btn,' +
      '#screen-feed .topbar-icons .icon-btn,' +
      '.topbar-icons .icon-btn{' +
      'width:auto!important;min-width:0!important;height:auto!important;' +
      'min-height:0!important;' +
      'border:0!important;border-width:0!important;outline:none!important;' +
      'border-radius:0!important;' +
      'background:transparent!important;background-color:transparent!important;' +
      'box-shadow:none!important;-webkit-box-shadow:none!important;' +
      'padding:4px!important;margin:0!important;}' +

      '#screen-feed .topbar-icons .icon-btn svg,' +
      '.topbar-icons .icon-btn svg{' +
      'width:26px!important;height:26px!important;' +
      'stroke-width:2.4!important;}' +

      '#reelsViewer .reels-close,.reels-viewer .reels-close{' +
      'position:absolute!important;top:max(12px, env(safe-area-inset-top, 0px) + 8px)!important;' +
      'left:12px!important;right:auto!important;z-index:20!important;}' +
      '#reelsViewer .reel-follow,.reels-viewer .reel-follow,button.reel-follow{' +
      'position:absolute!important;top:max(14px, env(safe-area-inset-top, 0px) + 10px)!important;' +
      'right:12px!important;left:auto!important;transform:none!important;z-index:19!important;' +
      'margin:0!important;min-width:72px!important;padding:8px 14px!important;' +
      'border:2px solid #fff!important;border-radius:10px!important;' +
      'background:rgba(0,0,0,.45)!important;color:#fff!important;' +
      'font:800 12px Inter,system-ui,sans-serif!important;}';
  }

  function stripIconBtnBox(el) {
    if (!el) return;
    el.style.setProperty('border', 'none', 'important');
    el.style.setProperty('border-width', '0', 'important');
    el.style.setProperty('background', 'transparent', 'important');
    el.style.setProperty('background-color', 'transparent', 'important');
    el.style.setProperty('box-shadow', 'none', 'important');
    el.style.setProperty('border-radius', '0', 'important');
    el.style.setProperty('width', 'auto', 'important');
    el.style.setProperty('height', 'auto', 'important');
    el.style.setProperty('padding', '4px', 'important');
  }

  function setNavIcon(btn, html) {
    if (!btn) return;
    var dot = btn.querySelector('.dot');
    var badge = btn.querySelector('.badge');
    btn.querySelectorAll('svg, .nav-text-icon, .nav-sms-icon, .nav-sms-text, .nav-sms-circle, .nav-reels-icon').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var node = wrap.firstChild;
    if (node) {
      if (badge) btn.insertBefore(node, badge);
      else if (dot) btn.insertBefore(node, dot);
      else btn.insertBefore(node, btn.firstChild);
    }
    if (!btn.querySelector('.dot')) {
      var d = document.createElement('div');
      d.className = 'dot';
      btn.appendChild(d);
    }
  }

  function applyFeedFee() {
    var feedBtn =
      document.querySelector('.navbar .nav-item[data-screen="feed"]') ||
      document.querySelector('.navbar .nav-item[onclick*="onNavFeed"]');
    if (!feedBtn) return;
    if (feedBtn.querySelector('.nav-fee')) return;
    setNavIcon(feedBtn, ICON_FEE);
    feedBtn.setAttribute('aria-label', 'Feed');
  }

  function applySmsIcon(el) {
    if (!el) return;
    stripIconBtnBox(el);
    var old =
      el.querySelector('.nav-sms-circle') ||
      el.querySelector('.nav-sms-icon') ||
      el.querySelector('svg');
    if (el.querySelector('.nav-sms-text') && !el.querySelector('.nav-sms-circle')) return;
    if (old) {
      var wrap = document.createElement('div');
      wrap.innerHTML = ICON_SMS;
      old.replaceWith(wrap.firstChild);
      return;
    }
    if (!el.querySelector('.nav-sms-text')) {
      var w = document.createElement('div');
      w.innerHTML = ICON_SMS;
      el.insertBefore(w.firstChild, el.firstChild);
    }
  }

  function stripAllTopbarBoxes() {
    document.querySelectorAll('#screen-feed .topbar-icons .icon-btn, .topbar-icons .icon-btn').forEach(function (el) {
      stripIconBtnBox(el);
      var svg = el.querySelector('svg');
      if (svg) {
        svg.style.setProperty('width', '26px', 'important');
        svg.style.setProperty('height', '26px', 'important');
      }
    });
  }

  function ensureTopbarMessages() {
    var icons = document.querySelector('#screen-feed .topbar-icons');
    if (!icons) return;
    var btn = icons.querySelector('[data-top-messages]');
    if (!btn) {
      btn = document.createElement('div');
      btn.className = 'icon-btn';
      btn.setAttribute('data-top-messages', '1');
      btn.setAttribute('aria-label', 'Mensagens');
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof goTo === 'function') goTo('messages');
      };
      icons.appendChild(btn);
    }
    applySmsIcon(btn);
    stripAllTopbarBoxes();
  }

  function findMessagesNavSlot() {
    var nav = document.querySelector('.navbar');
    if (!nav) return null;
    return (
      nav.querySelector('.nav-item[data-screen="messages"]') ||
      nav.querySelector('.nav-item[data-screen="reels"]') ||
      nav.querySelector('.nav-item[onclick*="messages"]') ||
      null
    );
  }

  function replaceNavMessagesWithReels() {
    var msgBtn = findMessagesNavSlot();
    if (!msgBtn) return;

    msgBtn.setAttribute('data-screen', 'reels');
    msgBtn.setAttribute('aria-label', 'Reels');
    msgBtn.removeAttribute('onclick');

    msgBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (typeof openReels === 'function') openReels();
        else if (typeof window.openReels === 'function') window.openReels();
        else if (typeof goTo === 'function') goTo('reels');
      } catch (err) {
        console.warn('Tchilo reels nav', err);
      }
    };

    if (!msgBtn.querySelector('.nav-reels-icon')) {
      setNavIcon(msgBtn, SVG_REELS);
    }
  }

  function placeFollowButtons() {
    document
      .querySelectorAll('#reelsViewer .reel-follow, .reels-viewer .reel-follow, button.reel-follow')
      .forEach(function (btn) {
        btn.style.setProperty('position', 'absolute', 'important');
        btn.style.setProperty('top', 'max(14px, calc(env(safe-area-inset-top, 0px) + 10px))', 'important');
        btn.style.setProperty('right', '12px', 'important');
        btn.style.setProperty('left', 'auto', 'important');
        btn.style.setProperty('z-index', '19', 'important');
        btn.style.setProperty('margin', '0', 'important');
      });
  }

  function watchReelsDom() {
    var viewer = document.getElementById('reelsViewer');
    if (!viewer || viewer.__followWatch) return;
    viewer.__followWatch = true;
    try {
      new MutationObserver(function () {
        placeFollowButtons();
      }).observe(viewer, { childList: true, subtree: true });
    } catch (e) {}
  }

  function patchOpenReels() {
    if (typeof window.openReels !== 'function' || window.openReels.__followRight) return;
    var orig = window.openReels;
    window.openReels = function () {
      var r = orig.apply(this, arguments);
      setTimeout(placeFollowButtons, 0);
      setTimeout(placeFollowButtons, 50);
      setTimeout(placeFollowButtons, 200);
      return r;
    };
    window.openReels.__followRight = true;
    if (orig.__fast) window.openReels.__fast = true;
  }

  function loadScriptOnce(src, attr, ver) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + (ver || 'v=1');
    s.defer = true;
    s.setAttribute(attr, '1');
    (document.head || document.documentElement).appendChild(s);
  }

  function loadExtras() {
    loadScriptOnce('native/profile-name-cooldown.js', 'data-tchilo-namecd', 'v=20260922namecd');
    loadScriptOnce('native/tchilo-support.js', 'data-tchilo-support', 'v=20260922support');
    loadScriptOnce('native/tchilo-cookies-policy.js', 'data-tchilo-cookies', 'v=20260922cookies');
  }

  function boot() {
    loadExtras();
    injectNavIconCSS();
    applyFeedFee();
    ensureTopbarMessages();
    stripAllTopbarBoxes();
    replaceNavMessagesWithReels();
    placeFollowButtons();
    watchReelsDom();
    patchOpenReels();
  }

  setInterval(function () {
    applyFeedFee();
    ensureTopbarMessages();
    stripAllTopbarBoxes();
    replaceNavMessagesWithReels();
  }, 800);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 200);
  setTimeout(boot, 600);
  setTimeout(boot, 1500);
})();
