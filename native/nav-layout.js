/**
 * tchilo-Pop — layout de navegação
 * - Mensagens no topo (ao lado da lupa)
 * - Reels na barra de baixo com ícone de vídeo
 * - Seguir no canto superior DIREITO (longe do X)
 */
(function () {
  'use strict';

  var SVG_MSG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/>' +
    '</svg>';

  var SVG_REELS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="2" y="5" width="20" height="14" rx="2.5"/>' +
    '<path d="M7 5V3M12 5V3M17 5V3"/>' +
    '<path d="M10 10.5v5l4.5-2.5L10 10.5z" fill="currentColor" stroke="none"/>' +
    '</svg>';

  function injectReelsCSS() {
    var st = document.getElementById('tchiloReelsLayoutCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloReelsLayoutCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#reelsViewer .reels-close,' +
      '.reels-viewer .reels-close{' +
      'position:absolute!important;' +
      'top:max(12px, env(safe-area-inset-top, 0px) + 8px)!important;' +
      'left:12px!important;' +
      'right:auto!important;' +
      'z-index:20!important;}' +
      '#reelsViewer .reel-follow,' +
      '.reels-viewer .reel-follow,' +
      '.reel-slide > .reel-follow,' +
      'button.reel-follow{' +
      'position:absolute!important;' +
      'top:max(14px, env(safe-area-inset-top, 0px) + 10px)!important;' +
      'right:12px!important;' +
      'left:auto!important;' +
      'transform:none!important;' +
      'z-index:19!important;' +
      'margin:0!important;' +
      'min-width:72px!important;' +
      'padding:8px 14px!important;' +
      'border:2px solid #fff!important;' +
      'border-radius:10px!important;' +
      'background:rgba(0,0,0,.45)!important;' +
      'color:#fff!important;' +
      'font:800 12px Inter,system-ui,sans-serif!important;' +
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
      '#reelsViewer .duet-label,.reels-viewer .duet-label{' +
      'top:58px!important;right:12px!important;left:auto!important;}';
  }

  function placeFollowButtons() {
    document.querySelectorAll('#reelsViewer .reel-follow, .reels-viewer .reel-follow, button.reel-follow').forEach(function (btn) {
      btn.style.setProperty('position', 'absolute', 'important');
      btn.style.setProperty('top', 'max(14px, calc(env(safe-area-inset-top, 0px) + 10px))', 'important');
      btn.style.setProperty('right', '12px', 'important');
      btn.style.setProperty('left', 'auto', 'important');
      btn.style.setProperty('z-index', '19', 'important');
      btn.style.setProperty('margin', '0', 'important');
    });
    var close = document.querySelector('#reelsViewer .reels-close, .reels-viewer .reels-close');
    if (close) {
      close.style.setProperty('left', '12px', 'important');
      close.style.setProperty('right', 'auto', 'important');
      close.style.setProperty('z-index', '20', 'important');
    }
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

  function ensureTopbarMessages() {
    var icons = document.querySelector('#screen-feed .topbar-icons');
    if (!icons) return;
    if (icons.querySelector('[data-top-messages]')) return;

    var btn = document.createElement('div');
    btn.className = 'icon-btn';
    btn.setAttribute('data-top-messages', '1');
    btn.setAttribute('aria-label', 'Mensagens');
    btn.innerHTML = SVG_MSG;
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof goTo === 'function') goTo('messages');
    };
    icons.appendChild(btn);
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

    var svg = msgBtn.querySelector('svg');
    var wrap = document.createElement('div');
    wrap.innerHTML = SVG_REELS;
    var next = wrap.firstChild;
    if (svg && next) svg.replaceWith(next);
    else if (next) {
      var dot = msgBtn.querySelector('.dot');
      msgBtn.innerHTML = '';
      msgBtn.appendChild(next);
      if (dot) msgBtn.appendChild(dot);
      else {
        var d = document.createElement('div');
        d.className = 'dot';
        msgBtn.appendChild(d);
      }
    }
  }

  function patchOpenReels() {
    if (typeof window.openReels !== 'function' || window.openReels.__followRight) return;
    var orig = window.openReels;
    // se já tem __fast do reels-fast, empilha
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
    injectReelsCSS();
    placeFollowButtons();
    watchReelsDom();
    ensureTopbarMessages();
    replaceNavMessagesWithReels();
    patchOpenReels();
    setTimeout(function () {
      injectReelsCSS();
      placeFollowButtons();
      ensureTopbarMessages();
      replaceNavMessagesWithReels();
      patchOpenReels();
    }, 400);
    setTimeout(function () {
      replaceNavMessagesWithReels();
      patchOpenReels();
    }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
