/** Load camera + Estrela PNG (user image) */
(function () {
  "use strict";
  function load(src, cb) {
    var s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=estrela3";
    s.onload = function () {
      if (cb) cb();
    };
    s.onerror = function () {
      console.error("load fail", src);
      if (cb) cb();
    };
    document.head.appendChild(s);
  }
  // 1) asset PNG em partes
  load("native/eb_loader.js", function () {
    // 2) câmara (warps)
    load(
      "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@699a0f1e268a1bee2f85c966041c38a1540ad30c/native/stable-fix.js",
      function () {
        // 3) overlay Estrela com o PNG
        load("native/fx-estrela-overlay.js");
      }
    );
  });
})();
