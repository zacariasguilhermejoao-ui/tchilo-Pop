/**
 * tchilo-Pop — Tema Halloween (assustador)
 * Preto, laranja-abóbora, roxo veneno, verde tóxico.
 */
(function () {
  "use strict";

  var CODE = "halloween";
  var LABEL = "Halloween";
  var THEME_STORAGE = "tchilo_theme";

  function ensureFont() {
    if (document.getElementById("tchiloHalloweenFont")) return;
    var l = document.createElement("link");
    l.id = "tchiloHalloweenFont";
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Inter:wght@500;600;700;800&display=swap";
    document.head.appendChild(l);
  }

  function ensureCSS() {
    var st = document.getElementById("tchiloThemeHalloweenCSS");
    if (!st) {
      st = document.createElement("style");
      st.id = "tchiloThemeHalloweenCSS";
      document.head.appendChild(st);
    }
    st.textContent =
      '[data-theme="halloween"]{' +
      '--ink:#F5E6C8;' +
      '--paper:#12080E;' +
      '--mint:#39FF14;' +
      '--pink:#FF6B00;' +
      '--yellow:#FFB300;' +
      '--violet:#9B30FF;' +
      '--line:#FF6B00;' +
      '--muted:#A89080;' +
      '--hw-black:#0A0508;' +
      '--hw-blood:#8B0000;' +
      '--hw-pumpkin:#FF6B00;' +
      '--hw-poison:#39FF14;' +
      '--hw-purple:#5B1A8C;' +
      '--hw-fog:#1A0F18;' +
      '}' +

      '[data-theme="halloween"] body{background:#000!important;}' +

      '[data-theme="halloween"] #appFrame,' +
      '[data-theme="halloween"].frame{' +
      'background-color:var(--paper)!important;' +
      'background-image:' +
      'radial-gradient(ellipse at 50% -10%, rgba(255,107,0,.22), transparent 45%),' +
      'radial-gradient(ellipse at 100% 80%, rgba(155,48,255,.18), transparent 40%),' +
      'radial-gradient(ellipse at 0% 100%, rgba(139,0,0,.25), transparent 40%),' +
      'repeating-linear-gradient(180deg,transparent,transparent 4px,rgba(0,0,0,.15) 4px,rgba(0,0,0,.15) 5px)!important;' +
      'color:var(--ink)!important;' +
      'font-family:Inter,system-ui,sans-serif!important;' +
      '}' +

      /* títulos assustadores */
      '[data-theme="halloween"] h1,' +
      '[data-theme="halloween"] .screen-header h1,' +
      '[data-theme="halloween"] .topbar b,' +
      '[data-theme="halloween"] #chatName{' +
      'font-family:Creepster,cursive!important;' +
      'letter-spacing:.06em!important;' +
      'color:#FF6B00!important;' +
      'text-shadow:0 0 12px rgba(255,107,0,.45), 2px 2px 0 #000!important;' +
      '}' +

      /* chrome */
      '[data-theme="halloween"] .topbar,' +
      '[data-theme="halloween"] .screen-header,' +
      '[data-theme="halloween"] .chat-header,' +
      '[data-theme="halloween"] .bottom-nav,' +
      '[data-theme="halloween"] #bottomNav{' +
      'background:linear-gradient(180deg,#1A0A12,#0A0508)!important;' +
      'border-color:#FF6B00!important;' +
      '}' +
      '[data-theme="halloween"] .topbar,' +
      '[data-theme="halloween"] .screen-header,' +
      '[data-theme="halloween"] .chat-header{' +
      'border-bottom:2px solid #FF6B00!important;' +
      'box-shadow:0 4px 20px rgba(255,107,0,.2)!important;' +
      '}' +
      '[data-theme="halloween"] .bottom-nav,' +
      '[data-theme="halloween"] #bottomNav{' +
      'border-top:2px solid #FF6B00!important;' +
      'box-shadow:0 -4px 24px rgba(155,48,255,.25)!important;' +
      '}' +

      /* ícones — brilho laranja / veneno */
      '[data-theme="halloween"] .bottom-nav svg,' +
      '[data-theme="halloween"] .topbar svg,' +
      '[data-theme="halloween"] .screen-header svg,' +
      '[data-theme="halloween"] .back-btn svg,' +
      '[data-theme="halloween"] .act svg,' +
      '[data-theme="halloween"] .si-icon svg,' +
      '[data-theme="halloween"] button svg{' +
      'stroke:#FFB300!important;' +
      'filter:drop-shadow(0 0 4px rgba(255,107,0,.55))!important;' +
      'stroke-width:2.4!important;' +
      '}' +
      '[data-theme="halloween"] .bottom-nav button.active svg,' +
      '[data-theme="halloween"] .nav-item.active svg{' +
      'stroke:#39FF14!important;' +
      'filter:drop-shadow(0 0 8px rgba(57,255,20,.7))!important;' +
      '}' +
      '[data-theme="halloween"] .act.liked svg{' +
      'stroke:#FF2A2A!important;' +
      'fill:#FF2A2A!important;' +
      'filter:drop-shadow(0 0 6px rgba(255,42,42,.7))!important;' +
      '}' +

      /* botão criar */
      '[data-theme="halloween"] .nav-create,' +
      '[data-theme="halloween"] button.nav-create{' +
      'background:linear-gradient(145deg,#FF6B00,#8B0000)!important;' +
      'color:#fff!important;' +
      'border:2px solid #FFB300!important;' +
      'border-radius:14px!important;' +
      'box-shadow:0 0 16px rgba(255,107,0,.55), 3px 3px 0 #000!important;' +
      '}' +
      '[data-theme="halloween"] .nav-create svg{' +
      'stroke:#fff!important;' +
      'filter:none!important;' +
      '}' +

      /* posts */
      '[data-theme="halloween"] .post{' +
      'background:linear-gradient(165deg,#1A0F18,#0D060C)!important;' +
      'border:2px solid #FF6B00!important;' +
      'border-radius:16px!important;' +
      'box-shadow:0 0 0 1px #5B1A8C, 0 8px 24px rgba(0,0,0,.55)!important;' +
      'margin-bottom:14px!important;' +
      '}' +
      '[data-theme="halloween"] .post-head,' +
      '[data-theme="halloween"] .post-actions{' +
      'border-color:rgba(255,107,0,.25)!important;' +
      '}' +
      '[data-theme="halloween"] .post-boost-btn{' +
      'background:#FF6B00!important;' +
      'color:#0A0508!important;' +
      'border:2px solid #FFB300!important;' +
      'box-shadow:0 0 10px rgba(255,107,0,.5)!important;' +
      'font-weight:900!important;' +
      'text-transform:uppercase;' +
      '}' +
      '[data-theme="halloween"] .post-follow,' +
      '[data-theme="halloween"] .follow-btn{' +
      'background:#5B1A8C!important;' +
      'color:#F5E6C8!important;' +
      'border:2px solid #9B30FF!important;' +
      'box-shadow:0 0 10px rgba(155,48,255,.4)!important;' +
      '}' +
      '[data-theme="halloween"] .follow-btn.following{' +
      'background:#1A0F18!important;' +
      'color:#FF6B00!important;' +
      '}' +

      /* settings */
      '[data-theme="halloween"] .settings-item,' +
      '[data-theme="halloween"] .msg-item,' +
      '[data-theme="halloween"] .share-opt{' +
      'background:rgba(18,8,14,.92)!important;' +
      'border-bottom:1px solid rgba(255,107,0,.2)!important;' +
      'color:#F5E6C8!important;' +
      '}' +
      '[data-theme="halloween"] .si-icon{' +
      'border:2px solid #FF6B00!important;' +
      'box-shadow:0 0 10px rgba(255,107,0,.35)!important;' +
      'background:#1A0A12!important;' +
      '}' +

      /* inputs */
      '[data-theme="halloween"] input,' +
      '[data-theme="halloween"] textarea,' +
      '[data-theme="halloween"] select{' +
      'background:#1A0A12!important;' +
      'border:2px solid #FF6B00!important;' +
      'color:#F5E6C8!important;' +
      'border-radius:12px!important;' +
      'box-shadow:inset 0 0 12px rgba(0,0,0,.5)!important;' +
      '}' +
      '[data-theme="halloween"] input::placeholder,' +
      '[data-theme="halloween"] textarea::placeholder{' +
      'color:#A89080!important;' +
      '}' +

      /* botões */
      '[data-theme="halloween"] .profile-btn,' +
      '[data-theme="halloween"] .ads-pay,' +
      '[data-theme="halloween"] .af-pay,' +
      '[data-theme="halloween"] .sc-btn.primary{' +
      'background:linear-gradient(145deg,#FF6B00,#8B0000)!important;' +
      'color:#fff!important;' +
      'border:2px solid #FFB300!important;' +
      'box-shadow:0 0 14px rgba(255,107,0,.45), 3px 3px 0 #000!important;' +
      'text-transform:uppercase;' +
      'font-weight:900!important;' +
      '}' +

      /* chat */
      '[data-theme="halloween"] .bubble.me{' +
      'background:linear-gradient(145deg,#5B1A8C,#2A0A40)!important;' +
      'color:#F5E6C8!important;' +
      'border:2px solid #9B30FF!important;' +
      'box-shadow:0 0 12px rgba(155,48,255,.35)!important;' +
      '}' +
      '[data-theme="halloween"] .bubble.them{' +
      'background:#1A0A12!important;' +
      'color:#F5E6C8!important;' +
      'border:2px solid #FF6B00!important;' +
      '}' +
      '[data-theme="halloween"] .chat-input-bar{' +
      'background:#0A0508!important;' +
      'border-top:2px solid #FF6B00!important;' +
      '}' +
      '[data-theme="halloween"] .chat-send,' +
      '[data-theme="halloween"] .chat-attach-btn,' +
      '[data-theme="halloween"] .sg-trigger,' +
      '[data-theme="halloween"] .sc-create-trigger{' +
      'background:#FF6B00!important;' +
      'border:2px solid #FFB300!important;' +
      'box-shadow:0 0 10px rgba(255,107,0,.4)!important;' +
      '}' +
      '[data-theme="halloween"] .chat-send svg,' +
      '[data-theme="halloween"] .chat-attach-btn svg,' +
      '[data-theme="halloween"] .sg-trigger svg{' +
      'stroke:#0A0508!important;' +
      'filter:none!important;' +
      '}' +

      /* stories */
      '[data-theme="halloween"] .story-card{' +
      'border:2px solid #FF6B00!important;' +
      'box-shadow:0 0 16px rgba(255,107,0,.35)!important;' +
      'border-radius:14px!important;' +
      '}' +
      '[data-theme="halloween"] .story-card.unseen{' +
      'outline:2px solid #39FF14;' +
      'outline-offset:3px;' +
      'box-shadow:0 0 18px rgba(57,255,20,.35)!important;' +
      '}' +
      '[data-theme="halloween"] .story-card-create-inner,' +
      '[data-theme="halloween"] .story-card-plus{' +
      'background:#FF6B00!important;' +
      'border-color:#FFB300!important;' +
      'color:#0A0508!important;' +
      '}' +

      /* sheets */
      '[data-theme="halloween"] #tchiloSGSheet,' +
      '[data-theme="halloween"] #commentSheet,' +
      '[data-theme="halloween"] #postMenuSheet,' +
      '[data-theme="halloween"] .sheet{' +
      'background:#12080E!important;' +
      'border-color:#FF6B00!important;' +
      'color:#F5E6C8!important;' +
      'box-shadow:0 -8px 32px rgba(155,48,255,.25)!important;' +
      '}' +
      '[data-theme="halloween"] .sg-tab{' +
      'background:#1A0A12!important;' +
      'border:2px solid #FF6B00!important;' +
      'color:#F5E6C8!important;' +
      '}' +
      '[data-theme="halloween"] .sg-tab.on{' +
      'background:#FF6B00!important;' +
      'color:#0A0508!important;' +
      '}' +
      '[data-theme="halloween"] .sg-item{' +
      'background:#1A0A12!important;' +
      'border:2px solid #5B1A8C!important;' +
      '}' +

      /* avatares */
      '[data-theme="halloween"] .avatar,' +
      '[data-theme="halloween"] .story-card-avatar{' +
      'border:2px solid #FF6B00!important;' +
      'box-shadow:0 0 10px rgba(255,107,0,.4)!important;' +
      '}' +

      /* tags */
      '[data-theme="halloween"] .tag{' +
      'background:#5B1A8C!important;' +
      'color:#39FF14!important;' +
      'border:1px solid #9B30FF!important;' +
      'box-shadow:0 0 8px rgba(57,255,20,.25);' +
      '}' +

      /* logo */
      '[data-theme="halloween"] .topbar img,' +
      '[data-theme="halloween"] .brand-logo{' +
      'filter:hue-rotate(-15deg) saturate(1.4) brightness(1.05) drop-shadow(0 0 6px rgba(255,107,0,.5))!important;' +
      '}' +

      /* texto muted */
      '[data-theme="halloween"] .who span,' +
      '[data-theme="halloween"] .muted,' +
      '[data-theme="halloween"] [style*="var(--muted)"]{' +
      'color:#A89080!important;' +
      '}';
  }

  function storageKey() {
    try {
      if (typeof THEME_KEY !== "undefined" && THEME_KEY) return THEME_KEY;
    } catch (e) {}
    return THEME_STORAGE;
  }

  function syncAllChecks(active) {
    ["classic", "dark", "yellow", "violet", "red", "retro", CODE].forEach(function (code) {
      var el = document.getElementById("theme-check-" + code);
      if (el) el.textContent = active === code ? "✓" : "";
    });
  }

  function clearOtherThemeAttrs() {
    /* body data-theme só para halloween/retro extras */
  }

  function applyHalloween() {
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
    if (document.getElementById("theme-check-halloween")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "settings-item";
    btn.setAttribute("data-theme-opt", CODE);
    btn.onclick = function () {
      applyHalloween();
      try {
        if (typeof showToast === "function") showToast("Tema Halloween");
      } catch (e) {}
    };
    btn.innerHTML =
      '<div class="theme-swatch" style="background:linear-gradient(135deg,#12080E 30%,#FF6B00 30% 60%,#5B1A8C 60%);border:2px solid #FFB300"></div>' +
      "<span>" +
      LABEL +
      "</span>" +
      '<span id="theme-check-halloween" class="theme-check"></span>';
    list.appendChild(btn);

    var cur = "classic";
    try {
      cur = localStorage.getItem(storageKey()) || "classic";
    } catch (e2) {}
    syncAllChecks(cur);
  }

  function patchSetAppTheme() {
    if (typeof window.setAppTheme !== "function") return false;
    if (window.setAppTheme.__halloween) return true;
    var orig = window.setAppTheme;
    window.setAppTheme = function (theme) {
      if (theme === CODE) {
        applyHalloween();
        return;
      }
      if (theme !== "retro") {
        try {
          document.body.removeAttribute("data-theme");
        } catch (e) {}
      }
      var r = orig.apply(this, arguments);
      var el = document.getElementById("theme-check-halloween");
      if (el) el.textContent = "";
      return r;
    };
    window.setAppTheme.__halloween = true;
    return true;
  }

  function patchGetAppTheme() {
    if (typeof window.getAppTheme !== "function") return false;
    if (window.getAppTheme.__halloween) return true;
    var orig = window.getAppTheme;
    window.getAppTheme = function () {
      try {
        if (localStorage.getItem(storageKey()) === CODE) return CODE;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.getAppTheme.__halloween = true;
    return true;
  }

  function patchLabels() {
    try {
      if (window.THEME_LABELS) window.THEME_LABELS[CODE] = LABEL;
    } catch (e) {}
  }

  function applyIfStored() {
    try {
      if (localStorage.getItem(storageKey()) === CODE) applyHalloween();
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
