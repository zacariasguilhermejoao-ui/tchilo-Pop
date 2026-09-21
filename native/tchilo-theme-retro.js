/**
 * tchilo-Pop — Tema Retro (completo)
 * Cores, ícones, botões, barras e tipografia com estética vintage.
 */
(function () {
  "use strict";

  var CODE = "retro";
  var LABEL = "Retro";
  var THEME_STORAGE = "tchilo_theme";

  function ensureFont() {
    if (document.getElementById("tchiloRetroFont")) return;
    var l = document.createElement("link");
    l.id = "tchiloRetroFont";
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@500;600;700&display=swap";
    document.head.appendChild(l);
  }

  function ensureCSS() {
    if (document.getElementById("tchiloThemeRetroCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloThemeRetroCSS";
    st.textContent =
      /* ---- tokens ---- */
      '[data-theme="retro"]{' +
      '--ink:#2C2118;' +
      '--paper:#EBD9B0;' +
      '--mint:#1F7A6A;' +
      '--pink:#C44B2F;' +
      '--yellow:#D4A017;' +
      '--violet:#6B4C3B;' +
      '--line:#2C2118;' +
      '--muted:#6E5748;' +
      '--retro-cream:#F4E6C3;' +
      '--retro-orange:#C44B2F;' +
      '--retro-teal:#1F7A6A;' +
      '--retro-gold:#D4A017;' +
      '--retro-shadow:rgba(44,33,24,.22);' +
      '}' +

      /* ---- fundo global ---- */
      '[data-theme="retro"] body{' +
      'background:#2C2118!important;' +
      '}' +
      '[data-theme="retro"] #appFrame,' +
      '[data-theme="retro"].frame{' +
      'background-color:var(--paper)!important;' +
      'background-image:' +
      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(44,33,24,.03) 2px, rgba(44,33,24,.03) 3px),' +
      'radial-gradient(ellipse at 15% 0%, rgba(212,160,23,.28), transparent 50%),' +
      'radial-gradient(ellipse at 100% 100%, rgba(31,122,106,.2), transparent 45%)!important;' +
      'color:var(--ink)!important;' +
      'font-family:"IBM Plex Mono", "Special Elite", Inter, system-ui, monospace!important;' +
      '}' +

      /* títulos com carácter */
      '[data-theme="retro"] h1,' +
      '[data-theme="retro"] .topbar .logo,' +
      '[data-theme="retro"] .screen-header h1{' +
      'font-family:"Special Elite", "IBM Plex Mono", serif!important;' +
      'letter-spacing:.04em;' +
      'font-weight:700!important;' +
      '}' +

      /* ---- chrome: topbar / nav / headers ---- */
      '[data-theme="retro"] .topbar,' +
      '[data-theme="retro"] .screen-header,' +
      '[data-theme="retro"] .bottom-nav,' +
      '[data-theme="retro"] .chat-header{' +
      'background:var(--retro-cream)!important;' +
      'border-color:var(--ink)!important;' +
      'border-width:3px!important;' +
      'box-shadow:inset 0 -2px 0 rgba(44,33,24,.08);' +
      '}' +
      '[data-theme="retro"] .bottom-nav{' +
      'border-top:3px solid var(--ink)!important;' +
      'box-shadow:0 -4px 0 var(--retro-shadow);' +
      '}' +

      /* ---- ícones: traço grosso + filtro sépia/vintage ---- */
      '[data-theme="retro"] .bottom-nav svg,' +
      '[data-theme="retro"] .topbar svg,' +
      '[data-theme="retro"] .screen-header svg,' +
      '[data-theme="retro"] .back-btn svg,' +
      '[data-theme="retro"] .act svg,' +
      '[data-theme="retro"] .si-icon svg,' +
      '[data-theme="retro"] .chat-send svg,' +
      '[data-theme="retro"] .chat-attach-btn svg,' +
      '[data-theme="retro"] .sg-trigger svg,' +
      '[data-theme="retro"] .sc-create-trigger svg,' +
      '[data-theme="retro"] .post-menu-btn,' +
      '[data-theme="retro"] button svg{' +
      'stroke-width:2.6!important;' +
      'filter:sepia(.55) saturate(1.15) hue-rotate(-8deg) contrast(1.05);' +
      '}' +
      '[data-theme="retro"] .bottom-nav button.active svg,' +
      '[data-theme="retro"] .bottom-nav .active svg{' +
      'filter:none;' +
      'color:var(--retro-orange)!important;' +
      'stroke:var(--retro-orange)!important;' +
      '}' +

      /* botão criar (+) estilo placa */
      '[data-theme="retro"] .nav-create,' +
      '[data-theme="retro"] .bottom-nav .create,' +
      '[data-theme="retro"] button.nav-create{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:3px solid var(--ink)!important;' +
      'border-radius:12px!important;' +
      'box-shadow:3px 3px 0 var(--ink)!important;' +
      'filter:none!important;' +
      '}' +

      /* ---- posts ---- */
      '[data-theme="retro"] .post{' +
      'background:var(--retro-cream)!important;' +
      'border:3px solid var(--ink)!important;' +
      'border-radius:14px!important;' +
      'box-shadow:4px 4px 0 var(--retro-shadow)!important;' +
      'margin-bottom:14px;' +
      '}' +
      '[data-theme="retro"] .post-head,' +
      '[data-theme="retro"] .post-actions{' +
      'border-color:rgba(44,33,24,.15)!important;' +
      '}' +
      '[data-theme="retro"] .post-boost-btn{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'font-family:"Special Elite", monospace!important;' +
      'text-transform:uppercase;' +
      'letter-spacing:.04em;' +
      '}' +
      '[data-theme="retro"] .post-follow,' +
      '[data-theme="retro"] .follow-btn{' +
      'background:var(--retro-teal)!important;' +
      'color:var(--retro-cream)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'border-radius:10px!important;' +
      'font-family:"IBM Plex Mono", monospace!important;' +
      '}' +

      /* ---- settings / listas ---- */
      '[data-theme="retro"] .settings-item,' +
      '[data-theme="retro"] .msg-item,' +
      '[data-theme="retro"] .share-opt{' +
      'background:var(--retro-cream)!important;' +
      'border-bottom:2px solid rgba(44,33,24,.12)!important;' +
      '}' +
      '[data-theme="retro"] .si-icon{' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--retro-shadow)!important;' +
      'border-radius:10px!important;' +
      'filter:sepia(.35) saturate(1.1);' +
      '}' +
      '[data-theme="retro"] .theme-swatch{' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--retro-shadow);' +
      '}' +

      /* ---- inputs / botões ---- */
      '[data-theme="retro"] input,' +
      '[data-theme="retro"] textarea,' +
      '[data-theme="retro"] select{' +
      'background:#F8EFDA!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'border-radius:10px!important;' +
      'box-shadow:inset 2px 2px 0 rgba(44,33,24,.08)!important;' +
      'font-family:"IBM Plex Mono", monospace!important;' +
      'color:var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] button.profile-btn,' +
      '[data-theme="retro"] .profile-btn,' +
      '[data-theme="retro"] .ads-pay,' +
      '[data-theme="retro"] .af-pay,' +
      '[data-theme="retro"] .sc-btn.primary{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:3px 3px 0 var(--ink)!important;' +
      'border-radius:12px!important;' +
      'font-family:"Special Elite", monospace!important;' +
      'text-transform:uppercase;' +
      'letter-spacing:.03em;' +
      '}' +

      /* ---- chat ---- */
      '[data-theme="retro"] .bubble.me{' +
      'background:var(--retro-teal)!important;' +
      'color:var(--retro-cream)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .bubble.them{' +
      'background:var(--retro-cream)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--retro-shadow)!important;' +
      '}' +
      '[data-theme="retro"] .chat-input-bar{' +
      'background:var(--retro-cream)!important;' +
      'border-top:3px solid var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .chat-send,' +
      '[data-theme="retro"] .chat-attach-btn,' +
      '[data-theme="retro"] .sg-trigger,' +
      '[data-theme="retro"] .sc-create-trigger{' +
      'border:2.5px solid var(--ink)!important;' +
      'background:var(--retro-gold)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      '}' +

      /* ---- stories ---- */
      '[data-theme="retro"] .story-card{' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:3px 3px 0 var(--retro-shadow)!important;' +
      'border-radius:14px!important;' +
      '}' +
      '[data-theme="retro"] .story-card-create-inner{' +
      'background:var(--retro-gold)!important;' +
      'border-color:var(--ink)!important;' +
      '}' +

      /* ---- sheets / modais ---- */
      '[data-theme="retro"] #tchiloSGSheet,' +
      '[data-theme="retro"] .comment-sheet,' +
      '[data-theme="retro"] #postMenuSheet,' +
      '[data-theme="retro"] .sheet{' +
      'background:var(--retro-cream)!important;' +
      'border-color:var(--ink)!important;' +
      'box-shadow:0 -6px 0 var(--retro-shadow)!important;' +
      '}' +
      '[data-theme="retro"] .sg-tab.on,' +
      '[data-theme="retro"] .sg-tab{' +
      'border:2.5px solid var(--ink)!important;' +
      'font-family:"IBM Plex Mono", monospace!important;' +
      '}' +
      '[data-theme="retro"] .sg-tab.on{' +
      'background:var(--retro-gold)!important;' +
      '}' +

      /* avatares com anel grosso */
      '[data-theme="retro"] .avatar,' +
      '[data-theme="retro"] .story-card-avatar{' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--retro-shadow)!important;' +
      '}' +

      /* tags */
      '[data-theme="retro"] .tag{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:2px solid var(--ink)!important;' +
      'font-family:"IBM Plex Mono", monospace!important;' +
      '}';
    document.head.appendChild(st);
  }

  function storageKey() {
    try {
      if (typeof THEME_KEY !== "undefined" && THEME_KEY) return THEME_KEY;
    } catch (e) {}
    return THEME_STORAGE;
  }

  function syncAllChecks(active) {
    ["classic", "dark", "yellow", "violet", "red", CODE].forEach(function (code) {
      var el = document.getElementById("theme-check-" + code);
      if (el) el.textContent = active === code ? "✓" : "";
    });
  }

  function applyRetro() {
    ensureFont();
    ensureCSS();
    try {
      localStorage.setItem(storageKey(), CODE);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", CODE);
    document.body.setAttribute("data-theme", CODE);
    var frame = document.getElementById("appFrame");
    if (frame) frame.setAttribute("data-theme", CODE);
    var label = document.getElementById("currentThemeLabel");
    if (label) label.textContent = LABEL;
    syncAllChecks(CODE);
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
      '<div class="theme-swatch" style="background:linear-gradient(135deg,#EBD9B0 35%,#C44B2F 35% 65%,#1F7A6A 65%)"></div>' +
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
    if (window.setAppTheme.__retro3) return true;
    var orig = window.setAppTheme;
    window.setAppTheme = function (theme) {
      if (theme === CODE) {
        applyRetro();
        return;
      }
      document.body.removeAttribute("data-theme");
      var r = orig.apply(this, arguments);
      var el = document.getElementById("theme-check-retro");
      if (el) el.textContent = "";
      return r;
    };
    window.setAppTheme.__retro3 = true;
    return true;
  }

  function patchGetAppTheme() {
    if (typeof window.getAppTheme !== "function") return false;
    if (window.getAppTheme.__retro3) return true;
    var orig = window.getAppTheme;
    window.getAppTheme = function () {
      try {
        if (localStorage.getItem(storageKey()) === CODE) return CODE;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.getAppTheme.__retro3 = true;
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
    ensureFont();
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
