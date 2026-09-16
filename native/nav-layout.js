/**
 * tchilo-Pop — layout de navegação
 * - Mensagens no topo (ao lado da lupa)
 * - Reels na barra de baixo com ícone de vídeo real
 * - No viewer de Reels: Seguir à direita (longe do X)
 */
(function () {
  'use strict';

  var SVG_MSG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/>' +
    '</svg>';

  // Ícone de vídeo / reels (câmara de filme + play)
  var SVG_REELS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="2" y="5" width="20" height="14" rx="2.5"/>' +
    '<path d="M7 5V3M12 5V3M17 5V3"/>' +
    '<path d="M10 10.5v5l4.5-2.5L10 10.5z" fill="currentColor" stroke="none"/>' +
    '</svg>';

  function injectReelsCSS() {
    if (document.getElementById('tchiloReelsLayoutCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloReelsLayoutCSS';
    st.textContent =
      /* Seguir no canto superior direito — longe do X (esquerda) */
      '.reels-viewer .reel-follow{' +
      'position:absolute!important;' +
      'top:max(14px, env(safe-area-inset-top, 0px) + 10px)!important;' +
      'right:14px!important;' +
      'left:auto!important;' +
      'z-index:6!important;' +
      'min-width:72px;padding:8px 14px;' +
      'border:2px solid #fff;border-radius:10px;' +
      'background:rgba(0,0,0,.4);color:#fff;' +
      'font:800 12px Inter,system-ui,sans-serif;cursor:pointer;' +
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
      '.reels-viewer .reels-close{' +
      'top:max(12px, env(safe-area-inset-top, 0px) + 8px)!important;' +
      'left:14px!important;right:auto!important;z-index:7!important;}' +
      /* evita sobreposição com duet-label se existir */
      '.reels-viewer .duet-label{top:58px!important;right:14px!important;}';
    document.head.appendChild(st);
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
    if (svg && next) {
      svg.replaceWith(next);
    } else if (next) {
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

  function boot() {
    injectReelsCSS();
    ensureTopbarMessages();
    replaceNavMessagesWithReels();
    setTimeout(function () {
      injectReelsCSS();
      ensureTopbarMessages();
      replaceNavMessagesWithReels();
    }, 400);
    setTimeout(replaceNavMessagesWithReels, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
