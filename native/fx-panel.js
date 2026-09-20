/**
 * tchilo-Pop — efeitos na cara (robusto)
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
      oy: 0
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
      id: "olhos",
      label: "Olhos",
      type: "glasses",
      url: "https://litter.catbox.moe/l8ldun.webp",
      icon: "https://litter.catbox.moe/vpmz1v.webp",
      scale: 1.75,
      oy: 0
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
    },
    {
      id: "gato",
      label: "Gato",
      type: "face",
      url: "https://litter.catbox.moe/nr4ci2.webp",
      icon: "https://litter.catbox.moe/8kuhk9.webp",
      scale: 1.25,
      oy: -0.05
    },
    {
      id: "mascara",
      label: "Máscara",
      type: "face",
      url: "https://litter.catbox.moe/r3mz1a.webp",
      icon: "https://litter.catbox.moe/cpifm1.webp",
      scale: 1.55,
      oy: 0.02
    },
    {
      id: "beijos",
      label: "Beijos",
      type: "rain",
      icon: "https://litter.catbox.moe/5s2564.webp",
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
  var activeId = null;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var ov = null;
  var rainParticles = [];
  var builtOnce = false;

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
    } else if (fx.type === "rain") {
      (fx.sprites || []).forEach(function (u, i) {
        loadOne(fx.id + "_s" + i, u);
      });
    } else {
      loadOne(fx.id, fx.url);
    }
    if (fx.icon) loadOne(fx.id + "_icon", fx.icon);
  }
  FX.forEach(loadFx);

  function ensureOverlay() {
    var stage = document.querySelector("#tchiloStableCam .stage");
    if (!stage) return null;
    ov = document.getElementById("tscFxCanvas");
    if (!ov) {
      ov = document.createElement("canvas");
      ov.id = "tscFxCanvas";
      stage.appendChild(ov);
    }
    ov.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:8;pointer-events:none;display:block";
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

  function selectFx(id) {
    activeId = id;
    if (id === "beijos") rainParticles = [];
    // forçar câmara antiga a não distorcer
    try {
      var root = document.getElementById("tchiloStableCam");
      if (root) root.setAttribute("data-fx", id || "none");
    } catch (e) {}
  }

  function buildChips() {
    var track = document.getElementById("tscTrack");
    if (!track) return;
    var cam = document.getElementById("tchiloStableCam");
    if (!cam || !cam.classList.contains("on")) return;
    if (ourChipsOk(track) && builtOnce) return;

    track.innerHTML = "";
    builtOnce = true;

    var n = document.createElement("button");
    n.type = "button";
    n.className = "chip" + (activeId ? "" : " active");
    n.textContent = "Normal";
    n.setAttribute("data-fx", "none");
    n.onclick = function () {
      selectFx(null);
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
      ic.src = fx.icon || fx.url || (fx.sprites && fx.sprites[0]);
      ic.onerror = function () {
        ic.onerror = null;
        if (fx.url) ic.src = fx.url;
        else if (fx.sprites) ic.src = fx.sprites[0];
      };
      b.appendChild(ic);
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        selectFx(fx.id);
        track.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("active");
        });
        b.classList.add("active");
        // limpar canvas de warp antigo
        try {
          var main = document.getElementById("tscCanvas");
          if (main) {
            var c2 = main.getContext("2d");
            c2.setTransform(1, 0, 0, 1, 0, 0);
            c2.clearRect(0, 0, main.width, main.height);
          }
        } catch (e2) {}
        ensureLm();
        startLoop();
      };
      track.appendChild(b);
    });
  }

  // impedir a câmara antiga de reescrever os chips
  function guardChips() {
    var track = document.getElementById("tscTrack");
    if (!track || track.__fxGuard) return;
    track.__fxGuard = true;
    var obs = new MutationObserver(function () {
      if (!ourChipsOk(track)) {
        builtOnce = false;
        buildChips();
      }
    });
    try {
      obs.observe(track, { childList: true });
    } catch (e) {}
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
      console.warn("[fx] MediaPipe", e2);
    }
    return lm;
  }

  function getFx() {
    for (var i = 0; i < FX.length; i++) if (FX[i].id === activeId) return FX[i];
    return null;
  }

  function faceGeom(pw, ph) {
    // fallback centrado se não houver landmarks
    var g = {
      le: { x: pw * 0.35, y: ph * 0.42 },
      re: { x: pw * 0.65, y: ph * 0.42 },
      nose: { x: pw * 0.5, y: ph * 0.52 },
      top: { x: pw * 0.5, y: ph * 0.22 },
      chin: { x: pw * 0.5, y: ph * 0.78 },
      eyeW: pw * 0.3,
      faceW: pw * 0.55,
      faceH: ph * 0.55,
      angle: 0
    };
    if (lastLm && lastLm[0]) {
      var L = lastLm[0];
      function P(i) {
        return { x: L[i].x * pw, y: L[i].y * ph };
      }
      g.le = P(33);
      g.re = P(263);
      g.nose = P(1);
      g.top = P(10);
      g.chin = P(152);
      var cL = P(234),
        cR = P(454);
      g.eyeW = Math.hypot(g.le.x - g.re.x, g.le.y - g.re.y) || g.eyeW;
      g.faceW = Math.hypot(cL.x - cR.x, cL.y - cR.y) || g.faceW;
      g.faceH = Math.hypot(g.top.x - g.chin.x, g.top.y - g.chin.y) || g.faceH;
      g.angle = Math.atan2(g.re.y - g.le.y, g.re.x - g.le.x);
    }
    return g;
  }

  function drawGlasses(ctx, fx, im, g, mir, pw) {
    if (!im || !im.complete || !im.naturalWidth) return;
    var cx = (g.le.x + g.re.x) / 2;
    var cy = (g.le.y + g.re.y) / 2 + g.eyeW * (fx.oy || 0);
    var tw = g.eyeW * (fx.scale || 1.35);
    var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));

    ctx.save();
    if (mir) {
      ctx.translate(pw, 0);
      ctx.scale(-1, 1);
    }
    ctx.translate(cx, cy);
    ctx.rotate(g.angle);
    if (fx.blackLenses) {
      var lensRx = tw * 0.22,
        lensRy = th * 0.32,
        gap = tw * 0.28;
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
    } catch (e) {}
    ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  function drawDog(ctx, fx, g, mir, pw) {
    var ears = imgs[fx.id + "_ears"];
    var snout = imgs[fx.id + "_snout"];
    ctx.imageSmoothingEnabled = true;
    function place(im, cx, cy, scale, oy) {
      if (!im || !im.complete || !im.naturalWidth) return;
      var tw = g.faceW * scale;
      var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
      ctx.save();
      if (mir) {
        ctx.translate(pw, 0);
        ctx.scale(-1, 1);
      }
      ctx.translate(cx, cy + g.faceH * (oy || 0));
      ctx.rotate(g.angle);
      ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
      ctx.restore();
    }
    place(ears, g.top.x, g.top.y, fx.earsScale || 1.15, fx.earsOy || -0.08);
    place(snout, g.nose.x, g.nose.y, fx.snoutScale || 0.95, fx.snoutOy || 0.05);
  }

  function drawFace(ctx, fx, im, g, mir, pw) {
    if (!im || !im.complete || !im.naturalWidth) return;
    var cx = (g.top.x + g.chin.x) / 2;
    var cy = (g.top.y + g.chin.y) / 2 + g.faceH * (fx.oy || 0);
    var tw = g.faceW * (fx.scale || 1.25);
    var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
    ctx.save();
    if (mir) {
      ctx.translate(pw, 0);
      ctx.scale(-1, 1);
    }
    ctx.translate(cx, cy);
    ctx.rotate(g.angle);
    ctx.imageSmoothingEnabled = true;
    try {
      ctx.imageSmoothingQuality = "high";
    } catch (e) {}
    ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  function getRainSprites(fx) {
    var list = [];
    (fx.sprites || []).forEach(function (u, i) {
      var im = imgs[fx.id + "_s" + i];
      if (im && im.complete && im.naturalWidth) list.push(im);
    });
    return list;
  }

  function spawnParticle(pw, ph, sprites) {
    if (!sprites.length) return null;
    var size = 28 + Math.random() * 36;
    return {
      x: Math.random() * pw,
      y: -40 - Math.random() * 80,
      vy: 1.2 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.8,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.04,
      size: size,
      img: sprites[Math.floor(Math.random() * sprites.length)],
      alpha: 0.85 + Math.random() * 0.15
    };
  }

  function drawRain(ctx, fx, pw, ph) {
    var sprites = getRainSprites(fx);
    if (!sprites.length) {
      loadFx(fx);
      return;
    }
    if (rainParticles.length < 22) {
      for (var s = 0; s < 4; s++) {
        var np = spawnParticle(pw, ph, sprites);
        if (np) {
          if (rainParticles.length < 8) np.y = Math.random() * ph;
          rainParticles.push(np);
        }
      }
    }
    ctx.imageSmoothingEnabled = true;
    var next = [];
    for (var i = 0; i < rainParticles.length; i++) {
      var p = rainParticles[i];
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vrot;
      if (p.y > ph + 50) {
        var r = spawnParticle(pw, ph, sprites);
        if (r) next.push(r);
        continue;
      }
      if (!p.img || !p.img.complete) continue;
      var th = p.size * (p.img.naturalHeight / Math.max(1, p.img.naturalWidth));
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(p.img, -p.size / 2, -th / 2, p.size, th);
      ctx.restore();
      next.push(p);
    }
    rainParticles = next;
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

    if (fx.type === "rain") {
      drawRain(ctx, fx, pw, ph);
      return;
    }

    // detetar face
    if (lm) {
      var now = performance.now();
      if (now - lastT > 33) {
        lastT = now;
        try {
          var res = lm.detectForVideo(video, now);
          if (res && res.faceLandmarks && res.faceLandmarks.length) {
            lastLm = res.faceLandmarks;
            try {
              window.__tchiloLastLm = lastLm;
            } catch (e3) {}
          }
        } catch (e) {}
      }
    } else {
      ensureLm();
    }

    var root = document.getElementById("tchiloStableCam");
    var mir = root && root.classList.contains("mir");
    var g = faceGeom(pw, ph);

    if (fx.type === "dog") {
      loadFx(fx);
      drawDog(ctx, fx, g, mir, pw);
    } else if (fx.type === "face") {
      var imF = imgs[fx.id];
      if (!imF || !imF.complete) {
        loadFx(fx);
        return;
      }
      drawFace(ctx, fx, imF, g, mir, pw);
    } else {
      var im = imgs[fx.id];
      if (!im || !im.complete) {
        loadFx(fx);
        return;
      }
      drawGlasses(ctx, fx, im, g, mir, pw);
    }
  }

  function loop() {
    if (!loopOn) return;
    requestAnimationFrame(loop);
    var root = document.getElementById("tchiloStableCam");
    if (!root || !root.classList.contains("on")) return;
    buildChips();
    guardChips();
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
    if (!btn || btn.__fxSnap2) return;
    btn.__fxSnap2 = true;
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
        if (fx) {
          var g = faceGeom(w, h);
          if (fx.type === "rain") drawRain(ctx, fx, w, h);
          else if (fx.type === "dog") drawDog(ctx, fx, g, mir, w);
          else if (fx.type === "face") {
            var imF = imgs[fx.id];
            if (imF) drawFace(ctx, fx, imF, g, mir, w);
          } else {
            var im = imgs[fx.id];
            if (im) drawGlasses(ctx, fx, im, g, mir, w);
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
      guardChips();
      ensureOverlay();
      hookSnap();
      startLoop();
    }
  }

  setInterval(tick, 300);
  tick();
  setTimeout(tick, 200);
  setTimeout(tick, 800);
  setTimeout(tick, 2000);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  }
})();
