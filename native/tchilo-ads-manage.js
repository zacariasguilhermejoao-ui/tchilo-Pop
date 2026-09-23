/**
 * tchilo-Pop — Gerir anuncios (clicavel + estados)
 * Ativo | Pendente | Pausado | Cancelado | Terminado | Reprovado | Apagado
 */
(function () {
  "use strict";

  var cache = [];

  function esc(s) {
    var amp = String.fromCharCode(38);
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      if (c === "&") return amp + "amp;";
      if (c === "<") return amp + "lt;";
      if (c === ">") return amp + "gt;";
      if (c === '"') return amp + "quot;";
      return amp + "#39;";
    });
  }

  function meId() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && (s.id || s.user_id)) return String(s.id || s.user_id);
        if (s && s.user && s.user.id) return String(s.user.id);
      }
    } catch (e) {}
    return "";
  }

  function sb() {
    return window.SB || window.tchiloSupabase || null;
  }

  function normalizeStatus(raw, ad) {
    var s = String(raw || "pending").toLowerCase().trim();
    if (s === "ativo" || s === "active" || s === "live" || s === "approved") s = "active";
    else if (s === "cancelado" || s === "cancelled" || s === "canceled") s = "cancelled";
    else if (s === "terminado" || s === "finished" || s === "ended" || s === "expired" || s === "completed")
      s = "finished";
    else if (s === "reprovado" || s === "rejected" || s === "denied") s = "rejected";
    else if (s === "apagado" || s === "deleted" || s === "removed") s = "deleted";
    else if (s === "pausado" || s === "paused") s = "paused";
    else if (s === "pending" || s === "pendente" || s === "draft") s = "pending";
    if (ad && (s === "active" || s === "pending") && ad.ends_at) {
      try {
        if (new Date(ad.ends_at).getTime() < Date.now()) s = "finished";
      } catch (e) {}
    }
    return s;
  }

  function statusLabel(s) {
    return (
      {
        active: "Ativo",
        pending: "Pendente",
        paused: "Pausado",
        cancelled: "Cancelado",
        finished: "Terminado",
        rejected: "Reprovado",
        deleted: "Apagado"
      }[s] || s
    );
  }

  function ensureCSS() {
    if (document.getElementById("tchiloAdsManageCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsManageCSS";
    st.textContent =
      "#tchiloAdsPro .ap-ad-row{cursor:pointer;-webkit-tap-highlight-color:transparent}" +
      "#tchiloAdsPro .ap-ad-row:active{opacity:.85;transform:scale(.99)}" +
      "#tchiloAdsPro .ap-badge{display:inline-block;padding:4px 10px;border-radius:999px;border:2px solid #0B0B0C;font:800 11px Inter,sans-serif;margin-right:6px}" +
      "#tchiloAdsPro .ap-badge.active{background:#c8f560}" +
      "#tchiloAdsPro .ap-badge.pending{background:#FFE566}" +
      "#tchiloAdsPro .ap-badge.paused{background:#eee}" +
      "#tchiloAdsPro .ap-badge.cancelled{background:#ffd6e0}" +
      "#tchiloAdsPro .ap-badge.finished{background:#9ee0ff}" +
      "#tchiloAdsPro .ap-badge.rejected{background:#ffb4b4}" +
      "#tchiloAdsPro .ap-badge.deleted{background:#ccc}" +
      "#tchiloAdsPro .ap-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}" +
      "#tchiloAdsPro .ap-act{flex:1;min-width:110px;padding:12px;border:2.5px solid #0B0B0C;border-radius:12px;background:#fff;font:800 13px Inter,sans-serif;cursor:pointer}" +
      "#tchiloAdsPro .ap-act.danger{background:#ffd6e0}" +
      "#tchiloAdsPro .ap-act.primary{background:#c8f560}";
    document.head.appendChild(st);
  }

  function bodyEl() {
    return document.getElementById("apBody");
  }

  function root() {
    return document.getElementById("tchiloAdsPro");
  }

  function setTitle(t) {
    var h = document.getElementById("apTitle");
    if (h) h.textContent = t;
  }

  async function updateStatus(id, status) {
    var SB = sb();
    if (!SB || !id) return { error: "no-sb" };
    var patch = { status: status };
    try {
      patch.updated_at = new Date().toISOString();
    } catch (e) {}
    try {
      var res = await SB.from("ads").update(patch).eq("id", id).eq("user_id", meId());
      return res || {};
    } catch (e2) {
      return { error: e2 };
    }
  }

  async function renderManage() {
    ensureCSS();
    var el = root();
    if (!el) {
      alert("Abre o Gestor de Anuncios primeiro");
      return;
    }
    el.dataset.view = "manage";
    setTitle("Gerir anuncios");
    var body = bodyEl();
    if (!body) return;
    body.innerHTML = "<div class=\"ap-card\"><p>A carregar...</p></div>";

    var SB = sb();
    var uid = meId();
    if (!SB || !uid) {
      body.innerHTML =
        "<div class=\"ap-card\"><p>Inicia sessao para ver os anuncios.</p></div>";
      return;
    }

    try {
      var res = await SB.from("ads").select("*").eq("user_id", uid).order("created_at", {
        ascending: false
      });
      if (res && res.error) throw res.error;
      var rows = (res && res.data) || [];
      cache = rows;

      if (!rows.length) {
        body.innerHTML =
          "<div class=\"ap-card\"><h2>Sem anuncios</h2><p>Ainda nao criaste nenhum.</p></div>";
        return;
      }

      body.innerHTML =
        "<p style=\"margin:0 0 12px;font:700 13px Inter,sans-serif;opacity:.7\">Toca num anuncio para ver e gerir</p>" +
        rows
          .map(function (a, idx) {
            var st = normalizeStatus(a.status, a);
            if (st === "deleted") return "";
            var loc =
              a.target_label ||
              (a.target_lat != null
                ? Number(a.target_lat).toFixed(2) + ", " + Number(a.target_lng).toFixed(2)
                : "Global");
            var title = a.title || a.body || "Anuncio";
            if (title.length > 70) title = title.slice(0, 67) + "...";
            var imp = a.impressions != null ? a.impressions : 0;
            var reach = a.reach_max || a.reach_min || 0;
            return (
              "<div class=\"ap-card ap-ad-row\" data-idx=\"" +
              idx +
              "\" role=\"button\" tabindex=\"0\">" +
              "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:6px\">" +
              "<span class=\"ap-badge " +
              st +
              "\">" +
              esc(statusLabel(st)) +
              "</span>" +
              "<span style=\"font:700 11px Inter,sans-serif;opacity:.55\">" +
              (a.days || 0) +
              " dias</span></div>" +
              "<h2>" +
              esc(title) +
              "</h2>" +
              "<p>" +
              esc(loc) +
              " · " +
              imp +
              "/" +
              reach +
              " impressoes · toca para abrir</p></div>"
            );
          })
          .join("");

      body.querySelectorAll(".ap-ad-row").forEach(function (row) {
        row.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          var idx = parseInt(row.getAttribute("data-idx"), 10);
          var ad = cache[idx];
          if (ad) renderDetail(ad);
        };
      });
    } catch (e) {
      console.warn("[ads-manage]", e);
      body.innerHTML =
        "<div class=\"ap-card\"><p>Erro ao carregar. Confirma a tabela ads e as politicas RLS no Supabase.</p></div>";
    }
  }

  function renderDetail(ad) {
    ensureCSS();
    var el = root();
    if (!el || !ad) return;
    el.dataset.view = "detail";
    setTitle("Anuncio");
    var body = bodyEl();
    var st = normalizeStatus(ad.status, ad);
    var loc =
      ad.target_label ||
      (ad.target_lat != null ? ad.target_lat + ", " + ad.target_lng : "Todo o mundo");

    var media = "";
    if (ad.media_url) {
      if (String(ad.media_type || "").indexOf("video") >= 0) {
        media =
          "<video src=\"" +
          esc(ad.media_url) +
          "\" controls playsinline style=\"width:100%;max-height:200px;border-radius:12px;margin-top:8px\"></video>";
      } else {
        media =
          "<img src=\"" +
          esc(ad.media_url) +
          "\" alt=\"\" style=\"width:100%;max-height:200px;object-fit:cover;border-radius:12px;margin-top:8px\"/>";
      }
    }

    var actions = "";
    if (st === "active" || st === "pending") {
      actions += "<button type=\"button\" class=\"ap-act\" data-act=\"pause\">Pausar</button>";
      actions += "<button type=\"button\" class=\"ap-act danger\" data-act=\"cancel\">Cancelar</button>";
    }
    if (st === "paused") {
      actions += "<button type=\"button\" class=\"ap-act primary\" data-act=\"activate\">Reativar (Ativo)</button>";
      actions += "<button type=\"button\" class=\"ap-act danger\" data-act=\"cancel\">Cancelar</button>";
    }
    if (st === "pending") {
      actions += "<button type=\"button\" class=\"ap-act primary\" data-act=\"activate\">Ativar</button>";
    }
    if (st === "rejected") {
      actions += "<button type=\"button\" class=\"ap-act\" data-act=\"delete\">Apagar</button>";
    }
    if (st === "cancelled" || st === "finished") {
      actions += "<button type=\"button\" class=\"ap-act danger\" data-act=\"delete\">Apagar da lista</button>";
    }
    if (st !== "deleted" && st !== "rejected" && st !== "cancelled" && st !== "finished") {
      actions += "<button type=\"button\" class=\"ap-act danger\" data-act=\"delete\">Apagar</button>";
    }

    body.innerHTML =
      "<div class=\"ap-card\">" +
      "<span class=\"ap-badge " +
      st +
      "\">" +
      esc(statusLabel(st)) +
      "</span>" +
      "<h2 style=\"margin-top:10px\">" +
      esc(ad.title || ad.body || "Anuncio") +
      "</h2>" +
      "<p>" +
      esc(ad.body || "") +
      "</p>" +
      media +
      "</div>" +
      "<div class=\"ap-card\"><h2>Metricas</h2>" +
      "<p>Impressoes: <b>" +
      (ad.impressions != null ? ad.impressions : 0) +
      "</b> / " +
      (ad.reach_max || ad.reach_min || 0) +
      "</p>" +
      "<p>Cliques: <b>" +
      (ad.clicks != null ? ad.clicks : 0) +
      "</b></p>" +
      "<p>Conversas: <b>" +
      (ad.conversations != null ? ad.conversations : 0) +
      "</b></p>" +
      "<p>Dias: <b>" +
      (ad.days || 0) +
      "</b></p>" +
      "<p>Local: <b>" +
      esc(loc) +
      "</b></p>" +
      "<p>Tipo: <b>" +
      esc(ad.ad_type === "message" ? "Mensagem" : "Clique") +
      "</b></p>" +
      (ad.link_url ? "<p>Link: <b>" + esc(ad.link_url) + "</b></p>" : "") +
      "</div>" +
      "<div class=\"ap-actions\">" +
      actions +
      "</div>";

    body.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.onclick = async function () {
        var act = btn.getAttribute("data-act");
        var next = null;
        if (act === "pause") next = "paused";
        else if (act === "activate") next = "active";
        else if (act === "cancel") {
          if (!confirm("Cancelar este anuncio? Deixa de aparecer no feed.")) return;
          next = "cancelled";
        } else if (act === "delete") {
          if (!confirm("Apagar este anuncio?")) return;
          next = "deleted";
        }
        if (!next) return;
        btn.disabled = true;
        var old = btn.textContent;
        btn.textContent = "...";
        var r = await updateStatus(ad.id, next);
        if (r && r.error) {
          alert("Nao foi possivel atualizar o estado. Verifica o Supabase.");
          btn.disabled = false;
          btn.textContent = old;
          return;
        }
        ad.status = next;
        try {
          if (typeof showToast === "function") showToast("Estado: " + statusLabel(next));
        } catch (e) {}
        if (next === "deleted") renderManage();
        else renderDetail(ad);
      };
    });
  }

  function patchBack() {
    var el = root();
    if (!el) return;
    var back = el.querySelector("#apBack");
    if (!back || back.__managePatch) return;
    back.__managePatch = true;
    var prev = back.onclick;
    back.onclick = function (e) {
      if (el.dataset.view === "detail") {
        e && e.preventDefault && e.preventDefault();
        renderManage();
        return;
      }
      if (typeof prev === "function") return prev.apply(this, arguments);
    };
  }

  function patchManageEntry() {
    var el = root();
    if (!el) return;
    var btn = el.querySelector("#apGoManage");
    if (btn) {
      btn.onclick = function (e) {
        e && e.preventDefault && e.preventDefault();
        renderManage();
      };
    }
    // se ja estamos em manage com cards sem clique, re-render
    if (el.dataset.view === "manage") {
      var hasRow = el.querySelector(".ap-ad-row");
      var plain = el.querySelectorAll(".ap-card").length > 0 && !hasRow;
      if (plain && !el.__manageBooted) {
        el.__manageBooted = true;
        renderManage();
      }
    }
    patchBack();
  }

  // override global se ads-pro expuser renderManage
  window.tchiloRenderAdsManage = renderManage;
  window.tchiloRenderAdDetail = renderDetail;

  setInterval(patchManageEntry, 800);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      ensureCSS();
      patchManageEntry();
    });
  } else {
    ensureCSS();
    patchManageEntry();
  }
})();
