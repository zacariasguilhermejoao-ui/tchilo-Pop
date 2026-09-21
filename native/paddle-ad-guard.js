/** Evita marcar Premium quando o checkout é de anúncio */
(function () {
  "use strict";

  function patchMark() {
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

  function patchCheckoutOpen() {
    try {
      if (!window.Paddle || !Paddle.Checkout || !Paddle.Checkout.open) return false;
      if (Paddle.Checkout.open.__adGuard) return true;
      var origOpen = Paddle.Checkout.open.bind(Paddle.Checkout);
      Paddle.Checkout.open = function (opts) {
        try {
          var kind =
            opts &&
            opts.customData &&
            (opts.customData.kind || opts.customData.type);
          window.__tchiloCheckoutKind = kind === "ad" ? "ad" : "premium";
        } catch (e) {
          window.__tchiloCheckoutKind = "premium";
        }
        return origOpen(opts);
      };
      Paddle.Checkout.open.__adGuard = true;
      return true;
    } catch (e2) {
      return false;
    }
  }

  var n = 0;
  var t = setInterval(function () {
    var a = patchMark();
    var b = patchCheckoutOpen();
    if ((a && b) || ++n > 60) clearInterval(t);
  }, 200);
})();
