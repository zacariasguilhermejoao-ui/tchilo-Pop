/**
 * Menu ⋯ limpo: um só Turbinar + ícone profissional (foguete)
 */
(function () {
  'use strict';
  if (window.__tchiloMenuCleanV1) return;
  window.__tchiloMenuCleanV1 = true;

  var ROCKET =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>' +
    '<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>' +
    '<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>' +
    '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>' +
    '</svg>';

  function cleanBoostMenu() {
    try {
      var box =
        document.getElementById('postMenuOptions') ||
        document.querySelector('.post-menu-options, .share-sheet .sheet-list');
      if (!box) return;

      var boosts = box.querySelectorAll(
        '[data-tchilo-boost], [data-tchilo-profile-boost-menu]'
      );
      /* manter só o primeiro data-tchilo-boost */
      var kept = null;
      boosts.forEach(function (el, idx) {
        if (el.hasAttribute('data-tchilo-boost') && !kept) {
          kept = el;
          return;
        }
        try {
          el.remove();
        } catch (e) {}
      });

      if (kept) {
        kept.innerHTML =
          '<div class="so-icon" style="background:transparent;color:#0B0B0C;display:flex;align-items:center;justify-content:center">' +
          ROCKET +
          '</div>' +
          '<div><b>Turbinar</b>' +
          '<div style="font-size:12px;color:var(--muted,#888);font-weight:500">Impulsionar no feed</div></div>';
      }

      /* remover entradas com texto duplicado "Turbinar" sem data-attr */
      box.querySelectorAll('.share-opt, button').forEach(function (btn) {
        if (btn === kept) return;
        if (btn.hasAttribute('data-tchilo-boost')) return;
        var t = (btn.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (
          t.indexOf('turbinar') === 0 ||
          t.indexOf('turbinar /') >= 0 ||
          (t.indexOf('turbinar') >= 0 && t.indexOf('promover') >= 0)
        ) {
          /* se já temos kept, remove extras */
          if (kept) {
            try {
              btn.remove();
            } catch (e2) {}
          }
        }
      });
    } catch (e) {}
  }

  function patch() {
    if (typeof window.openPostMenu !== 'function') return;
    if (window.openPostMenu.__menuClean) return;
    var orig = window.openPostMenu;
    window.openPostMenu = function () {
      var r = orig.apply(this, arguments);
      setTimeout(cleanBoostMenu, 50);
      setTimeout(cleanBoostMenu, 150);
      setTimeout(cleanBoostMenu, 350);
      return r;
    };
    window.openPostMenu.__menuClean = true;
  }

  patch();
  setTimeout(patch, 500);
  setTimeout(patch, 2000);
})();
