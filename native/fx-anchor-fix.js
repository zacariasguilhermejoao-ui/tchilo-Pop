/**
 * tchilo-Pop — âncoras precisas dos PNG na cara (MediaPipe)
 */
(function () {
  'use strict';

  var TUNED = {
    oculos_pixel_thug_life: { anchor: 'eyes', scale: 2.55, oy: 0.02 },
    oculos_estrela_rosa: { anchor: 'eyes', scale: 2.45, oy: 0 },
    oculos_nerd_laco_rosa: { anchor: 'eyes', scale: 2.5, oy: -0.02 },
    oculos_prata_esportivo: { anchor: 'eyes', scale: 2.5, oy: 0 },
    orelha_gato_laco_bigodes: { anchor: 'face', scale: 1.95, oy: -0.08 },
    coroa_dourada: { anchor: 'forehead', scale: 1.35, oy: -0.22 },
    chifres_demonio: { anchor: 'forehead', scale: 1.45, oy: -0.35 },
    bone_rosa_dodgers: { anchor: 'forehead', scale: 1.55, oy: -0.18 },
    peruca_bob_franja: { anchor: 'hair', scale: 2.05, oy: -0.12 },
    cabelo_afro: { anchor: 'hair', scale: 2.25, oy: -0.15 },
    dreadlocks_bicolor: { anchor: 'hair', scale: 2.15, oy: -0.08 },
    cabelo_topo_liso: { anchor: 'hair', scale: 1.9, oy: -0.2 },
    labios_beijo_rosa: { anchor: 'mouth', scale: 1.35, oy: 0.02 },
    labios_gloss_vermelho: { anchor: 'mouth', scale: 1.3, oy: 0.02 },
    mascara_boca_dentes: { anchor: 'mouth', scale: 1.55, oy: 0.05 },
    mascara_spiderman: { anchor: 'face', scale: 1.85, oy: -0.02 },
    cabeca_robo_metal: { anchor: 'face', scale: 1.9, oy: -0.04 }
  };

  function applyTune() {
    var list = window.__tchiloPngFxList;
    if (!list || !list.length) return;
    list.forEach(function (fx) {
      if (!fx || !fx.file) return;
      var key = fx.file.replace(/\.png$/i, '');
      var t = TUNED[key];
      if (!t) return;
      fx.anchor = t.anchor;
      fx.scale = t.scale;
      fx.oy = t.oy;
    });
  }

  window.__tchiloBetterDrawFx = function (ctx, landmarks, w, h, fx, im) {
    if (!fx || !fx.file || !landmarks || !landmarks.length || !im) return;
    var L = landmarks[0];
    function pt(i) {
      var p = L[i];
      return { x: p.x * w, y: p.y * h };
    }
    function dist(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }
    var le = pt(33),
      re = pt(263),
      top = pt(10),
      chin = pt(152),
      cheekL = pt(234),
      cheekR = pt(454),
      mouthL = pt(61),
      mouthR = pt(291),
      lipUp = pt(13),
      lipDn = pt(14);
    var eyeW = dist(le, re) || 1;
    var faceW = dist(cheekL, cheekR) || eyeW * 2.1;
    var faceH = dist(top, chin) || faceW * 1.25;
    var angle = Math.atan2(re.y - le.y, re.x - le.x);
    var midEyes = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
    var mouthMid = { x: (mouthL.x + mouthR.x) / 2, y: (lipUp.y + lipDn.y) / 2 };
    var faceCenter = { x: (cheekL.x + cheekR.x) / 2, y: (top.y + chin.y) / 2 };
    var key = (fx.file || '').replace(/\.png$/i, '');
    var t = TUNED[key] || { anchor: fx.anchor || 'face', scale: fx.scale || 1.8, oy: fx.oy || 0 };
    var cx, cy, targetW;
    if (t.anchor === 'eyes') {
      cx = midEyes.x;
      cy = midEyes.y + eyeW * (t.oy || 0);
      targetW = eyeW * (t.scale || 2.4);
    } else if (t.anchor === 'forehead') {
      cx = top.x;
      cy = top.y + faceH * (t.oy || -0.2);
      targetW = faceW * (t.scale || 1.4);
    } else if (t.anchor === 'hair') {
      cx = faceCenter.x;
      cy = top.y + faceH * (t.oy || -0.12);
      targetW = faceW * (t.scale || 2.0);
    } else if (t.anchor === 'mouth') {
      var mw = dist(mouthL, mouthR) || eyeW * 0.55;
      cx = mouthMid.x;
      cy = mouthMid.y + mw * (t.oy || 0);
      targetW = mw * (t.scale || 1.4);
    } else {
      cx = faceCenter.x;
      cy = faceCenter.y + faceH * (t.oy || 0);
      targetW = faceW * (t.scale || 1.85);
    }
    var targetH = targetW * (im.naturalHeight / Math.max(1, im.naturalWidth));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(im, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.restore();
  };

  setInterval(applyTune, 1500);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyTune);
  else applyTune();
})();
