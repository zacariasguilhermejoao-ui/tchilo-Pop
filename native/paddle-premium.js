/**
 * tchilo-Pop — Paddle: Tchilo Premium / Plus
 * v3 — banner promocional Plus nas Definições
 * Client token only (never API secret in frontend)
 */
(function () {
  "use strict";

  var PADDLE_TOKEN = "live_05be77c7629150c894e94e62559";
  var PRICE_ID = "pri_01m2ztke3vf0v4xwj13t0hbdav";
  var PRODUCT_ID = "pro_01m2ztbfaqeme2ycp5ehf2zakk";
  var PRODUCT_NAME = "Tchilo Premium";

  var paddleReady = false;
  var paddleInitError = null;

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
      else if (window.__tchiloRealShowToast) window.__tchiloRealShowToast(msg);
      else console.log("[premium]", msg);
    } catch (e) {
      console.log("[premium]", msg);
    }
  }

  function currentUser() {
    try {
      if (window.session && window.session.user) return window.session.user;
      if (window.tchiloSession && window.tchiloSession.user) return window.tchiloSession.user;
    } catch (e) {}
    return null;
  }

  function getUserId() {
    var u = currentUser();
    return u && (u.id || u.user_id) ? u.id || u.user_id : null;
  }

  function getUserEmail() {
    var u = currentUser();
    return u && u.email ? u.email : null;
  }

  function isPremiumLocal() {
    try {
      var uid = getUserId();
      if (!uid) return localStorage.getItem("tchilo_premium") === "1";
      return localStorage.getItem("tchilo_premium_" + uid) === "1";
    } catch (e) {
      return false;
    }
  }

  function setPremiumLocal(on, meta) {
    try {
      var uid = getUserId();
      var key = uid ? "tchilo_premium_" + uid : "tchilo_premium";
      if (on) {
        localStorage.setItem(key, "1");
        if (meta) localStorage.setItem(key + "_meta", JSON.stringify(meta));
      } else {
        localStorage.removeItem(key);
        localStorage.removeItem(key + "_meta");
      }
    } catch (e) {}
    window.__tchiloIsPremium = !!on;
    updatePremiumUI();
  }

  async function setPremiumRemote(on, meta) {
    var uid = getUserId();
    if (!uid) return;
    var SB = window.SB || window.tchiloSupabase;
    if (!SB) return;
    try {
      var row = {
        id: uid,
        is_premium: !!on,
        premium_updated_at: new Date().toISOString()
      };
      if (meta && meta.transactionId) row.premium_txn = String(meta.transactionId).slice(0, 120);
      await SB.from("profiles").upsert(row, { onConflict: "id" });
    } catch (e) {
      console.warn("[premium] remote", e);
    }
  }

  function markPremium(meta) {
    setPremiumLocal(true, meta || {});
    setPremiumRemote(true, meta || {});
    toast("Tchilo Premium ativado. Obrigado!");
  }

  function loadPaddleScript() {
    return new Promise(function (resolve, reject) {
      if (window.Paddle && typeof window.Paddle.Initialize === "function") {
        resolve();
        return;
      }
      var existing = document.querySelector('script[data-tchilo-paddle]');
      if (existing) {
        existing.addEventListener("load", function () { resolve(); });
        existing.addEventListener("error", function () { reject(new Error("Paddle script fail")); });
        return;
      }
      var s = document.createElement("script");
      s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      s.async = true;
      s.setAttribute("data-tchilo-paddle", "1");
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("Paddle script fail")); };
      document.head.appendChild(s);
    });
  }

  function initPaddle() {
    if (paddleReady) return Promise.resolve(true);
    return loadPaddleScript()
      .then(function () {
        if (!window.Paddle) throw new Error("Paddle em falta");
        Paddle.Initialize({
          token: PADDLE_TOKEN,
          eventCallback: function (event) {
            if (!event || !event.name) return;
            if (event.name === "checkout.completed") {
              var data = event.data || {};
              markPremium({
                transactionId: data.transaction_id || data.id || null,
                customerId: data.customer && data.customer.id ? data.customer.id : null,
                at: new Date().toISOString()
              });
              try { Paddle.Checkout.close(); } catch (e) {}
            }
          }
        });
        paddleReady = true;
        return true;
      })
      .catch(function (err) {
        paddleInitError = err;
        console.warn("[premium] init", err);
        return false;
      });
  }

  function openCheckout() {
    if (isPremiumLocal()) {
      toast("Ja tens Tchilo Premium");
      return;
    }
    initPaddle().then(function (ok) {
      if (!ok || !window.Paddle) {
        toast("Nao foi possivel abrir o pagamento. Tenta de novo.");
        return;
      }
      var opts = {
        items: [{ priceId: PRICE_ID, quantity: 1 }],
        settings: { displayMode: "overlay", theme: "light", locale: "pt", allowLogout: false },
        customData: {
          app: "tchilo",
          product: PRODUCT_NAME,
          product_id: PRODUCT_ID,
          user_id: getUserId() || ""
        }
      };
      var email = getUserEmail();
      if (email) opts.customer = { email: email };
      try { Paddle.Checkout.open(opts); } catch (e) {
        console.warn("[premium] open", e);
        toast("Erro ao abrir checkout");
      }
    });
  }

  function updatePremiumUI() {
    var btn = document.getElementById("tchiloPremiumBtn");
    if (!btn) return;
    var on = isPremiumLocal();
    if (on) btn.classList.add("premium-on");
    else btn.classList.remove("premium-on");
  }

  function bannerSrc() {
    if (window.__TCHILO_BANNER_PLUS) return window.__TCHILO_BANNER_PLUS;
    return (
      "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/main/resources/banner-plus.jpg"
    );
  }

  function injectSettingsButton() {
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;
    if (document.getElementById("tchiloPremiumBtn")) {
      updatePremiumUI();
      return;
    }

    if (!document.getElementById("tchiloPremiumCSS")) {
      var st = document.createElement("style");
      st.id = "tchiloPremiumCSS";
      st.textContent =
        "#tchiloPremiumBtn{display:block;width:calc(100% - 36px);margin:12px 18px 8px;padding:0;border:0;border-radius:16px;overflow:hidden;background:transparent;cursor:pointer;box-shadow:none;line-height:0;position:relative}" +
        "#tchiloPremiumBtn img{display:block;width:100%;height:auto;border-radius:16px;object-fit:cover}" +
        "#tchiloPremiumBtn:active{opacity:.88}" +
        "#tchiloPremiumBtn .prem-active-tag{display:none;position:absolute;right:12px;top:12px;background:rgba(11,11,12,.75);color:#fff;font:700 11px system-ui,sans-serif;padding:4px 8px;border-radius:8px}" +
        "#tchiloPremiumBtn.premium-on .prem-active-tag{display:block}";
      document.head.appendChild(st);
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloPremiumBtn";
    btn.setAttribute("aria-label", "Assinar o Plus");
    btn.innerHTML =
      '<img src="' +
      bannerSrc() +
      '" alt="Assine o plano Plus" width="1500" height="750" loading="lazy"/>' +
      '<span class="prem-active-tag">Plus ativo</span>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCheckout();
    };

    if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);

    updatePremiumUI();
  }

  window.tchiloOpenPremiumCheckout = openCheckout;
  window.tchiloIsPremium = isPremiumLocal;
  window.tchiloMarkPremium = markPremium;

  function boot() {
    injectSettingsButton();
    updatePremiumUI();
    setTimeout(function () {
      try { initPaddle(); } catch (e) {}
    }, 2500);
  }

  setInterval(injectSettingsButton, 15000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
})();
