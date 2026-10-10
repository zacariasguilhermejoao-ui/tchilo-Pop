/**
 * Tchilo chat UI v2
 * + sem círculo · mic limpo · enviar sem fundo · 1 só +
 */
(function () {
  'use strict';
  if (window.__tchiloChatUiCleanV2) return;
  window.__tchiloChatUiCleanV2 = true;

  var PLUS =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  var MIC =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="2" width="6" height="12" rx="3"/>' +
    '<path d="M5 11a7 7 0 0 0 14 0"/>' +
    '<line x1="12" y1="18" x2="12" y2="22"/>' +
    '<line x1="8" y1="22" x2="16" y2="22"/>' +
    '</svg>';

  var SEND =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<line x1="22" y1="2" x2="11" y2="13"/>' +
    '<polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
    '</svg>';

  function injectCSS() {
    var st = document.getElementById('tchiloChatUiCleanCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatUiCleanCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#chatScreen .chat-input-bar,#chatScreen .tchilo-chat-bar,.chat-input-bar{' +
      'border-top:1px solid rgba(11,11,12,.12)!important;border-bottom:0!important;' +
      'gap:6px!important;align-items:center!important;background:var(--paper,#F6F1E7)!important;}' +
      '#chatScreen .chat-input-bar input,#chatScreen #chatInput,.chat-input-bar input,#chatInput{' +
      'border:1px solid rgba(11,11,12,.18)!important;border-radius:22px!important;' +
      'background:#fff!important;box-shadow:none!important;outline:none!important;' +
      'min-height:40px!important;padding:10px 14px!important;}' +
      '#chatScreen .chat-attach-btn,#chatScreen #chatAttachBtn,.chat-attach-btn,#chatAttachBtn{' +
      'width:40px!important;height:40px!important;min-width:40px!important;' +
      'border:0!important;border-radius:0!important;background:transparent!important;' +
      'box-shadow:none!important;padding:0!important;margin:0!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;color:#0B0B0C!important;}' +
      '#chatScreen .chat-input-bar .chat-attach-btn~.chat-attach-btn,' +
      '#chatScreen .chat-input-bar #chatAttachBtn~.chat-attach-btn{display:none!important;}' +
      '#chatScreen #tchiloChatAudioBtn,#tchiloChatAudioBtn{' +
      'width:40px!important;height:40px!important;border:0!important;border-radius:0!important;' +
      'background:transparent!important;box-shadow:none!important;padding:0!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;}' +
      '#chatScreen .chat-send,.chat-send,#chatScreen button.chat-send{' +
      'width:40px!important;height:40px!important;border:0!important;border-radius:0!important;' +
      'background:transparent!important;box-shadow:none!important;padding:0!important;color:#0B0B0C!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;}' +
      '#chatScreen #tchiloChatGifBtn,#chatScreen #tchiloChatStickerBtn{display:none!important;}' +
      '#chatScreen .chat-top,#chatScreen .chat-header,.chat-topbar,#chatScreen>.topbar{' +
      'border-bottom:1px solid rgba(11,11,12,.1)!important;}' +
      '#chatScreen .bubble,.bubble{border:0!important;box-shadow:none!important;}';
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
    var pluses = bar.querySelectorAll('.chat-attach-btn, #chatAttachBtn');
    for (var i = 0; i < pluses.length; i++) {
      if (i === 0) {
        setIcon(pluses[i], PLUS);
        pluses[i].style.display = 'inline-flex';
      } else pluses[i].style.display = 'none';
    }
    var mic = document.getElementById('tchiloChatAudioBtn');
    if (mic) setIcon(mic, MIC);
    var send = bar.querySelector('.chat-send');
    if (send) setIcon(send, SEND);
  }

  injectCSS();
  polish();
  [100, 400, 1000, 2500].forEach(function (ms) {
    setTimeout(polish, ms);
  });
  try {
    new MutationObserver(polish).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
