/**
 * tchilo-Pop — Live (Cloudflare Realtime SFU)
 * Botão no perfil → transmissão 1→muitos
 */
(function () {
  "use strict";

  if (window.__tchiloLiveV1) return;
  window.__tchiloLiveV1 = true;

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

  async function callLive(action, payload) {
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
      throw new Error(data.error || "Erro live-sfu " + res.status);
    }
    return data;
  }

  /* ---------- estado host ---------- */
  var host = {
    liveId: null,
    sessionId: null,
    pc: null,
    stream: null,
    ended: false,
  };

  /* ---------- estado viewer ---------- */
  var viewer = {
    liveId: null,
    sessionId: null,
    pc: null,
    ended: false,
  };

  function showToast(msg) {
    try {
      if (typeof window.showToast === "function") window.showToast(msg);
      else console.log("[live]", msg);
    } catch (e) {}
  }

  function ensureLiveUI() {
    if (document.getElementById("tchiloLiveOverlay")) return;

    var css =
      "#tchiloLiveOverlay{position:fixed;inset:0;z-index:2000;background:#0b0b0c;display:none;flex-direction:column;color:#fff}" +
      "#tchiloLiveOverlay.open{display:flex}" +
      "#tchiloLiveOverlay .lv-top{display:flex;align-items:center;gap:10px;padding:12px 14px;position:absolute;top:0;left:0;right:0;z-index:5;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent)}" +
      "#tchiloLiveOverlay .lv-badge{background:#e11d48;color:#fff;font:800 11px Inter,sans-serif;padding:4px 8px;border-radius:8px;letter-spacing:.04em}" +
      "#tchiloLiveOverlay .lv-viewers{font:700 13px Inter,sans-serif;opacity:.9}" +
      "#tchiloLiveOverlay .lv-title{font:800 14px Inter,sans-serif;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      "#tchiloLiveOverlay .lv-close{width:40px;height:40px;border:2px solid #fff;border-radius:50%;background:rgba(0,0,0,.35);color:#fff;font-size:22px;line-height:1;cursor:pointer}" +
      "#tchiloLiveOverlay video{width:100%;height:100%;object-fit:cover;background:#000}" +
      "#tchiloLiveOverlay .lv-bottom{position:absolute;left:0;right:0;bottom:0;padding:16px;display:flex;gap:10px;justify-content:center;background:linear-gradient(0deg,rgba(0,0,0,.6),transparent)}" +
      "#tchiloLiveOverlay .lv-btn{border:2.5px solid #fff;background:rgba(0,0,0,.4);color:#fff;border-radius:999px;padding:12px 22px;font:800 14px Inter,sans-serif;cursor:pointer}" +
      "#tchiloLiveOverlay .lv-btn.danger{background:#e11d48;border-color:#e11d48}" +
      "#tchiloLiveSetup{position:fixed;inset:0;z-index:1999;background:rgba(11,11,12,.72);display:none;align-items:flex-end;justify-content:center}" +
      "#tchiloLiveSetup.open{display:flex}" +
      "#tchiloLiveSetup .card{width:min(100%,430px);background:var(--paper,#fff);color:var(--ink,#0B0B0C);border:3px solid var(--ink,#0B0B0C);border-bottom:0;border-radius:22px 22px 0 0;padding:18px 16px 28px}" +
      "#tchiloLiveSetup input{width:100%;box-sizing:border-box;border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;padding:12px 14px;font:600 15px Inter,sans-serif;margin:10px 0 14px}" +
      "#tchiloLiveSetup .row{display:flex;gap:10px}" +
      "#tchiloLiveSetup .btn{flex:1;border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;padding:12px;font:800 14px Inter,sans-serif;cursor:pointer;background:var(--yellow,#FFE14D)}" +
      "#tchiloLiveSetup .btn.ghost{background:#fff}";

    var st = document.createElement("style");
    st.id = "tchiloLiveStyles";
    st.textContent = css;
    document.head.appendChild(st);

    var overlay = document.createElement("div");
    overlay.id = "tchiloLiveOverlay";
    overlay.innerHTML =
      '<div class="lv-top">' +
      '<span class="lv-badge">AO VIVO</span>' +
      '<span class="lv-viewers" id="lvViewers">0</span>' +
      '<span class="lv-title" id="lvTitle"></span>' +
      '<button type="button" class="lv-close" id="lvCloseBtn" aria-label="Fechar">×</button>' +
      "</div>" +
      '<video id="lvVideo" playsinline autoplay muted></video>' +
      '<div class="lv-bottom" id="lvBottom"></div>';
    document.body.appendChild(overlay);

    var setup = document.createElement("div");
    setup.id = "tchiloLiveSetup";
    setup.innerHTML =
      '<div class="card">' +
      "<b style=\"font-size:18px\">Iniciar Live</b>" +
      '<input id="lvTitleInput" maxlength="120" placeholder="Título da live (opcional)" />' +
      '<div class="row">' +
      '<button type="button" class="btn ghost" id="lvCancelBtn">Cancelar</button>' +
      '<button type="button" class="btn" id="lvStartBtn">Começar</button>' +
      "</div></div>";
    document.body.appendChild(setup);

    document.getElementById("lvCancelBtn").onclick = function () {
      setup.classList.remove("open");
    };
    document.getElementById("lvStartBtn").onclick = function () {
      var title = (document.getElementById("lvTitleInput").value || "").trim();
      setup.classList.remove("open");
      startHost(title);
    };
    document.getElementById("lvCloseBtn").onclick = function () {
      if (host.liveId && !host.ended) stopHost();
      else stopViewer();
    };
  }

  function openSetup() {
    ensureLiveUI();
    var session = typeof getSession === "function" ? getSession() : null;
    if (!session || !session.username) {
      showToast("Inicia sessão para fazer live");
      return;
    }
    document.getElementById("lvTitleInput").value = "";
    document.getElementById("tchiloLiveSetup").classList.add("open");
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

  async function startHost(title) {
    ensureLiveUI();
    host.ended = false;
    var session = typeof getSession === "function" ? getSession() : null;
    if (!session) {
      showToast("Sem sessão");
      return;
    }

    try {
      showToast("A preparar live…");
      var started = await callLive("start_live", {
        title: title || "",
        username: session.username,
        display_name: session.displayName || session.username,
      });

      host.liveId = started.live && started.live.id;
      host.sessionId = started.sessionId;

      var stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      host.stream = stream;

      var pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
        bundlePolicy: "max-bundle",
      });
      host.pc = pc;

      var videoTrack = stream.getVideoTracks()[0];
      var audioTrack = stream.getAudioTracks()[0];

      var vTx = pc.addTransceiver(videoTrack, { direction: "sendonly" });
      var aTx = pc.addTransceiver(audioTrack, { direction: "sendonly" });

      var offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitIce(pc);

      var midVideo = vTx.mid;
      var midAudio = aTx.mid;

      var pub = await callLive("publish", {
        sessionId: host.sessionId,
        sessionDescription: {
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
        },
        tracks: [
          { location: "local", mid: midVideo, trackName: "camera" },
          { location: "local", mid: midAudio, trackName: "mic" },
        ],
      });

      var answer = pub.sessionDescription || pub.answer || pub;
      if (answer && answer.sdp) {
        await pc.setRemoteDescription(answer);
      } else if (pub.sdp) {
        await pc.setRemoteDescription({ type: "answer", sdp: pub.sdp });
      }

      var videoEl = document.getElementById("lvVideo");
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.play().catch(function () {});

      document.getElementById("lvTitle").textContent =
        title || "@" + session.username;
      document.getElementById("lvViewers").textContent = "0";
      document.getElementById("lvBottom").innerHTML =
        '<button type="button" class="lv-btn danger" id="lvEndBtn">Terminar Live</button>';
      document.getElementById("lvEndBtn").onclick = function () {
        stopHost();
      };

      document.getElementById("tchiloLiveOverlay").classList.add("open");
      showToast("Estás ao vivo!");

      // polling viewers
      if (!window.__tchiloLiveViewerPoll) {
        window.__tchiloLiveViewerPoll = setInterval(refreshViewerCount, 5000);
      }
    } catch (e) {
      console.error("[live] host", e);
      showToast("Erro ao iniciar live: " + (e.message || e));
      cleanupHost();
    }
  }

  async function refreshViewerCount() {
    if (!host.liveId || host.ended) return;
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return;
      var r = await SB.from("lives").select("viewer_count").eq("id", host.liveId).maybeSingle();
      if (r.data && document.getElementById("lvViewers")) {
        document.getElementById("lvViewers").textContent = String(r.data.viewer_count || 0);
      }
    } catch (e) {}
  }

  async function stopHost() {
    host.ended = true;
    try {
      if (host.liveId) await callLive("end_live", { liveId: host.liveId });
    } catch (e) {
      console.warn("[live] end", e);
    }
    cleanupHost();
    showToast("Live terminada");
  }

  function cleanupHost() {
    try {
      if (host.stream) host.stream.getTracks().forEach(function (t) {
        t.stop();
      });
    } catch (e) {}
    try {
      if (host.pc) host.pc.close();
    } catch (e) {}
    host.stream = null;
    host.pc = null;
    host.liveId = null;
    host.sessionId = null;
    var ov = document.getElementById("tchiloLiveOverlay");
    if (ov) ov.classList.remove("open");
    var v = document.getElementById("lvVideo");
    if (v) v.srcObject = null;
  }

  /* ---------- VIEWER ---------- */
  async function watchLive(liveRow) {
    ensureLiveUI();
    stopViewer();
    viewer.ended = false;
    viewer.liveId = liveRow.id;

    try {
      showToast("A entrar na live…");
      var sess = await callLive("create_session", {});
      viewer.sessionId = sess.sessionId;

      var pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
        bundlePolicy: "max-bundle",
      });
      viewer.pc = pc;

      pc.ontrack = function (ev) {
        var videoEl = document.getElementById("lvVideo");
        if (!videoEl) return;
        if (!videoEl.srcObject) {
          videoEl.srcObject = new MediaStream();
        }
        videoEl.srcObject.addTrack(ev.track);
        videoEl.muted = false;
        videoEl.play().catch(function () {});
      };

      var sub = await callLive("subscribe", {
        sessionId: viewer.sessionId,
        tracks: [
          {
            location: "remote",
            sessionId: liveRow.publisher_session_id,
            trackName: liveRow.video_track_name || "camera",
          },
          {
            location: "remote",
            sessionId: liveRow.publisher_session_id,
            trackName: liveRow.audio_track_name || "mic",
          },
        ],
      });

      // SFU pode devolver offer → respondemos
      var remoteDesc = sub.sessionDescription || sub.offer || sub;
      if (remoteDesc && remoteDesc.sdp) {
        await pc.setRemoteDescription(remoteDesc);
        var answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await waitIce(pc);
        await callLive("renegotiate", {
          sessionId: viewer.sessionId,
          sessionDescription: {
            type: pc.localDescription.type,
            sdp: pc.localDescription.sdp,
          },
        });
      }

      // incrementar viewers
      try {
        var SB = window.tchiloSupabase;
        if (SB) await SB.rpc("lives_inc_viewers", { p_live_id: liveRow.id, p_delta: 1 });
      } catch (e) {}

      document.getElementById("lvTitle").textContent =
        (liveRow.title || "") || ("@" + (liveRow.username || ""));
      document.getElementById("lvViewers").textContent = String(liveRow.viewer_count || 0);
      document.getElementById("lvBottom").innerHTML =
        '<button type="button" class="lv-btn" id="lvLeaveBtn">Sair</button>';
      document.getElementById("lvLeaveBtn").onclick = function () {
        stopViewer();
      };

      var videoEl = document.getElementById("lvVideo");
      videoEl.muted = false;
      document.getElementById("tchiloLiveOverlay").classList.add("open");
    } catch (e) {
      console.error("[live] viewer", e);
      showToast("Erro ao ver live: " + (e.message || e));
      stopViewer();
    }
  }

  function stopViewer() {
    viewer.ended = true;
    if (viewer.liveId) {
      try {
        var SB = window.tchiloSupabase;
        if (SB) SB.rpc("lives_inc_viewers", { p_live_id: viewer.liveId, p_delta: -1 });
      } catch (e) {}
    }
    try {
      if (viewer.pc) viewer.pc.close();
    } catch (e) {}
    viewer.pc = null;
    viewer.sessionId = null;
    viewer.liveId = null;
    var ov = document.getElementById("tchiloLiveOverlay");
    if (ov && !host.liveId) ov.classList.remove("open");
    var v = document.getElementById("lvVideo");
    if (v && !host.liveId) v.srcObject = null;
  }

  /* ---------- injeta botão no perfil ---------- */
  function injectProfileButton() {
    try {
      var actions = document.querySelector("#profileBody .profile-actions");
      if (!actions) return;
      if (actions.querySelector("[data-tchilo-live]")) return;

      // Só no próprio perfil (tem "Editar perfil")
      var hasEdit = !!actions.querySelector('button[onclick*="editprofile"]');
      if (!hasEdit) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "profile-btn";
      btn.setAttribute("data-tchilo-live", "1");
      btn.textContent = "Iniciar Live";
      btn.style.background = "#e11d48";
      btn.style.color = "#fff";
      btn.style.borderColor = "#e11d48";
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openSetup();
      };
      // Inserir no topo das ações
      actions.insertBefore(btn, actions.firstChild);
    } catch (e) {}
  }

  // Observar render do perfil
  var obs = new MutationObserver(function () {
    injectProfileButton();
  });
  function startObs() {
    var body = document.getElementById("profileBody");
    if (body) obs.observe(body, { childList: true, subtree: true });
    injectProfileButton();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObs);
  } else {
    startObs();
  }
  setInterval(injectProfileButton, 1500);

  // API pública
  window.tchiloOpenLiveSetup = openSetup;
  window.tchiloWatchLive = watchLive;
  window.tchiloStopLive = function () {
    if (host.liveId) stopHost();
    else stopViewer();
  };

  // Lista de lives ativas (para feed / stories no futuro)
  window.tchiloFetchActiveLives = async function () {
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return [];
      var r = await SB.from("lives")
        .select("*")
        .eq("status", "live")
        .order("started_at", { ascending: false })
        .limit(40);
      return r.data || [];
    } catch (e) {
      return [];
    }
  };
})();
