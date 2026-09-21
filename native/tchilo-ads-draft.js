/** Aplica rascunho do post ao criar anúncio (Turbinar) */
(function () {
  "use strict";
  function apply() {
    if (typeof window.tchiloOpenAdCreate !== "function") return false;
    if (window.tchiloOpenAdCreate.__draftPatch) return true;
    var orig = window.tchiloOpenAdCreate;
    window.tchiloOpenAdCreate = function () {
      try {
        var d = window.__tchiloBoostDraft;
        if (d && typeof window.tchiloApplyAdDraft === "function") {
          window.tchiloApplyAdDraft(d);
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.tchiloOpenAdCreate.__draftPatch = true;
    return true;
  }
  var n = 0;
  var t = setInterval(function () {
    if (apply() || ++n > 50) clearInterval(t);
  }, 200);
})();
