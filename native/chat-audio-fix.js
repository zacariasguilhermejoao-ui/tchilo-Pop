/**
 * tchilo-Pop — áudio nas conversas (gravar, enviar, ouvir)
 * Funciona em Android / iPhone (WebView Capacitor)
 */
(function () {
  'use strict';

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
      else if (typeof window.tchiloToast === 'function') window.tchiloToast(msg);
    } catch (e) {}
  }

  function tmsg(pt, en) {
    try {
      if (typeof t === 'function') return t(pt);
    } catch (e) {}
    return pt;
  }

  function pickMime() {
    if (typeof MediaRecorder === 'undefined') return '';
    var candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
    for (var i = 0; i < candidates.length; i++) {
      try {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidates[i])) {
          return candidates[i];
        }
      } catch (e) {}
    }
    return '';
  }

  function extForMime(mime) {
    var m = String(mime || '').toLowerCase();
    if (m.indexOf('mp4') >= 0 || m.indexOf('aac') >= 0 || m.indexOf('m4a') >= 0) return 'm4a';
    if (m.indexOf('ogg') >= 0) return 'ogg';
    if (m.indexOf('mpeg') >= 0 || m.indexOf('mp3') >= 0) return 'mp3';
    return 'webm';
  }

  function injectCSS() {
    if (document.getElementById('tchiloChatAudioCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloChatAudioCSS';
    st.textContent =
      '#chatScreen .chat-input-bar{display:flex;align-items:center;gap:8px;}' +
      '#chatMicBtn{flex:0 0 40px;width:40px;height:40px;border-radius:50%;border:0;' +
      'background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;' +
      'font-size:18px;cursor:pointer;}' +
      '#chatMicBtn.rec{background:#c00;animation:tchiloMicPulse 1s infinite;}' +
      '@keyframes tchiloMicPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}' +
      '#chatScreen .bubble audio.bubble-media{width:min(240px,70vw);margin-top:4px;height:36px;}' +
      '#chatRecBar.show{display:flex!important;}' +
      '#chatRecBar{display:none;align-items:center;gap:10px;padding:10px 12px;' +
      'background:rgba(0,0,0,.85);color:#fff;}' +
      '#chatRecBar .chat-rec-dot{width:10px;height:10px;border-radius:50%;background:#f44;' +
      'animation:tchiloMicPulse 1s infinite;}' +
      '#chatRecBar .send-rec{background:#c8f560;color:#111;border:0;border-radius:10px;' +
      'padding:8px 14px;font-weight:800;}';
    document.head.appendChild(st);
  }

  function ensureMicBtn() {
    var bar = document.querySelector('#chatScreen .chat-input-bar');
    if (!bar) return;
    if (document.getElementById('chatMicBtn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'chatMicBtn';
    btn.setAttribute('aria-label', 'Gravar áudio');
    btn.title = 'Gravar áudio';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">' +
      '<path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"/>' +
      '<path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"/></svg>';
    var send = bar.querySelector('.chat-send');
    if (send) bar.insertBefore(btn, send);
    else bar.appendChild(btn);

    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (window.__tchiloChatRec && window.__tchiloChatRec.recorder) {
        stopAndSend();
      } else {
        startRecord();
      }
    };
  }

  function stopTracks(stream) {
    if (!stream) return;
    try {
      stream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
    } catch (e) {}
  }

  async function startRecord() {
    if (!window.currentChatUser && typeof currentChatUser !== 'undefined' && !currentChatUser) {
      toast(tmsg('Abre uma conversa primeiro'));
      return;
    }
    if (typeof currentChatUser !== 'undefined' && !currentChatUser) {
      toast(tmsg('Abre uma conversa primeiro'));
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast(tmsg('Microfone não suportado neste dispositivo'));
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      toast(tmsg('Gravação de áudio não suportada'));
      return;
    }

    try {
      // cancel previous
      if (window.__tchiloChatRec) {
        try {
          cancelRecord(true);
        } catch (e0) {}
      }

      var stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      var mime = pickMime();
      var options = mime ? { mimeType: mime } : undefined;
      var rec;
      try {
        rec = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      } catch (e1) {
        rec = new MediaRecorder(stream);
      }

      var chunks = [];
      rec.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      rec.onerror = function () {
        toast(tmsg('Erro ao gravar áudio'));
        stopTracks(stream);
        hideRecUI();
        window.__tchiloChatRec = null;
      };

      rec.onstop = function () {
        stopTracks(stream);
        hideRecUI();
        var type = (rec.mimeType || mime || 'audio/webm').split(';')[0];
        var blob = new Blob(chunks, { type: type });
        if (!blob || blob.size < 200) {
          toast(tmsg('Áudio demasiado curto — grava de novo'));
          window.__tchiloChatRec = null;
          return;
        }
        var ext = extForMime(type);
        var file;
        try {
          file = new File([blob], 'audio_' + Date.now() + '.' + ext, { type: type });
        } catch (e2) {
          file = blob;
          file.name = 'audio_' + Date.now() + '.' + ext;
        }

        if (typeof setChatPending === 'function') {
          setChatPending(file, 'audio');
        } else {
          window.__tchiloChatPending = {
            blob: file,
            fileName: file.name || 'audio.' + ext,
            mime: type,
            fileSize: blob.size,
            kind: 'audio'
          };
        }

        window.__tchiloChatRec = null;

        // enviar logo a seguir
        setTimeout(function () {
          if (typeof sendChat === 'function') {
            sendChat().catch(function (err) {
              console.warn(err);
              toast((err && err.message) || tmsg('Não foi possível enviar o áudio'));
            });
          }
        }, 80);
      };

      window.__tchiloChatRec = {
        recorder: rec,
        stream: stream,
        started: Date.now(),
        chunks: chunks
      };

      // timeslice ajuda Android/iOS a encher chunks
      try {
        rec.start(250);
      } catch (e3) {
        rec.start();
      }

      showRecUI();
      toast(tmsg('A gravar… toca em Enviar para mandar'));
    } catch (err) {
      console.warn(err);
      var msg = (err && err.message) || '';
      if (/Permission|NotAllowed|Denied/i.test(msg) || (err && err.name === 'NotAllowedError')) {
        toast(tmsg('Permite o MICROFONE nas definições do telemóvel'));
      } else {
        toast(msg || tmsg('Não foi possível gravar áudio'));
      }
    }
  }

  function showRecUI() {
    var bar = document.getElementById('chatRecBar');
    if (bar) bar.classList.add('show');
    var label = document.getElementById('chatRecLabel');
    if (label) label.textContent = tmsg('A gravar…');
    var mic = document.getElementById('chatMicBtn');
    if (mic) mic.classList.add('rec');
  }

  function hideRecUI() {
    var bar = document.getElementById('chatRecBar');
    if (bar) bar.classList.remove('show');
    var mic = document.getElementById('chatMicBtn');
    if (mic) mic.classList.remove('rec');
  }

  function cancelRecord(silent) {
    var st = window.__tchiloChatRec;
    if (!st) {
      hideRecUI();
      return;
    }
    try {
      if (st.recorder) {
        st.recorder.onstop = function () {
          stopTracks(st.stream);
        };
        if (st.recorder.state !== 'inactive') st.recorder.stop();
      }
    } catch (e) {
      stopTracks(st.stream);
    }
    window.__tchiloChatRec = null;
    hideRecUI();
    if (!silent) toast(tmsg('Gravação cancelada'));
  }

  function stopAndSend() {
    var st = window.__tchiloChatRec;
    if (!st || !st.recorder) return;
    var elapsed = Date.now() - (st.started || 0);
    if (elapsed < 400) {
      toast(tmsg('Mantém a gravar um pouco mais'));
      return;
    }
    try {
      if (st.recorder.state !== 'inactive') st.recorder.stop();
    } catch (e) {
      toast(tmsg('Erro ao finalizar áudio'));
    }
  }

  // Expor API global (substitui as do index se existirem)
  window.startChatAudioRecord = startRecord;
  window.stopAndSendChatAudio = stopAndSend;
  window.cancelChatAudio = function () {
    cancelRecord(false);
  };

  // Patch setChatPending se mime de áudio vier vazio
  var origPending = window.setChatPending;
  if (typeof origPending === 'function') {
    window.setChatPending = function (file, kind) {
      if (file && kind === 'audio') {
        try {
          if (!file.type || file.type === 'application/octet-stream') {
            var mime = pickMime().split(';')[0] || 'audio/webm';
            // não dá para mutar File.type; setChatPending usa file.type
          }
        } catch (e) {}
      }
      return origPending.apply(this, arguments);
    };
  }

  function boot() {
    injectCSS();
    ensureMicBtn();
    [200, 800, 2000].forEach(function (ms) {
      setTimeout(function () {
        injectCSS();
        ensureMicBtn();
      }, ms);
    });

    // quando abres o chat
    if (typeof window.openChat === 'function' && !window.openChat.__audioFix) {
      var oc = window.openChat;
      window.openChat = function () {
        var r = oc.apply(this, arguments);
        setTimeout(ensureMicBtn, 50);
        setTimeout(ensureMicBtn, 300);
        return r;
      };
      window.openChat.__audioFix = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
