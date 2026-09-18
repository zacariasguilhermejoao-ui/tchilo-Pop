/**
 * tchilo-Pop — Câmara única: só o botão "Foto ou vídeo"
 * Abre efeitos faciais MediaPipe (openFaceEffects)
 */
(function () {
  'use strict';

  function hideExtraButtons() {
    var fx = document.getElementById('faceFxOpenBtn');
    if (fx) {
      fx.style.display = 'none';
      fx.setAttribute('hidden', 'true');
      fx.setAttribute('aria-hidden', 'true');
    }
    // Não esconder galleryBtn se o utilizador ainda precisar da galeria nativa
    // — só o botão duplicado de efeitos
  }

  function ensureCreateEntryBtn() {
    if (document.getElementById('tchiloOpenCamBtn')) {
      hideExtraButtons();
      return;
    }
    var screen = document.getElementById('screen-create');
    if (!screen) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tchiloOpenCamBtn';
    btn.className = 'gallery-btn tchilo-keep';
    btn.innerHTML = '<span>Foto ou vídeo</span>';
    btn.style.cssText =
      'display:inline-flex;align-items:center;justify-content:center;gap:8px;width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;border:2px solid var(--ink,#0B0B0C);border-radius:16px;background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);font-weight:800;font-size:15px;cursor:pointer;box-sizing:border-box;';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openFaceEffects === 'function') {
        window.openFaceEffects();
        return;
      }
    };
    var preview = document.getElementById('createPreview');
    if (preview && preview.parentNode) preview.parentNode.insertBefore(btn, preview.nextSibling);
    else screen.appendChild(btn);
    hideExtraButtons();
  }

  function openCam() {
    if (typeof window.openFaceEffects === 'function') window.openFaceEffects();
  }

  function closeCam() {
    if (typeof window.closeFaceEffects === 'function') window.closeFaceEffects();
  }

  function injectHideCss() {
    if (document.getElementById('tchiloHideFaceFxBtn')) return;
    var st = document.createElement('style');
    st.id = 'tchiloHideFaceFxBtn';
    st.textContent = '#faceFxOpenBtn{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;pointer-events:none!important;}';
    document.head.appendChild(st);
  }

  function hookCreateScreen() {
    injectHideCss();
    hideExtraButtons();
    ensureCreateEntryBtn();
    if (typeof window.goTo === 'function' && !window.goTo.__tchiloCamFx) {
      var orig = window.goTo;
      window.goTo = function (screen) {
        var r = orig.apply(this, arguments);
        if (screen === 'create' || screen === 'screen-create') {
          setTimeout(function () {
            injectHideCss();
            hideExtraButtons();
            ensureCreateEntryBtn();
          }, 30);
        }
        return r;
      };
      window.goTo.__tchiloCamFx = true;
    }
  }

  // Impedir face-effects de recriar o botão
  function blockFaceFxInject() {
    var obs = new MutationObserver(function () {
      hideExtraButtons();
    });
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }

  window.tchiloOpenCamera = openCam;
  window.tchiloCloseCamera = closeCam;

  function boot() {
    injectHideCss();
    hookCreateScreen();
    blockFaceFxInject();
    setTimeout(hookCreateScreen, 500);
    setTimeout(hookCreateScreen, 1500);
    setTimeout(hideExtraButtons, 2000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
