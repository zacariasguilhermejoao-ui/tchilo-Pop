/** tchilo-Pop compose + calls UI fix — must work */
(function () {
  'use strict';

  function toast(msg) {
    try {
      if (typeof window.__tchiloRealShowToast === 'function') return window.__tchiloRealShowToast(msg);
      if (typeof showToast === 'function') return showToast(msg);
    } catch (e) {}
  }
  function tmsg(pt) {
    try { if (typeof t === 'function') return t(pt); } catch (e) {}
    return pt;
  }

  function injectComposeCSS() {
    if (document.getElementById('tchiloComposeFixCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloComposeFixCSS';
    st.textContent = [
      '.nav-item[data-screen="feed"] svg{width:32px!important;height:32px!important;}',
      '.nav-item svg{width:30px;height:30px;}',
      '#chatAttachBtn.chat-attach-btn, .chat-attach-btn{',
      '  width:40px!important;height:40px!important;border-radius:12px!important;',
      '  background:linear-gradient(145deg,#fff 0%,#f3f1ea 100%)!important;',
      '  border:2px solid var(--ink,#1a1a1a)!important;',
      '  box-shadow:0 2px 0 rgba(0,0,0,.12)!important;',
      '  font-size:0!important;color:transparent!important;position:relative;',
      '}',
      '#chatAttachBtn.chat-attach-btn::before, .chat-attach-btn::before{',
      '  content:"";position:absolute;inset:0;margin:auto;width:16px;height:16px;',
      '  background:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%231a1a1a\' stroke-width=\'2.4\' stroke-linecap=\'round\'%3E%3Cpath d=\'M12 5v14M5 12h14\'/%3E%3C/svg%3E") center/contain no-repeat;',
      '}',
      '#chatAttachBtn:active, .chat-attach-btn:active{transform:scale(.94);background:var(--yellow,#ffd45c)!important;}',
      '#chatScreen .chat-input-bar{display:flex!important;align-items:center!important;gap:8px!important;}',
      '#chatScreen .chat-input-bar .chat-gif-btn,',
      '#chatScreen .chat-input-bar .chat-sticker-btn,',
      '#chatScreen .chat-input-bar [data-chat-extra="gif"],',
      '#chatScreen .chat-input-bar [data-chat-extra="sticker"]{display:none!important;}',
      '#chatScreen .chat-send.tchilo-send-hidden{',
      '  opacity:0!important;pointer-events:none!important;width:0!important;min-width:0!important;',
      '  padding:0!important;margin:0!important;overflow:hidden!important;border:0!important;',
      '}',
      '#chatScreen .chat-send{',
      '  width:40px;height:40px;border-radius:50%;border:0;flex-shrink:0;',
      '  background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;',
      '}',
      '#chatMicBtn{flex:0 0 40px;width:40px;height:40px;border-radius:50%;border:0;',
      'background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}',
      '.chat-call-btns{display:flex;align-items:center;gap:4px;margin-left:auto;flex-shrink:0;}',
      '.chat-call-btns button{',
      '  width:38px;height:38px;border-radius:50%;border:0;background:transparent;',
      '  color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;',
      '}',
      '.chat-call-btns button:active{background:rgba(0,0,0,.06);}',
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
      document.querySelectorAll(
        '#chatScreen .chat-input-bar .chat-gif-btn, #chatScreen .chat-input-bar .chat-sticker-btn, ' +
        '#chatScreen .chat-input-bar [data-chat-extra="gif"], #chatScreen .chat-input-bar [data-chat-extra="sticker"]'
      ).forEach(function (el) { el.remove(); });
    } catch (e) {}
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
      ['input', 'keyup', 'change', 'focus'].forEach(function (ev) {
        input.addEventListener(ev, update);
      });
    }
    update();
  }

  function ensureCallButtons() {
    var header = document.querySelector('#chatScreen .chat-header');
    if (!header) return;

    var wrap = header.querySelector('.chat-call-btns');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'chat-call-btns';
      wrap.innerHTML =
        '<button type="button" class="chat-call-voice" aria-label="Chamada de voz" title="Chamada de voz">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">' +
        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>' +
        '<button type="button" class="chat-call-video" aria-label="Chamada de vídeo" title="Chamada de vídeo">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">' +
        '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></button>';

      var nameEl = header.querySelector('#chatName') || header.querySelector('b');
      if (nameEl && nameEl.parentNode === header) {
        if (nameEl.nextSibling) header.insertBefore(wrap, nameEl.nextSibling);
        else header.appendChild(wrap);
      } else {
        header.appendChild(wrap);
      }
    }

    function start(kind) {
      if (typeof window.tchiloStartCall === 'function') {
        window.tchiloStartCall(kind);
        return;
      }
      if (typeof currentChatUser === 'undefined' || !currentChatUser) {
        toast(tmsg('Abre uma conversa primeiro'));
        return;
      }
      var constraints = kind === 'video' ? { audio: true, video: true } : { audio: true, video: false };
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        ensureSimpleCallOverlay(kind, stream, currentChatUser);
      }).catch(function (err) {
        var msg = (err && err.message) || '';
        if (/Permission|NotAllowed|Denied/i.test(msg) || (err && err.name === 'NotAllowedError')) {
          toast(tmsg('Permite o microfone' + (kind === 'video' ? ' e a câmara' : '') + ' nas definições'));
        } else {
          toast(msg || tmsg('Não foi possível iniciar a chamada'));
        }
      });
    }

    var voiceBtn = wrap.querySelector('.chat-call-voice');
    var videoBtn = wrap.querySelector('.chat-call-video');
    if (voiceBtn) {
      voiceBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        start('voice');
      };
    }
    if (videoBtn) {
      videoBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        start('video');
      };
    }
  }

  function ensureSimpleCallOverlay(kind, stream, peer) {
    var ov = document.getElementById('tchiloCallOverlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'tchiloCallOverlay';
      ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:#0b0b12;color:#fff;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;';
      ov.innerHTML =
        '<div id="tchiloCallName" style="font-size:22px;font-weight:800"></div>' +
        '<div id="tchiloCallStatus" style="font-size:14px;opacity:.85">A ligar…</div>' +
        '<video id="tchiloCallLocalVideo" autoplay playsinline muted style="display:none;width:120px;height:160px;object-fit:cover;border-radius:14px;position:absolute;bottom:110px;right:18px;background:#222"></video>' +
        '<button type="button" id="tchiloCallHangup" style="width:64px;height:64px;border-radius:50%;border:0;background:#e53935;color:#fff;font-size:26px;margin-top:40px;cursor:pointer">📞</button>';
      document.body.appendChild(ov);
      document.getElementById('tchiloCallHangup').onclick = function () {
        try {
          if (window.__tchiloFallbackCallStream) {
            window.__tchiloFallbackCallStream.getTracks().forEach(function (t) { t.stop(); });
            window.__tchiloFallbackCallStream = null;
          }
        } catch (e) {}
        ov.style.display = 'none';
        if (typeof window.tchiloHangupCall === 'function') window.tchiloHangupCall();
      };
    }
    window.__tchiloFallbackCallStream = stream;
    var nameEl = document.getElementById('tchiloCallName');
    if (nameEl) nameEl.textContent = peer || '';
    var localV = document.getElementById('tchiloCallLocalVideo');
    if (localV && kind === 'video' && stream) {
      localV.srcObject = stream;
      localV.style.display = 'block';
    }
    ov.style.display = 'flex';
  }

  function patchAttachMenu() {
    if (typeof window.openChatAttachMenu !== 'function') return;
    if (window.openChatAttachMenu.__composePlusFix) return;
    var orig = window.openChatAttachMenu;
    window.openChatAttachMenu = function () {
      stripStrayIcons();
      var r = orig.apply(this, arguments);
      setTimeout(injectGifStickerIntoModal, 50);
      setTimeout(injectGifStickerIntoModal, 250);
      return r;
    };
    window.openChatAttachMenu.__composePlusFix = true;
  }

  function injectGifStickerIntoModal() {
    var grid = document.querySelector('.attach-sheet-grid');
    if (!grid) return;
    if (grid.querySelector('[data-tchilo-gif]')) return;

    function makeOpt(label, emoji, attr, onClick) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'attach-opt';
      btn.setAttribute(attr, '1');
      btn.innerHTML =
        '<div class="ao-icon" style="background:var(--yellow,#ffd45c);font-size:22px;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;margin:0 auto 6px">' +
        emoji + '</div>' + label;
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
        try { if (typeof tchiloModalClose === 'function') tchiloModalClose(true); } catch (err) {}
      };
      return btn;
    }

    var gif = makeOpt(tmsg('GIF'), '🎞️', 'data-tchilo-gif', function () {
      toast(tmsg('GIFs em breve'));
    });
    var stick = makeOpt(tmsg('Figurinhas'), '✨', 'data-tchilo-sticker', function () {
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

  function runAll() {
    injectComposeCSS();
    stylePlusBtn();
    stripStrayIcons();
    setupMicSendToggle();
    ensureCallButtons();
    patchAttachMenu();
  }

  function boot() {
    runAll();
    [100, 400, 1000, 2000, 4000].forEach(function (ms) { setTimeout(runAll, ms); });

    if (typeof window.openChat === 'function' && !window.openChat.__composeFix) {
      var oc = window.openChat;
      window.openChat = function () {
        var r = oc.apply(this, arguments);
        setTimeout(runAll, 30);
        setTimeout(runAll, 200);
        setTimeout(runAll, 600);
        return r;
      };
      window.openChat.__composeFix = true;
    }

    var chat = document.getElementById('chatScreen');
    if (chat && !chat.__composeObs) {
      chat.__composeObs = true;
      new MutationObserver(function () {
        if (chat.classList.contains('open')) setTimeout(runAll, 40);
      }).observe(chat, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
