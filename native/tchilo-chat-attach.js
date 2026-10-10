/**
 * Tchilo — menu Anexar no chat
 * bottom sheet curto (não sai da conversa)
 * ícones line profissionais + ações reais
 */
(function () {
  'use strict';
  if (window.__tchiloChatAttachV1) return;
  window.__tchiloChatAttachV1 = true;

  var ICONS = {
    gif:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h2.5a1.5 1.5 0 0 1 0 3H7V9zm0 3h2.5M14 9v6M14 12h2.5a1.5 1.5 0 0 0 0-3H14"/></svg>',
    sticker:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-4.5 0-8 3.5-8 8 0 4.1 3 7.5 7 8l5-5c.5-4 1-7.5-4-11z"/><circle cx="9" cy="10" r="1" fill="#0B0B0C"/><circle cx="13" cy="10" r="1" fill="#0B0B0C"/><path d="M8.5 13.5s1.2 1.5 3 1.5 3-1.5 3-1.5"/></svg>',
    photo:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 15-5-5L5 19"/></svg>',
    video:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/></svg>',
    file:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>',
    camera:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    audio:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    loc:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  };

  function injectCSS() {
    var st = document.getElementById('tchiloChatAttachCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatAttachCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#tchiloChatAttachSheet{position:fixed;inset:0;z-index:2147483642;display:none;' +
      'align-items:flex-end;justify-content:center;background:rgba(11,11,12,.4);}' +
      '#tchiloChatAttachSheet.open{display:flex!important;}' +
      '#tchiloChatAttachSheet .panel{width:100%;max-width:480px;max-height:72vh;overflow:auto;' +
      'background:var(--paper,#F6F1E7);color:#0B0B0C;border:0;border-radius:20px 20px 0 0;' +
      'box-shadow:0 -8px 32px rgba(0,0,0,.12);padding:12px 14px calc(16px + env(safe-area-inset-bottom));}' +
      '#tchiloChatAttachSheet .handle{width:40px;height:4px;background:#c8c5bc;border-radius:2px;margin:4px auto 12px;}' +
      '#tchiloChatAttachSheet h3{margin:0 0 4px;font-size:18px;font-weight:900;text-align:center;}' +
      '#tchiloChatAttachSheet .sub{text-align:center;font-size:13px;opacity:.55;margin-bottom:14px;}' +
      '#tchiloChatAttachSheet .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}' +
      '#tchiloChatAttachSheet .opt{border:0;border-radius:14px;background:#fff;padding:14px 8px;' +
      'display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;' +
      'box-shadow:0 1px 3px rgba(0,0,0,.04);}' +
      '#tchiloChatAttachSheet .opt:active{transform:scale(.97);}' +
      '#tchiloChatAttachSheet .opt .ic{width:48px;height:48px;border-radius:14px;' +
      'background:rgba(11,11,12,.05);display:flex;align-items:center;justify-content:center;}' +
      '#tchiloChatAttachSheet .opt span{font-size:12px;font-weight:700;color:#0B0B0C;}' +
      '#tchiloChatAttachSheet .close{width:100%;margin-top:14px;padding:14px;border-radius:14px;' +
      'border:1px solid rgba(11,11,12,.1);background:transparent;font-weight:800;font-size:15px;cursor:pointer;color:#0B0B0C;}';
  }

  function closeSheet() {
    var el = document.getElementById('tchiloChatAttachSheet');
    if (el) el.classList.remove('open');
  }

  function keepChatOpen() {
    try {
      var cs = document.getElementById('chatScreen');
      if (cs) {
        cs.classList.add('open');
        cs.style.display = 'flex';
      }
      document.body.classList.add('tchilo-chat-open');
    } catch (e) {}
  }

  function clickFile(id) {
    try {
      var el = document.getElementById(id);
      if (el) el.click();
      else if (typeof showToast === 'function') showToast('Anexo indisponível');
    } catch (e) {}
  }

  function runAction(id) {
    closeSheet();
    keepChatOpen();
    setTimeout(function () {
      keepChatOpen();
      try {
        if (id === 'gif') {
          if (typeof window.openGifSheet === 'function') window.openGifSheet();
          else if (typeof showToast === 'function') showToast('GIF…');
          return;
        }
        if (id === 'sticker') {
          if (typeof window.openStickerSheet === 'function') window.openStickerSheet();
          else if (typeof showToast === 'function') showToast('Figurinhas…');
          return;
        }
        if (id === 'photo') {
          clickFile('chatFilePhotos');
          return;
        }
        if (id === 'video') {
          clickFile('chatFileVideos');
          return;
        }
        if (id === 'file') {
          clickFile('chatFileDocs');
          return;
        }
        if (id === 'camera') {
          clickFile('chatFileCamera');
          return;
        }
        if (id === 'audio') {
          if (typeof window.startChatAudioRecord === 'function') window.startChatAudioRecord();
          else if (typeof showToast === 'function') showToast('Áudio…');
          return;
        }
        if (id === 'loc') {
          if (typeof window.sendChatLocation === 'function') window.sendChatLocation();
          else if (typeof showToast === 'function') showToast('Localização…');
          return;
        }
      } catch (e) {
        console.warn('attach action', e);
      }
    }, 60);
  }

  function openAttachSheet() {
    injectCSS();
    keepChatOpen();

    try {
      if (typeof tchiloModalClose === 'function') tchiloModalClose(null);
    } catch (e) {}

    var sheet = document.getElementById('tchiloChatAttachSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloChatAttachSheet';
      document.body.appendChild(sheet);
    }

    var items = [
      { id: 'gif', label: 'GIF' },
      { id: 'sticker', label: 'Figurinhas' },
      { id: 'photo', label: 'Fotos' },
      { id: 'video', label: 'Vídeos' },
      { id: 'file', label: 'Arquivos' },
      { id: 'camera', label: 'Câmera' },
      { id: 'audio', label: 'Áudio' },
      { id: 'loc', label: 'Localização' }
    ];

    var grid = items
      .map(function (it) {
        return (
          '<button type="button" class="opt" data-a="' +
          it.id +
          '">' +
          '<div class="ic">' +
          (ICONS[it.id] || '') +
          '</div><span>' +
          it.label +
          '</span></button>'
        );
      })
      .join('');

    sheet.innerHTML =
      '<div class="panel">' +
      '<div class="handle"></div>' +
      '<h3>Anexar</h3>' +
      '<div class="sub">Escolhe o tipo de anexo</div>' +
      '<div class="grid">' +
      grid +
      '</div>' +
      '<button type="button" class="close" data-a="close">Fechar</button></div>';

    sheet.onclick = function (e) {
      if (e.target === sheet) {
        closeSheet();
        keepChatOpen();
        return;
      }
      var btn = e.target.closest('[data-a]');
      if (!btn) return;
      var a = btn.getAttribute('data-a');
      if (a === 'close') {
        closeSheet();
        keepChatOpen();
        return;
      }
      runAction(a);
    };

    /* swipe down close */
    try {
      var panel = sheet.querySelector('.panel');
      var startY = 0;
      var dy = 0;
      panel.addEventListener(
        'touchstart',
        function (e) {
          if (!e.touches[0]) return;
          startY = e.touches[0].clientY;
          dy = 0;
        },
        { passive: true }
      );
      panel.addEventListener(
        'touchmove',
        function (e) {
          if (!e.touches[0]) return;
          dy = e.touches[0].clientY - startY;
          if (dy > 0) panel.style.transform = 'translateY(' + dy + 'px)';
        },
        { passive: true }
      );
      panel.addEventListener(
        'touchend',
        function () {
          if (dy > 80) {
            closeSheet();
            keepChatOpen();
          }
          panel.style.transform = '';
          dy = 0;
        },
        { passive: true }
      );
    } catch (e2) {}

    sheet.classList.add('open');
    keepChatOpen();
  }

  /* sobrescrever menu antigo */
  window.openChatAttachMenu = function () {
    openAttachSheet();
  };

  /* ligar botão + */
  function wirePlus() {
    var btn =
      document.getElementById('chatAttachBtn') ||
      document.querySelector('.chat-attach-btn');
    if (!btn || btn.__attachSheetV1) return;
    btn.__attachSheetV1 = true;
    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        openAttachSheet();
      },
      true
    );
  }

  injectCSS();
  wirePlus();
  setTimeout(wirePlus, 500);
  setTimeout(wirePlus, 2000);

  try {
    new MutationObserver(function () {
      wirePlus();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
