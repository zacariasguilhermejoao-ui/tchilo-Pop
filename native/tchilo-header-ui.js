/**
 * Tchilo header UI v2
 * 1) Linha fina só no .screen-header (NÃO no .profile-header)
 * 2) Botão voltar profissional
 * 3) Botão + do avatar FORA da foto
 */
(function () {
  'use strict';
  if (window.__tchiloHeaderUiV2) return;
  window.__tchiloHeaderUiV2 = true;
  window.__tchiloHeaderUiV1 = true;

  var BACK_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M19 12H5"/>' +
    '<path d="M12 19l-7-7 7-7"/>' +
    '</svg>';

  function injectCSS() {
    var st = document.getElementById('tchilo-header-ui-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchilo-header-ui-css';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* Linha fina só no cabeçalho de ecrã — NÃO em .profile-header */
      '.screen-header,' +
      '.screen > .screen-header,' +
      '[id^="screen-"] > .screen-header{' +
      'border-bottom-width:1px!important;' +
      'border-bottom-style:solid!important;' +
      'border-bottom-color:var(--line,rgba(0,0,0,.12))!important;}' +
      /* Remove a linha entre stats e Iniciar Live */
      '.profile-header{' +
      'border-bottom:none!important;' +
      'border-bottom-width:0!important;' +
      'box-shadow:none!important;}' +
      '.profile-stats{' +
      'border-bottom:none!important;' +
      'border-top:none!important;}' +
      '.profile-actions{' +
      'border-top:none!important;' +
      'border-bottom:none!important;' +
      'box-shadow:none!important;}' +
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
      'display:block!important;stroke:currentColor!important;}' +
      /* Avatar: overflow visível para o + ficar fora */
      '.profile-avatar,' +
      '#profileBody .profile-avatar,' +
      '.profile-header .profile-avatar{' +
      'overflow:visible!important;' +
      'position:relative!important;}' +
      /* Botão + FORA da foto (canto inferior direito, exterior) */
      '#tchiloProfileAvatarPlus,' +
      '#tchiloProfileAvatarPlus.tchilo-av-add,' +
      'button#tchiloProfileAvatarPlus{' +
      'position:absolute!important;' +
      'right:-6px!important;' +
      'bottom:-4px!important;' +
      'left:auto!important;' +
      'top:auto!important;' +
      'z-index:8!important;' +
      'width:30px!important;' +
      'height:30px!important;' +
      'min-width:30px!important;' +
      'min-height:30px!important;' +
      'border-radius:50%!important;' +
      'background:#0B0B0C!important;' +
      'color:#fff!important;' +
      'border:2.5px solid var(--paper,#F6F1E7)!important;' +
      'box-shadow:0 1px 4px rgba(0,0,0,.2)!important;' +
      'display:flex!important;' +
      'align-items:center!important;' +
      'justify-content:center!important;' +
      'padding:0!important;' +
      'margin:0!important;' +
      'cursor:pointer!important;' +
      'animation:none!important;' +
      'transform:none!important;}' +
      '#tchiloProfileAvatarPlus svg,' +
      '#tchiloProfileAvatarPlus.tchilo-av-add svg{' +
      'width:16px!important;' +
      'height:16px!important;' +
      'stroke:#fff!important;' +
      'color:#fff!important;' +
      'display:block!important;}';
  }

  function patchBackButtons(root) {
    root = root || document;
    try {
      root.querySelectorAll('.back-btn').forEach(function (btn) {
        if (btn.getAttribute('data-tchilo-back') === '1') {
          /* garantir SVG atualizado */
          if (!btn.querySelector('svg path[d^="M19"]')) {
            btn.innerHTML = BACK_SVG;
          }
          return;
        }
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

  if (typeof window.goTo === 'function' && !window.goTo.__headerUiV2) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(run, 30);
      setTimeout(run, 120);
      return r;
    };
    window.goTo.__headerUiV2 = true;
  }

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__headerUiV2) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(run, 40);
      return r;
    };
    window.renderProfile.__headerUiV2 = true;
  }

  try {
    new MutationObserver(function () {
      setTimeout(patchBackButtons, 40);
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
