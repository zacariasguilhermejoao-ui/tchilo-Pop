/**
 * tchilo-Pop — sistema de anúncios (simplificado)
 * Preço: $1/dia · Price ID Anúncio · Paddle client token partilhado
 */
(function () {
  "use strict";

  var PADDLE_TOKEN = "live_05be77c7629150c894e94e62559";
  var AD_PRICE_ID = "pri_01m31nb48pzvs976yz2nd1wtbp";
  var AD_PRODUCT_ID = "pro_01m31ms9xn7ec78wssjp61eb01";
  var REACH_PER_DOLLAR_MIN = 800;
  var REACH_PER_DOLLAR_MAX = 1000;
  var FEED_EVERY = 9; // a cada ~9 posts

  var draft = {
    ad_type: "click",
    body: "",
    media_url: "",
    media_type: "",
    link_url: "",
    days: 3,
    file: null
  };
  var myAds = [];
  var activeAds = [];
  var seenImpressions = {};
  var paddleReady = false;

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
      else console.log("[ads]", msg);
    } catch (e) {
      console.log("[ads]", msg);
    }
  }

  function SB() {
    return window.SB || window.tchiloSupabase || null;
  }

  function getUser() {
    try {
      if (window.session && window.session.user) return window.session.user;
      if (window.tchiloSession && window.tchiloSession.user) return window.tchiloSession.user;
    } catch (e) {}
    return null;
  }

  function getUserId() {
    var u = getUser();
    return u && (u.id || u.user_id) ? u.id || u.user_id : null;
  }

  function getUserEmail() {
    var u = getUser();
    return u && u.email ? u.email : null;
  }

  function money(days) {
    return Math.max(1, Math.min(30, parseInt(days, 10) || 1));
  }

  function reachRange(days) {
    var d = money(days);
    return { min: d * REACH_PER_DOLLAR_MIN, max: d * REACH_PER_DOLLAR_MAX, cost: d };
  }

  function formatNum(n) {
    try {
      return Number(n).toLocaleString("pt-PT");
    } catch (e) {
      return String(n);
    }
  }

  function isBlockedLink(url) {
    if (!url) return false;
    var u = String(url).toLowerCase();
    var blocked = [
      "wa.me",
      "whatsapp.com",
      "api.whatsapp",
      "t.me/",
      "telegram.me",
      "telegram.org",
      "instagram.com",
      "fb.me",
      "facebook.com",
      "tiktok.com",
      "snapchat.com",
      "play.google.com",
      "apps.apple.com",
      "app.store"
    ];
    for (var i = 0; i < blocked.length; i++) {
      if (u.indexOf(blocked[i]) >= 0) return true;
    }
    return false;
  }

  function normalizeUrl(url) {
    var u = String(url || "").trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    return u;
  }

  /* ---------- CSS / UI shells ---------- */
  function ensureCSS() {
    if (document.getElementById("tchiloAdsCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsCSS";
    st.textContent =
      "#screen-ads,#screen-ads-create{display:none;flex-direction:column;position:fixed;inset:0;z-index:1200;background:var(--paper,#f7f6f2);color:var(--ink,#0B0B0C)}" +
      "#screen-ads.open,#screen-ads-create.open{display:flex!important}" +
      ".ads-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:2px solid var(--ink,#0B0B0C);background:var(--paper,#f7f6f2)}" +
      ".ads-top h1{font:800 18px Inter,system-ui,sans-serif;margin:0;flex:1}" +
      ".ads-top button{width:40px;height:40px;border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:var(--yellow,#ffe566);font-size:20px;font-weight:900}" +
      ".ads-body{flex:1;overflow:auto;padding:14px 16px calc(24px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}" +
      ".ads-card{border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;padding:12px;margin-bottom:12px;background:#fff}" +
      ".ads-card .row{display:flex;justify-content:space-between;gap:8px;align-items:center;margin:4px 0}" +
      ".ads-badge{display:inline-block;padding:3px 8px;border-radius:999px;border:2px solid var(--ink,#0B0B0C);font:800 11px Inter,sans-serif;text-transform:uppercase}" +
      ".ads-badge.active{background:#c8f560}.ads-badge.paused{background:#ffe566}.ads-badge.expired,.ads-badge.pending{background:#eee}" +
      ".ads-field{margin-bottom:14px}" +
      ".ads-field label{display:block;font:800 12px Inter,sans-serif;margin-bottom:6px;text-transform:uppercase;letter-spacing:.03em;opacity:.7}" +
      ".ads-field input,.ads-field textarea,.ads-field select{width:100%;box-sizing:border-box;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;padding:12px;font:600 14px Inter,sans-serif;background:#fff}" +
      ".ads-field textarea{min-height:90px;resize:vertical}" +
      ".ads-types{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
      ".ads-type{border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;padding:12px;text-align:center;font:800 13px Inter,sans-serif;background:#fff;cursor:pointer}" +
      ".ads-type.on{background:#c8f560;box-shadow:3px 3px 0 var(--ink,#0B0B0C)}" +
      ".ads-reach{border:2.5px dashed var(--ink,#0B0B0C);border-radius:14px;padding:12px;background:#f1ecff;font:700 13px Inter,sans-serif;line-height:1.45;margin:8px 0 16px}" +
      ".ads-media-btn{display:flex;align-items:center;justify-content:center;min-height:120px;border:2.5px dashed var(--ink,#0B0B0C);border-radius:14px;background:#fff;cursor:pointer;font:800 13px Inter,sans-serif}" +
      ".ads-media-btn img,.ads-media-btn video{max-width:100%;max-height:180px;border-radius:10px}" +
      ".ads-pay{width:100%;padding:14px;border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:4px 4px 0 var(--ink,#0B0B0C);cursor:pointer}" +
      ".ads-pay:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--ink,#0B0B0C)}" +
      ".feed-ad{position:relative;border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;margin:12px 12px;overflow:hidden;background:#fff}" +
      ".feed-ad .ad-label{position:absolute;top:10px;left:10px;z-index:3;background:rgba(0,0,0,.72);color:#fff;font:800 10px Inter,sans-serif;padding:4px 8px;border-radius:8px;letter-spacing:.04em}" +
      ".feed-ad .ad-body{padding:12px 14px 14px;font:600 14px Inter,sans-serif}" +
      ".feed-ad .ad-media{width:100%;max-height:360px;object-fit:cover;display:block;background:#111}" +
      ".feed-ad .ad-cta{display:block;margin:0 14px 14px;padding:12px;text-align:center;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;background:#c8f560;font:900 14px Inter,sans-serif;color:var(--ink,#0B0B0C);text-decoration:none}" +
      "#tchiloAdsMgrBtn{display:flex!important}";
    document.head.appendChild(st);
  }

  function ensureScreens() {
    ensureCSS();
    if (!document.getElementById("screen-ads")) {
      var m = document.createElement("div");
      m.id = "screen-ads";
      m.innerHTML =
        '<div class="ads-top"><button type="button" id="adsBackMgr" aria-label="Voltar">‹</button><h1>Meus Anúncios</h1><button type="button" id="adsNewFromMgr" aria-label="Novo">+</button></div>' +
        '<div class="ads-body" id="adsListBody"><p style="opacity:.6;font-weight:700">A carregar…</p></div>';
      document.body.appendChild(m);
      document.getElementById("adsBackMgr").onclick = closeManager;
      document.getElementById("adsNewFromMgr").onclick = function () {
        openCreate();
      };
    }
    if (!document.getElementById("screen-ads-create")) {
      var c = document.createElement("div");
      c.id = "screen-ads-create";
      c.innerHTML =
        '<div class="ads-top"><button type="button" id="adsBackCreate" aria-label="Voltar">‹</button><h1>Criar anúncio</h1><span style="width:40px"></span></div>' +
        '<div class="ads-body" id="adsCreateBody"></div>';
      document.body.appendChild(c);
      document.getElementById("adsBackCreate").onclick = function () {
        document.getElementById("screen-ads-create").classList.remove("open");
      };
    }
  }

  function injectSettingsItem() {
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list || document.getElementById("tchiloAdsMgrBtn")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloAdsMgrBtn";
    btn.className = "settings-item";
    btn.innerHTML =
      '<div class="si-icon" style="background:#c8f560;border:2px solid var(--ink,#0B0B0C);border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:900">A</div>' +
      "<span>Meus Anúncios</span><span class=\"chev\">›</span>";
    btn.onclick = function (e) {
      e.preventDefault();
      openManager();
    };
    // depois do botão premium se existir
    var prem = document.getElementById("tchiloPremiumBtn");
    if (prem && prem.nextSibling) list.insertBefore(btn, prem.nextSibling);
    else if (prem) list.insertBefore(btn, prem.nextSibling);
    else if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);
  }

  /* ---------- Create form ---------- */
  function renderCreateForm() {
    ensureScreens();
    var body = document.getElementById("adsCreateBody");
    if (!body) return;
    var r = reachRange(draft.days);
    var mediaPreview = "";
    if (draft.media_url) {
      if (draft.media_type === "video")
        mediaPreview =
          '<video src="' +
          draft.media_url +
          '" class="ad-media" controls playsinline style="max-width:100%;max-height:180px;border-radius:10px"></video>';
      else
        mediaPreview =
          '<img src="' + draft.media_url + '" alt="" style="max-width:100%;max-height:180px;border-radius:10px"/>';
    } else {
      mediaPreview = "<span>Toque para adicionar imagem ou vídeo</span>";
    }

    body.innerHTML =
      '<div class="ads-field"><label>Tipo de anúncio</label><div class="ads-types">' +
      '<button type="button" class="ads-type' +
      (draft.ad_type === "click" ? " on" : "") +
      '" data-type="click">Clique<br><small style="font-weight:600;opacity:.7">Abre um site</small></button>' +
      '<button type="button" class="ads-type' +
      (draft.ad_type === "message" ? " on" : "") +
      '" data-type="message">Mensagem<br><small style="font-weight:600;opacity:.7">Conversa no Tchilo</small></button>' +
      "</div></div>" +
      '<div class="ads-field"><label>Texto / descrição</label><textarea id="adBody" maxlength="500" placeholder="Escreve a mensagem do anúncio…">' +
      (draft.body || "").replace(/</g, "<") +
      "</textarea></div>" +
      '<div class="ads-field"><label>Imagem ou vídeo</label>' +
      '<label class="ads-media-btn" id="adMediaBox">' +
      mediaPreview +
      '<input type="file" id="adMediaInput" accept="image/*,video/*" hidden/></label></div>' +
      (draft.ad_type === "click"
        ? '<div class="ads-field"><label>Link do site (https://…)</label><input id="adLink" type="url" placeholder="https://exemplo.com" value="' +
          (draft.link_url || "").replace(/"/g, """) +
          '"/><small style="display:block;margin-top:6px;opacity:.65;font-weight:600">Só sites. Sem WhatsApp, Instagram, TikTok, etc.</small></div>'
        : '<div class="ads-field"><p style="font-weight:700;opacity:.75;margin:0">Ao tocar, a pessoa abre uma conversa contigo no Tchilo.</p></div>') +
      '<div class="ads-field"><label>Duração (dias)</label><input id="adDays" type="number" min="1" max="30" value="' +
      draft.days +
      '"/></div>' +
      '<div class="ads-reach" id="adReachBox">' +
      draft.days +
      " dias = $" +
      r.cost +
      " · alcance estimado de <b>" +
      formatNum(r.min) +
      "</b> a <b>" +
      formatNum(r.max) +
      "</b> pessoas</div>" +
      '<button type="button" class="ads-pay" id="adPayBtn">Pagar $' +
      r.cost +
      " e publicar</button>";

    body.querySelectorAll(".ads-type").forEach(function (b) {
      b.onclick = function () {
        draft.ad_type = b.getAttribute("data-type") || "click";
        renderCreateForm();
      };
    });

    var ta = document.getElementById("adBody");
    if (ta)
      ta.oninput = function () {
        draft.body = ta.value;
      };

    var link = document.getElementById("adLink");
    if (link)
      link.oninput = function () {
        draft.link_url = link.value;
      };

    var days = document.getElementById("adDays");
    if (days)
      days.oninput = function () {
        draft.days = money(days.value);
        days.value = String(draft.days);
        var rr = reachRange(draft.days);
        var box = document.getElementById("adReachBox");
        if (box)
          box.innerHTML =
            draft.days +
            " dias = $" +
            rr.cost +
            " · alcance estimado de <b>" +
            formatNum(rr.min) +
            "</b> a <b>" +
            formatNum(rr.max) +
            "</b> pessoas";
        var pay = document.getElementById("adPayBtn");
        if (pay) pay.textContent = "Pagar $" + rr.cost + " e publicar";
      };

    var inp = document.getElementById("adMediaInput");
    if (inp)
      inp.onchange = function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        draft.file = f;
        draft.media_type = f.type.indexOf("video") === 0 ? "video" : "image";
        if (draft.media_url && draft.media_url.indexOf("blob:") === 0) {
          try {
            URL.revokeObjectURL(draft.media_url);
          } catch (e) {}
        }
        draft.media_url = URL.createObjectURL(f);
        renderCreateForm();
      };

    var payBtn = document.getElementById("adPayBtn");
    if (payBtn) payBtn.onclick = submitAndPay;
  }

  function openCreate() {
    if (!getUserId()) {
      toast("Inicia sessão para criar anúncios");
      return;
    }
    ensureScreens();
    document.getElementById("screen-ads-create").classList.add("open");
    renderCreateForm();
  }

  function openManager() {
    if (!getUserId()) {
      toast("Inicia sessão");
      return;
    }
    ensureScreens();
    document.getElementById("screen-ads").classList.add("open");
    loadMyAds();
  }

  function closeManager() {
    var el = document.getElementById("screen-ads");
    if (el) el.classList.remove("open");
  }

  /* ---------- Supabase ---------- */
  async function uploadMedia(file) {
    if (!file) return { url: null, type: null };
    var sb = SB();
    var uid = getUserId();
    if (!sb || !uid) return { url: null, type: null };
    var ext = (file.name && file.name.split(".").pop()) || (file.type.indexOf("video") === 0 ? "mp4" : "jpg");
    var path = "ads/" + uid + "/" + Date.now() + "." + ext;
    var buckets = ["posts", "media", "avatars", "public"];
    for (var i = 0; i < buckets.length; i++) {
      try {
        var up = await sb.storage.from(buckets[i]).upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || undefined
        });
        if (up.error) continue;
        var pub = sb.storage.from(buckets[i]).getPublicUrl(path);
        var url = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : null;
        if (url)
          return {
            url: url,
            type: file.type.indexOf("video") === 0 ? "video" : "image"
          };
      } catch (e) {}
    }
    // fallback: data URL (só imagens pequenas)
    if (file.type.indexOf("image") === 0 && file.size < 900000) {
      var dataUrl = await new Promise(function (resolve) {
        var fr = new FileReader();
        fr.onload = function () {
          resolve(fr.result);
        };
        fr.onerror = function () {
          resolve(null);
        };
        fr.readAsDataURL(file);
      });
      if (dataUrl) return { url: dataUrl, type: "image" };
    }
    toast("Não foi possível carregar o media. Tenta uma imagem mais leve.");
    return { url: null, type: null };
  }

  async function submitAndPay() {
    var uid = getUserId();
    if (!uid) {
      toast("Inicia sessão");
      return;
    }
    draft.days = money(draft.days);
    draft.body = String(draft.body || "").trim();
    if (!draft.body) {
      toast("Escreve a descrição do anúncio");
      return;
    }
    if (draft.ad_type === "click") {
      draft.link_url = normalizeUrl(draft.link_url);
      if (!draft.link_url) {
        toast("Indica o link do site");
        return;
      }
      if (isBlockedLink(draft.link_url)) {
        toast("Esse link não é permitido. Usa um site próprio.");
        return;
      }
    } else {
      draft.link_url = null;
    }

    var sb = SB();
    if (!sb) {
      toast("Sem ligação à base de dados");
      return;
    }

    toast("A preparar anúncio…");
    var media = { url: null, type: null };
    if (draft.file) media = await uploadMedia(draft.file);
    else if (draft.media_url && draft.media_url.indexOf("blob:") !== 0)
      media = { url: draft.media_url, type: draft.media_type || "image" };

    var r = reachRange(draft.days);
    var row = {
      user_id: uid,
      status: "pending",
      ad_type: draft.ad_type,
      body: draft.body,
      media_url: media.url,
      media_type: media.type,
      link_url: draft.ad_type === "click" ? draft.link_url : null,
      days: draft.days,
      reach_min: r.min,
      reach_max: r.max,
      impressions: 0,
      clicks: 0,
      conversations: 0
    };

    var ins = await sb.from("ads").insert(row).select("id").single();
    if (ins.error || !ins.data) {
      console.warn(ins.error);
      toast("Erro ao guardar anúncio. Corre o SQL dos anúncios no Supabase.");
      return;
    }
    var adId = ins.data.id;
    openAdCheckout(adId, draft.days);
  }

  /* ---------- Paddle ---------- */
  function loadPaddle() {
    return new Promise(function (resolve, reject) {
      if (window.Paddle && window.Paddle.Checkout) {
        resolve();
        return;
      }
      var s = document.querySelector("script[data-tchilo-paddle]") || document.createElement("script");
      if (!s.getAttribute("data-tchilo-paddle")) {
        s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
        s.async = true;
        s.setAttribute("data-tchilo-paddle", "1");
        document.head.appendChild(s);
      }
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("paddle"));
      };
      if (window.Paddle) resolve();
    });
  }

  function initPaddleOnce() {
    if (paddleReady) return Promise.resolve(true);
    return loadPaddle().then(function () {
      try {
        if (!window.__tchiloPaddleInitAds) {
          // se premium já inicializou, reutiliza
          if (!window.__tchiloPaddleInited) {
            Paddle.Initialize({
              token: PADDLE_TOKEN,
              eventCallback: function (event) {
                if (event && event.name === "checkout.completed") {
                  onCheckoutCompleted(event.data || {});
                }
              }
            });
            window.__tchiloPaddleInited = true;
          }
          window.__tchiloPaddleInitAds = true;
        }
        paddleReady = true;
        return true;
      } catch (e) {
        console.warn(e);
        return false;
      }
    });
  }

  function onCheckoutCompleted(data) {
    // o webhook ativa o anúncio; aqui só feedback
    toast("Pagamento recebido. O anúncio será ativado em instantes.");
    setTimeout(function () {
      loadMyAds();
      loadActiveAds();
    }, 2000);
    try {
      var create = document.getElementById("screen-ads-create");
      if (create) create.classList.remove("open");
      openManager();
    } catch (e) {}
  }

  // expôr para o módulo premium também reencaminhar eventos se já tiver callback
  window.__tchiloOnPaddleCompleted = function (data) {
    onCheckoutCompleted(data || {});
    if (typeof window.tchiloMarkPremium === "function") {
      /* premium trata o seu preço no próprio módulo */
    }
  };

  function openAdCheckout(adId, days) {
    initPaddleOnce().then(function (ok) {
      if (!ok || !window.Paddle) {
        toast("Não foi possível abrir o pagamento");
        return;
      }
      var qty = money(days);
      var opts = {
        items: [{ priceId: AD_PRICE_ID, quantity: qty }],
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "pt",
          allowLogout: false
        },
        customData: {
          app: "tchilo",
          kind: "ad",
          ad_id: adId,
          user_id: getUserId() || "",
          days: String(qty),
          product_id: AD_PRODUCT_ID
        }
      };
      var email = getUserEmail();
      if (email) opts.customer = { email: email };
      try {
        Paddle.Checkout.open(opts);
      } catch (e) {
        console.warn(e);
        toast("Erro no checkout");
      }
    });
  }

  /* ---------- Manager ---------- */
  async function loadMyAds() {
    var body = document.getElementById("adsListBody");
    var sb = SB();
    var uid = getUserId();
    if (!body) return;
    if (!sb || !uid) {
      body.innerHTML = "<p>Inicia sessão.</p>";
      return;
    }
    body.innerHTML = "<p style=\"opacity:.6;font-weight:700\">A carregar…</p>";
    var res = await sb
      .from("ads")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (res.error) {
      body.innerHTML =
        "<p>Erro ao carregar. Confirma que correste o SQL dos anúncios.</p>";
      return;
    }
    myAds = res.data || [];
    if (!myAds.length) {
      body.innerHTML =
        '<p style="font-weight:700;opacity:.7;margin-bottom:14px">Ainda não tens anúncios.</p>' +
        '<button type="button" class="ads-pay" id="adsEmptyCreate">Criar anúncio</button>';
      var b = document.getElementById("adsEmptyCreate");
      if (b) b.onclick = openCreate;
      return;
    }
    body.innerHTML = myAds
      .map(function (ad) {
        var st = ad.status || "pending";
        var left = "—";
        if (ad.ends_at) {
          var ms = new Date(ad.ends_at).getTime() - Date.now();
          left = ms > 0 ? Math.ceil(ms / 86400000) + " dias" : "0 dias";
        }
        var stats =
          "Impressões: " +
          formatNum(ad.impressions || 0) +
          " / " +
          formatNum(ad.reach_max || 0);
        if (ad.ad_type === "click")
          stats += " · Cliques: " + formatNum(ad.clicks || 0);
        else stats += " · Conversas: " + formatNum(ad.conversations || 0);
        var actions = "";
        if (st === "active")
          actions =
            '<button type="button" data-pause="' +
            ad.id +
            '" style="margin-top:8px;padding:8px 12px;border:2px solid #000;border-radius:10px;font-weight:800;background:#ffe566">Pausar</button>';
        if (st === "paused")
          actions =
            '<button type="button" data-resume="' +
            ad.id +
            '" style="margin-top:8px;padding:8px 12px;border:2px solid #000;border-radius:10px;font-weight:800;background:#c8f560">Reativar</button>';
        return (
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
          "<div style=\"font-size:12px;font-weight:700;opacity:.75\">" +
          stats +
          "<br>Restantes: " +
          left +
          "</div>" +
          actions +
          "</div>"
        );
      })
      .join("");

    body.querySelectorAll("[data-pause]").forEach(function (btn) {
      btn.onclick = function () {
        setAdStatus(btn.getAttribute("data-pause"), "paused");
      };
    });
    body.querySelectorAll("[data-resume]").forEach(function (btn) {
      btn.onclick = function () {
        setAdStatus(btn.getAttribute("data-resume"), "active");
      };
    });
  }

  async function setAdStatus(id, status) {
    var sb = SB();
    if (!sb) return;
    await sb.from("ads").update({ status: status, updated_at: new Date().toISOString() }).eq("id", id);
    loadMyAds();
    loadActiveAds();
  }

  /* ---------- Feed ---------- */
  async function loadActiveAds() {
    var sb = SB();
    if (!sb) return;
    try {
      var res = await sb
        .from("ads")
        .select("*")
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(40);
      activeAds = (res.data || []).filter(function (a) {
        return (a.impressions || 0) < (a.reach_max || 0);
      });
    } catch (e) {
      activeAds = [];
    }
  }

  function adCardHTML(ad) {
    var media = "";
    if (ad.media_url) {
      if (ad.media_type === "video")
        media =
          '<video class="ad-media" src="' +
          ad.media_url +
          '" muted playsinline loop autoplay></video>';
      else media = '<img class="ad-media" src="' + ad.media_url + '" alt=""/>';
    }
    var cta =
      ad.ad_type === "message"
        ? '<button type="button" class="ad-cta" data-ad-msg="' +
          ad.id +
          '" data-ad-user="' +
          ad.user_id +
          '">Enviar mensagem</button>'
        : '<a class="ad-cta" href="' +
          (ad.link_url || "#") +
          '" target="_blank" rel="noopener noreferrer" data-ad-click="' +
          ad.id +
          '">Saber mais</a>';
    return (
      '<article class="feed-ad" data-ad-id="' +
      ad.id +
      '"><span class="ad-label">Anúncio</span>' +
      media +
      '<div class="ad-body">' +
      String(ad.body || "").replace(/</g, "<") +
      "</div>" +
      cta +
      "</article>"
    );
  }

  function injectIntoFeed() {
    var feed = document.getElementById("feedList");
    if (!feed || !activeAds.length) return;
    // remover ads antigos injetados para repor posições
    feed.querySelectorAll(".feed-ad[data-tchilo-injected]").forEach(function (el) {
      el.remove();
    });
    var posts = Array.prototype.slice.call(
      feed.querySelectorAll(".post, article.post, .feed-post")
    );
    if (!posts.length) {
      // fallback: filhos diretos que não sejam ads
      posts = Array.prototype.slice.call(feed.children).filter(function (el) {
        return !el.classList.contains("feed-ad");
      });
    }
    if (!posts.length) return;

    var ai = 0;
    for (var i = FEED_EVERY - 1; i < posts.length && ai < activeAds.length; i += FEED_EVERY) {
      var ad = activeAds[ai % activeAds.length];
      ai++;
      var wrap = document.createElement("div");
      wrap.innerHTML = adCardHTML(ad);
      var node = wrap.firstChild;
      node.setAttribute("data-tchilo-injected", "1");
      var ref = posts[i];
      if (ref && ref.parentNode) ref.parentNode.insertBefore(node, ref.nextSibling);
      observeAd(node, ad.id);
      bindAdCta(node, ad);
    }
  }

  function observeAd(node, adId) {
    if (!node || seenImpressions[adId]) return;
    try {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && en.intersectionRatio >= 0.5) {
              if (seenImpressions[adId]) return;
              seenImpressions[adId] = true;
              recordImpression(adId);
              obs.disconnect();
            }
          });
        },
        { threshold: [0.5] }
      );
      obs.observe(node);
    } catch (e) {
      recordImpression(adId);
    }
  }

  function bindAdCta(node, ad) {
    var click = node.querySelector("[data-ad-click]");
    if (click) {
      click.addEventListener("click", function () {
        recordClick(ad.id);
      });
    }
    var msg = node.querySelector("[data-ad-msg]");
    if (msg) {
      msg.addEventListener("click", function (e) {
        e.preventDefault();
        recordConversation(ad.id);
        openMessageTo(ad.user_id);
      });
    }
  }

  async function recordImpression(adId) {
    var sb = SB();
    if (!sb) return;
    try {
      await sb.rpc("ads_record_impression", { p_ad_id: adId });
    } catch (e) {}
  }
  async function recordClick(adId) {
    var sb = SB();
    if (!sb) return;
    try {
      await sb.rpc("ads_record_click", { p_ad_id: adId });
    } catch (e) {}
  }
  async function recordConversation(adId) {
    var sb = SB();
    if (!sb) return;
    try {
      await sb.rpc("ads_record_conversation", { p_ad_id: adId });
    } catch (e) {}
  }

  function openMessageTo(userId) {
    try {
      if (typeof window.openChatWithUserId === "function") {
        window.openChatWithUserId(userId);
        return;
      }
      if (typeof window.startChatWith === "function") {
        window.startChatWith(userId);
        return;
      }
      if (typeof goTo === "function") goTo("messages");
      toast("Abre Mensagens para falar com o anunciante");
    } catch (e) {
      toast("Não foi possível abrir a conversa");
    }
  }

  /* ---------- boot ---------- */
  function patchRenderFeed() {
    if (typeof window.renderFeed !== "function" || window.renderFeed.__adsPatched) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      setTimeout(injectIntoFeed, 80);
      setTimeout(injectIntoFeed, 400);
      return r;
    };
    window.renderFeed.__adsPatched = true;
  }

  function boot() {
    ensureCSS();
    injectSettingsItem();
    patchRenderFeed();
    loadActiveAds().then(function () {
      injectIntoFeed();
    });
  }

  setInterval(injectSettingsItem, 2000);
  setInterval(patchRenderFeed, 3000);
  setInterval(function () {
    loadActiveAds().then(injectIntoFeed);
  }, 60000);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1000);
  setTimeout(boot, 3000);

  window.tchiloOpenAdsManager = openManager;
  window.tchiloOpenAdCreate = openCreate;
})();
