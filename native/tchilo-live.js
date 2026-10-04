/**
 * tchilo-Pop — Live (Cloudflare Realtime SFU)
 * Ecrã completo · inverter câmara · partilhar · notificar seguidores
 */
(function () {
  "use strict";

  if (window.__tchiloLiveV2) return;
  window.__tchiloLiveV2 = true;
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

  var host = {
    liveId: null,
    sessionId: null,
    pc: null,
    stream: null,
    ended: false,
    facing: "user",
    username: "",
    title: "",
    videoSender: null,
  };

  var viewer = {
    liveId: null,
    sessionId: null,
    pc: null,
    ended: false,
    username: "",
  };

  var previewStream = null;

  function showToast(msg) {
    try {
      if (typeof window.showToast === "function") window.showToast(msg);
      else console.log("[live]", msg);
    } catch (e) {}
  }

  function liveShareUrl(username) {
    var u = (username || "").replace(/^@/, "");
    return "https://tchilopop.com/?live=" + encodeURIComponent(u);
  }

  function ensureLiveUI() {
    if (document.getElementById("tchiloLiveOverlay")) return;

    var css =
      "#tchiloLiveOverlay{position:fixed;inset:0;z-index:2000;background:#0b0b0c;display:none;flex-direction:column;color:#fff}" +
      "#tchiloLiveOverlay.open{display:flex}" +
      "#tchiloLiveOverlay .lv-top{display:flex;align-items:center;gap:10px;padding:max(12px,env(safe-area-inset-top)) 14px 12px;position:absolute;top:0;left:0;right:0;z-index:5;background:linear-gradient(180deg,rgba(0,0,0,.6),transparent)}" +
      "#tchiloLiveOverlay .lv-badge{background:#e11d48;color:#fff;font:800 11px Inter,sans-serif;padding:4px 8px;border-radius:8px;letter-spacing:.04em}" +
      "#tchiloLiveOverlay .lv-viewers{font:700 13px Inter,sans-serif;opacity:.9}" +
      "#tchiloLiveOverlay .lv-title{font:800 14px Inter,sans-serif;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      "#tchiloLiveOverlay .lv-close{width:40px;height:40px;border:2px solid #fff;border-radius:50%;background:rgba(0,0,0,.35);color:#fff;font-size:22px;line-height:1;cursor:pointer;flex-shrink:0}" +
      "#tchiloLiveOverlay video{width:100%;height:100%;object-fit:cover;background:#000}" +
      "#tchiloLiveOverlay .lv-bottom{position:absolute;left:0;right:0;bottom:0;padding:16px 14px max(20px,env(safe-area-inset-bottom));display:flex;gap:10px;justify-content:center;flex-wrap:wrap;background:linear-gradient(0deg,rgba(0,0,0,.65),transparent)}" +
      "#tchiloLiveOverlay .lv-btn{border:2.5px solid #fff;background:rgba(0,0,0,.45);color:#fff;border-radius:999px;padding:12px 18px;font:800 13px Inter,sans-serif;cursor:pointer}" +
      "#tchiloLiveOverlay .lv-btn.danger{background:#e11d48;border-color:#e11d48}" +
      "#tchiloLiveOverlay .lv-btn.icon{width:48px;height:48px;padding:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px}" +
      /* SETUP full screen */ +
      "#tchiloLiveSetup{position:fixed;inset:0;z-index:1999;background:#0b0b0c;display:none;flex-direction:column;color:#fff}" +
      "#tchiloLiveSetup.open{display:flex}" +
      "#tchiloLiveSetup .su-video-wrap{flex:1;position:relative;min-height:0;background:#111}" +
      "#tchiloLiveSetup #lvPreviewVideo{width:100%;height:100%;object-fit:cover;background:#000}" +
      "#tchiloLiveSetup .su-top{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:max(12px,env(safe-area-inset-top)) 14px 10px;background:linear-gradient(180deg,rgba(0,0,0,.55),transparent)}" +
      "#tchiloLiveSetup .su-back{width:42px;height:42px;border:2px solid #fff;border-radius:50%;background:rgba(0,0,0,.35);color:#fff;font-size:22px;cursor:pointer}" +
      "#tchiloLiveSetup .su-flip{width:42px;height:42px;border:2px solid #fff;border-radius:50%;background:rgba(0,0,0,.35);color:#fff;font-size:18px;cursor:pointer}" +
      "#tchiloLiveSetup .su-panel{padding:16px 16px max(22px,env(safe-area-inset-bottom));background:linear-gradient(0deg,#0b0b0c 70%,transparent)}" +
      "#tchiloLiveSetup .su-label{font:800 12px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;opacity:.7;margin-bottom:8px}" +
      "#tchiloLiveSetup #lvTitleInput{width:100%;box-sizing:border-box;border:2.5px solid rgba(255,255,255,.35);border-radius:14px;padding:14px 16px;font:600 16px Inter,sans-serif;background:rgba(255,255,255,.08);color:#fff;margin-bottom:14px}" +
      "#tchiloLiveSetup #lvTitleInput::placeholder{color:rgba(255,255,255,.45)}" +
      "#tchiloLiveSetup .su-go{width:100%;border:0;border-radius:16px;padding:16px;font:800 16px Inter,sans-serif;cursor:pointer;background:#e11d48;color:#fff}" +
      "#tchiloLiveSetup .su-go:disabled{opacity:.5}";

    var st = document.createElement("style");
    st.id = "tchiloLiveStyles";
    st.textContent = css;
    document.head.appendChild(st);

    /* Overlay transmissão / viewer */
    var overlay = document.createElement("div");
    overlay.id = "tchiloLiveOverlay";
    overlay.innerHTML =
      '<div class="lv-top">' +
      '<span class="lv-badge">AO VIVO</span>' +
      '<span class="lv-viewers" id="lvViewers">👁 0</span>' +
      '<span class="lv-title" id="lvTitle"></span>' +
      '<button type="button" class="lv-close" id="lvCloseBtn" aria-label="Fechar">×</button>' +
      "</div>" +
      '<video id="lvVideo" playsinline autoplay muted></video>' +
      '<div class="lv-bottom" id="lvBottom"></div>';
    document.body.appendChild(overlay);

    /* Setup ecrã completo */
    var setup = document.createElement("div");
    setup.id = "tchiloLiveSetup";
    setup.innerHTML =
      '<div class="su-video-wrap">' +
      '<video id="lvPreviewVideo" playsinline autoplay muted></video>' +
      '<div class="su-top">' +
      '<button type="button" class="su-back" id="lvSetupBack" aria-label="Voltar">←</button>' +
      '<b style="font:800 16px Inter,sans-serif">Nova Live</b>' +
      '<button type="button" class="su-flip" id="lvSetupFlip" aria-label="Inverter câmara">🔄</button>' +
      "</div></div>" +
      '<div class="su-panel">' +
      '<div class="su-label">Título</div>' +
      '<input id="lvTitleInput" maxlength="120" placeholder="O que vais transmitir?" />' +
      '<button type="button" class="su-go" id="lvStartBtn">Iniciar Live</button>' +
      "</div>";
    document.body.appendChild(setup);

    document.getElementById("lvSetupBack").onclick = function () {
      closeSetup();
    };
    document.getElementById("lvSetupFlip").onclick = function () {
      flipPreviewCamera();
    };
    document.getElementById("lvStartBtn").onclick = function () {
      var title = (document.getElementById("lvTitleInput").value || "").trim();
      var btn = document.getElementById("lvStartBtn");
      btn.disabled = true;
      btn.textContent = "A iniciar…";
      startHost(title).finally(function () {
        btn.disabled = false;
        btn.textContent = "Iniciar Live";
      });
    };
    document.getElementById("lvCloseBtn").onclick = function () {
      if (host.liveId && !host.ended) stopHost();
      else stopViewer();
    };
  }

  async function openPreviewCamera() {
    stopPreviewCamera();
    try {
      previewStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: host.facing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      var v = document.getElementById("lvPreviewVideo");
      if (v) {
        v.srcObject = previewStream;
        v.play().catch(function () {});
      }
    } catch (e) {
      console.warn("[live] preview cam", e);
      showToast("Não foi possível abrir a câmara");
    }
  }

  function stopPreviewCamera() {
    try {
      if (previewStream) {
        previewStream.getTracks().forEach(function (t) {
          t.stop();
        });
      }
    } catch (e) {}
    previewStream = null;
    var v = document.getElementById("lvPreviewVideo");
    if (v) v.srcObject = null;
  }

  async function flipPreviewCamera() {
    host.facing = host.facing === "user" ? "environment" : "user";
    if (host.pc && host.stream) {
      await flipHostCamera();
      return;
    }
    await openPreviewCamera();
  }

  async function flipHostCamera() {
    try {
      var newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: host.facing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      var newTrack = newStream.getVideoTracks()[0];
      if (!newTrack) return;

      var oldVideo = host.stream && host.stream.getVideoTracks()[0];
      if (oldVideo) {
        oldVideo.stop();
        host.stream.removeTrack(oldVideo);
      }
      host.stream.addTrack(newTrack);

      if (host.videoSender) {
        await host.videoSender.replaceTrack(newTrack);
      } else if (host.pc) {
        var senders = host.pc.getSenders();
        for (var i = 0; i < senders.length; i++) {
          if (senders[i].track && senders[i].track.kind === "video") {
            host.videoSender = senders[i];
            await senders[i].replaceTrack(newTrack);
            break;
          }
        }
      }

      var videoEl = document.getElementById("lvVideo");
      if (videoEl) {
        videoEl.srcObject = host.stream;
        videoEl.play().catch(function () {});
      }
      newStream.getAudioTracks().forEach(function (t) {
        t.stop();
      });
    } catch (e) {
      console.warn("[live] flip host", e);
      showToast("Não foi possível inverter a câmara");
    }
  }

  function openSetup() {
    ensureLiveUI();
    var session = typeof getSession === "function" ? getSession() : null;
    if (!session || !session.username) {
      showToast("Inicia sessão para fazer live");
      return;
    }
    host.facing = "user";
    document.getElementById("lvTitleInput").value = "";
    document.getElementById("tchiloLiveSetup").classList.add("open");
    openPreviewCamera();
  }

  function closeSetup() {
    stopPreviewCamera();
    var el = document.getElementById("tchiloLiveSetup");
    if (el) el.classList.remove("open");
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

  function buildHostControls() {
    var bottom = document.getElementById("lvBottom");
    if (!bottom) return;
    bottom.innerHTML =
      '<button type="button" class="lv-btn icon" id="lvFlipBtn" title="Inverter câmara">🔄</button>' +
      '<button type="button" class="lv-btn icon" id="lvShareBtn" title="Partilhar">↗</button>' +
      '<button type="button" class="lv-btn icon" id="lvCopyBtn" title="Copiar link">🔗</button>' +
      '<button type="button" class="lv-btn danger" id="lvEndBtn">Terminar</button>';

    document.getElementById("lvFlipBtn").onclick = function () {
      host.facing = host.facing === "user" ? "environment" : "user";
      flipHostCamera();
    };
    document.getElementById("lvShareBtn").onclick = function () {
      shareLive(host.username, host.title);
    };
    document.getElementById("lvCopyBtn").onclick = function () {
      copyLiveLink(host.username);
    };
    document.getElementById("lvEndBtn").onclick = function () {
      stopHost();
    };
  }

  function shareLive(username, title) {
    var url = liveShareUrl(username);
    var text = (title ? title + " — " : "") + "Estou ao vivo no Tchilo! " + url;
    if (navigator.share) {
      navigator
        .share({ title: "Live no Tchilo", text: text, url: url })
        .catch(function () {
          copyLiveLink(username);
        });
    } else {
      copyLiveLink(username);
    }
  }

  function copyLiveLink(username) {
    var url = liveShareUrl(username);
    function ok() {
      showToast("Link copiado");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(ok).catch(function () {
        fallbackCopy(url);
        ok();
      });
    } else {
      fallbackCopy(url);
      ok();
    }
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) {}
  }

  async function startHost(title) {
    ensureLiveUI();
    host.ended = false;
    var session = typeof getSession === "function" ? getSession() : null;
    if (!session) {
      showToast("Sem sessão");
      return;
    }
    host.username = session.username;
    host.title = title || "";

    try {
      showToast("A preparar live…");

      // Reutilizar preview se existir; senão pedir câmara+mic
      var stream;
      if (previewStream && previewStream.getVideoTracks().length) {
        var audioOnly = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        stream = new MediaStream([
          previewStream.getVideoTracks()[0],
          audioOnly.getAudioTracks()[0],
        ]);
        previewStream = null;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: host.facing,
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
          audio: true,
        });
      }
      host.stream = stream;

      var started = await callLive("start_live", {
        title: title || "",
        username: session.username,
        display_name: session.displayName || session.username,
      });

      host.liveId = started.live && started.live.id;
      host.sessionId = started.sessionId;

      var pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
        bundlePolicy: "max-bundle",
      });
      host.pc = pc;

      var videoTrack = stream.getVideoTracks()[0];
      var audioTrack = stream.getAudioTracks()[0];

      var vTx = pc.addTransceiver(videoTrack, { direction: "sendonly" });
      var aTx = pc.addTransceiver(audioTrack, { direction: "sendonly" });
      host.videoSender = vTx.sender;

      var offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitIce(pc);

      var pub = await callLive("publish", {
        sessionId: host.sessionId,
        sessionDescription: {
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
        },
        tracks: [
          { location: "local", mid: vTx.mid, trackName: "camera" },
          { location: "local", mid: aTx.mid, trackName: "mic" },
        ],
      });

      var answer = pub.sessionDescription || pub.answer || pub;
      if (answer && answer.sdp) {
        await pc.setRemoteDescription(answer);
      } else if (pub.sdp) {
        await pc.setRemoteDescription({ type: "answer", sdp: pub.sdp });
      }

      closeSetup();

      var videoEl = document.getElementById("lvVideo");
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.play().catch(function () {});

      document.getElementById("lvTitle").textContent =
        title || "@" + session.username;
      document.getElementById("lvViewers").textContent = "👁 0";
      buildHostControls();

      document.getElementById("tchiloLiveOverlay").classList.add("open");
      showToast("Estás ao vivo!");

      if (!window.__tchiloLiveViewerPoll) {
        window.__tchiloLiveViewerPoll = setInterval(refreshViewerCount, 5000);
      }
    } catch (e) {
      console.error("[live] host", e);
      showToast("Erro ao iniciar live: " + (e.message || e));
      cleanupHost();
      closeSetup();
    }
  }

  async function refreshViewerCount() {
    if (!host.liveId || host.ended) return;
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return;
      var r = await SB.from("lives")
        .select("viewer_count")
        .eq("id", host.liveId)
        .maybeSingle();
      if (r.data && document.getElementById("lvViewers")) {
        document.getElementById("lvViewers").textContent =
          "👁 " + String(r.data.viewer_count || 0);
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
      if (host.stream) {
        host.stream.getTracks().forEach(function (t) {
          t.stop();
        });
      }
    } catch (e) {}
    try {
      if (host.pc) host.pc.close();
    } catch (e) {}
    host.stream = null;
    host.pc = null;
    host.videoSender = null;
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
    viewer.username = liveRow.username || "";

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

      try {
        var SB = window.tchiloSupabase;
        if (SB)
          await SB.rpc("lives_inc_viewers", {
            p_live_id: liveRow.id,
            p_delta: 1,
          });
      } catch (e) {}

      document.getElementById("lvTitle").textContent =
        liveRow.title || "@" + (liveRow.username || "");
      document.getElementById("lvViewers").textContent =
        "👁 " + String(liveRow.viewer_count || 0);

      var bottom = document.getElementById("lvBottom");
      bottom.innerHTML =
        '<button type="button" class="lv-btn icon" id="lvShareBtnV" title="Partilhar">↗</button>' +
        '<button type="button" class="lv-btn icon" id="lvCopyBtnV" title="Copiar link">🔗</button>' +
        '<button type="button" class="lv-btn" id="lvLeaveBtn">Sair</button>';
      document.getElementById("lvShareBtnV").onclick = function () {
        shareLive(liveRow.username, liveRow.title);
      };
      document.getElementById("lvCopyBtnV").onclick = function () {
        copyLiveLink(liveRow.username);
      };
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
        if (SB)
          SB.rpc("lives_inc_viewers", {
            p_live_id: viewer.liveId,
            p_delta: -1,
          });
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

  /* Deep link ?live=username */
  function tryOpenLiveFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var liveUser = params.get("live");
      if (!liveUser) return;
      setTimeout(async function () {
        try {
          var SB = window.tchiloSupabase;
          if (!SB) return;
          var r = await SB.from("lives")
            .select("*")
            .eq("status", "live")
            .ilike("username", liveUser)
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (r.data) watchLive(r.data);
          else showToast("Esta live já terminou");
        } catch (e) {}
      }, 1200);
    } catch (e) {}
  }

  function injectProfileButton() {
    try {
      var actions = document.querySelector("#profileBody .profile-actions");
      if (!actions) return;
      if (actions.querySelector("[data-tchilo-live]")) return;

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
      actions.insertBefore(btn, actions.firstChild);
    } catch (e) {}
  }

  var obs = new MutationObserver(function () {
    injectProfileButton();
  });
  function startObs() {
    var body = document.getElementById("profileBody");
    if (body) obs.observe(body, { childList: true, subtree: true });
    injectProfileButton();
    tryOpenLiveFromUrl();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObs);
  } else {
    startObs();
  }
  setInterval(injectProfileButton, 1500);

  window.tchiloOpenLiveSetup = openSetup;
  window.tchiloWatchLive = watchLive;
  window.tchiloStopLive = function () {
    if (host.liveId) stopHost();
    else stopViewer();
  };
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
