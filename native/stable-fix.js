/**
 * tchilo-Pop — câmara (efeitos removidos; novos virão um a um)
 */
(function () {
  "use strict";
  var FX = [{ label: "Normal", file: null }];
  var imgs = {}, fxIndex = 0, stream = null, facing = "user", lm = null, lastLm = null, lastT = 0, loopOn = false, torchOn = false;

  function asset(f) { return (window.TchiloFxPngAssets || {})[f] || null; }
  function loadImgs() {
    FX.forEach(function (fx) {
      if (!fx.file || imgs[fx.file]) return;
      var src = asset(fx.file);
      if (!src) return;
      var im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = function () { imgs[fx.file] = im; };
      im.src = src;
    });
  }

  function css() {
    if (document.getElementById("tchiloStableCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloStableCSS";
    st.textContent =
      "#galleryBtn,#faceFxOpenBtn{display:none!important}" +
      "#tchiloOpenCamBtn{display:inline-flex!important;z-index:60!important}" +
      "#tchiloStableCam{display:none;position:fixed;inset:0;z-index:2147483646;background:#000;flex-direction:column}" +
      "#tchiloStableCam.on{display:flex!important}" +
      "#tchiloStableCam .stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#111}" +
      "#tchiloStableCam video,#tchiloStableCam canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
      "#tchiloStableCam.mir video{transform:scaleX(-1)}" +
      "#tchiloStableCam canvas{z-index:3!important;pointer-events:none}" +
      "#tchiloStableCam .tb{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;justify-content:space-between;padding:calc(10px + env(safe-area-inset-top)) 12px 8px}" +
      "#tchiloStableCam .tb button{width:44px;height:44px;border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;font-size:20px;font-weight:800}" +
      "#tchiloStableCam .tb .tb-right{display:flex;gap:8px;align-items:center}" +
      "#tchiloStableCam .tb #tscFlash{display:flex;align-items:center;justify-content:center}" +
      "#tchiloStableCam .tb #tscFlash svg{display:block}" +
      "#tchiloStableCam .tb #tscFlash.on{background:#c8f560;color:#111}" +
      "#tchiloStableCam .tb #tscFlash:disabled{opacity:.35}" +
      "#tscFlipTop{display:none!important}" +
      "#tchiloStableCam .bot{flex:0 0 auto;z-index:20;background:#0a0a0a;padding:10px 0 calc(12px + env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center;gap:8px;border-top:1px solid rgba(255,255,255,.12)}" +
      "#tchiloStableCam .msg{color:#c8f560;font-size:12px;font-weight:600}" +
      "#tchiloStableCam .track{display:flex;gap:10px;width:100%;padding:4px 12px;overflow-x:auto;height:68px;align-items:center;-webkit-overflow-scrolling:touch;scrollbar-width:none}" +
      "#tchiloStableCam .track::-webkit-scrollbar{display:none}" +
      "#tchiloStableCam .chip{flex:0 0 56px;width:56px;height:56px;border-radius:50%;border:2.5px solid rgba(255,255,255,.45);background:#222;overflow:hidden;padding:0;opacity:.85;color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center}" +
      "#tchiloStableCam .chip.active{opacity:1;border-color:#c8f560;transform:scale(1.08)}" +
      "#tchiloStableCam .chip img{width:100%;height:100%;object-fit:cover}" +
      "#tchiloStableCam .bb{display:flex;justify-content:center;align-items:center;gap:24px;width:100%}" +
      "#tchiloStableCam .sh{width:70px;height:70px;border-radius:50%;border:4px solid #fff;background:#fff}" +
      "#tchiloStableCam .galb,#tchiloStableCam .flipb{width:48px;height:48px;border:2px solid #fff;background:rgba(255,255,255,.15);color:#fff;font-size:18px;overflow:hidden;padding:0;display:flex;align-items:center;justify-content:center}" +
      "#tchiloStableCam .galb{border-radius:12px}" +
      "#tchiloStableCam .flipb{border-radius:50%}" +
      "#tchiloStableCam .flipb svg{display:block}";
    document.head.appendChild(st);
  }

  function buildChips() {
    var track = document.getElementById("tscTrack");
    if (!track) return;
    track.innerHTML = "";
    FX.forEach(function (fx, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (i === fxIndex ? " active" : "");
      b.title = fx.label;
      b.textContent = fx.label;
      b.onclick = function () {
        fxIndex = i;
        lastLm = null;
        track.querySelectorAll(".chip").forEach(function (c, j) {
          c.classList.toggle("active", j === i);
        });
      };
      track.appendChild(b);
    });
  }

  function ensureUI() {
    var el = document.getElementById("tchiloStableCam");
    if (el) { buildChips(); return el; }
    el = document.createElement("div");
    el.id = "tchiloStableCam";
    el.className = "mir";
    el.innerHTML =
      '<div class="stage"><video id="tscVideo" playsinline muted autoplay></video><canvas id="tscCanvas"></canvas>' +
      '<div class="tb">' +
      '<button type="button" id="tscClose">×</button>' +
      '<div class="tb-right">' +
      '<button type="button" id="tscFlash" title="Flash" aria-label="Flash">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></button>' +
      '</div></div></div>' +
      '<div class="bot"><div class="msg" id="tscMsg">A abrir câmara…</div><div class="track" id="tscTrack"></div>' +
      '<div class="bb"><button type="button" class="galb" id="tscGal" aria-label="Galeria">▦</button>' +
      '<button type="button" class="sh" id="tscSnap"></button>' +
      '<button type="button" class="flipb" id="tscFlip" aria-label="Inverter">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>' +
      '<path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button></div>' +
      '<input type="file" id="tscFile" accept="image/*,video/*" style="display:none"></div>';
    document.body.appendChild(el);
    document.getElementById("tscClose").onclick = function (e) { e.preventDefault(); closeCam(); };
    function flip(e) {
      e.preventDefault();
      if (torchOn) { try { setTorch(false); } catch (e0) {} }
      torchOn = false;
      facing = facing === "user" ? "environment" : "user";
      el.classList.toggle("mir", facing === "user");
      startCam();
    }
    document.getElementById("tscFlip").onclick = flip;
    var flashBtn = document.getElementById("tscFlash");
    if (flashBtn) flashBtn.onclick = toggleFlash;
    document.getElementById("tscSnap").onclick = function (e) { e.preventDefault(); snap(); };
    document.getElementById("tscGal").onclick = function (e) {
      e.preventDefault();
      document.getElementById("tscFile").click();
    };
    document.getElementById("tscFile").onchange = function (ev) {
      var f = ev.target.files && ev.target.files[0];
      if (!f) return;
      var isV = (f.type || "").indexOf("video") === 0;
      var url = URL.createObjectURL(f);
      closeCam();
      try {
        window.createMediaData = { type: isV ? "video" : "image", items: [{ type: isV ? "video" : "image", url: url, name: f.name, file: f }], files: [f] };
        window.createMediaFiles = [f];
      } catch (e) {}
      if (typeof window.tchiloOpenMediaEditor === "function") {
        try { window.tchiloOpenMediaEditor({ mode: "post", mediaType: isV ? "video" : "image", src: url, file: f }); return; } catch (e2) {}
      }
      if (typeof goTo === "function") goTo("create");
      ev.target.value = "";
    };
    buildChips();
    return el;
  }

  function setMsg(t) { var m = document.getElementById("tscMsg"); if (m) m.textContent = t || ""; }
  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
      stream = null;
    }
  }
  function closeCam() {
    if (torchOn) { try { setTorch(false); } catch (e0) {} }
    torchOn = false;
    loopOn = false;
    stopStream();
    var el = document.getElementById("tchiloStableCam");
    if (el) { el.classList.remove("on"); el.style.display = "none"; }
    document.body.style.overflow = "";
  }

  async function ensureLm() {
    if (lm) return lm;
    try {
      var vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm");
      var fs = await vision.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
      var opts = {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
      };
      try { lm = await vision.FaceLandmarker.createFromOptions(fs, opts); }
      catch (e) { opts.baseOptions.delegate = "CPU"; lm = await vision.FaceLandmarker.createFromOptions(fs, opts); }
    } catch (e2) { console.warn("FaceLandmarker", e2); }
    return lm;
  }

  function paintLoop() {
    if (!loopOn) return;
    requestAnimationFrame(paintLoop);
    var root = document.getElementById("tchiloStableCam");
    if (!root || !root.classList.contains("on")) return;
    var video = document.getElementById("tscVideo"), canvas = document.getElementById("tscCanvas");
    if (!video || !canvas || video.readyState < 2) return;
    var w = video.videoWidth || 640, h = video.videoHeight || 480;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = "100%"; canvas.style.height = "100%";
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
  }

  function getVideoTrack() {
    if (!stream) return null;
    var tracks = stream.getVideoTracks();
    return tracks && tracks[0] ? tracks[0] : null;
  }
  function torchSupported() {
    var track = getVideoTrack();
    if (!track || typeof track.getCapabilities !== "function") return false;
    try {
      var caps = track.getCapabilities();
      return !!(caps && (caps.torch === true || (caps.torch && caps.torch.length)));
    } catch (e) { return false; }
  }
  function updateFlashBtn() {
    var btn = document.getElementById("tscFlash");
    if (!btn) return;
    var back = facing === "environment";
    var ok = back && torchSupported();
    btn.disabled = !ok;
    btn.classList.toggle("on", !!torchOn && ok);
    btn.title = !back ? "Flash só na câmara traseira" : ok ? (torchOn ? "Desligar flash" : "Ligar flash") : "Flash não disponível";
  }
  function setTorch(on) {
    var track = getVideoTrack();
    if (!track) return Promise.resolve(false);
    torchOn = !!on;
    return track.applyConstraints({ advanced: [{ torch: torchOn }] }).then(function () {
      updateFlashBtn(); setMsg(torchOn ? "Flash ligado" : "Flash desligado"); return true;
    }).catch(function () {
      return track.applyConstraints({ torch: torchOn }).then(function () {
        updateFlashBtn(); setMsg(torchOn ? "Flash ligado" : "Flash desligado"); return true;
      }).catch(function () {
        torchOn = false; updateFlashBtn(); setMsg("Flash não suportado"); return false;
      });
    });
  }
  function toggleFlash(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (facing !== "environment") { setMsg("Vira para a câmara de trás para usar o flash"); return; }
    if (!torchSupported()) { setMsg("Flash não disponível neste telemóvel"); return; }
    setTorch(!torchOn);
  }

  function startCam() {
    stopStream();
    loopOn = true;
    var video = document.getElementById("tscVideo");
    if (!video) return;
    setMsg("A abrir câmara…");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg("Câmara indisponível"); return;
    }
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
    }).then(function (s) {
      stream = s;
      video.srcObject = s;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      video.play().catch(function () {});
      setMsg("Galeria · Flash · Círculo = foto");
      buildChips();
      paintLoop();
      ensureLm();
      torchOn = false;
      updateFlashBtn();
    }).catch(function () {
      setMsg("Permite a CÂMARA nas definições");
    });
  }

  function snap() {
    var video = document.getElementById("tscVideo");
    if (!video || video.readyState < 2) { setMsg("Aguarda a câmara…"); return; }
    var w = video.videoWidth || 720, h = video.videoHeight || 1280;
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    if (facing === "user") { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, w, h);
    c.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var file;
      try { file = new File([blob], "tchilo.jpg", { type: "image/jpeg" }); }
      catch (e) { file = blob; file.name = "tchilo.jpg"; }
      closeCam();
      try {
        window.createMediaData = { type: "image", items: [{ type: "image", url: url, name: "tchilo.jpg", file: file }], files: [file] };
        window.createMediaFiles = [file];
      } catch (e2) {}
      if (typeof window.tchiloDeliverFaceFxPhoto === "function") {
        try { window.tchiloDeliverFaceFxPhoto(file, url); return; } catch (e3) {}
      }
      if (typeof window.tchiloOpenMediaEditor === "function") {
        try { window.tchiloOpenMediaEditor({ mode: "post", mediaType: "image", src: url, file: file }); return; } catch (e4) {}
      }
      if (typeof goTo === "function") goTo("create");
    }, "image/jpeg", 0.92);
  }

  function openCam() {
    css();
    var el = ensureUI();
    buildChips();
    el.classList.add("on");
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.zIndex = "2147483646";
    document.body.style.overflow = "hidden";
    ["tchiloCam", "tchiloCamLive", "tchiloFaceFx"].forEach(function (id) {
      var x = document.getElementById(id);
      if (x) { x.style.display = "none"; x.classList.remove("open", "on"); }
    });
    startCam();
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloOpenCameraNow = openCam;
  window.tchiloCloseCamera = closeCam;
  /** API para adicionar efeitos novos um a um */
  window.tchiloAddFaceFx = function (fx) {
    if (!fx || !fx.label) return;
    FX.push({
      label: fx.label,
      file: fx.file || null,
      anchor: fx.anchor || "face",
      scale: fx.scale != null ? fx.scale : 1.5,
      oy: fx.oy != null ? fx.oy : 0
    });
    if (fx.file && fx.dataUrl) {
      window.TchiloFxPngAssets = window.TchiloFxPngAssets || {};
      window.TchiloFxPngAssets[fx.file] = fx.dataUrl;
      loadImgs();
    }
    buildChips();
  };

  function ensureBtn() {
    css();
    var screen = document.getElementById("screen-create");
    if (!screen) return;
    var gal = document.getElementById("galleryBtn");
    if (gal) gal.style.display = "none";
    var fx = document.getElementById("faceFxOpenBtn");
    if (fx) fx.style.display = "none";
    var btn = document.getElementById("tchiloOpenCamBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "tchiloOpenCamBtn";
      btn.className = "gallery-btn tchilo-keep";
      btn.innerHTML = "<span>Foto ou vídeo</span>";
      btn.style.cssText = "display:inline-flex!important;align-items:center;justify-content:center;width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;border:2px solid #0B0B0C;border-radius:16px;background:#c8f560;color:#0B0B0C;font-weight:800;font-size:15px;z-index:60";
      var preview = document.getElementById("createPreview");
      if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
      else (screen.querySelector(".create-body") || screen).insertBefore(btn, (screen.querySelector(".create-body") || screen).firstChild);
    }
    btn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openCam(); };
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t) return;
    if (t.closest && t.closest("#tchiloStableCam")) return;
    var btn = t.closest ? t.closest("#tchiloOpenCamBtn") : null;
    if (!btn) {
      var txt = ((t.textContent || "") + "").replace(/\s+/g, " ").trim().toLowerCase();
      if (txt.indexOf("foto ou vídeo") >= 0 || txt.indexOf("foto ou video") >= 0) btn = t.closest("button") || t;
    }
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    openCam();
  }, true);

  function boot() {
    window.TchiloFxPngAssets = {};
    css();
    ensureBtn();
    [100, 800, 2000].forEach(function (ms) { setTimeout(ensureBtn, ms); });
    if (typeof window.goTo === "function" && !window.goTo.__stableCam) {
      var orig = window.goTo;
      window.goTo = function (s) {
        var r = orig.apply(this, arguments);
        if (s === "create" || s === "screen-create") { setTimeout(ensureBtn, 30); setTimeout(ensureBtn, 150); }
        return r;
      };
      window.goTo.__stableCam = true;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
