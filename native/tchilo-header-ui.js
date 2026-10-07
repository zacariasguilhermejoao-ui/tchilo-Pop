/**
 * Tchilo header UI v1
 * 1) Linha do cabeçalho (.screen-header) fina 1px em todas as páginas
 * 2) Botão voltar profissional (seta) em todos os .back-btn
 */
(function () {
  'use strict';
  if (window.__tchiloHeaderUiV1) return;
  window.__tchiloHeaderUiV1 = true;

  /* Seta esquerda profissional (estilo Lucide/Feather arrow-left) */
  var BACK_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M19 12H5"/>' +
    '<path d="M12 19l-7-7 7-7"/>' +
    '</svg>';

  function injectCSS() {
    if (document.getElementById('tchilo-header-ui-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-header-ui-css';
    st.textContent =
      /* Linha fina sob o cabeçalho em TODAS as páginas */
      '.screen-header,' +
      '.screen > .screen-header,' +
      '[id^="screen-"] > .screen-header,' +
      '.profile-header,' +
      '.edit-header,' +
      '.create-header{' +
      'border-bottom-width:1px!important;' +
      'border-bottom-style:solid!important;' +
      'border-bottom-color:var(--line,rgba(0,0,0,.12))!important;}' +
      /* Botão voltar */
      '.back-btn{' +
      'width:40px!important;height:40px!important;' +
      'border:0!important;border-radius:50%!important;' +
      'background:transparent!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;color:var(--ink,#0B0B0C)!important;' +
      'flex-shrink:0!important;padding:0!important;}' +
      '.back-btn svg{' +
      'width:22px!important;height:22px!important;' +
      'display:block!important;stroke:currentColor!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function patchBackButtons(root) {
    root = root || document;
    try {
      root.querySelectorAll('.back-btn').forEach(function (btn) {
        if (btn.getAttribute('data-tchilo-back') === '1') return;
        /* preservar onclick / listeners — só troca o SVG */
        btn.innerHTML = BACK_SVG;
        btn.setAttribute('data-tchilo-back', '1');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Voltar');
      });
    } catch (e) {}
  }

  function run() {
    injectCSS();
    patchBackButtons(document);
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(run, ms);
  });

  /* ao mudar de ecrã */
  if (typeof window.goTo === 'function' && !window.goTo.__headerUi) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(run, 30);
      setTimeout(run, 120);
      return r;
    };
    window.goTo.__headerUi = true;
  }

  try {
    new MutationObserver(function (muts) {
      var need = false;
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) {
          need = true;
          break;
        }
      }
      if (need) setTimeout(patchBackButtons, 40);
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
