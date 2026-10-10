/**
 * Tchilo attach v4 — um GIF · emoji figurinha · swipe fechar
 */
(function () {
  'use strict';
  if (window.__tchiloChatAttachV4) return;
  window.__tchiloChatAttachV4 = true;

  /* emoji sorridente preto (figurinha) */
  var STICKER_ICON =
    '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9.2" stroke="#0B0B0C" stroke-width="1.7"/>' +
    '<circle cx="9" cy="10" r="1.15" fill="#0B0B0C"/>' +
    '<circle cx="15" cy="10" r="1.15" fill="#0B0B0C"/>' +
    '<path d="M8.2 14.2c1.1 1.4 2.6 2.1 3.8 2.1s2.7-.7 3.8-2.1" stroke="#0B0B0C" stroke-width="1.7" stroke-linecap="round" fill="none"/>' +
    '</svg>';

  var ICONS = {
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
      '#tchiloChatAttachSheet .panel{width:100%;max-width:480px;max-height:72vh;overflow:auto;background:var(--paper,#F6F1E7);color:#0B0B0C;border:0!important;border-radius:20px 20px 0 0;box-shadow:0 -8px 32px rgba(0,0,0,.12);padding:12px 14px calc(16px + env(safe-area-inset-bottom));transition:transform .2s;}' +
      '#tchiloChatAttachSheet .handle{width:40px;height:4px;background:#c8c5bc;border-radius:2px;margin:4px auto 12px;}' +
      '#tchiloChatAttachSheet h3{margin:0 0 4px;font-size:18px;font-weight:900;text-align:center;}' +
      '#tchiloChatAttachSheet .sub{text-align:center;font-size:13px;opacity:.55;margin-bottom:14px;}' +
      '#tchiloChatAttachSheet .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}' +
      '#tchiloChatAttachSheet .opt{border:0!important;border-radius:14px;background:#fff;padding:16px 8px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.04);}' +
      '#tchiloChatAttachSheet .opt .ic{background:transparent!important;padding:0;display:flex;align-items:center;justify-content:center;min-height:30px;}' +
      '#tchiloChatAttachSheet .opt .ic-gif{font:800 17px system-ui,sans-serif;letter-spacing:.06em;color:#0B0B0C;}' +
      '#tchiloChatAttachSheet .opt span{font-size:12px;font-weight:700;color:#0B0B0C;}' +
      '#tchiloChatAttachSheet .close{width:100%;margin-top:14px;padding:14px;border-radius:14px;border:1px solid rgba(11,11,12,.1)!important;background:transparent;font-weight:800;font-size:15px;cursor:pointer;color:#0B0B0C;}';
  }

  function bindSwipe(panel, onClose) {
    if (!panel || panel.__swipe) return;
    panel.__swipe = true;
    var startY = 0,
      dy = 0;
    panel.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches[0]) startY = e.touches[0].clientY;
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
        if (dy > 70) onClose();
        panel.style.transform = '';
        dy = 0;
      },
      { passive: true }
    );
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
    }, 40);
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
      { id: 'gif', label: '' },
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
        var ic;
        if (it.id === 'gif') {
          /* só o texto GIF grande — sem label duplicado */
          ic = '<div class="ic"><span class="ic-gif">GIF</span></div>';
        } else if (it.id === 'sticker') {
          ic = '<div class="ic">' + STICKER_ICON + '</div>';
        } else {
          ic = '<div class="ic">' + (ICONS[it.id] || '') + '</div>';
        }
        var lab = it.label ? '<span>' + it.label + '</span>' : '';
        return (
          '<button type="button" class="opt" data-a="' +
          it.id +
          '">' +
          ic +
          lab +
          '</button>'
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
    var panel = sheet.querySelector('.panel');
    bindSwipe(panel, function () {
      closeSheet();
      keepChatOpen();
    });
    sheet.classList.add('open');
    keepChatOpen();
  }

  window.openChatAttachMenu = function () {
    openAttachSheet();
  };

  /* swipe em sheets GIF/sticker do compositor */
  function enhanceOtherSheets() {
    ['tchiloGifSheet', 'tchiloStickerSheet'].forEach(function (id) {
      var sheet = document.getElementById(id);
      if (!sheet) return;
      var panel = sheet.querySelector('.panel') || sheet.firstElementChild;
      if (!panel) return;
      bindSwipe(panel, function () {
        sheet.classList.remove('open');
        sheet.style.display = 'none';
      });
    });
  }

  function wirePlus() {
    var btns = document.querySelectorAll(
      '#chatScreen #chatAttachBtn, #chatScreen .chat-attach-btn, #chatScreen button[aria-label="Anexar"]'
    );
    var first = null;
    btns.forEach(function (btn) {
      if (!first) {
        first = btn;
        if (!btn.__attachV4) {
          btn.__attachV4 = true;
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
      } else {
        try {
          btn.parentNode.removeChild(btn);
        } catch (e) {
          btn.style.display = 'none';
        }
      }
    });
  }

  injectCSS();
  wirePlus();
  enhanceOtherSheets();
  setTimeout(wirePlus, 400);
  setTimeout(enhanceOtherSheets, 800);
  setTimeout(wirePlus, 2000);
  try {
    new MutationObserver(function () {
      wirePlus();
      enhanceOtherSheets();
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
