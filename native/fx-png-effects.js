/**
 * tchilo-Pop — efeitos PNG custom (os 17 da pasta)
 * Substitui chips antigos, desenha na cara, ícones com preview do PNG
 */
(function () {
  'use strict';

  var FX = [
    { id: 'png_none', label: 'Normal', file: null },
    { id: 'png_thug', label: 'Thug Life', file: 'oculos_pixel_thug_life.png', anchor: 'eyes', scale: 2.4, oy: 0 },
    { id: 'png_estrela', label: 'Óculos estrela', file: 'oculos_estrela_rosa.png', anchor: 'eyes', scale: 2.2, oy: 0 },
    { id: 'png_nerd', label: 'Nerd laço', file: 'oculos_nerd_laco_rosa.png', anchor: 'eyes', scale: 2.3, oy: -0.05 },
    { id: 'png_prata', label: 'Óculos prata', file: 'oculos_prata_esportivo.png', anchor: 'eyes', scale: 2.3, oy: 0 },
    { id: 'png_gato', label: 'Gato', file: 'orelha_gato_laco_bigodes.png', anchor: 'face', scale: 1.8, oy: -0.15 },
    { id: 'png_coroa', label: 'Coroa', file: 'coroa_dourada.png', anchor: 'forehead', scale: 1.5, oy: -0.55 },
    { id: 'png_chifres', label: 'Chifres', file: 'chifres_demonio.png', anchor: 'forehead', scale: 1.4, oy: -0.7 },
    { id: 'png_bone', label: 'Boné', file: 'bone_rosa_dodgers.png', anchor: 'forehead', scale: 1.6, oy: -0.45 },
    { id: 'png_bob', label: 'Bob', file: 'peruca_bob_franja.png', anchor: 'forehead', scale: 2.0, oy: -0.35 },
    { id: 'png_afro', label: 'Afro', file: 'cabelo_afro.png', anchor: 'forehead', scale: 2.2, oy: -0.4 },
    { id: 'png_dreads', label: 'Dreads', file: 'dreadlocks_bicolor.png', anchor: 'forehead', scale: 2.1, oy: -0.25 },
    { id: 'png_topo', label: 'Topo', file: 'cabelo_topo_liso.png', anchor: 'forehead', scale: 1.8, oy: -0.5 },
    { id: 'png_beijo', label: 'Beijo', file: 'labios_beijo_rosa.png', anchor: 'mouth', scale: 0.9, oy: 0.05 },
    { id: 'png_gloss', label: 'Gloss', file: 'labios_gloss_vermelho.png', anchor: 'mouth', scale: 0.85, oy: 0.05 },
    { id: 'png_dentes', label: 'Dentes', file: 'mascara_boca_dentes.png', anchor: 'mouth', scale: 1.1, oy: 0.1 },
    { id: 'png_spider', label: 'Spiderman', file: 'mascara_spiderman.png', anchor: 'face', scale: 1.7, oy: -0.05 },
    { id: 'png_robo', label: 'Robô', file: 'cabeca_robo_metal.png', anchor: 'face', scale: 1.75, oy: -0.08 }
  ];

  var imgs = {};
  var pngIndex = 0;
  var ownLm = null;
  var lastLm = null;
  var lastT = 0;
  var chipsBuilt = false;

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
      im.onerror = function () { console.warn('fx img fail', fx.file); };
      im.src = src;
    });
  }

  function lm(L, idx, w, h) {
    var p = L[idx];
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

    var cx = midEyes.x, cy = midEyes.y;
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
      '#tchiloFxProBar,.fx-row-label[data-pro],#tchiloFxProBar + *{display:none!important;}' +
      '#tchiloFxChips{display:flex!important;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:8px 4px;}' +
      '#tchiloFxChips .fx-chip,#tchiloFxChips .fx-png-chip{' +
      'flex:0 0 auto;width:64px!important;height:64px!important;min-width:64px!important;' +
      'border-radius:50%!important;padding:0!important;overflow:hidden!important;' +
      'border:2px solid rgba(255,255,255,.35)!important;background:rgba(0,0,0,.35)!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'font-size:0!important;color:transparent!important;cursor:pointer;}' +
      '#tchiloFxChips .fx-chip.active,#tchiloFxChips .fx-png-chip.active{' +
      'border-color:#c8f560!important;box-shadow:0 0 0 3px rgba(200,245,96,.4)!important;}' +
      '#tchiloFxChips .fx-png-chip img{width:100%;height:100%;object-fit:cover;pointer-events:none;}' +
      '#tchiloFxChips .fx-png-chip.fx-none{font-size:11px!important;color:#fff!important;font-weight:800!important;}';
    document.head.appendChild(st);
  }

  function hideOldSystems() {
    var pro = document.getElementById('tchiloFxProBar');
    if (pro) {
      pro.style.display = 'none';
      var prev = pro.previousElementSibling;
      if (prev && prev.textContent && /lentes|pro/i.test(prev.textContent)) prev.style.display = 'none';
    }
  }

  function buildChips(force) {
    injectCSS();
    hideOldSystems();
    var bar = document.getElementById('tchiloFxChips');
    if (!bar) return;
    if (chipsBuilt && !force && bar.querySelector('.fx-png-chip')) return;

    bar.innerHTML = '';
    chipsBuilt = true;

    FX.forEach(function (fx, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fx-chip fx-png-chip' + (i === 0 ? ' active fx-none' : '');
      b.setAttribute('data-label', fx.label);
      b.setAttribute('aria-label', fx.label);
      b.title = fx.label;
      if (fx.file) {
        var src = assetSrc(fx.file);
        if (src) {
          var img = document.createElement('img');
          img.alt = fx.label;
          img.src = src;
          b.appendChild(img);
        } else {
          b.textContent = fx.label.slice(0, 6);
          b.classList.add('fx-none');
        }
      } else {
        b.textContent = 'Normal';
      }
      b.onclick = function () {
        pngIndex = i;
        window.__tchiloPngFxIndex = i;
        document.querySelectorAll('#tchiloFxChips .fx-png-chip').forEach(function (c) {
          c.classList.toggle('active', c === b);
        });
      };
      bar.appendChild(b);
    });
  }

  function ensureLm() {
    if (ownLm) return Promise.resolve(ownLm);
    return (async function () {
      try {
        var vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
        var fileset = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        try {
          ownLm = await vision.FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1
          });
        } catch (e) {
          ownLm = await vision.FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1
          });
        }
      } catch (e2) {
        console.warn('fx-png landmarker', e2);
      }
      return ownLm;
    })();
  }

  function paintPng() {
    var root = document.getElementById('tchiloFaceFx');
    if (!root || !root.classList.contains('open')) return;
    if (pngIndex === 0) return;

    var video = document.getElementById('tchiloFxVideo');
    var canvas = document.getElementById('tchiloFxCanvas');
    if (!video || !canvas || video.readyState < 2) return;

    var vw = video.videoWidth || 640;
    var vh = video.videoHeight || 480;
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }

    var now = performance.now();
    if (ownLm && now - lastT > 40) {
      lastT = now;
      try {
        var res = ownLm.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks.length) lastLm = res.faceLandmarks;
      } catch (e) {}
    }
    if (!lastLm) return;

    var w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    var ctx = canvas.getContext('2d');
    var facingUser = !root.classList.contains('fx-env');

    ctx.save();
    if (facingUser) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    drawPng(ctx, lastLm, w, h);
    ctx.restore();
  }

  function runOverlay() {
    requestAnimationFrame(runOverlay);
    hideOldSystems();
    paintPng();
    setTimeout(paintPng, 0);
  }

  function neutralizeOldDrawers() {
    hideOldSystems();
    var bar = document.getElementById('tchiloFxChips');
    if (bar) {
      var hasOld = false;
      bar.querySelectorAll('.fx-chip').forEach(function (c) {
        if (!c.classList.contains('fx-png-chip')) hasOld = true;
      });
      if (hasOld || !bar.querySelector('.fx-png-chip')) {
        chipsBuilt = false;
        buildChips(true);
      }
    }
  }

  function onOpen() {
    loadImages();
    ensureLm();
    chipsBuilt = false;
    buildChips(true);
    hideOldSystems();
    setTimeout(function () { buildChips(true); hideOldSystems(); }, 200);
    setTimeout(function () { buildChips(true); hideOldSystems(); }, 800);
  }

  function boot() {
    injectCSS();
    loadImages();
    ensureLm();
    runOverlay();

    setInterval(neutralizeOldDrawers, 1200);

    var root = document.getElementById('tchiloFaceFx');
    if (root) {
      new MutationObserver(function () {
        if (root.classList.contains('open')) onOpen();
      }).observe(root, { attributes: true, attributeFilter: ['class'] });
      if (root.classList.contains('open')) onOpen();
    }

    try {
      new MutationObserver(function () {
        if (document.getElementById('tchiloFxChips')) {
          if (document.getElementById('tchiloFaceFx') &&
              document.getElementById('tchiloFaceFx').classList.contains('open')) {
            onOpen();
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}

    setTimeout(onOpen, 1000);
    setTimeout(onOpen, 2500);
  }

  window.__tchiloPngFxIndex = 0;
  window.__tchiloPngFxList = FX;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
