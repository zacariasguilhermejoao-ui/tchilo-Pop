/**
 * Tchilo — sem riscos pretos (headers + itens de definições + quadros dos posts)
 * + esconde seta de voltar só em ecrãs principais (NÃO em Guardados nem settings)
 * v4
 */
(function () {
  "use strict";
  if (window.__tchiloNoHeaderLineV4) return;
  window.__tchiloNoHeaderLineV4 = true;
  window.__tchiloNoHeaderLineV3 = true;
  window.__tchiloNoHeaderLineV2 = true;
  window.__tchiloNoHeaderLineV1 = true;

  var CSS =
    /* Headers de página: sem linha de baixo nem de cima */
    "html body .screen-header," +
    "html body .screen > .screen-header," +
    "html body [id^=\"screen-\"] > .screen-header," +
    "html body [id^=\"screen-settings\"] > .screen-header," +
    "html body .settings-header," +
    "html body .page-header," +
    "html body .subpage-header," +
    "html body .chat-header," +
    "html body .legal-header{" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "border-top:none!important;" +
    "border-top-width:0!important;" +
    "box-shadow:none!important;" +
    "outline:none!important;}" +
    /* Topbar do feed */
    "html body .topbar," +
    "html body #appFrame .topbar," +
    "html body .app .topbar{" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "box-shadow:none!important;}" +
    /* Stories strip */
    "html body .stories," +
    "html body .stories-row," +
    "html body #storiesRow{" +
    "border-bottom-width:0.5px!important;" +
    "border-bottom-style:solid!important;" +
    "border-bottom-color:rgba(11,11,12,.10)!important;}" +
    /* Quadros dos posts no feed — sem borda preta */
    "html body .post-media," +
    "html body .post .post-media," +
    "html body #screen-feed .post-media," +
    "html body #feedList .post-media," +
    "html body .feed .post-media," +
    "html body article .post-media," +
    "html body .post-card .post-media," +
    "html body .media-frame," +
    "html body .post-frame{" +
    "border:none!important;" +
    "border-width:0!important;" +
    "box-shadow:none!important;" +
    "outline:none!important;}" +
    /* Separador entre posts — sem risco grosso */
    "html body .post," +
    "html body #screen-feed .post," +
    "html body #feedList .post{" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "box-shadow:none!important;}" +
    /* === RISCOS entre itens de definições — removidos em TODAS as páginas === */
    "html body .settings-item," +
    "html body #screen-settings .settings-item," +
    "html body [id^=\"screen-settings-\"] .settings-item," +
    "html body .settings-list .settings-item," +
    "html body #screen-saved .settings-item," +
    "html body .saved-tabs," +
    "html body .saved-tab{" +
    "border:none!important;" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "border-top:none!important;" +
    "box-shadow:none!important;}" +
    /* Seta desnecessária em ecrãs com navbar — SEM incluir Guardados nem settings */
    "#screen-notifs > .screen-header .back-btn," +
    "#screen-notifs .screen-header .back-btn," +
    "#screen-messages > .screen-header .back-btn," +
    "#screen-search > .screen-header .back-btn," +
    "#screen-explore > .screen-header .back-btn," +
    "#screen-friends > .screen-header .back-btn," +
    "#screen-profile > .screen-header .back-btn," +
    "#screen-feed > .screen-header .back-btn," +
    "#screen-reels > .screen-header .back-btn{" +
    "display:none!important;}" +
    /* Guardados + settings: FORÇAR botão voltar visível */
    "#screen-saved > .screen-header .back-btn," +
    "#screen-saved .screen-header .back-btn," +
    "#screen-settings > .screen-header .back-btn," +
    "#screen-settings .screen-header .back-btn," +
    "[id^=\"screen-settings-\"] > .screen-header .back-btn," +
    "[id^=\"screen-settings-\"] .screen-header .back-btn{" +
    "display:flex!important;visibility:visible!important;opacity:1!important;" +
    "width:36px!important;height:36px!important;min-width:36px!important;" +
    "border:0!important;background:transparent!important;}" +
    "#screen-notifs > .screen-header," +
    "#screen-messages > .screen-header," +
    "#screen-search > .screen-header," +
    "#screen-explore > .screen-header," +
    "#screen-friends > .screen-header," +
    "#screen-profile > .screen-header{" +
    "padding-left:18px!important;}";

  function inject() {
    var st = document.getElementById("tchiloNoHeaderLineCSS");
    if (!st) {
      st = document.createElement("style");
      st.id = "tchiloNoHeaderLineCSS";
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS;
    try {
      document.head.appendChild(st);
    } catch (e) {}
  }

  function hideBackOnMainTabs() {
    var ids = [
      "screen-notifs",
      "screen-messages",
      "screen-search",
      "screen-explore",
      "screen-friends",
      "screen-profile",
      "screen-feed",
      "screen-reels",
    ];
    ids.forEach(function (id) {
      var sc = document.getElementById(id);
      if (!sc) return;
      var hdr = sc.querySelector(":scope > .screen-header, .screen-header");
      if (!hdr) return;
      var btn = hdr.querySelector(".back-btn");
      if (btn) {
        btn.style.display = "none";
        btn.setAttribute("aria-hidden", "true");
        btn.tabIndex = -1;
      }
    });
  }

  function showBackOnSavedAndSettings() {
    var ids = ["screen-saved", "screen-settings"];
    ids.forEach(function (id) {
      var sc = document.getElementById(id);
      if (!sc) return;
      var hdr = sc.querySelector(":scope > .screen-header, .screen-header");
      if (!hdr) return;
      var btn = hdr.querySelector(".back-btn");
      if (btn) {
        btn.style.display = "flex";
        btn.style.visibility = "visible";
        btn.style.opacity = "1";
        btn.removeAttribute("aria-hidden");
        btn.tabIndex = 0;
      }
    });
    document.querySelectorAll('[id^="screen-settings-"]').forEach(function (sc) {
      var hdr = sc.querySelector(".screen-header");
      if (!hdr) return;
      var btn = hdr.querySelector(".back-btn");
      if (btn) {
        btn.style.display = "flex";
        btn.style.visibility = "visible";
        btn.style.opacity = "1";
        btn.removeAttribute("aria-hidden");
        btn.tabIndex = 0;
      }
    });
  }

  function stripBorders() {
    try {
      document
        .querySelectorAll(
          ".screen-header, .settings-header, .page-header, .chat-header, .topbar, .post-media, .media-frame, .post-frame, .settings-item"
        )
        .forEach(function (el) {
          if (el.classList.contains("post-media") || el.classList.contains("media-frame") || el.classList.contains("post-frame")) {
            el.style.border = "none";
            el.style.borderWidth = "0";
            el.style.boxShadow = "none";
          } else {
            el.style.borderBottom = "none";
            el.style.borderBottomWidth = "0";
            el.style.borderTop = "none";
            el.style.borderTopWidth = "0";
            el.style.boxShadow = "none";
          }
        });
      document.querySelectorAll(".post").forEach(function (el) {
        el.style.borderBottom = "none";
        el.style.borderBottomWidth = "0";
      });
    } catch (e) {}
  }

  function run() {
    inject();
    hideBackOnMainTabs();
    showBackOnSavedAndSettings();
    stripBorders();
  }

  run();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  }
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);

  try {
    var mo = new MutationObserver(function () {
      hideBackOnMainTabs();
      showBackOnSavedAndSettings();
      stripBorders();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e2) {}
})();
