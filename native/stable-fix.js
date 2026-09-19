/**
 * tchilo-Pop — câmara + efeitos de distorção facial
 * Olhos grandes, lábios grandes, cara grande, olhos vermelhos
 */
(function () {
  "use strict";

  var FX = [
    { id: "none", label: "Normal" },
    { id: "eyes", label: "Olhos+" },
    { id: "lips", label: "Lábios+" },
    { id: "face", label: "Cara+" },
    { id: "redeyes", label: "Olhos verm." }
  ];

  var fxIndex = 0;
  var stream = null;
  var facing = "user";
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var torchOn = false;
  var off = null; // offscreen canvas for processing

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
      "#tchiloStableCam .chip{flex:0 0 auto;min-width:56px;height:56px;padding:0 10px;border-radius:28px;border:2.5px solid rgba(255,255,255,.45);background:#222;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;white-space:nowrap}" +
      "#tchiloStableCam .chip.active{opacity:1;border-color:#c8f560;background:#1a2a0a;color:#c8f560;transform:scale(1.05)}" +
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
      b.textContent = fx.label;
      b.title = fx.label;
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
    if (el) {
      buildChips();
      return el;
    }
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
    document.getElementById("tscClose").onclick = function (e) {
      e.preventDefault();
      closeCam();
    };
    function flip(e) {
      e.preventDefault();
      if (torchOn) {
        try {
          setTorch(false);
        } catch (e0) {}
      }
      torchOn = false;
      facing = facing === "user" ? "environment" : "user";
      el.classList.toggle("mir", facing === "user");
      startCam();
    }
    document.getElementById("tscFlip").onclick = flip;
    var flashBtn = document.getElementById("tscFlash");
    if (flashBtn) flashBtn.onclick = toggleFlash;
    document.getElementById("tscSnap").onclick = function (e) {
      e.preventDefault();
      snap();
    };
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
        window.createMediaData = {
          type: isV ? "video" : "image",
          items: [{ type: isV ? "video" : "image", url: url, name: f.name, file: f }],
          files: [f]
        };
        window.createMediaFiles = [f];
      } catch (e) {}
      if (typeof window.tchiloOpenMediaEditor === "function") {
        try {
          window.tchiloOpenMediaEditor({
            mode: "post",
            mediaType: isV ? "video" : "image",
            src: url,
            file: f
          });
          return;
        } catch (e2) {}
      }
      if (typeof goTo === "function") goTo("create");
      ev.target.value = "";
    };
    buildChips();
    return el;
  }

  function setMsg(t) {
    var m = document.getElementById("tscMsg");
    if (m) m.textContent = t || "";
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
      stream = null;
    }
  }

  function closeCam() {
    if (torchOn) {
      try {
        setTorch(false);
      } catch (e0) {}
    }
    torchOn = false;
    loopOn = false;
    stopStream();
    var el = document.getElementById("tchiloStableCam");
    if (el) {
      el.classList.remove("on");
      el.style.display = "none";
    }
    document.body.style.overflow = "";
  }

  async function ensureLm() {
    if (lm) return lm;
    try {
      var vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm");
      var fs = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      var opts = {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
      };
      try {
        lm = await vision.FaceLandmarker.createFromOptions(fs, opts);
      } catch (e) {
        opts.baseOptions.delegate = "CPU";
        lm = await vision.FaceLandmarker.createFromOptions(fs, opts);
      }
      setMsg("Efeitos prontos · aponta a cara");
    } catch (e2) {
      console.warn("FaceLandmarker", e2);
      setMsg("A carregar deteção facial…");
    }
    return lm;
  }

  function pt(L, i, w, h) {
    var p = L[i];
    return { x: p.x * w, y: p.y * h };
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /** Amplia zona à volta de (cx,cy) — strength 0..0.6 */
  function magnify(src, dst, w, h, cx, cy, radius, strength) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    radius = Math.max(8, Math.round(radius));
    var r2 = radius * radius;
    var x0 = Math.max(0, cx - radius);
    var y0 = Math.max(0, cy - radius);
    var x1 = Math.min(w - 1, cx + radius);
    var y1 = Math.min(h - 1, cy + radius);
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var dx = x - cx;
        var dy = y - cy;
        var d2 = dx * dx + dy * dy;
        if (d2 >= r2 || d2 < 1) continue;
        var d = Math.sqrt(d2);
        var t = d / radius;
        // smooth falloff
        var f = 1 - strength * (1 - t) * (1 - t);
        var sx = cx + dx * f;
        var sy = cy + dy * f;
        // bilinear sample
        var x1i = Math.floor(sx);
        var y1i = Math.floor(sy);
        var x2i = Math.min(w - 1, x1i + 1);
        var y2i = Math.min(h - 1, y1i + 1);
        if (x1i < 0 || y1i < 0 || x1i >= w || y1i >= h) continue;
        var fx = sx - x1i;
        var fy = sy - y1i;
        var i00 = (y1i * w + x1i) * 4;
        var i10 = (y1i * w + x2i) * 4;
        var i01 = (y2i * w + x1i) * 4;
        var i11 = (y2i * w + x2i) * 4;
        var di = (y * w + x) * 4;
        for (var c = 0; c < 3; c++) {
          var v =
            src[i00 + c] * (1 - fx) * (1 - fy) +
            src[i10 + c] * fx * (1 - fy) +
            src[i01 + c] * (1 - fx) * fy +
            src[i11 + c] * fx * fy;
          dst[di + c] = v;
        }
      }
    }
  }

  /** Tinta vermelha na íris */
  function tintRed(dst, w, h, cx, cy, radius) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    radius = Math.max(4, Math.round(radius));
    var r2 = radius * radius;
    var x0 = Math.max(0, cx - radius);
    var y0 = Math.max(0, cy - radius);
    var x1 = Math.min(w - 1, cx + radius);
    var y1 = Math.min(h - 1, cy + radius);
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var dx = x - cx;
        var dy = y - cy;
        if (dx * dx + dy * dy >= r2) continue;
        var di = (y * w + x) * 4;
        var g = dst[di + 1];
        var b = dst[di + 2];
        // só pixels não muito claros (evita branco do reflexo)
        if (dst[di] + g + b > 600) continue;
        dst[di] = Math.min(255, dst[di] * 0.35 + 180);
        dst[di + 1] = Math.min(255, g * 0.25);
        dst[di + 2] = Math.min(255, b * 0.25);
      }
    }
  }

  function applyWarp(ctx, video, w, h, landmarks) {
    if (!off) off = document.createElement("canvas");
    if (off.width !== w || off.height !== h) {
      off.width = w;
      off.height = h;
    }
    var octx = off.getContext("2d", { willReadFrequently: true });
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, w, h);
    // desenhar vídeo (espelhado se frontal — landmarks vêm do vídeo não espelhado)
    octx.drawImage(video, 0, 0, w, h);

    var L = landmarks[0];
    var le = pt(L, 33, w, h);
    var re = pt(L, 263, w, h);
    var eyeW = dist(le, re) || 40;
    // centros aproximados da íris (MediaPipe)
    var leftIris = L[468] ? pt(L, 468, w, h) : le;
    var rightIris = L[473] ? pt(L, 473, w, h) : re;
    // boca
    var mL = pt(L, 61, w, h);
    var mR = pt(L, 291, w, h);
    var lipU = pt(L, 13, w, h);
    var lipD = pt(L, 14, w, h);
    var mouth = { x: (mL.x + mR.x) / 2, y: (lipU.y + lipD.y) / 2 };
    var mouthW = dist(mL, mR) || eyeW * 0.6;
    // cara
    var top = pt(L, 10, w, h);
    var chin = pt(L, 152, w, h);
    var cL = pt(L, 234, w, h);
    var cR = pt(L, 454, w, h);
    var faceC = { x: (cL.x + cR.x) / 2, y: (top.y + chin.y) / 2 };
    var faceR = Math.max(dist(cL, cR), dist(top, chin)) * 0.55;

    var img = octx.getImageData(0, 0, w, h);
    var src = new Uint8ClampedArray(img.data);
    var dst = img.data;
    // copy src already in dst from getImageData
    var fx = FX[fxIndex];
    var id = fx && fx.id;

    if (id === "eyes") {
      var rEye = eyeW * 0.38;
      magnify(src, dst, w, h, leftIris.x, leftIris.y, rEye, 0.42);
      // refresh src for second eye from current dst
      src = new Uint8ClampedArray(dst);
      magnify(src, dst, w, h, rightIris.x, rightIris.y, rEye, 0.42);
    } else if (id === "lips") {
      magnify(src, dst, w, h, mouth.x, mouth.y, mouthW * 0.85, 0.38);
    } else if (id === "face") {
      magnify(src, dst, w, h, faceC.x, faceC.y, faceR, 0.28);
    } else if (id === "redeyes") {
      var rIris = eyeW * 0.14;
      tintRed(dst, w, h, leftIris.x, leftIris.y, rIris);
      tintRed(dst, w, h, rightIris.x, rightIris.y, rIris);
    }

    octx.putImageData(img, 0, 0);

    // desenhar no canvas visível (espelhar se frontal)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (facing === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(off, 0, 0, w, h);
  }

  function paintLoop() {
    if (!loopOn) return;
    requestAnimationFrame(paintLoop);
    var root = document.getElementById("tchiloStableCam");
    if (!root || !root.classList.contains("on")) return;
    var video = document.getElementById("tscVideo");
    var canvas = document.getElementById("tscCanvas");
    if (!video || !canvas || video.readyState < 2) return;

    var w = video.videoWidth || 640;
    var h = video.videoHeight || 480;
    // processar em resolução média para performance no telemóvel
    var maxW = 480;
    var scale = w > maxW ? maxW / w : 1;
    var pw = Math.round(w * scale);
    var ph = Math.round(h * scale);

    var dpr = 1;
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    }
    var ctx = canvas.getContext("2d");
    var fx = FX[fxIndex];
    var needFx = fx && fx.id && fx.id !== "none";

    if (!needFx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pw, ph);
      return;
    }

    if (!lm) {
      ensureLm();
      // mostrar vídeo processado simples
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (facing === "user") {
        ctx.translate(pw, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, pw, ph);
      return;
    }

    var now = performance.now();
    if (now - lastT > 40) {
      lastT = now;
      try {
        var res = lm.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks.length) lastLm = res.faceLandmarks;
      } catch (e) {}
    }

    if (!lastLm) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (facing === "user") {
        ctx.translate(pw, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, pw, ph);
      return;
    }

    try {
      applyWarp(ctx, video, pw, ph, lastLm);
    } catch (e2) {
      console.warn("warp", e2);
    }
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
    } catch (e) {
      return false;
    }
  }

  function updateFlashBtn() {
    var btn = document.getElementById("tscFlash");
    if (!btn) return;
    var back = facing === "environment";
    var ok = back && torchSupported();
    btn.disabled = !ok;
    btn.classList.toggle("on", !!torchOn && ok);
    btn.title = !back
      ? "Flash só na câmara traseira"
      : ok
        ? torchOn
          ? "Desligar flash"
          : "Ligar flash"
        : "Flash não disponível";
  }

  function setTorch(on) {
    var track = getVideoTrack();
    if (!track) return Promise.resolve(false);
    torchOn = !!on;
    return track
      .applyConstraints({ advanced: [{ torch: torchOn }] })
      .then(function () {
        updateFlashBtn();
        setMsg(torchOn ? "Flash ligado" : "Flash desligado");
        return true;
      })
      .catch(function () {
        return track
          .applyConstraints({ torch: torchOn })
          .then(function () {
            updateFlashBtn();
            setMsg(torchOn ? "Flash ligado" : "Flash desligado");
            return true;
          })
          .catch(function () {
            torchOn = false;
            updateFlashBtn();
            setMsg("Flash não suportado");
            return false;
          });
      });
  }

  function toggleFlash(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (facing !== "environment") {
      setMsg("Vira para a câmara de trás para usar o flash");
      return;
    }
    if (!torchSupported()) {
      setMsg("Flash não disponível neste telemóvel");
      return;
    }
    setTorch(!torchOn);
  }

  function startCam() {
    stopStream();
    loopOn = true;
    var video = document.getElementById("tscVideo");
    if (!video) return;
    setMsg("A abrir câmara…");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg("Câmara indisponível");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      .then(function (s) {
        stream = s;
        video.srcObject = s;
        video.muted = true;
        video.setAttribute("playsinline", "true");
        video.play().catch(function () {});
        setMsg("Escolhe um efeito · Círculo = foto");
        buildChips();
        paintLoop();
        ensureLm();
        torchOn = false;
        updateFlashBtn();
      })
      .catch(function () {
        setMsg("Permite a CÂMARA nas definições");
      });
  }

  function snap() {
    var video = document.getElementById("tscVideo");
    var overlay = document.getElementById("tscCanvas");
    if (!video || video.readyState < 2) {
      setMsg("Aguarda a câmara…");
      return;
    }
    var w = video.videoWidth || 720;
    var h = video.videoHeight || 1280;
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d");
    var fx = FX[fxIndex];
    var needFx = fx && fx.id && fx.id !== "none";

    if (needFx && overlay && overlay.width > 0) {
      // foto com efeito (canvas já tem frame processado; escalar)
      if (facing === "user") {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      // overlay está espelhado no ecrã; desenhar vídeo+reprocessar em full res se possível
      try {
        if (lastLm && lm) {
          applyWarp(ctx, video, w, h, lastLm);
        } else {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          if (facing === "user") {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(overlay, 0, 0, w, h);
        }
      } catch (e) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (facing === "user") {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
      }
    } else {
      if (facing === "user") {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, w, h);
    }

    c.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var file;
      try {
        file = new File([blob], "tchilo.jpg", { type: "image/jpeg" });
      } catch (e) {
        file = blob;
        file.name = "tchilo.jpg";
      }
      closeCam();
      try {
        window.createMediaData = {
          type: "image",
          items: [{ type: "image", url: url, name: "tchilo.jpg", file: file }],
          files: [file]
        };
        window.createMediaFiles = [file];
      } catch (e2) {}
      if (typeof window.tchiloDeliverFaceFxPhoto === "function") {
        try {
          window.tchiloDeliverFaceFxPhoto(file, url);
          return;
        } catch (e3) {}
      }
      if (typeof window.tchiloOpenMediaEditor === "function") {
        try {
          window.tchiloOpenMediaEditor({ mode: "post", mediaType: "image", src: url, file: file });
          return;
        } catch (e4) {}
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
      if (x) {
        x.style.display = "none";
        x.classList.remove("open", "on");
      }
    });
    startCam();
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloOpenCameraNow = openCam;
  window.tchiloCloseCamera = closeCam;

  function ensureBtn() {
    css();
    var screen = document.getElementById("screen-create");
    if (!screen) return;
    var gal = document.getElementById("galleryBtn");
    if (gal) gal.style.display = "none";
    var fxb = document.getElementById("faceFxOpenBtn");
    if (fxb) fxb.style.display = "none";
    var btn = document.getElementById("tchiloOpenCamBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "tchiloOpenCamBtn";
      btn.className = "gallery-btn tchilo-keep";
      btn.innerHTML = "<span>Foto ou vídeo</span>";
      btn.style.cssText =
        "display:inline-flex!important;align-items:center;justify-content:center;width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;border:2px solid #0B0B0C;border-radius:16px;background:#c8f560;color:#0B0B0C;font-weight:800;font-size:15px;z-index:60";
      var preview = document.getElementById("createPreview");
      if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
      else
        (screen.querySelector(".create-body") || screen).insertBefore(
          btn,
          (screen.querySelector(".create-body") || screen).firstChild
        );
    }
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCam();
    };
  }

  document.addEventListener(
    "click",
    function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.closest && t.closest("#tchiloStableCam")) return;
      var btn = t.closest ? t.closest("#tchiloOpenCamBtn") : null;
      if (!btn) {
        var txt = ((t.textContent || "") + "").replace(/\s+/g, " ").trim().toLowerCase();
        if (txt.indexOf("foto ou vídeo") >= 0 || txt.indexOf("foto ou video") >= 0)
          btn = t.closest("button") || t;
      }
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      openCam();
    },
    true
  );

  function boot() {
    css();
    ensureBtn();
    [100, 800, 2000].forEach(function (ms) {
      setTimeout(ensureBtn, ms);
    });
    if (typeof window.goTo === "function" && !window.goTo.__stableCam) {
      var orig = window.goTo;
      window.goTo = function (s) {
        var r = orig.apply(this, arguments);
        if (s === "create" || s === "screen-create") {
          setTimeout(ensureBtn, 30);
          setTimeout(ensureBtn, 150);
        }
        return r;
      };
      window.goTo.__stableCam = true;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
