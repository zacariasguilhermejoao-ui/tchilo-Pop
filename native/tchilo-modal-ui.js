/**
 * Tchilo — modais limpos (estilo presentes)
 * v2 — 1 handle só, sem riscos pretos
 */
(function () {
  'use strict';
  if (window.__tchiloModalUiV2) return;
  window.__tchiloModalUiV2 = true;
  window.__tchiloModalUiV1 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloModalUiCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloModalUiCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.sheet{background:rgba(11,11,12,.45)!important;}' +
      '.sheet.open{display:flex!important;align-items:flex-end!important;justify-content:center!important;}' +
      '.sheet .sheet-panel,.sheet-panel,' +
      '#tchiloProfileShareSheet .tchilo-ps-panel,' +
      '#tchiloGiftSheet .panel,' +
      '#tchiloMusicFallback .panel,' +
      '#tchiloPostMusicSheet .panel,' +
      '[id*="Music"] .panel,' +
      '.tchilo-ps-panel{' +
      'width:100%!important;max-width:480px!important;' +
      'background:var(--paper,#F6F1E7)!important;color:var(--ink,#0B0B0C)!important;' +
      'border:0!important;border-top:0!important;border-bottom:0!important;' +
      'border-left:0!important;border-right:0!important;' +
      'outline:0!important;box-shadow:0 -8px 32px rgba(0,0,0,.12)!important;' +
      'border-radius:20px 20px 0 0!important;' +
      'padding-bottom:calc(12px + env(safe-area-inset-bottom))!important;}' +
      '.sheet-handle,.tchilo-modal-handle,.tchilo-ps-handle,' +
      '#tchiloGiftSheet .handle,.handle{' +
      'width:40px!important;height:4px!important;background:#c8c5bc!important;' +
      'border-radius:2px!important;margin:10px auto 8px!important;' +
      'display:block!important;border:0!important;}' +
      /* esconder 2º handle */
      '.sheet-panel > .sheet-handle ~ .sheet-handle,' +
      '.sheet-panel > .tchilo-modal-handle ~ .tchilo-modal-handle,' +
      '.tchilo-ps-panel > .tchilo-ps-handle ~ .tchilo-ps-handle,' +
      '.tchilo-ps-panel > .sheet-handle,' +
      '.tchilo-ps-panel > .tchilo-modal-handle,' +
      '.panel > .handle ~ .handle,' +
      '.panel > .sheet-handle,' +
      '.panel > .tchilo-modal-handle{' +
      'display:none!important;height:0!important;margin:0!important;overflow:hidden!important;}' +
      '.sheet-title,.sheet .sheet-title{' +
      'border-bottom:1px solid rgba(11,11,12,.08)!important;border-top:0!important;' +
      'font-weight:900!important;padding:4px 18px 12px!important;}' +
      '.sheet-list button,.sheet .sheet-list button,.sheet-list .sheet-item,' +
      '.share-opt,.sheet .share-opt{' +
      'border-bottom:1px solid rgba(11,11,12,.06)!important;' +
      'border-top:0!important;border-left:0!important;border-right:0!important;}' +
      '.sheet input,.sheet textarea,' +
      '[id*="Sheet"] input:not(#loginForm input):not(#signupForm input),' +
      '.sheet-panel input,.sheet-panel textarea{' +
      'border:1px solid rgba(11,11,12,.12)!important;' +
      'box-shadow:none!important;outline:none!important;}' +
      '.sheet button.cancel,.sheet .cancel,button[data-a="cancel"],' +
      '[id*="Music"] button.cancel,.music-use-sheet .cancel{' +
      'background:transparent!important;color:#0B0B0C!important;' +
      'border:1px solid rgba(11,11,12,.12)!important;box-shadow:none!important;' +
      'font-weight:800!important;}' +
      '#tchiloMusicFallback .panel,' +
      '#tchiloPostMusicSheet .panel,' +
      '[id*="Music"] .panel,' +
      '#tchiloGiftSheet .panel,' +
      '.tchilo-ps-panel,' +
      '#tchiloProfileShareSheet .tchilo-ps-panel{' +
      'border:0!important;border-top:0!important;' +
      'border-radius:20px 20px 0 0!important;' +
      'box-shadow:0 -8px 32px rgba(0,0,0,.12)!important;}' +
      /* botões primários em sheets → preto (exceto ecrãs de auth) */
      '.sheet .sheet-panel button.primary,' +
      '.sheet-panel > .actions button:last-child:not(.cancel):not(.ghost){' +
      'background:#0B0B0C!important;color:#fff!important;border:0!important;}';
  }

  function dedupeHandles(root) {
    try {
      var handles = root.querySelectorAll(
        '.sheet-handle, .tchilo-modal-handle, .tchilo-ps-handle, .handle'
      );
      if (handles.length <= 1) return;
      for (var i = 1; i < handles.length; i++) {
        try {
          handles[i].style.display = 'none';
        } catch (e) {}
      }
    } catch (e2) {}
  }

  function ensureHandle(panel) {
    if (!panel) return;
    try {
      var existing = panel.querySelector(
        '.sheet-handle, .tchilo-modal-handle, .tchilo-ps-handle, .handle'
      );
      if (existing) {
        dedupeHandles(panel);
        return;
      }
      var h = document.createElement('div');
      h.className = 'sheet-handle tchilo-modal-handle';
      h.setAttribute('aria-hidden', 'true');
      panel.insertBefore(h, panel.firstChild);
    } catch (e) {}
  }

  function polish() {
    injectCSS();
    try {
      document
        .querySelectorAll(
          '.sheet .sheet-panel, .sheet-panel, #tchiloGiftSheet .panel, #tchiloMusicFallback .panel, #tchiloProfileShareSheet .tchilo-ps-panel, .tchilo-ps-panel'
        )
        .forEach(function (p) {
          ensureHandle(p);
          dedupeHandles(p);
        });
    } catch (e) {}
  }

  injectCSS();
  polish();
  [300, 1000, 2500].forEach(function (ms) {
    setTimeout(polish, ms);
  });

  try {
    new MutationObserver(function () {
      polish();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  } catch (e) {}
})();
