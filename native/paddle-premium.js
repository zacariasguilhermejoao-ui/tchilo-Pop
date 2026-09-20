/**
 * tchilo-Pop — Paddle: Tchilo Premium
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
      if (window.SB && window.SB.auth) {
        /* async not here */
      }
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
        existing.addEventListener("load", function () {
          resolve();
        });
        existing.addEventListener("error", function () {
          reject(new Error("Paddle script fail"));
        });
        return;
      }
      var s = document.createElement("script");
      s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      s.async = true;
      s.setAttribute("data-tchilo-paddle", "1");
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("Paddle script fail"));
      };
      document.head.appendChild(s);
    });
  }

  function initPaddle() {
    if (paddleReady) return Promise.resolve(true);
    return loadPaddleScript()
      .then(function () {
        if (!window.Paddle) throw new Error("Paddle em falta");
        // Live token — sem Environment.set('sandbox')
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
              try {
                Paddle.Checkout.close();
              } catch (e) {}
            }
            if (event.name === "checkout.error") {
              console.warn("[premium] checkout.error", event);
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
      toast("Já tens Tchilo Premium");
      return;
    }
    initPaddle().then(function (ok) {
      if (!ok || !window.Paddle) {
        toast("Não foi possível abrir o pagamento. Tenta de novo.");
        return;
      }
      var opts = {
        items: [{ priceId: PRICE_ID, quantity: 1 }],
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "pt",
          allowLogout: false
        },
        customData: {
          app: "tchilo",
          product: PRODUCT_NAME,
          product_id: PRODUCT_ID,
          user_id: getUserId() || ""
        }
      };
      var email = getUserEmail();
      if (email) {
        opts.customer = { email: email };
      }
      try {
        Paddle.Checkout.open(opts);
      } catch (e) {
        console.warn("[premium] open", e);
        toast("Erro ao abrir checkout");
      }
    });
  }

  function updatePremiumUI() {
    var btn = document.getElementById("tchiloPremiumBtn");
    if (!btn) return;
    var on = isPremiumLocal();
    var title = btn.querySelector("[data-prem-title]");
    var sub = btn.querySelector("[data-prem-sub]");
    if (on) {
      if (title) title.textContent = "Tchilo Premium";
      if (sub) sub.textContent = "Ativo";
      btn.classList.add("premium-on");
    } else {
      if (title) title.textContent = "Tchilo Premium";
      if (sub) sub.textContent = "$3 · Ativar";
      btn.classList.remove("premium-on");
    }
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
        "#tchiloPremiumBtn{display:flex;align-items:center;gap:12px;width:calc(100% - 36px);margin:12px 18px 4px;padding:14px 14px;border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:linear-gradient(135deg,#c8f560 0%,#9ee0ff 100%);color:var(--ink,#0B0B0C);font:800 14px Inter,system-ui,sans-serif;text-align:left;cursor:pointer;box-shadow:4px 4px 0 var(--ink,#0B0B0C)}" +
        "#tchiloPremiumBtn .prem-icon{width:42px;height:42px;border-radius:12px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}" +
        "#tchiloPremiumBtn .prem-text{flex:1;min-width:0}" +
        "#tchiloPremiumBtn .prem-text b{display:block;font-size:15px}" +
        "#tchiloPremiumBtn .prem-text span{display:block;font-size:12px;font-weight:700;opacity:.75;margin-top:2px}" +
        "#tchiloPremiumBtn.premium-on{background:linear-gradient(135deg,#ffe566 0%,#c8f560 100%)}" +
        "#tchiloPremiumBtn:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--ink,#0B0B0C)}";
      document.head.appendChild(st);
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloPremiumBtn";
    btn.innerHTML =
      '<div class="prem-icon" aria-hidden="true">★</div>' +
      '<div class="prem-text"><b data-prem-title>Tchilo Premium</b><span data-prem-sub>$3 · Ativar</span></div>' +
      '<span class="chev" style="font-size:18px;opacity:.6">›</span>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCheckout();
    };

    // inserir no topo da lista de definições
    if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);

    updatePremiumUI();
  }

  // API pública
  window.tchiloOpenPremiumCheckout = openCheckout;
  window.tchiloIsPremium = isPremiumLocal;
  window.tchiloMarkPremium = markPremium;

  function boot() {
    injectSettingsButton();
    updatePremiumUI();
    // pré-carregar Paddle em idle
    setTimeout(function () {
      try {
        initPaddle();
      } catch (e) {}
    }, 2500);
  }

  setInterval(injectSettingsButton, 1500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
})();
