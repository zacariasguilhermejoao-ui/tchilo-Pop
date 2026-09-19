/**
 * tchilo-Pop — câmara sem efeitos (novos virão um a um)
 */
(function () {
  "use strict";

  function load(src, cb) {
    var s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=noFx1";
    s.onload = function () {
      if (cb) cb();
    };
    s.onerror = function () {
      console.error("load fail", src);
      if (cb) cb();
    };
    document.head.appendChild(s);
  }

  function stripAllEffects() {
    var track = document.getElementById("tscTrack");
    if (track) {
      track.innerHTML = "";
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip active";
      b.textContent = "Normal";
      b.title = "Normal";
      track.appendChild(b);
    }
    // limpar overlays de efeitos
    ["tscEstrelaCanvas", "tscFxCanvas"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    // limpar assets antigos
    try {
      window.TchiloFxPngAssets = {};
    } catch (e) {}
  }

  function watchStrip() {
    stripAllEffects();
    setInterval(stripAllEffects, 500);
  }

  // câmara base (sem efeitos visíveis)
  load(
    "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@699a0f1e268a1bee2f85c966041c38a1540ad30c/native/stable-fix.js",
    function () {
      watchStrip();
    }
  );
})();
