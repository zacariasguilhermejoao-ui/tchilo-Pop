/** Evita marcar Premium quando o checkout é de anúncio */
(function () {
  "use strict";
  function patch() {
    if (typeof window.tchiloMarkPremium !== "function") return false;
    if (window.tchiloMarkPremium.__adGuard) return true;
    var orig = window.tchiloMarkPremium;
    window.tchiloMarkPremium = function (meta) {
      try {
        if (window.__tchiloCheckoutKind === "ad") return;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.tchiloMarkPremium.__adGuard = true;
    return true;
  }
  var n = 0;
  var t = setInterval(function () {
    if (patch() || ++n > 50) clearInterval(t);
  }, 200);
})();
