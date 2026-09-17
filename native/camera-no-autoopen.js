/**
 * tchilo-Pop — o botão + NÃO abre a câmara de imediato
 * Abre o ecrã Criar; a câmara só quando o utilizador toca em "Foto ou vídeo".
 */
(function () {
  'use strict';

  function ensureCreateMediaBtn() {
    var screen =
      document.getElementById('screen-create') ||
      document.querySelector('[data-screen="create"], #createScreen');
    if (!screen) return;

    if (document.getElementById('tchiloOpenCamBtn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tchiloOpenCamBtn';
    btn.className = 'gallery-btn tchilo-keep';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M4 8h3l2-2h6l2 2h3v12H4V8z"/><circle cx="12" cy="13" r="3.5"/></svg>' +
      '<span>Foto ou vídeo</span>';
    btn.style.cssText =
      'display:inline-flex;align-items:center;justify-content:center;gap:8px;' +
      'width:100%;max-width:320px;margin:12px auto;padding:14px 18px;' +
      'border:2px solid var(--ink,#0B0B0C);border-radius:16px;' +
      'background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);' +
      'font-weight:800;font-size:15px;cursor:pointer;';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.tchiloOpenCamera === 'function') window.tchiloOpenCamera();
      else if (typeof window.openFaceEffects === 'function') window.openFaceEffects();
    };

    var preview =
      document.getElementById('createPreview') ||
      screen.querySelector('.create-preview, .media-preview');
    if (preview && preview.parentNode) {
      preview.parentNode.insertBefore(btn, preview.nextSibling);
    } else {
      var actions = screen.querySelector('.create-media-actions, .media-actions') || screen;
      actions.appendChild(btn);
    }
  }

  function stripAutoOpen() {
    // Re-wrap goTo sem abrir câmara
    if (typeof window.goTo === 'function') {
      var current = window.goTo;
      // Se já foi patchado pelo camera-tiktok, desfaz o auto-open
      window.goTo = function (screen) {
        var r = current.apply(this, arguments);
        try {
          if (screen === 'create' || screen === 'screen-create') {
            // NÃO abrir câmara — só preparar UI do create
            setTimeout(function () {
              try {
                if (typeof window.tchiloCloseCamera === 'function') window.tchiloCloseCamera();
              } catch (e) {}
              ensureCreateMediaBtn();
              // esconder botões antigos duplicados
              var fx = document.getElementById('faceFxOpenBtn');
              if (fx) fx.style.display = 'none';
              var gal = document.getElementById('galleryBtn');
              if (gal) gal.style.display = 'none';
            }, 30);
          }
        } catch (e2) {}
        return r;
      };
    }

    // Remove listeners de auto-open em botões + (não dá para remover anónimos;
    // bloqueamos com capture que fecha a cam se abriu por engano)
    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target && ev.target.closest
          ? ev.target.closest(
              '[data-screen="create"], #navCreate, .nav-create, button[aria-label*="Criar"]'
            )
          : null;
        if (!t) return;
        // depois do click do camera-tiktok, fecha se abriu
        setTimeout(function () {
          var cam = document.getElementById('tchiloCam');
          if (cam && cam.classList.contains('open')) {
            // só fecha se ainda não há media a ser entregue neste instante
            // e o ecrã create está visível
            var create =
              document.getElementById('screen-create') ||
              document.querySelector('.screen-create.active, #screen-create.active');
            if (create || true) {
              try {
                if (typeof window.tchiloCloseCamera === 'function') window.tchiloCloseCamera();
              } catch (e) {}
            }
          }
          ensureCreateMediaBtn();
        }, 80);
      },
      true
    );
  }

  function boot() {
    stripAutoOpen();
    ensureCreateMediaBtn();
    setTimeout(stripAutoOpen, 400);
    setTimeout(ensureCreateMediaBtn, 600);
    setTimeout(stripAutoOpen, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
