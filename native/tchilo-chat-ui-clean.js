/**
 * Tchilo — barra de chat limpa
 * linha fina · input branco · + sem círculo · mic · enviar profissional
 */
(function () {
  'use strict';
  if (window.__tchiloChatUiCleanV1) return;
  window.__tchiloChatUiCleanV1 = true;

  var PLUS =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  var MIC =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>' +
    '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>' +
    '<line x1="12" y1="19" x2="12" y2="23"/>' +
    '<line x1="8" y1="23" x2="16" y2="23"/>' +
    '</svg>';

  var SEND =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
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
      /* linha superior fina */
      '#chatScreen .chat-input-bar,' +
      '#chatScreen .tchilo-chat-bar,' +
      '.chat-input-bar{' +
      'border-top:1px solid rgba(11,11,12,.12)!important;' +
      'border-bottom:0!important;' +
      'gap:8px!important;' +
      'align-items:center!important;}' +
      /* campo mensagem: círculo fino, fundo branco */
      '#chatScreen .chat-input-bar input,' +
      '#chatScreen #chatInput,' +
      '.chat-input-bar input,' +
      '#chatInput{' +
      'border:1px solid rgba(11,11,12,.2)!important;' +
      'border-radius:22px!important;' +
      'background:#fff!important;' +
      'box-shadow:none!important;' +
      'outline:none!important;' +
      'min-height:40px!important;' +
      'padding:10px 14px!important;}' +
      /* + sem círculo preto */
      '#chatScreen .chat-attach-btn,' +
      '.chat-attach-btn,' +
      '#chatAttachBtn{' +
      'width:40px!important;height:40px!important;' +
      'border:0!important;border-radius:0!important;' +
      'background:transparent!important;' +
      'box-shadow:none!important;' +
      'color:#0B0B0C!important;' +
      'padding:0!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;}' +
      /* ferramentas genéricas sem anel preto */
      '#chatScreen .tchilo-chat-tool{' +
      'border:0!important;' +
      'box-shadow:none!important;}' +
      /* mic — círculo cor sólida sem borda preta */
      '#chatScreen #tchiloChatAudioBtn,' +
      '#tchiloChatAudioBtn{' +
      'width:40px!important;height:40px!important;' +
      'border:0!important;border-radius:50%!important;' +
      'background:#FF2D55!important;' +
      'box-shadow:none!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'padding:0!important;}' +
      /* enviar — sem círculo preto */
      '#chatScreen .chat-send,' +
      '.chat-send{' +
      'width:40px!important;height:40px!important;' +
      'border:0!important;border-radius:50%!important;' +
      'background:#0B0B0C!important;' +
      'box-shadow:none!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'padding:0!important;color:#fff!important;}' +
      /* cabeçalho chat sem linha grossa */
      '#chatScreen .chat-top,' +
      '#chatScreen .chat-header,' +
      '.chat-topbar{' +
      'border-bottom:1px solid rgba(11,11,12,.1)!important;}';
  }

  function setIcon(el, html) {
    if (!el) return;
    try {
      el.innerHTML = html;
    } catch (e) {}
  }

  function polishIcons() {
    injectCSS();
    var bar =
      document.querySelector('#chatScreen .chat-input-bar') ||
      document.querySelector('.chat-input-bar');
    if (!bar) return;

    var plus =
      document.getElementById('chatAttachBtn') ||
      bar.querySelector('.chat-attach-btn');
    if (plus) setIcon(plus, PLUS);

    var mic = document.getElementById('tchiloChatAudioBtn');
    if (mic) setIcon(mic, MIC);

    var send = bar.querySelector('.chat-send');
    if (send) setIcon(send, SEND);

    /* esconder + duplicado se houver dois attach */
    try {
      var pluses = bar.querySelectorAll('.chat-attach-btn, #chatAttachBtn');
      if (pluses.length > 1) {
        for (var i = 1; i < pluses.length; i++) {
          pluses[i].style.display = 'none';
        }
      }
    } catch (e) {}
  }

  injectCSS();
  polishIcons();
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(polishIcons, ms);
  });

  try {
    new MutationObserver(function () {
      polishIcons();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
