/**
 * tchilo-Pop — efeitos: Normal, Óculos prata, Óculos estrela, Cão
 * Resolução overlay ~480–720px; scale relativo à cara
 */
(function () {
  "use strict";

  var FX = [
    {
      id: "oculos_prata",
      label: "Óculos",
      type: "glasses",
      url: "https://iili.io/nTKp9oB.webp",
      icon: "https://iili.io/nTKpHMP.webp",
      scale: 1.35,
      oy: 0,
      blackLenses: false
    },
    {
      id: "oculos_estrela",
      label: "Estrela",
      type: "glasses",
      url: "https://iili.io/nTKmZ8b.webp",
      icon: "https://iili.io/nTKmptV.webp",
      scale: 1.35,
      oy: 0,
      blackLenses: true
    },
    {
      id: "cao",
      label: "Cão",
      type: "dog",
      icon: "https://litter.catbox.moe/h2d4pl.webp",
      ears: "https://litter.catbox.moe/lmxl6a.webp",
      snout: "https://litter.catbox.moe/1zqg66.webp",
      earsScale: 1.15,
      snoutScale: 0.95,
      earsOy: -0.08,
      snoutOy: 0.05
    }
  ];

  var imgs = {};
  var activeId = null;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var ov = null;

  (function () {
    var st = document.getElementById("tchiloFxPanelCSS");
    if (!st) {
      st = document.createElement("style");
      st.id = "tchiloFxPanelCSS";
      document.head.appendChild(st);
    }
    st.textContent =
      "#tchiloStableCam #tscTrack .chip{" +
      "width:56px!important;height:56px!important;min-width:56px!important;" +
      "max-width:56px!important;padding:4px!important;box-sizing:border-box!important;" +
      "overflow:hidden!important;border-radius:50%!important;flex:0 0 56px!important}" +
      "#tchiloStableCam #tscTrack .chip img{" +
      "display:block!important;width:48px!important;height:48px!important;" +
      "object-fit:contain!important;object-position:center!important;" +
      "border-radius:50%!important;background:#222!important;margin:0 auto!important}";
  })();

  function loadOne(key, url) {
    if (!url) return;
    if (imgs[key] && imgs[key].complete && imgs[key].naturalWidth) return;
    var im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = function () {
      imgs[key] = im;
    };
    im.onerror = function () {
      var im2 = new Image();
      im2.onload = function () {
        imgs[key] = im2;
      };
      im2.src = url;
    };
    im.src = url;
  }

  function loadFx(fx) {
    if (fx.type === "dog") {
      loadOne(fx.id + "_ears", fx.ears);
      loadOne(fx.id + "_snout", fx.snout);
      loadOne(fx.id + "_icon", fx.icon);
    } else {
      loadOne(fx.id, fx.url);
      loadOne(fx.id + "_icon", fx.icon);
    }
  }
  FX.forEach(loadFx);

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

  function ourChipsOk(track) {
    if (!track) return false;
    for (var i = 0; i < FX.length; i++) {
      if (!track.querySelector('[data-fx="' + FX[i].id + '"]')) return false;
    }
    return true;
  }

  function buildChips() {
    var track = document.getElementById("tscTrack");
    if (!track) return;
    var cam = document.getElementById("tchiloStableCam");
    if (!cam || !cam.classList.contains("on")) return;
    if (ourChipsOk(track)) return;

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
      loadFx(fx);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (activeId === fx.id ? " active" : "");
      b.title = fx.label;
      b.setAttribute("data-fx", fx.id);
      var ic = document.createElement("img");
      ic.alt = fx.label;
      ic.draggable = false;
      ic.src = fx.icon;
      ic.onerror = function () {
        ic.onerror = null;
        if (fx.url) ic.src = fx.url;
        else if (fx.ears) ic.src = fx.ears;
      };
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
    for (var i = 0; i < FX.length; i++) if (FX[i].id === activeId) return FX[i];
    return null;
  }

  function drawGlasses(ctx, fx, im, le, re, eyeW, angle, mir, pw) {
    var midE = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
    var cx = midE.x;
    var cy = midE.y + eyeW * (fx.oy || 0);
    var tw = eyeW * (fx.scale || 1.35);
    var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));

    ctx.save();
    if (mir) {
      ctx.translate(pw, 0);
      ctx.scale(-1, 1);
    }
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    if (fx.blackLenses) {
      var lensRx = tw * 0.22;
      var lensRy = th * 0.32;
      var gap = tw * 0.28;
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.ellipse(-gap, 0, lensRx, lensRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(gap, 0, lensRx, lensRy, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (e3) {}
    ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  /** Orelhas na testa + focinho no nariz */
  function drawDog(ctx, fx, L, P, faceW, faceH, angle, mir, pw) {
    var ears = imgs[fx.id + "_ears"];
    var snout = imgs[fx.id + "_snout"];
    var top = P(10);
    var nose = P(1);
    var chin = P(152);

    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (e3) {}

    function place(im, cx, cy, scale, oy) {
      if (!im || !im.complete || !im.naturalWidth) return;
      var tw = faceW * scale;
      var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
      ctx.save();
      if (mir) {
        ctx.translate(pw, 0);
        ctx.scale(-1, 1);
      }
      ctx.translate(cx, cy + faceH * (oy || 0));
      ctx.rotate(angle);
      ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
      ctx.restore();
    }

    // orelhas: acima da testa
    place(ears, top.x, top.y, fx.earsScale || 1.15, fx.earsOy || -0.08);
    // focinho: no nariz
    place(snout, nose.x, nose.y, fx.snoutScale || 0.95, fx.snoutOy || 0.05);
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
      cL = P(234),
      cR = P(454),
      top = P(10),
      chin = P(152);
    var eyeW = Math.hypot(le.x - re.x, le.y - re.y) || 40;
    var faceW = Math.hypot(cL.x - cR.x, cL.y - cR.y) || eyeW * 2.2;
    var faceH = Math.hypot(top.x - chin.x, top.y - chin.y) || faceW;
    var angle = Math.atan2(re.y - le.y, re.x - le.x);
    var root = document.getElementById("tchiloStableCam");
    var mir = root && root.classList.contains("mir");

    if (fx.type === "dog") {
      loadFx(fx);
      drawDog(ctx, fx, L, P, faceW, faceH, angle, mir, pw);
    } else {
      var im = imgs[fx.id];
      if (!im || !im.complete || !im.naturalWidth) {
        loadFx(fx);
        return;
      }
      drawGlasses(ctx, fx, im, le, re, eyeW, angle, mir, pw);
    }
  }

  function loop() {
    if (!loopOn) return;
    requestAnimationFrame(loop);
    var root = document.getElementById("tchiloStableCam");
    if (!root || !root.classList.contains("on")) return;
    buildChips();
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
        if (mir) ctx.setTransform(1, 0, 0, 1, 0, 0);

        var fx = getFx();
        if (fx && lastLm) {
          var L = lastLm[0];
          function P(i) {
            return { x: L[i].x * w, y: L[i].y * h };
          }
          var le = P(33),
            re = P(263),
            cL = P(234),
            cR = P(454),
            top = P(10),
            chin = P(152);
          var eyeW = Math.hypot(le.x - re.x, le.y - re.y) || 40;
          var faceW = Math.hypot(cL.x - cR.x, cL.y - cR.y) || eyeW * 2.2;
          var faceH = Math.hypot(top.x - chin.x, top.y - chin.y) || faceW;
          var angle = Math.atan2(re.y - le.y, re.x - le.x);
          if (fx.type === "dog") {
            drawDog(ctx, fx, L, P, faceW, faceH, angle, mir, w);
          } else {
            var im = imgs[fx.id];
            if (im) drawGlasses(ctx, fx, im, le, re, eyeW, angle, mir, w);
          }
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

  setInterval(tick, 250);
  tick();
  setTimeout(tick, 100);
  setTimeout(tick, 500);
  setTimeout(tick, 1200);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  }
})();
