/**
 * tchilo-Pop — ícone limpo do Feed na navbar (casa)
 * v3 — SVG simples, sem path complexo
 */
(function () {
  "use strict";
  if (window.__tchiloFeedIconV3) return;
  window.__tchiloFeedIconV3 = true;
  window.__tchiloFeedIconV2 = true;

  var FEED_SVG =
    '<svg class="nav-feed-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true">' +
    '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>' +
    "</svg>";

  function apply() {
    try {
      var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
      if (!btn) return;

      /* Remover texto Fee residual e svgs antigos */
      btn.querySelectorAll(".nav-fee, .nav-text-icon").forEach(function (n) {
        try { n.remove(); } catch (e) {}
      });

      var svgs = btn.querySelectorAll("svg");
      for (var i = 0; i < svgs.length; i++) {
        svgs[i].parentNode.removeChild(svgs[i]);
      }

      var dot = btn.querySelector(".dot");
      if (dot) {
        dot.insertAdjacentHTML("beforebegin", FEED_SVG);
      } else {
        btn.insertAdjacentHTML("afterbegin", FEED_SVG);
      }

      btn.setAttribute("data-custom-feed-icon", "1");
      btn.setAttribute("aria-label", "Feed");
    } catch (e) {}
  }

  function boot() {
    apply();
    setTimeout(apply, 400);
    setTimeout(apply, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
