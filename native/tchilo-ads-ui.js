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
      "#tchiloAdsMgrBtn{display:flex!important;align-items:center;gap:12px;width:100%;border:0;background:none;padding:14px 18px;text-align:left;font:700 15px Inter,system-ui,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)}" +
      "#tchiloAdsMgrBtn .si-icon{width:36px;height:36px;border-radius:10px;background:#c8f560;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0}" +
      "#tchiloAdsMgrBtn .chev{margin-left:auto;opacity:.5;font-size:18px}" +
      ".post-boost-btn{display:inline-flex!important;align-items:center;justify-content:center;flex-shrink:0;margin-left:6px;padding:6px 10px;border:2px solid var(--ink,#0B0B0C)!important;border-radius:999px;background:#c8f560!important;font:800 11px Inter,system-ui,sans-serif!important;color:var(--ink,#0B0B0C)!important;cursor:pointer;line-height:1;white-space:nowrap;visibility:visible!important;opacity:1!important;z-index:2}" +
      ".post-boost-btn:active{transform:scale(.96)}" +
      ".post-head{align-items:center!important}" +
      "#tchiloAdsFallback{display:none;position:fixed;inset:0;z-index:4000;background:var(--paper,#f7f6f2);flex-direction:column;color:var(--ink,#0B0B0C)}" +
      "#tchiloAdsFallback.open{display:flex}" +
      "#tchiloAdsFallback .af-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:2.5px solid var(--ink,#0B0B0C)}" +
      "#tchiloAdsFallback .af-top h1{flex:1;margin:0;font:800 18px Inter,system-ui,sans-serif}" +
      "#tchiloAdsFallback .af-top button{width:40px;height:40px;border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#ffe566;font:900 20px Inter,sans-serif}" +
      "#tchiloAdsFallback .af-body{flex:1;overflow:auto;padding:16px;padding-bottom:calc(24px + env(safe-area-inset-bottom))}" +
      "#tchiloAdsFallback label{display:block;font:800 12px Inter,sans-serif;margin:12px 0 6px;text-transform:uppercase;opacity:.7}" +
      "#tchiloAdsFallback input,#tchiloAdsFallback textarea,#tchiloAdsFallback select{width:100%;box-sizing:border-box;padding:12px;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;font:600 14px Inter,sans-serif;background:#fff}" +
      "#tchiloAdsFallback textarea{min-height:90px}" +
      "#tchiloAdsFallback .af-reach{margin:12px 0;padding:12px;border:2.5px dashed var(--ink,#0B0B0C);border-radius:14px;background:#f1ecff;font:700 13px Inter,sans-serif}" +
      "#tchiloAdsFallback .af-pay{width:100%;margin-top:16px;padding:14px;border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:4px 4px 0 var(--ink,#0B0B0C)}";
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

  async function ensureAdsScript(cb) {
    if (typeof window.tchiloOpenAdCreate === "function") {
      cb && cb(true);
      return;
    }
    var list = scriptCandidates();
    for (var i = 0; i < list.length; i++) {
      await loadScriptOnce(list[i]);
      await new Promise(function (r) {
        setTimeout(r, 100);
      });
      if (typeof window.tchiloOpenAdCreate === "function") {
        cb && cb(true);
        return;
      }
    }
    var n = 0;
    var t = setInterval(function () {
      if (typeof window.tchiloOpenAdCreate === "function") {
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
        '<p style="margin-top:12px;font:600 12px Inter,sans-serif;opacity:.65">$1 por dia. O pagamento abre no Paddle.</p>' +
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

  function openMgr() {
    ensureAdsScript(function (ok) {
      if (ok && typeof window.tchiloOpenAdsManager === "function")
        window.tchiloOpenAdsManager();
      else if (ok && typeof window.tchiloOpenAdCreate === "function")
        window.tchiloOpenAdCreate();
      else openFallbackCreate();
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

    ensureAdsScript(function (ok) {
      if (ok && typeof window.tchiloOpenAdCreate === "function") {
        try {
          if (
            window.__tchiloBoostDraft &&
            typeof window.tchiloApplyAdDraft === "function"
          ) {
            window.tchiloApplyAdDraft(window.__tchiloBoostDraft);
          }
        } catch (e2) {}
        window.tchiloOpenAdCreate();
      } else openFallbackCreate();
    });
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
    btn.innerHTML =
      '<div class="si-icon">A</div><span>Meus Anúncios</span><div class="chev">›</div>';
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
            '<div class="so-icon" style="background:#c8f560;color:#0B0B0C;display:flex;align-items:center;justify-content:center">' +
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
