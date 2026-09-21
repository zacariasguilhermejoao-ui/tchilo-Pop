/**
 * tchilo-Pop — Tema Retro TOTAL
 * Tudo vintage: cores, tipografia, ícones, botões, barras, posts, chat.
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
    var st = document.getElementById("tchiloThemeRetroCSS");
    if (!st) {
      st = document.createElement("style");
      st.id = "tchiloThemeRetroCSS";
      document.head.appendChild(st);
    }
    st.textContent =
      '[data-theme="retro"]{' +
      '--ink:#2C1810;' +
      '--paper:#E8D4A8;' +
      '--mint:#1A6B5C;' +
      '--pink:#B8432A;' +
      '--yellow:#C9920F;' +
      '--violet:#5C3A28;' +
      '--line:#2C1810;' +
      '--muted:#6A4E3C;' +
      '--retro-cream:#F3E4BC;' +
      '--retro-orange:#B8432A;' +
      '--retro-teal:#1A6B5C;' +
      '--retro-gold:#C9920F;' +
      '--retro-shadow:#2C1810;' +
      '}' +

      '[data-theme="retro"] body{background:#1a100c!important;}' +

      '[data-theme="retro"] #appFrame,' +
      '[data-theme="retro"].frame{' +
      'background-color:var(--paper)!important;' +
      'background-image:' +
      'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(44,24,16,.045) 3px,rgba(44,24,16,.045) 4px),' +
      'radial-gradient(ellipse at 12% 0%,rgba(201,146,15,.32),transparent 52%),' +
      'radial-gradient(ellipse at 100% 100%,rgba(26,107,92,.22),transparent 48%)!important;' +
      'color:var(--ink)!important;' +
      'font-family:"IBM Plex Mono","Special Elite",ui-monospace,monospace!important;' +
      '}' +

      /* tipografia */
      '[data-theme="retro"] h1,' +
      '[data-theme="retro"] .screen-header h1,' +
      '[data-theme="retro"] .topbar .logo,' +
      '[data-theme="retro"] .topbar b,' +
      '[data-theme="retro"] #chatName{' +
      'font-family:"Special Elite",serif!important;' +
      'letter-spacing:.05em!important;' +
      'text-transform:uppercase;' +
      '}' +

      /* chrome */
      '[data-theme="retro"] .topbar,' +
      '[data-theme="retro"] .screen-header,' +
      '[data-theme="retro"] .chat-header,' +
      '[data-theme="retro"] .bottom-nav,' +
      '[data-theme="retro"] #bottomNav,' +
      '[data-theme="retro"] nav.bottom{' +
      'background:var(--retro-cream)!important;' +
      'border-color:var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .topbar,' +
      '[data-theme="retro"] .screen-header,' +
      '[data-theme="retro"] .chat-header{' +
      'border-bottom:3px solid var(--ink)!important;' +
      'box-shadow:0 4px 0 rgba(44,24,16,.12)!important;' +
      '}' +
      '[data-theme="retro"] .bottom-nav,' +
      '[data-theme="retro"] #bottomNav{' +
      'border-top:3px solid var(--ink)!important;' +
      'box-shadow:0 -4px 0 rgba(44,24,16,.12)!important;' +
      '}' +

      /* ÍCONES — filtro vintage forte + traço grosso */
      '[data-theme="retro"] svg{' +
      'stroke-width:2.75!important;' +
      '}' +
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
      '[data-theme="retro"] .settings-item svg,' +
      '[data-theme="retro"] button svg{' +
      'filter:sepia(.7) saturate(1.25) hue-rotate(-12deg) contrast(1.12) brightness(.95)!important;' +
      'stroke:var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .bottom-nav button.active svg,' +
      '[data-theme="retro"] .bottom-nav .active svg,' +
      '[data-theme="retro"] .nav-item.active svg{' +
      'filter:sepia(.3) saturate(1.4) hue-rotate(-5deg)!important;' +
      'stroke:var(--retro-orange)!important;' +
      'color:var(--retro-orange)!important;' +
      '}' +
      '[data-theme="retro"] .act.liked svg{' +
      'filter:none!important;' +
      'stroke:var(--retro-orange)!important;' +
      'fill:var(--retro-orange)!important;' +
      '}' +

      /* botão + estilo placa de metal */
      '[data-theme="retro"] .nav-create,' +
      '[data-theme="retro"] .bottom-nav .create,' +
      '[data-theme="retro"] button.nav-create{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:3px solid var(--ink)!important;' +
      'border-radius:10px!important;' +
      'box-shadow:3px 3px 0 var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .nav-create svg{' +
      'filter:none!important;' +
      'stroke:var(--ink)!important;' +
      '}' +

      /* posts como cartões de papel */
      '[data-theme="retro"] .post{' +
      'background:var(--retro-cream)!important;' +
      'border:3px solid var(--ink)!important;' +
      'border-radius:12px!important;' +
      'box-shadow:5px 5px 0 var(--ink)!important;' +
      'margin-bottom:16px!important;' +
      '}' +
      '[data-theme="retro"] .post-head{' +
      'border-bottom:2px dashed rgba(44,24,16,.2)!important;' +
      '}' +
      '[data-theme="retro"] .post-actions{' +
      'border-top:2px dashed rgba(44,24,16,.18)!important;' +
      '}' +
      '[data-theme="retro"] .post-boost-btn{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'font-family:"Special Elite",serif!important;' +
      'text-transform:uppercase!important;' +
      'letter-spacing:.06em!important;' +
      '}' +
      '[data-theme="retro"] .post-follow,' +
      '[data-theme="retro"] .follow-btn{' +
      'background:var(--retro-teal)!important;' +
      'color:var(--retro-cream)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'border-radius:8px!important;' +
      'font-family:"IBM Plex Mono",monospace!important;' +
      'text-transform:uppercase;' +
      'font-size:11px!important;' +
      '}' +
      '[data-theme="retro"] .follow-btn.following,' +
      '[data-theme="retro"] .post-follow.following{' +
      'background:var(--retro-cream)!important;' +
      'color:var(--ink)!important;' +
      '}' +

      /* settings */
      '[data-theme="retro"] .settings-item,' +
      '[data-theme="retro"] .msg-item,' +
      '[data-theme="retro"] .share-opt{' +
      'background:var(--retro-cream)!important;' +
      'border-bottom:2px solid rgba(44,24,16,.14)!important;' +
      'font-family:"IBM Plex Mono",monospace!important;' +
      '}' +
      '[data-theme="retro"] .si-icon{' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'border-radius:8px!important;' +
      'filter:sepia(.45) saturate(1.15)!important;' +
      '}' +
      '[data-theme="retro"] .theme-swatch{' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      '}' +

      /* inputs */
      '[data-theme="retro"] input,' +
      '[data-theme="retro"] textarea,' +
      '[data-theme="retro"] select{' +
      'background:#F8EDD4!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'border-radius:8px!important;' +
      'box-shadow:inset 2px 2px 0 rgba(44,24,16,.1)!important;' +
      'font-family:"IBM Plex Mono",monospace!important;' +
      'color:var(--ink)!important;' +
      '}' +

      /* botões de ação */
      '[data-theme="retro"] .profile-btn,' +
      '[data-theme="retro"] button.profile-btn,' +
      '[data-theme="retro"] .ads-pay,' +
      '[data-theme="retro"] .af-pay,' +
      '[data-theme="retro"] .sc-btn.primary{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:3px 3px 0 var(--ink)!important;' +
      'border-radius:10px!important;' +
      'font-family:"Special Elite",serif!important;' +
      'text-transform:uppercase!important;' +
      'letter-spacing:.04em!important;' +
      '}' +

      /* chat */
      '[data-theme="retro"] .bubble{' +
      'border:2.5px solid var(--ink)!important;' +
      'border-radius:12px!important;' +
      'font-family:"IBM Plex Mono",monospace!important;' +
      '}' +
      '[data-theme="retro"] .bubble.me{' +
      'background:var(--retro-teal)!important;' +
      'color:var(--retro-cream)!important;' +
      'box-shadow:3px 3px 0 var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .bubble.them{' +
      'background:var(--retro-cream)!important;' +
      'box-shadow:3px 3px 0 rgba(44,24,16,.2)!important;' +
      '}' +
      '[data-theme="retro"] .chat-input-bar{' +
      'background:var(--retro-cream)!important;' +
      'border-top:3px solid var(--ink)!important;' +
      '}' +
      '[data-theme="retro"] .chat-send,' +
      '[data-theme="retro"] .chat-attach-btn,' +
      '[data-theme="retro"] .sg-trigger,' +
      '[data-theme="retro"] .sc-create-trigger{' +
      'background:var(--retro-gold)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'border-radius:10px!important;' +
      '}' +
      '[data-theme="retro"] .chat-send svg,' +
      '[data-theme="retro"] .chat-attach-btn svg,' +
      '[data-theme="retro"] .sg-trigger svg,' +
      '[data-theme="retro"] .sc-create-trigger svg{' +
      'filter:none!important;' +
      'stroke:var(--ink)!important;' +
      '}' +

      /* stories */
      '[data-theme="retro"] .story-card{' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:4px 4px 0 var(--ink)!important;' +
      'border-radius:12px!important;' +
      '}' +
      '[data-theme="retro"] .story-card.unseen{' +
      'outline:3px solid var(--retro-orange);' +
      'outline-offset:3px;' +
      '}' +
      '[data-theme="retro"] .story-card-create-inner,' +
      '[data-theme="retro"] .story-card-plus{' +
      'background:var(--retro-gold)!important;' +
      'border:2.5px solid var(--ink)!important;' +
      'color:var(--ink)!important;' +
      '}' +

      /* sheets */
      '[data-theme="retro"] #tchiloSGSheet,' +
      '[data-theme="retro"] #commentSheet,' +
      '[data-theme="retro"] #postMenuSheet,' +
      '[data-theme="retro"] .sheet,' +
      '[data-theme="retro"] .comment-sheet{' +
      'background:var(--retro-cream)!important;' +
      'border-color:var(--ink)!important;' +
      'box-shadow:0 -6px 0 rgba(44,24,16,.15)!important;' +
      '}' +
      '[data-theme="retro"] .sg-tab{' +
      'border:2.5px solid var(--ink)!important;' +
      'font-family:"IBM Plex Mono",monospace!important;' +
      'background:#F8EDD4!important;' +
      '}' +
      '[data-theme="retro"] .sg-tab.on{' +
      'background:var(--retro-gold)!important;' +
      '}' +
      '[data-theme="retro"] .sg-item{' +
      'border:2.5px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'background:#F8EDD4!important;' +
      '}' +

      /* avatares */
      '[data-theme="retro"] .avatar,' +
      '[data-theme="retro"] .story-card-avatar{' +
      'border:3px solid var(--ink)!important;' +
      'box-shadow:2px 2px 0 var(--ink)!important;' +
      'border-radius:10px!important;' +
      'filter:sepia(.2) contrast(1.05);' +
      '}' +

      /* tags */
      '[data-theme="retro"] .tag{' +
      'background:var(--retro-gold)!important;' +
      'color:var(--ink)!important;' +
      'border:2px solid var(--ink)!important;' +
      'font-family:"IBM Plex Mono",monospace!important;' +
      'box-shadow:1px 1px 0 var(--ink);' +
      '}' +

      /* logo / imagens de marca */
      '[data-theme="retro"] .topbar img,' +
      '[data-theme="retro"] .brand-logo{' +
      'filter:sepia(.4) saturate(1.1) contrast(1.05)!important;' +
      '}';
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
      '<div class="theme-swatch" style="background:linear-gradient(135deg,#E8D4A8 35%,#B8432A 35% 65%,#1A6B5C 65%)"></div>' +
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
    if (window.setAppTheme.__retro4) return true;
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
    window.setAppTheme.__retro4 = true;
    return true;
  }

  function patchGetAppTheme() {
    if (typeof window.getAppTheme !== "function") return false;
    if (window.getAppTheme.__retro4) return true;
    var orig = window.getAppTheme;
    window.getAppTheme = function () {
      try {
        if (localStorage.getItem(storageKey()) === CODE) return CODE;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.getAppTheme.__retro4 = true;
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
