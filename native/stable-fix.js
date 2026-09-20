/**
 * tchilo-Pop — câmara + painel de efeitos novos
 */
(function () {
  "use strict";

  function load(src, cb) {
    var s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=fx4v1";
    s.onload = function () {
      if (cb) cb();
    };
    s.onerror = function () {
      console.error("load fail", src);
      if (cb) cb();
    };
    document.head.appendChild(s);
  }

  // câmara base + painel com os 4 PNG
  load(
    "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@699a0f1e268a1bee2f85c966041c38a1540ad30c/native/stable-fix.js",
    function () {
      load("native/fx-panel.js");
    }
  );
})();
