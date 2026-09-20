/**
 * tchilo-Pop — efeitos corretos na câmara TikTok (#tchiloCam)
 * Ícones = fotos reais | âncoras na cara | scales corretos
 */
(function () {
  "use strict";

  var FX = [
    { id: "none", label: "Normal" },
    {
      id: "oculos_prata",
      label: "Óculos",
      url: "https://iili.io/nTKp9oB.webp",
      icon: "https://iili.io/nTKpHMP.webp",
      anchor: "eyes",
      scale: 1.45
    },
    {
      id: "oculos_estrela",
      label: "Estrela",
      url: "https://iili.io/nTKmZ8b.webp",
      icon: "https://iili.io/nTKmptV.webp",
      anchor: "eyes",
      scale: 1.45,
      blackLenses: true
    },
    {
      id: "olhos",
      label: "Olhos",
      url: "https://litter.catbox.moe/l8ldun.webp",
      icon: "https://litter.catbox.moe/vpmz1v.webp",
      anchor: "eyes",
      scale: 1.7
    },
    {
      id: "cao",
      label: "Cão",
      icon: "https://litter.catbox.moe/h2d4pl.webp",
      ears: "https://litter.catbox.moe/lmxl6a.webp",
      snout: "https://litter.catbox.moe/1zqg66.webp",
      anchor: "dog",
      earsScale: 1.2,
      snoutScale: 1.0,
      earsOy: -0.1,
      snoutOy: 0.02
    },
    {
      id: "gato",
      label: "Gato",
      url: "https://litter.catbox.moe/nr4ci2.webp",
      icon: "https://litter.catbox.moe/8kuhk9.webp",
      anchor: "face",
      scale: 1.35,
      oy: -0.02
    },
    {
      id: "mascara",
      label: "Máscara",
      url: "https://litter.catbox.moe/r3mz1a.webp",
      icon: "https://litter.catbox.moe/cpifm1.webp",
      anchor: "face",
      scale: 1.5,
      oy: 0.02
    },
    {
      id: "beijos",
      label: "Beijos",
      icon: "https://litter.catbox.moe/5s2564.webp",
      anchor: "rain",
      sprites: [
        "https://litter.catbox.moe/xdrm5k.webp",
        "https://litter.catbox.moe/szy6fa.webp",
        "https://litter.catbox.moe/8udqmz.webp",
        "https://litter.catbox.moe/tpkhms.webp",
        "https://litter.catbox.moe/igz5ba.webp"
      ]
    }
  ];

  var imgs = {};
  var fxIndex = 0;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var rainParticles = [];
  var patched = false;

  function loadUrl(key, url) {
    if (!key || !url) return;
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

  function preload() {
    FX.forEach(function (fx) {
      if (fx.url) loadUrl(fx.id, fx.url);
      if (fx.icon) loadUrl(fx.id + "_icon", fx.icon);
      if (fx.ears) loadUrl(fx.id + "_ears", fx.ears);
      if (fx.snout) loadUrl(fx.id + "_snout", fx.snout);
      if (fx.sprites)
        fx.sprites.forEach(function (u, i) {
          loadUrl(fx.id + "_s" + i, u);
        });
    });
  }
  preload();

  function getImg(key) {
    return imgs[key] && imgs[key].complete && imgs[key].naturalWidth ? imgs[key] : null;
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
      console.warn("[fx-live] lm", e2);
    }
    return lm;
  }

  function buildChips() {
    var track = document.getElementById("tchiloCamFxTrack");
    if (!track) return;
    // marcar para não deixar o script antigo reescrever sem os nossos data-fx
    if (track.getAttribute("data-live-fx") === "1" && track.querySelector('[data-fx="mascara"]')) return;

    track.innerHTML = "";
    track.setAttribute("data-live-fx", "1");
    preload();

    FX.forEach(function (fx, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (i === fxIndex ? " active" : "");
      b.title = fx.label || "";
      b.setAttribute("data-fx", fx.id || "none");
      if (fx.id === "none") {
        b.textContent = "Normal";
      } else {
        var ic = document.createElement("img");
        ic.alt = fx.label || "";
        ic.draggable = false;
        ic.style.cssText =
          "width:100%;height:100%;object-fit:contain;object-position:center;display:block;background:#1a1a1a;";
        ic.src = fx.icon || fx.url || (fx.sprites && fx.sprites[0]) || "";
        ic.onerror = function () {
          ic.onerror = null;
          if (fx.url) ic.src = fx.url;
          else if (fx.ears) ic.src = fx.ears;
        };
        b.appendChild(ic);
      }
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        fxIndex = i;
        if (fx.anchor === "rain") rainParticles = [];
        track.querySelectorAll(".chip").forEach(function (c, j) {
          c.classList.toggle("active", j === i);
        });
        ensureLm();
        startLoop();
      };
      track.appendChild(b);
    });
  }

  function place(ctx, im, cx, cy, tw, angle, oy) {
    if (!im) return;
    var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
    ctx.save();
    ctx.translate(cx, cy + (oy || 0));
    ctx.rotate(angle);
    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (e) {}
    ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  function drawRain(ctx, fx, w, h) {
    var sprites = [];
    (fx.sprites || []).forEach(function (u, i) {
      var im = getImg(fx.id + "_s" + i);
      if (im) sprites.push(im);
      else loadUrl(fx.id + "_s" + i, u);
    });
    if (!sprites.length) return;
    while (rainParticles.length < 22) {
      rainParticles.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.4 - 50,
        vy: 1.4 + Math.random() * 2.6,
        vx: (Math.random() - 0.5) * 0.9,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.05,
        size: 28 + Math.random() * 40,
        img: sprites[Math.floor(Math.random() * sprites.length)],
        alpha: 0.85 + Math.random() * 0.15
      });
    }
    var next = [];
    for (var i = 0; i < rainParticles.length; i++) {
      var p = rainParticles[i];
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vrot;
      if (p.y > h + 50) {
        p.y = -40;
        p.x = Math.random() * w;
        p.img = sprites[Math.floor(Math.random() * sprites.length)];
      }
      if (p.img && p.img.complete) {
        var th = p.size * (p.img.naturalHeight / Math.max(1, p.img.naturalWidth));
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(p.img, -p.size / 2, -th / 2, p.size, th);
        ctx.restore();
      }
      next.push(p);
    }
    rainParticles = next;
  }

  function draw() {
    var root = document.getElementById("tchiloCam");
    if (!root || !root.classList.contains("open")) return;
    var video = document.getElementById("tchiloCamVideo");
    var canvas = document.getElementById("tchiloCamCanvas");
    if (!video || !canvas || video.readyState < 2) return;

    var w = video.videoWidth || 640;
    var h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var fx = FX[fxIndex];
    if (!fx || fx.id === "none") return;

    var facingEnv = root.classList.contains("cam-env");
    ctx.save();
    if (!facingEnv) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    if (fx.anchor === "rain") {
      drawRain(ctx, fx, w, h);
      ctx.restore();
      return;
    }

    if (lm) {
      var now = performance.now();
      if (now - lastT > 30) {
        lastT = now;
        try {
          var res = lm.detectForVideo(video, now);
          if (res && res.faceLandmarks && res.faceLandmarks.length) lastLm = res.faceLandmarks;
        } catch (e) {}
      }
    } else {
      ensureLm();
    }

    if (!lastLm || !lastLm[0]) {
      ctx.restore();
      return;
    }

    var L = lastLm[0];
    function P(i) {
      return { x: L[i].x * w, y: L[i].y * h };
    }
    var left = P(33),
      right = P(263),
      top = P(10),
      chin = P(152),
      cheekL = P(234),
      cheekR = P(454),
      nose = P(1);
    var eyeW = Math.hypot(left.x - right.x, left.y - right.y) || 1;
    var faceW = Math.hypot(cheekL.x - cheekR.x, cheekL.y - cheekR.y) || eyeW * 2.1;
    var faceH = Math.hypot(top.x - chin.x, top.y - chin.y) || faceW * 1.25;
    var angle = Math.atan2(right.y - left.y, right.x - left.x);
    var midEyes = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
    var faceCenter = { x: (cheekL.x + cheekR.x) / 2, y: (top.y + chin.y) / 2 };

    if (fx.anchor === "dog") {
      var ears = getImg(fx.id + "_ears");
      var snout = getImg(fx.id + "_snout");
      if (!ears) loadUrl(fx.id + "_ears", fx.ears);
      if (!snout) loadUrl(fx.id + "_snout", fx.snout);
      place(ctx, ears, top.x, top.y, faceW * (fx.earsScale || 1.2), angle, faceH * (fx.earsOy || -0.1));
      place(ctx, snout, nose.x, nose.y, faceW * (fx.snoutScale || 1), angle, faceH * (fx.snoutOy || 0.02));
      ctx.restore();
      return;
    }

    var im = getImg(fx.id);
    if (!im) {
      if (fx.url) loadUrl(fx.id, fx.url);
      ctx.restore();
      return;
    }

    var cx = midEyes.x,
      cy = midEyes.y,
      tw = eyeW * (fx.scale || 1.45);
    if (fx.anchor === "face") {
      cx = faceCenter.x;
      cy = faceCenter.y + faceH * (fx.oy || 0);
      tw = faceW * (fx.scale || 1.4);
    } else {
      cy = midEyes.y + eyeW * (fx.oy || 0);
      tw = eyeW * (fx.scale || 1.45);
    }

    if (fx.blackLenses) {
      var th0 = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      var gap = tw * 0.28,
        rx = tw * 0.22,
        ry = th0 * 0.32;
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.ellipse(-gap, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(gap, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    place(ctx, im, cx, cy, tw, angle, 0);
    ctx.restore();
  }

  function loop() {
    if (!loopOn) return;
    requestAnimationFrame(loop);
    var root = document.getElementById("tchiloCam");
    if (!root || !root.classList.contains("open")) return;
    buildChips();
    draw();
  }

  function startLoop() {
    if (loopOn) return;
    loopOn = true;
    ensureLm();
    loop();
  }

  function guardTrack() {
    var track = document.getElementById("tchiloCamFxTrack");
    if (!track || track.__liveGuard) return;
    track.__liveGuard = true;
    try {
      new MutationObserver(function () {
        if (!track.querySelector('[data-fx="mascara"]')) {
          track.removeAttribute("data-live-fx");
          buildChips();
        }
      }).observe(track, { childList: true });
    } catch (e) {}
  }

  function tick() {
    var root = document.getElementById("tchiloCam");
    if (root && root.classList.contains("open")) {
      buildChips();
      guardTrack();
      startLoop();
    }
  }

  setInterval(tick, 400);
  setTimeout(tick, 500);
  setTimeout(tick, 1500);
  setTimeout(tick, 3000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick);
  else tick();
})();
