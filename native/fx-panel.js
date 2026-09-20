/**
 * tchilo-Pop — efeitos faciais (PNG)
 * Óculos prata, Chifres, Óculos estrela, Correntes
 */
(function () {
  "use strict";

  var FX = [
    {
      id: "oculos_prata",
      label: "Óculos",
      url: "https://iili.io/nTFNRtI.webp",
      anchor: "eyes",
      scale: 2.05,
      oy: 0
    },
    {
      id: "chifres",
      label: "Chifres",
      url: "https://iili.io/nTFNqn1.webp",
      anchor: "forehead",
      scale: 1.4,
      oy: -0.18
    },
    {
      id: "oculos_estrela",
      label: "Estrela",
      url: "https://iili.io/nTFNAwN.webp",
      anchor: "eyes",
      scale: 2.05,
      oy: 0
    },
    {
      id: "correntes",
      label: "Correntes",
      url: "https://iili.io/nTFNC6g.webp",
      anchor: "neck",
      scale: 1.75,
      oy: 0.28
    }
  ];

  var imgs = {};
  var activeId = null;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var ov = null;

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

    track.innerHTML = "";

    // Normal
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
      ic.style.cssText =
        "width:100%;height:100%;object-fit:cover;border-radius:50%;background:#111";
      b.appendChild(ic);
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        activeId = fx.id;
        track.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("active");
        });
        b.classList.add("active");
        // limpar canvas de warps antigos
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
      tw = eyeW * (fx.scale || 2);
    if (fx.anchor === "eyes") {
      cx = midE.x;
      cy = midE.y + eyeW * (fx.oy || 0);
      tw = eyeW * (fx.scale || 2.05);
    } else if (fx.anchor === "forehead") {
      cx = top.x;
      cy = top.y + faceH * (fx.oy || -0.15);
      tw = faceW * (fx.scale || 1.35);
    } else if (fx.anchor === "neck") {
      cx = chin.x;
      cy = chin.y + faceH * (fx.oy || 0.25);
      tw = faceW * (fx.scale || 1.7);
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

  function tick() {
    var cam = document.getElementById("tchiloStableCam");
    if (cam && cam.classList.contains("on")) {
      buildChips();
      ensureOverlay();
      startLoop();
    }
  }

  setInterval(tick, 600);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(tick, 200);
    });
  } else {
    setTimeout(tick, 200);
  }
})();
