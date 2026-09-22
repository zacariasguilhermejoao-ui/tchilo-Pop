/**
 * tchilo-Pop — Gestor de Anúncios Profissional
 * Criar / Gerir · Localização real (mapa) · Métricas · CRM · Post ou media
 */
(function () {
  "use strict";

  /* —— Localização Angola (províncias + cidades principais) —— */
  var AO_PROVINCES = [
    { name: "Luanda", lat: -8.8383, lng: 13.2344, cities: ["Luanda", "Viana", "Cacuaco", "Belas", "Cazenga", "Kilamba"] },
    { name: "Benguela", lat: -12.5763, lng: 13.4055, cities: ["Benguela", "Lobito", "Catumbela", "Baía Farta"] },
    { name: "Huíla", lat: -14.918, lng: 13.503, cities: ["Lubango", "Humpata", "Chibia"] },
    { name: "Huambo", lat: -12.7761, lng: 15.7392, cities: ["Huambo", "Caála", "Longonjo"] },
    { name: "Cabinda", lat: -5.55, lng: 12.2, cities: ["Cabinda", "Belize"] },
    { name: "Cunene", lat: -17.05, lng: 15.73, cities: ["Ondjiva", "Xangongo"] },
    { name: "Cuando Cubango", lat: -16.25, lng: 19.0, cities: ["Menongue", "Cuito Cuanavale"] },
    { name: "Cuanza Norte", lat: -9.3, lng: 14.9, cities: ["Ndalatando", "Camabatela"] },
    { name: "Cuanza Sul", lat: -11.2, lng: 14.9, cities: ["Sumbe", "Porto Amboim"] },
    { name: "Lunda Norte", lat: -8.4, lng: 20.4, cities: ["Dundo", "Lucapa"] },
    { name: "Lunda Sul", lat: -10.7, lng: 20.0, cities: ["Saurimo"] },
    { name: "Malange", lat: -9.54, lng: 16.34, cities: ["Malanje"] },
    { name: "Moxico", lat: -11.66, lng: 20.39, cities: ["Luena"] },
    { name: "Namibe", lat: -15.19, lng: 12.15, cities: ["Moçâmedes", "Tômbua"] },
    { name: "Uíge", lat: -7.61, lng: 15.06, cities: ["Uíge", "Negage"] },
    { name: "Zaire", lat: -6.13, lng: 12.37, cities: ["M'banza-Kongo", "Soyo"] },
    { name: "Bengo", lat: -8.78, lng: 13.98, cities: ["Caxito"] },
    { name: "Bié", lat: -12.38, lng: 16.94, cities: ["Kuito"] }
  ];

  var COUNTRIES = [
    { code: "AO", name: "Angola", lat: -11.2, lng: 17.9, zoom: 6 },
    { code: "PT", name: "Portugal", lat: 39.4, lng: -8.2, zoom: 6 },
    { code: "BR", name: "Brasil", lat: -14.2, lng: -51.9, zoom: 4 },
    { code: "MZ", name: "Moçambique", lat: -18.7, lng: 35.5, zoom: 5 },
    { code: "CV", name: "Cabo Verde", lat: 16.0, lng: -24.0, zoom: 7 },
    { code: "ST", name: "São Tomé e Príncipe", lat: 0.3, lng: 6.6, zoom: 8 }
  ];

  var draft = {
    step: 1,
    source: "media", /* media | post */
    postId: null,
    mediaUrl: null,
    mediaType: null,
    title: "",
    body: "",
    objective: "click", /* click | message | traffic | awareness */
    link: "",
    days: 3,
    country: "AO",
    province: "",
    city: "",
    lat: -8.8383,
    lng: 13.2344,
    radiusKm: 25,
    ageMin: 18,
    ageMax: 55,
    gender: "all"
  };

  var map = null;
  var mapMarker = null;
  var mapCircle = null;
  var leafletReady = false;

  function toast(m) {
    try {
      if (typeof showToast === "function") showToast(m);
      else alert(m);
    } catch (e) {}
  }

  function me() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && s.username) return String(s.username);
      }
    } catch (e) {}
    return "";
  }

  function myPosts() {
    try {
      if (typeof getPosts !== "function") return [];
      var u = me();
      return (getPosts() || []).filter(function (p) {
        return p && p.username && String(p.username) === u;
      });
    } catch (e) {
      return [];
    }
  }

  function reachRange(days) {
    var d = Math.max(1, Math.min(30, parseInt(days, 10) || 1));
    return { min: d * 800, max: d * 1000, cost: d, days: d };
  }

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  /* —— CSS —— */
  function ensureCSS() {
    if (document.getElementById("tchiloAdsProCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsProCSS";
    st.textContent =
      "#tchiloAdsPro{display:none;position:fixed;inset:0;z-index:4200;background:var(--paper,#F7F6F2);color:var(--ink,#0B0B0C);flex-direction:column;font-family:Inter,system-ui,sans-serif}" +
      "#tchiloAdsPro.open{display:flex}" +
      "#tchiloAdsPro .ap-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:2.5px solid var(--ink,#0B0B0C);background:var(--paper,#F7F6F2);flex-shrink:0}" +
      "#tchiloAdsPro .ap-top h1{flex:1;margin:0;font:800 17px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-back,#tchiloAdsPro .ap-x{width:40px;height:40px;border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#FFE566;font:900 18px Inter,sans-serif;cursor:pointer}" +
      "#tchiloAdsPro .ap-body{flex:1;overflow:auto;padding:14px 14px calc(28px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}" +
      "#tchiloAdsPro .ap-card{border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;padding:14px;margin-bottom:12px;background:#fff;box-shadow:3px 3px 0 rgba(0,0,0,.08)}" +
      "#tchiloAdsPro .ap-card h2{margin:0 0 6px;font:800 15px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-card p{margin:0;font:600 13px Inter,sans-serif;opacity:.75;line-height:1.4}" +
      "#tchiloAdsPro .ap-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
      "#tchiloAdsPro .ap-btn{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:16px;border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;background:#fff;cursor:pointer;text-align:left;font:inherit;color:inherit;box-shadow:3px 3px 0 var(--ink,#0B0B0C)}" +
      "#tchiloAdsPro .ap-btn.primary{background:#c8f560}" +
      "#tchiloAdsPro .ap-btn b{font:900 15px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-btn span{font:600 12px Inter,sans-serif;opacity:.7}" +
      "#tchiloAdsPro label.ap-lab{display:block;font:800 11px Inter,sans-serif;text-transform:uppercase;letter-spacing:.04em;opacity:.65;margin:12px 0 6px}" +
      "#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select{width:100%;box-sizing:border-box;padding:12px;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;font:600 14px Inter,sans-serif;background:#fff;color:var(--ink,#0B0B0C)}" +
      "#tchiloAdsPro textarea{min-height:80px;resize:vertical}" +
      "#tchiloAdsPro .ap-chips{display:flex;flex-wrap:wrap;gap:8px}" +
      "#tchiloAdsPro .ap-chip{padding:8px 12px;border:2px solid var(--ink,#0B0B0C);border-radius:999px;font:800 12px Inter,sans-serif;background:#fff;cursor:pointer}" +
      "#tchiloAdsPro .ap-chip.on{background:#c8f560}" +
      "#tchiloAdsPro .ap-map{height:220px;border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;overflow:hidden;margin-top:8px;background:#e8e4dc}" +
      "#tchiloAdsPro .ap-reach{padding:12px;border:2.5px dashed var(--ink,#0B0B0C);border-radius:14px;background:#f1ecff;font:700 13px Inter,sans-serif;margin:12px 0}" +
      "#tchiloAdsPro .ap-pay{width:100%;margin-top:8px;padding:14px;border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:4px 4px 0 var(--ink,#0B0B0C);cursor:pointer}" +
      "#tchiloAdsPro .ap-steps{display:flex;gap:6px;margin-bottom:14px}" +
      "#tchiloAdsPro .ap-step{flex:1;height:4px;border-radius:4px;background:rgba(0,0,0,.12)}" +
      "#tchiloAdsPro .ap-step.on{background:var(--ink,#0B0B0C)}" +
      "#tchiloAdsPro .ap-metric{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
      "#tchiloAdsPro .ap-metric > div{border:2px solid var(--ink,#0B0B0C);border-radius:12px;padding:10px;background:#fff}" +
      "#tchiloAdsPro .ap-metric b{display:block;font:900 18px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-metric span{font:700 10px Inter,sans-serif;text-transform:uppercase;opacity:.6}" +
      "#tchiloAdsPro .ap-post-pick{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch}" +
      "#tchiloAdsPro .ap-post-card{flex:0 0 140px;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;overflow:hidden;background:#fff;cursor:pointer}" +
      "#tchiloAdsPro .ap-post-card.on{outline:3px solid #c8f560;outline-offset:2px}" +
      "#tchiloAdsPro .ap-post-card img,#tchiloAdsPro .ap-post-card video{width:100%;height:100px;object-fit:cover;display:block;background:#ddd}" +
      "#tchiloAdsPro .ap-post-card .cap{padding:6px 8px;font:700 11px Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "#tchiloAdsPro .ap-row{display:flex;gap:8px;align-items:center}" +
      "#tchiloAdsPro .ap-row > *{flex:1}" +
      "#tchiloAdsPro .ap-status{display:inline-block;padding:3px 8px;border-radius:999px;font:800 10px Inter,sans-serif;border:1.5px solid var(--ink,#0B0B0C)}" +
      "#tchiloAdsPro .ap-status.active{background:#c8f560}" +
      "#tchiloAdsPro .ap-status.paused{background:#ffe566}" +
      "#tchiloAdsPro .ap-status.expired{background:#eee}" +
      "#tchiloAdsPro .ap-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}" +
      "#tchiloAdsPro .ap-actions button{padding:8px 12px;border:2px solid var(--ink,#0B0B0C);border-radius:10px;background:#fff;font:800 12px Inter,sans-serif;cursor:pointer}" +
      "#tchiloAdsPro .ap-crm-item{border-bottom:1px solid rgba(0,0,0,.08);padding:10px 0}" +
      "#tchiloAdsPro .ap-crm-item b{font:800 13px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-crm-item span{display:block;font:600 12px Inter,sans-serif;opacity:.7;margin-top:2px}" +
      "#tchiloAdsPro .ap-empty{text-align:center;padding:28px 12px;opacity:.7;font:600 14px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-preview{border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;overflow:hidden;background:#fff;margin:10px 0}" +
      "#tchiloAdsPro .ap-preview img,#tchiloAdsPro .ap-preview video{width:100%;max-height:200px;object-fit:cover;display:block}" +
      "#tchiloAdsPro .ap-preview .pv-body{padding:10px}" +
      "#tchiloAdsPro .ap-preview .pv-label{font:800 10px Inter,sans-serif;text-transform:uppercase;opacity:.5;margin-bottom:4px}" +
      "#tchiloAdsPro .ap-search-list{max-height:140px;overflow:auto;border:2px solid var(--ink,#0B0B0C);border-radius:12px;margin-top:6px;background:#fff}" +
      "#tchiloAdsPro .ap-search-list button{display:block;width:100%;text-align:left;padding:10px 12px;border:0;border-bottom:1px solid rgba(0,0,0,.06);background:none;font:600 13px Inter,sans-serif;cursor:pointer}" +
      "#tchiloAdsPro .ap-search-list button:active{background:#f1ecff}";
    document.head.appendChild(st);
  }

  function loadLeaflet(cb) {
    if (leafletReady && window.L) {
      cb();
      return;
    }
    if (!document.getElementById("tchiloLeafletCSS")) {
      var l = document.createElement("link");
      l.id = "tchiloLeafletCSS";
      l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }
    if (window.L) {
      leafletReady = true;
      cb();
      return;
    }
    var s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = function () {
      leafletReady = true;
      cb();
    };
    s.onerror = function () {
      cb();
    };
    document.head.appendChild(s);
  }

  function root() {
    var el = document.getElementById("tchiloAdsPro");
    if (el) return el;
    el = document.createElement("div");
    el.id = "tchiloAdsPro";
    el.innerHTML =
      '<div class="ap-top">' +
      '<button type="button" class="ap-back" id="apBack" aria-label="Voltar">←</button>' +
      "<h1 id=\"apTitle\">Anúncios</h1>" +
      '<button type="button" class="ap-x" id="apClose" aria-label="Fechar">×</button>' +
      "</div>" +
      '<div class="ap-body" id="apBody"></div>';
    document.body.appendChild(el);
    el.querySelector("#apClose").onclick = close;
    el.querySelector("#apBack").onclick = function () {
      if (draft.step > 1 && el.dataset.view === "create") {
        draft.step--;
        renderCreate();
      } else if (el.dataset.view === "detail" || el.dataset.view === "crm" || el.dataset.view === "analytics") {
        renderManage();
      } else if (el.dataset.view === "create" || el.dataset.view === "manage") {
        renderHub();
      } else close();
    };
    return el;
  }

  function open() {
    ensureCSS();
    var el = root();
    el.classList.add("open");
    renderHub();
  }

  function close() {
    var el = document.getElementById("tchiloAdsPro");
    if (el) el.classList.remove("open");
    destroyMap();
  }

  function setTitle(t) {
    var h = document.getElementById("apTitle");
    if (h) h.textContent = t;
  }

  function body() {
    return document.getElementById("apBody");
  }

  /* —— HUB —— */
  function renderHub() {
    root().dataset.view = "hub";
    setTitle("Gestor de Anúncios");
    destroyMap();
    body().innerHTML =
      '<div class="ap-grid">' +
      '<button type="button" class="ap-btn primary" id="apGoCreate">' +
      "<b>Fazer anúncio</b><span>Foto, vídeo ou post · Localização · Pagamento</span></button>" +
      '<button type="button" class="ap-btn" id="apGoManage">' +
      "<b>Gerir anúncios</b><span>Métricas, editar, pausar, CRM</span></button>" +
      "</div>" +
      '<div class="ap-card" style="margin-top:14px">' +
      "<h2>Ferramentas</h2>" +
      '<div class="ap-grid" style="margin-top:10px">' +
      '<button type="button" class="ap-btn" id="apGoAnalytics"><b>Análises</b><span>Desempenho global</span></button>' +
      '<button type="button" class="ap-btn" id="apGoCrm"><b>CRM</b><span>Contactos e mensagens</span></button>' +
      "</div></div>" +
      '<div class="ap-card"><h2>Como funciona</h2>' +
      "<p>Escolhe o conteúdo, define o público (país, província, cidade no mapa), duração e paga. O anúncio entra no feed com etiqueta Anúncio e métricas em tempo real.</p></div>";

    document.getElementById("apGoCreate").onclick = function () {
      draft.step = 1;
      renderCreate();
    };
    document.getElementById("apGoManage").onclick = renderManage;
    document.getElementById("apGoAnalytics").onclick = renderAnalytics;
    document.getElementById("apGoCrm").onclick = renderCrm;
  }

  /* —— CREATE —— */
  function renderCreate() {
    root().dataset.view = "create";
    setTitle("Criar anúncio");
    var steps =
      '<div class="ap-steps">' +
      [1, 2, 3, 4]
        .map(function (i) {
          return '<div class="ap-step' + (i <= draft.step ? " on" : "") + '"></div>';
        })
        .join("") +
      "</div>";

    if (draft.step === 1) renderCreateStep1(steps);
    else if (draft.step === 2) renderCreateStep2(steps);
    else if (draft.step === 3) renderCreateStep3(steps);
    else renderCreateStep4(steps);
  }

  function renderCreateStep1(steps) {
    var posts = myPosts();
    body().innerHTML =
      steps +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Conteúdo</h2>" +
      '<div class="ap-chips">' +
      '<button type="button" class="ap-chip' +
      (draft.source === "media" ? " on" : "") +
      '" data-src="media">Foto / Vídeo</button>' +
      '<button type="button" class="ap-chip' +
      (draft.source === "post" ? " on" : "") +
      '" data-src="post">Post existente</button>' +
      "</div>" +
      '<div id="apSourceMedia" style="display:' +
      (draft.source === "media" ? "block" : "none") +
      ';margin-top:12px">' +
      '<label class="ap-lab">Carregar media</label>' +
      '<input type="file" id="apMediaFile" accept="image/*,video/*">' +
      '<label class="ap-lab">Título</label><input id="apTitleIn" value="' +
      esc(draft.title) +
      '" placeholder="Título do anúncio">' +
      '<label class="ap-lab">Descrição</label><textarea id="apBodyIn" placeholder="Texto do anúncio">' +
      esc(draft.body) +
      "</textarea></div>" +
      '<div id="apSourcePost" style="display:' +
      (draft.source === "post" ? "block" : "none") +
      ';margin-top:12px">' +
      (posts.length
        ? '<div class="ap-post-pick" id="apPostPick">' +
          posts
            .slice(0, 20)
            .map(function (p) {
              var media = p.media || p.image || p.video || "";
              var isVid = /\.(mp4|webm|mov)/i.test(media) || p.type === "video";
              return (
                '<div class="ap-post-card' +
                (String(draft.postId) === String(p.id) ? " on" : "") +
                '" data-id="' +
                esc(String(p.id)) +
                '">' +
                (isVid
                  ? '<video src="' + esc(media) + '" muted></video>'
                  : media
                    ? '<img src="' + esc(media) + '" alt="">'
                    : '<div style="height:100px;background:#eee"></div>') +
                '<div class="cap">' +
                esc((p.caption || p.text || "Post").slice(0, 40)) +
                "</div></div>"
              );
            })
            .join("") +
          "</div>"
        : '<div class="ap-empty">Ainda não tens posts. Publica no feed ou usa foto/vídeo.</div>') +
      "</div>" +
      '<button type="button" class="ap-pay" id="apNext1" style="margin-top:16px">Continuar</button>';

    body().querySelectorAll("[data-src]").forEach(function (c) {
      c.onclick = function () {
        draft.source = c.getAttribute("data-src");
        renderCreateStep1(steps);
      };
    });
    var file = document.getElementById("apMediaFile");
    if (file)
      file.onchange = function () {
        var f = file.files && file.files[0];
        if (!f) return;
        draft.mediaType = f.type.indexOf("video") >= 0 ? "video" : "image";
        var reader = new FileReader();
        reader.onload = function () {
          draft.mediaUrl = reader.result;
          toast("Media pronta");
        };
        reader.readAsDataURL(f);
      };
    body().querySelectorAll(".ap-post-card").forEach(function (card) {
      card.onclick = function () {
        draft.postId = card.getAttribute("data-id");
        body().querySelectorAll(".ap-post-card").forEach(function (x) {
          x.classList.toggle("on", x === card);
        });
      };
    });
    document.getElementById("apNext1").onclick = function () {
      if (draft.source === "media") {
        draft.title = (document.getElementById("apTitleIn") || {}).value || "";
        draft.body = (document.getElementById("apBodyIn") || {}).value || "";
        if (!draft.mediaUrl && !draft.title && !draft.body) {
          toast("Carrega uma foto/vídeo ou escreve o texto");
          return;
        }
      } else {
        if (!draft.postId) {
          toast("Escolhe um post");
          return;
        }
        var p = myPosts().find(function (x) {
          return String(x.id) === String(draft.postId);
        });
        if (p) {
          draft.mediaUrl = p.media || p.image || p.video || draft.mediaUrl;
          draft.body = p.caption || p.text || draft.body;
          draft.title = draft.title || "@" + (p.username || me());
        }
      }
      draft.step = 2;
      renderCreate();
    };
  }

  function renderCreateStep2(steps) {
    body().innerHTML =
      steps +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Objectivo</h2>" +
      '<div class="ap-chips" id="apObj">' +
      chip("click", "Cliques / Site", draft.objective) +
      chip("message", "Mensagens", draft.objective) +
      chip("traffic", "Tráfego", draft.objective) +
      chip("awareness", "Alcance", draft.objective) +
      "</div>" +
      '<label class="ap-lab">Link (site externo)</label>' +
      '<input id="apLink" placeholder="https://…" value="' +
      esc(draft.link) +
      '">' +
      '<p style="font:600 12px Inter,sans-serif;opacity:.65;margin:8px 0 0">Só links de sites. Sem WhatsApp nem apps externas.</p>' +
      '<button type="button" class="ap-pay" id="apNext2" style="margin-top:16px">Continuar</button>';

    body().querySelectorAll("#apObj .ap-chip").forEach(function (c) {
      c.onclick = function () {
        draft.objective = c.getAttribute("data-v");
        body().querySelectorAll("#apObj .ap-chip").forEach(function (x) {
          x.classList.toggle("on", x === c);
        });
      };
    });
    document.getElementById("apNext2").onclick = function () {
      draft.link = (document.getElementById("apLink") || {}).value || "";
      if ((draft.objective === "click" || draft.objective === "traffic") && draft.link) {
        if (!/^https?:\/\//i.test(draft.link)) {
          toast("O link deve começar por http:// ou https://");
          return;
        }
      }
      draft.step = 3;
      renderCreate();
    };
  }

  function chip(v, label, cur) {
    return (
      '<button type="button" class="ap-chip' +
      (cur === v ? " on" : "") +
      '" data-v="' +
      v +
      '">' +
      label +
      "</button>"
    );
  }

  function renderCreateStep3(steps) {
    var provOpts = AO_PROVINCES.map(function (p) {
      return (
        "<option value=\"" +
        esc(p.name) +
        '"' +
        (draft.province === p.name ? " selected" : "") +
        ">" +
        esc(p.name) +
        "</option>"
      );
    }).join("");
    var countryOpts = COUNTRIES.map(function (c) {
      return (
        "<option value=\"" +
        c.code +
        '"' +
        (draft.country === c.code ? " selected" : "") +
        ">" +
        esc(c.name) +
        "</option>"
      );
    }).join("");

    body().innerHTML =
      steps +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Localização e público</h2>" +
      '<label class="ap-lab">País</label><select id="apCountry">' +
      countryOpts +
      "</select>" +
      '<label class="ap-lab">Província (Angola)</label><select id="apProvince"><option value="">Todo o país</option>' +
      provOpts +
      "</select>" +
      '<label class="ap-lab">Cidade</label><select id="apCity"><option value="">Todas</option></select>' +
      '<label class="ap-lab">Procurar local</label>' +
      '<input id="apLocSearch" placeholder="Ex: Luanda, Lobito, Huambo…">' +
      '<div class="ap-search-list" id="apLocResults" style="display:none"></div>' +
      '<div class="ap-map" id="apMap"></div>' +
      '<label class="ap-lab">Raio (km)</label>' +
      '<input type="range" id="apRadius" min="5" max="150" value="' +
      draft.radiusKm +
      '">' +
      '<div style="font:700 12px Inter,sans-serif;opacity:.7" id="apRadiusLbl">' +
      draft.radiusKm +
      " km</div>" +
      '<div class="ap-row">' +
      "<div><label class=\"ap-lab\">Idade mín.</label><input type=\"number\" id=\"apAgeMin\" min=\"13\" max=\"65\" value=\"" +
      draft.ageMin +
      '"></div>' +
      "<div><label class=\"ap-lab\">Idade máx.</label><input type=\"number\" id=\"apAgeMax\" min=\"13\" max=\"65\" value=\"" +
      draft.ageMax +
      '"></div></div>' +
      '<label class="ap-lab">Género</label><select id="apGender">' +
      '<option value="all"' +
      (draft.gender === "all" ? " selected" : "") +
      ">Todos</option>' +
      '<option value="f"' +
      (draft.gender === "f" ? " selected" : "") +
      ">Feminino</option>' +
      '<option value="m"' +
      (draft.gender === "m" ? " selected" : "") +
      ">Masculino</option></select>' +
      '<button type="button" class="ap-pay" id="apNext3" style="margin-top:16px">Continuar</button>';

    fillCities();
    document.getElementById("apProvince").onchange = function () {
      draft.province = this.value;
      fillCities();
      focusProvince();
    };
    document.getElementById("apCountry").onchange = function () {
      draft.country = this.value;
      focusCountry();
    };
    document.getElementById("apCity").onchange = function () {
      draft.city = this.value;
      focusCity();
    };
    document.getElementById("apRadius").oninput = function () {
      draft.radiusKm = parseInt(this.value, 10) || 25;
      document.getElementById("apRadiusLbl").textContent = draft.radiusKm + " km";
      updateMapCircle();
    };
    document.getElementById("apLocSearch").oninput = function () {
      searchLoc(this.value);
    };
    document.getElementById("apNext3").onclick = function () {
      draft.ageMin = parseInt(document.getElementById("apAgeMin").value, 10) || 18;
      draft.ageMax = parseInt(document.getElementById("apAgeMax").value, 10) || 55;
      draft.gender = document.getElementById("apGender").value;
      draft.step = 4;
      renderCreate();
    };

    loadLeaflet(function () {
      initMap();
    });
  }

  function fillCities() {
    var sel = document.getElementById("apCity");
    if (!sel) return;
    var prov = AO_PROVINCES.find(function (p) {
      return p.name === draft.province;
    });
    sel.innerHTML = '<option value="">Todas</option>';
    if (prov) {
      prov.cities.forEach(function (c) {
        var o = document.createElement("option");
        o.value = c;
        o.textContent = c;
        if (draft.city === c) o.selected = true;
        sel.appendChild(o);
      });
    }
  }

  function destroyMap() {
    try {
      if (map) {
        map.remove();
        map = null;
        mapMarker = null;
        mapCircle = null;
      }
    } catch (e) {}
  }

  function initMap() {
    var el = document.getElementById("apMap");
    if (!el || !window.L) return;
    destroyMap();
    map = L.map(el, { zoomControl: true }).setView([draft.lat, draft.lng], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 18
    }).addTo(map);
    mapMarker = L.marker([draft.lat, draft.lng], { draggable: true }).addTo(map);
    mapMarker.on("dragend", function () {
      var p = mapMarker.getLatLng();
      draft.lat = p.lat;
      draft.lng = p.lng;
      updateMapCircle();
    });
    map.on("click", function (e) {
      draft.lat = e.latlng.lat;
      draft.lng = e.latlng.lng;
      mapMarker.setLatLng(e.latlng);
      updateMapCircle();
    });
    updateMapCircle();
    setTimeout(function () {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 200);
  }

  function updateMapCircle() {
    if (!map || !window.L) return;
    if (mapCircle) map.removeLayer(mapCircle);
    mapCircle = L.circle([draft.lat, draft.lng], {
      radius: draft.radiusKm * 1000,
      color: "#0B0B0C",
      weight: 2,
      fillColor: "#c8f560",
      fillOpacity: 0.2
    }).addTo(map);
  }

  function focusCountry() {
    var c = COUNTRIES.find(function (x) {
      return x.code === draft.country;
    });
    if (!c || !map) return;
    draft.lat = c.lat;
    draft.lng = c.lng;
    map.setView([c.lat, c.lng], c.zoom || 6);
    if (mapMarker) mapMarker.setLatLng([c.lat, c.lng]);
    updateMapCircle();
  }

  function focusProvince() {
    var p = AO_PROVINCES.find(function (x) {
      return x.name === draft.province;
    });
    if (!p || !map) return;
    draft.lat = p.lat;
    draft.lng = p.lng;
    map.setView([p.lat, p.lng], 10);
    if (mapMarker) mapMarker.setLatLng([p.lat, p.lng]);
    updateMapCircle();
  }

  function focusCity() {
    /* usa coordenadas da província; busca OSM se possível */
    if (!draft.city) return;
    searchNominatim(draft.city + ", " + (draft.province || "Angola"), true);
  }

  function searchLoc(q) {
    var box = document.getElementById("apLocResults");
    if (!box) return;
    q = (q || "").trim().toLowerCase();
    if (q.length < 2) {
      box.style.display = "none";
      return;
    }
    var hits = [];
    AO_PROVINCES.forEach(function (p) {
      if (p.name.toLowerCase().indexOf(q) >= 0) hits.push({ label: p.name + " (província)", lat: p.lat, lng: p.lng, province: p.name, city: "" });
      p.cities.forEach(function (c) {
        if (c.toLowerCase().indexOf(q) >= 0)
          hits.push({ label: c + ", " + p.name, lat: p.lat, lng: p.lng, province: p.name, city: c });
      });
    });
    COUNTRIES.forEach(function (c) {
      if (c.name.toLowerCase().indexOf(q) >= 0)
        hits.push({ label: c.name, lat: c.lat, lng: c.lng, province: "", city: "", country: c.code });
    });
    if (!hits.length) {
      box.style.display = "none";
      return;
    }
    box.style.display = "block";
    box.innerHTML = hits
      .slice(0, 12)
      .map(function (h, i) {
        return (
          '<button type="button" data-i="' +
          i +
          '">' +
          esc(h.label) +
          "</button>"
        );
      })
      .join("");
    box.querySelectorAll("button").forEach(function (btn) {
      btn.onclick = function () {
        var h = hits[parseInt(btn.getAttribute("data-i"), 10)];
        if (!h) return;
        draft.lat = h.lat;
        draft.lng = h.lng;
        if (h.province) draft.province = h.province;
        if (h.city != null) draft.city = h.city;
        if (h.country) draft.country = h.country;
        box.style.display = "none";
        if (map) {
          map.setView([h.lat, h.lng], 11);
          if (mapMarker) mapMarker.setLatLng([h.lat, h.lng]);
          updateMapCircle();
        }
        var ps = document.getElementById("apProvince");
        if (ps && h.province) ps.value = h.province;
        fillCities();
      };
    });
  }

  function searchNominatim(q, silent) {
    if (!q) return;
    fetch(
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
        encodeURIComponent(q),
      { headers: { Accept: "application/json" } }
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data || !data[0]) {
          if (!silent) toast("Local não encontrado");
          return;
        }
        draft.lat = parseFloat(data[0].lat);
        draft.lng = parseFloat(data[0].lon);
        if (map) {
          map.setView([draft.lat, draft.lng], 12);
          if (mapMarker) mapMarker.setLatLng([draft.lat, draft.lng]);
          updateMapCircle();
        }
      })
      .catch(function () {});
  }

  function renderCreateStep4(steps) {
    var r = reachRange(draft.days);
    var locLabel =
      [draft.city, draft.province, countryName(draft.country)].filter(Boolean).join(", ") ||
      "Área no mapa";
    body().innerHTML =
      steps +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Orçamento e revisão</h2>" +
      '<label class="ap-lab">Duração (dias)</label>' +
      '<input type="range" id="apDays" min="1" max="30" value="' +
      draft.days +
      '">' +
      '<div id="apDaysLbl" style="font:800 14px Inter,sans-serif">' +
      draft.days +
      " dias · $" +
      draft.days +
      "</div>" +
      '<div class="ap-reach" id="apReach">Alcance estimado: ' +
      fmt(r.min) +
      " – " +
      fmt(r.max) +
      " pessoas</div>" +
      '<div class="ap-preview">' +
      (draft.mediaUrl
        ? draft.mediaType === "video"
          ? '<video src="' + esc(draft.mediaUrl) + '" controls></video>'
          : '<img src="' + esc(draft.mediaUrl) + '" alt="">'
        : "") +
      '<div class="pv-body"><div class="pv-label">Pré-visualização · Anúncio</div>' +
      "<b>" +
      esc(draft.title || "Anúncio") +
      "</b><p style=\"margin:4px 0 0;font:600 13px Inter,sans-serif\">" +
      esc(draft.body || "") +
      "</p>" +
      "<p style=\"margin:8px 0 0;font:700 11px Inter,sans-serif;opacity:.6\">" +
      esc(locLabel) +
      " · " +
      draft.radiusKm +
      " km · " +
      draft.ageMin +
      "–" +
      draft.ageMax +
      " anos</p></div></div>" +
      '<button type="button" class="ap-pay" id="apPay">Pagar e publicar · $' +
      draft.days +
      "</button>";

    document.getElementById("apDays").oninput = function () {
      draft.days = parseInt(this.value, 10) || 1;
      var rr = reachRange(draft.days);
      document.getElementById("apDaysLbl").textContent =
        draft.days + " dias · $" + draft.days;
      document.getElementById("apReach").textContent =
        "Alcance estimado: " + fmt(rr.min) + " – " + fmt(rr.max) + " pessoas";
      document.getElementById("apPay").textContent =
        "Pagar e publicar · $" + draft.days;
    };
    document.getElementById("apPay").onclick = checkout;
  }

  function countryName(code) {
    var c = COUNTRIES.find(function (x) {
      return x.code === code;
    });
    return c ? c.name : code;
  }

  function checkout() {
    try {
      localStorage.setItem(
        "tchilo_ad_draft_pro",
        JSON.stringify({
          title: draft.title,
          body: draft.body,
          objective: draft.objective,
          link: draft.link,
          days: draft.days,
          mediaUrl: (draft.mediaUrl || "").slice(0, 500000),
          mediaType: draft.mediaType,
          postId: draft.postId,
          location: {
            country: draft.country,
            province: draft.province,
            city: draft.city,
            lat: draft.lat,
            lng: draft.lng,
            radiusKm: draft.radiusKm
          },
          audience: { ageMin: draft.ageMin, ageMax: draft.ageMax, gender: draft.gender },
          username: me(),
          createdAt: Date.now()
        })
      );
    } catch (e) {}

    var priceId =
      window.TCHILO_AD_PRICE_ID ||
      "pri_01m31nb48pzvs976yz2nd1wtbp";
    var qty = Math.max(1, Math.min(30, draft.days));

    try {
      if (typeof window.tchiloOpenPaddleCheckout === "function") {
        window.tchiloOpenPaddleCheckout(priceId, qty);
        toast("A abrir pagamento…");
        return;
      }
    } catch (e2) {}

    try {
      if (window.Paddle && window.Paddle.Checkout) {
        window.Paddle.Checkout.open({
          items: [{ priceId: priceId, quantity: qty }]
        });
        return;
      }
    } catch (e3) {}

    toast("Checkout indisponível. Verifica o Paddle.");
  }

  /* —— MANAGE —— */
  function loadLocalAds() {
    try {
      var raw = localStorage.getItem("tchilo_my_ads");
      if (raw) return JSON.parse(raw) || [];
    } catch (e) {}
    return [];
  }

  function saveLocalAds(list) {
    try {
      localStorage.setItem("tchilo_my_ads", JSON.stringify(list));
    } catch (e) {}
  }

  async function fetchCloudAds() {
    var SB = window.SB || window.tchiloSupabase;
    if (!SB) return loadLocalAds();
    try {
      var u = me();
      var res = await SB.from("ads")
        .select("*")
        .or("owner_username.eq." + u + ",username.eq." + u)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!res.error && res.data) return res.data;
    } catch (e) {}
    return loadLocalAds();
  }

  function renderManage() {
    root().dataset.view = "manage";
    setTitle("Gerir anúncios");
    destroyMap();
    body().innerHTML = '<div class="ap-empty">A carregar…</div>';
    fetchCloudAds().then(function (list) {
      if (!list.length) {
        body().innerHTML =
          '<div class="ap-empty">Ainda não tens anúncios.</div>' +
          '<button type="button" class="ap-pay" id="apEmptyCreate">Fazer anúncio</button>';
        document.getElementById("apEmptyCreate").onclick = function () {
          draft.step = 1;
          renderCreate();
        };
        return;
      }
      body().innerHTML = list
        .map(function (ad, i) {
          var status = ad.status || ad.state || "active";
          var imp = ad.impressions_used || ad.impressions || 0;
          var total = ad.reach_max || ad.reach_total || ad.days * 1000 || 1000;
          var clicks = ad.clicks || 0;
          var msgs = ad.messages_started || ad.conversations || 0;
          return (
            '<div class="ap-card" data-ad-i="' +
            i +
            '">' +
            "<div style=\"display:flex;justify-content:space-between;align-items:center;gap:8px\">" +
            "<h2 style=\"margin:0\">" +
            esc(ad.title || ad.content || "Anúncio") +
            "</h2>" +
            '<span class="ap-status ' +
            esc(status) +
            '">' +
            esc(status) +
            "</span></div>" +
            "<p style=\"margin:6px 0 10px\">" +
            esc((ad.body || ad.description || "").slice(0, 100)) +
            "</p>" +
            '<div class="ap-metric">' +
            "<div><span>Impressões</span><b>" +
            fmt(imp) +
            "</b></div>" +
            "<div><span>Alcance alvo</span><b>" +
            fmt(total) +
            "</b></div>" +
            "<div><span>Cliques</span><b>" +
            fmt(clicks) +
            "</b></div>" +
            "<div><span>Mensagens</span><b>" +
            fmt(msgs) +
            "</b></div></div>" +
            '<div class="ap-actions">' +
            '<button type="button" data-act="detail" data-i="' +
            i +
            '">Detalhe</button>' +
            '<button type="button" data-act="pause" data-i="' +
            i +
            '">" +
            (status === "paused" ? "Reativar" : "Pausar") +
            "</button>" +
            '<button type="button" data-act="crm" data-i="' +
            i +
            '">CRM</button>' +
            "</div></div>"
          );
        })
        .join("");

      window.__tchiloAdsList = list;
      body().querySelectorAll("[data-act]").forEach(function (btn) {
        btn.onclick = function () {
          var i = parseInt(btn.getAttribute("data-i"), 10);
          var act = btn.getAttribute("data-act");
          var ad = list[i];
          if (!ad) return;
          if (act === "detail") renderDetail(ad);
          else if (act === "crm") renderCrm(ad);
          else if (act === "pause") togglePause(ad, list);
        };
      });
    });
  }

  function togglePause(ad, list) {
    var next = (ad.status || ad.state) === "paused" ? "active" : "paused";
    ad.status = next;
    ad.state = next;
    saveLocalAds(list);
    var SB = window.SB || window.tchiloSupabase;
    if (SB && ad.id) {
      SB.from("ads").update({ status: next, state: next }).eq("id", ad.id).then(function () {});
    }
    toast(next === "paused" ? "Anúncio pausado" : "Anúncio ativo");
    renderManage();
  }

  function renderDetail(ad) {
    root().dataset.view = "detail";
    setTitle("Detalhe");
    var imp = ad.impressions_used || ad.impressions || 0;
    var clicks = ad.clicks || 0;
    var ctr = imp ? ((clicks / imp) * 100).toFixed(2) : "0.00";
    body().innerHTML =
      '<div class="ap-card"><h2>' +
      esc(ad.title || "Anúncio") +
      "</h2><p>" +
      esc(ad.body || "") +
      "</p></div>" +
      '<div class="ap-metric">' +
      "<div><span>Impressões</span><b>" +
      fmt(imp) +
      "</b></div>" +
      "<div><span>Cliques</span><b>" +
      fmt(clicks) +
      "</b></div>" +
      "<div><span>CTR</span><b>" +
      ctr +
      "%</b></div>" +
      "<div><span>Mensagens</span><b>" +
      fmt(ad.messages_started || 0) +
      "</b></div></div>" +
      '<div class="ap-card" style="margin-top:12px"><h2>Localização</h2><p>' +
      esc(
        JSON.stringify(ad.location || ad.targeting || "—")
          .replace(/[{}"]/g, " ")
          .slice(0, 120)
      ) +
      "</p></div>";
  }

  /* —— ANALYTICS —— */
  function renderAnalytics() {
    root().dataset.view = "analytics";
    setTitle("Análises");
    body().innerHTML = '<div class="ap-empty">A carregar métricas…</div>';
    fetchCloudAds().then(function (list) {
      var imp = 0,
        clicks = 0,
        msgs = 0,
        active = 0;
      list.forEach(function (a) {
        imp += a.impressions_used || a.impressions || 0;
        clicks += a.clicks || 0;
        msgs += a.messages_started || a.conversations || 0;
        if ((a.status || a.state || "active") === "active") active++;
      });
      var ctr = imp ? ((clicks / imp) * 100).toFixed(2) : "0.00";
      body().innerHTML =
        '<div class="ap-metric">' +
        "<div><span>Impressões totais</span><b>" +
        fmt(imp) +
        "</b></div>" +
        "<div><span>Cliques</span><b>" +
        fmt(clicks) +
        "</b></div>" +
        "<div><span>CTR médio</span><b>" +
        ctr +
        "%</b></div>" +
        "<div><span>Conversas</span><b>" +
        fmt(msgs) +
        "</b></div>" +
        "<div><span>Anúncios ativos</span><b>" +
        active +
        "</b></div>" +
        "<div><span>Campanhas</span><b>" +
        list.length +
        "</b></div></div>" +
        '<div class="ap-card" style="margin-top:14px"><h2>Dicas</h2>' +
        "<p>Aumenta o raio e os dias para mais alcance. Objectivo Mensagens gera conversas no Tchilo. Usa posts com boa imagem para melhor CTR.</p></div>";
    });
  }

  /* —— CRM —— */
  function renderCrm(ad) {
    root().dataset.view = "crm";
    setTitle("CRM");
    var leads = [];
    try {
      leads = JSON.parse(localStorage.getItem("tchilo_ad_leads") || "[]");
    } catch (e) {}
    if (ad && ad.id) {
      leads = leads.filter(function (l) {
        return String(l.adId) === String(ad.id);
      });
    }
    body().innerHTML =
      '<div class="ap-card"><h2>Contactos de anúncios</h2>' +
      "<p>Pessoas que clicaram em Mensagem ou iniciaram conversa a partir dos teus anúncios.</p></div>" +
      (leads.length
        ? leads
            .map(function (l) {
              return (
                '<div class="ap-crm-item"><b>@' +
                esc(l.username || "utilizador") +
                "</b><span>" +
                esc(l.action || "mensagem") +
                " · " +
                esc(l.at ? new Date(l.at).toLocaleString() : "") +
                "</span></div>"
              );
            })
            .join("")
        : '<div class="ap-empty">Ainda sem contactos. Quando alguém responder a um anúncio de Mensagem, aparece aqui.</div>');
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }

  /* —— Entry points —— */
  window.tchiloOpenAdsPro = open;
  window.tchiloOpenAdsManager = open;

  function hookManagerBtn() {
    var btn = document.getElementById("tchiloAdsMgrBtn");
    if (btn && !btn.__pro) {
      btn.__pro = true;
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      };
    }
    /* intercept openCreate genérico */
    if (typeof window.tchiloOpenAdsCreate === "function" && !window.tchiloOpenAdsCreate.__pro) {
      window.tchiloOpenAdsCreate = function () {
        open();
        setTimeout(function () {
          draft.step = 1;
          renderCreate();
        }, 50);
      };
      window.tchiloOpenAdsCreate.__pro = true;
    }
  }

  function boot() {
    ensureCSS();
    hookManagerBtn();
  }

  setInterval(hookManagerBtn, 1500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 500);
})();
