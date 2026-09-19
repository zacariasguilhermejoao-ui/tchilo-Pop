/**
 * Estrela — PNG do utilizador (óculos estrela neon) no ícone e na cara
 */
(function () {
  "use strict";

  var FILE = "oculos_estrela_neon.png";
  var active = false;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var ov = null;
  var img = null;

  function asset() {
    return (window.TchiloFxPngAssets && window.TchiloFxPngAssets[FILE]) || null;
  }

  function ensureImg(cb) {
    var src = asset();
    if (!src) {
      setTimeout(function () {
        ensureImg(cb);
      }, 300);
      return;
    }
    if (img && img.dataset.src === src && img.complete) {
      if (cb) cb();
      return;
    }
    img = new Image();
    img.crossOrigin = "anonymous";
    img.dataset.src = src;
    img.onload = function () {
      if (cb) cb();
    };
    img.onerror = function () {
      console.warn("Estrela PNG falhou");
    };
    img.src = src;
  }

  function ensureOverlayCanvas() {
    var stage = document.querySelector("#tchiloStableCam .stage");
    if (!stage) return null;
    ov = document.getElementById("tscEstrelaCanvas");
    if (!ov) {
      ov = document.createElement("canvas");
      ov.id = "tscEstrelaCanvas";
      ov.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:5;pointer-events:none";
      stage.appendChild(ov);
    }
    return ov;
  }

  function addChip() {
    var track = document.getElementById("tscTrack");
    if (!track) return;
    if (track.querySelector("[data-estrela]")) return;
    var src = asset();
    if (!src) return;

    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("data-estrela", "1");
    b.title = "Estrela";
    var ic = document.createElement("img");
    ic.src = src;
    ic.alt = "Estrela";
    ic.style.cssText =
      "width:100%;height:100%;object-fit:cover;border-radius:50%;background:#111";
    b.appendChild(ic);

    b.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      active = true;
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
      ensureImg(function () {
        startLoop();
      });
    };

    track.addEventListener(
      "click",
      function (ev) {
        var t = ev.target && ev.target.closest ? ev.target.closest(".chip") : null;
        if (t && !t.getAttribute("data-estrela")) {
          active = false;
          clearOv();
        }
      },
      true
    );
    track.appendChild(b);
  }

  function clearOv() {
    if (!ov) return;
    var ctx = ov.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ov.width || 1, ov.height || 1);
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
      console.warn("estrela lm", e2);
    }
    return lm;
  }

  function draw() {
    if (!active) return;
    var video = document.getElementById("tscVideo");
    var canvas = ensureOverlayCanvas();
    if (!video || !canvas || video.readyState < 2) return;
    if (!img || !img.complete || !img.naturalWidth) {
      ensureImg();
      return;
    }

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
    var le = P(33);
    var re = P(263);
    var eyeW = Math.hypot(le.x - re.x, le.y - re.y) || 40;
    var mid = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
    var angle = Math.atan2(re.y - le.y, re.x - le.x);
    var tw = eyeW * 2.1;
    var th = tw * (img.naturalHeight / Math.max(1, img.naturalWidth));

    var root = document.getElementById("tchiloStableCam");
    var mir = root && root.classList.contains("mir");
    ctx.save();
    if (mir) {
      ctx.translate(pw, 0);
      ctx.scale(-1, 1);
    }
    ctx.translate(mid.x, mid.y);
    ctx.rotate(angle);
    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (e3) {}
    ctx.drawImage(img, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  function loop() {
    if (!loopOn) return;
    requestAnimationFrame(loop);
    var root = document.getElementById("tchiloStableCam");
    if (!root || !root.classList.contains("on")) return;
    if (active) draw();
    else clearOv();
  }

  function startLoop() {
    if (loopOn) return;
    loopOn = true;
    ensureLm();
    loop();
  }

  function tick() {
    addChip();
    ensureOverlayCanvas();
    if (
      document.getElementById("tchiloStableCam") &&
      document.getElementById("tchiloStableCam").classList.contains("on")
    ) {
      startLoop();
    }
  }

  ensureImg(function () {
    tick();
  });
  setInterval(tick, 500);
})();
