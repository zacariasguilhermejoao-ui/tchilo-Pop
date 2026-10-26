/**
 * Tchilo — Gestor / Meus Anúncios = ícone da mesma família das Definições (círculo cheio + megafone)
 */
(function () {
  'use strict';
  if (window.__tchiloAdsIconV2) return;
  window.__tchiloAdsIconV2 = true;

  var HTML =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true" data-fam="1">' +
    '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
    '<g transform="translate(5.04 5.04) scale(.58)" style="color:var(--paper,#fff)" stroke="currentColor" ' +
    'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
    '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>' +
    '</g></svg>';

  function apply() {
    var btn = document.getElementById('tchiloAdsMgrBtn');
    if (!btn) return false;
    var icon = btn.querySelector('.si-icon');
    if (!icon) {
      icon = document.createElement('div');
      icon.className = 'si-icon';
      btn.insertBefore(icon, btn.firstChild);
    }
    if (icon.getAttribute('data-tchilo-ads') === 'fam' && icon.querySelector('svg[data-fam]')) {
      return true;
    }
    icon.innerHTML = HTML;
    icon.setAttribute('data-tchilo-ads', 'fam');
    icon.setAttribute('data-si', 'meus anuncios-v33');
    icon.style.border = '0';
    icon.style.background = 'transparent';
    return true;
  }

  function boot() {
    apply();
    var tries = 0;
    var t = setInterval(function () {
      if (apply() || ++tries > 40) clearInterval(t);
    }, 250);
    try {
      new MutationObserver(function () {
        apply();
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 200);
    });
  } else {
    setTimeout(boot, 200);
  }
})();
