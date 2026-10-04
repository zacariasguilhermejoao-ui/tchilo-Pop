/**
 * tchilo-Pop — UI fixes: feed icon size, chat call buttons, input toggle (mic ↔ send), + menu with GIF/stickers
 */
(function () {
  'use strict';

  function toast(msg) {
    try {
      if (typeof window.__tchiloRealShowToast === 'function') return window.__tchiloRealShowToast(msg);
      if (typeof showToast === 'function') return showToast(msg);
    } catch (e) {}
    try { alert(msg); } catch (e2) {}
  }

  function tmsg(pt) {
    try { if (typeof t === 'function') return t(pt); } catch (e) {}
    return pt;
  }

  /* ── 1) Ícone do Feed um pouco maior ── */
  function enlargeFeedIcon() {
    if (document.getElementById('tchiloFeedIconCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeedIconCSS';
    st.textContent =
      '.nav-item[data-screen="feed"] svg{width:32px!important;height:32px!important;}' +
      '.nav-item svg{width:30px;height:30px;}';
    document.head.appendChild(st);
  }

  /* ── 2) Botões de chamada (voz / vídeo) no header do chat ── */
  function ensureCallButtons() {
    var header = document.querySelector('#chatScreen .chat-header');
    if (!header || header.querySelector('.chat-call-btns')) return;

    var wrap = document.createElement('div');
    wrap.className = 'chat-call-btns';
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px;margin-left:auto;margin-right:4px;';

    var voiceBtn = document.createElement('button');
    voiceBtn.type = 'button';
    voiceBtn.className = 'chat-call-voice';
    voiceBtn.setAttribute('aria-label', 'Chamada de voz');
    voiceBtn.title = 'Chamada de voz';
    voiceBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">' +
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    voiceBtn.style.cssText =
      'width:40px;height:40px;border-radius:50%;border:0;background:transparent;color:var(--ink);' +
      'display:flex;align-items:center;justify-content:center;cursor:pointer;';

    var videoBtn = document.createElement('button');
    videoBtn.type = 'button';
    videoBtn.className = 'chat-call-video';
    videoBtn.setAttribute('aria-label', 'Chamada de vídeo');
    videoBtn.title = 'Chamada de vídeo';
    videoBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">' +
      '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
    videoBtn.style.cssText = voiceBtn.style.cssText;

    voiceBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      startCall('voice');
    };
    videoBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      startCall('video');
    };

    wrap.appendChild(voiceBtn);
    wrap.appendChild(videoBtn);

    var nameEl = header.querySelector('#chatName') || header.querySelector('b');
    if (nameEl && nameEl.nextSibling) {
      header.insertBefore(wrap, nameEl.nextSibling);
    } else {
      header.appendChild(wrap);
    }
  }

  function ensureCallOverlay() {
    if (document.getElementById('tchiloCallOverlay')) return;
    var ov = document.createElement('div');
    ov.id = 'tchiloCallOverlay';
    ov.style.cssText =
      'display:none;position:fixed;inset:0;z-index:99999;background:#0b0b12;color:#fff;' +
      'flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;';
    ov.innerHTML =
      '<div id="tchiloCallAvatar" style="width:96px;height:96px;border-radius:50%;background:var(--mint,#7ef0c0);' +
      'display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;color:#111"></div>' +
      '<div id="tchiloCallName" style="font-size:22px;font-weight:800"></div>' +
      '<div id="tchiloCallStatus" style="font-size:14px;opacity:.8">A ligar…</div>' +
      '<video id="tchiloCallLocalVideo" autoplay playsinline muted style="display:none;width:120px;height:160px;' +
      'object-fit:cover;border-radius:16px;background:#222;position:absolute;bottom:100px;right:20px"></video>' +
      '<div style="display:flex;gap:28px;margin-top:40px">' +
      '<button type="button" id="tchiloCallHangup" style="width:64px;height:64px;border-radius:50%;border:0;' +
      'background:#e53935;color:#fff;font-size:28px;cursor:pointer;display:flex;align-items:center;justify-content:center">📞</button>' +
      '</div>';
    document.body.appendChild(ov);

    document.getElementById('tchiloCallHangup').onclick = function () {
      endCall();
    };
  }

  var __callStream = null;
  var __callTimer = null;

  async function startCall(kind) {
    if (!currentChatUser) {
      toast(tmsg('Abre uma conversa primeiro'));
      return;
    }
    ensureCallOverlay();
    var ov = document.getElementById('tchiloCallOverlay');
    var nameEl = document.getElementById('tchiloCallName');
    var statusEl = document.getElementById('tchiloCallStatus');
    var avEl = document.getElementById('tchiloCallAvatar');
    var videoEl = document.getElementById('tchiloCallLocalVideo');

    var display = (typeof resolveDisplayName === 'function' ? resolveDisplayName(currentChatUser) : null) || currentChatUser;
    if (nameEl) nameEl.textContent = display;
    if (avEl) avEl.textContent = String(display).slice(0, 2).toUpperCase();
    if (statusEl) statusEl.textContent = kind === 'video' ? tmsg('A iniciar chamada de vídeo…') : tmsg('A iniciar chamada de voz…');
    ov.style.display = 'flex';

    try {
      var constraints = kind === 'video'
        ? { audio: true, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } }
        : { audio: true, video: false };

      var stream = await navigator.mediaDevices.getUserMedia(constraints);
      __callStream = stream;

      if (kind === 'video' && videoEl) {
        videoEl.srcObject = stream;
        videoEl.style.display = 'block';
      } else if (videoEl) {
        videoEl.style.display = 'none';
        videoEl.srcObject = null;
      }

      if (statusEl) {
        statusEl.textContent = tmsg('A ligar para ') + display + '…';
      }

      var secs = 0;
      clearInterval(__callTimer);
      __callTimer = setInterval(function () {
        secs += 1;
        if (statusEl) {
          if (secs < 8) {
            statusEl.textContent = tmsg('A ligar…') + ' (' + secs + 's)';
          } else {
            statusEl.textContent = tmsg('Sem resposta — a pessoa pode estar offline');
          }
        }
      }, 1000);

      // Nota: chamada real 1:1 precisa de WebRTC + signaling (Supabase Realtime).
    } catch (err) {
      console.warn('[tchilo] call', err);
      var msg = (err && err.message) || '';
      if (/Permission|NotAllowed|Denied/i.test(msg) || (err && err.name === 'NotAllowedError')) {
        toast(tmsg('Permite o microfone' + (kind === 'video' ? ' e a câmara' : '') + ' nas definições do telemóvel'));
      } else {
        toast(msg || tmsg('Não foi possível iniciar a chamada'));
      }
      endCall();
    }
  }

  function endCall() {
    clearInterval(__callTimer);
    __callTimer = null;
    if (__callStream) {
      try {
        __callStream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      } catch (e) {}
      __callStream = null;
    }
    var videoEl = document.getElementById('tchiloCallLocalVideo');
    if (videoEl) {
      try { videoEl.srcObject = null; } catch (e) {}
      videoEl.style.display = 'none';
    }
    var ov = document.getElementById('tchiloCallOverlay');
    if (ov) ov.style.display = 'none';
  }

  /* ── 3) Input: ao escrever, esconde microfone e mostra enviar ── */
  function setupInputToggle() {
    var input = document.getElementById('chatInput');
    if (!input || input.__toggleFix) return;
    input.__toggleFix = true;

    function update() {
      var hasText = !!(input.value && input.value.trim());
      var hasPending = !!(window.__tchiloChatPending && window.__tchiloChatPending.blob);
      var showSend = hasText || hasPending;

      var mic = document.getElementById('chatMicBtn');
      var send = document.querySelector('#chatScreen .chat-send');

      if (mic) {
        mic.style.display = showSend ? 'none' : 'flex';
      }
      if (send) {
        if (!showSend) {
          send.style.opacity = '0';
          send.style.pointerEvents = 'none';
          send.style.width = '0';
          send.style.minWidth = '0';
          send.style.padding = '0';
          send.style.margin = '0';
          send.style.overflow = 'hidden';
        } else {
          send.style.display = 'flex';
          send.style.opacity = '1';
          send.style.pointerEvents = 'auto';
          send.style.width = '';
          send.style.minWidth = '';
          send.style.padding = '';
          send.style.margin = '';
          send.style.overflow = '';
        }
      }
    }

    input.addEventListener('input', update);
    input.addEventListener('keyup', update);
    input.addEventListener('change', update);
    setTimeout(update, 50);
    setTimeout(update, 400);

    var observer = new MutationObserver(function () { update(); });
    var bar = document.querySelector('#chatScreen .chat-input-bar');
    if (bar) observer.observe(bar, { childList: true, subtree: true });
  }

  /* ── 4) Menu + profissional: GIF e figurinhas dentro do + ── */
  function enhanceAttachMenu() {
    if (typeof window.openChatAttachMenu !== 'function') return;
    if (window.openChatAttachMenu.__plusFix) return;

    var orig = window.openChatAttachMenu;
    window.openChatAttachMenu = function () {
      try {
        document.querySelectorAll(
          '#chatScreen .chat-input-bar .chat-gif-btn, #chatScreen .chat-input-bar .chat-sticker-btn, ' +
          '#chatScreen .chat-input-bar [data-chat-extra="gif"], #chatScreen .chat-input-bar [data-chat-extra="sticker"]'
        ).forEach(function (el) { el.remove(); });
      } catch (e) {}

      var r = orig.apply(this, arguments);

      setTimeout(function () { injectGifStickerInSheet(); }, 30);
      setTimeout(injectGifStickerInSheet, 200);

      return r;
    };
    window.openChatAttachMenu.__plusFix = true;
  }

  function injectGifStickerInSheet() {
    var sheet = null;
    document.querySelectorAll('.sheet').forEach(function (s) {
      var st = window.getComputedStyle(s);
      if (st.display !== 'none' && st.visibility !== 'hidden' && s.querySelector('.share-opt, .attach-opt, button')) {
        sheet = s;
      }
    });
    if (!sheet) return;
    if (sheet.querySelector('[data-tchilo-gif]') || sheet.querySelector('[data-tchilo-sticker]')) return;

    var list = sheet.querySelector('.share-options, .sheet-list, .sheet-scroll, .attach-options') || sheet;

    function makeOpt(label, emoji, dataAttr, onClick) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'share-opt';
      btn.setAttribute(dataAttr, '1');
      btn.innerHTML =
        '<div class="so-icon" style="background:var(--yellow,#ffd45c);font-size:22px">' + emoji + '</div>' +
        '<div><b>' + label + '</b></div>';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      };
      return btn;
    }

    var gifBtn = makeOpt(tmsg('GIF'), '🎞️', 'data-tchilo-gif', function () {
      toast(tmsg('GIFs em breve — escolhe uma foto ou vídeo entretanto'));
      try { if (typeof closeSheet === 'function') closeSheet(); } catch (e) {}
    });
    var stickBtn = makeOpt(tmsg('Figurinhas'), '✨', 'data-tchilo-sticker', function () {
      toast(tmsg('Figurinhas em breve'));
      try { if (typeof closeSheet === 'function') closeSheet(); } catch (e) {}
    });

    if (list.firstChild) {
      list.insertBefore(stickBtn, list.firstChild);
      list.insertBefore(gifBtn, list.firstChild);
    } else {
      list.appendChild(gifBtn);
      list.appendChild(stickBtn);
    }
  }

  function boot() {
    enlargeFeedIcon();
    ensureCallOverlay();
    ensureCallButtons();
    setupInputToggle();
    enhanceAttachMenu();

    [200, 600, 1500, 3000].forEach(function (ms) {
      setTimeout(function () {
        enlargeFeedIcon();
        ensureCallButtons();
        setupInputToggle();
        enhanceAttachMenu();
      }, ms);
    });

    if (typeof window.openChat === 'function' && !window.openChat.__uiFix) {
      var oc = window.openChat;
      window.openChat = function () {
        var r = oc.apply(this, arguments);
        setTimeout(function () {
          ensureCallButtons();
          setupInputToggle();
          enhanceAttachMenu();
        }, 40);
        setTimeout(ensureCallButtons, 250);
        setTimeout(setupInputToggle, 300);
        return r;
      };
      window.openChat.__uiFix = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
