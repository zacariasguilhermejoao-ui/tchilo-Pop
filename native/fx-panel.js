/**
 * tchilo-Pop — efeitos faciais (PNG)
 * Tamanhos reduzidos + ícones quadrados sem distorção
 */
(function () {
  "use strict";

  var FX = [
    {
      id: "oculos_prata",
      label: "Óculos",
      url: "https://iili.io/nTFNRtI.webp",
      anchor: "eyes",
      scale: 1.45,
      oy: 0
    },
    {
      id: "chifres",
      label: "Chifres",
      url: "https://iili.io/nTFNqn1.webp",
      anchor: "forehead",
      scale: 0.95,
      oy: -0.14
    },
    {
      id: "oculos_estrela",
      label: "Estrela",
      url: "https://iili.io/nTFNAwN.webp",
      anchor: "eyes",
      scale: 1.45,
      oy: 0
    },
    {
      id: "correntes",
      label: "Correntes",
      url: "https://iili.io/nTFNC6g.webp",
      anchor: "neck",
      scale: 1.15,
      oy: 0.22
    }
  ];

  var imgs = {};
  var activeId = null;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var ov = null;

  // CSS: chips quadrados, ícone contain (sem esticar)
  if (!document.getElementById("tchiloFxPanelCSS")) {
    var st = document.createElement("style");
    st.id = "tchiloFxPanelCSS";
    st.textContent =
      "#tchiloStableCam .chip{width:56px!important;height:56px!important;min-width:56px!important;padding:4px!important;overflow:hidden!important;border-radius:50%!important}" +
      "#tchiloStableCam .chip img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;border-radius:50%!important;background:#1a1a1a!important}";
    document.head.appendChild(st);
  }

  FX.forEach(function (fx) {
    var im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = function () {
      imgs[fx.id] = im;
    };
    im.src = fx.url;
  });

  function ensureOverlay() {
    var stage = document.querySelector("#tchiloStableCam .stage");
    if (!stage) return null;
    ov = document.getElementById("tscFxCanvas");
    if (!ov) {
      ov = document.createElement("canvas");
      ov.id = "tscFxCanvas";
      ov.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:5;pointer-events:none";
      stage.appendChild(ov);
    }
    return ov;
  }

  function clearOv() {
    if (!ov) return;
    var ctx = ov.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ov.width || 1, ov.height || 1);
  }

  function buildChips() {
    var track = document.getElementById("tscTrack");
    if (!track) return;
    if (track.querySelector("[data-fx]") && track.querySelectorAll(".chip").length >= 5) return;

    track.innerHTML = "";

    var n = document.createElement("button");
    n.type = "button";
    n.className = "chip" + (activeId ? "" : " active");
    n.textContent = "Normal";
    n.title = "Normal";
    n.onclick = function () {
      activeId = null;
      clearOv();
      track.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("active");
      });
      n.classList.add("active");
    };
    track.appendChild(n);

    FX.forEach(function (fx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (activeId === fx.id ? " active" : "");
      b.title = fx.label;
      b.setAttribute("data-fx", fx.id);
      var ic = document.createElement("img");
      ic.src = fx.url;
      ic.alt = fx.label;
      ic.crossOrigin = "anonymous";
      // contain = não distorce / não estica
      ic.style.cssText =
        "width:100%;height:100%;object-fit:contain;object-position:center;border-radius:50%;background:#1a1a1a";
      b.appendChild(ic);
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        activeId = fx.id;
        track.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("active");
        });
        b.classList.add("active");
        try {
          var main = document.getElementById("tscCanvas");
          if (main) {
            var ctx = main.getContext("2d");
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, main.width, main.height);
          }
        } catch (e2) {}
        startLoop();
      };
      track.appendChild(b);
    });
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
    } catch (e2) {
      console.warn("fx lm", e2);
    }
    return lm;
  }

  function getFx() {
    for (var i = 0; i < FX.length; i++) {
      if (FX[i].id === activeId) return FX[i];
    }
    return null;
  }

  function draw() {
    var fx = getFx();
    if (!fx) {
      clearOv();
      return;
    }
    var video = document.getElementById("tscVideo");
    var canvas = ensureOverlay();
    if (!video || !canvas || video.readyState < 2) return;
    var im = imgs[fx.id];
    if (!im || !im.complete || !im.naturalWidth) return;

    var w = video.videoWidth || 640;
    var h = video.videoHeight || 480;
    var maxW = 520;
    var sc = w > maxW ? maxW / w : 1;
    var pw = Math.round(w * sc);
    var ph = Math.round(h * sc);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pw, ph);

    if (!lm) {
      ensureLm();
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
    if (!lastLm) return;

    var L = lastLm[0];
    function P(i) {
      return { x: L[i].x * pw, y: L[i].y * ph };
    }
    var le = P(33),
      re = P(263),
      top = P(10),
      chin = P(152),
      cL = P(234),
      cR = P(454);
    var eyeW = Math.hypot(le.x - re.x, le.y - re.y) || 40;
    var faceW = Math.hypot(cL.x - cR.x, cL.y - cR.y) || eyeW * 2.2;
    var faceH = Math.hypot(top.x - chin.x, top.y - chin.y) || faceW;
    var midE = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
    var angle = Math.atan2(re.y - le.y, re.x - le.x);

    var cx = midE.x,
      cy = midE.y,
      tw = eyeW * (fx.scale || 1.4);
    if (fx.anchor === "eyes") {
      cx = midE.x;
      cy = midE.y + eyeW * (fx.oy || 0);
      tw = eyeW * (fx.scale || 1.45);
    } else if (fx.anchor === "forehead") {
      cx = top.x;
      cy = top.y + faceH * (fx.oy || -0.14);
      tw = faceW * (fx.scale || 0.95);
    } else if (fx.anchor === "neck") {
      cx = chin.x;
      cy = chin.y + faceH * (fx.oy || 0.22);
      tw = faceW * (fx.scale || 1.15);
    }
    var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));

    var root = document.getElementById("tchiloStableCam");
    var mir = root && root.classList.contains("mir");
    ctx.save();
    if (mir) {
      ctx.translate(pw, 0);
      ctx.scale(-1, 1);
    }
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (e3) {}
    ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  function loop() {
    if (!loopOn) return;
    requestAnimationFrame(loop);
    var root = document.getElementById("tchiloStableCam");
    if (!root || !root.classList.contains("on")) return;
    if (activeId) draw();
    else clearOv();
  }

  function startLoop() {
    if (loopOn) return;
    loopOn = true;
    ensureLm();
    loop();
  }

  function hookSnap() {
    var btn = document.getElementById("tscSnap");
    if (!btn || btn.__fxSnap) return;
    btn.__fxSnap = true;
    btn.addEventListener(
      "click",
      function (e) {
        if (!activeId) return;
        e.preventDefault();
        e.stopPropagation();
        var video = document.getElementById("tscVideo");
        if (!video || video.readyState < 2) return;
        var w = video.videoWidth || 720;
        var h = video.videoHeight || 1280;
        var c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        var ctx = c.getContext("2d");
        var root = document.getElementById("tchiloStableCam");
        var mir = root && root.classList.contains("mir");
        if (mir) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        var fx = getFx();
        var im = fx && imgs[fx.id];
        if (fx && im && lastLm) {
          var L = lastLm[0];
          function P(i) {
            return { x: L[i].x * w, y: L[i].y * h };
          }
          var le = P(33),
            re = P(263),
            top = P(10),
            chin = P(152),
            cL = P(234),
            cR = P(454);
          var eyeW = Math.hypot(le.x - re.x, le.y - re.y) || 40;
          var faceW = Math.hypot(cL.x - cR.x, cL.y - cR.y) || eyeW * 2.2;
          var faceH = Math.hypot(top.x - chin.x, top.y - chin.y) || faceW;
          var midE = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
          var angle = Math.atan2(re.y - le.y, re.x - le.x);
          var cx = midE.x,
            cy = midE.y,
            tw = eyeW * 1.45;
          if (fx.anchor === "eyes") {
            cx = midE.x;
            cy = midE.y + eyeW * (fx.oy || 0);
            tw = eyeW * (fx.scale || 1.45);
          } else if (fx.anchor === "forehead") {
            cx = top.x;
            cy = top.y + faceH * (fx.oy || -0.14);
            tw = faceW * (fx.scale || 0.95);
          } else if (fx.anchor === "neck") {
            cx = chin.x;
            cy = chin.y + faceH * (fx.oy || 0.22);
            tw = faceW * (fx.scale || 1.15);
          }
          var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
          ctx.restore();
        }
        c.toBlob(function (blob) {
          if (!blob) return;
          var url = URL.createObjectURL(blob);
          var file;
          try {
            file = new File([blob], "tchilo.jpg", { type: "image/jpeg" });
          } catch (err) {
            file = blob;
            file.name = "tchilo.jpg";
          }
          try {
            if (typeof window.tchiloCloseCamera === "function") window.tchiloCloseCamera();
          } catch (e3) {}
          try {
            window.createMediaData = {
              type: "image",
              items: [{ type: "image", url: url, name: "tchilo.jpg", file: file }],
              files: [file]
            };
            window.createMediaFiles = [file];
          } catch (e4) {}
          if (typeof window.tchiloOpenMediaEditor === "function") {
            try {
              window.tchiloOpenMediaEditor({
                mode: "post",
                mediaType: "image",
                src: url,
                file: file
              });
              return;
            } catch (e5) {}
          }
          if (typeof goTo === "function") goTo("create");
        }, "image/jpeg", 0.92);
      },
      true
    );
  }

  function tick() {
    var cam = document.getElementById("tchiloStableCam");
    if (cam && cam.classList.contains("on")) {
      buildChips();
      ensureOverlay();
      hookSnap();
      startLoop();
    }
  }

  setInterval(tick, 500);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(tick, 200);
    });
  } else {
    setTimeout(tick, 200);
  }
})();
