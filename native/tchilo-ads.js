/**
 * tchilo-Pop — anúncios (versão leve de segurança)
 * O UI completo está em tchilo-ads-ui.js / tchilo-ads-force.js
 * Este ficheiro só garante as APIs globais para não quebrar o site.
 */
(function () {
  "use strict";
  if (window.__tchiloAdsLite) return;
  window.__tchiloAdsLite = true;

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
      else console.log("[ads]", msg);
    } catch (e) {}
  }

  function openCreate() {
    try {
      if (typeof window.tchiloOpenAdCreate === "function" && !window.tchiloOpenAdCreate.__lite) {
        return window.tchiloOpenAdCreate();
      }
    } catch (e) {}
    toast("A abrir criação de anúncio…");
  }

  function openManager() {
    try {
      if (typeof window.tchiloOpenAdsManager === "function" && !window.tchiloOpenAdsManager.__lite) {
        return window.tchiloOpenAdsManager();
      }
    } catch (e) {}
    openCreate();
  }

  if (typeof window.tchiloOpenAdCreate !== "function") {
    window.tchiloOpenAdCreate = openCreate;
    window.tchiloOpenAdCreate.__lite = true;
  }
  if (typeof window.tchiloOpenAdsManager !== "function") {
    window.tchiloOpenAdsManager = openManager;
    window.tchiloOpenAdsManager.__lite = true;
  }
})();
