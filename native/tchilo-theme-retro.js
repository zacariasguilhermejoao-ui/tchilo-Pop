/**
 * tchilo-Pop — Tema Retro
 * Estética anos 70/80: bege quente, laranja queimado, teal, tipografia com carácter.
 */
(function () {
  "use strict";

  var CODE = "retro";
  var LABEL = "Retro";

  function ensureCSS() {
    if (document.getElementById("tchiloThemeRetroCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloThemeRetroCSS";
    st.textContent =
      /* cores do tema */
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
      /* ambiente retro no frame */
      '[data-theme="retro"] #appFrame,' +
      '[data-theme="retro"].frame{' +
      'background:var(--paper);' +
      'background-image:' +
      'radial-gradient(ellipse at 20% 0%, rgba(233,196,106,.35), transparent 55%),' +
      'radial-gradient(ellipse at 90% 100%, rgba(42,157,143,.18), transparent 50%);' +
      '}' +
      /* topbar e nav com traço “vintage” */
      '[data-theme="retro"] .topbar,' +
      '[data-theme="retro"] .bottom-nav,' +
      '[data-theme="retro"] .screen-header{' +
      'border-color:var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .post{' +
      'border-color:var(--ink)!important;' +
      'box-shadow:3px 3px 0 rgba(42,31,20,.12);' +
      '}' +
      '[data-theme="retro"] .settings-item{' +
      'border-color:rgba(42,31,20,.12);' +
      '}' +
      /* botão + e acentos */
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
      /* textura subtil (opcional, leve) */
      '[data-theme="retro"] body{' +
      'background:#2A1F14;' +
      '}';
    document.head.appendChild(st);
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
      if (typeof window.setAppTheme === "function") window.setAppTheme(CODE);
      else applyRetroFallback();
    };
    btn.innerHTML =
      '<div class="theme-swatch" style="background:linear-gradient(135deg,#F3E5C4 40%,#E76F51 40% 70%,#2A9D8F 70%)"></div>' +
      "<span>" +
      LABEL +
      "</span>" +
      '<span id="theme-check-retro" class="theme-check"></span>';
    list.appendChild(btn);
    syncCheck();
  }

  function applyRetroFallback() {
    try {
      localStorage.setItem("tchilo_theme", CODE);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", CODE);
    var frame = document.getElementById("appFrame");
    if (frame) frame.setAttribute("data-theme", CODE);
    syncCheck();
    var label = document.getElementById("currentThemeLabel");
    if (label) label.textContent = LABEL;
  }

  function syncCheck() {
    var cur = "classic";
    try {
      if (typeof window.getAppTheme === "function") cur = window.getAppTheme();
      else cur = localStorage.getItem("tchilo_theme") || "classic";
    } catch (e) {}
    var el = document.getElementById("theme-check-retro");
    if (el) el.textContent = cur === CODE ? "✓" : "";
  }

  function patchThemeLabels() {
    try {
      if (window.THEME_LABELS && !window.THEME_LABELS[CODE]) {
        window.THEME_LABELS[CODE] = LABEL;
      }
    } catch (e) {}
  }

  function patchSetAppTheme() {
    if (typeof window.setAppTheme !== "function") return false;
    if (window.setAppTheme.__retro) return true;
    var orig = window.setAppTheme;
    window.setAppTheme = function (theme) {
      // permitir retro mesmo se validação antiga rejeitar
      try {
        if (theme === CODE) {
          localStorage.setItem(
            typeof THEME_KEY !== "undefined" ? THEME_KEY : "tchilo_theme",
            CODE
          );
        }
      } catch (e) {}
      var r = orig.apply(this, arguments);
      if (theme === CODE) {
        document.documentElement.setAttribute("data-theme", CODE);
        var frame = document.getElementById("appFrame");
        if (frame) frame.setAttribute("data-theme", CODE);
      }
      syncCheck();
      // atualizar checks de todos se a função original não incluir retro
      try {
        ["classic", "dark", "yellow", "violet", "red", CODE].forEach(function (code) {
          var el = document.getElementById("theme-check-" + code);
          if (el)
            el.textContent =
              (typeof getAppTheme === "function" ? getAppTheme() : theme) === code
                ? "✓"
                : "";
        });
      } catch (e2) {}
      return r;
    };
    window.setAppTheme.__retro = true;
    return true;
  }

  function patchGetAppTheme() {
    if (typeof window.getAppTheme !== "function") return false;
    if (window.getAppTheme.__retro) return true;
    var orig = window.getAppTheme;
    window.getAppTheme = function () {
      var t = orig.apply(this, arguments);
      if (t === CODE) return CODE;
      try {
        var stored =
          localStorage.getItem(
            typeof THEME_KEY !== "undefined" ? THEME_KEY : "tchilo_theme"
          ) || "";
        if (stored === CODE) return CODE;
      } catch (e) {}
      return t;
    };
    window.getAppTheme.__retro = true;
    return true;
  }

  function patchApplyThemeUI() {
    // se existir função que só lista 5 temas, forçar inclusão
    try {
      if (window.THEME_LABELS) window.THEME_LABELS[CODE] = LABEL;
    } catch (e) {}
  }

  function applyIfStored() {
    try {
      var key = typeof THEME_KEY !== "undefined" ? THEME_KEY : "tchilo_theme";
      var t = localStorage.getItem(key);
      if (t === CODE) {
        document.documentElement.setAttribute("data-theme", CODE);
        var frame = document.getElementById("appFrame");
        if (frame) frame.setAttribute("data-theme", CODE);
        var label = document.getElementById("currentThemeLabel");
        if (label) label.textContent = LABEL;
      }
    } catch (e) {}
    syncCheck();
  }

  function boot() {
    ensureCSS();
    patchThemeLabels();
    patchSetAppTheme();
    patchGetAppTheme();
    patchApplyThemeUI();
    injectSettingsItem();
    applyIfStored();
  }

  setInterval(function () {
    injectSettingsItem();
    patchSetAppTheme();
    patchGetAppTheme();
    syncCheck();
  }, 1500);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
