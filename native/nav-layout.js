/**
 * tchilo-Pop — layout de navegação
 * - Ícone de mensagens no topo, ao lado da lupa
 * - No sítio das mensagens na barra de baixo → Reels
 */
(function () {
  'use strict';

  var SVG_MSG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">' +
    '<path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/>' +
    '</svg>';

  // Ícone estilo reels / claquete
  var SVG_REELS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="4" width="18" height="16" rx="3"/>' +
    '<path d="M3 9h18"/>' +
    '<path d="M8 4l2 5M14 4l2 5"/>' +
    '<path d="M10 13l5 3-5 3v-6z" fill="currentColor" stroke="none"/>' +
    '</svg>';

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
    // ao lado da lupa (depois do search)
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
        if (typeof openReels === 'function') {
          openReels();
        } else if (typeof goTo === 'function') {
          // fallback: tenta abrir reels a partir de posts de vídeo
          var posts = typeof getPosts === 'function' ? getPosts() : [];
          var vid = posts.find(function (p) {
            return p && (p.mediaType === 'video' || (p.mediaItems && p.mediaItems[0] && p.mediaItems[0].type === 'video'));
          });
          if (vid && typeof openReels === 'function') openReels(vid.id);
          else if (typeof showToast === 'function') {
            /* silenciado */
          }
        }
      } catch (err) {
        console.warn('Tchilo reels nav', err);
      }
    };

    // troca o SVG interno (mantém o .dot)
    var svg = msgBtn.querySelector('svg');
    if (svg) {
      var wrap = document.createElement('div');
      wrap.innerHTML = SVG_REELS;
      var next = wrap.firstChild;
      if (next) svg.replaceWith(next);
    } else {
      var dot = msgBtn.querySelector('.dot');
      msgBtn.innerHTML = SVG_REELS + (dot ? dot.outerHTML : '<div class="dot"></div>');
    }
  }

  function boot() {
    ensureTopbarMessages();
    replaceNavMessagesWithReels();
    setTimeout(function () {
      ensureTopbarMessages();
      replaceNavMessagesWithReels();
    }, 400);
    setTimeout(function () {
      ensureTopbarMessages();
      replaceNavMessagesWithReels();
    }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
