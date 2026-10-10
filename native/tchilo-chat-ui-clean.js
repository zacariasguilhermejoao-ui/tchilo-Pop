/**
 * Tchilo chat UI v3 — força estilo (ganha ao compositor)
 */
(function () {
  'use strict';
  if (window.__tchiloChatUiCleanV3) return;
  window.__tchiloChatUiCleanV3 = true;

  var PLUS =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var MIC =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
  var SEND =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  var CSS =
    '/* chat force v3 */' +
    '#chatScreen .chat-input-bar,' +
    '#chatScreen .tchilo-chat-bar,' +
    '#chatScreen div.chat-input-bar,' +
    'body #chatScreen .chat-input-bar{' +
    'border-top:1px solid rgba(11,11,12,.12)!important;' +
    'border-top-width:1px!important;border-top-style:solid!important;' +
    'border-top-color:rgba(11,11,12,.12)!important;' +
    'border-bottom:0!important;border-left:0!important;border-right:0!important;' +
    'box-shadow:none!important;}' +
    '#chatScreen .chat-top,#chatScreen .chat-header,#chatScreen > header,' +
    '#chatScreen .topbar,body #chatScreen .chat-header{' +
    'border-bottom:1px solid rgba(11,11,12,.1)!important;' +
    'border-bottom-width:1px!important;box-shadow:none!important;}' +
    '#chatScreen #chatInput,' +
    '#chatScreen .chat-input-bar input,' +
    '#chatScreen input#chatInput,' +
    'body #chatScreen input[type="text"]{' +
    'border:1px solid rgba(11,11,12,.15)!important;' +
    'border-width:1px!important;' +
    'border-color:rgba(11,11,12,.15)!important;' +
    'border-radius:22px!important;' +
    'background:#fff!important;' +
    'box-shadow:none!important;outline:none!important;}' +
    '#chatScreen .chat-attach-btn,' +
    '#chatScreen #chatAttachBtn,' +
    '#chatScreen button.chat-attach-btn,' +
    'body #chatScreen .chat-attach-btn{' +
    'width:40px!important;height:40px!important;' +
    'border:0!important;border-width:0!important;' +
    'border-radius:0!important;' +
    'background:transparent!important;' +
    'box-shadow:none!important;padding:0!important;' +
    'color:#0B0B0C!important;}' +
    '#chatScreen #tchiloChatAudioBtn,' +
    '#chatScreen button#tchiloChatAudioBtn{' +
    'width:40px!important;height:40px!important;' +
    'border:0!important;border-radius:0!important;' +
    'background:transparent!important;box-shadow:none!important;padding:0!important;}' +
    '#chatScreen .chat-send,' +
    '#chatScreen button.chat-send{' +
    'width:40px!important;height:40px!important;' +
    'border:0!important;border-radius:0!important;' +
    'background:transparent!important;box-shadow:none!important;padding:0!important;' +
    'color:#0B0B0C!important;}' +
    '#chatScreen #tchiloChatGifBtn,#chatScreen #tchiloChatStickerBtn{display:none!important;}' +
    '#chatScreen .tchilo-chat-tool{border:0!important;background:transparent!important;}';

  function injectCSS() {
    var st = document.getElementById('tchiloChatUiCleanCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatUiCleanCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS;
    /* neutralizar CSS do compositor */
    try {
      var old = document.getElementById('tchiloChatComposerCSS');
      if (old) {
        old.textContent = (old.textContent || '')
          .replace(/border-top:3px solid[^;!]+!?important;?/gi, 'border-top:1px solid rgba(11,11,12,.12)!important;')
          .replace(/border:2\.5px solid[^;!]+!?important;?/gi, 'border:1px solid rgba(11,11,12,.15)!important;')
          .replace(/border-radius:50%!important/gi, 'border-radius:0!important');
      }
    } catch (e) {}
  }

  function setIcon(el, html) {
    if (!el) return;
    try {
      el.innerHTML = html;
    } catch (e) {}
  }

  function polish() {
    injectCSS();
    var bar =
      document.querySelector('#chatScreen .chat-input-bar') ||
      document.querySelector('.chat-input-bar');
    if (!bar) return;

    /* remover + duplicados do DOM */
    var pluses = Array.prototype.slice.call(
      bar.querySelectorAll('.chat-attach-btn, #chatAttachBtn, button[aria-label="Anexar"]')
    );
    var kept = null;
    pluses.forEach(function (p, i) {
      if (!kept) {
        kept = p;
        setIcon(p, PLUS);
        p.style.cssText =
          'width:40px;height:40px;border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;display:inline-flex;align-items:center;justify-content:center;';
      } else {
        try {
          p.remove();
        } catch (e) {
          p.style.display = 'none';
        }
      }
    });

    /* se ainda houver texto "+ +" num botão, limpar */
    bar.querySelectorAll('button').forEach(function (b) {
      var t = (b.textContent || '').replace(/\s/g, '');
      if (t === '++' || t === '+') {
        if (b !== kept) {
          try {
            b.remove();
          } catch (e) {
            b.style.display = 'none';
          }
        } else setIcon(b, PLUS);
      }
    });

    var mic = document.getElementById('tchiloChatAudioBtn');
    if (mic) {
      setIcon(mic, MIC);
      mic.style.cssText =
        'width:40px;height:40px;border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;display:inline-flex;align-items:center;justify-content:center;';
    }

    var send = bar.querySelector('.chat-send');
    if (send) {
      setIcon(send, SEND);
      send.style.cssText =
        'width:40px;height:40px;border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;display:inline-flex;align-items:center;justify-content:center;color:#0B0B0C;';
    }

    var inp = document.getElementById('chatInput') || bar.querySelector('input');
    if (inp) {
      inp.style.border = '1px solid rgba(11,11,12,.15)';
      inp.style.borderRadius = '22px';
      inp.style.background = '#fff';
      inp.style.boxShadow = 'none';
    }
  }

  injectCSS();
  polish();
  [50, 200, 500, 1000, 2000, 4000].forEach(function (ms) {
    setTimeout(polish, ms);
  });

  try {
    new MutationObserver(function () {
      polish();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
