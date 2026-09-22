/**
 * tchilo-Pop — Tema Gótico
 * Preto, vinho, prata, tipografia dramática, chrome ornamentado.
 */
(function () {
  "use strict";

  var CODE = "gothic";
  var LABEL = "Gótico";
  var THEME_STORAGE = "tchilo_theme";

  function ensureFont() {
    if (document.getElementById("tchiloGothicFont")) return;
    var l = document.createElement("link");
    l.id = "tchiloGothicFont";
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Cinzel:wght@600;700;800&family=Inter:wght@500;600;700;800&display=swap";
    document.head.appendChild(l);
  }

  function ensureCSS() {
    var st = document.getElementById("tchiloThemeGothicCSS");
    if (!st) {
      st = document.createElement("style");
      st.id = "tchiloThemeGothicCSS";
      document.head.appendChild(st);
    }
    st.textContent =
      '[data-theme="gothic"]{' +
      '--ink:#E8E0D8;' +
      '--paper:#0C0A0B;' +
      '--mint:#6B8F71;' +
      '--pink:#8B1E3F;' +
      '--yellow:#C9A227;' +
      '--violet:#4A3A5C;' +
      '--line:#C9A227;' +
      '--muted:#8A8078;' +
      '--gt-black:#080608;' +
      '--gt-wine:#6B0F2A;' +
      '--gt-blood:#8B1E3F;' +
      '--gt-gold:#C9A227;' +
      '--gt-silver:#A8A29A;' +
      '--gt-stone:#161214;' +
      '}' +

      '[data-theme="gothic"] body{background:#000!important;}' +

      '[data-theme="gothic"] #appFrame,' +
      '[data-theme="gothic"].frame{' +
      'background-color:var(--paper)!important;' +
      'background-image:' +
      'radial-gradient(ellipse at 50% 0%, rgba(107,15,42,.28), transparent 50%),' +
      'radial-gradient(ellipse at 0% 100%, rgba(201,162,39,.08), transparent 40%),' +
      'linear-gradient(180deg, #0C0A0B 0%, #080608 100%)!important;' +
      'color:var(--ink)!important;' +
      'font-family:Inter,system-ui,sans-serif!important;' +
      '}' +

      /* títulos góticos */
      '[data-theme="gothic"] h1,' +
      '[data-theme="gothic"] .screen-header h1,' +
      '[data-theme="gothic"] .topbar b,' +
      '[data-theme="gothic"] #chatName{' +
      'font-family:Cinzel,"UnifrakturMaguntia",serif!important;' +
      'letter-spacing:.08em!important;' +
      'color:#C9A227!important;' +
      'text-shadow:0 0 10px rgba(201,162,39,.25), 1px 1px 0 #000!important;' +
      'font-weight:700!important;' +
      '}' +

      /* chrome */
      '[data-theme="gothic"] .topbar,' +
      '[data-theme="gothic"] .screen-header,' +
      '[data-theme="gothic"] .chat-header,' +
      '[data-theme="gothic"] .bottom-nav,' +
      '[data-theme="gothic"] #bottomNav{' +
      'background:linear-gradient(180deg,#161214,#0C0A0B)!important;' +
      'border-color:#C9A227!important;' +
      '}' +
      '[data-theme="gothic"] .topbar,' +
      '[data-theme="gothic"] .screen-header,' +
      '[data-theme="gothic"] .chat-header{' +
      'border-bottom:2px solid #C9A227!important;' +
      'box-shadow:0 4px 18px rgba(107,15,42,.35)!important;' +
      '}' +
      '[data-theme="gothic"] .bottom-nav,' +
      '[data-theme="gothic"] #bottomNav{' +
      'border-top:2px solid #C9A227!important;' +
      'box-shadow:0 -4px 20px rgba(0,0,0,.5)!important;' +
      '}' +

      /* ícones — prata / ouro */
      '[data-theme="gothic"] .bottom-nav svg,' +
      '[data-theme="gothic"] .topbar svg,' +
      '[data-theme="gothic"] .screen-header svg,' +
      '[data-theme="gothic"] .back-btn svg,' +
      '[data-theme="gothic"] .act svg,' +
      '[data-theme="gothic"] .si-icon svg,' +
      '[data-theme="gothic"] button svg{' +
      'stroke:#C9A227!important;' +
      'filter:drop-shadow(0 0 3px rgba(201,162,39,.4))!important;' +
      'stroke-width:2.3!important;' +
      '}' +
      '[data-theme="gothic"] .bottom-nav button.active svg,' +
      '[data-theme="gothic"] .nav-item.active svg{' +
      'stroke:#E8E0D8!important;' +
      'filter:drop-shadow(0 0 6px rgba(232,224,216,.5))!important;' +
      '}' +
      '[data-theme="gothic"] .act.liked svg{' +
      'stroke:#8B1E3F!important;' +
      'fill:#8B1E3F!important;' +
      'filter:drop-shadow(0 0 6px rgba(139,30,63,.6))!important;' +
      '}' +

      /* botão criar */
      '[data-theme="gothic"] .nav-create,' +
      '[data-theme="gothic"] button.nav-create{' +
      'background:linear-gradient(145deg,#6B0F2A,#3A0816)!important;' +
      'color:#C9A227!important;' +
      'border:2px solid #C9A227!important;' +
      'border-radius:12px!important;' +
      'box-shadow:0 0 14px rgba(139,30,63,.4), 2px 2px 0 #000!important;' +
      '}' +
      '[data-theme="gothic"] .nav-create svg{' +
      'stroke:#C9A227!important;' +
      'filter:none!important;' +
      '}' +

      /* posts */
      '[data-theme="gothic"] .post{' +
      'background:linear-gradient(165deg,#161214,#0C0A0B)!important;' +
      'border:2px solid #C9A227!important;' +
      'border-radius:12px!important;' +
      'box-shadow:0 0 0 1px #6B0F2A, 0 8px 28px rgba(0,0,0,.55)!important;' +
      'margin-bottom:14px!important;' +
      '}' +
      '[data-theme="gothic"] .post-head,' +
      '[data-theme="gothic"] .post-actions{' +
      'border-color:rgba(201,162,39,.22)!important;' +
      '}' +
      '[data-theme="gothic"] .post-boost-btn{' +
      'background:#6B0F2A!important;' +
      'color:#C9A227!important;' +
      'border:2px solid #C9A227!important;' +
      'box-shadow:0 0 10px rgba(139,30,63,.35)!important;' +
      'font-family:Cinzel,serif!important;' +
      'text-transform:uppercase;' +
      'letter-spacing:.06em;' +
      '}' +
      '[data-theme="gothic"] .post-follow,' +
      '[data-theme="gothic"] .follow-btn{' +
      'background:#161214!important;' +
      'color:#C9A227!important;' +
      'border:2px solid #C9A227!important;' +
      'box-shadow:0 0 8px rgba(201,162,39,.25)!important;' +
      'font-family:Cinzel,serif!important;' +
      'text-transform:uppercase;' +
      'font-size:11px!important;' +
      '}' +
      '[data-theme="gothic"] .follow-btn.following{' +
      'background:#6B0F2A!important;' +
      'color:#E8E0D8!important;' +
      '}' +

      /* settings */
      '[data-theme="gothic"] .settings-item,' +
      '[data-theme="gothic"] .msg-item,' +
      '[data-theme="gothic"] .share-opt{' +
      'background:rgba(12,10,11,.95)!important;' +
      'border-bottom:1px solid rgba(201,162,39,.18)!important;' +
      'color:#E8E0D8!important;' +
      '}' +
      '[data-theme="gothic"] .si-icon{' +
      'border:2px solid #C9A227!important;' +
      'background:#161214!important;' +
      'box-shadow:0 0 8px rgba(201,162,39,.25)!important;' +
      '}' +

      /* inputs */
      '[data-theme="gothic"] input,' +
      '[data-theme="gothic"] textarea,' +
      '[data-theme="gothic"] select{' +
      'background:#161214!important;' +
      'border:2px solid #C9A227!important;' +
      'color:#E8E0D8!important;' +
      'border-radius:10px!important;' +
      'box-shadow:inset 0 0 12px rgba(0,0,0,.45)!important;' +
      '}' +
      '[data-theme="gothic"] input::placeholder,' +
      '[data-theme="gothic"] textarea::placeholder{' +
      'color:#8A8078!important;' +
      '}' +

      /* botões */
      '[data-theme="gothic"] .profile-btn,' +
      '[data-theme="gothic"] .ads-pay,' +
      '[data-theme="gothic"] .af-pay,' +
      '[data-theme="gothic"] .sc-btn.primary{' +
      'background:linear-gradient(145deg,#6B0F2A,#3A0816)!important;' +
      'color:#C9A227!important;' +
      'border:2px solid #C9A227!important;' +
      'box-shadow:0 0 12px rgba(139,30,63,.35), 2px 2px 0 #000!important;' +
      'font-family:Cinzel,serif!important;' +
      'text-transform:uppercase;' +
      'letter-spacing:.05em;' +
      '}' +

      /* chat */
      '[data-theme="gothic"] .bubble.me{' +
      'background:linear-gradient(145deg,#6B0F2A,#3A0816)!important;' +
      'color:#E8E0D8!important;' +
      'border:2px solid #C9A227!important;' +
      'box-shadow:0 0 10px rgba(139,30,63,.3)!important;' +
      '}' +
      '[data-theme="gothic"] .bubble.them{' +
      'background:#161214!important;' +
      'color:#E8E0D8!important;' +
      'border:2px solid #A8A29A!important;' +
      '}' +
      '[data-theme="gothic"] .chat-input-bar{' +
      'background:#0C0A0B!important;' +
      'border-top:2px solid #C9A227!important;' +
      '}' +
      '[data-theme="gothic"] .chat-send,' +
      '[data-theme="gothic"] .chat-attach-btn,' +
      '[data-theme="gothic"] .sg-trigger,' +
      '[data-theme="gothic"] .sc-create-trigger{' +
      'background:#6B0F2A!important;' +
      'border:2px solid #C9A227!important;' +
      'box-shadow:0 0 8px rgba(201,162,39,.3)!important;' +
      '}' +
      '[data-theme="gothic"] .chat-send svg,' +
      '[data-theme="gothic"] .chat-attach-btn svg,' +
      '[data-theme="gothic"] .sg-trigger svg{' +
      'stroke:#C9A227!important;' +
      'filter:none!important;' +
      '}' +

      /* stories */
      '[data-theme="gothic"] .story-card{' +
      'border:2px solid #C9A227!important;' +
      'box-shadow:0 0 14px rgba(201,162,39,.25)!important;' +
      'border-radius:12px!important;' +
      '}' +
      '[data-theme="gothic"] .story-card.unseen{' +
      'outline:2px solid #8B1E3F;' +
      'outline-offset:3px;' +
      'box-shadow:0 0 16px rgba(139,30,63,.4)!important;' +
      '}' +
      '[data-theme="gothic"] .story-card-create-inner,' +
      '[data-theme="gothic"] .story-card-plus{' +
      'background:#6B0F2A!important;' +
      'border-color:#C9A227!important;' +
      'color:#C9A227!important;' +
      '}' +

      /* sheets */
      '[data-theme="gothic"] #tchiloSGSheet,' +
      '[data-theme="gothic"] #commentSheet,' +
      '[data-theme="gothic"] #postMenuSheet,' +
      '[data-theme="gothic"] .sheet{' +
      'background:#0C0A0B!important;' +
      'border-color:#C9A227!important;' +
      'color:#E8E0D8!important;' +
      'box-shadow:0 -8px 28px rgba(107,15,42,.3)!important;' +
      '}' +
      '[data-theme="gothic"] .sg-tab{' +
      'background:#161214!important;' +
      'border:2px solid #C9A227!important;' +
      'color:#E8E0D8!important;' +
      'font-family:Cinzel,serif!important;' +
      '}' +
      '[data-theme="gothic"] .sg-tab.on{' +
      'background:#6B0F2A!important;' +
      'color:#C9A227!important;' +
      '}' +
      '[data-theme="gothic"] .sg-item{' +
      'background:#161214!important;' +
      'border:2px solid #4A3A5C!important;' +
      '}' +

      /* avatares */
      '[data-theme="gothic"] .avatar,' +
      '[data-theme="gothic"] .story-card-avatar{' +
      'border:2px solid #C9A227!important;' +
      'box-shadow:0 0 10px rgba(201,162,39,.3)!important;' +
      'border-radius:8px!important;' +
      '}' +

      /* tags */
      '[data-theme="gothic"] .tag{' +
      'background:#6B0F2A!important;' +
      'color:#C9A227!important;' +
      'border:1px solid #C9A227!important;' +
      'font-family:Cinzel,serif!important;' +
      '}' +

      /* logo */
      '[data-theme="gothic"] .topbar img,' +
      '[data-theme="gothic"] .brand-logo{' +
      'filter:grayscale(.15) sepia(.25) hue-rotate(-10deg) brightness(.95) drop-shadow(0 0 5px rgba(201,162,39,.35))!important;' +
      '}' +

      '[data-theme="gothic"] .muted,' +
      '[data-theme="gothic"] .who span{' +
      'color:#8A8078!important;' +
      '}';
  }

  function storageKey() {
    try {
      if (typeof THEME_KEY !== "undefined" && THEME_KEY) return THEME_KEY;
    } catch (e) {}
    return THEME_STORAGE;
  }

  function syncAllChecks(active) {
    ["classic", "dark", "yellow", "violet", "red", "retro", "halloween", CODE].forEach(function (code) {
      var el = document.getElementById("theme-check-" + code);
      if (el) el.textContent = active === code ? "✓" : "";
    });
  }

  function applyGothic() {
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
    if (document.getElementById("theme-check-gothic")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "settings-item";
    btn.setAttribute("data-theme-opt", CODE);
    btn.onclick = function () {
      applyGothic();
      try {
        if (typeof showToast === "function") showToast("Tema Gótico");
      } catch (e) {}
    };
    btn.innerHTML =
      '<div class="theme-swatch" style="background:linear-gradient(135deg,#0C0A0B 30%,#6B0F2A 30% 60%,#C9A227 60%);border:2px solid #C9A227"></div>' +
      "<span>" +
      LABEL +
      "</span>" +
      '<span id="theme-check-gothic" class="theme-check"></span>';
    list.appendChild(btn);

    var cur = "classic";
    try {
      cur = localStorage.getItem(storageKey()) || "classic";
    } catch (e2) {}
    syncAllChecks(cur);
  }

  function patchSetAppTheme() {
    if (typeof window.setAppTheme !== "function") return false;
    if (window.setAppTheme.__gothic) return true;
    var orig = window.setAppTheme;
    window.setAppTheme = function (theme) {
      if (theme === CODE) {
        applyGothic();
        return;
      }
      if (theme !== "retro" && theme !== "halloween") {
        try {
          document.body.removeAttribute("data-theme");
        } catch (e) {}
      }
      var r = orig.apply(this, arguments);
      var el = document.getElementById("theme-check-gothic");
      if (el) el.textContent = "";
      return r;
    };
    window.setAppTheme.__gothic = true;
    return true;
  }

  function patchGetAppTheme() {
    if (typeof window.getAppTheme !== "function") return false;
    if (window.getAppTheme.__gothic) return true;
    var orig = window.getAppTheme;
    window.getAppTheme = function () {
      try {
        if (localStorage.getItem(storageKey()) === CODE) return CODE;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.getAppTheme.__gothic = true;
    return true;
  }

  function patchLabels() {
    try {
      if (window.THEME_LABELS) window.THEME_LABELS[CODE] = LABEL;
    } catch (e) {}
  }

  function applyIfStored() {
    try {
      if (localStorage.getItem(storageKey()) === CODE) applyGothic();
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
