/**
 * tchilo-Pop — Câmara: abre efeitos faciais (MediaPipe) + fallback TikTok UI
 * Efeitos aparecem na cara via openFaceEffects / face-effects.js
 */
(function () {
  'use strict';

  function ensureCreateEntryBtn() {
    if (document.getElementById('tchiloOpenCamBtn')) return;
    var screen = document.getElementById('screen-create');
    if (!screen) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tchiloOpenCamBtn';
    btn.className = 'gallery-btn tchilo-keep';
    btn.innerHTML = '<span>Foto ou vídeo</span>';
    btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;gap:8px;width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;border:2px solid var(--ink,#0B0B0C);border-radius:16px;background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);font-weight:800;font-size:15px;cursor:pointer;box-sizing:border-box;';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Preferir câmara com efeitos faciais (MediaPipe)
      if (typeof window.openFaceEffects === 'function') {
        window.openFaceEffects();
        return;
      }
      if (typeof window.tchiloOpenCamera === 'function' && window.tchiloOpenCamera !== openCam) {
        window.tchiloOpenCamera();
      }
    };
    var preview = document.getElementById('createPreview');
    if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
    else screen.appendChild(btn);
  }

  function openCam() {
    if (typeof window.openFaceEffects === 'function') {
      window.openFaceEffects();
      return;
    }
  }

  function closeCam() {
    if (typeof window.closeFaceEffects === 'function') window.closeFaceEffects();
  }

  function hookCreateScreen() {
    // Manter botão de efeitos visível
    var fx = document.getElementById('faceFxOpenBtn');
    if (fx) fx.style.display = '';
    ensureCreateEntryBtn();
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloCamFx) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        if (screen === 'create' || screen === 'screen-create') {
          setTimeout(ensureCreateEntryBtn, 30);
          setTimeout(function () {
            var fx2 = document.getElementById('faceFxOpenBtn');
            if (fx2) fx2.style.display = '';
          }, 40);
        }
        return r;
      };
      window.goTo.__tchiloCamFx = true;
    }
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloCloseCamera = closeCam;

  function boot() {
    hookCreateScreen();
    setTimeout(hookCreateScreen, 500);
    setTimeout(hookCreateScreen, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
