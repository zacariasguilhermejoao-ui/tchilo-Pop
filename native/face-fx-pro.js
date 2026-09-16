/**
 * tchilo-Pop — lentes pro + animação inverter câmara
 * Detecção própria MediaPipe para lábios/corações/cabelo/chapéu
 */
(function () {
  'use strict';

  var OUTER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
  var INNER_LIP = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
  var proIndex = 0;
  var t0 = Date.now();
  var landmarker = null;
  var lastFace = null;
  var lastDetect = 0;

  var PRO_FX = [
    { id: 'none', label: 'Base' },
    { id: 'pinklips', label: 'Lábios rosa' },
    { id: 'redlips', label: 'Lábios red' },
    { id: 'gloss', label: 'Gloss' },
    { id: 'hearts', label: 'Corações' },
    { id: 'heartface', label: 'Coração face' },
    { id: 'blushpro', label: 'Blush pro' },
    { id: 'hairtint', label: 'Cabelo' },
    { id: 'hatpro', label: 'Chapéu pro' },
    { id: 'beanie', label: 'Gorro' },
    { id: 'sparkle', label: 'Brilho' }
  ];

  function injectCSS() {
    if (document.getElementById('tchiloFxProCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFxProCSS';
    st.textContent =
      '#tchiloFxFlip{transition:transform .35s cubic-bezier(.4,0,.2,1)!important;}' +
      '#tchiloFxFlip.spin{transform:rotate(180deg)!important;}' +
      '#tchiloFxStage.fx-flip-anim{transition:transform .32s ease;transform:rotateY(90deg) scale(.96);}' +
      '#tchiloFxProBar{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:6px 0;}' +
      '#tchiloFxProBar .fx-chip{flex-shrink:0;border:2px solid rgba(255,255,255,.4);background:rgba(0,0,0,.45);color:#fff;border-radius:999px;padding:8px 14px;font:800 12px Inter,system-ui,sans-serif;cursor:pointer;}' +
      '#tchiloFxProBar .fx-chip.active{border-color:#ff6bb5;background:rgba(255,107,181,.32);}';
    document.head.appendChild(st);
  }

  function lm(L, idx, w, h) {
    var p = L[idx];
    return { x: p.x * w, y: p.y * h };
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function drawLips(ctx, L, w, h, color, gloss) {
    ctx.save();
    ctx.beginPath();
    OUTER_LIP.forEach(function (idx, i) {
      var p = lm(L, idx, w, h);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.78;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    INNER_LIP.forEach(function (idx, i) {
      var p = lm(L, idx, w, h);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    if (gloss) {
      var top = lm(L, 13, w, h);
      var left = lm(L, 78, w, h);
      var right = lm(L, 308, w, h);
      var g = ctx.createLinearGradient(left.x, top.y - 4, right.x, top.y + 8);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse((left.x + right.x) / 2, top.y, dist(left, right) * 0.3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function heart(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-5, -2, -12, 2, 0, 12);
    ctx.bezierCurveTo(12, 2, 5, -2, 0, 3);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawPro(ctx, face, w, h) {
    var id = PRO_FX[proIndex].id;
    if (id === 'none' || !face) return;
    var L = face;
    var left = lm(L, 33, w, h);
    var right = lm(L, 263, w, h);
    var faceW = dist(left, right);
    var t = (Date.now() - t0) / 1000;

    if (id === 'pinklips') drawLips(ctx, L, w, h, 'rgba(255,80,140,0.92)', true);
    else if (id === 'redlips') drawLips(ctx, L, w, h, 'rgba(200,20,50,0.92)', true);
    else if (id === 'gloss') drawLips(ctx, L, w, h, 'rgba(255,120,160,0.55)', true);
    else if (id === 'hearts') {
      var forehead = lm(L, 10, w, h);
      var chin = lm(L, 152, w, h);
      for (var i = 0; i < 8; i++) {
        var ang = t * 0.9 + i * 0.85;
        var r = faceW * (0.55 + 0.12 * Math.sin(t + i));
        heart(
          ctx,
          (left.x + right.x) / 2 + Math.cos(ang) * r,
          (forehead.y + chin.y) / 2 + Math.sin(ang * 1.15) * r * 0.65 - 16,
          0.95 + 0.25 * Math.sin(t * 2 + i),
          i % 2 ? '#ff4d8a' : '#ff2d6a'
        );
      }
    } else if (id === 'heartface') {
      var lc = lm(L, 50, w, h);
      var rc = lm(L, 280, w, h);
      var s = faceW * 0.045;
      heart(ctx, lc.x - 4, lc.y + 6, s, '#ff3d7a');
      heart(ctx, rc.x + 4, rc.y + 6, s, '#ff3d7a');
    } else if (id === 'blushpro') {
      var r2 = faceW * 0.17;
      ctx.save();
      ctx.globalAlpha = 0.38;
      [lm(L, 50, w, h), lm(L, 280, w, h)].forEach(function (c) {
        var g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r2);
        g.addColorStop(0, '#ff6b9d');
        g.addColorStop(1, 'rgba(255,107,157,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    } else if (id === 'hairtint') {
      var top = lm(L, 10, w, h);
      var cx = (left.x + right.x) / 2;
      var g = ctx.createRadialGradient(cx, top.y - faceW * 0.2, faceW * 0.1, cx, top.y, faceW * 0.7);
      g.addColorStop(0, 'rgba(180,60,255,0.48)');
      g.addColorStop(0.55, 'rgba(120,40,220,0.22)');
      g.addColorStop(1, 'rgba(120,40,220,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, top.y - faceW * 0.1, faceW * 0.72, faceW * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'hatpro') {
      var top2 = lm(L, 10, w, h);
      var cx2 = (left.x + right.x) / 2;
      var cy = top2.y - faceW * 0.22;
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(cx2, cy + faceW * 0.12, faceW * 0.72, faceW * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      var hg = ctx.createLinearGradient(cx2, cy - faceW * 0.45, cx2, cy + faceW * 0.1);
      hg.addColorStop(0, '#333');
      hg.addColorStop(1, '#111');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.ellipse(cx2, cy - faceW * 0.05, faceW * 0.42, faceW * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c8f560';
      ctx.fillRect(cx2 - faceW * 0.42, cy + faceW * 0.02, faceW * 0.84, faceW * 0.06);
    } else if (id === 'beanie') {
      var top3 = lm(L, 10, w, h);
      var cx3 = (left.x + right.x) / 2;
      var cy3 = top3.y - faceW * 0.05;
      ctx.fillStyle = '#6B3DFF';
      ctx.beginPath();
      ctx.ellipse(cx3, cy3 - faceW * 0.15, faceW * 0.55, faceW * 0.42, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#5a32d9';
      ctx.fillRect(cx3 - faceW * 0.55, cy3 - faceW * 0.08, faceW * 1.1, faceW * 0.14);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx3, cy3 - faceW * 0.52, faceW * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'sparkle') {
      [33, 263, 10, 152, 61, 291].forEach(function (idx, i) {
        var p = lm(L, idx, w, h);
        var pulse = 0.6 + 0.4 * Math.sin(t * 4 + i);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(t + i);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.55 + 0.35 * pulse) + ')';
        var s2 = faceW * 0.03 * pulse;
        ctx.beginPath();
        for (var k = 0; k < 4; k++) {
          var a = (k * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * s2, Math.sin(a) * s2);
          ctx.lineTo(Math.cos(a + Math.PI / 4) * s2 * 0.35, Math.sin(a + Math.PI / 4) * s2 * 0.35);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    }
  }

  async function ensureLandmarker() {
    if (landmarker) return landmarker;
    try {
      var vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
      var fileset = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1
      });
    } catch (e) {
      console.warn('fx-pro landmarker', e);
    }
    return landmarker;
  }

  function ensureProBar() {
    var bottom = document.querySelector('#tchiloFaceFx .fx-bottom');
    if (!bottom || document.getElementById('tchiloFxProBar')) return;
    var label = document.createElement('div');
    label.textContent = 'Lentes pro';
    label.style.cssText = 'color:#fff;font:800 11px Inter,system-ui,sans-serif;margin:6px 0 4px;';
    var bar = document.createElement('div');
    bar.id = 'tchiloFxProBar';
    PRO_FX.forEach(function (fx, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-chip' + (i === 0 ? ' active' : '');
      b.textContent = fx.label;
      b.onclick = function () {
        proIndex = i;
        bar.querySelectorAll('.fx-chip').forEach(function (c, j) {
          c.classList.toggle('active', j === i);
        });
      };
      bar.appendChild(b);
    });
    bottom.insertBefore(bar, bottom.firstChild);
    bottom.insertBefore(label, bar);
  }

  function patchFlip() {
    var btn = document.getElementById('tchiloFxFlip');
    if (!btn || btn.__proFlip) return;
    btn.__proFlip = true;
    btn.addEventListener(
      'click',
      function () {
        btn.classList.add('spin');
        setTimeout(function () {
          btn.classList.remove('spin');
        }, 380);
        var stage = document.getElementById('tchiloFxStage');
        if (stage) {
          stage.classList.add('fx-flip-anim');
          setTimeout(function () {
            stage.classList.remove('fx-flip-anim');
          }, 340);
        }
      },
      true
    );
  }

  function loop() {
    requestAnimationFrame(loop);
    var root = document.getElementById('tchiloFaceFx');
    if (!root || !root.classList.contains('open')) return;
    if (PRO_FX[proIndex].id === 'none') return;
    var video = document.getElementById('tchiloFxVideo');
    var canvas = document.getElementById('tchiloFxCanvas');
    if (!video || !canvas || video.readyState < 2) return;
    var w = canvas.width;
    var h = canvas.height;
    if (!w || !h) return;

    var now = performance.now();
    if (landmarker && now - lastDetect > 66) {
      lastDetect = now;
      try {
        var res = landmarker.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks.length) {
          lastFace = res.faceLandmarks[0];
        }
      } catch (e) {}
    }
    if (!lastFace) return;
    var ctx = canvas.getContext('2d');
    // selfie mirror
    var face = lastFace;
    var mirrored = face.map(function (p) {
      return { x: 1 - p.x, y: p.y, z: p.z };
    });
    drawPro(ctx, mirrored, w, h);
  }

  function onOpen() {
    injectCSS();
    ensureProBar();
    patchFlip();
    ensureLandmarker();
  }

  function watchOpen() {
    var root = document.getElementById('tchiloFaceFx');
    if (!root || root.__proWatch) return;
    root.__proWatch = true;
    new MutationObserver(function () {
      if (root.classList.contains('open')) onOpen();
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  function boot() {
    injectCSS();
    watchOpen();
    requestAnimationFrame(loop);
    setTimeout(function () {
      watchOpen();
      onOpen();
    }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
