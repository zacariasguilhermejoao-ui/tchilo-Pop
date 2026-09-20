/** Máscara balaclava — cobre a cara, furos olhos/boca transparentes */
(function () {
  "use strict";
  var MASK = {
    id: "mascara",
    label: "Máscara",
    url: "https://litter.catbox.moe/r3mz1a.webp",
    icon: "https://litter.catbox.moe/cpifm1.webp",
    scale: 1.55,
    oy: 0.02
  };
  var img = null;
  var active = false;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;

  function loadImg() {
    if (img && img.complete && img.naturalWidth) return;
    var im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = function () {
      img = im;
    };
    im.onerror = function () {
      var im2 = new Image();
      im2.onload = function () {
        img = im2;
      };
      im2.src = MASK.url;
    };
    im.src = MASK.url;
  }
  loadImg();

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
      console.warn("mask lm", e2);
    }
    return lm;
  }

  function ensureChip() {
    var track = document.getElementById("tscTrack");
    var cam = document.getElementById("tchiloStableCam");
    if (!track || !cam || !cam.classList.contains("on")) return;
    if (track.querySelector('[data-fx="mascara"]')) return;

    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.title = MASK.label;
    b.setAttribute("data-fx", "mascara");
    var ic = document.createElement("img");
    ic.alt = MASK.label;
    ic.draggable = false;
    ic.src = MASK.icon;
    ic.onerror = function () {
      ic.onerror = null;
      ic.src = MASK.url;
    };
    b.appendChild(ic);
    b.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      active = true;
      track.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("active");
      });
      b.classList.add("active");
      ensureLm();
      startLoop();
    };
    track.addEventListener(
      "click",
      function (ev) {
        var t = ev.target && ev.target.closest && ev.target.closest(".chip");
        if (t && t.getAttribute("data-fx") !== "mascara") active = false;
      },
      true
    );
    track.appendChild(b);
  }

  function draw() {
    if (!active) return;
    loadImg();
    if (!img || !img.complete || !img.naturalWidth) return;
    var video = document.getElementById("tscVideo");
    var stage = document.querySelector("#tchiloStableCam .stage");
    if (!video || !stage || video.readyState < 2) return;

    var canvas = document.getElementById("tscFxCanvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "tscFxCanvas";
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:5;pointer-events:none";
      stage.appendChild(canvas);
    }

    var w = video.videoWidth || 640;
    var h = video.videoHeight || 480;
    var maxW = 480;
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

    if (lm) {
      var now = performance.now();
      if (now - lastT > 40) {
        lastT = now;
        try {
          var res = lm.detectForVideo(video, now);
          if (res && res.faceLandmarks && res.faceLandmarks.length) lastLm = res.faceLandmarks;
        } catch (e) {}
      }
    } else {
      ensureLm();
    }

    var faceW = pw * 0.55;
    var faceH = ph * 0.72;
    var cx = pw / 2;
    var cy = ph * 0.48;
    var angle = 0;

    if (lastLm && lastLm[0]) {
      var L = lastLm[0];
      function P(i) {
        return { x: L[i].x * pw, y: L[i].y * ph };
      }
      var le = P(33),
        re = P(263),
        cL = P(234),
        cR = P(454),
        top = P(10),
        chin = P(152);
      faceW = Math.hypot(cL.x - cR.x, cL.y - cR.y) || faceW;
      faceH = Math.hypot(top.x - chin.x, top.y - chin.y) || faceH;
      cx = (top.x + chin.x) / 2;
      cy = (top.y + chin.y) / 2 + faceH * MASK.oy;
      angle = Math.atan2(re.y - le.y, re.x - le.x);
    }

    var root = document.getElementById("tchiloStableCam");
    var mir = root && root.classList.contains("mir");
    var tw = faceW * MASK.scale;
    var th = tw * (img.naturalHeight / Math.max(1, img.naturalWidth));

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
    } catch (e2) {}
    ctx.drawImage(img, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  function loop() {
    if (!loopOn) return;
    requestAnimationFrame(loop);
    var cam = document.getElementById("tchiloStableCam");
    if (!cam || !cam.classList.contains("on")) return;
    ensureChip();
    if (active) draw();
  }

  function startLoop() {
    if (loopOn) return;
    loopOn = true;
    ensureLm();
    loop();
  }

  setInterval(function () {
    var cam = document.getElementById("tchiloStableCam");
    if (cam && cam.classList.contains("on")) {
      ensureChip();
      startLoop();
    }
  }, 400);
  setTimeout(ensureChip, 600);
  setTimeout(ensureChip, 1500);
  setTimeout(ensureChip, 3000);
})();
