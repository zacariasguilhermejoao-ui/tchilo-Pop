/**
 * tchilo-Pop — efeitos PNG na lista e na cara
 * tchiloCam e desenhado pelo camera-tiktok.js (este ficheiro nao limpa esse canvas)
 */
(function () {
  'use strict';

  var FX = [
    { id: 'png_none', label: 'Normal', file: null },
    { id: 'png_thug', label: 'Thug Life', file: 'oculos_pixel_thug_life.png', anchor: 'eyes', scale: 2.4, oy: 0 },
    { id: 'png_estrela', label: 'Oculos estrela', file: 'oculos_estrela_rosa.png', anchor: 'eyes', scale: 2.2, oy: 0 },
    { id: 'png_nerd', label: 'Nerd laco', file: 'oculos_nerd_laco_rosa.png', anchor: 'eyes', scale: 2.3, oy: -0.05 },
    { id: 'png_prata', label: 'Oculos prata', file: 'oculos_prata_esportivo.png', anchor: 'eyes', scale: 2.3, oy: 0 },
    { id: 'png_gato', label: 'Gato', file: 'orelha_gato_laco_bigodes.png', anchor: 'face', scale: 1.8, oy: -0.15 },
    { id: 'png_coroa', label: 'Coroa', file: 'coroa_dourada.png', anchor: 'forehead', scale: 1.5, oy: -0.55 },
    { id: 'png_chifres', label: 'Chifres', file: 'chifres_demonio.png', anchor: 'forehead', scale: 1.4, oy: -0.7 },
    { id: 'png_bone', label: 'Bone', file: 'bone_rosa_dodgers.png', anchor: 'forehead', scale: 1.6, oy: -0.45 },
    { id: 'png_bob', label: 'Bob', file: 'peruca_bob_franja.png', anchor: 'forehead', scale: 2.0, oy: -0.35 },
    { id: 'png_afro', label: 'Afro', file: 'cabelo_afro.png', anchor: 'forehead', scale: 2.2, oy: -0.4 },
    { id: 'png_dreads', label: 'Dreads', file: 'dreadlocks_bicolor.png', anchor: 'forehead', scale: 2.1, oy: -0.25 },
    { id: 'png_topo', label: 'Topo', file: 'cabelo_topo_liso.png', anchor: 'forehead', scale: 1.8, oy: -0.5 },
    { id: 'png_beijo', label: 'Beijo', file: 'labios_beijo_rosa.png', anchor: 'mouth', scale: 0.9, oy: 0.05 },
    { id: 'png_gloss', label: 'Gloss', file: 'labios_gloss_vermelho.png', anchor: 'mouth', scale: 0.85, oy: 0.05 },
    { id: 'png_dentes', label: 'Dentes', file: 'mascara_boca_dentes.png', anchor: 'mouth', scale: 1.1, oy: 0.1 },
    { id: 'png_spider', label: 'Spiderman', file: 'mascara_spiderman.png', anchor: 'face', scale: 1.7, oy: -0.05 },
    { id: 'png_robo', label: 'Robo', file: 'cabeca_robo_metal.png', anchor: 'face', scale: 1.75, oy: -0.08 }
  ];

  var imgs = {};
  var pngIndex = 0;
  var ownLm = null;
  var lastLm = null;
  var lastT = 0;

  function assetSrc(file) {
    var A = window.TchiloFxPngAssets || {};
    return A[file] || null;
  }

  function loadImages() {
    FX.forEach(function (fx) {
      if (!fx.file || imgs[fx.file]) return;
      var src = assetSrc(fx.file);
      if (!src) return;
      var im = new Image();
      im.onload = function () { imgs[fx.file] = im; };
      im.src = src;
    });
  }

  function lm(L, i, w, h) {
    var p = L[i];
    return { x: p.x * w, y: p.y * h };
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function drawPng(ctx, landmarks, w, h) {
    var fx = FX[pngIndex];
    if (!fx || !fx.file || !landmarks || !landmarks.length) return;
    var im = imgs[fx.file];
    if (!im || !im.complete || !im.naturalWidth) return;
    var L = landmarks[0];
    var left = lm(L, 33, w, h);
    var right = lm(L, 263, w, h);
    var faceW = dist(left, right) || 1;
    var midEyes = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
    var angle = Math.atan2(right.y - left.y, right.x - left.x);
    var top = lm(L, 10, w, h);
    var chin = lm(L, 152, w, h);
    var mouthL = lm(L, 61, w, h);
    var mouthR = lm(L, 291, w, h);
    var mouthMid = { x: (mouthL.x + mouthR.x) / 2, y: (mouthL.y + mouthR.y) / 2 };

    var cx = midEyes.x;
    var cy = midEyes.y;
    var targetW = faceW * (fx.scale || 2);
    if (fx.anchor === 'forehead') {
      cx = top.x;
      cy = top.y + faceW * (fx.oy || -0.5);
      targetW = faceW * (fx.scale || 1.6);
    } else if (fx.anchor === 'mouth') {
      cx = mouthMid.x;
      cy = mouthMid.y + faceW * (fx.oy || 0);
      targetW = dist(mouthL, mouthR) * (fx.scale || 1) * 2.2;
    } else if (fx.anchor === 'face') {
      cx = (top.x + chin.x) / 2;
      cy = (top.y + chin.y) / 2 + faceW * (fx.oy || 0);
      targetW = faceW * (fx.scale || 1.7);
    } else {
      cy = midEyes.y + faceW * (fx.oy || 0);
    }
    var targetH = targetW * (im.naturalHeight / im.naturalWidth);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(im, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  }

  function injectCSS() {
    if (document.getElementById('tchiloPngFxCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloPngFxCSS';
    st.textContent =
      '#tchiloFxProBar{display:none!important;}' +
      '#tchiloFxChips .fx-chip:not(.fx-png-chip){display:none!important;}' +
      '#tchiloFxChips .fx-png-chip,#tchiloCamFxTrack .fx-png-chip{' +
      'flex:0 0 auto;width:64px!important;height:64px!important;min-width:64px!important;' +
      'border-radius:50%!important;padding:0!important;overflow:hidden!important;' +
      'border:2.5px solid rgba(255,255,255,.4)!important;background:rgba(0,0,0,.4)!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'font-size:0!important;color:transparent!important;cursor:pointer;scroll-snap-align:center;}' +
      '#tchiloFxChips .fx-png-chip.active,#tchiloCamFxTrack .fx-png-chip.active{' +
      'border-color:#c8f560!important;opacity:1!important;transform:scale(1.08);}' +
      '#tchiloFxChips .fx-png-chip img,#tchiloCamFxTrack .fx-png-chip img{' +
      'width:100%;height:100%;object-fit:cover;}' +
      '#tchiloFxChips .fx-png-chip.fx-none,#tchiloCamFxTrack .fx-png-chip.fx-none{' +
      'font-size:11px!important;color:#fff!important;font-weight:800;}' +
      '#tchiloCamFxTrack .fx-3d-item:not(.fx-png-chip){display:none!important;}';
    document.head.appendChild(st);
  }

  function makeChip(fx, i, barId) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'fx-chip fx-png-chip fx-3d-item' + (i === pngIndex ? ' active' : '') + (!fx.file ? ' fx-none' : '');
    b.title = fx.label;
    if (fx.file) {
      var src = assetSrc(fx.file);
      if (src) {
        var img = document.createElement('img');
        img.src = src;
        img.alt = fx.label;
        b.appendChild(img);
      } else b.textContent = fx.label.slice(0, 6);
    } else {
      b.textContent = 'Normal';
    }
    b.onclick = function () {
      pngIndex = i;
      window.__tchiloPngFxIndex = i;
      document.querySelectorAll('.fx-png-chip').forEach(function (c) {
        c.classList.remove('active');
      });
      document.querySelectorAll('#tchiloFxChips .fx-png-chip, #tchiloCamFxTrack .fx-png-chip').forEach(function (c) {
        if (c.title === fx.label || (c.textContent || '').indexOf(fx.label.slice(0, 4)) >= 0) c.classList.add('active');
      });
      b.classList.add('active');
    };
    return b;
  }

  function buildChips(force) {
    injectCSS();
    loadImages();
    ['tchiloFxChips', 'tchiloCamFxTrack'].forEach(function (id) {
      var bar = document.getElementById(id);
      if (!bar) return;
      if (!force && bar.querySelectorAll('.fx-png-chip').length >= FX.length) return;
      // So preenche tchiloFxChips — tchiloCamFxTrack e do camera-tiktok
      if (id === 'tchiloCamFxTrack') return;
      bar.innerHTML = '';
      FX.forEach(function (fx, i) {
        bar.appendChild(makeChip(fx, i, id));
      });
    });
  }

  function getActivePair() {
    // tchiloCam e desenhado so pelo camera-tiktok.js — nao limpar o canvas aqui
    var face = document.getElementById('tchiloFaceFx');
    if (face && face.classList.contains('open')) {
      return {
        root: face,
        video: document.getElementById('tchiloFxVideo'),
        canvas: document.getElementById('tchiloFxCanvas'),
        mirror: !face.classList.contains('fx-env')
      };
    }
    return null;
  }

  function ensureLm() {
    if (ownLm) return Promise.resolve(ownLm);
    return (async function () {
      try {
        var vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
        var fileset = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        var opts = {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1
        };
        try {
          ownLm = await vision.FaceLandmarker.createFromOptions(fileset, opts);
        } catch (e) {
          opts.baseOptions.delegate = 'CPU';
          ownLm = await vision.FaceLandmarker.createFromOptions(fileset, opts);
        }
      } catch (e2) {
        console.warn('fx-png landmarker', e2);
      }
      return ownLm;
    })();
  }

  function paintPng() {
    var pair = getActivePair();
    if (!pair || !pair.video || !pair.canvas) return;

    pngIndex = typeof window.__tchiloPngFxIndex === 'number' ? window.__tchiloPngFxIndex : pngIndex;
    if (pngIndex === 0) {
      var c0 = pair.canvas;
      if (c0.width) {
        var ctx0 = c0.getContext('2d');
        ctx0.clearRect(0, 0, c0.width, c0.height);
      }
      return;
    }

    var video = pair.video;
    var canvas = pair.canvas;
    if (video.readyState < 2) return;

    var vw = video.videoWidth || 640;
    var vh = video.videoHeight || 480;
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }

    var now = performance.now();
    if (ownLm && now - lastT > 30) {
      lastT = now;
      try {
        var res = ownLm.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks.length) lastLm = res.faceLandmarks;
      } catch (e) {}
    }
    if (!lastLm) return;

    var w = canvas.width;
    var h = canvas.height;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (pair.mirror) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    drawPng(ctx, lastLm, w, h);
    ctx.restore();
  }

  function loop() {
    requestAnimationFrame(loop);
    paintPng();
  }

  function onOpen() {
    loadImages();
    ensureLm();
    buildChips(true);
    setTimeout(function () { buildChips(true); }, 200);
    setTimeout(function () { buildChips(true); }, 800);
  }

  window.__tchiloPngOnOpen = onOpen;
  window.__tchiloPngFxIndex = 0;
  window.__tchiloPngFxList = FX;

  function boot() {
    injectCSS();
    loadImages();
    ensureLm();
    loop();

    try {
      new MutationObserver(function () {
        var face = document.getElementById('tchiloFaceFx');
        if (face && face.classList.contains('open')) onOpen();
        if (document.getElementById('tchiloFxChips')) buildChips(false);
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    } catch (e) {}

    setTimeout(onOpen, 500);
    setTimeout(onOpen, 1500);
    setTimeout(onOpen, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
