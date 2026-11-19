/**
 * tchilo-Pop — Chamadas de voz/vídeo reais (WebRTC + Supabase Realtime signaling)
 * Usa o backend que já tens (SQL / Edge / colunas). Signaling via broadcast.
 */
(function () {
  'use strict';

  var ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  var pc = null;
  var localStream = null;
  var remoteStream = null;
  var myCallChannel = null;
  var currentCall = null;
  var pendingCandidates = [];

  function toast(msg) {
    try {
      if (typeof window.__tchiloRealShowToast === 'function') return window.__tchiloRealShowToast(msg);
      if (typeof showToast === 'function') return showToast(msg);
    } catch (e) {}
  }

  function tmsg(pt) {
    try { if (typeof t === 'function') return t(pt); } catch (e) {}
    return pt;
  }

  function SB() {
    return window.SB || window.tchiloSupabase || null;
  }

  function myUsername() {
    try {
      if (typeof getSession === 'function') {
        var s = getSession();
        if (s && s.username) return String(s.username);
      }
      if (window.session && window.session.username) return String(window.session.username);
    } catch (e) {}
    return '';
  }

  async function myUserId() {
    try {
      if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
      var s = SB();
      if (s && s.auth) {
        var auth = await s.auth.getSession();
        var u = auth && auth.data && auth.data.session && auth.data.session.user && auth.data.session.user.id;
        if (u) {
          window.__tchiloCloudUserId = u;
          return u;
        }
      }
    } catch (e) {}
    return null;
  }

  async function loadTurnServers() {
    try {
      var s = SB();
      if (!s) return;
      var res = await s.functions.invoke('turn-credentials', { body: {} });
      if (res && res.data) {
        var ice = res.data.iceServers || res.data.ice_servers || res.data;
        if (Array.isArray(ice) && ice.length) {
          ICE_SERVERS = ICE_SERVERS.concat(ice);
          return;
        }
      }
    } catch (e) {}
    try {
      if (window.TCHILO_TURN_URL && window.TCHILO_TURN_USER) {
        ICE_SERVERS.push({
          urls: window.TCHILO_TURN_URL,
          username: window.TCHILO_TURN_USER,
          credential: window.TCHILO_TURN_CRED || window.TCHILO_TURN_PASSWORD || ''
        });
      }
    } catch (e2) {}
  }

  var ICON = {
    mic: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    micOff: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18"/></svg>',
    cam: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg>',
    camOff: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3zM3 3l18 18"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  };
  var CALL_CSS =
    '#tchiloCallOverlay{display:none;position:fixed;inset:0;z-index:99999;background:#0B0B0C;color:#fff;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}' +
    '#tchiloCallOverlay .tc-av{width:96px;height:96px;border-radius:50%;background:#fff;color:#0B0B0C;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:800;z-index:2}' +
    '#tchiloCallOverlay .tc-name{font-size:22px;font-weight:800;z-index:2}' +
    '#tchiloCallOverlay .tc-status{font-size:14px;color:#A0A0A6;z-index:2}' +
    '#tchiloCallOverlay .tc-row{display:flex;gap:22px;margin-top:40px;z-index:3;align-items:center}' +
    '#tchiloCallOverlay .tc-btn{width:56px;height:56px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-appearance:none;appearance:none}' +
    '#tchiloCallOverlay .tc-btn.off{background:#fff;color:#0B0B0C}' +
    '#tchiloCallOverlay .tc-btn.end{width:64px;height:64px;background:#E5484D;color:#fff}' +
    '#tchiloCallOverlay .tc-btn.end svg,#tchiloCallOverlay .tc-btn.dec svg{transform:rotate(135deg)}' +
    '#tchiloCallOverlay .tc-btn.dec{width:68px;height:68px;background:#E5484D;color:#fff}' +
    '#tchiloCallOverlay .tc-btn.acc{width:68px;height:68px;background:#2EE6A6;color:#0B0B0C}' +
    '#tchiloCallOverlay .tc-lab{font-size:12px;color:#A0A0A6;margin-top:8px;text-align:center}' +
    '#tchiloCallOverlay .tc-col{display:flex;flex-direction:column;align-items:center}' +
    '#tchiloCallOverlay.has-video{justify-content:flex-end;padding-bottom:calc(36px + env(safe-area-inset-bottom))}' +
    '#tchiloCallOverlay.has-video .tc-name{position:absolute;top:calc(28px + env(safe-area-inset-top));left:0;right:0;text-align:center;text-shadow:0 1px 6px rgba(0,0,0,.6)}' +
    '#tchiloCallOverlay.has-video .tc-status{position:absolute;top:calc(60px + env(safe-area-inset-top));left:0;right:0;text-align:center;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)}' +
    '#tchiloCallOverlay.has-video .tc-row{margin-top:0}' +
    '#tchiloCallRemoteVideo{display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000;z-index:1}' +
    '#tchiloCallLocalVideo{display:none;width:110px;height:150px;object-fit:cover;border-radius:16px;background:#222;position:absolute;bottom:130px;right:18px;z-index:3;border:1px solid rgba(255,255,255,.3)}';
  function ensureCallUI() {
    if (document.getElementById('tchiloCallOverlay')) return;
    if (!document.getElementById('tchiloCallCss')) {
      var st = document.createElement('style');
      st.id = 'tchiloCallCss';
      st.textContent = CALL_CSS;
      document.head.appendChild(st);
    }
    var ov = document.createElement('div');
    ov.id = 'tchiloCallOverlay';
    ov.setAttribute('role', 'dialog');
    ov.innerHTML =
      '<video id="tchiloCallRemoteVideo" autoplay playsinline></video>' +
      '<div id="tchiloCallAvatar" class="tc-av"></div>' +
      '<div id="tchiloCallName" class="tc-name"></div>' +
      '<div id="tchiloCallStatus" class="tc-status">A ligar…</div>' +
      '<video id="tchiloCallLocalVideo" autoplay playsinline muted></video>' +
      '<div id="tchiloCallControls" class="tc-row">' +
      '<button type="button" id="tchiloCallMute" class="tc-btn" aria-label="Silenciar">' + ICON.mic + '</button>' +
      '<button type="button" id="tchiloCallHangup" class="tc-btn end" aria-label="Desligar">' + ICON.phone + '</button>' +
      '<button type="button" id="tchiloCallCam" class="tc-btn" aria-label="Câmara">' + ICON.cam + '</button>' +
      '</div>' +
      '<div id="tchiloCallRing" class="tc-row" style="display:none">' +
      '<div class="tc-col"><button type="button" id="tchiloCallDecline" class="tc-btn dec" aria-label="Recusar">' + ICON.phone + '</button><div class="tc-lab">Recusar</div></div>' +
      '<div class="tc-col"><button type="button" id="tchiloCallAccept" class="tc-btn acc" aria-label="Atender">' + ICON.phone + '</button><div class="tc-lab">Atender</div></div>' +
      '</div>';
    document.body.appendChild(ov);
    document.getElementById('tchiloCallHangup').onclick = function () { hangup(true); };
    document.getElementById('tchiloCallDecline').onclick = function () { declineCall(); };
    document.getElementById('tchiloCallAccept').onclick = function () { acceptCall(); };
    document.getElementById('tchiloCallMute').onclick = function () {
      if (!localStream) return;
      localStream.getAudioTracks().forEach(function (t) { t.enabled = !t.enabled; });
      var on = localStream.getAudioTracks().some(function (t) { return t.enabled; });
      this.innerHTML = on ? ICON.mic : ICON.micOff;
      this.classList.toggle('off', !on);
    };
    document.getElementById('tchiloCallCam').onclick = function () {
      if (!localStream) return;
      localStream.getVideoTracks().forEach(function (t) { t.enabled = !t.enabled; });
      var on = localStream.getVideoTracks().some(function (t) { return t.enabled; });
      this.innerHTML = on ? ICON.cam : ICON.camOff;
      this.classList.toggle('off', !on);
    };
  }
  function showCallUI(peerName, kind, status, ringing) {
    ensureCallUI();
    var ov = document.getElementById('tchiloCallOverlay');
    var nameEl = document.getElementById('tchiloCallName');
    var statusEl = document.getElementById('tchiloCallStatus');
    var avEl = document.getElementById('tchiloCallAvatar');
    var localV = document.getElementById('tchiloCallLocalVideo');
    var remoteV = document.getElementById('tchiloCallRemoteVideo');
    var camBtn = document.getElementById('tchiloCallCam');
    var ctl = document.getElementById('tchiloCallControls');
    var ring = document.getElementById('tchiloCallRing');
    var display = peerName || '';
    try {
      if (typeof resolveDisplayName === 'function') display = resolveDisplayName(peerName) || peerName;
    } catch (e) {}
    if (nameEl) nameEl.textContent = display;
    if (avEl) {
      avEl.style.display = 'flex';
      avEl.textContent = String(display).slice(0, 2).toUpperCase();
    }
    if (statusEl) statusEl.textContent = status || tmsg('A ligar…');
    if (camBtn) camBtn.style.display = kind === 'video' ? 'flex' : 'none';
    if (ctl) ctl.style.display = ringing ? 'none' : 'flex';
    if (ring) ring.style.display = ringing ? 'flex' : 'none';
    if (localV) {
      localV.style.display = kind === 'video' && !ringing ? 'block' : 'none';
      if (localStream) localV.srcObject = localStream;
    }
    var hasVideo = !!(remoteStream && remoteStream.getVideoTracks && remoteStream.getVideoTracks().length);
    ov.classList.toggle('has-video', hasVideo);
    if (remoteV && remoteStream) {
      remoteV.srcObject = remoteStream;
      remoteV.style.display = hasVideo ? 'block' : 'none';
      if (avEl) avEl.style.display = hasVideo ? 'none' : 'flex';
    }
    ov.style.display = 'flex';
  }
  function setStatus(text) {
    var el = document.getElementById('tchiloCallStatus');
    if (el) el.textContent = text;
  }

  function attachRemoteTrack(track) {
    if (!remoteStream) remoteStream = new MediaStream();
    remoteStream.addTrack(track);
    var remoteV = document.getElementById('tchiloCallRemoteVideo');
    var avEl = document.getElementById('tchiloCallAvatar');
    if (remoteV) {
      remoteV.srcObject = remoteStream;
      if (track.kind === 'video') {
        remoteV.style.display = 'block';
        if (avEl) avEl.style.display = 'none';
      }
    }
  }

  async function createPeerConnection() {
    await loadTurnServers();
    pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = function (ev) {
      if (!ev.candidate || !currentCall) return;
      sendSignal({
        type: 'ice',
        candidate: ev.candidate.toJSON ? ev.candidate.toJSON() : ev.candidate,
        callId: currentCall.id,
        from: myUsername(),
        to: currentCall.peer
      });
    };

    pc.ontrack = function (ev) {
      if (ev.track) attachRemoteTrack(ev.track);
      setStatus(tmsg('Ligado'));
    };

    pc.onconnectionstatechange = function () {
      var st = pc && pc.connectionState;
      if (st === 'connected') setStatus(tmsg('Ligado'));
      else if (st === 'disconnected' || st === 'failed' || st === 'closed') {
        setStatus(tmsg('Chamada terminada'));
        setTimeout(function () { hangup(false); }, 800);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach(function (track) {
        pc.addTrack(track, localStream);
      });
    }
    return pc;
  }

  function channelNameFor(user) {
    return 'tchilo-call:' + String(user || '').toLowerCase();
  }

  async function sendSignal(payload) {
    var s = SB();
    if (!s || !currentCall) return;

    try {
      var ch = s.channel(channelNameFor(currentCall.peer));
      await ch.subscribe();
      await ch.send({
        type: 'broadcast',
        event: 'signal',
        payload: payload
      });
    } catch (e) {
      console.warn('[tchilo-call] broadcast', e);
    }

    try {
      var uid = await myUserId();
      var row = {
        call_id: currentCall.id,
        from_username: myUsername(),
        to_username: currentCall.peer,
        signal_type: payload.type,
        payload: payload,
        kind: currentCall.kind,
        created_at: new Date().toISOString()
      };
      if (uid) row.from_user_id = uid;
      await s.from('call_signals').insert(row);
    } catch (e2) {
      try {
        await s.from('calls').insert({
          id: currentCall.id,
          caller_username: myUsername(),
          callee_username: currentCall.peer,
          type: currentCall.kind,
          status: payload.type === 'hangup' ? 'ended' : 'ringing',
          offer: payload.type === 'offer' ? payload.sdp : null,
          answer: payload.type === 'answer' ? payload.sdp : null,
          updated_at: new Date().toISOString()
        });
      } catch (e3) {}
    }

    try {
      await s.functions.invoke('call-signal', { body: payload });
    } catch (e4) {}
  }

  /* O mesmo sinal chega pelo canal e pela base de dados: só o primeiro conta */
  var seenSignals = {};
  function isDuplicateSignal(p) {
    var key = p.type + ':' + (p.callId || '') + ':' +
      (p.type === 'ice' ? ((p.candidate && p.candidate.candidate) || '') : (p.sdp ? p.sdp.length + ':' + p.sdp.slice(0, 80) : ''));
    var now = Date.now();
    if (seenSignals[key]) return true;
    seenSignals[key] = now;
    Object.keys(seenSignals).forEach(function (k) { if (now - seenSignals[k] > 120000) delete seenSignals[k]; });
    return false;
  }

  function handleSignal(payload) {
    if (!payload || !payload.type) return;
    var me = myUsername().toLowerCase();
    if (payload.to && String(payload.to).toLowerCase() !== me) return;
    if (payload.from && String(payload.from).toLowerCase() === me) return;
    if (isDuplicateSignal(payload)) return;

    if (payload.type === 'offer') incomingOffer(payload);
    else if (payload.type === 'answer') incomingAnswer(payload);
    else if (payload.type === 'ice') incomingIce(payload);
    else if (payload.type === 'hangup' || payload.type === 'reject') {
      setStatus(tmsg('Chamada terminada'));
      hangup(false);
    }
  }

  var ringTimer = null;
  var pendingOffer = null;

  async function incomingOffer(payload) {
    if (currentCall) {
      /* já estamos numa chamada (ou esta já está a tocar): ignora repetidos, recusa outras */
      if (currentCall.id !== payload.callId) {
        try {
          var s = SB();
          if (s) {
            var ch = s.channel(channelNameFor(payload.from));
            await ch.subscribe();
            await ch.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'reject', callId: payload.callId, from: myUsername(), to: payload.from }
            });
          }
        } catch (e) {}
      }
      return;
    }
    var kind = payload.kind || 'voice';
    currentCall = {
      id: payload.callId || ('call_' + Date.now()),
      peer: payload.from,
      kind: kind,
      role: 'callee',
      ringing: true
    };
    pendingOffer = payload;
    showCallUI(payload.from, kind, kind === 'video' ? tmsg('Videochamada a receber…') : tmsg('Chamada de voz a receber…'), true);
    try { if (navigator.vibrate) navigator.vibrate([400, 300, 400, 300, 400]); } catch (e) {}
    clearTimeout(ringTimer);
    ringTimer = setTimeout(function () {
      if (currentCall && currentCall.ringing) declineCall();
    }, 40000);
  }

  function declineCall() {
    clearTimeout(ringTimer);
    pendingOffer = null;
    hangup(true);
  }

  async function acceptCall() {
    if (!currentCall || !currentCall.ringing || !pendingOffer) return;
    clearTimeout(ringTimer);
    var payload = pendingOffer;
    pendingOffer = null;
    currentCall.ringing = false;
    var kind = currentCall.kind;
    showCallUI(payload.from, kind, tmsg('A ligar…'), false);
    try {
      var constraints = kind === 'video'
        ? { audio: true, video: { facingMode: 'user' } }
        : { audio: true, video: false };
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      showCallUI(payload.from, kind, tmsg('A ligar…'), false);

      await createPeerConnection();
      await pc.setRemoteDescription({ type: 'offer', sdp: payload.sdp });
      for (var i = 0; i < pendingCandidates.length; i++) {
        try { await pc.addIceCandidate(pendingCandidates[i]); } catch (e) {}
      }
      pendingCandidates = [];

      var answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendSignal({
        type: 'answer',
        sdp: answer.sdp,
        callId: currentCall.id,
        from: myUsername(),
        to: currentCall.peer,
        kind: kind
      });
      setStatus(tmsg('A conectar…'));
    } catch (err) {
      console.warn('[tchilo-call] accept', err);
      toast(tmsg('Não foi possível atender a chamada'));
      hangup(true);
    }
  }

  async function incomingAnswer(payload) {
    if (!pc || !currentCall) return;
    try {
      await pc.setRemoteDescription({ type: 'answer', sdp: payload.sdp });
      setStatus(tmsg('A conectar…'));
    } catch (e) {
      console.warn('[tchilo-call] answer', e);
    }
  }

  async function incomingIce(payload) {
    if (!payload.candidate) return;
    var cand = payload.candidate;
    if (!pc || !pc.remoteDescription) {
      pendingCandidates.push(cand);
      return;
    }
    try {
      await pc.addIceCandidate(cand);
    } catch (e) {
      console.warn('[tchilo-call] ice', e);
    }
  }

  /* notificação push «X está a ligar-te» (a app do outro lado pode estar fechada) */
  async function notifyCallee(peer, kind) {
    try {
      var s = SB();
      if (!s) return;
      var pr = await s.from('profiles').select('id').eq('username', peer).maybeSingle();
      var uid = pr && pr.data && pr.data.id;
      if (!uid) return;
      await s.functions.invoke('send-push', {
        body: {
          type: 'custom',
          recipient_user_id: uid,
          title: kind === 'video' ? 'Videochamada' : 'Chamada de voz',
          body: myUsername() + ' está a ligar-te',
          data: { type: 'call', url: '/mensagens', from: myUsername() }
        }
      });
    } catch (e) {}
  }

  async function startCall(kind) {
    kind = kind === 'video' ? 'video' : 'voice';
    if (typeof currentChatUser === 'undefined' || !currentChatUser) {
      toast(tmsg('Abre uma conversa primeiro'));
      return;
    }
    if (currentCall) {
      toast(tmsg('Já estás numa chamada'));
      return;
    }

    var peer = String(currentChatUser);
    var callId = 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    currentCall = { id: callId, peer: peer, kind: kind, role: 'caller' };

    showCallUI(peer, kind, tmsg('A pedir permissão…'));

    try {
      var constraints = kind === 'video'
        ? { audio: true, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } }
        : { audio: true, video: false };

      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      showCallUI(peer, kind, tmsg('A ligar…'));

      await createPeerConnection();
      var offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: kind === 'video'
      });
      await pc.setLocalDescription(offer);

      await sendSignal({
        type: 'offer',
        sdp: offer.sdp,
        callId: callId,
        from: myUsername(),
        to: peer,
        kind: kind
      });

      setStatus(tmsg('A tocar…'));
      notifyCallee(peer, kind);

      setTimeout(function () {
        if (currentCall && currentCall.id === callId && pc && pc.connectionState !== 'connected') {
          setStatus(tmsg('Sem resposta'));
          setTimeout(function () { hangup(true); }, 1500);
        }
      }, 45000);
    } catch (err) {
      console.warn('[tchilo-call] start', err);
      var msg = (err && err.message) || '';
      if (/Permission|NotAllowed|Denied/i.test(msg) || (err && err.name === 'NotAllowedError')) {
        toast(tmsg('Permite o microfone' + (kind === 'video' ? ' e a câmara' : '') + ' nas definições'));
      } else {
        toast(msg || tmsg('Não foi possível iniciar a chamada'));
      }
      hangup(false);
    }
  }

  function hangup(notifyPeer) {
    clearTimeout(ringTimer);
    pendingOffer = null;
    if (notifyPeer && currentCall) {
      try {
        sendSignal({
          type: 'hangup',
          callId: currentCall.id,
          from: myUsername(),
          to: currentCall.peer
        });
      } catch (e) {}
    }

    try {
      if (pc) {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.close();
      }
    } catch (e) {}
    pc = null;

    if (localStream) {
      try { localStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    }
    localStream = null;
    remoteStream = null;
    pendingCandidates = [];
    currentCall = null;

    var ov = document.getElementById('tchiloCallOverlay');
    if (ov) ov.style.display = 'none';
    var remoteV = document.getElementById('tchiloCallRemoteVideo');
    var localV = document.getElementById('tchiloCallLocalVideo');
    if (remoteV) { remoteV.srcObject = null; remoteV.style.display = 'none'; }
    if (localV) { localV.srcObject = null; localV.style.display = 'none'; }
    var av = document.getElementById('tchiloCallAvatar');
    if (av) av.style.display = 'flex';
  }

  async function subscribeIncoming() {
    var s = SB();
    var me = myUsername();
    if (!s || !me || myCallChannel) return;

    try {
      myCallChannel = s.channel(channelNameFor(me));
      myCallChannel
        .on('broadcast', { event: 'signal' }, function (ctx) {
          var payload = (ctx && ctx.payload) || ctx;
          handleSignal(payload);
        })
        .subscribe(function (status) {
          if (status === 'SUBSCRIBED') {
            console.log('[tchilo-call] listening on', channelNameFor(me));
          }
        });
    } catch (e) {
      console.warn('[tchilo-call] subscribe', e);
    }

    try {
      s.channel('tchilo-call-signals-db')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: 'to_username=eq.' + me
        }, function (payload) {
          var row = payload.new || {};
          var p = row.payload || row;
          if (typeof p === 'string') {
            try { p = JSON.parse(p); } catch (e) {}
          }
          handleSignal(p);
        })
        .subscribe();
    } catch (e2) {}
  }

  window.tchiloStartCall = startCall;
  window.tchiloHangupCall = function () { hangup(true); };

  function patchUiStartCall() {
    try {
      document.querySelectorAll('.chat-call-voice').forEach(function (btn) {
        btn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          startCall('voice');
        };
      });
      document.querySelectorAll('.chat-call-video').forEach(function (btn) {
        btn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          startCall('video');
        };
      });
    } catch (e) {}
  }

  function boot() {
    ensureCallUI();
    subscribeIncoming();
    patchUiStartCall();
    [500, 1500, 3000, 6000].forEach(function (ms) {
      setTimeout(function () {
        subscribeIncoming();
        patchUiStartCall();
      }, ms);
    });

    if (typeof window.openChat === 'function' && !window.openChat.__callWebrtc) {
      var oc = window.openChat;
      window.openChat = function () {
        var r = oc.apply(this, arguments);
        setTimeout(patchUiStartCall, 60);
        setTimeout(patchUiStartCall, 400);
        return r;
      };
      window.openChat.__callWebrtc = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
