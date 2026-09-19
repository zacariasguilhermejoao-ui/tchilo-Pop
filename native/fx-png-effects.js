/** tchilo-Pop — carrega fotos reais dos 4 efeitos */
(function () {
  'use strict';
  window.TchiloFxPngAssets = window.TchiloFxPngAssets || {};
  var parts = ["native/fx-one/cateye_p0.js", "native/fx-one/cateye_p1.js", "native/fx-one/cateye_p2.js", "native/fx-one/cateye_p3.js", "native/fx-one/cateye_asm.js", "native/fx-one/estrela_p0.js", "native/fx-one/estrela_p1.js", "native/fx-one/estrela_p2.js", "native/fx-one/estrela_p3.js", "native/fx-one/estrela_asm.js", "native/fx-one/chifres_p0.js", "native/fx-one/chifres_p1.js", "native/fx-one/chifres_p2.js", "native/fx-one/chifres_p3.js", "native/fx-one/chifres_asm.js", "native/fx-one/colar_p0.js", "native/fx-one/colar_p1.js", "native/fx-one/colar_p2.js", "native/fx-one/colar_p3.js", "native/fx-one/colar_asm.js"];
  var left = parts.length;
  function done() {
    if (--left > 0) return;
    try { window.dispatchEvent(new Event('tchilo-fx-assets-ready')); } catch (e) {}
  }
  parts.forEach(function (src) {
    var s = document.createElement('script');
    s.src = src + '?v=4';
    s.onload = done;
    s.onerror = done;
    (document.head || document.documentElement).appendChild(s);
  });
})();
