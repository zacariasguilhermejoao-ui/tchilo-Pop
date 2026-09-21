/**
 * tchilo-Pop — análise de desempenho dos anúncios
 */
(function () {
  "use strict";

  function fmt(n) {
    try {
      return Number(n || 0).toLocaleString("pt-PT");
    } catch (e) {
      return String(n || 0);
    }
  }

  function pct(part, total) {
    var t = Number(total) || 0;
    if (t <= 0) return "0%";
    return ((100 * (Number(part) || 0)) / t).toFixed(1).replace(".0", "") + "%";
  }

  function daysLeft(endsAt) {
    if (!endsAt) return "—";
    var ms = new Date(endsAt).getTime() - Date.now();
    if (ms <= 0) return "0 dias";
    return Math.ceil(ms / 86400000) + " dias";
  }

  function ensureCSS() {
    if (document.getElementById("tchiloAdsAnalyticsCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsAnalyticsCSS";
    st.textContent =
      ".ads-analytics-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}" +
      ".ads-metric{border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;padding:12px;background:#fff}" +
      ".ads-metric b{display:block;font-size:20px;font-weight:900;line-height:1.1}" +
      ".ads-metric span{display:block;margin-top:4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;opacity:.65}" +
      ".ads-progress{height:10px;border-radius:999px;background:#eceae3;border:2px solid var(--ink,#0B0B0C);overflow:hidden;margin:8px 0}" +
      ".ads-progress > i{display:block;height:100%;background:#c8f560}" +
      ".ads-card .ads-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}" +
      ".ads-card .ads-stat{background:#f7f6f2;border-radius:10px;padding:8px;font-weight:700;font-size:12px}" +
      ".ads-card .ads-stat b{display:block;font-size:15px;font-weight:900}";
    document.head.appendChild(st);
  }

  function renderAnalytics(ads) {
    ensureCSS();
    var body = document.getElementById("adsListBody");
    if (!body) return;

    if (!ads || !ads.length) {
      body.innerHTML =
        '<p style="font-weight:700;opacity:.7;margin-bottom:14px">Ainda não tens anúncios.</p>' +
        '<button type="button" class="ads-pay" id="adsEmptyCreate">Criar anúncio</button>';
      var b = document.getElementById("adsEmptyCreate");
      if (b)
        b.onclick = function () {
          if (typeof window.tchiloOpenAdCreate === "function") window.tchiloOpenAdCreate();
        };
      return;
    }

    var totalImp = 0,
      totalClicks = 0,
      totalConv = 0,
      totalReach = 0,
      active = 0;
    ads.forEach(function (ad) {
      totalImp += Number(ad.impressions) || 0;
      totalClicks += Number(ad.clicks) || 0;
      totalConv += Number(ad.conversations) || 0;
      totalReach += Number(ad.reach_max) || 0;
      if (ad.status === "active") active++;
    });

    var ctr = pct(totalClicks + totalConv, totalImp);
    var fill = totalReach > 0 ? Math.min(100, (100 * totalImp) / totalReach) : 0;

    var html =
      "<h2 style=\"font:900 16px Inter,sans-serif;margin:0 0 10px\">Análise de desempenho</h2>" +
      '<div class="ads-analytics-summary">' +
      '<div class="ads-metric"><b>' +
      fmt(totalImp) +
      "</b><span>Impressões</span></div>" +
      '<div class="ads-metric"><b>' +
      fmt(totalClicks) +
      "</b><span>Cliques</span></div>" +
      '<div class="ads-metric"><b>' +
      fmt(totalConv) +
      "</b><span>Conversas</span></div>" +
      '<div class="ads-metric"><b>' +
      ctr +
      "</b><span>Taxa de ação</span></div>" +
      "</div>" +
      '<div class="ads-metric" style="margin-bottom:16px">' +
      "<span>Alcance usado (todos os anúncios)</span>" +
      "<b style=\"margin-top:6px\">" +
      fmt(totalImp) +
      " / " +
      fmt(totalReach) +
      "</b>" +
      '<div class="ads-progress"><i style="width:' +
      fill +
      '%"></i></div>' +
      "<span style=\"opacity:.8;text-transform:none;font-weight:700\">" +
      active +
      " ativo(s) · " +
      ads.length +
      " no total</span></div>" +
      "<h2 style=\"font:900 16px Inter,sans-serif;margin:0 0 10px\">Os teus anúncios</h2>";

    ads.forEach(function (ad) {
      var st = ad.status || "pending";
      var imp = Number(ad.impressions) || 0;
      var reach = Number(ad.reach_max) || 0;
      var clicks = Number(ad.clicks) || 0;
      var conv = Number(ad.conversations) || 0;
      var prog = reach > 0 ? Math.min(100, (100 * imp) / reach) : 0;
      var actionRate =
        ad.ad_type === "message" ? pct(conv, imp) : pct(clicks, imp);

      var actions = "";
      if (st === "active")
        actions =
          '<button type="button" data-pause="' +
          ad.id +
          '" style="margin-top:10px;padding:8px 12px;border:2px solid #000;border-radius:10px;font-weight:800;background:#ffe566">Pausar</button>';
      if (st === "paused")
        actions =
          '<button type="button" data-resume="' +
          ad.id +
          '" style="margin-top:10px;padding:8px 12px;border:2px solid #000;border-radius:10px;font-weight:800;background:#c8f560">Reativar</button>';

      html +=
        '<div class="ads-card">' +
        '<div class="row"><span class="ads-badge ' +
        st +
        '">' +
        st +
        "</span><span style=\"font-weight:800\">" +
        (ad.ad_type === "click" ? "Clique" : "Mensagem") +
        "</span></div>" +
        "<p style=\"margin:8px 0;font-weight:700\">" +
        String(ad.body || "").replace(/</g, "<") +
        "</p>" +
        "<div style=\"font-size:12px;font-weight:700;opacity:.75\">Restantes: " +
        daysLeft(ad.ends_at) +
        " · " +
        (ad.days || "?") +
        " dias comprados</div>" +
        '<div class="ads-progress"><i style="width:' +
        prog +
        '%"></i></div>' +
        "<div style=\"font-size:12px;font-weight:800\">" +
        fmt(imp) +
        " / " +
        fmt(reach) +
        " impressões (" +
        pct(imp, reach) +
        ")</div>" +
        '<div class="ads-stats-grid">' +
        '<div class="ads-stat"><b>' +
        fmt(ad.ad_type === "message" ? conv : clicks) +
        "</b>" +
        (ad.ad_type === "message" ? "Conversas" : "Cliques") +
        "</div>" +
        '<div class="ads-stat"><b>' +
        actionRate +
        "</b>Taxa de ação</div>" +
        '<div class="ads-stat"><b>' +
        fmt(ad.reach_min || 0) +
        "–" +
        fmt(reach) +
        "</b>Alcance estimado</div>" +
        '<div class="ads-stat"><b>$' +
        fmt(ad.days || 0) +
        "</b>Investido</div>" +
        "</div>" +
        actions +
        "</div>";
    });

    body.innerHTML = html;

    body.querySelectorAll("[data-pause]").forEach(function (btn) {
      btn.onclick = function () {
        setStatus(btn.getAttribute("data-pause"), "paused");
      };
    });
    body.querySelectorAll("[data-resume]").forEach(function (btn) {
      btn.onclick = function () {
        setStatus(btn.getAttribute("data-resume"), "active");
      };
    });
  }

  async function setStatus(id, status) {
    var SB = window.SB || window.tchiloSupabase;
    if (!SB) return;
    await SB.from("ads")
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq("id", id);
    refresh();
  }

  async function refresh() {
    var SB = window.SB || window.tchiloSupabase;
    var uid = null;
    try {
      if (window.session && window.session.user) uid = window.session.user.id;
    } catch (e) {}
    if (!SB || !uid) return;
    var res = await SB.from("ads")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    renderAnalytics(res.data || []);
  }

  // observar abertura do gestor
  setInterval(function () {
    var scr = document.getElementById("screen-ads");
    if (scr && scr.classList.contains("open")) {
      if (!scr.__analyticsTick || Date.now() - scr.__analyticsTick > 4000) {
        scr.__analyticsTick = Date.now();
        refresh();
      }
    }
  }, 1200);

  // quando abrem o manager via API
  var origMgr = window.tchiloOpenAdsManager;
  if (typeof origMgr === "function" && !origMgr.__analytics) {
    window.tchiloOpenAdsManager = function () {
      var r = origMgr.apply(this, arguments);
      setTimeout(refresh, 200);
      setTimeout(refresh, 800);
      return r;
    };
    window.tchiloOpenAdsManager.__analytics = true;
  } else {
    var n = 0;
    var t = setInterval(function () {
      if (typeof window.tchiloOpenAdsManager === "function" && !window.tchiloOpenAdsManager.__analytics) {
        var o = window.tchiloOpenAdsManager;
        window.tchiloOpenAdsManager = function () {
          var r = o.apply(this, arguments);
          setTimeout(refresh, 200);
          setTimeout(refresh, 800);
          return r;
        };
        window.tchiloOpenAdsManager.__analytics = true;
        clearInterval(t);
      } else if (++n > 40) clearInterval(t);
    }, 250);
  }
})();
