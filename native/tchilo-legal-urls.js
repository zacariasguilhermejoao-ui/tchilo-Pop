/**
 * tchilo-Pop — documentos legais com URL limpa (sem .html)
 */
(function () {
  "use strict";

  function base() {
    try {
      var origin = location.origin || "";
      var path = location.pathname || "/";
      if (path.indexOf("/tchilo-Pop") >= 0) {
        var i = path.indexOf("/tchilo-Pop");
        return origin + path.slice(0, i + "/tchilo-Pop".length) + "/";
      }
      if (/tchilopop\.com$/i.test(location.hostname || "")) {
        return origin + "/";
      }
      if (path.endsWith(".html")) {
        return origin + path.replace(/[^/]+$/, "");
      }
      return origin + (path.endsWith("/") ? path : path.replace(/[^/]+$/, ""));
    } catch (e) {
      return "https://tchilopop.com/";
    }
  }

  var PAGES = {
    terms: "termos/",
    privacy: "privacidade/",
    cookies: "cookies/",
    community: "comunidade/",
    child: "menores/",
    about: "sobre/"
  };

  function urlFor(key) {
    return base() + (PAGES[key] || PAGES.terms);
  }

  function openLegal(key) {
    var u = urlFor(key);
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
        window.Capacitor.Plugins.Browser.open({ url: u });
        return;
      }
    } catch (e) {}
    try {
      window.open(u, "_blank", "noopener,noreferrer");
    } catch (e2) {
      location.href = u;
    }
  }

  window.tchiloLegalUrl = urlFor;
  window.tchiloOpenLegalPage = openLegal;

  function patchOpenLegalFromLogin() {
    window.openLegalFromLogin = function (name) {
      if (name === "privacy") openLegal("privacy");
      else if (name === "terms") openLegal("terms");
      else openLegal(name);
    };
  }

  function patchGoTo() {
    if (typeof window.goTo !== "function" || window.goTo.__legalUrl) return;
    var orig = window.goTo;
    window.goTo = function (name) {
      if (name === "terms" || name === "privacy" || name === "community" || name === "about" || name === "child" || name === "cookies") {
        openLegal(name === "child" ? "child" : name);
        return;
      }
      return orig.apply(this, arguments);
    };
    window.goTo.__legalUrl = true;
  }

  function injectLegalClicks() {
    var list = document.querySelector("#screen-settings-legal .settings-list");
    if (!list) return;
    list.querySelectorAll(".settings-item").forEach(function (btn) {
      var sp = btn.querySelector("span");
      if (!sp) return;
      var t = (sp.textContent || "").toLowerCase();
      var key = null;
      if (/termos/.test(t)) key = "terms";
      else if (/privacidade|privacy/.test(t)) key = "privacy";
      else if (/cookie/.test(t)) key = "cookies";
      else if (/comunidade|community|diretrizes/.test(t)) key = "community";
      else if (/menor|csae|child/.test(t)) key = "child";
      else if (/sobre|about/.test(t)) key = "about";
      if (!key) return;
      btn.querySelectorAll(".legal-url-hint").forEach(function (h) {
        try { h.remove(); } catch (e) {}
      });
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLegal(key);
      };
    });
  }

  function boot() {
    patchOpenLegalFromLogin();
    patchGoTo();
    injectLegalClicks();
  }

  setInterval(boot, 1500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 500);
})();
