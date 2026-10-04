/**
 * tchilo-Pop — Chamadas 1-1 (vídeo / voz) no chat
 * Cloudflare Realtime SFU + tabela public.calls
 */
(function () {
  "use strict";

  if (window.__tchiloCallV1) return;
  window.__tchiloCallV1 = true;

  var FN_URL = null;
  function getFnUrl() {
    if (FN_URL) return FN_URL;
    var base =
      (window.TCHILO_SUPABASE_URL ||
        (window.tchiloSupabase && window.tchiloSupabase.supabaseUrl) ||
        "https://edgngwoxhdxcvyzpqjbj.supabase.co") + "";
    FN_URL = base.replace(/\/$/, "") + "/functions/v1/live-sfu";
    return FN_URL;
  }

  async function getAccessToken() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return null;
      var r = await SB.auth.getSession();
      return r?.data?.session?.access_token || null;
    } catch (e) {
      return null;
    }
  }

  async function callApi(action, payload) {
    var token = await getAccessToken();
    if (!token) throw new Error("Sem sessão");
    var res = await fetch(getFnUrl(), {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        apikey:
          window.TCHILO_SUPABASE_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZ25nd294aGR4Y3Z5enBxamJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTI3NDcsImV4cCI6MjEwMzU4ODc0N30.grrS7tWQ37n8GaI9tLNBdJAHzW-1pAu8FjsByGZAH30",
      },
      body: JSON.stringify(Object.assign({ action: action }, payload || {})),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok || data.error) {
      throw new Error(data.error || "Erro call " + res.status);
    }
    return data;
  }

  function showToast(msg) {
    try {
      if (typeof window.showToast === "function") window.showToast(msg);
      else console.log("[call]", msg);
    } catch (e) {}
  }

  function icon(name) {
    var c =
      'width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    if (name === "phone")
      return (
        "<svg " +
        c +
        '><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
      );
    if (name === "video")
      return (
        "<svg " +
        c +
        '><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>'
      );
    if (name === "mic-off")
      return (
        "<svg " +
        c +
        '><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 3"/><path d="M12 19v3"/><path d="M8 22h8"/><path d="M12 1a3 3 0 0 0-3 3v5"/></svg>'
      );
    if (name === "mic")
      return (
        "<svg " +
        c +
        '><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'
      );
    if (name === "cam-off")
      return (
        "<svg " +
        c +
        '><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      );
    if (name === "hangup")
      return (
        "<svg " +
        c +
        '><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>'
      );
    if (name === "flip")
      return (
        "<svg " +
        c +
        '><path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><circle cx="12" cy="12" r="3"/><path d="m18 22-3-3 3-3"/><path d="m6 2 3 3-3 3"/></svg>'
      );
    return "";
  }

  var state = {
    callId: null,
    role: null, // caller | callee
    callType: "video",
    sessionId: null,
    remoteSessionId: null,
    pc: null,
    localStream: null,
    remoteStream: null,
    videoSender: null,
    facing: "user",
    micOn: true,
    camOn: true,
    pollTimer: null,
    ended: true,
    peerUsername: "",
  };

  function ensureUI() {
    if (document.getElementById("tchiloCallOverlay")) return;

    var css =
      "#tchiloCallOverlay{position:fixed;inset:0;z-index:2200;background:#0b0b0c;display:none;flex-direction:column;color:#fff}" +
      "#tchiloCallOverlay.open{display:flex}" +
      "#tchiloCallOverlay .co-remote{flex:1;position:relative;min-height:0;background:#111}" +
      "#tchiloCallOverlay #coRemoteVideo{width:100%;height:100%;object-fit:cover;background:#000}" +
      "#tchiloCallOverlay .co-local{position:absolute;right:14px;top:max(14px,env(safe-area-inset-top));width:112px;height:160px;border-radius:14px;overflow:hidden;border:2px solid rgba(255,255,255,.5);background:#222;z-index:4}" +
      "#tchiloCallOverlay #coLocalVideo{width:100%;height:100%;object-fit:cover}" +
      "#tchiloCallOverlay .co-top{position:absolute;left:0;right:0;top:0;z-index:5;padding:max(14px,env(safe-area-inset-top)) 16px 10px;text-align:center;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent)}" +
      "#tchiloCallOverlay .co-name{font:800 18px Inter,sans-serif}" +
      "#tchiloCallOverlay .co-status{font:600 13px Inter,sans-serif;opacity:.75;margin-top:4px}" +
      "#tchiloCallOverlay .co-bottom{position:absolute;left:0;right:0;bottom:0;z-index:5;display:flex;justify-content:center;gap:16px;padding:18px 16px max(24px,env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(0,0,0,.65),transparent)}" +
      "#tchiloCallOverlay .co-btn{width:56px;height:56px;border-radius:50%;border:2px solid rgba(255,255,255,.4);background:rgba(0,0,0,.45);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}" +
      "#tchiloCallOverlay .co-btn.hang{background:#e11d48;border-color:#e11d48}" +
      "#tchiloCallOverlay .co-btn.off{opacity:.45}" +
      "#tchiloCallIncoming{position:fixed;inset:0;z-index:2210;background:rgba(11,11,12,.92);display:none;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:24px}" +
      "#tchiloCallIncoming.open{display:flex}" +
      "#tchiloCallIncoming .ci-avatar{width:96px;height:96px;border-radius:50%;background:var(--mint,#7CFFB2);color:#0b0b0c;display:flex;align-items:center;justify-content:center;font:900 28px Inter,sans-serif;margin-bottom:16px;border:3px solid #fff}" +
      "#tchiloCallIncoming .ci-name{font:800 22px Inter,sans-serif;margin-bottom:6px}" +
      "#tchiloCallIncoming .ci-sub{font:600 14px Inter,sans-serif;opacity:.7;margin-bottom:28px}" +
      "#tchiloCallIncoming .ci-row{display:flex;gap:28px}" +
      "#tchiloCallIncoming .ci-btn{width:64px;height:64px;border-radius:50%;border:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff}" +
      "#tchiloCallIncoming .ci-accept{background:#22c55e}" +
      "#tchiloCallIncoming .ci-decline{background:#e11d48}" +
      ".chat-header .chat-call-btns{display:flex;gap:6px;margin-left:auto}" +
      ".chat-header .chat-call-btn{width:38px;height:38px;border-radius:50%;border:2px solid var(--ink,#0B0B0C);background:var(--paper,#fff);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}" +
      ".chat-header .chat-call-btn svg{width:18px;height:18px}";

    var st = document.createElement("style");
    st.id = "tchiloCallStyles";
    st.textContent = css;
    document.head.appendChild(st);

    var ov = document.createElement("div");
    ov.id = "tchiloCallOverlay";
    ov.innerHTML =
      '<div class="co-remote"><video id="coRemoteVideo" playsinline autoplay></video>' +
      '<div class="co-local"><video id="coLocalVideo" playsinline autoplay muted></video></div>' +
      '<div class="co-top"><div class="co-name" id="coName">—</div><div class="co-status" id="coStatus">A ligar…</div></div>' +
      '<div class="co-bottom" id="coBottom"></div></div>';
    document.body.appendChild(ov);

    var inc = document.createElement("div");
    inc.id = "tchiloCallIncoming";
    inc.innerHTML =
      '<div class="ci-avatar" id="ciAvatar">?</div>' +
      '<div class="ci-name" id="ciName">—</div>' +
      '<div class="ci-sub" id="ciSub">Chamada recebida</div>' +
      '<div class="ci-row">' +
      '<button type="button" class="ci-btn ci-decline" id="ciDecline" aria-label="Recusar">' +
      icon("hangup") +
      "</button>" +
      '<button type="button" class="ci-btn ci-accept" id="ciAccept" aria-label="Atender">' +
      icon("phone") +
      "</button></div>";
    document.body.appendChild(inc);

    document.getElementById("ciDecline").onclick = function () {
      declineIncoming();
    };
    document.getElementById("ciAccept").onclick = function () {
      acceptIncoming();
    };
  }

  function injectChatButtons() {
    try {
      var header = document.querySelector("#chatScreen .chat-header");
      if (!header || header.querySelector(".chat-call-btns")) return;

      var wrap = document.createElement("div");
      wrap.className = "chat-call-btns";
      wrap.innerHTML =
        '<button type="button" class="chat-call-btn" id="chatAudioCallBtn" title="Chamada de voz" aria-label="Chamada de voz">' +
        icon("phone") +
        "</button>" +
        '<button type="button" class="chat-call-btn" id="chatVideoCallBtn" title="Chamada de vídeo" aria-label="Chamada de vídeo">' +
        icon("video") +
        "</button>";
      header.appendChild(wrap);

      document.getElementById("chatAudioCallBtn").onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        startCall("audio");
      };
      document.getElementById("chatVideoCallBtn").onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        startCall("video");
      };
    } catch (e) {}
  }

  async function waitIce(pc) {
    if (pc.iceGatheringState === "complete") return;
    await new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        pc.removeEventListener("icegatheringstatechange", onChange);
        resolve();
      }
      function onChange() {
        if (pc.iceGatheringState === "complete") finish();
      }
      pc.addEventListener("icegatheringstatechange", onChange);
      setTimeout(finish, 2500);
    });
  }

  async function publishLocal(callType) {
    var constraints =
      callType === "audio"
        ? { audio: true, video: false }
        : {
            audio: true,
            video: {
              facingMode: state.facing,
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          };

    var stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.localStream = stream;

    var pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
      bundlePolicy: "max-bundle",
    });
    state.pc = pc;

    pc.ontrack = function (ev) {
      if (!state.remoteStream) state.remoteStream = new MediaStream();
      state.remoteStream.addTrack(ev.track);
      var rv = document.getElementById("coRemoteVideo");
      if (rv) {
        rv.srcObject = state.remoteStream;
        rv.play().catch(function () {});
      }
    };

    var audioTrack = stream.getAudioTracks()[0];
    var videoTrack = stream.getVideoTracks()[0];

    var tracks = [];
    if (audioTrack) {
      var aTx = pc.addTransceiver(audioTrack, { direction: "sendrecv" });
      tracks.push({ location: "local", mid: aTx.mid, trackName: "mic" });
    }
    if (videoTrack) {
      var vTx = pc.addTransceiver(videoTrack, { direction: "sendrecv" });
      state.videoSender = vTx.sender;
      tracks.push({ location: "local", mid: vTx.mid, trackName: "camera" });
    }

    var offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitIce(pc);

    var sess = await callApi("create_session", {});
    state.sessionId = sess.sessionId;

    var pub = await callApi("publish", {
      sessionId: state.sessionId,
      sessionDescription: {
        type: pc.localDescription.type,
        sdp: pc.localDescription.sdp,
      },
      tracks: tracks,
    });

    var answer = pub.sessionDescription || pub.answer || pub;
    if (answer && answer.sdp) {
      await pc.setRemoteDescription(answer);
    } else if (pub.sdp) {
      await pc.setRemoteDescription({ type: "answer", sdp: pub.sdp });
    }

    var lv = document.getElementById("coLocalVideo");
    if (lv) {
      lv.srcObject = stream;
      lv.play().catch(function () {});
    }

    return state.sessionId;
  }

  async function subscribeRemote(remoteSessionId, callType) {
    if (!state.sessionId || !remoteSessionId || !state.pc) return;

    var tracks = [
      {
        location: "remote",
        sessionId: remoteSessionId,
        trackName: "mic",
      },
    ];
    if (callType !== "audio") {
      tracks.push({
        location: "remote",
        sessionId: remoteSessionId,
        trackName: "camera",
      });
    }

    var sub = await callApi("subscribe", {
      sessionId: state.sessionId,
      tracks: tracks,
    });

    var remoteDesc = sub.sessionDescription || sub.offer || sub;
    if (remoteDesc && remoteDesc.sdp) {
      await state.pc.setRemoteDescription(remoteDesc);
      var answer = await state.pc.createAnswer();
      await state.pc.setLocalDescription(answer);
      await waitIce(state.pc);
      await callApi("renegotiate", {
        sessionId: state.sessionId,
        sessionDescription: {
          type: state.pc.localDescription.type,
          sdp: state.pc.localDescription.sdp,
        },
      });
    }
  }

  function buildControls() {
    var bottom = document.getElementById("coBottom");
    if (!bottom) return;
    var html =
      '<button type="button" class="co-btn" id="coMicBtn" title="Microfone">' +
      (state.micOn ? icon("mic") : icon("mic-off")) +
      "</button>";
    if (state.callType === "video") {
      html +=
        '<button type="button" class="co-btn" id="coCamBtn" title="Câmara">' +
        (state.camOn ? icon("video") : icon("cam-off")) +
        "</button>";
      html +=
        '<button type="button" class="co-btn" id="coFlipBtn" title="Inverter">' +
        icon("flip") +
        "</button>";
    }
    html +=
      '<button type="button" class="co-btn hang" id="coHangBtn" title="Desligar">' +
      icon("hangup") +
      "</button>";
    bottom.innerHTML = html;

    document.getElementById("coMicBtn").onclick = function () {
      state.micOn = !state.micOn;
      if (state.localStream) {
        state.localStream.getAudioTracks().forEach(function (t) {
          t.enabled = state.micOn;
        });
      }
      buildControls();
    };
    var camBtn = document.getElementById("coCamBtn");
    if (camBtn) {
      camBtn.onclick = function () {
        state.camOn = !state.camOn;
        if (state.localStream) {
          state.localStream.getVideoTracks().forEach(function (t) {
            t.enabled = state.camOn;
          });
        }
        buildControls();
      };
    }
    var flipBtn = document.getElementById("coFlipBtn");
    if (flipBtn) {
      flipBtn.onclick = function () {
        flipCamera();
      };
    }
    document.getElementById("coHangBtn").onclick = function () {
      endCall();
    };
  }

  async function flipCamera() {
    if (state.callType !== "video" || !state.localStream) return;
    try {
      state.facing = state.facing === "user" ? "environment" : "user";
      var ns = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: state.facing },
        audio: false,
      });
      var nt = ns.getVideoTracks()[0];
      var ot = state.localStream.getVideoTracks()[0];
      if (ot) {
        ot.stop();
        state.localStream.removeTrack(ot);
      }
      state.localStream.addTrack(nt);
      if (state.videoSender) await state.videoSender.replaceTrack(nt);
      var lv = document.getElementById("coLocalVideo");
      if (lv) lv.srcObject = state.localStream;
    } catch (e) {
      showToast("Não foi possível inverter a câmara");
    }
  }

  function openCallUI(peerName, statusText) {
    ensureUI();
    document.getElementById("coName").textContent = "@" + peerName;
    document.getElementById("coStatus").textContent = statusText || "A ligar…";
    document.getElementById("tchiloCallOverlay").classList.add("open");
    buildControls();
  }

  function closeCallUI() {
    var ov = document.getElementById("tchiloCallOverlay");
    if (ov) ov.classList.remove("open");
    var inc = document.getElementById("tchiloCallIncoming");
    if (inc) inc.classList.remove("open");
  }

  async function startCall(callType) {
    var peer =
      typeof currentChatUser !== "undefined" ? currentChatUser : null;
    if (!peer) {
      showToast("Abre uma conversa primeiro");
      return;
    }
    var session = typeof getSession === "function" ? getSession() : null;
    if (!session) {
      showToast("Sem sessão");
      return;
    }

    ensureUI();
    state.ended = false;
    state.role = "caller";
    state.callType = callType || "video";
    state.peerUsername = peer;
    state.micOn = true;
    state.camOn = callType !== "audio";
    state.facing = "user";

    openCallUI(peer, "A ligar…");

    try {
      await publishLocal(state.callType);

      var started = await callApi("start_call", {
        callee_username: peer,
        call_type: state.callType,
        caller_session_id: state.sessionId,
        caller_username: session.username,
      });

      state.callId = started.call && started.call.id;

      document.getElementById("coStatus").textContent = "A chamar…";

      // Poll until answered or ended
      if (state.pollTimer) clearInterval(state.pollTimer);
      state.pollTimer = setInterval(async function () {
        if (state.ended || !state.callId) return;
        try {
          var SB = window.tchiloSupabase;
          if (!SB) return;
          var r = await SB.from("calls")
            .select("*")
            .eq("id", state.callId)
            .maybeSingle();
          var row = r.data;
          if (!row) return;
          if (row.status === "declined" || row.status === "missed" || row.status === "ended") {
            showToast(row.status === "declined" ? "Chamada recusada" : "Chamada terminada");
            cleanupLocal(false);
            return;
          }
          if (row.status === "active" && row.callee_session_id) {
            state.remoteSessionId = row.callee_session_id;
            document.getElementById("coStatus").textContent = "Em chamada";
            clearInterval(state.pollTimer);
            state.pollTimer = null;
            await subscribeRemote(row.callee_session_id, state.callType);
          }
        } catch (e) {}
      }, 1500);
    } catch (e) {
      console.error("[call] start", e);
      showToast("Erro ao ligar: " + (e.message || e));
      cleanupLocal(true);
    }
  }

  var incomingCall = null;

  function showIncoming(row) {
    ensureUI();
    incomingCall = row;
    document.getElementById("ciName").textContent =
      "@" + (row.caller_username || "?");
    document.getElementById("ciAvatar").textContent = String(
      row.caller_username || "?"
    )
      .slice(0, 2)
      .toUpperCase();
    document.getElementById("ciSub").textContent =
      row.call_type === "audio" ? "Chamada de voz" : "Chamada de vídeo";
    document.getElementById("tchiloCallIncoming").classList.add("open");
  }

  async function acceptIncoming() {
    if (!incomingCall) return;
    var row = incomingCall;
    document.getElementById("tchiloCallIncoming").classList.remove("open");

    state.ended = false;
    state.role = "callee";
    state.callType = row.call_type || "video";
    state.callId = row.id;
    state.peerUsername = row.caller_username || "";
    state.remoteSessionId = row.caller_session_id;
    state.micOn = true;
    state.camOn = state.callType !== "audio";

    openCallUI(state.peerUsername, "A ligar…");

    try {
      await publishLocal(state.callType);

      await callApi("accept_call", {
        call_id: state.callId,
        callee_session_id: state.sessionId,
      });

      document.getElementById("coStatus").textContent = "Em chamada";

      if (state.remoteSessionId) {
        await subscribeRemote(state.remoteSessionId, state.callType);
      }
    } catch (e) {
      console.error("[call] accept", e);
      showToast("Erro ao atender: " + (e.message || e));
      cleanupLocal(true);
    }
  }

  async function declineIncoming() {
    if (!incomingCall) return;
    try {
      await callApi("decline_call", { call_id: incomingCall.id });
    } catch (e) {}
    incomingCall = null;
    document.getElementById("tchiloCallIncoming").classList.remove("open");
  }

  async function endCall() {
    try {
      if (state.callId) await callApi("end_call", { call_id: state.callId });
    } catch (e) {}
    cleanupLocal(false);
    showToast("Chamada terminada");
  }

  function cleanupLocal(notifyEnd) {
    state.ended = true;
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
    try {
      if (state.localStream) {
        state.localStream.getTracks().forEach(function (t) {
          t.stop();
        });
      }
    } catch (e) {}
    try {
      if (state.pc) state.pc.close();
    } catch (e) {}
    state.localStream = null;
    state.remoteStream = null;
    state.pc = null;
    state.videoSender = null;
    state.callId = null;
    state.sessionId = null;
    state.remoteSessionId = null;
    incomingCall = null;
    closeCallUI();
    var lv = document.getElementById("coLocalVideo");
    var rv = document.getElementById("coRemoteVideo");
    if (lv) lv.srcObject = null;
    if (rv) rv.srcObject = null;
  }

  // Escutar chamadas recebidas
  function startIncomingListener() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB || window.__tchiloCallListen) return;
      window.__tchiloCallListen = true;

      SB.channel("tchilo-calls")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "calls" },
          function (payload) {
            var row = payload.new || payload.record || {};
            handleIncomingRow(row);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "calls" },
          function (payload) {
            var row = payload.new || payload.record || {};
            if (
              state.callId &&
              row.id === state.callId &&
              (row.status === "ended" ||
                row.status === "declined" ||
                row.status === "missed")
            ) {
              if (!state.ended) {
                showToast("Chamada terminada");
                cleanupLocal(false);
              }
            }
          }
        )
        .subscribe();

      // Poll de segurança para ringing
      setInterval(pollIncoming, 4000);
    } catch (e) {
      console.warn("[call] listen", e);
    }
  }

  async function handleIncomingRow(row) {
    try {
      if (!row || row.status !== "ringing") return;
      var auth = await window.tchiloSupabase.auth.getSession();
      var uid = auth?.data?.session?.user?.id;
      if (!uid || row.callee_id !== uid) return;
      if (state.callId && !state.ended) return;
      showIncoming(row);
    } catch (e) {}
  }

  async function pollIncoming() {
    try {
      if (state.callId && !state.ended) return;
      var SB = window.tchiloSupabase;
      if (!SB) return;
      var auth = await SB.auth.getSession();
      var uid = auth?.data?.session?.user?.id;
      if (!uid) return;
      var r = await SB.from("calls")
        .select("*")
        .eq("callee_id", uid)
        .eq("status", "ringing")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (r.data) showIncoming(r.data);
    } catch (e) {}
  }

  // Inject buttons when chat opens
  var obs = new MutationObserver(function () {
    injectChatButtons();
  });
  function boot() {
    ensureUI();
    injectChatButtons();
    startIncomingListener();
    var chat = document.getElementById("chatScreen");
    if (chat) obs.observe(chat, { attributes: true, attributeFilter: ["class"] });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  setInterval(injectChatButtons, 2000);

  window.tchiloStartCall = startCall;
  window.tchiloEndCall = endCall;
})();
