/** Adiciona efeito Máscara (balaclava) ao painel de efeitos */
(function () {
  "use strict";
  var MASK = {
    id: "mascara",
    label: "Máscara",
    type: "face",
    url: "https://litter.catbox.moe/r3mz1a.webp",
    icon: "https://litter.catbox.moe/cpifm1.webp",
    scale: 1.55,
    oy: 0.02
  };
  var img = null;
  var active = false;

  function loadImg() {
    if (img && img.complete && img.naturalWidth) return;
    var im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = function () {
      img = im;
    };
    im.src = MASK.url;
  }
  loadImg();

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
      // desativar outros efeitos do painel principal
      try {
        var ev = new CustomEvent("tchiloFxSelect", { detail: { id: "mascara" } });
        document.dispatchEvent(ev);
      } catch (err) {}
      startDraw();
    };
    // quando outro chip é clicado, desativar
    track.addEventListener(
      "click",
      function (ev) {
        var t = ev.target.closest(".chip");
        if (t && t.getAttribute("data-fx") !== "mascara") active = false;
      },
      true
    );
    track.appendChild(b);
  }

  var loopOn = false;
  function startDraw() {
    if (loopOn) return;
    loopOn = true;
    function frame() {
      requestAnimationFrame(frame);
      var cam = document.getElementById("tchiloStableCam");
      if (!cam || !cam.classList.contains("on")) return;
      ensureChip();
      if (!active) return;
      draw();
    }
    frame();
  }

  function draw() {
    loadImg();
    if (!img || !img.complete || !img.naturalWidth) return;
    var video = document.getElementById("tscVideo");
    var canvas = document.getElementById("tscFxCanvas");
    if (!video || !canvas || video.readyState < 2) return;

    // precisa de landmarks do painel principal — se lastLm não existir, usa centro
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
    // não limpar tudo se outros efeitos — limpar e desenhar máscara
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pw, ph);

    // tentar usar MediaPipe via deteção rápida se disponível no window
    var faceW = pw * 0.55;
    var faceH = ph * 0.7;
    var cx = pw / 2;
    var cy = ph * 0.48;
    var angle = 0;

    // se o painel principal guardou landmarks em window
    try {
      if (window.__tchiloLastLm && window.__tchiloLastLm[0]) {
        var L = window.__tchiloLastLm[0];
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
    } catch (e) {}

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

  setInterval(function () {
    var cam = document.getElementById("tchiloStableCam");
    if (cam && cam.classList.contains("on")) {
      ensureChip();
      startDraw();
    }
  }, 400);
  setTimeout(ensureChip, 800);
  setTimeout(ensureChip, 2000);
})();
