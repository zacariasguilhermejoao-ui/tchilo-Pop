/**
 * Injeta "Saldo" no menu ⋯ — SÓ no próprio perfil
 * v2
 */
(function () {
  'use strict';
  if (window.__tchiloSaldoMenuV2) return;
  window.__tchiloSaldoMenuV2 = true;

  var WALLET =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2 7.5A2.5 2.5 0 0 1 4.5 5h13A2.5 2.5 0 0 1 20 7.5v1"/>' +
    '<rect x="2" y="8" width="20" height="12" rx="2.5"/>' +
    '<path d="M16 14h2"/>' +
    '</svg>';

  function isOwn() {
    try {
      var s = null;
      if (typeof getSession === 'function') s = getSession();
      else s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      var me = s && (s.username || s.user);
      if (!me) return false;
      var view = window.viewingProfileUser;
      if (!view) return true;
      return String(view).toLowerCase() === String(me).toLowerCase();
    } catch (e) {
      return !window.viewingProfileUser;
    }
  }

  function inject() {
    var sheet = document.getElementById('tchiloProfileShareSheet');
    if (!sheet || !sheet.classList.contains('open')) return;

    /* Remover saldo se não for próprio perfil */
    if (!isOwn()) {
      var bad = sheet.querySelector('[data-act="saldo"]');
      if (bad) bad.remove();
      return;
    }

    if (sheet.querySelector('[data-act="saldo"]')) return;

    var panel = sheet.querySelector('.tchilo-ps-panel');
    if (!panel) return;

    /* Só injeta se existir Definições (menu próprio) */
    var settings = panel.querySelector('[data-act="settings"]');
    if (!settings) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt';
    btn.setAttribute('data-act', 'saldo');
    btn.innerHTML = '<span class="ic">' + WALLET + '</span><span>Saldo</span>';

    if (settings.nextSibling) {
      settings.parentNode.insertBefore(btn, settings.nextSibling);
    } else {
      settings.parentNode.appendChild(btn);
    }

    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          sheet.classList.remove('open');
        } catch (err) {}
        setTimeout(function () {
          if (typeof window.tchiloOpenSaldo === 'function') window.tchiloOpenSaldo();
          else if (typeof window.openSaldo === 'function') window.openSaldo();
        }, 40);
      },
      true
    );
  }

  try {
    new MutationObserver(function () {
      inject();
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setTimeout(inject, 300);
})();
