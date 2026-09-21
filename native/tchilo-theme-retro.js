/**
 * tchilo-Pop — Tema Retro
 */
(function () {
  "use strict";

  var CODE = "retro";
  var LABEL = "Retro";
  var THEME_STORAGE = "tchilo_theme";

  function ensureCSS() {
    if (document.getElementById("tchiloThemeRetroCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloThemeRetroCSS";
    st.textContent =
      '[data-theme="retro"]{' +
      '--ink:#2A1F14;' +
      '--paper:#F3E5C4;' +
      '--mint:#2A9D8F;' +
      '--pink:#E76F51;' +
      '--yellow:#E9C46A;' +
      '--violet:#9C6644;' +
      '--line:#2A1F14;' +
      '--muted:#6B5344;' +
      '}' +
      '[data-theme="retro"] #appFrame,' +
      '[data-theme="retro"].frame{' +
      'background:var(--paper);' +
      'background-image:' +
      'radial-gradient(ellipse at 20% 0%, rgba(233,196,106,.35), transparent 55%),' +
      'radial-gradient(ellipse at 90% 100%, rgba(42,157,143,.18), transparent 50%);' +
      '}' +
      '[data-theme="retro"] .topbar,' +
      '[data-theme="retro"] .bottom-nav,' +
      '[data-theme="retro"] .screen-header{' +
      'border-color:var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .post{' +
      'border-color:var(--ink)!important;' +
      'box-shadow:3px 3px 0 rgba(42,31,20,.12);' +
      '}' +
      '[data-theme="retro"] .nav-create,' +
      '[data-theme="retro"] .post-boost-btn{' +
      'background:#E9C46A!important;' +
      'color:#2A1F14!important;' +
      '}' +
      '[data-theme="retro"] .follow-btn,' +
      '[data-theme="retro"] .post-follow{' +
      'background:#2A9D8F!important;' +
      'color:#F3E5C4!important;' +
      'border-color:#2A1F14!important;' +
      '}' +
      '[data-theme="retro"] body{background:#2A1F14;}';
    document.head.appendChild(st);
  }

  function storageKey() {
    try {
      if (typeof THEME_KEY !== "undefined" && THEME_KEY) return THEME_KEY;
    } catch (e) {}
    return THEME_STORAGE;
  }

  function applyRetro() {
    ensureCSS();
    try {
      localStorage.setItem(storageKey(), CODE);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", CODE);
    var frame = document.getElementById("appFrame");
    if (frame) frame.setAttribute("data-theme", CODE);
    var label = document.getElementById("currentThemeLabel");
    if (label) label.textContent = LABEL;
    syncAllChecks(CODE);
  }

  function syncAllChecks(active) {
    ["classic", "dark", "yellow", "violet", "red", CODE].forEach(function (code) {
      var el = document.getElementById("theme-check-" + code);
      if (el) el.textContent = active === code ? "✓" : "";
    });
  }

  function injectSettingsItem() {
    var list = document.querySelector("#screen-settings-theme .settings-list");
    if (!list) return;
    if (document.getElementById("theme-check-retro")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "settings-item";
    btn.setAttribute("data-theme-opt", CODE);
    btn.onclick = function () {
      applyRetro();
      try {
        if (typeof showToast === "function") showToast("Tema Retro");
      } catch (e) {}
    };
    btn.innerHTML =
      '<div class="theme-swatch" style="background:linear-gradient(135deg,#F3E5C4 40%,#E76F51 40% 70%,#2A9D8F 70%)"></div>' +
      "<span>" +
      LABEL +
      "</span>" +
      '<span id="theme-check-retro" class="theme-check"></span>';
    list.appendChild(btn);

    var cur = "classic";
    try {
      cur = localStorage.getItem(storageKey()) || "classic";
    } catch (e2) {}
    syncAllChecks(cur);
  }

  function patchSetAppTheme() {
    if (typeof window.setAppTheme !== "function") return false;
    if (window.setAppTheme.__retro2) return true;
    var orig = window.setAppTheme;
    window.setAppTheme = function (theme) {
      if (theme === CODE) {
        applyRetro();
        return;
      }
      var r = orig.apply(this, arguments);
      // limpar check retro quando outro tema é escolhido
      var el = document.getElementById("theme-check-retro");
      if (el) el.textContent = "";
      return r;
    };
    window.setAppTheme.__retro2 = true;
    return true;
  }

  function patchGetAppTheme() {
    if (typeof window.getAppTheme !== "function") return false;
    if (window.getAppTheme.__retro2) return true;
    var orig = window.getAppTheme;
    window.getAppTheme = function () {
      try {
        var stored = localStorage.getItem(storageKey()) || "";
        if (stored === CODE) return CODE;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.getAppTheme.__retro2 = true;
    return true;
  }

  function patchLabels() {
    try {
      if (window.THEME_LABELS) window.THEME_LABELS[CODE] = LABEL;
    } catch (e) {}
  }

  function applyIfStored() {
    try {
      if (localStorage.getItem(storageKey()) === CODE) applyRetro();
    } catch (e) {}
  }

  function boot() {
    ensureCSS();
    patchLabels();
    patchSetAppTheme();
    patchGetAppTheme();
    injectSettingsItem();
    applyIfStored();
  }

  setInterval(function () {
    injectSettingsItem();
    patchSetAppTheme();
    patchGetAppTheme();
    patchLabels();
  }, 1500);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
