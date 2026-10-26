/**
 * Tchilo — comentários no estilo do Facebook, com as cores da app:
 *  - Feed: abre a página do post (cabeçalho, mídia, ações, comentários e caixa em baixo)
 *  - Reels / visualizador de mídia: painel por baixo do vídeo, com o vídeo ainda visível
 * Usa os mesmos dados e o mesmo envio (sendComment) que já existiam.
 */
(function () {
  'use strict';
  if (window.__tchiloCommentsUi) return;
  window.__tchiloCommentsUi = true;

  var pageEl = null;
  var pagePostId = null;

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function call(name) {
    var f = window[name];
    if (typeof f !== 'function') return undefined;
    try { return f.apply(null, Array.prototype.slice.call(arguments, 1)); } catch (e) { return undefined; }
  }
  function displayOf(username, fallbackName) {
    var n = fallbackName || '';
    try { if (!n || call('isPlaceholderDisplayName', n)) n = call('resolveDisplayName', username) || ''; } catch (e) {}
    if (!n || call('isPlaceholderDisplayName', n)) n = username || 'Utilizador';
    return String(n);
  }
  function timeOf(ts) {
    if (!ts) return '';
    var r = call('formatRelativeTime', ts);
    return r ? String(r) : '';
  }
  function overMedia() {
    var r = $('reelsViewer');
    if (r && r.classList.contains('open')) return true;
    var m = $('mediaViewer');
    if (m && (m.classList.contains('open') || m.classList.contains('active') || (m.style.display && m.style.display !== 'none'))) return true;
    return false;
  }

  /* ——— CSS ——— */
  function css() {
    if ($('tchiloCommentsUiCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloCommentsUiCSS';
    var HL = 'rgba(11,11,12,.08)';
    st.textContent = [
      /* linhas dos comentários (lista do painel e da página) */
      '.tcu-row{display:flex;gap:12px;align-items:flex-start;padding:10px 16px}',
      '.tcu-row .tcu-b{min-width:0;flex:1}',
      '.tcu-name{font-size:15px;font-weight:800;color:var(--ink,#0B0B0C)}',
      '.tcu-time{font-size:14px;color:var(--muted,#606060);font-weight:500}',
      '.tcu-text{margin-top:2px;font-size:16px;line-height:1.4;color:var(--ink,#0B0B0C);white-space:pre-wrap;word-break:break-word}',
      '.tcu-acts{margin-top:8px}',
      '.tcu-reply{border:0;background:transparent;padding:0;font:inherit;font-size:14px;font-weight:800;color:var(--muted,#606060);cursor:pointer}',
      '.tcu-empty{padding:28px 16px;text-align:center;color:var(--muted,#606060);font-size:15px}',
      '.tcu-empty b{display:block;color:var(--ink,#0B0B0C);font-size:16px;margin-bottom:4px}',
      /* caixa de escrever (painel e página) */
      '.tcu-bar{display:flex;align-items:center;gap:10px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:var(--paper,#fff);border-top:1px solid var(--line,#E4E6EB)}',
      '.tcu-bar input{flex:1;min-width:0;border:1px solid var(--line,#E4E6EB);border-radius:999px;background:var(--field,#F8F9FB);color:var(--ink,#0B0B0C);font:inherit;font-size:16px;padding:12px 16px;outline:none;-webkit-appearance:none;appearance:none}',
      '.tcu-send{flex:none;width:40px;height:40px;border:0;border-radius:50%;background:var(--ink,#0B0B0C);color:#fff;display:none;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-appearance:none;appearance:none}',
      '.tcu-send.on{display:flex}',
      '.tcu-send svg{width:20px;height:20px}',
      /* painel por baixo do vídeo (Reels e visualizador) */
      'html:root body #commentSheet{background:transparent !important;align-items:flex-end !important}',
      'html:root body #commentSheet .sheet-panel{height:72vh !important;max-height:72vh !important;border-radius:24px 24px 0 0 !important;background:var(--paper,#fff) !important;border:0 !important;box-shadow:0 -6px 24px rgba(0,0,0,.18) !important;display:flex !important;flex-direction:column !important;padding:0 !important;overflow:hidden !important}',
      'html:root body #commentSheet .sheet-handle{width:44px !important;height:5px !important;border-radius:3px !important;background:rgba(11,11,12,.28) !important;margin:10px auto 6px !important;flex:none}',
      'html:root body #commentSheet .sheet-title{display:none !important}',
      'html:root body #commentSheet .sheet-list{flex:1 1 auto !important;overflow-y:auto !important;-webkit-overflow-scrolling:touch;padding:6px 0 !important;max-height:none !important}',
      'html:root body #commentSheet .sheet-input-bar{flex:none;display:flex !important;align-items:center;gap:10px;padding:10px 12px calc(10px + env(safe-area-inset-bottom)) !important;background:var(--paper,#fff) !important;border:0 !important;border-top:1px solid var(--line,#E4E6EB) !important}',
      'html:root body #commentSheet .sheet-input-bar input{flex:1;min-width:0;border:1px solid var(--line,#E4E6EB) !important;border-radius:999px !important;background:var(--field,#F8F9FB) !important;color:var(--ink,#0B0B0C);font:inherit;font-size:16px;padding:12px 16px !important;outline:none;-webkit-appearance:none;appearance:none;box-shadow:none !important}',
      'html:root body #commentSheet .sheet-input-bar button{display:none}',
      'html:root body #commentSheet .sheet-input-bar button.tcu-send.on{display:flex !important;background:var(--ink,#0B0B0C) !important;color:#fff !important;border:0 !important;border-radius:50% !important;width:40px;height:40px;padding:0 !important;box-shadow:none !important}',
      /* página do post (feed) */
      '#tchiloPostPage{position:fixed;inset:0;z-index:1050;display:none;flex-direction:column;background:var(--paper,#fff);color:var(--ink,#0B0B0C);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
      '#tchiloPostPage.open{display:flex}',
      'body.tchilo-post-page-open .navbar,body.tchilo-post-page-open nav.navbar,body.tchilo-post-page-open .tchilo-nb{display:none !important}',
      '#tchiloPostPage *{box-sizing:border-box}',
      '#tchiloPostPage button{font-family:inherit;-webkit-appearance:none;appearance:none}',
      '#tchiloPostPage .pp-top{flex:none;display:flex;align-items:center;gap:10px;padding:10px 12px;padding-top:calc(10px + env(safe-area-inset-top));border-bottom:1px solid var(--line,#E4E6EB);background:var(--paper,#fff)}',
      '#tchiloPostPage .pp-back{width:36px;height:36px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}',
      '#tchiloPostPage .pp-back svg{width:18px;height:18px}',
      '#tchiloPostPage .pp-who{flex:1;min-width:0;display:flex;align-items:center;gap:10px}',
      '#tchiloPostPage .pp-who .pp-t{min-width:0;flex:1}',
      '#tchiloPostPage .pp-name{font-size:16px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#tchiloPostPage .pp-sub{font-size:13px;color:var(--muted,#606060)}',
      '#tchiloPostPage .pp-more{width:36px;height:36px;border:0;background:transparent;color:var(--ink,#0B0B0C);font-size:22px;line-height:1;cursor:pointer;flex:none}',
      '#tchiloPostPage .pp-scroll{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}',
      '#tchiloPostPage .pp-cap{padding:12px 16px 4px;font-size:16px;line-height:1.45;white-space:pre-wrap;word-break:break-word}',
      '#tchiloPostPage .pp-media img,#tchiloPostPage .pp-media video{display:block;width:100%;max-height:70vh;object-fit:contain;background:#000;margin-top:8px}',
      '#tchiloPostPage .pp-media .big{margin:12px 16px 0;min-height:200px;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;border-radius:16px;font-weight:800}',
      '#tchiloPostPage .pp-actions{border-top:1px solid var(--line,#E4E6EB);border-bottom:1px solid var(--line,#E4E6EB);margin-top:10px}',
      '#tchiloPostPage .pp-actions .post-actions{margin:0;padding:6px 8px}',
      '#tchiloPostPage .pp-count{padding:12px 16px 4px;font-size:15px;font-weight:800}',
      '#tchiloPostPage .pp-list{padding-bottom:12px}'
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ——— lista de comentários (painel e página) ——— */
  function commentsFor(postId) {
    try {
      var all = call('getComments') || {};
      return all[postId] || [];
    } catch (e) { return []; }
  }
  function rowHTML(c) {
    var u = c.user || '';
    var name = displayOf(u, '');
    var av = '';
    try {
      av = call('renderUserAvatarHTML', u, String(u).slice(0, 2).toUpperCase(), 'var(--mint)') || '';
      av = av.replace('<div class="avatar"', '<div class="avatar" style="width:40px;height:40px;font-size:13px;flex:none"');
    } catch (e) {}
    var t = timeOf(c.createdAt);
    return '<div class="tcu-row comment-item">' + av + '<div class="tcu-b">' +
      '<div><span class="tcu-name">' + esc(name) + '</span>' + (t ? ' <span class="tcu-time">· ' + esc(t) + '</span>' : '') + '</div>' +
      '<div class="tcu-text">' + esc(c.text || '') + '</div>' +
      '<div class="tcu-acts"><button type="button" class="tcu-reply" data-reply="' + esc(u) + '">Responder</button></div>' +
      '</div></div>';
  }
  function listHTML(postId) {
    var items = commentsFor(postId);
    if (!items.length) return '<div class="tcu-empty"><b>Sem comentários</b>Sê o primeiro a comentar.</div>';
    return items.map(rowHTML).join('');
  }
  function fillList(el, postId) {
    if (!el) return;
    el.innerHTML = listHTML(postId);
    try { call('prefetchUserAvatars', commentsFor(postId).map(function (c) { return c.user; })); } catch (e) {}
  }

  var origRender = window.renderCommentList;
  window.renderCommentList = function () {
    var id = null;
    try { id = currentCommentPostId; } catch (e) {}
    if (!id) return typeof origRender === 'function' ? origRender() : undefined;
    fillList($('commentList'), id);
    if (pageEl && pageEl.classList.contains('open') && pagePostId === id) {
      fillList($('ppList'), id);
      var n = commentsFor(id).length;
      var cnt = $('ppCount');
      if (cnt) cnt.textContent = n === 1 ? '1 comentário' : n + ' comentários';
    }
  };

  /* ——— caixa de escrever (partilhada entre painel e página) ——— */
  var SEND_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  function placeholderText() {
    var who = '';
    try { var s = call('getSession'); if (s && s.username) who = displayOf(s.username, s.displayName || ''); } catch (e) {}
    return who ? 'Comente como ' + who + '…' : 'Escreve um comentário…';
  }
  function prepareSheetBar() {
    var input = $('commentInput');
    if (!input) return;
    input.placeholder = placeholderText();
    var bar = input.parentNode;
    var btn = bar && bar.querySelector('button');
    if (btn && !btn.classList.contains('tcu-send')) {
      btn.classList.add('tcu-send');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Enviar');
      btn.innerHTML = SEND_SVG;
    }
    function sync() { if (btn) btn.classList.toggle('on', !!input.value.trim()); }
    if (!input.__tcuBound) {
      input.__tcuBound = true;
      input.addEventListener('input', sync);
    }
    sync();
  }

  /* ——— página do post (feed) ——— */
  function buildPage() {
    if (pageEl) return pageEl;
    pageEl = document.createElement('div');
    pageEl.id = 'tchiloPostPage';
    pageEl.setAttribute('role', 'dialog');
    pageEl.setAttribute('aria-label', 'Comentários');
    pageEl.innerHTML =
      '<div class="pp-top"><button type="button" class="back-btn pp-back" id="ppBack" aria-label="Voltar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<div class="pp-who" id="ppWho"></div><button type="button" class="pp-more" id="ppMore" aria-label="Mais opções">⋯</button></div>' +
      '<div class="pp-scroll" id="ppScroll"><div id="ppBody"></div>' +
      '<div class="pp-actions" id="ppActions"></div><div class="pp-count" id="ppCount"></div><div class="pp-list" id="ppList"></div></div>' +
      '<div class="tcu-bar"><input type="text" id="ppInput" autocomplete="off" enterkeyhint="send"><button type="button" class="tcu-send" id="ppSend" aria-label="Enviar">' + SEND_SVG + '</button></div>';
    document.body.appendChild(pageEl);

    $('ppBack').onclick = closePostPage;
    $('ppMore').onclick = function () { if (pagePostId) call('openPostMenu', pagePostId); };
    var input = $('ppInput');
    var send = $('ppSend');
    function sync() { send.classList.toggle('on', !!input.value.trim()); }
    input.addEventListener('input', sync);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendFromPage(); } });
    send.onclick = sendFromPage;
    pageEl.addEventListener('click', function (e) {
      var r = e.target.closest && e.target.closest('[data-reply]');
      if (!r) return;
      input.value = '@' + r.getAttribute('data-reply') + ' ';
      sync();
      input.focus();
    });
    return pageEl;
  }

  function renderHeader(p) {
    var name = displayOf(p.username, p.displayName);
    var s = call('getSession');
    var own = s && s.username === p.username;
    var av = '';
    try {
      av = call('renderUserAvatarHTML', p.username, p.initials || p.username, 'var(--mint)') || '';
      av = av.replace('<div class="avatar"', '<div class="avatar" style="width:40px;height:40px;font-size:13px;flex:none"');
    } catch (e) {}
    var follow = '';
    if (!own) {
      var fl = 'Seguir', fc = 'post-follow';
      try {
        if (call('isFriend', p.username)) { fl = 'Amigos'; fc += ' friends'; }
        else if (call('isFollowing', p.username)) { fl = 'Seguido'; fc += ' following'; }
      } catch (e) {}
      follow = '<button type="button" class="' + fc + '" id="ppFollow">' + fl + '</button>';
    }
    var t = timeOf(p.createdAt) || p.time || '';
    $('ppWho').innerHTML = av + '<div class="pp-t"><div class="pp-name">' + esc(name) + '</div><div class="pp-sub">' + esc(t) + '</div></div>' + follow;
    var fb = $('ppFollow');
    if (fb) fb.onclick = function () { call('toggleFollow', p.username); renderHeader(p); };
  }

  function renderBody(p) {
    var cap = '';
    try { cap = String(call('stripTchiloMusicToken', p.caption || '') || p.caption || ''); } catch (e) { cap = String(p.caption || ''); }
    var items = [];
    try { items = call('resolveMediaItems', p) || []; } catch (e) {}
    var media = '';
    if (items.length) {
      media = '<div class="pp-media">' + items.map(function (m) {
        return m.type === 'video'
          ? '<video src="' + esc(m.url) + '" controls playsinline preload="metadata"></video>'
          : '<img src="' + esc(m.url) + '" alt="" loading="lazy">';
      }).join('') + '</div>';
    } else if (p.stamp || cap) {
      media = '<div class="pp-media"><div class="big ' + esc(p.color || 'm1') + '">' + esc(p.stamp || cap) + '</div></div>';
    }
    $('ppBody').innerHTML = (cap && items.length ? '<div class="pp-cap">' + esc(cap) + '</div>' : '') + media;

    /* mesmas ações e ícones do feed */
    var box = $('ppActions');
    box.innerHTML = '';
    var src = document.querySelector('.post[data-id="' + p.id + '"] .post-actions');
    if (src) {
      var c = src.cloneNode(true);
      box.appendChild(c);
    } else {
      box.style.display = 'none';
    }
  }

  function openPostPage(postId, focus) {
    css();
    var posts = call('getPosts') || [];
    var p = posts.filter(function (x) { return x.id === postId; })[0];
    if (!p) return false;
    buildPage();
    pagePostId = postId;
    try { currentCommentPostId = postId; } catch (e) {}
    renderHeader(p);
    renderBody(p);
    var input = $('ppInput');
    input.value = '';
    input.placeholder = placeholderText();
    $('ppSend').classList.remove('on');
    pageEl.classList.add('open');
    document.body.classList.add('tchilo-post-page-open');
    window.renderCommentList();
    var sc = $('ppScroll'); if (sc) sc.scrollTop = 0;
    if (focus) setTimeout(function () { try { input.focus(); } catch (e) {} }, 180);
    return true;
  }

  function closePostPage() {
    if (!pageEl) return;
    pageEl.classList.remove('open');
    document.body.classList.remove('tchilo-post-page-open');
    var v = pageEl.querySelectorAll('video');
    for (var i = 0; i < v.length; i++) { try { v[i].pause(); } catch (e) {} }
    pagePostId = null;
    try { currentCommentPostId = null; } catch (e) {}
    if (!overMedia()) call('renderFeed');
  }

  async function sendFromPage() {
    var input = $('ppInput');
    var text = (input.value || '').trim();
    var id = pagePostId;
    if (!text || !id) return;
    var hidden = $('commentInput');
    if (!hidden) return;
    try { currentCommentPostId = id; } catch (e) {}
    hidden.value = text;
    input.value = '';
    $('ppSend').classList.remove('on');
    try { await window.sendComment(); } catch (e) {}
    window.renderCommentList();
    var sc = $('ppScroll');
    var list = $('ppList');
    if (sc && list) sc.scrollTop = list.offsetTop + list.offsetHeight;
  }

  /* ——— abrir comentários: página no feed, painel por cima de vídeo/mídia ——— */
  var origOpen = window.openComments;
  window.openComments = function (postId) {
    css();
    if (overMedia()) {
      if (typeof origOpen === 'function') origOpen(postId);
      else {
        try { currentCommentPostId = postId; } catch (e) {}
        window.renderCommentList();
        var sh = $('commentSheet'); if (sh) sh.classList.add('open');
      }
      prepareSheetBar();
      return;
    }
    if (pageEl && pageEl.classList.contains('open') && pagePostId === postId) {
      var i = $('ppInput'); if (i) i.focus();
      return;
    }
    if (!openPostPage(postId, true)) {
      if (typeof origOpen === 'function') origOpen(postId);
      prepareSheetBar();
    }
  };

  window.tchiloClosePostPage = closePostPage;
  css();
  document.addEventListener('DOMContentLoaded', prepareSheetBar);
  prepareSheetBar();
})();
