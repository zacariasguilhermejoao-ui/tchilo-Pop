/**
 * Tchilo — ícone preto de gestor de anúncios (megafone outline)
 * Substitui o ícone de volume / letra "A" em Meus Anúncios.
 */
(function () {
  'use strict';

  /* Megafone outline preto — estilo gestor de campanhas/anúncios */
  var ADS_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    /* corpo do megafone */
    '<path d="M3 10v4a1 1 0 0 0 1 1h2.5L12 19V5L6.5 9H4a1 1 0 0 0-1 1z"/>' +
    /* ondas de som */
    '<path d="M15.5 8.5a4.2 4.2 0 0 1 0 7"/>' +
    '<path d="M18 6.5a7 7 0 0 1 0 11"/>' +
    /* base / suporte */
    '<path d="M7.5 15.5v2.2a1.3 1.3 0 0 0 2.2.9l1.1-1.1"/>' +
    '</svg>';

  function apply() {
    var btn = document.getElementById('tchiloAdsMgrBtn');
    if (!btn) return false;
    var icon = btn.querySelector('.si-icon');
    if (!icon) {
      icon = document.createElement('div');
      icon.className = 'si-icon';
      btn.insertBefore(icon, btn.firstChild);
    }
    /* evita loop infinito: so escreve se ainda nao tiver o icone (escrever dispara o proprio observer) */
    if (icon.getAttribute('data-tchilo-ads') !== '1' || !icon.querySelector('svg')) {
      icon.innerHTML = ADS_ICON_SVG;
      icon.setAttribute('data-tchilo-ads', '1');
    }
    icon.style.color = 'var(--ink, #0B0B0C)';
    icon.style.border = '0';
    icon.style.background = 'transparent';
    var svg = icon.querySelector('svg');
    if (svg) {
      svg.style.stroke = 'var(--ink, #0B0B0C)';
      svg.setAttribute('stroke', 'currentColor');
    }
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
      setTimeout(boot, 300);
    });
  } else {
    setTimeout(boot, 300);
  }
})();
