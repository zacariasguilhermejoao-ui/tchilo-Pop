/** Load known-good camera (warp effects) then Estrela PNG overlay */
(function () {
  "use strict";
  function load(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = function () { if (cb) cb(); };
    s.onerror = function () { console.error("load fail", src); if (cb) cb(); };
    document.head.appendChild(s);
  }
  // câmara completa (Olhos+, Lábios+, Cara+, Olhos verm.)
  load(
    "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@699a0f1e268a1bee2f85c966041c38a1540ad30c/native/stable-fix.js",
    function () {
      // efeito Estrela (óculos) por cima
      load("native/fx-estrela-overlay.js?v=1");
    }
  );
})();
