/**
 * Tchilo attach v3 — GIF como texto · figurinha profissional · sem cinza
 */
(function () {
  'use strict';
  if (window.__tchiloChatAttachV3) return;
  window.__tchiloChatAttachV3 = true;

  var ICONS = {
    gif: null, /* texto GIF */
    sticker:
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0B0B0C" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 2a9 9 0 0 0-9 9c0 4.5 3.2 8.2 7.5 8.9L15 15.5A9 9 0 0 0 12 2z"/>' +
      '<path d="M14.5 14.5 20 20"/>' +
      '<circle cx="9" cy="10" r="1" fill="#0B0B0C" stroke="none"/>' +
      '<circle cx="13" cy="10" r="1" fill="#0B0B0C" stroke="none"/>' +
      '<path d="M8.5 13s1.2 1.4 3 1.4 3-1.4 3-1.4"/>' +
      '</svg>',
    photo:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.4"/><path d="m21 15-4.5-4.5L6 19"/></svg>',
    video:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/></svg>',
    file:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
    camera:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    audio:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>',
    loc:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  };

  function injectCSS() {
    var st = document.getElementById('tchiloChatAttachCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatAttachCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#tchiloChatAttachSheet{position:fixed;inset:0;z-index:2147483642;display:none;align-items:flex-end;justify-content:center;background:rgba(11,11,12,.4);}' +
      '#tchiloChatAttachSheet.open{display:flex!important;}' +
      '#tchiloChatAttachSheet .panel{width:100%;max-width:480px;max-height:72vh;overflow:auto;background:var(--paper,#F6F1E7);color:#0B0B0C;border:0!important;border-radius:20px 20px 0 0;box-shadow:0 -8px 32px rgba(0,0,0,.12);padding:12px 14px calc(16px + env(safe-area-inset-bottom));}' +
      '#tchiloChatAttachSheet .handle{width:40px;height:4px;background:#c8c5bc;border-radius:2px;margin:4px auto 12px;border:0;}' +
      '#tchiloChatAttachSheet h3{margin:0 0 4px;font-size:18px;font-weight:900;text-align:center;}' +
      '#tchiloChatAttachSheet .sub{text-align:center;font-size:13px;opacity:.55;margin-bottom:14px;}' +
      '#tchiloChatAttachSheet .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}' +
      '#tchiloChatAttachSheet .opt{border:0!important;border-radius:14px;background:#fff;padding:16px 8px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.04);}' +
      '#tchiloChatAttachSheet .opt .ic{background:transparent!important;border-radius:0!important;width:auto!important;height:auto!important;padding:0!important;display:flex;align-items:center;justify-content:center;min-height:28px;}' +
      '#tchiloChatAttachSheet .opt .ic-gif{font:800 15px system-ui,sans-serif;letter-spacing:0.04em;color:#0B0B0C;}' +
      '#tchiloChatAttachSheet .opt span{font-size:12px;font-weight:700;color:#0B0B0C;}' +
      '#tchiloChatAttachSheet .close{width:100%;margin-top:14px;padding:14px;border-radius:14px;border:1px solid rgba(11,11,12,.1)!important;background:transparent;font-weight:800;font-size:15px;cursor:pointer;color:#0B0B0C;}';
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
          return;
        }
        if (id === 'sticker') {
          if (typeof window.openStickerSheet === 'function') window.openStickerSheet();
          return;
        }
        if (id === 'photo') return clickFile('chatFilePhotos');
        if (id === 'video') return clickFile('chatFileVideos');
        if (id === 'file') return clickFile('chatFileDocs');
        if (id === 'camera') return clickFile('chatFileCamera');
        if (id === 'audio') {
          if (typeof window.startChatAudioRecord === 'function') window.startChatAudioRecord();
          return;
        }
        if (id === 'loc' && typeof window.sendChatLocation === 'function') window.sendChatLocation();
      } catch (e) {}
    }, 50);
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
        var ic =
          it.id === 'gif'
            ? '<div class="ic"><span class="ic-gif">GIF</span></div>'
            : '<div class="ic">' + (ICONS[it.id] || '') + '</div>';
        return (
          '<button type="button" class="opt" data-a="' +
          it.id +
          '">' +
          ic +
          '<span>' +
          it.label +
          '</span></button>'
        );
      })
      .join('');
    sheet.innerHTML =
      '<div class="panel"><div class="handle"></div><h3>Anexar</h3><div class="sub">Escolhe o tipo de anexo</div><div class="grid">' +
      grid +
      '</div><button type="button" class="close" data-a="close">Fechar</button></div>';
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
    sheet.classList.add('open');
    keepChatOpen();
  }

  window.openChatAttachMenu = function () {
    openAttachSheet();
  };

  function wirePlus() {
    var btns = document.querySelectorAll('#chatAttachBtn, .chat-attach-btn, button[aria-label="Anexar"]');
    btns.forEach(function (btn, i) {
      if (i > 0) {
        try {
          btn.remove();
        } catch (e) {
          btn.style.display = 'none';
        }
        return;
      }
      if (btn.__attachSheetV3) return;
      btn.__attachSheetV3 = true;
      btn.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          openAttachSheet();
        },
        true
      );
    });
  }

  injectCSS();
  wirePlus();
  setTimeout(wirePlus, 400);
  setTimeout(wirePlus, 1500);
  try {
    new MutationObserver(wirePlus).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
