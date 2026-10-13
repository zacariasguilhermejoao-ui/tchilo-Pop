/**
 * tchilo-Pop — força botão Anúncios + abre gestor pro
 * v2 — ícone megafone profissional (Lucide)
 */
(function () {
  "use strict";
  if (window.__tchiloAdsForceV2) return;
  window.__tchiloAdsForceV2 = true;
  window.__tchiloAdsForceV1 = true;

  var MEGAPHONE_SVG =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>' +
    '<path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>' +
    '<path d="M8 6v8"/>' +
    "</svg>";

  function injectBtn() {
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;
    var btn = document.getElementById("tchiloAdsMgrBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "tchiloAdsMgrBtn";
      btn.className = "settings-item";
      btn.innerHTML =
        '<div class="si-icon">' +
        MEGAPHONE_SVG +
        "</div>" +
        "<span>Gestor de anúncios</span><span class=\"chev\">›</span>";
      var prem = document.getElementById("settings-premium-item") || document.getElementById("tchiloPremiumBtn");
      if (prem && prem.parentNode === list) {
        if (prem.nextSibling) list.insertBefore(btn, prem.nextSibling);
        else list.appendChild(btn);
      } else if (list.firstChild) list.insertBefore(btn, list.firstChild);
      else list.appendChild(btn);
    } else {
      var box = btn.querySelector(".si-icon");
      if (box && !box.querySelector("svg")) {
        box.innerHTML = MEGAPHONE_SVG;
        box.removeAttribute("style");
      }
    }
    return btn;
  }

  function ensurePro() {
    if (typeof window.tchiloOpenAdsManager === "function" && window.tchiloOpenAdsManager.__pro) return true;
    return typeof window.tchiloOpenAdsManager === "function";
  }

  function openPro() {
    try {
      if (typeof window.tchiloOpenAdsManager === "function" && window.tchiloOpenAdsManager.__pro) {
        window.tchiloOpenAdsManager();
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.tchiloOpenAdCreate === "function") {
        window.tchiloOpenAdCreate();
        return;
      }
    } catch (e2) {}
  }

  function wireBtn() {
    var btn = document.getElementById("tchiloAdsMgrBtn");
    if (!btn || btn.__forceWired) return;
    btn.__forceWired = true;
    btn.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        openPro();
      },
      true
    );
  }

  function patchBoost() {
    if (typeof window.tchiloBoostPost === "function" && window.tchiloBoostPost.__forcePro) return;
    var orig = window.tchiloBoostPost;
    window.tchiloBoostPost = function () {
      try {
        if (typeof window.tchiloOpenAdCreate === "function") {
          window.tchiloOpenAdCreate();
          return;
        }
      } catch (e) {}
      if (typeof orig === "function") return orig.apply(this, arguments);
      openPro();
    };
    window.tchiloBoostPost.__forcePro = true;
    window.tchiloBoostPost.__orig = orig;
  }

  if (!window.tchiloOpenAdsManager || !window.tchiloOpenAdsManager.__pro) {
    var prev = window.tchiloOpenAdsManager;
    window.tchiloOpenAdsManager = function () {
      if (typeof prev === "function" && prev.__pro) return prev.apply(this, arguments);
      openPro();
    };
  }

  function boot() {
    injectBtn();
    wireBtn();
    patchBoost();
    ensurePro();
  }

  setInterval(function () {
    injectBtn();
    wireBtn();
    patchBoost();
  }, 12000);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
})();
