/** Aplica rascunho do post ao ecrã Criar anúncio e ao pagamento */
(function () {
  "use strict";

  function fillFormFromDraft() {
    var d = window.__tchiloBoostDraft || window.__tchiloPendingAdDraft;
    if (!d) return;
    window.__tchiloPendingAdDraft = d;
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
              ? '<video src="' +
                d.media_url +
                '" controls playsinline style="max-width:100%;max-height:180px;border-radius:10px"></video>'
              : '<img src="' +
                d.media_url +
                '" alt="" style="max-width:100%;max-height:180px;border-radius:10px"/>') +
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
      if (window.__tchiloBoostDraft) {
        window.__tchiloPendingAdDraft = window.__tchiloBoostDraft;
      }
      var r = orig.apply(this, arguments);
      setTimeout(fillFormFromDraft, 80);
      setTimeout(fillFormFromDraft, 350);
      setTimeout(fillFormFromDraft, 800);
      return r;
    };
    window.tchiloOpenAdCreate.__draftPatch = true;
    return true;
  }

  // interceptar insert no Supabase para injetar media/body do post turbinado
  function patchSupabaseInsert() {
    var SB = window.SB || window.tchiloSupabase;
    if (!SB || !SB.from || SB.from.__adsDraftPatch) return !!SB;
    var origFrom = SB.from.bind(SB);
    SB.from = function (table) {
      var q = origFrom(table);
      if (table === "ads" && q && typeof q.insert === "function" && !q.insert.__adsDraft) {
        var origInsert = q.insert.bind(q);
        q.insert = function (row) {
          try {
            var d = window.__tchiloPendingAdDraft;
            if (d && row) {
              if ((!row.body || !String(row.body).trim()) && d.body) row.body = d.body;
              if (!row.media_url && d.media_url) {
                row.media_url = d.media_url;
                row.media_type = d.media_type || "image";
              }
            }
          } catch (e) {}
          return origInsert(row);
        };
        q.insert.__adsDraft = true;
      }
      return q;
    };
    SB.from.__adsDraftPatch = true;
    return true;
  }

  var n = 0;
  var t = setInterval(function () {
    patchOpen();
    patchSupabaseInsert();
    if (++n > 60) clearInterval(t);
  }, 200);
})();
