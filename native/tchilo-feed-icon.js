/**
 * Feed icon = native/icons/feed.svg (gráfico, não texto)
 * v5
 */
(function () {
  "use strict";
  if (window.__tchiloFeedIconV5) return;
  window.__tchiloFeedIconV5 = true;

  var SRC = 'native/icons/feed.svg?v=5';
  var HTML =
    '<img class="nav-feed-icon" src="' + SRC + '" alt="Feed" width="28" height="28" ' +
    'style="width:28px;height:28px;object-fit:contain;display:block;">';

  function apply() {
    try {
      var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
      if (!btn) return;
      btn.querySelectorAll('.nav-fee, .nav-text-icon, svg').forEach(function (n) {
        try { n.remove(); } catch (e) {}
      });
      if (!btn.querySelector('img.nav-feed-icon')) {
        var dot = btn.querySelector('.dot');
        if (dot) dot.insertAdjacentHTML('beforebegin', HTML);
        else btn.insertAdjacentHTML('afterbegin', HTML);
      }
      btn.setAttribute('aria-label', 'Feed');
    } catch (e) {}
  }

  function boot() {
    apply();
    setTimeout(apply, 400);
    setTimeout(apply, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
