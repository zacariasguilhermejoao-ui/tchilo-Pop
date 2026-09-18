/**
 * tchilo-Pop — Câmara estável: efeitos + botão de foto SEMPRE visíveis
 */
(function () {
  'use strict';

  var FX = [
    { label: 'Normal', file: null },
    { label: 'Thug Life', file: 'oculos_pixel_thug_life.png', anchor: 'eyes', scale: 2.55, oy: 0.02 },
    { label: 'Estrela', file: 'oculos_estrela_rosa.png', anchor: 'eyes', scale: 2.45, oy: 0 },
    { label: 'Nerd', file: 'oculos_nerd_laco_rosa.png', anchor: 'eyes', scale: 2.5, oy: -0.02 },
    { label: 'Prata', file: 'oculos_prata_esportivo.png', anchor: 'eyes', scale: 2.5, oy: 0 },
    { label: 'Gato', file: 'orelha_gato_laco_bigodes.png', anchor: 'face', scale: 1.95, oy: -0.08 },
    { label: 'Coroa', file: 'coroa_dourada.png', anchor: 'forehead', scale: 1.35, oy: -0.22 },
    { label: 'Chifres', file: 'chifres_demonio.png', anchor: 'forehead', scale: 1.45, oy: -0.35 },
    { label: 'Boné', file: 'bone_rosa_dodgers.png', anchor: 'forehead', scale: 1.55, oy: -0.18 },
    { label: 'Bob', file: 'peruca_bob_franja.png', anchor: 'hair', scale: 2.05, oy: -0.12 },
    { label: 'Afro', file: 'cabelo_afro.png', anchor: 'hair', scale: 2.25, oy: -0.15 },
    { label: 'Dreads', file: 'dreadlocks_bicolor.png', anchor: 'hair', scale: 2.15, oy: -0.08 },
    { label: 'Topo', file: 'cabelo_topo_liso.png', anchor: 'hair', scale: 1.9, oy: -0.2 },
    { label: 'Beijo', file: 'labios_beijo_rosa.png', anchor: 'mouth', scale: 1.35, oy: 0.02 },
    { label: 'Gloss', file: 'labios_gloss_vermelho.png', anchor: 'mouth', scale: 1.3, oy: 0.02 },
    { label: 'Dentes', file: 'mascara_boca_dentes.png', anchor: 'mouth', scale: 1.55, oy: 0.05 },
    { label: 'Spider', file: 'mascara_spiderman.png', anchor: 'face', scale: 1.85, oy: -0.02 },
    { label: 'Robô', file: 'cabeca_robo_metal.png', anchor: 'face', scale: 1.9, oy: -0.04 }
  ];

  var imgs = {};
  var fxIndex = 0;
  var camStream = null;
  var facing = 'user';
  var landmarker = null;
  var lastLm = null;
  var lastDetect = 0;
  var loopOn = false;

  function asset(file) {
    var A = window.TchiloFxPngAssets || {};
    return A[file] || null;
  }

  function loadImgs() {
    FX.forEach(function (fx) {
      if (!fx.file || imgs[fx.file]) return;
      var src = asset(fx.file);
      if (!src) return;
      var im = new Image();
      im.onload = function () {
        imgs[fx.file] = im;
        // atualizar ícone no chip se já existir
        var chip = document.querySelector('#tscTrack .chip[data-file="' + fx.file + '"]');
        if (chip && !chip.querySelector('img')) {
          chip.innerHTML = '';
          var img = document.createElement('img');
          img.src = src;
          img.alt = fx.label;
          chip.appendChild(img);
          chip.classList.remove('none');
        }
      };
      im.src = src;
    });
  }

  function injectCSS() {
    var st = document.getElementById('tchiloStableCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloStableCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#galleryBtn,#faceFxOpenBtn{display:none!important;}' +
      '#screen-create .gallery-btn:not(#tchiloOpenCamBtn):not(.tchilo-keep):not(#removeMediaBtn){display:none!important;}' +
      '#tchiloOpenCamBtn{display:inline-flex!important;z-index:60!important;}' +
      /* câmara: layout em coluna — vídeo em cima, controlos FIXOS em baixo */
      '#tchiloStableCam{display:none;position:fixed;inset:0;z-index:2147483646;background:#000;' +
      'flex-direction:column;box-sizing:border-box;}' +
      '#tchiloStableCam.on{display:flex!important;}' +
      '#tchiloStableCam .stage{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;background:#111;}' +
      '#tchiloStableCam video,#tchiloStableCam canvas{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;}' +
      '#tchiloStableCam.mir video{transform:scaleX(-1);}' +
      '#tchiloStableCam canvas{z-index:2;pointer-events:none;}' +
      '#tchiloStableCam .tb{position:absolute;top:0;left:0;right:0;z-index:10;' +
      'display:flex;justify-content:space-between;padding:calc(10px + env(safe-area-inset-top)) 12px 8px;}' +
      '#tchiloStableCam .tb button{width:44px;height:44px;border:0;border-radius:50%;' +
      'background:rgba(0,0,0,.45);color:#fff;font-size:22px;font-weight:800;}' +
      /* barra de baixo NÃO dentro do vídeo — flex item fixo */
      '#tchiloStableCam .bot{' +
      'flex:0 0 auto;position:relative;z-index:20;' +
      'background:#0a0a0a;padding:10px 0 calc(12px + env(safe-area-inset-bottom));' +
      'display:flex;flex-direction:column;align-items:center;gap:10px;' +
      'border-top:1px solid rgba(255,255,255,.12);}' +
      '#tchiloStableCam .msg{color:#c8f560;font-size:12px;font-weight:600;min-height:16px;}' +
      '#tchiloStableCam .track{display:flex;gap:12px;width:100%;max-width:100vw;' +
      'padding:4px 16px;overflow-x:auto;-webkit-overflow-scrolling:touch;' +
      'height:72px;align-items:center;scrollbar-width:none;box-sizing:border-box;}' +
      '#tchiloStableCam .track::-webkit-scrollbar{display:none;}' +
      '#tchiloStableCam .chip{flex:0 0 60px;width:60px;height:60px;border-radius:50%;' +
      'border:2.5px solid rgba(255,255,255,.45);background:#222;overflow:hidden;' +
      'padding:0;opacity:.85;color:#fff;font-size:10px;font-weight:800;' +
      'display:flex;align-items:center;justify-content:center;}' +
      '#tchiloStableCam .chip.active{opacity:1;border-color:#c8f560;' +
      'box-shadow:0 0 0 3px rgba(200,245,96,.4);transform:scale(1.08);}' +
      '#tchiloStableCam .chip img{width:100%;height:100%;object-fit:cover;pointer-events:none;}' +
      '#tchiloStableCam .bb{display:flex;justify-content:center;align-items:center;gap:28px;width:100%;padding:4px 0;}' +
      '#tchiloStableCam .sh{width:74px;height:74px;border-radius:50%;border:4px solid #fff;' +
      'background:#fff;flex-shrink:0;box-shadow:0 2px 12px rgba(0,0,0,.4);}' +
      '#tchiloStableCam .flipb{width:48px;height:48px;border-radius:50%;border:0;' +
      'background:rgba(255,255,255,.2);color:#fff;font-size:20px;flex-shrink:0;}' +
      '#tchiloStableCam .spacer{width:48px;flex-shrink:0;}' +
      '#feedList .post{animation:none!important;}';
  }

  function hardenFeed() {
    if (typeof window.renderFeed !== 'function' || window.renderFeed.__stable) return;
    var orig = window.renderFeed;
    var lastAt = 0;
    var lastSig = '';
    var timer = null;
    window.renderFeed = function (force) {
      var now = Date.now();
      try {
        var posts = typeof getPosts === 'function' ? getPosts() : [];
        var sig = (posts || [])
          .map(function (p) {
            return (p && p.id) || '';
          })
          .join('|');
        if (!force && sig === lastSig && now - lastAt < 1200) return;
        if (!force && now - lastAt < 800) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(function () {
            window.renderFeed(true);
          }, 800);
          return;
        }
        lastSig = sig;
        lastAt = now;
      } catch (e) {
        lastAt = now;
      }
      return orig.apply(this, arguments);
    };
    window.renderFeed.__stable = true;
    window.renderFeed.__noflicker = true;
  }

  function buildChips() {
    var track = document.getElementById('tscTrack');
    if (!track) return;
    loadImgs();
    track.innerHTML = '';
    FX.forEach(function (fx, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (i === fxIndex ? ' active' : '') + (!fx.file ? ' none' : '');
      b.title = fx.label;
      if (fx.file) b.setAttribute('data-file', fx.file);
      if (fx.file) {
        var src = asset(fx.file);
        if (src) {
          var img = document.createElement('img');
          img.src = src;
          img.alt = fx.label;
          b.appendChild(img);
        } else {
          b.textContent = fx.label;
          b.classList.add('none');
        }
      } else {
        b.textContent = 'Normal';
      }
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        fxIndex = i;
        track.querySelectorAll('.chip').forEach(function (c, j) {
          c.classList.toggle('active', j === i);
        });
      };
      track.appendChild(b);
    });
  }

  function ensureCamUI() {
    var el = document.getElementById('tchiloStableCam');
    if (el) {
      buildChips();
      return el;
    }
    el = document.createElement('div');
    el.id = 'tchiloStableCam';
    el.className = 'mir';
    el.innerHTML =
      '<div class="stage">' +
      '<video id="tscVideo" playsinline muted autoplay></video>' +
      '<canvas id="tscCanvas"></canvas>' +
      '<div class="tb">' +
      '<button type="button" id="tscClose">×</button>' +
      '<button type="button" id="tscFlipTop">↺</button>' +
      '</div></div>' +
      '<div class="bot">' +
      '<div class="msg" id="tscMsg">A abrir câmara…</div>' +
      '<div class="track" id="tscTrack"></div>' +
      '<div class="bb">' +
      '<div class="spacer"></div>' +
      '<button type="button" class="sh" id="tscSnap" aria-label="Tirar foto"></button>' +
      '<button type="button" class="flipb" id="tscFlip">↺</button>' +
      '</div></div>';
    document.body.appendChild(el);

    document.getElementById('tscClose').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeCam();
    };
    function doFlip(e) {
      e.preventDefault();
      facing = facing === 'user' ? 'environment' : 'user';
      el.classList.toggle('mir', facing === 'user');
      startCam();
    }
    document.getElementById('tscFlip').onclick = doFlip;
    document.getElementById('tscFlipTop').onclick = doFlip;
    document.getElementById('tscSnap').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      snap();
    };
    buildChips();
    return el;
  }

  function setMsg(t) {
    var m = document.getElementById('tscMsg');
    if (m) m.textContent = t || '';
  }

  function stopStreamOnly() {
    if (camStream) {
      camStream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
      camStream = null;
    }
  }

  function closeCam() {
    loopOn = false;
    stopStreamOnly();
    var el = document.getElementById('tchiloStableCam');
    if (el) {
      el.classList.remove('on');
      el.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  async function ensureLm() {
    if (landmarker) return landmarker;
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
        landmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
      } catch (e) {
        opts.baseOptions.delegate = 'CPU';
        landmarker = await vision.FaceLandmarker.createFromOptions(fileset, opts);
      }
    } catch (e2) {}
    return landmarker;
  }

  function pt(L, i, w, h) {
    var p = L[i];
    return { x: p.x * w, y: p.y * h };
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function drawFx(ctx, landmarks, w, h) {
    var fx = FX[fxIndex];
    if (!fx || !fx.file || !landmarks || !landmarks.length) return;
    var im = imgs[fx.file];
    if (!im || !im.complete || !im.naturalWidth) return;
    if (typeof window.__tchiloBetterDrawFx === 'function') {
      window.__tchiloBetterDrawFx(ctx, landmarks, w, h, fx, im);
      return;
    }
    var L = landmarks[0];
    var le = pt(L, 33, w, h),
      re = pt(L, 263, w, h),
      top = pt(L, 10, w, h),
      chin = pt(L, 152, w, h),
      cL = pt(L, 234, w, h),
      cR = pt(L, 454, w, h),
      mL = pt(L, 61, w, h),
      mR = pt(L, 291, w, h),
      lipU = pt(L, 13, w, h),
      lipD = pt(L, 14, w, h);
    var eyeW = dist(le, re) || 1;
    var faceW = dist(cL, cR) || eyeW * 2.1;
    var faceH = dist(top, chin) || faceW * 1.25;
    var angle = Math.atan2(re.y - le.y, re.x - le.x);
    var midE = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
    var mouth = { x: (mL.x + mR.x) / 2, y: (lipU.y + lipD.y) / 2 };
    var center = { x: (cL.x + cR.x) / 2, y: (top.y + chin.y) / 2 };
    var cx = midE.x,
      cy = midE.y,
      tw = eyeW * (fx.scale || 2.4);
    if (fx.anchor === 'eyes') {
      cx = midE.x;
      cy = midE.y + eyeW * (fx.oy || 0);
      tw = eyeW * (fx.scale || 2.4);
    } else if (fx.anchor === 'forehead') {
      cx = top.x;
      cy = top.y + faceH * (fx.oy || -0.2);
      tw = faceW * (fx.scale || 1.4);
    } else if (fx.anchor === 'hair') {
      cx = center.x;
      cy = top.y + faceH * (fx.oy || -0.12);
      tw = faceW * (fx.scale || 2);
    } else if (fx.anchor === 'mouth') {
      var mw = dist(mL, mR) || eyeW * 0.55;
      cx = mouth.x;
      cy = mouth.y + mw * (fx.oy || 0);
      tw = mw * (fx.scale || 1.4);
    } else {
      cx = center.x;
      cy = center.y + faceH * (fx.oy || 0);
      tw = faceW * (fx.scale || 1.85);
    }
    var th = tw * (im.naturalHeight / Math.max(1, im.naturalWidth));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(im, -tw / 2, -th / 2, tw, th);
    ctx.restore();
  }

  function paintLoop() {
    if (!loopOn) return;
    requestAnimationFrame(paintLoop);
    var root = document.getElementById('tchiloStableCam');
    if (!root || !root.classList.contains('on')) return;
    var video = document.getElementById('tscVideo');
    var canvas = document.getElementById('tscCanvas');
    if (!video || !canvas || video.readyState < 2) return;
    var w = video.videoWidth || 640,
      h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (fxIndex === 0) return;
    var now = performance.now();
    if (landmarker && now - lastDetect > 28) {
      lastDetect = now;
      try {
        var res = landmarker.detectForVideo(video, now);
        if (res && res.faceLandmarks && res.faceLandmarks.length) lastLm = res.faceLandmarks;
      } catch (e) {}
    }
    if (!lastLm) return;
    ctx.save();
    if (facing === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    drawFx(ctx, lastLm, w, h);
    ctx.restore();
  }

  function startCam() {
    stopStreamOnly();
    loopOn = true;
    var video = document.getElementById('tscVideo');
    if (!video) return;
    setMsg('A abrir câmara…');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg('Câmara indisponível');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      .then(function (s) {
        camStream = s;
        video.srcObject = s;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.play().catch(function () {});
        setMsg('Desliza efeitos · Toque no círculo branco');
        ensureLm();
        loadImgs();
        buildChips();
        paintLoop();
      })
      .catch(function (err) {
        console.warn(err);
        setMsg('Permite a CÂMARA nas definições');
      });
  }

  function snap() {
    var video = document.getElementById('tscVideo');
    var overlay = document.getElementById('tscCanvas');
    if (!video || video.readyState < 2) {
      setMsg('Aguarda a câmara…');
      return;
    }
    var w = video.videoWidth || 720;
    var h = video.videoHeight || 1280;
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');
    if (facing === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    if (overlay && overlay.width) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (facing === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(overlay, 0, 0, w, h);
    }
    c.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var file;
      try {
        file = new File([blob], 'tchilo.jpg', { type: 'image/jpeg' });
      } catch (e) {
        file = blob;
        file.name = 'tchilo.jpg';
      }
      closeCam();
      try {
        window.createMediaData = {
          type: 'image',
          items: [{ type: 'image', url: url, name: 'tchilo.jpg', file: file }],
          files: [file]
        };
        window.createMediaFiles = [file];
      } catch (e2) {}
      if (typeof window.tchiloDeliverFaceFxPhoto === 'function') {
        try {
          window.tchiloDeliverFaceFxPhoto(file, url);
          return;
        } catch (e3) {}
      }
      if (typeof window.tchiloOpenMediaEditor === 'function') {
        try {
          window.tchiloOpenMediaEditor({ mode: 'post', mediaType: 'image', src: url, file: file });
          return;
        } catch (e4) {}
      }
      if (typeof goTo === 'function') goTo('create');
    }, 'image/jpeg', 0.92);
  }

  function openCam() {
    injectCSS();
    loadImgs();
    var el = ensureCamUI();
    buildChips();
    el.classList.add('on');
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.zIndex = '2147483646';
    document.body.style.overflow = 'hidden';
    // fechar outras câmaras sobrepostas
    ['tchiloCam', 'tchiloCamLive', 'tchiloFaceFx'].forEach(function (id) {
      var x = document.getElementById(id);
      if (x) {
        x.style.display = 'none';
        x.classList.remove('open', 'on');
      }
    });
    startCam();
    setTimeout(buildChips, 300);
    setTimeout(buildChips, 1000);
    setTimeout(buildChips, 2500);
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloOpenCameraNow = openCam;
  window.tchiloCloseCamera = closeCam;

  function ensureBtn() {
    injectCSS();
    var screen = document.getElementById('screen-create');
    if (!screen) return;
    var gal = document.getElementById('galleryBtn');
    if (gal) gal.style.display = 'none';
    var fx = document.getElementById('faceFxOpenBtn');
    if (fx) fx.style.display = 'none';
    var btn = document.getElementById('tchiloOpenCamBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloOpenCamBtn';
      btn.className = 'gallery-btn tchilo-keep';
      btn.innerHTML = '<span>Foto ou vídeo</span>';
      btn.style.cssText =
        'display:inline-flex!important;align-items:center;justify-content:center;' +
        'width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;' +
        'border:2px solid #0B0B0C;border-radius:16px;background:#c8f560;color:#0B0B0C;' +
        'font-weight:800;font-size:15px;cursor:pointer;z-index:60;';
      var preview = document.getElementById('createPreview');
      if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
      else {
        var body = screen.querySelector('.create-body') || screen;
        body.insertBefore(btn, body.firstChild);
      }
    }
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCam();
    };
  }

  document.addEventListener(
    'click',
    function (ev) {
      var t = ev.target;
      if (!t) return;
      var btn = t.closest ? t.closest('#tchiloOpenCamBtn') : null;
      if (!btn) {
        var txt = ((t.textContent || '') + '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (txt.indexOf('foto ou vídeo') >= 0 || txt.indexOf('foto ou video') >= 0) {
          btn = t.closest('button') || t;
        }
      }
      if (!btn) return;
      // não capturar cliques DENTRO da câmara
      if (t.closest && t.closest('#tchiloStableCam')) return;
      ev.preventDefault();
      ev.stopPropagation();
      openCam();
    },
    true
  );

  function boot() {
    injectCSS();
    hardenFeed();
    loadImgs();
    ensureBtn();
    [100, 600, 2000].forEach(function (ms) {
      setTimeout(function () {
        injectCSS();
        ensureBtn();
        loadImgs();
      }, ms);
    });
    if (typeof window.goTo === 'function' && !window.goTo.__stableCam) {
      var orig = window.goTo;
      window.goTo = function (s) {
        var r = orig.apply(this, arguments);
        if (s === 'create' || s === 'screen-create') {
          setTimeout(ensureBtn, 30);
          setTimeout(ensureBtn, 150);
        }
        return r;
      };
      window.goTo.__stableCam = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
