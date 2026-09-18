/**
 * tchilo-Pop — ícones de efeitos estilo Snapchat (3D / volume)
 * Orelhas de cão e gato, nariz, chapéu, óculos com sombra e gradiente.
 * Desenha por cima do canvas da câmara (face-effects / camera-tiktok).
 */
(function () {
  'use strict';

  var landmarker = null;
  var lastFace = null;
  var lastDetect = 0;
  var t0 = Date.now();

  function lm(L, i, w, h) {
    var p = L[i];
    return { x: p.x * w, y: p.y * h, z: p.z || 0 };
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function mid(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  /* ---- formas 3D ---- */
  function shadeEllipse(ctx, x, y, rx, ry, rot, c0, c1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    var g = ctx.createRadialGradient(-rx * 0.25, -ry * 0.3, 0, 0, 0, Math.max(rx, ry));
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function dropShadow(ctx, fn) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    fn();
    ctx.restore();
  }

  /** Orelha de cão — caída, com volume */
  function dogEar(ctx, x, y, size, flip, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    ctx.scale(flip ? -1 : 1, 1);
    dropShadow(ctx, function () {
      // exterior
      var g = ctx.createLinearGradient(0, -size, size * 0.2, size * 1.2);
      g.addColorStop(0, '#A67C52');
      g.addColorStop(0.55, '#7A5235');
      g.addColorStop(1, '#4A3220');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size * 0.15, -size * 0.15, size * 0.95, size * 0.1, size * 0.85, size * 1.15);
      ctx.bezierCurveTo(size * 0.7, size * 1.35, size * 0.15, size * 0.9, 0, size * 0.25);
      ctx.closePath();
      ctx.fill();
      // interior rosa
      var g2 = ctx.createLinearGradient(size * 0.1, size * 0.1, size * 0.5, size * 0.9);
      g2.addColorStop(0, '#E8A090');
      g2.addColorStop(1, '#C07060');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(size * 0.12, size * 0.12);
      ctx.bezierCurveTo(size * 0.35, size * 0.2, size * 0.65, size * 0.35, size * 0.55, size * 0.95);
      ctx.bezierCurveTo(size * 0.35, size * 0.85, size * 0.18, size * 0.55, size * 0.12, size * 0.12);
      ctx.fill();
    });
    ctx.restore();
  }

  /** Nariz de cão — preto húmido */
  function dogNose(ctx, x, y, r) {
    dropShadow(ctx, function () {
      shadeEllipse(ctx, x, y, r * 1.15, r * 0.95, 0, '#3a3a3a', '#0a0a0a');
      // brilho
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.25, y - r * 0.3, r * 0.28, r * 0.18, -0.4, 0, Math.PI * 2);
      ctx.fill();
      // fossas
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.28, y + r * 0.05, r * 0.12, r * 0.18, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + r * 0.28, y + r * 0.05, r * 0.12, r * 0.18, -0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawDog(ctx, L, w, h) {
    var left = lm(L, 234, w, h);
    var right = lm(L, 454, w, h);
    var top = lm(L, 10, w, h);
    var nose = lm(L, 1, w, h);
    var faceW = dist(left, right);
    var ang = Math.atan2(right.y - left.y, right.x - left.x);
    var ear = faceW * 0.55;
    dogEar(ctx, left.x - faceW * 0.05, top.y + faceW * 0.05, ear, false, ang - 0.35);
    dogEar(ctx, right.x + faceW * 0.05, top.y + faceW * 0.05, ear, true, ang + 0.35);
    // focinho
    shadeEllipse(
      ctx,
      nose.x,
      nose.y + faceW * 0.08,
      faceW * 0.28,
      faceW * 0.2,
      ang,
      'rgba(120,90,60,0.55)',
      'rgba(80,55,35,0.35)'
    );
    dogNose(ctx, nose.x, nose.y + faceW * 0.02, faceW * 0.09);
  }

  /** Orelha de gato — pontiaguda */
  function catEar(ctx, x, y, size, flip, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    ctx.scale(flip ? -1 : 1, 1);
    dropShadow(ctx, function () {
      var g = ctx.createLinearGradient(0, -size, size * 0.3, size * 0.2);
      g.addColorStop(0, '#FFB347');
      g.addColorStop(0.5, '#F5A623');
      g.addColorStop(1, '#C47A10');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.15);
      ctx.lineTo(size * 0.15, -size * 0.95);
      ctx.lineTo(size * 0.7, size * 0.2);
      ctx.closePath();
      ctx.fill();
      // interior
      ctx.fillStyle = '#FF9AA8';
      ctx.beginPath();
      ctx.moveTo(size * 0.12, size * 0.08);
      ctx.lineTo(size * 0.22, -size * 0.55);
      ctx.lineTo(size * 0.48, size * 0.1);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  function drawCat(ctx, L, w, h) {
    var left = lm(L, 234, w, h);
    var right = lm(L, 454, w, h);
    var top = lm(L, 10, w, h);
    var nose = lm(L, 1, w, h);
    var faceW = dist(left, right);
    var ang = Math.atan2(right.y - left.y, right.x - left.x);
    var ear = faceW * 0.48;
    catEar(ctx, left.x - faceW * 0.08, top.y - faceW * 0.05, ear, false, ang - 0.25);
    catEar(ctx, right.x + faceW * 0.08, top.y - faceW * 0.05, ear, true, ang + 0.25);
    // nariz rosa
    dropShadow(ctx, function () {
      ctx.fillStyle = '#FF6B8A';
      ctx.beginPath();
      ctx.moveTo(nose.x, nose.y - faceW * 0.02);
      ctx.lineTo(nose.x - faceW * 0.06, nose.y + faceW * 0.05);
      ctx.lineTo(nose.x + faceW * 0.06, nose.y + faceW * 0.05);
      ctx.closePath();
      ctx.fill();
    });
    // bigodes
    ctx.strokeStyle = 'rgba(40,40,40,0.55)';
    ctx.lineWidth = Math.max(1.5, faceW * 0.012);
    var cheekL = lm(L, 50, w, h);
    var cheekR = lm(L, 280, w, h);
    for (var i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cheekL.x + faceW * 0.05, nose.y + i * faceW * 0.04);
      ctx.lineTo(cheekL.x - faceW * 0.35, nose.y + i * faceW * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cheekR.x - faceW * 0.05, nose.y + i * faceW * 0.04);
      ctx.lineTo(cheekR.x + faceW * 0.35, nose.y + i * faceW * 0.08);
      ctx.stroke();
    }
  }

  function drawGlasses(ctx, L, w, h, dark) {
    var left = lm(L, 33, w, h);
    var right = lm(L, 263, w, h);
    var m = mid(left, right);
    var width = dist(left, right) * 2.15;
    var height = width * 0.38;
    var ang = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(ang);
    dropShadow(ctx, function () {
      ctx.lineWidth = Math.max(3, width * 0.045);
      ctx.strokeStyle = dark ? '#111' : '#1a1a1a';
      ctx.fillStyle = dark ? 'rgba(15,15,15,0.72)' : 'rgba(90,160,255,0.32)';
      // lente esq
      ctx.beginPath();
      ctx.ellipse(-width * 0.28, 0, width * 0.22, height * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // lente dir
      ctx.beginPath();
      ctx.ellipse(width * 0.28, 0, width * 0.22, height * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // ponte
      ctx.beginPath();
      ctx.moveTo(-width * 0.06, 0);
      ctx.lineTo(width * 0.06, 0);
      ctx.stroke();
      // brilho nas lentes
      if (!dark) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.ellipse(-width * 0.32, -height * 0.12, width * 0.08, height * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(width * 0.24, -height * 0.12, width * 0.08, height * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  function drawHat(ctx, L, w, h) {
    var top = lm(L, 10, w, h);
    var left = lm(L, 234, w, h);
    var right = lm(L, 454, w, h);
    var faceW = dist(left, right);
    var cx = (left.x + right.x) / 2;
    var cy = top.y - faceW * 0.28;
    var ang = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    dropShadow(ctx, function () {
      // aba
      var g = ctx.createLinearGradient(0, faceW * 0.2, 0, faceW * 0.45);
      g.addColorStop(0, '#2a2a2a');
      g.addColorStop(1, '#0d0d0d');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, faceW * 0.28, faceW * 0.72, faceW * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      // copa
      var g2 = ctx.createLinearGradient(-faceW * 0.2, -faceW * 0.5, faceW * 0.2, faceW * 0.2);
      g2.addColorStop(0, '#444');
      g2.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.ellipse(0, 0, faceW * 0.4, faceW * 0.42, 0, Math.PI, 0);
      ctx.fill();
      // faixa Tchilo
      ctx.fillStyle = '#c8f560';
      ctx.fillRect(-faceW * 0.4, faceW * 0.08, faceW * 0.8, faceW * 0.07);
    });
    ctx.restore();
  }

  function drawCrown(ctx, L, w, h) {
    var top = lm(L, 10, w, h);
    var left = lm(L, 234, w, h);
    var right = lm(L, 454, w, h);
    var faceW = dist(left, right);
    var cx = (left.x + right.x) / 2;
    var cy = top.y - faceW * 0.45;
    var ang = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    dropShadow(ctx, function () {
      var g = ctx.createLinearGradient(0, -faceW * 0.3, 0, faceW * 0.25);
      g.addColorStop(0, '#FFE566');
      g.addColorStop(0.5, '#F5C542');
      g.addColorStop(1, '#C9920A');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-faceW * 0.48, faceW * 0.22);
      ctx.lineTo(-faceW * 0.42, -faceW * 0.05);
      ctx.lineTo(-faceW * 0.22, faceW * 0.12);
      ctx.lineTo(0, -faceW * 0.28);
      ctx.lineTo(faceW * 0.22, faceW * 0.12);
      ctx.lineTo(faceW * 0.42, -faceW * 0.05);
      ctx.lineTo(faceW * 0.48, faceW * 0.22);
      ctx.closePath();
      ctx.fill();
      // joias
      ['#ff4d6d', '#5b8cff', '#ff4d6d'].forEach(function (col, i) {
        var px = (i - 1) * faceW * 0.28;
        var py = i === 1 ? -faceW * 0.12 : faceW * 0.02;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(px, py, faceW * 0.045, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(px - faceW * 0.012, py - faceW * 0.012, faceW * 0.015, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  }

  function drawHearts(ctx, L, w, h) {
    var eyeL = lm(L, 33, w, h);
    var eyeR = lm(L, 263, w, h);
    var s = dist(eyeL, eyeR) * 0.2;
    var t = (Date.now() - t0) / 1000;
    function heart(x, y, size, col) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size, size);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.bezierCurveTo(-5, -2, -12, 2, 0, 12);
      ctx.bezierCurveTo(12, 2, 5, -2, 0, 3);
      ctx.fill();
      ctx.restore();
    }
    var pulse = 1 + 0.08 * Math.sin(t * 4);
    heart(eyeL.x, eyeL.y - s * 0.15, s * 0.12 * pulse, '#ff3d7a');
    heart(eyeR.x, eyeR.y - s * 0.15, s * 0.12 * pulse, '#ff3d7a');
  }

  function drawMustache(ctx, L, w, h) {
    var left = lm(L, 61, w, h);
    var right = lm(L, 291, w, h);
    var nose = lm(L, 2, w, h);
    var upper = lm(L, 0, w, h);
    var m = { x: (left.x + right.x) / 2, y: (nose.y + upper.y) / 2 };
    var width = dist(left, right) * 1.2;
    var ang = Math.atan2(right.y - left.y, right.x - left.x);
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(ang);
    dropShadow(ctx, function () {
      var g = ctx.createLinearGradient(0, -width * 0.1, 0, width * 0.15);
      g.addColorStop(0, '#3a2a1a');
      g.addColorStop(1, '#1a1008');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-width * 0.15, -width * 0.1, -width * 0.5, -width * 0.02, -width * 0.55, width * 0.14);
      ctx.bezierCurveTo(-width * 0.25, 0, -width * 0.08, width * 0.04, 0, 0);
      ctx.bezierCurveTo(width * 0.08, width * 0.04, width * 0.25, 0, width * 0.55, width * 0.14);
      ctx.bezierCurveTo(width * 0.5, -width * 0.02, width * 0.15, -width * 0.1, 0, 0);
      ctx.fill();
    });
    ctx.restore();
  }

  function activeEffectId() {
    // face-effects chips
    var chips = document.querySelectorAll('#tchiloFxChips .fx-chip');
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].classList.contains('active')) {
        var t = (chips[i].textContent || '').trim().toLowerCase();
        if (t.indexOf('cão') >= 0 || t.indexOf('cao') >= 0) return 'dog';
        if (t.indexOf('gato') >= 0) return 'cat';
        if (t.indexOf('óculos') >= 0 || t.indexOf('oculos') >= 0) return 'glasses';
        if (t.indexOf('escuro') >= 0) return 'sunglasses';
        if (t.indexOf('chapéu') >= 0 || t.indexOf('chapeu') >= 0) return 'hat';
        if (t.indexOf('coroa') >= 0) return 'crown';
        if (t.indexOf('cora') >= 0) return 'hearts';
        if (t.indexOf('bigode') >= 0) return 'mustache';
        if (t.indexOf('nenhum') >= 0 || t.indexOf('normal') >= 0) return 'none';
      }
    }
    // camera-tiktok 3d track
    var items = document.querySelectorAll('#tchiloCamFxTrack .fx-3d-item');
    for (var j = 0; j < items.length; j++) {
      if (items[j].classList.contains('active')) {
        var t2 = (items[j].textContent || '').trim().toLowerCase();
        if (t2.indexOf('cão') >= 0 || t2.indexOf('cao') >= 0) return 'dog';
        if (t2.indexOf('gato') >= 0) return 'cat';
        if (t2.indexOf('óculos') >= 0 || t2.indexOf('oculos') >= 0) return 'glasses';
        if (t2.indexOf('escuro') >= 0) return 'sunglasses';
        if (t2.indexOf('chapéu') >= 0 || t2.indexOf('chapeu') >= 0) return 'hat';
        if (t2.indexOf('coroa') >= 0) return 'crown';
        if (t2.indexOf('cora') >= 0) return 'hearts';
        if (t2.indexOf('bigode') >= 0) return 'mustache';
        if (t2.indexOf('normal') >= 0) return 'none';
      }
    }
    return null;
  }

  function getCanvasAndVideo() {
    var faceOpen = document.getElementById('tchiloFaceFx');
    if (faceOpen && faceOpen.classList.contains('open')) {
      return {
        video: document.getElementById('tchiloFxVideo'),
        canvas: document.getElementById('tchiloFxCanvas'),
        mirror: !(faceOpen.classList.contains('fx-env'))
      };
    }
    var camOpen = document.getElementById('tchiloCam');
    if (camOpen && camOpen.classList.contains('open')) {
      return {
        video: document.getElementById('tchiloCamVideo'),
        canvas: document.getElementById('tchiloCamCanvas'),
        mirror: !(camOpen.classList.contains('cam-env'))
      };
    }
    return null;
  }

  async function ensureLandmarker() {
    if (landmarker) return landmarker;
    try {
      var vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
      var fileset = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      try {
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
        landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1
        });
      }
    } catch (e) {
      console.warn('face-fx-icons landmarker', e);
    }
    return landmarker;
  }

  function drawFx(ctx, face, w, h, id) {
    if (!face || id === 'none' || !id) return;
    if (id === 'dog') drawDog(ctx, face, w, h);
    else if (id === 'cat') drawCat(ctx, face, w, h);
    else if (id === 'glasses') drawGlasses(ctx, face, w, h, false);
    else if (id === 'sunglasses') drawGlasses(ctx, face, w, h, true);
    else if (id === 'hat') drawHat(ctx, face, w, h);
    else if (id === 'crown') drawCrown(ctx, face, w, h);
    else if (id === 'hearts') drawHearts(ctx, face, w, h);
    else if (id === 'mustache') drawMustache(ctx, face, w, h);
  }

  function loop() {
    requestAnimationFrame(loop);
    var pair = getCanvasAndVideo();
    if (!pair || !pair.video || !pair.canvas) return;
    var video = pair.video;
    var canvas = pair.canvas;
    if (video.readyState < 2) return;

    var w = video.videoWidth || 640;
    var h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    var id = activeEffectId();
    if (!id || id === 'none') return;

    var now = performance.now();
    if (landmarker && now - lastDetect > 40) {
      lastDetect = now;
      try {
        var res = landmarker.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks[0]) {
          lastFace = res.faceLandmarks[0];
        }
      } catch (e) {}
    }
    if (!lastFace) return;

    var ctx = canvas.getContext('2d');
    // não limpar o frame inteiro se face-effects já desenhou — desenhar por cima
    // mas se o canvas estiver só nosso, precisamos do vídeo de fundo
    // face-effects já copia o vídeo; nós só adicionamos ícones 3D
    var face = lastFace;
    if (pair.mirror) {
      face = lastFace.map(function (p) {
        return { x: 1 - p.x, y: p.y, z: p.z };
      });
    }
    drawFx(ctx, face, w, h, id);
  }

  function boot() {
    ensureLandmarker();
    requestAnimationFrame(loop);
    // preload quando abrir câmara
    document.addEventListener(
      'click',
      function () {
        ensureLandmarker();
      },
      { once: true, passive: true }
    );
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
