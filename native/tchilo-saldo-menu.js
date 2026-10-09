/**
 * Injeta "Saldo" no menu ⋯ do perfil (ícone carteira)
 */
(function () {
  'use strict';
  if (window.__tchiloSaldoMenuV1) return;
  window.__tchiloSaldoMenuV1 = true;

  var WALLET =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2 7.5A2.5 2.5 0 0 1 4.5 5h13A2.5 2.5 0 0 1 20 7.5v1"/>' +
    '<rect x="2" y="8" width="20" height="12" rx="2.5"/>' +
    '<path d="M16 14h2"/>' +
    '</svg>';

  function inject() {
    var sheet = document.getElementById('tchiloProfileShareSheet');
    if (!sheet || sheet.querySelector('[data-act="saldo"]')) return;

    var panel = sheet.querySelector('.tchilo-ps-panel');
    if (!panel) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt';
    btn.setAttribute('data-act', 'saldo');
    btn.innerHTML = '<span class="ic">' + WALLET + '</span><span>Saldo</span>';

    /* Depois de Definições, ou no topo */
    var settings = panel.querySelector('[data-act="settings"]');
    if (settings && settings.nextSibling) {
      settings.parentNode.insertBefore(btn, settings.nextSibling);
    } else {
      var firstOpt = panel.querySelector('.opt');
      if (firstOpt) panel.insertBefore(btn, firstOpt);
      else panel.appendChild(btn);
    }

    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          sheet.classList.remove('open');
          sheet.remove();
        } catch (err) {}
        setTimeout(function () {
          if (typeof window.tchiloOpenSaldo === 'function') window.tchiloOpenSaldo();
          else if (typeof window.openSaldo === 'function') window.openSaldo();
        }, 40);
      },
      true
    );
  }

  function watch() {
    try {
      new MutationObserver(function () {
        inject();
      }).observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  watch();
  setTimeout(inject, 300);
})();
