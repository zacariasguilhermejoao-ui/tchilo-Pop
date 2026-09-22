/**
 * tchilo-Pop — Pré-visualização real do anúncio (como no feed)
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }

  function me() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && s.username) return String(s.username);
      }
    } catch (e) {}
    return "tu";
  }

  function initials(name) {
    var n = String(name || "T").replace(/^@/, "");
    return (n.charAt(0) || "T").toUpperCase();
  }

  function ensureCSS() {
    if (document.getElementById("tchiloAdsPreviewCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsPreviewCSS";
    st.textContent =
      "#apLivePreviewWrap{margin:16px 0 8px}" +
      "#apLivePreviewWrap .ap-pv-label{font:800 11px Inter,sans-serif;text-transform:uppercase;letter-spacing:.06em;opacity:.55;margin:0 0 8px}" +
      "#apLivePreview.ap-feed-post{border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;overflow:hidden;background:var(--paper,#fff);color:var(--ink,#0B0B0C);box-shadow:3px 3px 0 rgba(0,0,0,.08)}" +
      "#apLivePreview .pv-head{display:flex;align-items:center;gap:10px;padding:10px 12px}" +
      "#apLivePreview .pv-av{width:36px;height:36px;border-radius:50%;background:#c8f560;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font:900 14px Inter,sans-serif;flex-shrink:0}" +
      "#apLivePreview .pv-who{flex:1;min-width:0}" +
      "#apLivePreview .pv-who b{display:block;font:800 13px Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "#apLivePreview .pv-who span{display:inline-block;margin-top:2px;padding:1px 7px;border-radius:999px;background:#c8f560;border:1.5px solid var(--ink,#0B0B0C);font:800 9px Inter,sans-serif;letter-spacing:.04em;text-transform:uppercase}" +
      "#apLivePreview .pv-follow{padding:5px 10px;border:2px solid var(--ink,#0B0B0C);border-radius:999px;background:#fff;font:800 11px Inter,sans-serif}" +
      "#apLivePreview .pv-media{position:relative;background:#111;min-height:160px;max-height:280px}" +
      "#apLivePreview .pv-media img,#apLivePreview .pv-media video{width:100%;max-height:280px;object-fit:cover;display:block}" +
      "#apLivePreview .pv-media .pv-ph{min-height:160px;display:flex;align-items:center;justify-content:center;color:#fff;font:700 13px Inter,sans-serif;opacity:.7;text-align:center;padding:20px}" +
      "#apLivePreview .pv-acts{display:flex;align-items:center;gap:16px;padding:10px 12px;border-top:1px solid rgba(0,0,0,.08)}" +
      "#apLivePreview .pv-acts i{font:800 13px Inter,sans-serif;font-style:normal;opacity:.85}" +
      "#apLivePreview .pv-cap{padding:0 12px 8px;font:600 14px Inter,sans-serif;line-height:1.35}" +
      "#apLivePreview .pv-cap b{margin-right:6px}" +
      "#apLivePreview .pv-cta{margin:0 12px 12px;display:block;width:calc(100% - 24px);box-sizing:border-box;padding:11px;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;background:#c8f560;font:900 13px Inter,sans-serif;text-align:center}" +
      "#apLivePreview .pv-meta{padding:0 12px 12px;font:600 11px Inter,sans-serif;opacity:.55}" +
      "#tchiloAdsPro .ap-preview{display:none!important}";
    document.head.appendChild(st);
  }

  function collectDraft() {
    var d = {
      title: "",
      body: "",
      mediaUrl: "",
      mediaType: "image",
      objective: "click",
      link: "",
      days: 3,
      city: "",
      province: "",
      country: "Angola"
    };
    try {
      var raw = localStorage.getItem("tchilo_ad_draft_pro");
      if (raw) {
        var j = JSON.parse(raw);
        if (j) {
          d.title = j.title || "";
          d.body = j.body || "";
          d.mediaUrl = j.mediaUrl || "";
          d.mediaType = j.mediaType || "image";
          d.objective = j.objective || "click";
          d.link = j.link || "";
          d.days = j.days || 3;
          if (j.location) {
            d.city = j.location.city || "";
            d.province = j.location.province || "";
            d.country = j.location.country || "AO";
          }
        }
      }
    } catch (e) {}
    var t = document.getElementById("apTitleIn");
    var b = document.getElementById("apBodyIn");
    var l = document.getElementById("apLink");
    var days = document.getElementById("apDays");
    if (t) d.title = t.value || d.title;
    if (b) d.body = b.value || d.body;
    if (l) d.link = l.value || d.link;
    if (days) d.days = parseInt(days.value, 10) || d.days;
    var objOn = document.querySelector("#apObj .ap-chip.on");
    if (objOn) d.objective = objOn.getAttribute("data-v") || d.objective;
    var city = document.getElementById("apCity");
    var prov = document.getElementById("apProvince");
    if (city && city.value) d.city = city.value;
    if (prov && prov.value) d.province = prov.value;
    var file = document.getElementById("apMediaFile");
    if (file && file.files && file.files[0] && file.__pvUrl) d.mediaUrl = file.__pvUrl;
    var selectedPost = document.querySelector("#apPostPick .ap-post-card.on img, #apPostPick .ap-post-card.on video");
    if (selectedPost && selectedPost.getAttribute("src")) {
      d.mediaUrl = selectedPost.getAttribute("src");
      d.mediaType = selectedPost.tagName.toLowerCase() === "video" ? "video" : "image";
    }
    return d;
  }

  function ctaLabel(obj) {
    if (obj === "message") return "Enviar mensagem";
    if (obj === "awareness") return "Ver mais";
    if (obj === "traffic") return "Visitar site";
    return "Saber mais";
  }

  function htmlPreview(d) {
    var user = me();
    var title = d.title || "Anúncio";
    var cap = d.body || "A tua descrição aparece aqui.";
    var loc = [d.city, d.province].filter(Boolean).join(", ") || "Localização no mapa";
    var media =
      d.mediaUrl
        ? d.mediaType === "video"
          ? '<video src="' + esc(d.mediaUrl) + '" muted playsinline controls></video>'
          : '<img src="' + esc(d.mediaUrl) + '" alt="">'
        : '<div class="pv-ph">A media do anúncio aparece aqui</div>';
    return (
      '<div class="ap-feed-post" id="apLivePreview">' +
      '<div class="pv-head">' +
      '<div class="pv-av">' +
      esc(initials(user)) +
      "</div>" +
      '<div class="pv-who"><b>@' +
      esc(user) +
      "</b><span>Anúncio</span></div>" +
      '<span class="pv-follow">Seguir</span></div>' +
      '<div class="pv-media">' +
      media +
      "</div>" +
      '<div class="pv-acts"><i>Gostar</i><i>Comentar</i><i>Partilhar</i></div>' +
      '<div class="pv-cap"><b>@' +
      esc(user) +
      "</b>" +
      esc(title) +
      (cap ? " — " + esc(cap) : "") +
      "</div>" +
      '<div class="pv-cta">' +
      esc(ctaLabel(d.objective)) +
      "</div>" +
      '<div class="pv-meta">' +
      esc(loc) +
      " · " +
      (d.days || 1) +
      " dias · aparece no feed como este post</div></div>"
    );
  }

  function mount() {
    ensureCSS();
    var body = document.getElementById("apBody");
    var shell = document.getElementById("tchiloAdsPro");
    if (!body || !shell || !shell.classList.contains("open")) return;
    var view = shell.dataset.view || "";
    if (view !== "create") {
      var old = document.getElementById("apLivePreviewWrap");
      if (old) old.remove();
      return;
    }
    var wrap = document.getElementById("apLivePreviewWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "apLivePreviewWrap";
      body.appendChild(wrap);
    }
    if (wrap.parentNode !== body) body.appendChild(wrap);
    wrap.innerHTML =
      '<div class="ap-pv-label">Pré-visualização no feed</div>' + htmlPreview(collectDraft());
  }

  function bindMediaUrl() {
    var file = document.getElementById("apMediaFile");
    if (!file || file.__pvBound) return;
    file.__pvBound = true;
    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      if (!f) return;
      try {
        if (file.__pvUrl && file.__pvUrl.indexOf("blob:") === 0) URL.revokeObjectURL(file.__pvUrl);
      } catch (e) {}
      file.__pvUrl = URL.createObjectURL(f);
      mount();
    });
  }

  function bootWatch() {
    bindMediaUrl();
    mount();
  }

  setInterval(bootWatch, 700);
  document.addEventListener("input", function (e) {
    if (!e.target) return;
    if (e.target.closest && e.target.closest("#tchiloAdsPro")) mount();
  });
  document.addEventListener("click", function (e) {
    if (!e.target) return;
    if (e.target.closest && e.target.closest("#tchiloAdsPro")) setTimeout(mount, 40);
  });
})();
