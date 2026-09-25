/**
 * Tchilo — ícone Reels (claquete + play) no tamanho do ícone antigo (26px)
 */
(function () {
  'use strict';
  if (window.__tchiloReelsIcon) return;
  window.__tchiloReelsIcon = true;

  var ICON_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAF+0lEQVR4nM2aWYhcVRBAT28zKnGNBqIEo4LgRlQQjRqNokYRFX+CG0Z/RPBHiIqi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7qKi4oIb7g==';

  function injectCSS() {
    if (document.getElementById('tchiloReelsIconCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloReelsIconCSS';
    st.textContent =
      '.nav-item .nav-reels-icon,' +
      '.nav-item img.nav-reels-icon{' +
      'width:26px!important;height:26px!important;' +
      'display:block!important;object-fit:contain;' +
      'flex-shrink:0;}' +
      '.nav-item svg.nav-reels-icon{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function replaceIn(btn) {
    if (!btn) return;
    var existing = btn.querySelector('img.nav-reels-icon');
    if (existing) {
      if (existing.getAttribute('src') !== ICON_SRC) existing.src = ICON_SRC;
      return;
    }
    btn.querySelectorAll('svg, .nav-text-icon, .nav-sms-text').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var img = document.createElement('img');
    img.className = 'nav-reels-icon';
    img.alt = 'Reels';
    img.width = 26;
    img.height = 26;
    img.src = ICON_SRC;
    img.draggable = false;
    var dot = btn.querySelector('.dot');
    if (dot) btn.insertBefore(img, dot);
    else btn.insertBefore(img, btn.firstChild);
  }

  function apply() {
    injectCSS();
    var btn =
      document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
      document.querySelector('.navbar .nav-item[aria-label="Reels"]');
    if (!btn) {
      var items = document.querySelectorAll('.navbar .nav-item');
      if (items.length >= 2) btn = items[1];
    }
    if (btn) replaceIn(btn);
  }

  function boot() {
    apply();
    setTimeout(apply, 400);
    setTimeout(apply, 1200);
    setTimeout(apply, 3000);
    try {
      var nav = document.querySelector('.navbar');
      if (nav && !nav.__reelsIconObs) {
        nav.__reelsIconObs = true;
        new MutationObserver(function () { apply(); }).observe(nav, { childList: true, subtree: true });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
