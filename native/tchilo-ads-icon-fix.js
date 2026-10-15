/**
 * Tchilo — Gestor / Meus Anúncios = ícone 3D (PNG)
 * v2 — deixa de forçar SVG antigo; usa native/settings-icons/meus-anuncios-3d.png
 */
(function () {
  'use strict';
  if (window.__tchiloAdsIconV2) return;
  window.__tchiloAdsIconV2 = true;

  var SRC = 'native/settings-icons/meus-anuncios-3d.png?v=3d1';
  var HTML =
    '<img src="' +
    SRC +
    '" alt="" width="28" height="28" decoding="async" ' +
    'style="width:28px;height:28px;object-fit:contain;display:block;pointer-events:none;" />';

  function apply() {
    var btn = document.getElementById('tchiloAdsMgrBtn');
    if (!btn) return false;
    var icon = btn.querySelector('.si-icon');
    if (!icon) {
      icon = document.createElement('div');
      icon.className = 'si-icon';
      btn.insertBefore(icon, btn.firstChild);
    }
    if (icon.getAttribute('data-tchilo-ads') === '3d' && icon.querySelector('img[src*="meus-anuncios-3d"]')) {
      return true;
    }
    icon.innerHTML = HTML;
    icon.setAttribute('data-tchilo-ads', '3d');
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
