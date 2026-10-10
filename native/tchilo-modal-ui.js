/**
 * Tchilo — modais limpos (estilo presentes)
 * - traço cinza (handle)
 * - sem bordas pretas
 * - painel suave, cancel só onde faz sentido
 */
(function () {
  'use strict';
  if (window.__tchiloModalUiV1) return;
  window.__tchiloModalUiV1 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloModalUiCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloModalUiCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* ===== Bottom sheets globais ===== */
      '.sheet{' +
      'background:rgba(11,11,12,.45)!important;}' +
      '.sheet.open{' +
      'display:flex!important;align-items:flex-end!important;justify-content:center!important;}' +
      '.sheet .sheet-panel,' +
      '.sheet-panel{' +
      'width:100%!important;max-width:480px!important;' +
      'background:var(--paper,#F6F1E7)!important;' +
      'color:var(--ink,#0B0B0C)!important;' +
      'border:0!important;' +
      'border-top:0!important;' +
      'border-radius:20px 20px 0 0!important;' +
      'box-shadow:0 -8px 32px rgba(0,0,0,.12)!important;' +
      'padding-bottom:calc(12px + env(safe-area-inset-bottom))!important;}' +
      /* handle cinza */
      '.sheet-handle,' +
      '.sheet .sheet-handle,' +
      '.tchilo-modal-handle{' +
      'width:40px!important;height:4px!important;' +
      'background:#c8c5bc!important;' +
      'border-radius:2px!important;' +
      'margin:10px auto 8px!important;' +
      'display:block!important;border:0!important;}' +
      /* título limpo */
      '.sheet-title,' +
      '.sheet .sheet-title{' +
      'border-bottom:1px solid rgba(11,11,12,.08)!important;' +
      'font-weight:900!important;' +
      'padding:4px 18px 12px!important;}' +
      /* listas sem linha preta grossa */
      '.sheet-list button,' +
      '.sheet .sheet-list button,' +
      '.sheet-list .sheet-item{' +
      'border-bottom:1px solid rgba(11,11,12,.06)!important;' +
      'border-top:0!important;border-left:0!important;border-right:0!important;}' +
      /* cancel só botão limpo (não forçar branco grosso) */
      '.sheet .sheet-cancel,' +
      '.sheet button.sheet-cancel{' +
      'margin:10px 14px 4px!important;' +
      'padding:14px!important;' +
      'border-radius:14px!important;' +
      'border:1px solid rgba(11,11,12,.1)!important;' +
      'background:transparent!important;' +
      'color:#0B0B0C!important;' +
      'font-weight:800!important;font-size:15px!important;}' +
      /* ===== Sheets nativos / music / share ===== */
      '#tchiloMusicFallback .panel,' +
      '#tchiloPostMusicSheet .panel,' +
      '[id*="Music"] .panel,' +
      '.tchilo-ps-panel,' +
      '#tchiloProfileShareSheet .panel,' +
      '#tchiloGiftSheet .panel{' +
      'border:0!important;' +
      'border-top:0!important;' +
      'border-radius:20px 20px 0 0!important;' +
      'box-shadow:0 -8px 32px rgba(0,0,0,.12)!important;}' +
      /* música: Cancelar texto preto, sem “circuito” branco */
      '#tchiloMusicFallback button.cancel,' +
      '#tchiloPostMusicSheet button.cancel,' +
      '[id*="Music"] button.cancel,' +
      '.music-use-sheet .cancel,' +
      '.sheet button.cancel,' +
      'button[data-a="cancel"]{' +
      'background:transparent!important;' +
      'color:#0B0B0C!important;' +
      'border:1px solid rgba(11,11,12,.12)!important;' +
      'box-shadow:none!important;' +
      'font-weight:800!important;}' +
      /* remover anéis / bordas pretas grossas em painéis de modal */
      '.sheet *{' +
      'outline:none;}' +
      /* garantir handle se faltar no DOM */
      '';
  }

  function ensureHandle(panel) {
    if (!panel) return;
    try {
      if (panel.querySelector('.sheet-handle, .tchilo-modal-handle, .handle')) return;
      var h = document.createElement('div');
      h.className = 'sheet-handle tchilo-modal-handle';
      h.setAttribute('aria-hidden', 'true');
      panel.insertBefore(h, panel.firstChild);
    } catch (e) {}
  }

  function polish() {
    injectCSS();
    try {
      document.querySelectorAll('.sheet.open .sheet-panel, .sheet .sheet-panel').forEach(ensureHandle);
      document
        .querySelectorAll(
          '#tchiloGiftSheet .panel, #tchiloMusicFallback .panel, #tchiloProfileShareSheet .panel, .tchilo-ps-panel'
        )
        .forEach(ensureHandle);
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
