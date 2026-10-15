/**
 * Tchilo — sem riscos pretos em headers, legal, settings e itens
 * v5 — nuclear: remove border/box-shadow em tudo o que parece risco
 */
(function () {
  "use strict";
  if (window.__tchiloNoHeaderLineV5) return;
  window.__tchiloNoHeaderLineV5 = true;
  window.__tchiloNoHeaderLineV4 = true;
  window.__tchiloNoHeaderLineV3 = true;
  window.__tchiloNoHeaderLineV2 = true;
  window.__tchiloNoHeaderLineV1 = true;

  var CSS =
    /* ===== HEADERS: zero riscos ===== */
    "html body .screen-header," +
    "html body .screen > .screen-header," +
    "html body [id^=\"screen-\"] > .screen-header," +
    "html body [id^=\"screen-settings\"] > .screen-header," +
    "html body [id^=\"screen-legal\"] > .screen-header," +
    "html body #screen-settings-legal > .screen-header," +
    "html body #screen-settings-account > .screen-header," +
    "html body #screen-settings-account-advanced > .screen-header," +
    "html body #screen-settings-notifs > .screen-header," +
    "html body .settings-header," +
    "html body .page-header," +
    "html body .subpage-header," +
    "html body .chat-header," +
    "html body .legal-header," +
    "html body .screen-header h1," +
    "html body .screen-header::after," +
    "html body .screen-header::before{" +
    "border:none!important;" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "border-bottom-color:transparent!important;" +
    "border-top:none!important;" +
    "border-top-width:0!important;" +
    "box-shadow:none!important;" +
    "outline:none!important;" +
    "background-image:none!important;}" +
    /* Pseudo-elementos dos headers */
    "html body .screen-header::after," +
    "html body .screen-header::before," +
    "html body .settings-header::after," +
    "html body .settings-header::before{" +
    "content:none!important;display:none!important;height:0!important;border:0!important;}" +
    /* Topbar */
    "html body .topbar," +
    "html body #appFrame .topbar," +
    "html body .app .topbar{" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "box-shadow:none!important;}" +
    /* Stories strip — linha fina ok */
    "html body .stories," +
    "html body .stories-row," +
    "html body #storiesRow{" +
    "border-bottom-width:0.5px!important;" +
    "border-bottom-style:solid!important;" +
    "border-bottom-color:rgba(11,11,12,.10)!important;}" +
    /* Posts */
    "html body .post-media," +
    "html body .post .post-media," +
    "html body #screen-feed .post-media," +
    "html body #feedList .post-media," +
    "html body .feed .post-media," +
    "html body article .post-media," +
    "html body .post-card .post-media," +
    "html body .media-frame," +
    "html body .post-frame{" +
    "border:none!important;border-width:0!important;box-shadow:none!important;outline:none!important;}" +
    "html body .post," +
    "html body #screen-feed .post," +
    "html body #feedList .post{" +
    "border-bottom:none!important;border-bottom-width:0!important;box-shadow:none!important;}" +
    /* Itens de definições / legal / lista */
    "html body .settings-item," +
    "html body #screen-settings .settings-item," +
    "html body [id^=\"screen-settings-\"] .settings-item," +
    "html body .settings-list .settings-item," +
    "html body #screen-saved .settings-item," +
    "html body .saved-tabs," +
    "html body .saved-tab," +
    "html body .legal-item," +
    "html body .settings-list," +
    "html body .settings-list > *{" +
    "border:none!important;" +
    "border-bottom:none!important;" +
    "border-bottom-width:0!important;" +
    "border-top:none!important;" +
    "box-shadow:none!important;}" +
    /* Divider genérico */
    "html body .divider," +
    "html body hr," +
    "html body .settings-divider," +
    "html body .list-divider{" +
    "display:none!important;height:0!important;border:0!important;}" +
    /* Back buttons */
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
    "#screen-saved > .screen-header .back-btn," +
    "#screen-saved .screen-header .back-btn," +
    "#screen-settings > .screen-header .back-btn," +
    "#screen-settings .screen-header .back-btn," +
    "[id^=\"screen-settings-\"] > .screen-header .back-btn," +
    "[id^=\"screen-settings-\"] .screen-header .back-btn," +
    "[id^=\"screen-legal\"] .screen-header .back-btn{" +
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
    /* Re-append no fim do head para ganhar prioridade */
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
    document.querySelectorAll('[id^="screen-settings-"], [id^="screen-legal"]').forEach(function (sc) {
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
          ".screen-header, .settings-header, .page-header, .chat-header, .legal-header, .topbar, .post-media, .media-frame, .post-frame, .settings-item, .legal-item, .settings-list, .divider, hr"
        )
        .forEach(function (el) {
          el.style.setProperty("border", "none", "important");
          el.style.setProperty("border-bottom", "none", "important");
          el.style.setProperty("border-bottom-width", "0", "important");
          el.style.setProperty("border-top", "none", "important");
          el.style.setProperty("border-top-width", "0", "important");
          el.style.setProperty("box-shadow", "none", "important");
        });
      document.querySelectorAll(".post").forEach(function (el) {
        el.style.setProperty("border-bottom", "none", "important");
        el.style.setProperty("border-bottom-width", "0", "important");
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
  setTimeout(run, 50);
  setTimeout(run, 200);
  setTimeout(run, 600);
  setTimeout(run, 1500);
  setTimeout(run, 3000);

  try {
    var mo = new MutationObserver(function () {
      hideBackOnMainTabs();
      showBackOnSavedAndSettings();
      stripBorders();
      inject();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e2) {}

  /* Também ao navegar */
  if (typeof window.goTo === "function" && !window.goTo.__noHeaderLine) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(run, 30);
      setTimeout(run, 150);
      return r;
    };
    window.goTo.__noHeaderLine = true;
  }
})();
