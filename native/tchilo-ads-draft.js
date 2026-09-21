/** Aplica rascunho do post ao ecrã Criar anúncio */
(function () {
  "use strict";

  function fillFormFromDraft() {
    var d = window.__tchiloBoostDraft;
    if (!d) return;
    try {
      var ta = document.getElementById("adBody");
      if (ta && d.body) {
        ta.value = String(d.body);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (d.media_url) {
        var box = document.getElementById("adMediaBox");
        if (box) {
          var isVid = d.media_type === "video";
          box.innerHTML =
            (isVid
              ? '<video src="' + d.media_url + '" controls playsinline style="max-width:100%;max-height:180px;border-radius:10px"></video>'
              : '<img src="' + d.media_url + '" alt="" style="max-width:100%;max-height:180px;border-radius:10px"/>') +
            '<input type="file" id="adMediaInput" accept="image/*,video/*" hidden/>';
        }
      }
    } catch (e) {}
  }

  function patchOpen() {
    if (typeof window.tchiloOpenAdCreate !== "function") return false;
    if (window.tchiloOpenAdCreate.__draftPatch) return true;
    var orig = window.tchiloOpenAdCreate;
    window.tchiloOpenAdCreate = function () {
      var r = orig.apply(this, arguments);
      setTimeout(fillFormFromDraft, 100);
      setTimeout(fillFormFromDraft, 400);
      return r;
    };
    window.tchiloOpenAdCreate.__draftPatch = true;
    return true;
  }

  var n = 0;
  var t = setInterval(function () {
    if (patchOpen() || ++n > 50) clearInterval(t);
  }, 200);
})();
