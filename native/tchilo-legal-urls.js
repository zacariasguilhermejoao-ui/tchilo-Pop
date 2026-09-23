/**
 * tchilo-Pop — documentos legais com URL pública
 */
(function () {
  "use strict";

  function base() {
    try {
      var origin = location.origin || "";
      var path = location.pathname || "/";
      // se estiver em /algo/index.html, base = pasta do projeto
      if (path.indexOf("/tchilo-Pop") >= 0) {
        var i = path.indexOf("/tchilo-Pop");
        return origin + path.slice(0, i + "/tchilo-Pop".length) + "/";
      }
      // site próprio tchilopop.com
      if (/tchilopop\.com$/i.test(location.hostname || "")) {
        return origin + "/";
      }
      // pasta atual (remove ficheiro)
      if (path.endsWith(".html")) {
        return origin + path.replace(/[^/]+$/, "");
      }
      return origin + (path.endsWith("/") ? path : path.replace(/[^/]+$/, ""));
    } catch (e) {
      return "https://tchilopop.com/";
    }
  }

  var PAGES = {
    terms: "terms.html",
    privacy: "privacy.html",
    cookies: "cookies.html",
    community: "community.html",
    child: "child-safety.html",
    about: "about.html"
  };

  function urlFor(key) {
    return base() + (PAGES[key] || PAGES.terms);
  }

  function openLegal(key) {
    var u = urlFor(key);
    try {
      // app Capacitor / browser: abrir na mesma janela ou nova
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
    if (typeof window.openLegalFromLogin === "function" && window.openLegalFromLogin.__url) return;
    window.openLegalFromLogin = function (name) {
      openLegal(name === "privacy" ? "privacy" : name === "terms" ? "terms" : name);
    };
    window.openLegalFromLogin.__url = true;
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

  function injectUrlHints() {
    var list = document.querySelector("#screen-settings-legal .settings-list");
    if (!list) return;
    // mostrar URL pequena sob cada item legal
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
      btn.setAttribute("data-legal-key", key);
      if (!btn.querySelector(".legal-url-hint")) {
        var hint = document.createElement("div");
        hint.className = "legal-url-hint";
        hint.style.cssText =
          "font:600 10px ui-monospace,Menlo,monospace;color:var(--muted,#6b6b70);margin-top:2px;word-break:break-all;max-width:70%";
        hint.textContent = urlFor(key).replace(/^https?:\/\//, "");
        // inserir depois do span principal
        if (sp.nextSibling) btn.insertBefore(hint, sp.nextSibling);
        else btn.appendChild(hint);
      }
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLegal(key);
      };
    });
  }

  function ensureCookiesInLegal() {
    // se o botão cookies já foi injectado por outro script, o injectUrlHints cobre
  }

  function boot() {
    patchOpenLegalFromLogin();
    patchGoTo();
    injectUrlHints();
  }

  setInterval(boot, 1500);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 500);
})();
