/**
 * Tchilo chat UI v4
 * remove 2º + · sem círculo preto no + · input fino · mic/enviar limpos
 */
(function () {
  'use strict';
  if (window.__tchiloChatUiCleanV4) return;
  window.__tchiloChatUiCleanV4 = true;

  var PLUS =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var MIC =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>';
  var SEND =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

  var CSS =
    'html body #chatScreen .chat-input-bar,' +
    'html body #chatScreen .tchilo-chat-bar{' +
    'border-top:1px solid rgba(11,11,12,.12)!important;' +
    'border-bottom:0!important;box-shadow:none!important;}' +
    'html body #chatScreen .chat-header,' +
    'html body #chatScreen .chat-top,' +
    'html body #chatScreen > .topbar{' +
    'border-bottom:1px solid rgba(11,11,12,.1)!important;box-shadow:none!important;}' +
    'html body #chatScreen #chatInput,' +
    'html body #chatScreen .chat-input-bar input{' +
    'border:1px solid rgba(11,11,12,.14)!important;' +
    'border-width:1px!important;border-radius:22px!important;' +
    'background:#fff!important;box-shadow:none!important;}' +
    /* vencer regra preta do index: .chat-attach-btn{background:var(--ink)!important;border-radius:50%} */
    'html body #chatScreen .chat-attach-btn,' +
    'html body #chatScreen #chatAttachBtn,' +
    'html body #chatScreen button.chat-attach-btn,' +
    'html body #chatScreen button#chatAttachBtn{' +
    'width:40px!important;height:40px!important;min-width:40px!important;' +
    'border:0!important;border-radius:0!important;' +
    'background:transparent!important;background-color:transparent!important;' +
    'box-shadow:none!important;color:#0B0B0C!important;' +
    'padding:0!important;margin:0!important;' +
    'display:inline-flex!important;align-items:center!important;justify-content:center!important;}' +
    'html body #chatScreen #tchiloChatAudioBtn,' +
    'html body #chatScreen #chatMicBtn{' +
    'width:40px!important;height:40px!important;border:0!important;border-radius:0!important;' +
    'background:transparent!important;box-shadow:none!important;padding:0!important;}' +
    'html body #chatScreen .chat-send,' +
    'html body #chatScreen button.chat-send{' +
    'width:40px!important;height:40px!important;border:0!important;border-radius:0!important;' +
    'background:transparent!important;box-shadow:none!important;padding:0!important;color:#0B0B0C!important;}' +
    'html body #chatScreen #tchiloChatGifBtn,' +
    'html body #chatScreen #tchiloChatStickerBtn{display:none!important;width:0!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;border:0!important;}';

  function injectCSS() {
    var st = document.getElementById('tchiloChatUiCleanCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatUiCleanCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS;
    /* matar CSS do compositor que põe 3px e 2.5px */
    try {
      var old = document.getElementById('tchiloChatComposerCSS');
      if (old) old.textContent = '';
    } catch (e) {}
  }

  function setIcon(el, html) {
    if (!el) return;
    try {
      el.innerHTML = html;
    } catch (e) {}
  }

  function forceStyle(el, css) {
    if (!el) return;
    try {
      el.setAttribute('style', css);
    } catch (e) {}
  }

  function polish() {
    injectCSS();
    var bar =
      document.querySelector('#chatScreen .chat-input-bar') ||
      document.querySelector('.chat-input-bar');
    if (!bar) return;

    var candidates = Array.prototype.slice.call(
      bar.querySelectorAll(
        '.chat-attach-btn, #chatAttachBtn, button[aria-label="Anexar"], button[title="Anexar"]'
      )
    );
    /* também botões cujo texto é só + */
    Array.prototype.slice.call(bar.querySelectorAll('button')).forEach(function (b) {
      var t = (b.textContent || '').replace(/\s/g, '');
      if ((t === '+' || t === '++') && candidates.indexOf(b) < 0) candidates.push(b);
    });

    var kept = null;
    candidates.forEach(function (p) {
      if (!kept) {
        kept = p;
        p.id = 'chatAttachBtn';
        p.className = 'chat-attach-btn';
        setIcon(p, PLUS);
        forceStyle(
          p,
          'width:40px;height:40px;min-width:40px;border:0;border-radius:0;background:transparent;background-color:transparent;box-shadow:none;padding:0;margin:0;display:inline-flex;align-items:center;justify-content:center;color:#0B0B0C;'
        );
      } else {
        try {
          p.parentNode && p.parentNode.removeChild(p);
        } catch (e) {
          p.style.display = 'none';
        }
      }
    });

    var mic =
      document.getElementById('tchiloChatAudioBtn') ||
      document.getElementById('chatMicBtn');
    if (mic) {
      setIcon(mic, MIC);
      forceStyle(
        mic,
        'width:40px;height:40px;border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;display:inline-flex;align-items:center;justify-content:center;'
      );
    }

    var send = bar.querySelector('.chat-send');
    if (send) {
      setIcon(send, SEND);
      forceStyle(
        send,
        'width:40px;height:40px;border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;display:inline-flex;align-items:center;justify-content:center;color:#0B0B0C;'
      );
    }

    var inp = document.getElementById('chatInput') || bar.querySelector('input');
    if (inp) {
      forceStyle(
        inp,
        (inp.getAttribute('style') || '') +
          ';border:1px solid rgba(11,11,12,.14)!important;border-radius:22px;background:#fff;box-shadow:none;'
      );
    }
  }

  injectCSS();
  polish();
  [30, 100, 300, 800, 1500, 3000, 6000].forEach(function (ms) {
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
