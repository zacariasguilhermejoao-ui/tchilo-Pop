/**
 * Efeito Estrela — óculos de estrela neon rosa + ícone no picker
 */
(function () {
  "use strict";

  var active = false;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var ov = null;
  var iconUrl = null;

  function makeIcon() {
    if (iconUrl) return iconUrl;
    var c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, 128, 128);
    drawStars(ctx, 64, 64, 52, 0);
    iconUrl = c.toDataURL("image/png");
    return iconUrl;
  }

  /** Desenha par de óculos estrela neon rosa */
  function drawStars(ctx, cx, cy, scale, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle || 0);
    var s = scale / 52;

    function starPath(x, y, outer, inner) {
      ctx.beginPath();
      for (var i = 0; i < 10; i++) {
        var r = i % 2 === 0 ? outer : inner;
        var a = (Math.PI / 2) * 3 + (i * Math.PI) / 5;
        var px = x + Math.cos(a) * r;
        var py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    // haste esquerda / direita
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(-48 * s, 0);
    ctx.lineTo(-38 * s, 0);
    ctx.moveTo(38 * s, 0);
    ctx.lineTo(48 * s, 0);
    ctx.stroke();

    // ponte
    ctx.strokeStyle = "#ff2d8a";
    ctx.lineWidth = 4 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-10 * s, -2 * s);
    ctx.quadraticCurveTo(0, 8 * s, 10 * s, -2 * s);
    ctx.stroke();

    // estrela esquerda
    ctx.save();
    ctx.shadowColor = "#ff4da6";
    ctx.shadowBlur = 12 * s;
    starPath(-24 * s, 0, 18 * s, 8 * s);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.strokeStyle = "#ff2d8a";
    ctx.lineWidth = 4.5 * s;
    ctx.stroke();
    // brilho
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,180,220,0.9)";
    ctx.lineWidth = 1.5 * s;
    starPath(-24 * s, 0, 16 * s, 7 * s);
    ctx.stroke();
    ctx.restore();

    // estrela direita
    ctx.save();
    ctx.shadowColor = "#ff4da6";
    ctx.shadowBlur = 12 * s;
    starPath(24 * s, 0, 18 * s, 8 * s);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.strokeStyle = "#ff2d8a";
    ctx.lineWidth = 4.5 * s;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,180,220,0.9)";
    ctx.lineWidth = 1.5 * s;
    starPath(24 * s, 0, 16 * s, 7 * s);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function ensureOverlayCanvas() {
    var stage = document.querySelector("#tchiloStableCam .stage");
    if (!stage) return null;
    ov = document.getElementById("tscEstrelaCanvas");
    if (!ov) {
      ov = document.createElement("canvas");
      ov.id = "tscEstrelaCanvas";
      ov.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:4;pointer-events:none";
      stage.appendChild(ov);
    }
    return ov;
  }

  function addChip() {
    var track = document.getElementById("tscTrack");
    if (!track || track.querySelector("[data-estrela]")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("data-estrela", "1");
    b.title = "Estrela";
    var ic = document.createElement("img");
    ic.src = makeIcon();
    ic.alt = "Estrela";
    ic.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%";
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
      startLoop();
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
      re = P(263);
    var eyeW = Math.hypot(le.x - re.x, le.y - re.y) || 40;
    var mid = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
    var angle = Math.atan2(re.y - le.y, re.x - le.x);

    var root = document.getElementById("tchiloStableCam");
    var mir = root && root.classList.contains("mir");
    ctx.save();
    if (mir) {
      ctx.translate(pw, 0);
      ctx.scale(-1, 1);
    }
    drawStars(ctx, mid.x, mid.y, eyeW * 1.15, angle);
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

  function watch() {
    addChip();
    ensureOverlayCanvas();
  }

  setInterval(function () {
    if (document.getElementById("tscTrack")) addChip();
    if (
      document.getElementById("tchiloStableCam") &&
      document.getElementById("tchiloStableCam").classList.contains("on")
    ) {
      startLoop();
    }
  }, 700);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
  else watch();
})();
