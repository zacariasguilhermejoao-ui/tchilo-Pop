/**
 * Tchilo Premium / Plus — banner + Google Play Billing
 * v7g — compra única inapp 4 USD; Capgo NativePurchases INAPP
 */
(function () {
  "use strict";
  if (window.__tchiloPremiumV7g) return;
  window.__tchiloPremiumV7g = true;
  window.__tchiloPremiumV7f = true;
  window.__tchiloPremiumV7 = true;
  window.__tchiloPremiumV6 = true;
  window.__tchiloPremiumV3 = true;

  var PLAY_PRODUCT_ID = window.__TCHILO_PLAY_PRODUCT_ID || "tchilo_plus";
  var PLAY_PRODUCT_TYPE = window.__TCHILO_PLAY_PRODUCT_TYPE || "inapp";
  var BANNER_SRC =
    window.__TCHILO_BANNER_PLUS ||
    (typeof location !== "undefined" ? location.origin + "/banner-plus.jpg" : "/banner-plus.jpg");

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(String(msg));
      else alert(String(msg));
    } catch (e) {}
  }

  function sessionUser() {
    try {
      if (typeof getSession === "function") return getSession();
      return JSON.parse(localStorage.getItem("tchilo_session") || "null");
    } catch (e) {
      return null;
    }
  }

  function SB() {
    return window.tchiloSupabase || window.supabaseClient || null;
  }

  async function currentUid() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    var s = SB();
    if (!s) return null;
    try {
      var auth = await s.auth.getSession();
      var uid =
        auth && auth.data && auth.data.session && auth.data.session.user && auth.data.session.user.id;
      if (uid) window.__tchiloCloudUserId = uid;
      return uid || null;
    } catch (e) {
      return null;
    }
  }

  function isPremiumLocal() {
    try {
      var sess = sessionUser();
      if (sess && (sess.isPremium || sess.premium)) return true;
    } catch (e) {}
    try {
      if (localStorage.getItem("tchilo_premium") === "1") return true;
    } catch (e2) {}
    return !!window.__tchiloIsPremium;
  }

  async function isPremium() {
    if (isPremiumLocal()) return true;
    var s = SB();
    var uid = await currentUid();
    if (!s || !uid) return false;
    try {
      var r = await s.from("profiles").select("is_premium,premium").eq("id", uid).maybeSingle();
      if (r.data && (r.data.is_premium || r.data.premium)) return true;
    } catch (e) {}
    return false;
  }

  function markPremiumLocal(on, meta) {
    try {
      localStorage.setItem("tchilo_premium", on ? "1" : "0");
    } catch (e) {}
    try {
      var sess = sessionUser();
      if (sess) {
        sess.isPremium = !!on;
        sess.premium = !!on;
        if (typeof setSession === "function") setSession(sess);
        else localStorage.setItem("tchilo_session", JSON.stringify(sess));
      }
    } catch (e2) {}
    window.__tchiloIsPremium = !!on;
  }

  async function markPremiumRemote(on, meta) {
    var s = SB();
    var uid = await currentUid();
    if (!s || !uid) return;
    try {
      var row = { is_premium: !!on, premium: !!on, premium_updated_at: new Date().toISOString() };
      if (meta && meta.purchaseToken) row.premium_txn = String(meta.purchaseToken).slice(0, 120);
      await s.from("profiles").update(row).eq("id", uid);
    } catch (e) {
      console.warn("[premium] remote", e);
    }
  }

  function markPremium(meta) {
    markPremiumLocal(true, meta || {});
    markPremiumRemote(true, meta || {});
    toast("Tchilo Plus ativado. Obrigado!");
  }

  function getBillingPlugin() {
    try {
      var C = window.Capacitor;
      if (!C || !C.Plugins) return null;
      var P = C.Plugins;
      if (P.NativePurchases) return { name: "NativePurchases", api: P.NativePurchases };
      if (P.Purchases) return { name: "Purchases", api: P.Purchases };
      if (P.Billing) return { name: "Billing", api: P.Billing };
      if (P.InAppPurchase) return { name: "InAppPurchase", api: P.InAppPurchase };
    } catch (e) {}
    return null;
  }

  function isNativeAndroid() {
    try {
      var C = window.Capacitor;
      if (C && C.isNativePlatform && C.isNativePlatform()) {
        if (C.getPlatform && C.getPlatform() === "android") return true;
      }
      if (C && C.getPlatform && C.getPlatform() === "android") return true;
    } catch (e) {}
    return false;
  }

  function productTypeForApi() {
    var t = String(PLAY_PRODUCT_TYPE || "inapp").toLowerCase();
    if (t === "subs" || t === "subscription") return "subs";
    return "inapp";
  }

  async function purchaseWithGooglePlay() {
    var plugin = getBillingPlugin();
    if (!plugin) {
      if (!isNativeAndroid()) {
        toast("O Plus compra-se na app Android (Google Play).");
        return false;
      }
      toast("Billing Google Play ainda não está no build. Gera um AAB novo.");
      return false;
    }
    toast("A abrir Google Play…");
    var api = plugin.api;
    var productId = PLAY_PRODUCT_ID;
    var pType = productTypeForApi();
    try {
      if (typeof api.purchaseProduct === "function") {
        var res = await api.purchaseProduct({
          productIdentifier: productId,
          productType: pType === "subs" ? "subs" : "inapp",
          quantity: 1,
        });
        var token =
          (res && (res.purchaseToken || res.transactionId || res.orderId || res.receipt)) ||
          null;
        if (res && (token || res.productIdentifier || res.transactionId === "" || res)) {
          if (token && typeof api.acknowledgePurchase === "function") {
            try {
              await api.acknowledgePurchase({ purchaseToken: token });
            } catch (ackErr) {
              console.warn("[premium] acknowledge", ackErr);
            }
          }
          markPremium({
            purchaseToken: token || productId,
            productId: productId,
            provider: "google_play",
          });
          return true;
        }
      }
      if (typeof api.purchase === "function") {
        var res2 = await api.purchase({
          productId: productId,
          productIdentifier: productId,
          type: pType,
        });
        if (res2 && (res2.purchaseToken || res2.transactionId || res2.orderId)) {
          markPremium({
            purchaseToken: res2.purchaseToken || res2.transactionId || res2.orderId,
            productId: productId,
            provider: "google_play",
          });
          return true;
        }
      }
      toast("Não foi possível concluir a compra.");
      return false;
    } catch (err) {
      var msg = (err && (err.message || err.errorMessage || err.code)) || "Compra cancelada";
      if (/cancel/i.test(String(msg))) toast("Compra cancelada");
      else toast(String(msg));
      return false;
    }
  }

  async function openCheckout() {
    var sess = sessionUser();
    if (!sess) {
      toast("Inicia sessão primeiro");
      return;
    }
    if (await isPremium()) {
      toast("Já tens o Plus ativo");
      return;
    }
    await purchaseWithGooglePlay();
  }

  function ensureCSS() {
    if (document.getElementById("tchiloPremiumBannerCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloPremiumBannerCSS";
    st.textContent =
      "#settings-premium-item.tchilo-plus-banner-btn,#tchiloPremiumBtn{" +
      "display:block!important;width:calc(100% - 36px)!important;margin:12px 18px 8px!important;" +
      "padding:0!important;border:0!important;border-radius:16px!important;overflow:hidden!important;" +
      "background:transparent!important;cursor:pointer!important;line-height:0!important;box-shadow:none!important;}" +
      "#settings-premium-item.tchilo-plus-banner-btn .si-icon," +
      "#settings-premium-item.tchilo-plus-banner-btn .chev," +
      "#settings-premium-item.tchilo-plus-banner-btn > span{display:none!important;}" +
      "#settings-premium-item.tchilo-plus-banner-btn img,#tchiloPremiumBtn img{" +
      "display:block!important;width:100%!important;height:auto!important;border-radius:16px!important;}" +
      "#tchiloPremiumSheet{position:fixed;inset:0;z-index:2147483640;display:none;flex-direction:column;background:var(--paper,#fff);color:var(--ink,#0B0B0C);}" +
      "#tchiloPremiumSheet.open{display:flex!important;}" +
      "#tchiloPremiumSheet .tp-top{display:flex;align-items:center;gap:10px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:1px solid var(--line,rgba(0,0,0,.12));flex-shrink:0;}" +
      "#tchiloPremiumSheet .tp-back{width:36px;height:36px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-appearance:none;appearance:none;}" +
      "#tchiloPremiumSheet .tp-back svg{width:18px;height:18px;}" +
      "#tchiloPremiumSheet .tp-top h1{margin:0;font:800 20px system-ui,-apple-system,BlinkMacSystemFont,sans-serif;flex:1;text-align:center;}" +
      "#tchiloPremiumSheet .tp-sp{width:36px;}" +
      "#tchiloPremiumSheet .tp-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 16px calc(100px + env(safe-area-inset-bottom));}" +
      "#tchiloPremiumSheet .tp-card{padding:8px 4px;text-align:left;}" +
      "#tchiloPremiumSheet .tp-card h2{margin:0 0 8px;font:900 24px system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}" +
      "#tchiloPremiumSheet .tp-card p{margin:0;font:600 14px system-ui,-apple-system,BlinkMacSystemFont,sans-serif;opacity:.6;line-height:1.4;}" +
      "#tchiloPremiumSheet .tp-foot{position:fixed;left:0;right:0;bottom:0;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:var(--paper,#fff);}" +
      "#tchiloPremiumSheet .tp-pay{display:block;width:100%;padding:16px;border:0;border-radius:16px;background:var(--ink,#0B0B0C);color:#fff;font:900 16px system-ui,-apple-system,BlinkMacSystemFont,sans-serif;cursor:pointer;}" +
      "#tchiloPremiumSheet .note{text-align:center;font:600 12px system-ui,-apple-system,sans-serif;opacity:.5;margin:10px 0 0;}";
    document.head.appendChild(st);
  }

  function installBanner() {
    ensureCSS();
    var list = document.querySelector("#screen-settings .settings-list");
    var old = document.getElementById("settings-premium-item");
    if (old && old.classList.contains("tchilo-plus-banner-btn") && old.querySelector("img")) return;

    var src =
      BANNER_SRC ||
      (typeof location !== "undefined" ? location.origin + "/banner-plus.jpg" : "/banner-plus.jpg");
    var html =
      '<img src="' +
      src +
      '?v=2" alt="Comprar o plano Plus" width="1500" height="750" style="display:block;width:100%;height:auto;border-radius:16px;object-fit:cover" loading="eager"/>';

    if (old) {
      old.className = "tchilo-plus-banner-btn";
      old.id = "settings-premium-item";
      old.type = "button";
      old.setAttribute("aria-label", "Comprar o Plus");
      old.removeAttribute("onclick");
      old.innerHTML = html;
      old.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openPremiumSheet();
      };
      old.style.cssText =
        "display:block;width:calc(100% - 36px);margin:12px 18px 8px;padding:0;border:0;border-radius:16px;overflow:hidden;background:transparent;cursor:pointer;line-height:0";
      return;
    }
    if (!list) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "settings-premium-item";
    btn.className = "tchilo-plus-banner-btn";
    btn.setAttribute("aria-label", "Comprar o Plus");
    btn.style.cssText =
      "display:block;width:calc(100% - 36px);margin:12px 18px 8px;padding:0;border:0;border-radius:16px;overflow:hidden;background:transparent;cursor:pointer;line-height:0";
    btn.innerHTML = html;
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openPremiumSheet();
    };
    if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);
  }

  async function openPremiumSheet() {
    ensureCSS();
    var sheet = document.getElementById("tchiloPremiumSheet");
    if (!sheet) {
      sheet = document.createElement("div");
      sheet.id = "tchiloPremiumSheet";
      document.body.appendChild(sheet);
    }
    var prem = false;
    try {
      prem = await isPremium();
    } catch (e) {}
    sheet.innerHTML =
      '<div class="tp-top">' +
      '<button type="button" class="back-btn tp-back" data-a="close" aria-label="Voltar">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<h1>Tchilo Plus</h1><div class="tp-sp"></div></div>' +
      '<div class="tp-scroll"><div class="tp-card">' +
      "<h2>" + (prem ? "Plus ativo" : "Comprar o Plus") + "</h2><p>" +
      (prem
        ? "Obrigado por apoiares o Tchilo."
        : "Mais ferramentas para criadores. Compra única · 4 USD · Google Play.") +
      "</p></div>" +
      (prem ? '<p class="note">Compra gerida na Google Play Store</p>' : "") +
      "</div>" +
      (prem
        ? ""
        : '<div class="tp-foot"><button type="button" class="tp-pay" data-a="pay">Comprar por 4 USD</button>' +
          '<p class="note">Compra única · Pagamento seguro via Google Play</p></div>');
    sheet.classList.add("open");
    sheet.onclick = function (ev) {
      var t = ev.target.closest("[data-a]");
      if (!t) return;
      var a = t.getAttribute("data-a");
      if (a === "close") sheet.classList.remove("open");
      if (a === "pay") openCheckout();
    };
  }

  window.tchiloOpenPremium = openPremiumSheet;
  window.tchiloOpenPremiumCheckout = openCheckout;
  window.tchiloIsPremium = isPremium;
  window.tchiloMarkPremium = markPremium;
  window.openPremium = openPremiumSheet;

  function boot() {
    installBanner();
  }

  try {
    var mo = new MutationObserver(function () {
      installBanner();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  setInterval(installBanner, 3000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
})();
