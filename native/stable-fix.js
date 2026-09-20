/**
 * tchilo-Pop — câmara + efeitos
 */
(function () {
  "use strict";
  var v = "fxOlhos1";
  function load(src, cb) {
    var s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + v;
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
      var base = "https://zacariasguilhermejoao-ui.github.io/tchilo-Pop/";
      try {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
          var u = scripts[i].src || "";
          if (u.indexOf("stable-fix.js") >= 0) {
            base = u.replace(/\/native\/stable-fix\.js.*$/, "/");
            break;
          }
        }
      } catch (e) {}
      load(base + "native/fx-panel.js");
    }
  );
})();
