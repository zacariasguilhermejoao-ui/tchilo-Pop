/** tchilo-Pop compose — GIF/figurinhas só no + ; barra limpa */
(function () {
  'use strict';
  if (window.__tchiloComposeV4) return;
  window.__tchiloComposeV4 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function tmsg(s) {
    try {
      if (typeof t === 'function') return t(s);
    } catch (e) {}
    return s;
  }

  function injectCSS() {
    var old = document.getElementById('tchiloComposeCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloComposeCSS';
    st.textContent = [
      '#chatAttachBtn.chat-attach-btn, .chat-attach-btn{',
      '  width:40px!important;height:40px!important;border-radius:50%!important;',
      '  border:2.5px solid var(--ink,#0B0B0C)!important;',
      '  background:var(--yellow,#ffd45c)!important;color:var(--ink,#0B0B0C)!important;',
      '  display:flex!important;align-items:center!important;justify-content:center!important;',
      '  flex-shrink:0!important;padding:0!important;cursor:pointer!important;',
      '  font:900 22px/1 Inter,system-ui,sans-serif!important;',
      '}',
      '#chatAttachBtn.chat-attach-btn::before, .chat-attach-btn::before{',
      '  content:"+"!important;font-size:22px!important;font-weight:900!important;line-height:1!important;',
      '}',
      '#chatAttachBtn:active, .chat-attach-btn:active{transform:scale(.94);}',
      '#chatScreen .chat-input-bar{display:flex!important;align-items:center!important;gap:8px!important;}',
      '#chatScreen .chat-input-bar .chat-gif-btn,',
      '#chatScreen .chat-input-bar .chat-sticker-btn,',
      '#chatScreen .chat-input-bar [data-chat-extra="gif"],',
      '#chatScreen .chat-input-bar [data-chat-extra="sticker"],',
      '#chatScreen .chat-input-bar [data-tchilo-gif],',
      '#chatScreen .chat-input-bar [data-tchilo-sticker]{',
      '  display:none!important;width:0!important;height:0!important;opacity:0!important;',
      '  pointer-events:none!important;position:absolute!important;left:-9999px!important;',
      '}',
      '#chatScreen .chat-input-bar > button:not(#chatAttachBtn):not(#chatMicBtn):not(.chat-send){',
      '  display:none!important;',
      '}',
      '.chat-call-btns{display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0;}',
      '.chat-call-btns button{',
      '  width:38px;height:38px;border-radius:50%;border:0;background:transparent;',
      '  color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;',
      '}',
      '#chatScreen .chat-header{display:flex;align-items:center;gap:8px;}'
    ].join('');
    document.head.appendChild(st);
  }

  function stylePlusBtn() {
    var btn = document.getElementById('chatAttachBtn');
    if (!btn) return;
    btn.setAttribute('aria-label', 'Anexar');
    btn.title = 'Anexar';
    btn.classList.add('chat-attach-btn');
  }

  function stripStrayIcons() {
    try {
      var bar = document.querySelector('#chatScreen .chat-input-bar');
      if (!bar) return;
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function (el) {
        if (el.id === 'chatAttachBtn' || el.id === 'chatMicBtn') return;
        if (el.classList.contains('chat-send')) return;
        try {
          el.remove();
        } catch (e) {}
      });
    } catch (e2) {}
  }

  function setupMicSendToggle() {
    var input = document.getElementById('chatInput');
    if (!input) return;

    function update() {
      var hasText = !!(input.value && String(input.value).trim());
      var hasPending = !!(window.__tchiloChatPending && window.__tchiloChatPending.blob);
      var showSend = hasText || hasPending;
      var mic = document.getElementById('chatMicBtn');
      var send = document.querySelector('#chatScreen .chat-send');
      if (mic) mic.style.display = showSend ? 'none' : 'flex';
      if (send) {
        if (showSend) {
          send.classList.remove('tchilo-send-hidden');
          send.style.display = 'flex';
        } else {
          send.classList.add('tchilo-send-hidden');
        }
      }
    }

    if (!input.__composeToggle) {
      input.__composeToggle = true;
      input.addEventListener('input', update);
      input.addEventListener('keyup', update);
      input.addEventListener('change', update);
    }
    window.__tchiloToggleSend = update;
    update();
  }

  function injectGifStickerInAttach() {
    if (typeof window.openChatAttachMenu !== 'function') return;
    if (window.openChatAttachMenu.__composeV4) return;
    var orig = window.openChatAttachMenu;
    window.openChatAttachMenu = function () {
      stripStrayIcons();
      var r = orig.apply(this, arguments);
      setTimeout(addGifStickerOpts, 40);
      setTimeout(addGifStickerOpts, 180);
      return r;
    };
    window.openChatAttachMenu.__composeV4 = true;
  }

  function addGifStickerOpts() {
    var grid =
      document.querySelector('.attach-sheet-grid') ||
      document.querySelector('#chatAttachSheet .share-options') ||
      document.querySelector('.sheet.open .share-options');
    if (!grid) {
      document.querySelectorAll('.sheet').forEach(function (s) {
        var st = window.getComputedStyle(s);
        if (st.display !== 'none' && s.querySelector('.attach-opt, .share-opt')) {
          grid = s.querySelector('.attach-sheet-grid, .share-options, .sheet-list') || s;
        }
      });
    }
    if (!grid) return;
    if (grid.querySelector('[data-tchilo-gif]')) return;

    function makeOpt(label, svg, attr, onClick) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'attach-opt';
      btn.setAttribute(attr, '1');
      btn.innerHTML =
        '<div class="ao-icon" style="background:var(--yellow,#ffd45c);display:flex;align-items:center;justify-content:center">' +
        svg +
        '</div><span>' +
        label +
        '</span>';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      };
      return btn;
    }

    var gifSvg =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 10v4M11 10h2a1.5 1.5 0 0 1 0 3h-2M16 14V10h2"/></svg>';
    var stickSvg =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>';

    var gif = makeOpt(tmsg('GIF'), gifSvg, 'data-tchilo-gif', function () {
      toast(tmsg('GIFs em breve'));
    });
    var stick = makeOpt(tmsg('Figurinhas'), stickSvg, 'data-tchilo-sticker', function () {
      toast(tmsg('Figurinhas em breve'));
    });
    if (grid.firstChild) {
      grid.insertBefore(stick, grid.firstChild);
      grid.insertBefore(gif, grid.firstChild);
    } else {
      grid.appendChild(gif);
      grid.appendChild(stick);
    }
  }

  function boot() {
    injectCSS();
    stylePlusBtn();
    stripStrayIcons();
    setupMicSendToggle();
    injectGifStickerInAttach();
  }

  boot();
  [100, 500, 1500].forEach(function (ms) {
    setTimeout(boot, ms);
  });

  /* Keep bar clean if something re-injects icons */
  try {
    var bar = document.querySelector('#chatScreen .chat-input-bar');
    if (bar && !bar.__composeWatch) {
      bar.__composeWatch = true;
      new MutationObserver(function () {
        stripStrayIcons();
      }).observe(bar, { childList: true });
    }
  } catch (e) {}
})();
