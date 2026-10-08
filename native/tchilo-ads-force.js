/**
 * tchilo-Pop — força botão Anúncios + abre gestor pro
 */
(function () {
  "use strict";
  if (window.__tchiloAdsForceV1) return;
  window.__tchiloAdsForceV1 = true;

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
        '<div class="si-icon" style="background:#0B0B0C;color:#fff;border:2px solid var(--ink,#0B0B0C);border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:900">A</div>' +
        "<span>Meus Anúncios</span><span class=\"chev\">›</span>";
      var prem = document.getElementById("tchiloPremiumBtn");
      if (prem && prem.parentNode === list) {
        if (prem.nextSibling) list.insertBefore(btn, prem.nextSibling);
        else list.appendChild(btn);
      } else if (list.firstChild) list.insertBefore(btn, list.firstChild);
      else list.appendChild(btn);
    }
    return btn;
  }

  function ensurePro() {
    if (typeof window.tchiloOpenAdsManager === "function" && window.tchiloOpenAdsManager.__pro) return true;
    return typeof window.tchiloOpenAdsManager === "function";
  }

  function openPro() {
    try {
      if (typeof window.tchiloOpenAdsManager === "function") {
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

  window.tchiloOpenAdsManager = function () {
    openPro();
  };

  function boot() {
    injectBtn();
    wireBtn();
    patchBoost();
    ensurePro();
  }

  /* perf */
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
