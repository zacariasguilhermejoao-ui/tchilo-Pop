/**
 * tchilo-Pop — Gestor de Anúncios Profissional (versão estável)
 */
(function () {
  "use strict";

  var PRICE_AD = "pri_01m31nb48pzvs976yz2nd1wtbp";
  var PADDLE_TOKEN = "live_05be77c7629150c894e94e62559";

  var AO_PROVINCES = [
    { name: "Luanda", lat: -8.84, lng: 13.23, cities: ["Luanda", "Viana", "Cacuaco", "Belas", "Cazenga"] },
    { name: "Benguela", lat: -12.58, lng: 13.41, cities: ["Benguela", "Lobito", "Catumbela"] },
    { name: "Huíla", lat: -14.92, lng: 13.5, cities: ["Lubango", "Humpata"] },
    { name: "Huambo", lat: -12.78, lng: 15.73, cities: ["Huambo", "Caála"] },
    { name: "Cabinda", lat: -5.55, lng: 12.19, cities: ["Cabinda"] },
    { name: "Uíge", lat: -7.61, lng: 15.06, cities: ["Uíge", "Negage"] },
    { name: "Malanje", lat: -9.54, lng: 16.34, cities: ["Malanje"] },
    { name: "Cunene", lat: -17.06, lng: 15.73, cities: ["Ondjiva"] },
    { name: "Namibe", lat: -15.2, lng: 12.15, cities: ["Moçâmedes"] },
    { name: "Zaire", lat: -6.13, lng: 12.37, cities: ["M'banza-Kongo", "Soyo"] }
  ];

  var draft = {
    step: 1,
    source: "media",
    postId: null,
    mediaUrl: null,
    mediaType: null,
    title: "",
    body: "",
    objective: "click",
    link: "",
    days: 3,
    country: "AO",
    province: "Luanda",
    city: "",
    ageMin: 18,
    ageMax: 45,
    gender: "all"
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
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

  function meName() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && s.username) return String(s.username);
      }
    } catch (e) {}
    return "tu";
  }

  function ensureCSS() {
    if (document.getElementById("tchiloAdsProCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsProCSS";
    st.textContent =
      "#tchiloAdsPro{display:none;position:fixed;inset:0;z-index:9999;background:var(--paper,#F7F6F2);color:var(--ink,#0B0B0C);flex-direction:column;font-family:Inter,system-ui,sans-serif}" +
      "#tchiloAdsPro.open{display:flex!important}" +
      "#tchiloAdsPro .ap-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:2.5px solid var(--ink,#0B0B0C);flex-shrink:0}" +
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
      "#tchiloAdsPro textarea{min-height:90px}" +
      "#tchiloAdsPro .ap-chips{display:flex;flex-wrap:wrap;gap:8px}" +
      "#tchiloAdsPro .ap-chip{padding:8px 12px;border:2px solid var(--ink,#0B0B0C);border-radius:999px;font:800 12px Inter,sans-serif;background:#fff;cursor:pointer}" +
      "#tchiloAdsPro .ap-chip.on{background:#c8f560}" +
      "#tchiloAdsPro .ap-reach{padding:12px;border:2.5px dashed var(--ink,#0B0B0C);border-radius:14px;background:#f1ecff;font:700 13px Inter,sans-serif;margin:12px 0}" +
      "#tchiloAdsPro .ap-pay{width:100%;margin-top:8px;padding:14px;border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:4px 4px 0 var(--ink,#0B0B0C);cursor:pointer}" +
      "#tchiloAdsPro .ap-steps{display:flex;gap:6px;margin-bottom:14px}" +
      "#tchiloAdsPro .ap-step{flex:1;height:4px;border-radius:4px;background:rgba(0,0,0,.12)}" +
      "#tchiloAdsPro .ap-step.on{background:var(--ink,#0B0B0C)}" +
      "#tchiloAdsPro .ap-preview{border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;overflow:hidden;background:#fff;margin-top:12px}" +
      "#tchiloAdsPro .ap-preview .pv-head{display:flex;align-items:center;gap:10px;padding:10px 12px}" +
      "#tchiloAdsPro .ap-preview .pv-av{width:36px;height:36px;border-radius:50%;background:#c8f560;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font:900 14px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-preview .pv-media{min-height:140px;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;font:700 13px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-preview .pv-media img,#tchiloAdsPro .ap-preview .pv-media video{width:100%;max-height:240px;object-fit:cover;display:block}" +
      "#tchiloAdsPro .ap-preview .pv-cap{padding:10px 12px;font:600 14px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-preview .pv-cta{margin:0 12px 12px;padding:11px;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;background:#c8f560;font:900 13px Inter,sans-serif;text-align:center}";
    document.head.appendChild(st);
  }

  function root() {
    var el = document.getElementById("tchiloAdsPro");
    if (el) return el;
    el = document.createElement("div");
    el.id = "tchiloAdsPro";
    el.innerHTML =
      '<div class="ap-top">' +
      '<button type="button" class="ap-back" id="apBack" aria-label="Voltar">←</button>' +
      '<h1 id="apTitle">Anúncios</h1>' +
      '<button type="button" class="ap-x" id="apClose" aria-label="Fechar">×</button>' +
      "</div>" +
      '<div class="ap-body" id="apBody"></div>';
    document.body.appendChild(el);
    el.querySelector("#apClose").onclick = close;
    el.querySelector("#apBack").onclick = function () {
      if (draft.step > 1 && el.dataset.view === "create") {
        draft.step--;
        renderCreate();
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
  }

  function setTitle(t) {
    var h = document.getElementById("apTitle");
    if (h) h.textContent = t;
  }

  function body() {
    return document.getElementById("apBody");
  }

  function reachText(days) {
    var d = Math.max(1, Math.min(30, parseInt(days, 10) || 1));
    return (
      d +
      " dias = $" +
      d +
      " · alcance estimado de " +
      (d * 800).toLocaleString("pt-PT") +
      " a " +
      (d * 1000).toLocaleString("pt-PT") +
      " pessoas"
    );
  }

  function renderHub() {
    root().dataset.view = "hub";
    setTitle("Gestor de Anúncios");
    body().innerHTML =
      '<div class="ap-grid">' +
      '<button type="button" class="ap-btn primary" id="apGoCreate">' +
      "<b>Fazer anúncio</b><span>Foto, vídeo ou post · Localização · Pagamento</span></button>" +
      '<button type="button" class="ap-btn" id="apGoManage">' +
      "<b>Gerir anúncios</b><span>Métricas, pausar, desempenho</span></button>" +
      "</div>" +
      '<div class="ap-card" style="margin-top:14px"><h2>Como funciona</h2>' +
      "<p>Escolhe o conteúdo, define o público (província/cidade em Angola), duração e paga. O anúncio entra no feed com etiqueta Anúncio.</p></div>";
    document.getElementById("apGoCreate").onclick = function () {
      draft.step = 1;
      renderCreate();
    };
    document.getElementById("apGoManage").onclick = renderManage;
  }

  function stepsHtml() {
    return (
      '<div class="ap-steps">' +
      [1, 2, 3, 4]
        .map(function (i) {
          return '<div class="ap-step' + (i <= draft.step ? " on" : "") + '"></div>';
        })
        .join("") +
      "</div>"
    );
  }

  function renderCreate() {
    root().dataset.view = "create";
    setTitle("Criar anúncio");
    if (draft.step === 1) renderStep1();
    else if (draft.step === 2) renderStep2();
    else if (draft.step === 3) renderStep3();
    else renderStep4();
  }

  function renderStep1() {
    body().innerHTML =
      stepsHtml() +
      '<div class="ap-card"><h2>Conteúdo</h2><p>Carrega foto/vídeo ou usa um post teu.</p></div>' +
      '<label class="ap-lab">Título</label><input id="apTitleIn" maxlength="80" placeholder="Título do anúncio" value="' +
      esc(draft.title) +
      '"/>' +
      '<label class="ap-lab">Descrição</label><textarea id="apBodyIn" maxlength="500" placeholder="Texto do anúncio…">' +
      esc(draft.body) +
      "</textarea>" +
      '<label class="ap-lab">Media (foto ou vídeo)</label>' +
      '<input id="apMediaFile" type="file" accept="image/*,video/*"/>' +
      '<button type="button" class="ap-pay" id="apNext1" style="margin-top:16px">Continuar</button>';
    document.getElementById("apNext1").onclick = function () {
      draft.title = (document.getElementById("apTitleIn").value || "").trim();
      draft.body = (document.getElementById("apBodyIn").value || "").trim();
      var f = document.getElementById("apMediaFile");
      if (f && f.files && f.files[0]) {
        try {
          draft.mediaUrl = URL.createObjectURL(f.files[0]);
          draft.mediaType = f.files[0].type.indexOf("video") >= 0 ? "video" : "image";
        } catch (e) {}
      }
      if (!draft.body && !draft.mediaUrl) {
        alert("Escreve uma descrição ou escolhe uma media");
        return;
      }
      draft.step = 2;
      renderCreate();
    };
  }

  function renderStep2() {
    body().innerHTML =
      stepsHtml() +
      '<div class="ap-card"><h2>Objectivo</h2></div>' +
      '<div class="ap-chips" id="apObj">' +
      '<button type="button" class="ap-chip' +
      (draft.objective === "click" ? " on" : "") +
      '" data-v="click">Clique (site)</button>' +
      '<button type="button" class="ap-chip' +
      (draft.objective === "message" ? " on" : "") +
      '" data-v="message">Mensagem no Tchilo</button>' +
      "</div>" +
      '<label class="ap-lab">Link (só tipo Clique)</label>' +
      '<input id="apLink" type="url" placeholder="https://exemplo.com" value="' +
      esc(draft.link) +
      '"/>' +
      '<button type="button" class="ap-pay" id="apNext2" style="margin-top:16px">Continuar</button>';
    document.querySelectorAll("#apObj .ap-chip").forEach(function (c) {
      c.onclick = function () {
        document.querySelectorAll("#apObj .ap-chip").forEach(function (x) {
          x.classList.remove("on");
        });
        c.classList.add("on");
        draft.objective = c.getAttribute("data-v");
      };
    });
    document.getElementById("apNext2").onclick = function () {
      draft.link = (document.getElementById("apLink").value || "").trim();
      draft.objective =
        (document.querySelector("#apObj .ap-chip.on") &&
          document.querySelector("#apObj .ap-chip.on").getAttribute("data-v")) ||
        "click";
      if (draft.objective === "click" && !draft.link) {
        alert("Indica o link do site");
        return;
      }
      draft.step = 3;
      renderCreate();
    };
  }

  function renderStep3() {
    var provOpts = AO_PROVINCES.map(function (p) {
      return (
        '<option value="' +
        esc(p.name) +
        '"' +
        (draft.province === p.name ? " selected" : "") +
        ">" +
        esc(p.name) +
        "</option>"
      );
    }).join("");
    body().innerHTML =
      stepsHtml() +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Localização e público</h2>" +
      '<label class="ap-lab">Província (Angola)</label>' +
      '<select id="apProvince">' +
      provOpts +
      "</select>" +
      '<label class="ap-lab">Cidade</label>' +
      '<input id="apCity" placeholder="Cidade" value="' +
      esc(draft.city) +
      '"/>' +
      '<label class="ap-lab">Idade mín.</label><input type="number" id="apAgeMin" min="13" max="65" value="' +
      draft.ageMin +
      '"/>' +
      '<label class="ap-lab">Idade máx.</label><input type="number" id="apAgeMax" min="13" max="65" value="' +
      draft.ageMax +
      '"/>' +
      '<button type="button" class="ap-pay" id="apNext3" style="margin-top:16px">Continuar</button>';
    document.getElementById("apNext3").onclick = function () {
      draft.province = document.getElementById("apProvince").value;
      draft.city = (document.getElementById("apCity").value || "").trim();
      draft.ageMin = parseInt(document.getElementById("apAgeMin").value, 10) || 18;
      draft.ageMax = parseInt(document.getElementById("apAgeMax").value, 10) || 45;
      draft.step = 4;
      renderCreate();
    };
  }

  function ctaLabel() {
    if (draft.objective === "message") return "Enviar mensagem";
    return "Saber mais";
  }

  function renderStep4() {
    var media =
      draft.mediaUrl
        ? draft.mediaType === "video"
          ? '<video src="' + esc(draft.mediaUrl) + '" muted playsinline controls></video>'
          : '<img src="' + esc(draft.mediaUrl) + '" alt="">'
        : "Pré-visualização da media";
    body().innerHTML =
      stepsHtml() +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Duração e pagamento</h2>" +
      '<label class="ap-lab">Dias (1–30)</label>' +
      '<input type="number" id="apDays" min="1" max="30" value="' +
      draft.days +
      '"/>' +
      '<div class="ap-reach" id="apReach">' +
      reachText(draft.days) +
      "</div>" +
      '<div class="ap-preview">' +
      '<div class="pv-head"><div class="pv-av">' +
      esc((meName().charAt(0) || "T").toUpperCase()) +
      "</div><div><b>@" +
      esc(meName()) +
      '</b><div style="font:800 10px Inter,sans-serif;margin-top:2px">Anúncio</div></div></div>' +
      '<div class="pv-media">' +
      media +
      "</div>" +
      '<div class="pv-cap"><b>@' +
      esc(meName()) +
      "</b> " +
      esc(draft.title || draft.body || "O teu anúncio") +
      "</div>" +
      '<div class="pv-cta">' +
      ctaLabel() +
      "</div></div>" +
      '<button type="button" class="ap-pay" id="apPay">Pagar e publicar</button>';
    var daysEl = document.getElementById("apDays");
    daysEl.oninput = function () {
      draft.days = Math.max(1, Math.min(30, parseInt(daysEl.value, 10) || 1));
      daysEl.value = String(draft.days);
      document.getElementById("apReach").textContent = reachText(draft.days);
      document.getElementById("apPay").textContent = "Pagar $" + draft.days + " e publicar";
    };
    document.getElementById("apPay").textContent = "Pagar $" + draft.days + " e publicar";
    document.getElementById("apPay").onclick = pay;
  }

  async function pay() {
    var uid = meId();
    if (!uid) {
      alert("Inicia sessão");
      return;
    }
    var days = Math.max(1, Math.min(30, draft.days || 1));
    var SB = window.SB || window.tchiloSupabase;
    var adId = null;
    if (SB) {
      try {
        var row = {
          user_id: uid,
          status: "pending",
          ad_type: draft.objective === "message" ? "message" : "click",
          body: draft.body || draft.title || "",
          media_url: draft.mediaUrl || null,
          media_type: draft.mediaType || null,
          link_url: draft.objective === "click" ? draft.link : null,
          days: days,
          reach_min: days * 800,
          reach_max: days * 1000,
          impressions: 0,
          clicks: 0,
          conversations: 0
        };
        var ins = await SB.from("ads").insert(row).select("id").single();
        if (ins && ins.data) adId = ins.data.id;
      } catch (e) {
        console.warn("[ads] insert", e);
      }
    }
    openPaddle(adId, days);
  }

  function openPaddle(adId, days) {
    function doOpen() {
      try {
        if (!window.__tchiloPaddleInited && window.Paddle) {
          Paddle.Initialize({ token: PADDLE_TOKEN });
          window.__tchiloPaddleInited = true;
        }
        window.__tchiloCheckoutKind = "ad";
        Paddle.Checkout.open({
          items: [{ priceId: PRICE_AD, quantity: days }],
          settings: { displayMode: "overlay", theme: "light", locale: "pt" },
          customData: {
            app: "tchilo",
            kind: "ad",
            ad_id: adId || "",
            user_id: meId() || "",
            days: String(days)
          }
        });
      } catch (e) {
        alert("Não foi possível abrir o pagamento");
      }
    }
    if (window.Paddle && window.Paddle.Checkout) {
      doOpen();
      return;
    }
    var s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.onload = doOpen;
    s.onerror = function () {
      alert("Erro ao carregar Paddle");
    };
    document.head.appendChild(s);
  }

  async function renderManage() {
    root().dataset.view = "manage";
    setTitle("Gerir anúncios");
    body().innerHTML = '<div class="ap-card"><p>A carregar os teus anúncios…</p></div>';
    var SB = window.SB || window.tchiloSupabase;
    var uid = meId();
    if (!SB || !uid) {
      body().innerHTML =
        '<div class="ap-card"><p>Inicia sessão para ver os anúncios.</p></div>' +
        '<button type="button" class="ap-pay" id="apBackHub">Voltar</button>';
      document.getElementById("apBackHub").onclick = renderHub;
      return;
    }
    try {
      var res = await SB.from("ads").select("*").eq("user_id", uid).order("created_at", { ascending: false });
      var rows = (res && res.data) || [];
      if (!rows.length) {
        body().innerHTML =
          '<div class="ap-card"><h2>Sem anúncios</h2><p>Ainda não criaste nenhum.</p></div>' +
          '<button type="button" class="ap-pay" id="apNew">Fazer anúncio</button>';
        document.getElementById("apNew").onclick = function () {
          draft.step = 1;
          renderCreate();
        };
        return;
      }
      body().innerHTML = rows
        .map(function (a) {
          return (
            '<div class="ap-card">' +
            "<h2>" +
            esc(a.body || a.title || "Anúncio") +
            "</h2>" +
            "<p>Estado: <b>" +
            esc(a.status || "—") +
            "</b> · " +
            (a.days || 0) +
            " dias · impressões " +
            (a.impressions || 0) +
            " / ~" +
            (a.reach_max || a.reach_min || 0) +
            "</p></div>"
          );
        })
        .join("");
    } catch (e) {
      body().innerHTML =
        '<div class="ap-card"><p>Erro ao carregar. Confirma a tabela ads no Supabase.</p></div>';
    }
  }

  window.tchiloOpenAdsPro = open;
  window.tchiloOpenAdsManager = open;
  window.tchiloOpenAdCreate = function () {
    open();
    setTimeout(function () {
      draft.step = 1;
      renderCreate();
    }, 40);
  };

  function hookBtn() {
    var btn = document.getElementById("tchiloAdsMgrBtn");
    if (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      };
    }
  }

  setInterval(hookBtn, 1200);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hookBtn);
  else hookBtn();
})();
