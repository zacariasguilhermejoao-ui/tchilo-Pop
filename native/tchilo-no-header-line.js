/**
 * Tchilo — sem riscos pretos (headers + quadros dos posts)
 * + esconde seta de voltar em ecrãs principais
 * v2
 */
(function () {
  "use strict";
  if (window.__tchiloNoHeaderLineV2) return;
  window.__tchiloNoHeaderLineV2 = true;
  window.__tchiloNoHeaderLineV1 = true;

  var CSS =
    /* Headers de página: sem linha de baixo */
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
    /* Seta desnecessária em ecrãs com navbar */
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

  function stripBorders() {
    try {
      document
        .querySelectorAll(
          ".screen-header, .settings-header, .page-header, .chat-header, .topbar, .post-media, .media-frame, .post-frame"
        )
        .forEach(function (el) {
          if (el.classList.contains("post-media") || el.classList.contains("media-frame") || el.classList.contains("post-frame")) {
            el.style.border = "none";
            el.style.borderWidth = "0";
            el.style.boxShadow = "none";
          } else {
            el.style.borderBottom = "none";
            el.style.borderBottomWidth = "0";
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
      stripBorders();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e2) {}
})();
