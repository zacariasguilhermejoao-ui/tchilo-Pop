/**
 * Tchilo chat UI v6 — mic preto visível
 */
(function () {
  'use strict';
  if (window.__tchiloChatUiCleanV6) return;
  window.__tchiloChatUiCleanV6 = true;

  var PLUS =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#0B0B0C" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var MIC =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:#0B0B0C">' +
    '<rect x="9" y="2" width="6" height="12" rx="3" stroke="#0B0B0C"/>' +
    '<path d="M5 11a7 7 0 0 0 14 0" stroke="#0B0B0C"/>' +
    '<line x1="12" y1="18" x2="12" y2="22" stroke="#0B0B0C"/>' +
    '<line x1="8" y1="22" x2="16" y2="22" stroke="#0B0B0C"/>' +
    '</svg>';
  var SEND =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke="#0B0B0C"/>' +
    '</svg>';

  var CSS =
    'html body #chatScreen .chat-input-bar,html body #chatScreen .tchilo-chat-bar{' +
    'border-top:1px solid rgba(11,11,12,.12)!important;border-bottom:0!important;box-shadow:none!important;}' +
    'html body #chatScreen .chat-header,html body #chatScreen .chat-top,html body #chatScreen > .topbar{' +
    'border-bottom:1px solid rgba(11,11,12,.1)!important;box-shadow:none!important;}' +
    'html body #chatScreen #chatInput,html body #chatScreen .chat-input-bar input,html body #chatScreen textarea#chatInput{' +
    'border:1px solid rgba(11,11,12,.14)!important;border-width:1px!important;border-radius:22px!important;' +
    'background:#fff!important;box-shadow:none!important;}' +
    'html body #chatScreen .chat-attach-btn,html body #chatScreen #chatAttachBtn,' +
    'html body #chatScreen button.chat-attach-btn,html body #chatScreen button#chatAttachBtn{' +
    'width:40px!important;height:40px!important;min-width:40px!important;border:0!important;border-radius:0!important;' +
    'background:transparent!important;background-color:transparent!important;box-shadow:none!important;' +
    'color:#0B0B0C!important;padding:0!important;margin:0!important;' +
    'display:inline-flex!important;align-items:center!important;justify-content:center!important;}' +
    'html body #chatScreen #tchiloChatAudioBtn,html body #chatScreen #chatMicBtn{' +
    'width:40px!important;height:40px!important;border:0!important;border-radius:0!important;' +
    'background:transparent!important;box-shadow:none!important;padding:0!important;' +
    'color:#0B0B0C!important;}' +
    'html body #chatScreen #tchiloChatAudioBtn svg,html body #chatScreen #chatMicBtn svg,' +
    'html body #chatScreen #tchiloChatAudioBtn svg *,html body #chatScreen #chatMicBtn svg *{' +
    'stroke:#0B0B0C!important;color:#0B0B0C!important;fill:none!important;}' +
    'html body #chatScreen #tchiloChatAudioBtn.tchilo-mic-hide,' +
    'html body #chatScreen #chatMicBtn.tchilo-mic-hide{display:none!important;width:0!important;height:0!important;' +
    'opacity:0!important;pointer-events:none!important;margin:0!important;padding:0!important;overflow:hidden!important;}' +
    'html body #chatScreen .chat-send,html body #chatScreen button.chat-send{' +
    'width:40px!important;height:40px!important;border:0!important;border-radius:0!important;' +
    'background:transparent!important;box-shadow:none!important;padding:0!important;color:#0B0B0C!important;}' +
    'html body #chatScreen #tchiloChatGifBtn,html body #chatScreen #tchiloChatStickerBtn{' +
    'display:none!important;width:0!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;border:0!important;}';

  function injectCSS() {
    var st = document.getElementById('tchiloChatUiCleanCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatUiCleanCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS;
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

  function getMic() {
    return (
      document.getElementById('tchiloChatAudioBtn') ||
      document.getElementById('chatMicBtn') ||
      document.querySelector('#chatScreen button[aria-label="Áudio"], #chatScreen button[aria-label="Audio"]')
    );
  }

  function getInput() {
    return document.getElementById('chatInput') || document.querySelector('#chatScreen .chat-input-bar input, #chatScreen .chat-input-bar textarea');
  }

  function syncMicVisibility() {
    var inp = getInput();
    var mic = getMic();
    if (!mic) return;
    var hasText = !!(inp && String(inp.value || '').trim().length > 0);
    if (hasText) {
      mic.classList.add('tchilo-mic-hide');
      mic.style.display = 'none';
    } else {
      mic.classList.remove('tchilo-mic-hide');
      mic.style.display = 'inline-flex';
      setIcon(mic, MIC);
      forceStyle(
        mic,
        'width:40px;height:40px;border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;display:inline-flex;align-items:center;justify-content:center;color:#0B0B0C;'
      );
    }
  }

  function wireInput() {
    var inp = getInput();
    if (!inp || inp.__tchiloInputV6) return;
    inp.__tchiloInputV6 = true;

    inp.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          if (inp.tagName === 'TEXTAREA') {
            var start = inp.selectionStart;
            var end = inp.selectionEnd;
            var v = inp.value;
            inp.value = v.slice(0, start) + '\n' + v.slice(end);
            inp.selectionStart = inp.selectionEnd = start + 1;
          }
          return false;
        }
      },
      true
    );

    inp.addEventListener(
      'keypress',
      function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      },
      true
    );

    ['input', 'keyup', 'change', 'paste'].forEach(function (ev) {
      inp.addEventListener(ev, syncMicVisibility, true);
    });

    syncMicVisibility();
  }

  function dedupePlus(bar) {
    var candidates = Array.prototype.slice.call(
      bar.querySelectorAll(
        '.chat-attach-btn, #chatAttachBtn, button[aria-label="Anexar"], button[title="Anexar"]'
      )
    );
    Array.prototype.slice.call(bar.querySelectorAll('button')).forEach(function (b) {
      var t = (b.textContent || '').replace(/\s/g, '');
      if ((t === '+' || t === '++' || t === '＋') && candidates.indexOf(b) < 0) candidates.push(b);
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

    if (kept) {
      var raw = (kept.textContent || '').replace(/\s/g, '');
      if (raw.indexOf('+') >= 0 && !kept.querySelector('svg')) setIcon(kept, PLUS);
      if (kept.querySelector('svg') && kept.childNodes.length > 1) {
        Array.prototype.slice.call(kept.childNodes).forEach(function (n) {
          if (n.nodeType === 3) kept.removeChild(n);
        });
      }
    }
  }

  function polish() {
    injectCSS();
    var bar =
      document.querySelector('#chatScreen .chat-input-bar') ||
      document.querySelector('.chat-input-bar');
    if (!bar) return;

    dedupePlus(bar);

    var mic = getMic();
    if (mic && !mic.classList.contains('tchilo-mic-hide')) {
      setIcon(mic, MIC);
      forceStyle(
        mic,
        'width:40px;height:40px;border:0;border-radius:0;background:transparent;box-shadow:none;padding:0;display:inline-flex;align-items:center;justify-content:center;color:#0B0B0C;'
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

    wireInput();
    syncMicVisibility();
  }

  injectCSS();
  polish();
  [30, 100, 300, 800, 1500, 3000].forEach(function (ms) {
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
