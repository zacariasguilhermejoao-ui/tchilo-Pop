/**
 * Tchilo — sem risco preto no topo dos headers
 * + esconde seta de voltar em ecrãs principais (navbar inferior)
 * v1
 */
(function () {
  "use strict";
  if (window.__tchiloNoHeaderLineV1) return;
  window.__tchiloNoHeaderLineV1 = true;

  var CSS =
    /* Headers de página: sem linha de baixo (risco preto) */
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
    "box-shadow:none!important;" +
    "outline:none!important;}" +
    /* Topbar do feed */
    "html body .topbar," +
    "html body #appFrame .topbar," +
    "html body .app .topbar{" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "box-shadow:none!important;}" +
    /* Stories strip: sem linha grossa */
    "html body .stories," +
    "html body .stories-row," +
    "html body #storiesRow{" +
    "border-bottom-width:0.5px!important;" +
    "border-bottom-style:solid!important;" +
    "border-bottom-color:rgba(11,11,12,.10)!important;}" +
    /* Seta desnecessária em ecrãs com navbar inferior */
    "#screen-notifs > .screen-header .back-btn," +
    "#screen-notifs .screen-header .back-btn," +
    "#screen-messages > .screen-header .back-btn," +
    "#screen-search > .screen-header .back-btn," +
    "#screen-explore > .screen-header .back-btn," +
    "#screen-friends > .screen-header .back-btn," +
    "#screen-profile > .screen-header .back-btn," +
    "#screen-feed > .screen-header .back-btn," +
    "#screen-reels > .screen-header .back-btn," +
    "#screen-saved > .screen-header .back-btn{" +
    "display:none!important;}" +
    /* Título centrado/limpo quando não há seta */
    "#screen-notifs > .screen-header," +
    "#screen-messages > .screen-header," +
    "#screen-search > .screen-header," +
    "#screen-explore > .screen-header," +
    "#screen-friends > .screen-header," +
    "#screen-profile > .screen-header{" +
    "padding-left:18px!important;}" +
    "#screen-notifs > .screen-header h1," +
    "#screen-messages > .screen-header h1," +
    "#screen-search > .screen-header h1," +
    "#screen-explore > .screen-header h1," +
    "#screen-friends > .screen-header h1{" +
    "margin:0!important;}";

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
      "screen-saved",
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

  function stripHeaderBorders() {
    try {
      document.querySelectorAll(".screen-header, .settings-header, .page-header, .chat-header, .topbar").forEach(function (el) {
        el.style.borderBottom = "none";
        el.style.borderBottomWidth = "0";
        el.style.boxShadow = "none";
      });
    } catch (e) {}
  }

  function run() {
    inject();
    hideBackOnMainTabs();
    stripHeaderBorders();
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
      stripHeaderBorders();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e2) {}
})();
