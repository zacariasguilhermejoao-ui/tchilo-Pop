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

  function ensureCallUI() {
    if (document.getElementById('tchiloCallOverlay')) return;
    var ov = document.createElement('div');
    ov.id = 'tchiloCallOverlay';
    ov.style.cssText =
      'display:none;position:fixed;inset:0;z-index:99999;background:#0b0b12;color:#fff;' +
      'flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;';
    ov.innerHTML =
      '<video id="tchiloCallRemoteVideo" autoplay playsinline style="display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000"></video>' +
      '<div id="tchiloCallAvatar" style="width:96px;height:96px;border-radius:50%;background:var(--mint,#7ef0c0);' +
      'display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;color:#111;z-index:2"></div>' +
      '<div id="tchiloCallName" style="font-size:22px;font-weight:800;z-index:2"></div>' +
      '<div id="tchiloCallStatus" style="font-size:14px;opacity:.85;z-index:2">A ligar…</div>' +
      '<video id="tchiloCallLocalVideo" autoplay playsinline muted style="display:none;width:110px;height:150px;' +
      'object-fit:cover;border-radius:14px;background:#222;position:absolute;bottom:110px;right:18px;z-index:3;border:2px solid #fff3"></video>' +
      '<div style="display:flex;gap:22px;margin-top:36px;z-index:3">' +
      '<button type="button" id="tchiloCallMute" style="width:52px;height:52px;border-radius:50%;border:0;background:#333;color:#fff;font-size:20px;cursor:pointer">🎤</button>' +
      '<button type="button" id="tchiloCallHangup" style="width:64px;height:64px;border-radius:50%;border:0;background:#e53935;color:#fff;font-size:26px;cursor:pointer">📞</button>' +
      '<button type="button" id="tchiloCallCam" style="width:52px;height:52px;border-radius:50%;border:0;background:#333;color:#fff;font-size:20px;cursor:pointer;display:none">📷</button>' +
      '</div>';
    document.body.appendChild(ov);

    document.getElementById('tchiloCallHangup').onclick = function () { hangup(true); };
    document.getElementById('tchiloCallMute').onclick = function () {
      if (!localStream) return;
      localStream.getAudioTracks().forEach(function (t) { t.enabled = !t.enabled; });
      var on = localStream.getAudioTracks().some(function (t) { return t.enabled; });
      this.textContent = on ? '🎤' : '🔇';
    };
    document.getElementById('tchiloCallCam').onclick = function () {
      if (!localStream) return;
      localStream.getVideoTracks().forEach(function (t) { t.enabled = !t.enabled; });
    };
  }

  function showCallUI(peerName, kind, status) {
    ensureCallUI();
    var ov = document.getElementById('tchiloCallOverlay');
    var nameEl = document.getElementById('tchiloCallName');
    var statusEl = document.getElementById('tchiloCallStatus');
    var avEl = document.getElementById('tchiloCallAvatar');
    var localV = document.getElementById('tchiloCallLocalVideo');
    var remoteV = document.getElementById('tchiloCallRemoteVideo');
    var camBtn = document.getElementById('tchiloCallCam');

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
    if (localV) {
      localV.style.display = kind === 'video' ? 'block' : 'none';
      if (localStream) localV.srcObject = localStream;
    }
    if (remoteV && remoteStream) {
      remoteV.srcObject = remoteStream;
      remoteV.style.display = 'block';
      if (avEl) avEl.style.display = 'none';
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

  function handleSignal(payload) {
    if (!payload || !payload.type) return;
    var me = myUsername().toLowerCase();
    if (payload.to && String(payload.to).toLowerCase() !== me) return;
    if (payload.from && String(payload.from).toLowerCase() === me) return;

    if (payload.type === 'offer') incomingOffer(payload);
    else if (payload.type === 'answer') incomingAnswer(payload);
    else if (payload.type === 'ice') incomingIce(payload);
    else if (payload.type === 'hangup' || payload.type === 'reject') {
      setStatus(tmsg('Chamada terminada'));
      hangup(false);
    }
  }

  async function incomingOffer(payload) {
    if (currentCall && currentCall.id !== payload.callId) {
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
      return;
    }

    var kind = payload.kind || 'voice';
    currentCall = {
      id: payload.callId || ('call_' + Date.now()),
      peer: payload.from,
      kind: kind,
      role: 'callee'
    };

    showCallUI(payload.from, kind, tmsg('A receber chamada…'));

    try {
      var constraints = kind === 'video'
        ? { audio: true, video: { facingMode: 'user' } }
        : { audio: true, video: false };
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      showCallUI(payload.from, kind, tmsg('A ligar…'));

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
