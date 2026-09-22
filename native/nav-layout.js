/**
 * tchilo-Pop — layout de navegação
 * Feed = Fee | Mensagens = SMS (só texto) | Lupa sem moldura | Reels na barra
 */
(function () {
  'use strict';

  var ICON_FEE =
    '<span class="nav-text-icon nav-fee" aria-hidden="true">Fee</span>';

  var ICON_SMS =
    '<span class="nav-sms-text" aria-hidden="true">SMS</span>';

  var SVG_REELS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
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
      '.nav-item.active .nav-text-icon.nav-fee{font-weight:900;}' +

      /* SMS só texto, maior, sem círculo */
      '.nav-sms-text{' +
      'display:inline-flex;align-items:center;justify-content:center;' +
      'font:900 15px Inter,system-ui,sans-serif;' +
      'letter-spacing:0.02em;line-height:1;color:currentColor;' +
      'user-select:none;-webkit-user-select:none;}' +
      '.icon-btn .nav-sms-text{font-size:15px;}' +

      /* Topbar: sem caixa/círculo — só o ícone */
      '#screen-feed .topbar-icons .icon-btn{' +
      'width:auto!important;min-width:28px;height:36px!important;' +
      'border:none!important;border-radius:0!important;' +
      'background:transparent!important;box-shadow:none!important;' +
      'padding:0 2px!important;}' +
      '#screen-feed .topbar-icons .icon-btn svg{' +
      'width:22px!important;height:22px!important;}' +

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

  function setNavIcon(btn, html) {
    if (!btn) return;
    var dot = btn.querySelector('.dot');
    var badge = btn.querySelector('.badge');
    btn.querySelectorAll('svg, .nav-text-icon, .nav-sms-icon, .nav-sms-text, .nav-sms-circle').forEach(function (n) {
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
    /* substitui versão antiga com círculo */
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
  }

  function replaceNavMessagesWithReels() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    var msgBtn =
      nav.querySelector('.nav-item[data-screen="messages"]') ||
      nav.querySelector('.nav-item[data-screen="reels"]');
    if (!msgBtn) return;
    msgBtn.setAttribute('data-screen', 'reels');
    msgBtn.setAttribute('aria-label', 'Reels');
    msgBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (typeof openReels === 'function') openReels();
      } catch (err) {
        console.warn('Tchilo reels nav', err);
      }
    };
    if (!msgBtn.querySelector('svg rect')) {
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

  function boot() {
    injectNavIconCSS();
    applyFeedFee();
    ensureTopbarMessages();
    replaceNavMessagesWithReels();
    placeFollowButtons();
    watchReelsDom();
    patchOpenReels();
  }

  setInterval(function () {
    applyFeedFee();
    ensureTopbarMessages();
  }, 1500);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
