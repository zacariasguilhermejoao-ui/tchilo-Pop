/**
 * tchilo-Pop — UI anúncios (Turbinar estável no feed)
 */
(function () {
  "use strict";

  var injectScheduled = false;

  function sessionUser() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s) return s;
      }
      if (window.session) return window.session;
      if (window.tchiloSession) return window.tchiloSession;
    } catch (e) {}
    return null;
  }

  function myUsername() {
    var s = sessionUser();
    if (s && s.username) return String(s.username);
    try {
      if (s && s.user && s.user.user_metadata && s.user.user_metadata.username)
        return String(s.user.user_metadata.username);
    } catch (e2) {}
    return "";
  }

  function myId() {
    var s = sessionUser();
    return s && (s.id || s.user_id) ? String(s.id || s.user_id) : "";
  }

  function isOwnPost(postId, postEl) {
    try {
      var me = myUsername();
      var uid = myId();

      // 1) DOM: data-user no cabeçalho do post
      if (postEl && me) {
        var who =
          postEl.querySelector(".post-user-tap, .post-user") ||
          postEl.querySelector("[data-user]");
        var du = who && who.getAttribute("data-user");
        if (du && String(du) === me) return true;
      }

      // 2) dados do getPosts
      if (typeof getPosts === "function" && postId) {
        var posts = getPosts() || [];
        var p = posts.find(function (x) {
          return x && String(x.id) === String(postId);
        });
        if (p) {
          if (me && p.username && String(p.username) === me) return true;
          if (uid && (p.user_id === uid || p.uid === uid || p.owner_id === uid))
            return true;
          if (p.isMine === true) return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function ensureCSS() {
    if (document.getElementById("tchiloAdsUiCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsUiCSS";
    st.textContent =
      "#tchiloAdsMgrBtn{display:flex!important;align-items:center;gap:12px;width:100%;border:0;background:none;padding:14px 18px;text-align:left;font:700 15px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)}" +
      "#tchiloAdsMgrBtn .si-icon{width:24px;height:24px;border:0;border-radius:0;background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--ink,#0B0B0C)}" +
      "#tchiloAdsMgrBtn .chev{margin-left:auto;opacity:.5;font-size:18px}" +
      ".post-boost-btn{display:inline-flex!important;align-items:center;justify-content:center;flex-shrink:0;margin-left:6px;padding:6px 10px;border:0!important;border-radius:999px;background:#7A00FF!important;font:600 11px system-ui,sans-serif!important;color:#fff!important;cursor:pointer;line-height:1;white-space:nowrap;visibility:visible!important;opacity:1!important;z-index:2}" +
      ".post-boost-btn:active{transform:scale(.96)}" +
      ".post-head{align-items:center!important}" +
      "#tchiloAdsFallback{display:none;position:fixed;inset:0;z-index:4000;background:var(--paper,#f7f6f2);flex-direction:column;color:var(--ink,#0B0B0C)}" +
      "#tchiloAdsFallback.open{display:flex}" +
      "#tchiloAdsFallback .af-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:2.5px solid var(--ink,#0B0B0C)}" +
      "#tchiloAdsFallback .af-top h1{flex:1;margin:0;font:800 18px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}" +
      "#tchiloAdsFallback .af-top button{width:40px;height:40px;border:0;border-radius:50%;background:transparent;font:600 20px system-ui,sans-serif}" +
      "#tchiloAdsFallback .af-body{flex:1;overflow:auto;padding:16px;padding-bottom:calc(24px + env(safe-area-inset-bottom))}" +
      "#tchiloAdsFallback label{display:block;font:800 12px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:12px 0 6px;text-transform:uppercase;opacity:.7}" +
      "#tchiloAdsFallback input,#tchiloAdsFallback textarea,#tchiloAdsFallback select{width:100%;box-sizing:border-box;padding:12px;border:0;border-radius:12px;font:500 14px system-ui,sans-serif;background:rgba(11,11,12,.06)}" +
      "#tchiloAdsFallback textarea{min-height:90px}" +
      "#tchiloAdsFallback .af-reach{margin:12px 0;padding:12px;border:2.5px dashed var(--ink,#0B0B0C);border-radius:14px;background:#f1ecff;font:700 13px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}" +
      "#tchiloAdsFallback .af-pay{width:100%;margin-top:16px;padding:14px;border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none}";
    document.head.appendChild(st);
  }

  function scheduleInject() {
    if (injectScheduled) return;
    injectScheduled = true;
    requestAnimationFrame(function () {
      injectScheduled = false;
      injectBoostButtons();
    });
  }

  function scriptCandidates() {
    var origin = "";
    try {
      origin = location.origin || "";
    } catch (e) {}
    var v = "v=20260922adsfix3";
    return [
      "native/tchilo-ads.js?" + v,
      "./native/tchilo-ads.js?" + v,
      "/native/tchilo-ads.js?" + v,
      origin + "/native/tchilo-ads.js?" + v,
      "https://zacariasguilhermejoao-ui.github.io/tchilo-Pop/native/tchilo-ads.js?" + v
    ];
  }

  function loadScriptOnce(src) {
    return new Promise(function (resolve) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve(true);
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () {
        resolve(true);
      };
      s.onerror = function () {
        resolve(false);
      };
      document.head.appendChild(s);
    });
  }

  function adsReady() {
    if (window.__apOld) return true;
    if (
      typeof window.tchiloOpenAdCreate === "function" &&
      window.tchiloOpenAdCreate !== openProCreate
    ) {
      window.__apOld = true;
      return true;
    }
    return false;
  }

  async function ensureAdsScript(cb) {
    if (adsReady()) {
      forceProCreate();
      cb && cb(true);
      return;
    }
    var list = scriptCandidates();
    for (var i = 0; i < list.length; i++) {
      await loadScriptOnce(list[i]);
      await new Promise(function (r) {
        setTimeout(r, 100);
      });
      if (adsReady()) {
        forceProCreate();
        cb && cb(true);
        return;
      }
    }
    var n = 0;
    var t = setInterval(function () {
      if (adsReady()) {
        forceProCreate();
        clearInterval(t);
        cb && cb(true);
      } else if (++n > 15) {
        clearInterval(t);
        cb && cb(false);
      }
    }, 100);
  }

  function openFallbackCreate() {
    ensureCSS();
    var el = document.getElementById("tchiloAdsFallback");
    if (!el) {
      el = document.createElement("div");
      el.id = "tchiloAdsFallback";
      el.innerHTML =
        '<div class="af-top"><button type="button" id="afClose" aria-label="Fechar">‹</button><h1>Criar anúncio</h1><span style="width:40px"></span></div>' +
        '<div class="af-body">' +
        "<label>Tipo</label>" +
        '<select id="afType"><option value="click">Clique (site)</option><option value="message">Mensagem (Tchilo)</option></select>' +
        "<label>Texto</label>" +
        '<textarea id="afBody" maxlength="500" placeholder="Descrição do anúncio…"></textarea>' +
        "<label>Link (só tipo Clique)</label>" +
        '<input id="afLink" type="url" placeholder="https://exemplo.com"/>' +
        "<label>Dias (1–30)</label>" +
        '<input id="afDays" type="number" min="1" max="30" value="3"/>' +
        '<div class="af-reach" id="afReach">3 dias = $3 · alcance estimado de 2.400 a 3.000 pessoas</div>' +
        '<button type="button" class="af-pay" id="afPay">Continuar para pagar</button>' +
        '<p style="margin-top:12px;font:600 12px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;opacity:.65">$1 por dia. O pagamento é feito pela Google Play na app Android. Podes escolher 1, 3, 7, 14 ou 30 dias.</p>' +
        "</div>";
      document.body.appendChild(el);
      document.getElementById("afClose").onclick = function () {
        el.classList.remove("open");
      };
      function updateReach() {
        var d = Math.max(
          1,
          Math.min(30, parseInt(document.getElementById("afDays").value, 10) || 1)
        );
        document.getElementById("afDays").value = String(d);
        document.getElementById("afReach").textContent =
          d +
          " dias = $" +
          d +
          " · alcance estimado de " +
          (d * 800).toLocaleString("pt-PT") +
          " a " +
          (d * 1000).toLocaleString("pt-PT") +
          " pessoas";
        document.getElementById("afPay").textContent = "Pagar $" + d + " e publicar";
      }
      document.getElementById("afDays").oninput = updateReach;
      updateReach();
      document.getElementById("afPay").onclick = function () {
        fallbackPay();
      };
    }
    try {
      var d2 = window.__tchiloBoostDraft;
      if (d2 && d2.body) document.getElementById("afBody").value = d2.body;
    } catch (e2) {}
    el.classList.add("open");
  }

  async function fallbackPay() {
    var body = (document.getElementById("afBody").value || "").trim();
    var type = document.getElementById("afType").value || "click";
    var link = (document.getElementById("afLink").value || "").trim();
    var days = Math.max(
      1,
      Math.min(30, parseInt(document.getElementById("afDays").value, 10) || 1)
    );
    if (!body) {
      alert("Escreve a descrição");
      return;
    }
    if (type === "click") {
      if (!link) {
        alert("Indica o link do site");
        return;
      }
      if (!/^https?:\/\//i.test(link)) link = "https://" + link;
    }
    var uid = myId();
    if (!uid) {
      alert("Inicia sessão");
      return;
    }
    var SB = window.SB || window.tchiloSupabase;
    if (!SB) {
      alert("Sem ligação à base de dados");
      return;
    }
    var draftMedia = window.__tchiloBoostDraft || {};
    var row = {
      user_id: uid,
      status: "pending",
      ad_type: type,
      body: body,
      media_url: draftMedia.media_url || null,
      media_type: draftMedia.media_type || null,
      link_url: type === "click" ? link : null,
      days: days,
      reach_min: days * 800,
      reach_max: days * 1000,
      impressions: 0,
      clicks: 0,
      conversations: 0
    };
    try {
      var ins = await SB.from("ads").insert(row).select("id").single();
      if (ins.error || !ins.data) {
        alert("Erro ao guardar. Confirma o SQL dos anúncios no Supabase.");
        return;
      }
      openPaddleAd(ins.data.id, days);
    } catch (e) {
      alert("Erro: " + (e && e.message ? e.message : e));
    }
  }

  function openPaddleAd(adId, days) {
    if (typeof window.tchiloIsNativeAndroid === "function" && window.tchiloIsNativeAndroid() && typeof window.tchiloPlayAdPurchase === "function") {
      window.tchiloPlayAdPurchase(adId, days, function (ok) {
        if (ok) {
          var fb0 = document.getElementById("tchiloAdsFallback");
          if (fb0) fb0.classList.remove("open");
        }
      });
      return;
    }
    var PRICE = "pri_01m31nb48pzvs976yz2nd1wtbp";
    var TOKEN = "live_05be77c7629150c894e94e62559";
    function doOpen() {
      try {
        if (!window.__tchiloPaddleInited && window.Paddle) {
          Paddle.Initialize({ token: TOKEN });
          window.__tchiloPaddleInited = true;
        }
        window.__tchiloCheckoutKind = "ad";
        Paddle.Checkout.open({
          items: [{ priceId: PRICE, quantity: days }],
          settings: { displayMode: "overlay", theme: "light", locale: "pt" },
          customData: {
            app: "tchilo",
            kind: "ad",
            ad_id: adId,
            user_id: myId() || "",
            days: String(days)
          }
        });
        var fb = document.getElementById("tchiloAdsFallback");
        if (fb) fb.classList.remove("open");
        var pr = document.getElementById("tchiloAdsPro");
        if (pr) pr.classList.remove("open");
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

  /* ====== Ecrã "Turbinar post" (estilo Tchilo: preto/branco, linhas finas, sem azul) ====== */
  var AP_MAX_ZONES = 5;
  var AP_DAYS = [1, 3, 7, 14, 30];
  var AP_RADII = [5, 10, 25, 50, 100];
  var apMap = null;
  var apLayer = null;

  function proCSS() {
    if (document.getElementById("tchiloAdsProCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsProCSS";
    var HL = "rgba(11,11,12,.08)";
    var FIELD = "var(--field,#F8F9FB)";
    var css = [
      "#tchiloAdsPro{display:none;position:fixed;inset:0;z-index:4000;flex-direction:column;background:var(--paper,#fff);color:var(--ink,#0B0B0C);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}",
      "#tchiloAdsPro.open{display:flex}",
      "#tchiloAdsPro *{box-sizing:border-box}",
      "#tchiloAdsPro button{font-family:inherit;-webkit-appearance:none;appearance:none}",
      "#tchiloAdsPro .ap-top{flex:none;display:flex;align-items:center;gap:10px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:1px solid var(--line,rgba(11,11,12,.12));background:var(--paper,#fff)}",
      "#tchiloAdsPro .ap-top h1{margin:0;flex:1;text-align:center;font-size:20px;font-weight:800}",
      "#tchiloAdsPro .ap-top .ap-sp{width:36px}",
      "#tchiloAdsPro .ap-back{width:36px;height:36px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer}",
      "#tchiloAdsPro .ap-back svg{width:18px;height:18px}",
      "#tchiloAdsPro .ap-scroll{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:0 16px 24px}",
      "#tchiloAdsPro .ap-sec{padding:22px 0;border-bottom:1px solid " + HL + "}",
      "#tchiloAdsPro .ap-sec:last-child{border-bottom:0}",
      "#tchiloAdsPro .ap-h{margin:0 0 4px;font-size:17px;font-weight:800}",
      "#tchiloAdsPro .ap-sub{margin:0 0 14px;font-size:14px;line-height:1.45;color:var(--muted,#6b6b70)}",
      "#tchiloAdsPro .ap-post{border:1px solid var(--line,#E4E6EB);border-radius:12px;overflow:hidden;background:var(--paper,#fff)}",
      "#tchiloAdsPro .ap-ph{display:flex;align-items:center;gap:10px;padding:10px 12px}",
      "#tchiloAdsPro .ap-av{width:36px;height:36px;border-radius:50%;background:var(--ink,#0B0B0C);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;overflow:hidden;flex:none}",
      "#tchiloAdsPro .ap-av img{width:100%;height:100%;object-fit:cover}",
      "#tchiloAdsPro .ap-pn{font-size:15px;font-weight:800;line-height:1.2}",
      "#tchiloAdsPro .ap-ps{font-size:12.5px;color:var(--muted,#6b6b70);line-height:1.3}",
      "#tchiloAdsPro .ap-pt{padding:0 12px 10px;font-size:15px;line-height:1.4;white-space:pre-wrap;word-break:break-word}",
      "#tchiloAdsPro .ap-pm img,#tchiloAdsPro .ap-pm video{display:block;width:100%;max-height:320px;object-fit:cover;background:#000}",
      "#tchiloAdsPro .ap-pc{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-top:1px solid " + HL + "}",
      "#tchiloAdsPro .ap-pc b{display:block;font-size:14px;font-weight:800}",
      "#tchiloAdsPro .ap-pc span{display:block;font-size:12.5px;color:var(--muted,#6b6b70);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px}",
      "#tchiloAdsPro .ap-pc i{font-style:normal;font-size:13px;font-weight:800;padding:8px 14px;border-radius:999px;background:var(--ink,#0B0B0C);color:#fff;white-space:nowrap}",
      "#tchiloAdsPro textarea,#tchiloAdsPro input[type=url],#tchiloAdsPro input[type=search]{width:100%;border:1px solid var(--line,#E4E6EB);border-radius:12px;background:" + FIELD + ";color:inherit;font:inherit;font-size:16px;padding:14px;outline:none;-webkit-appearance:none;appearance:none}",
      "#tchiloAdsPro textarea{min-height:110px;resize:none}",
      "#tchiloAdsPro ::placeholder{color:rgba(11,11,12,.38)}",
      "#tchiloAdsPro .ap-cnt{text-align:right;font-size:12px;color:var(--muted,#6b6b70);margin-top:6px}",
      "#tchiloAdsPro .ap-lab{display:block;font-size:13px;font-weight:700;color:var(--muted,#6b6b70);margin:16px 0 6px}",
      "#tchiloAdsPro .ap-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:14px 0;border:0;border-top:1px solid " + HL + ";background:transparent;color:inherit;font:inherit;cursor:pointer}",
      "#tchiloAdsPro .ap-opt:first-of-type{border-top:0}",
      "#tchiloAdsPro .ap-ot{flex:1;min-width:0}",
      "#tchiloAdsPro .ap-ot b{display:block;font-size:16px;font-weight:700}",
      "#tchiloAdsPro .ap-ot span{display:block;font-size:13.5px;line-height:1.4;color:var(--muted,#6b6b70);margin-top:2px}",
      "#tchiloAdsPro .ap-rd{width:22px;height:22px;border-radius:50%;border:2px solid rgba(11,11,12,.3);flex:none;display:flex;align-items:center;justify-content:center}",
      "#tchiloAdsPro .ap-opt.on .ap-rd{border-color:var(--ink,#0B0B0C)}",
      "#tchiloAdsPro .ap-opt.on .ap-rd::after{content:'';width:12px;height:12px;border-radius:50%;background:var(--ink,#0B0B0C)}",
      "#tchiloAdsPro .ap-chips{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}",
      "#tchiloAdsPro .ap-chip{padding:11px 0;text-align:center;white-space:nowrap;border:1px solid rgba(11,11,12,.16);border-radius:999px;background:transparent;color:inherit;font-size:13px;font-weight:700;cursor:pointer}",
      "#tchiloAdsPro .ap-chip.on{background:var(--ink,#0B0B0C);border-color:var(--ink,#0B0B0C);color:#fff}",
      "#tchiloAdsPro .ap-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;border-top:1px solid " + HL + ";font-size:15px}",
      "#tchiloAdsPro .ap-rows .ap-row:first-child{border-top:0}",
      "#tchiloAdsPro .ap-row span{color:var(--muted,#6b6b70)}",
      "#tchiloAdsPro .ap-row b{font-weight:700;text-align:right}",
      "#tchiloAdsPro .ap-row.tot span,#tchiloAdsPro .ap-row.tot b{color:var(--ink,#0B0B0C);font-size:17px;font-weight:800}",
      "#tchiloAdsPro .ap-note{margin:12px 0 0;font-size:13px;line-height:1.45;color:var(--muted,#6b6b70)}",
      "#tchiloAdsPro .ap-zones{display:none;margin-top:6px}",
      "#tchiloAdsPro .ap-zones.open{display:block}",
      "#tchiloAdsPro .ap-res{margin-top:6px;border-radius:12px;background:var(--paper,#fff);border:1px solid rgba(11,11,12,.12);overflow:hidden;display:none}",
      "#tchiloAdsPro .ap-res button{display:block;width:100%;text-align:left;padding:12px 14px;border:0;border-top:1px solid " + HL + ";background:transparent;color:inherit;font-size:14px;line-height:1.35;cursor:pointer}",
      "#tchiloAdsPro .ap-res button:first-child{border-top:0}",
      "#tchiloAdsPro .ap-res .none{padding:12px 14px;font-size:14px;color:var(--muted,#6b6b70)}",
      "#tchiloAdsPro .ap-link{border:0;background:transparent;color:var(--ink,#0B0B0C);font-size:14px;font-weight:800;text-decoration:underline;padding:10px 0;cursor:pointer}",
      "#tchiloAdsPro #apMap{width:100%;height:240px;border-radius:12px;overflow:hidden;background:" + FIELD + ";margin-top:4px;z-index:0}",
      "#tchiloAdsPro .ap-hint{margin:8px 0 14px;font-size:13px;color:var(--muted,#6b6b70)}",
      "#tchiloAdsPro .ap-loc{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid " + HL + "}",
      "#tchiloAdsPro .ap-loc .t{flex:1;min-width:0;font-size:14.5px;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}",
      "#tchiloAdsPro .ap-loc .t small{display:block;color:var(--muted,#6b6b70);font-size:12.5px}",
      "#tchiloAdsPro .ap-loc button{border:0;background:transparent;color:var(--ink,#0B0B0C);font-size:13px;font-weight:800;text-decoration:underline;cursor:pointer;padding:6px 0}",
      "#tchiloAdsPro .ap-bar{flex:none;padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--line,rgba(11,11,12,.12));background:var(--paper,#fff)}",
      "#tchiloAdsPro .ap-go{display:block;width:100%;padding:16px;border:0;border-radius:16px;background:var(--ink,#0B0B0C);color:#fff;font-size:16px;font-weight:900;cursor:pointer}",
      "#tchiloAdsPro .ap-go:active{opacity:.9}",
      "#tchiloAdsPro .ap-go:disabled{opacity:.55}",
      "#tchiloAdsPro .ap-legal{margin:10px 4px 0;text-align:center;font-size:12px;line-height:1.4;color:var(--muted,#6b6b70)}"
    ];
    st.textContent = css.join("");
    document.head.appendChild(st);
  }

  function apEnsureLeaflet(cb) {
    if (window.L && window.L.map) return cb();
    if (!document.getElementById("leafletCSS")) {
      var l = document.createElement("link");
      l.id = "leafletCSS";
      l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(l);
    }
    var s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = function () { cb(); };
    s.onerror = function () { alert("Não foi possível carregar o mapa. Verifica a internet."); };
    document.head.appendChild(s);
  }

  function apDestroyMap() {
    try { if (apMap) apMap.remove(); } catch (e) {}
    apMap = null;
    apLayer = null;
  }

  function apIsPlay() {
    return typeof window.tchiloIsNativeAndroid === "function" && window.tchiloIsNativeAndroid();
  }

  function apEsc(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function openProCreate() {
    proCSS();
    apDestroyMap();
    var old = document.getElementById("tchiloAdsPro");
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var draft = {};
    try {
      if (window.__tchiloBoostPostId && window.__tchiloBoostDraft)
        draft = window.__tchiloBoostDraft || {};
    } catch (e0) {}

    var user = sessionUser() || {};
    var name = String(user.displayName || user.username || "O teu perfil");
    var state = { type: "click", days: 3, scope: "world", radius: 25, locs: [], busy: false };

    var el = document.createElement("div");
    el.id = "tchiloAdsPro";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Turbinar post");

    var dayChips = AP_DAYS.map(function (d) {
      return '<button type="button" class="ap-chip" data-d="' + d + '">' + d + (d === 1 ? " dia" : " dias") + "</button>";
    }).join("");
    var radChips = AP_RADII.map(function (r) {
      return '<button type="button" class="ap-chip" data-r="' + r + '">' + r + " km</button>";
    }).join("");

    el.innerHTML =
      '<div class="ap-top"><button type="button" class="back-btn ap-back" id="apBack" aria-label="Voltar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button><h1>Turbinar post</h1><span class="ap-sp"></span></div>' +
      '<div class="ap-scroll" id="apScroll">' +
      /* Pré-visualização */
      '<div class="ap-sec"><div class="ap-h">Pré-visualização</div><p class="ap-sub">É assim que o teu anúncio vai aparecer no feed.</p>' +
      '<div class="ap-post"><div class="ap-ph"><div class="ap-av" id="apAv"></div><div><div class="ap-pn" id="apName"></div><div class="ap-ps">Patrocinado</div></div></div>' +
      '<div class="ap-pt" id="apPrevText"></div><div class="ap-pm" id="apPrevMedia"></div>' +
      '<div class="ap-pc"><div><b id="apCtaT">Mais informações</b><span id="apCtaS"></span></div><i id="apCtaB">Saber mais</i></div></div></div>' +
      /* Texto */
      '<div class="ap-sec"><div class="ap-h">Texto do anúncio</div><p class="ap-sub">Explica em poucas palavras o que estás a promover.</p>' +
      '<textarea id="apBody" maxlength="500" placeholder="Descrição do anúncio…"></textarea><div class="ap-cnt" id="apCnt">0/500</div></div>' +
      /* Objetivo */
      '<div class="ap-sec"><div class="ap-h">Objetivo</div><p class="ap-sub">O que queres que as pessoas façam?</p>' +
      '<button type="button" class="ap-opt on" data-type="click"><span class="ap-ot"><b>Visitar o site</b><span>Leva as pessoas para o teu site ou página.</span></span><span class="ap-rd"></span></button>' +
      '<button type="button" class="ap-opt" data-type="message"><span class="ap-ot"><b>Enviar mensagem</b><span>Mostra o anúncio a quem tem probabilidade de te escrever no Tchilo.</span></span><span class="ap-rd"></span></button>' +
      '<div id="apLinkBox"><label class="ap-lab" for="apLink">Link do site</label><input id="apLink" type="url" inputmode="url" autocapitalize="off" placeholder="https://exemplo.com"></div></div>' +
      /* Onde mostrar */
      '<div class="ap-sec"><div class="ap-h">Onde mostrar</div><p class="ap-sub">Escolhe quem vê o anúncio.</p>' +
      '<button type="button" class="ap-opt on" data-scope="world"><span class="ap-ot"><b>Todo o mundo</b><span>O anúncio aparece para toda a gente.</span></span><span class="ap-rd"></span></button>' +
      '<button type="button" class="ap-opt" data-scope="zones"><span class="ap-ot"><b>Zonas no mapa</b><span>Escolhe cidades ou bairros e o raio à volta de cada um.</span></span><span class="ap-rd"></span></button>' +
      '<div class="ap-zones" id="apZones">' +
      '<label class="ap-lab" for="apSearch">Pesquisar local</label>' +
      '<input id="apSearch" type="search" autocomplete="off" autocapitalize="off" placeholder="Cidade, bairro ou país">' +
      '<div class="ap-res" id="apRes"></div>' +
      '<button type="button" class="ap-link" id="apMe">Usar a minha localização</button>' +
      '<div id="apMap"></div><p class="ap-hint">Toca no mapa para adicionar uma zona.</p>' +
      '<label class="ap-lab">Raio de cada zona</label><div class="ap-chips" id="apRadii">' + radChips + '</div>' +
      '<label class="ap-lab" id="apLocsLab">Zonas adicionadas</label><div id="apLocs"></div></div></div>' +
      /* Duração */
      '<div class="ap-sec"><div class="ap-h">Duração</div><p class="ap-sub">O custo é de $1 por dia de anúncio.</p>' +
      '<div class="ap-chips" id="apDaysChips">' + dayChips + '</div>' +
      '<div class="ap-rows" style="margin-top:8px">' +
      '<div class="ap-row"><span>Termina em</span><b id="apEnd"></b></div>' +
      '<div class="ap-row"><span>Alcance estimado</span><b id="apReach"></b></div></div>' +
      '<p class="ap-note">Depois do pagamento, o anúncio é analisado e começa a ser mostrado.</p></div>' +
      /* Resumo */
      '<div class="ap-sec"><div class="ap-h">Resumo e pagamento</div>' +
      '<p class="ap-sub">O método de pagamento é escolhido no passo seguinte, através do ' + "Google Play" + ".</p>" +
      '<div class="ap-rows">' +
      '<div class="ap-row"><span>Duração</span><b id="apSumD"></b></div>' +
      '<div class="ap-row"><span>Onde mostrar</span><b id="apSumW"></b></div>' +
      '<div class="ap-row tot"><span>Total a pagar</span><b id="apSumT"></b></div></div></div>' +
      "</div>" +
      '<div class="ap-bar"><button type="button" class="ap-go" id="apGo">Turbinar post</button><p class="ap-legal">Ao tocar em Turbinar post, aceitas os Termos de uso do Tchilo para anúncios.</p></div>';
    document.body.appendChild(el);

    function $(id) { return document.getElementById(id); }

    /* avatar + nome */
    var av = $("apAv");
    if (user.avatar) {
      var im = document.createElement("img");
      im.src = user.avatar;
      im.alt = "";
      av.appendChild(im);
    } else {
      av.textContent = name.charAt(0).toUpperCase();
    }
    $("apName").textContent = name;

    /* media do post */
    var mediaBox = $("apPrevMedia");
    if (draft.media_url) {
      var mEl;
      if (draft.media_type === "video") {
        mEl = document.createElement("video");
        mEl.muted = true;
        mEl.playsInline = true;
        mEl.controls = true;
        mEl.preload = "metadata";
      } else {
        mEl = document.createElement("img");
        mEl.alt = "";
      }
      mEl.src = draft.media_url;
      mediaBox.appendChild(mEl);
    } else {
      mediaBox.style.display = "none";
    }

    var body = $("apBody");
    var link = $("apLink");
    body.value = draft.body || "";

    function refreshPreview() {
      var t = body.value;
      $("apPrevText").textContent = t || "O texto do teu anúncio aparece aqui.";
      $("apCnt").textContent = t.length + "/500";
      if (state.type === "click") {
        var host = (link.value || "").trim().replace(/^https?:\/\//i, "").split("/")[0];
        $("apCtaT").textContent = "Mais informações";
        $("apCtaS").textContent = host || "o teu site";
        $("apCtaB").textContent = "Saber mais";
      } else {
        $("apCtaT").textContent = "Fala connosco";
        $("apCtaS").textContent = "Mensagem no Tchilo";
        $("apCtaB").textContent = "Enviar mensagem";
      }
    }

    function refreshSummary() {
      var d = state.days;
      var end = new Date();
      end.setDate(end.getDate() + d);
      $("apEnd").textContent = end.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
      $("apReach").textContent = (d * 800).toLocaleString("pt-PT") + " – " + (d * 1000).toLocaleString("pt-PT") + " pessoas";
      $("apSumD").textContent = d + (d === 1 ? " dia" : " dias");
      $("apSumW").textContent = state.scope === "zones"
        ? (state.locs.length ? state.locs.length + (state.locs.length === 1 ? " zona" : " zonas") : "Sem zonas")
        : "Todo o mundo";
      $("apSumT").textContent = "$" + d;
      $("apGo").textContent = "Turbinar por $" + d;
      Array.prototype.forEach.call(el.querySelectorAll("#apDaysChips .ap-chip"), function (c) {
        c.classList.toggle("on", parseInt(c.getAttribute("data-d"), 10) === d);
      });
      Array.prototype.forEach.call(el.querySelectorAll("#apRadii .ap-chip"), function (c) {
        c.classList.toggle("on", parseInt(c.getAttribute("data-r"), 10) === state.radius);
      });
    }

    function renderLocs() {
      var box = $("apLocs");
      var lab = $("apLocsLab");
      if (!state.locs.length) {
        box.innerHTML = '<p class="ap-hint" style="margin:0">Ainda sem zonas. Pesquisa um local ou toca no mapa.</p>';
        lab.textContent = "Zonas adicionadas";
      } else {
        lab.textContent = "Zonas adicionadas (" + state.locs.length + "/" + AP_MAX_ZONES + ")";
        box.innerHTML = state.locs.map(function (l, i) {
          return '<div class="ap-loc"><div class="t">' + apEsc(l.label || "Zona no mapa") + "<small>raio " + state.radius + ' km</small></div><button type="button" data-rm="' + i + '">Remover</button></div>';
        }).join("");
      }
      refreshSummary();
    }

    function drawMap(fit) {
      if (!apMap || !window.L || !apLayer) return;
      apLayer.clearLayers();
      state.locs.forEach(function (l) {
        L.circle([l.lat, l.lng], { radius: state.radius * 1000, color: "#0B0B0C", weight: 2, fillColor: "#0B0B0C", fillOpacity: 0.12 }).addTo(apLayer);
        L.circleMarker([l.lat, l.lng], { radius: 6, color: "#fff", weight: 2, fillColor: "#0B0B0C", fillOpacity: 1 }).addTo(apLayer);
      });
      if (fit && state.locs.length) {
        try {
          apMap.fitBounds(apLayer.getBounds(), { padding: [30, 30], maxZoom: 12 });
        } catch (e) {}
      }
    }

    function addLoc(lat, lng, label, country, recenter) {
      if (state.locs.length >= AP_MAX_ZONES) {
        alert("Podes adicionar até " + AP_MAX_ZONES + " zonas.");
        return null;
      }
      for (var i = 0; i < state.locs.length; i++) {
        var a = state.locs[i];
        if (Math.abs(a.lat - lat) < 0.004 && Math.abs(a.lng - lng) < 0.004) return a;
      }
      var loc = { lat: lat, lng: lng, label: label || "", country: country || "" };
      state.locs.push(loc);
      renderLocs();
      drawMap(false);
      if (recenter && apMap) apMap.setView([lat, lng], Math.max(apMap.getZoom() || 11, 11));
      return loc;
    }

    function reverseName(loc) {
      fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=pt&lat=" + encodeURIComponent(loc.lat) + "&lon=" + encodeURIComponent(loc.lng))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j) return;
          loc.label = j.display_name || loc.label || "Zona no mapa";
          loc.country = (j.address && j.address.country) || loc.country || "";
          renderLocs();
        })
        .catch(function () {});
    }

    function initMap() {
      apEnsureLeaflet(function () {
        var box = $("apMap");
        if (!box || !window.L) return;
        if (apMap) {
          setTimeout(function () { try { apMap.invalidateSize(); } catch (e) {} }, 60);
          return;
        }
        var lat = -8.84, lng = 13.23, zoom = 11;
        var g = window.tchiloGeo && window.tchiloGeo.get && window.tchiloGeo.get();
        if (g && g.lat != null) { lat = g.lat; lng = g.lng; }
        if (state.locs.length) { lat = state.locs[0].lat; lng = state.locs[0].lng; }
        apMap = L.map("apMap", { zoomControl: true, attributionControl: true }).setView([lat, lng], zoom);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(apMap);
        apLayer = L.layerGroup().addTo(apMap);
        apMap.on("click", function (e) {
          var loc = addLoc(e.latlng.lat, e.latlng.lng, "A procurar o nome…", "", false);
          if (loc && loc.label === "A procurar o nome…") reverseName(loc);
        });
        drawMap(true);
        setTimeout(function () { try { apMap.invalidateSize(); } catch (e) {} }, 120);
      });
    }

    /* pesquisa de locais */
    var searchTimer = null;
    var searchEl = $("apSearch");
    var resEl = $("apRes");
    function hideRes() { resEl.style.display = "none"; resEl.innerHTML = ""; }
    searchEl.addEventListener("input", function () {
      var q = searchEl.value.trim();
      clearTimeout(searchTimer);
      if (q.length < 2) { hideRes(); return; }
      searchTimer = setTimeout(function () {
        fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=pt&q=" + encodeURIComponent(q))
          .then(function (r) { return r.json(); })
          .then(function (arr) {
            if (searchEl.value.trim() !== q) return;
            resEl.style.display = "block";
            if (!arr || !arr.length) { resEl.innerHTML = '<div class="none">Nenhum local encontrado.</div>'; return; }
            resEl.innerHTML = arr.map(function (r, i) {
              return '<button type="button" data-i="' + i + '">' + apEsc(r.display_name) + "</button>";
            }).join("");
            resEl.onclick = function (ev) {
              var b = ev.target.closest("button[data-i]");
              if (!b) return;
              var r = arr[parseInt(b.getAttribute("data-i"), 10)];
              addLoc(parseFloat(r.lat), parseFloat(r.lon), r.display_name, (r.address && r.address.country) || "", true);
              searchEl.value = "";
              hideRes();
            };
          })
          .catch(function () {
            resEl.style.display = "block";
            resEl.innerHTML = '<div class="none">Sem ligação. Tenta de novo.</div>';
          });
      }, 400);
    });

    $("apMe").onclick = function () {
      function useGeo(lat, lng) {
        var loc = addLoc(lat, lng, "A minha localização", "", true);
        if (loc && loc.label === "A minha localização") reverseName(loc);
      }
      var g = window.tchiloGeo && window.tchiloGeo.get && window.tchiloGeo.get();
      if (g && g.lat != null) { useGeo(g.lat, g.lng); return; }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (p) { useGeo(p.coords.latitude, p.coords.longitude); },
          function () { alert("Não foi possível obter a tua localização. Verifica a permissão."); },
          { enableHighAccuracy: false, timeout: 10000 }
        );
      } else {
        alert("Localização indisponível neste dispositivo.");
      }
    };

    $("apRadii").onclick = function (ev) {
      var b = ev.target.closest("button[data-r]");
      if (!b) return;
      state.radius = parseInt(b.getAttribute("data-r"), 10);
      renderLocs();
      drawMap(true);
    };

    $("apLocs").onclick = function (ev) {
      var b = ev.target.closest("button[data-rm]");
      if (!b) return;
      state.locs.splice(parseInt(b.getAttribute("data-rm"), 10), 1);
      renderLocs();
      drawMap(false);
    };

    $("apDaysChips").onclick = function (ev) {
      var b = ev.target.closest("button[data-d]");
      if (!b) return;
      state.days = parseInt(b.getAttribute("data-d"), 10);
      refreshSummary();
    };

    body.addEventListener("input", refreshPreview);
    link.addEventListener("input", refreshPreview);

    /* objetivo e âmbito */
    function bindGroup(attr, onPick) {
      var btns = el.querySelectorAll(".ap-opt[" + attr + "]");
      Array.prototype.forEach.call(btns, function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(btns, function (o) { o.classList.toggle("on", o === b); });
          onPick(b.getAttribute(attr));
        };
      });
    }
    bindGroup("data-type", function (v) {
      state.type = v;
      $("apLinkBox").style.display = v === "click" ? "" : "none";
      refreshPreview();
    });
    bindGroup("data-scope", function (v) {
      state.scope = v;
      $("apZones").classList.toggle("open", v === "zones");
      if (v === "zones") initMap();
      refreshSummary();
    });

    $("apBack").onclick = function () { closePro(); };
    $("apGo").onclick = function () { proPay(state, body, link, $("apGo")); };

    refreshPreview();
    renderLocs();
    el.classList.add("open");
    var sc = $("apScroll");
    if (sc) sc.scrollTop = 0;
  }

  function closePro() {
    apDestroyMap();
    var el = document.getElementById("tchiloAdsPro");
    if (el) el.classList.remove("open");
    window.__tchiloBoostPostId = null;
  }

  async function proPay(state, bodyEl, linkEl, btn) {
    if (state.busy) return;
    if (!apIsPlay()) {
      alert("As compras estão disponíveis na app Android, através da Google Play.");
      return;
    }
    var body = (bodyEl.value || "").trim();
    var type = state.type || "click";
    var link = (linkEl.value || "").trim();
    var days = AP_DAYS.indexOf(state.days) >= 0 ? state.days : 3;
    if (!body) {
      alert("Escreve a descrição do anúncio");
      bodyEl.focus();
      return;
    }
    if (type === "click") {
      if (!link) {
        alert("Indica o link do site");
        linkEl.focus();
        return;
      }
      if (!/^https?:\/\//i.test(link)) link = "https://" + link;
    }
    if (state.scope === "zones" && !state.locs.length) {
      alert("Adiciona pelo menos uma zona no mapa ou escolhe Todo o mundo.");
      return;
    }
    var uid = myId();
    if (!uid) {
      alert("Inicia sessão");
      return;
    }
    var SB = window.SB || window.tchiloSupabase;
    if (!SB) {
      alert("Sem ligação à base de dados");
      return;
    }
    var draftMedia = {};
    try {
      if (window.__tchiloBoostPostId) draftMedia = window.__tchiloBoostDraft || {};
    } catch (e0) {}
    var base = {
      user_id: uid,
      status: "pending",
      ad_type: type,
      body: body,
      media_url: draftMedia.media_url || null,
      media_type: draftMedia.media_type || null,
      link_url: type === "click" ? link : null,
      days: days,
      reach_min: days * 800,
      reach_max: days * 1000,
      impressions: 0,
      clicks: 0,
      conversations: 0
    };
    var zones = state.scope === "zones" ? state.locs : [];
    var first = zones[0];
    var geo = {
      target_lat: first ? first.lat : null,
      target_lng: first ? first.lng : null,
      target_radius_km: first ? state.radius : null,
      target_label: first ? first.label || null : null,
      target_country: first ? first.country || null : null
    };
    var multi = {
      target_locations: zones.map(function (l) {
        return { lat: l.lat, lng: l.lng, radius_km: state.radius, label: l.label || "", country: l.country || "" };
      })
    };
    function merge(a, b) {
      var o = {};
      Object.keys(a).forEach(function (k) { o[k] = a[k]; });
      if (b) Object.keys(b).forEach(function (k) { o[k] = b[k]; });
      return o;
    }
    state.busy = true;
    btn.disabled = true;
    var oldText = btn.textContent;
    btn.textContent = "A preparar…";
    try {
      var ins = await SB.from("ads").insert(merge(merge(base, geo), multi)).select("id").single();
      /* se a base de dados ainda não tem as colunas novas, tenta sem elas */
      if (ins.error) ins = await SB.from("ads").insert(merge(base, geo)).select("id").single();
      if (ins.error) ins = await SB.from("ads").insert(base).select("id").single();
      if (ins.error || !ins.data) {
        alert("Erro ao guardar. Confirma o SQL dos anúncios no Supabase.");
      } else {
        openPaddleAd(ins.data.id, days);
      }
    } catch (e) {
      alert("Erro: " + (e && e.message ? e.message : e));
    }
    state.busy = false;
    btn.disabled = false;
    btn.textContent = oldText;
  }

  /* garante que qualquer "Criar anúncio" abre a tela nova */
  function forceProCreate() {
    if (window.tchiloOpenAdCreate !== openProCreate) window.tchiloOpenAdCreate = openProCreate;
  }

  function openMgr() {
    ensureAdsScript(function (ok) {
      if (ok && typeof window.tchiloOpenAdsManager === "function")
        window.tchiloOpenAdsManager();
      else if (ok && typeof window.tchiloOpenAdCreate === "function")
        window.tchiloOpenAdCreate();
      else openProCreate();
    });
  }

  function openCreateFromPost(postId) {
    var postEl = null;
    try {
      postEl = document.querySelector('.post[data-id="' + postId + '"]');
    } catch (e) {}
    if (postId && !isOwnPost(postId, postEl)) {
      if (typeof showToast === "function")
        showToast("Só podes anunciar as tuas publicações");
      else alert("Só podes anunciar as tuas publicações");
      return;
    }
    try {
      window.__tchiloBoostPostId = postId || null;
      if (!postId) window.__tchiloBoostDraft = null;
      if (postId && typeof getPosts === "function") {
        var posts = getPosts() || [];
        var p = posts.find(function (x) {
          return x && String(x.id) === String(postId);
        });
        if (p) {
          var mediaUrl = "";
          var mediaType = "image";
          try {
            if (typeof resolveMedia === "function") {
              var m = resolveMedia(p);
              if (m && m.url) {
                mediaUrl = m.url;
                mediaType = m.type === "video" ? "video" : "image";
              }
            }
          } catch (e0) {}
          if (!mediaUrl) {
            mediaUrl = (p.media && p.media.url) || p.image || p.video || "";
            mediaType = p.video ? "video" : "image";
          }
          window.__tchiloBoostDraft = {
            body: p.caption || p.text || p.body || "",
            media_url: mediaUrl,
            media_type: mediaType
          };
        }
      }
    } catch (e) {}

    openProCreate();
  }

  function injectSettings() {
    ensureCSS();
    if (document.getElementById("tchiloAdsMgrBtn")) return;
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloAdsMgrBtn";
    btn.className = "settings-item";
    /* O botão nasce já com o ícone 3D final e as marcas que tchilo-ads-icon-fix.js e
       tchilo-settings-icons.js reconhecem (data-si / data-tchilo-ads). Antes nascia com a
       letra "A" e esses dois scripts trocavam o ícone várias vezes seguidas (A → img → img),
       e cada troca fazia o ícone piscar. Agora nenhum deles tem nada para reescrever. */
    btn.innerHTML =
      '<div class="si-icon" data-si="meus anuncios-v34" data-tchilo-ads="3d">' +
      '<img src="native/settings-icons/meus-anuncios-3d.png?v=3d1" alt="" width="28" height="28" ' +
      'decoding="async" style="width:28px;height:28px;object-fit:contain;display:block;pointer-events:none;" />' +
      '</div><span>Meus Anúncios</span><div class="chev">›</div>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openMgr();
    };
    var firstItem = list.querySelector(".settings-item");
    if (firstItem) list.insertBefore(btn, firstItem);
    else list.appendChild(btn);
  }

  function injectBoostButtons() {
    ensureCSS();
    var me = myUsername();
    if (!me) return;
    var feed = document.getElementById("feedList");
    if (!feed) return;

    feed.querySelectorAll(".post").forEach(function (post) {
      var id = post.getAttribute("data-id");
      if (!id) return;

      var own = isOwnPost(id, post);
      var existing = post.querySelector(".post-boost-btn");

      if (!own) {
        if (existing) existing.remove();
        return;
      }

      if (existing) return;

      var head = post.querySelector(".post-head");
      if (!head) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "post-boost-btn";
      btn.textContent = "Turbinar";
      btn.setAttribute("data-post-id", id);
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openCreateFromPost(id);
      };

      var menu = head.querySelector(".post-menu-btn");
      if (menu) head.insertBefore(btn, menu);
      else head.appendChild(btn);
    });
  }

  function observeFeed() {
    var feed = document.getElementById("feedList");
    if (!feed || feed.__tchiloBoostObs) return;
    feed.__tchiloBoostObs = true;
    try {
      new MutationObserver(function () {
        scheduleInject();
      }).observe(feed, { childList: true, subtree: true });
    } catch (e) {}
  }

  function patchPostMenu() {
    if (typeof window.openPostMenu !== "function") return false;
    if (window.openPostMenu.__adsBoost4) return true;
    var orig = window.openPostMenu;
    window.openPostMenu = function (postId) {
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        try {
          var box = document.getElementById("postMenuOptions");
          if (!box) return;
          var old = box.querySelector("[data-tchilo-boost]");
          if (old) old.remove();
          var postEl = document.querySelector('.post[data-id="' + postId + '"]');
          if (!isOwnPost(postId, postEl)) return;
          var b = document.createElement("button");
          b.type = "button";
          b.className = "share-opt";
          b.setAttribute("data-tchilo-boost", "1");
          b.innerHTML =
            '<div class="so-icon" style="background:transparent;color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></div>' +
            "<div><b>Turbinar / Anunciar</b>" +
            '<div style="font-size:12px;color:var(--muted);font-weight:500">Impulsionar no feed</div></div>';
          b.onclick = function () {
            try {
              if (typeof closePostMenu === "function") closePostMenu();
            } catch (e3) {}
            openCreateFromPost(postId);
          };
          if (box.firstChild) box.insertBefore(b, box.firstChild);
          else box.appendChild(b);
        } catch (e) {}
      }, 40);
      return r;
    };
    window.openPostMenu.__adsBoost4 = true;
    return true;
  }

  function patchRenderFeed() {
    if (typeof window.renderFeed !== "function") return;
    // se a função for redefinida, volta a patchar
    if (window.renderFeed.__adsBoostStable) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      scheduleInject();
      setTimeout(injectBoostButtons, 30);
      setTimeout(injectBoostButtons, 120);
      setTimeout(injectBoostButtons, 400);
      setTimeout(observeFeed, 50);
      return r;
    };
    window.renderFeed.__adsBoostStable = true;
  }

  function patchGoTo() {
    if (typeof window.goTo !== "function" || window.goTo.__adsUi4) return;
    var orig = window.goTo;
    window.goTo = function (s) {
      var r = orig.apply(this, arguments);
      if (s === "settings") setTimeout(injectSettings, 80);
      if (s === "feed") {
        scheduleInject();
        setTimeout(injectBoostButtons, 80);
        setTimeout(injectBoostButtons, 300);
        setTimeout(observeFeed, 100);
      }
      return r;
    };
    window.goTo.__adsUi4 = true;
  }

  function boot() {
    ensureCSS();
    injectSettings();
    injectBoostButtons();
    observeFeed();
    patchPostMenu();
    patchRenderFeed();
    patchGoTo();
    ensureAdsScript(function () {});
  }

  // re-inject frequente + re-patch se renderFeed for substituído
  setInterval(function () {
    injectSettings();
    injectBoostButtons();
    observeFeed();
    patchPostMenu();
    if (window.__apOld) forceProCreate();
    // força re-patch se alguém redefiniu renderFeed
    if (typeof window.renderFeed === "function" && !window.renderFeed.__adsBoostStable) {
      patchRenderFeed();
    }
  }, 600);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);

  window.tchiloBoostPost = openCreateFromPost;
})();
