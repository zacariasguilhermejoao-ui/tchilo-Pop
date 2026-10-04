/**
 * tchilo-Pop — áudio nas conversas (gravar, enviar, ouvir)
 */
(function () {
  'use strict';

  var recTimerId = null;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
      else if (typeof window.tchiloToast === 'function') window.tchiloToast(msg);
    } catch (e) {}
  }

  function tmsg(pt) {
    try {
      if (typeof t === 'function') return t(pt);
    } catch (e) {}
    return pt;
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function pickMime() {
    if (typeof MediaRecorder === 'undefined') return '';
    var candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg;codecs=opus', 'audio/ogg'];
    for (var i = 0; i < candidates.length; i++) {
      try {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
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
      'background:var(--pink,#ff4b75);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}' +
      '#chatMicBtn.rec{background:#c00;animation:tchiloMicPulse 1s infinite;}' +
      '@keyframes tchiloMicPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}' +
      '#chatRecBar.show{display:flex!important;}' +
      '#chatRecBar{display:none;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,.85);color:#fff;}' +
      '#chatRecBar .chat-rec-dot{width:10px;height:10px;border-radius:50%;background:#f44;animation:tchiloMicPulse 1s infinite;}' +
      '#chatRecBar .chat-rec-time{font-variant-numeric:tabular-nums;font-weight:800;font-size:16px;min-width:42px;}' +
      '#chatRecBar .send-rec{background:#c8f560;color:#111;border:0;border-radius:10px;padding:8px 14px;font-weight:800;}' +
      '.bubble-audio-wrap{display:flex;flex-direction:column;gap:4px;min-width:160px;}' +
      '.bubble-audio-wrap .ba-dur{font-size:12px;font-weight:700;opacity:.85;}' +
      '.bubble-audio-wrap audio{width:min(220px,65vw);height:36px;}';
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
      if (window.__tchiloChatRec && window.__tchiloChatRec.recorder) stopAndSend();
      else startRecord();
    };
  }

  function stopTracks(stream) {
    if (!stream) return;
    try { stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); } catch (e) {}
  }

  function clearRecTimer() {
    if (recTimerId) { clearInterval(recTimerId); recTimerId = null; }
  }

  function startRecTimer(startedAt) {
    clearRecTimer();
    function tick() {
      var el = document.getElementById('chatRecLabel');
      if (!el) return;
      var sec = Math.floor((Date.now() - startedAt) / 1000);
      el.innerHTML = '<span class="chat-rec-time">' + fmtTime(sec) + '</span> <span style="font-weight:600;opacity:.9">' + tmsg('A gravar') + '</span>';
    }
    tick();
    recTimerId = setInterval(tick, 250);
  }

  async function startRecord() {
    if (typeof currentChatUser !== 'undefined' && !currentChatUser) { toast(tmsg('Abre uma conversa primeiro')); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast(tmsg('Microfone não suportado')); return; }
    if (typeof MediaRecorder === 'undefined') { toast(tmsg('Gravação não suportada')); return; }
    try {
      if (window.__tchiloChatRec) { try { cancelRecord(true); } catch (e0) {} }
      var stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      var mime = pickMime();
      var options = mime ? { mimeType: mime } : undefined;
      var rec;
      try { rec = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream); } catch (e1) { rec = new MediaRecorder(stream); }
      var chunks = [];
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onerror = function () { toast(tmsg('Erro ao gravar')); stopTracks(stream); hideRecUI(); window.__tchiloChatRec = null; };
      var startedAt = Date.now();
      rec.onstop = function () {
        clearRecTimer(); stopTracks(stream); hideRecUI();
        var type = (rec.mimeType || mime || 'audio/webm').split(';')[0];
        var blob = new Blob(chunks, { type: type });
        var durationSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        if (!blob || blob.size < 200) { toast(tmsg('Áudio demasiado curto')); window.__tchiloChatRec = null; return; }
        var ext = extForMime(type);
        var file;
        try { file = new File([blob], 'audio.' + ext, { type: type }); } catch (e2) { file = blob; file.name = 'audio.' + ext; }
        if (typeof setChatPending === 'function') setChatPending(file, 'audio');
        window.__tchiloChatPending = window.__tchiloChatPending || {};
        window.__tchiloChatPending.blob = file;
        window.__tchiloChatPending.fileName = 'audio';
        window.__tchiloChatPending.mime = type;
        window.__tchiloChatPending.fileSize = blob.size;
        window.__tchiloChatPending.kind = 'audio';
        window.__tchiloChatPending.duration = durationSec;
        window.__tchiloChatRec = null;
      };
      window.__tchiloChatRec = { recorder: rec, stream: stream, started: startedAt, chunks: chunks };
      try { rec.start(250); } catch (e3) { rec.start(); }
      showRecUI(); startRecTimer(startedAt);
    } catch (err) {
      var msg = (err && err.message) || '';
      if (/Permission|NotAllowed|Denied/i.test(msg) || (err && err.name === 'NotAllowedError')) toast(tmsg('Permite o MICROFONE nas definições'));
      else toast(msg || tmsg('Não foi possível gravar'));
    }
  }

  function showRecUI() {
    var bar = document.getElementById('chatRecBar');
    if (bar) { bar.classList.add('show'); var sendBtn = bar.querySelector('.send-rec'); if (sendBtn) sendBtn.textContent = tmsg('Parar'); }
    var label = document.getElementById('chatRecLabel'); if (label) label.textContent = '0:00';
    var mic = document.getElementById('chatMicBtn'); if (mic) mic.classList.add('rec');
  }

  function hideRecUI() {
    clearRecTimer();
    var bar = document.getElementById('chatRecBar'); if (bar) bar.classList.remove('show');
    var mic = document.getElementById('chatMicBtn'); if (mic) mic.classList.remove('rec');
  }

  function cancelRecord(silent) {
    var st = window.__tchiloChatRec;
    if (!st) { hideRecUI(); return; }
    try {
      if (st.recorder) {
        st.recorder.onstop = function () { stopTracks(st.stream); };
        if (st.recorder.state !== 'inactive') st.recorder.stop();
      }
    } catch (e) { stopTracks(st.stream); }
    window.__tchiloChatRec = null;
    hideRecUI();
    if (!silent) toast(tmsg('Gravação cancelada'));
  }

  function stopAndSend() {
    var st = window.__tchiloChatRec;
    if (!st || !st.recorder) return;
    if (Date.now() - (st.started || 0) < 400) { toast(tmsg('Mantém a gravar um pouco mais')); return; }
    try { if (st.recorder.state !== 'inactive') st.recorder.stop(); } catch (e) { toast(tmsg('Erro ao finalizar')); }
  }

  window.startChatAudioRecord = startRecord;
  window.stopAndSendChatAudio = stopAndSend;
  window.cancelChatAudio = function () { cancelRecord(false); };

  function boot() {
    injectCSS();
    ensureMicBtn();
    [200, 800, 2000, 4000].forEach(function (ms) {
      setTimeout(function () { injectCSS(); ensureMicBtn(); }, ms);
    });
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

  // Obrigatório: compose UI + WebRTC (cache-bust)
  (function loadFixes() {
    function add(src) {
      var name = src.split('/').pop().split('?')[0];
      if (document.querySelector('script[src*="' + name + '"]')) return;
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      (document.body || document.documentElement).appendChild(s);
    }
    add('native/chat-compose-fix.js?v=3');
    add('native/chat-call-webrtc.js?v=3');
  })();
})();
