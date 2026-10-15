/**
 * Tchilo — sem riscos pretos em headers / settings
 * v6 — SEM MutationObserver (evita freeze)
 */
(function () {
  "use strict";
  if (window.__tchiloNoHeaderLineV6) return;
  window.__tchiloNoHeaderLineV6 = true;

  var CSS =
    "html body .screen-header," +
    "html body .screen > .screen-header," +
    "html body [id^=\"screen-\"] > .screen-header," +
    "html body [id^=\"screen-settings\"] > .screen-header," +
    "html body .settings-header," +
    "html body .page-header," +
    "html body .subpage-header," +
    "html body .chat-header," +
    "html body .legal-header{" +
    "border:none!important;border-bottom:none!important;border-bottom-width:0!important;" +
    "border-top:none!important;box-shadow:none!important;outline:none!important;}" +
    "html body .screen-header::after," +
    "html body .screen-header::before," +
    "html body .settings-header::after," +
    "html body .settings-header::before{" +
    "content:none!important;display:none!important;}" +
    "html body .topbar," +
    "html body #appFrame .topbar{" +
    "border-bottom:none!important;box-shadow:none!important;}" +
    "html body .settings-item," +
    "html body .settings-list .settings-item," +
    "html body [id^=\"screen-settings-\"] .settings-item," +
    "html body .legal-item{" +
    "border:none!important;border-bottom:none!important;border-top:none!important;box-shadow:none!important;}" +
    "html body .post-media,html body .media-frame,html body .post-frame{" +
    "border:none!important;box-shadow:none!important;}" +
    "html body .post{border-bottom:none!important;}" +
    "#screen-notifs .screen-header .back-btn," +
    "#screen-messages .screen-header .back-btn," +
    "#screen-search .screen-header .back-btn," +
    "#screen-explore .screen-header .back-btn," +
    "#screen-friends .screen-header .back-btn," +
    "#screen-profile .screen-header .back-btn," +
    "#screen-feed .screen-header .back-btn," +
    "#screen-reels .screen-header .back-btn{display:none!important;}" +
    "#screen-saved .screen-header .back-btn," +
    "#screen-settings .screen-header .back-btn," +
    "[id^=\"screen-settings-\"] .screen-header .back-btn{" +
    "display:flex!important;visibility:visible!important;opacity:1!important;" +
    "width:36px!important;height:36px!important;border:0!important;background:transparent!important;}";

  function inject() {
    var st = document.getElementById("tchiloNoHeaderLineCSS");
    if (!st) {
      st = document.createElement("style");
      st.id = "tchiloNoHeaderLineCSS";
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS;
  }

  inject();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  }
  setTimeout(inject, 500);
  setTimeout(inject, 2000);
})();
