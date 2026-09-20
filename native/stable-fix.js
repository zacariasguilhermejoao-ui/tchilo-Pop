/**
 * tchilo-Pop — câmara + efeitos (só óculos)
 */
(function () {
  "use strict";
  function load(src, cb) {
    var s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=fx2oculos1";
    s.onload = function () {
      if (cb) cb();
    };
    s.onerror = function () {
      console.error("load fail", src);
      if (cb) cb();
    };
    document.head.appendChild(s);
  }
  load(
    "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@699a0f1e268a1bee2f85c966041c38a1540ad30c/native/stable-fix.js",
    function () {
      load("native/fx-panel.js");
    }
  );
})();
