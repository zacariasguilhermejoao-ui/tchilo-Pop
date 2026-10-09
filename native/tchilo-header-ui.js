/**
 * Tchilo header UI v4
 * - linha fina screen-header
 * - botão voltar
 * - + do perfil: só no tchilo-final-css (sem JS a mudar estilo)
 */
(function () {
  'use strict';
  if (window.__tchiloHeaderUiV4) return;
  window.__tchiloHeaderUiV4 = true;
  window.__tchiloHeaderUiV3 = true;

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
      '.screen-header,.screen > .screen-header,[id^="screen-"] > .screen-header{' +
      'border-bottom-width:1px!important;' +
      'border-bottom-style:solid!important;' +
      'border-bottom-color:var(--line,rgba(0,0,0,.12))!important;}' +
      '.profile-header{border-bottom:none!important;border-bottom-width:0!important;box-shadow:none!important;}' +
      '.profile-stats,.profile-actions{border:none!important;box-shadow:none!important;}' +
      '.back-btn{' +
      'width:40px!important;height:40px!important;border:0!important;border-radius:50%!important;' +
      'background:transparent!important;display:inline-flex!important;align-items:center!important;' +
      'justify-content:center!important;cursor:pointer!important;color:var(--ink,#0B0B0C)!important;' +
      'flex-shrink:0!important;padding:0!important;}' +
      '.back-btn svg{width:22px!important;height:22px!important;display:block!important;stroke:currentColor!important;}';
  }

  function patchBackButtons(root) {
    root = root || document;
    try {
      root.querySelectorAll('.back-btn').forEach(function (btn) {
        if (btn.getAttribute('data-tchilo-back') === '1') return;
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 400);

  if (typeof window.goTo === 'function' && !window.goTo.__headerUiV4) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(patchBackButtons, 40);
      return r;
    };
    window.goTo.__headerUiV4 = true;
  }
})();
