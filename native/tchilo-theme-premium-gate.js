/**
 * tchilo-Pop — Temas Premium
 * Só Clássico é grátis. Qualquer outro tema exige Tchilo Premium.
 */
(function () {
  "use strict";

  var FREE = { classic: true };
  var THEME_STORAGE = "tchilo_theme";

  function storageKey() {
    try {
      if (typeof THEME_KEY !== "undefined" && THEME_KEY) return THEME_KEY;
    } catch (e) {}
    return THEME_STORAGE;
  }

  function isPremium() {
    try {
      if (typeof window.tchiloIsPremium === "function") return !!window.tchiloIsPremium();
      if (window.__tchiloIsPremium === true) return true;
      var uid = null;
      try {
        if (typeof getSession === "function") {
          var s = getSession();
          if (s) uid = s.id || s.user_id || (s.user && s.user.id);
        }
        if (!uid && window.session) {
          uid =
            window.session.id ||
            window.session.user_id ||
            (window.session.user && window.session.user.id);
        }
      } catch (e0) {}
      if (uid && localStorage.getItem("tchilo_premium_" + uid) === "1") return true;
      if (localStorage.getItem("tchilo_premium") === "1") return true;
    } catch (e) {}
    return false;
  }

  function openPremiumUpsell() {
    try {
      if (typeof showToast === "function")
        showToast("Temas exclusivos do Tchilo Premium");
    } catch (e) {}
    try {
      if (typeof window.tchiloOpenPremium === "function") {
        window.tchiloOpenPremium();
        return;
      }
      if (typeof window.openPremium === "function") {
        window.openPremium();
        return;
      }
    } catch (e2) {}
    try {
      if (typeof goTo === "function") goTo("settings");
    } catch (e3) {}
    alert("Temas extras são do Tchilo Premium. Assina em Definições.");
  }

  function forceClassic() {
    try {
      localStorage.setItem(storageKey(), "classic");
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", "classic");
    try {
      document.body.removeAttribute("data-theme");
    } catch (e2) {}
    var frame = document.getElementById("appFrame");
    if (frame) frame.setAttribute("data-theme", "classic");
    var label = document.getElementById("currentThemeLabel");
    if (label) label.textContent = "Clássico";
    [
      "classic",
      "dark",
      "yellow",
      "violet",
      "red",
      "retro",
      "halloween",
      "gothic",
      "neon",
      "natal",
      "sunset",
      "pastel",
      "vaporwave"
    ].forEach(function (code) {
      var el = document.getElementById("theme-check-" + code);
      if (el) el.textContent = code === "classic" ? "✓" : "";
    });
  }

  function canUse(theme) {
    if (!theme || theme === "classic") return true;
    return isPremium();
  }

  function ensureLockCSS() {
    if (document.getElementById("tchiloThemePremiumCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloThemePremiumCSS";
    st.textContent =
      "#screen-settings-theme .settings-item[data-theme-locked=\"1\"]{opacity:.72;position:relative}" +
      "#screen-settings-theme .settings-item[data-theme-locked=\"1\"]::after{" +
      "content:'Premium';font:800 10px Inter,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;" +
      "margin-left:8px;padding:3px 8px;border-radius:999px;background:#c8f560;color:#0B0B0C;border:2px solid #0B0B0C}" +
      "#screen-settings-theme .settings-item[data-theme-opt=\"classic\"]::after{display:none}" +
      "#tchiloThemePremiumBanner{display:none;margin:12px 14px;padding:12px 14px;border:2.5px solid var(--ink,#0B0B0C);" +
      "border-radius:14px;background:#c8f560;color:#0B0B0C;font:700 13px Inter,system-ui,sans-serif}" +
      "#tchiloThemePremiumBanner.show{display:block}" +
      "#tchiloThemePremiumBanner b{display:block;font:900 14px Inter,sans-serif;margin-bottom:4px}";
    document.head.appendChild(st);
  }

  function injectBanner() {
    ensureLockCSS();
    var screen = document.getElementById("screen-settings-theme");
    if (!screen) return;
    var banner = document.getElementById("tchiloThemePremiumBanner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "tchiloThemePremiumBanner";
      banner.innerHTML =
        "<b>Temas Premium</b>Clássico é grátis. Os outros temas exigem Tchilo Premium.";
      var list = screen.querySelector(".settings-list");
      if (list && list.parentNode) list.parentNode.insertBefore(banner, list);
      else screen.appendChild(banner);
    }
    if (isPremium()) banner.classList.remove("show");
    else banner.classList.add("show");
  }

  function markLockedItems() {
    ensureLockCSS();
    injectBanner();
    var prem = isPremium();
    document.querySelectorAll("#screen-settings-theme .settings-item").forEach(function (btn) {
      var code =
        btn.getAttribute("data-theme-opt") ||
        (btn.getAttribute("onclick") || "").match(/setAppTheme\('([^']+)'\)/);
      if (Array.isArray(code)) code = code[1];
      if (!code) {
        // botões nativos: classic/dark/... via onclick
        var oc = btn.getAttribute("onclick") || "";
        var m = oc.match(/setAppTheme\(['\"]([^'\"]+)['\"]\)/);
        if (m) code = m[1];
      }
      if (!code) return;
      if (code === "classic" || prem) {
        btn.removeAttribute("data-theme-locked");
      } else {
        btn.setAttribute("data-theme-locked", "1");
      }
    });
  }

  function patchSetAppTheme() {
    if (typeof window.setAppTheme !== "function") return false;
    if (window.setAppTheme.__premiumGate) return true;
    var orig = window.setAppTheme;
    window.setAppTheme = function (theme) {
      var t = theme || "classic";
      if (!canUse(t)) {
        openPremiumUpsell();
        return;
      }
      return orig.apply(this, arguments);
    };
    window.setAppTheme.__premiumGate = true;
    return true;
  }

  // interceptar cliques nos itens de tema (extras injectados)
  function bindListClicks() {
    var list = document.querySelector("#screen-settings-theme .settings-list");
    if (!list || list.__tchiloThemeGate) return;
    list.__tchiloThemeGate = true;
    list.addEventListener(
      "click",
      function (e) {
        var btn = e.target && e.target.closest && e.target.closest(".settings-item");
        if (!btn || !list.contains(btn)) return;
        var code = btn.getAttribute("data-theme-opt");
        if (!code) {
          var oc = btn.getAttribute("onclick") || "";
          var m = oc.match(/setAppTheme\(['\"]([^'\"]+)['\"]\)/);
          if (m) code = m[1];
        }
        if (!code) return;
        if (!canUse(code)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          openPremiumUpsell();
        }
      },
      true
    );
  }

  function enforceStored() {
    var cur = "classic";
    try {
      cur = localStorage.getItem(storageKey()) || "classic";
    } catch (e) {}
    if (!canUse(cur)) forceClassic();
  }

  // API pública para outros módulos de tema
  window.tchiloThemeRequiresPremium = function (code) {
    return !canUse(code);
  };
  window.tchiloCanUseTheme = canUse;
  window.tchiloOpenThemePremium = openPremiumUpsell;

  function boot() {
    patchSetAppTheme();
    bindListClicks();
    markLockedItems();
    enforceStored();
  }

  setInterval(function () {
    patchSetAppTheme();
    bindListClicks();
    markLockedItems();
    enforceStored();
  }, 1200);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
})();
