/**
 * tchilo-Pop — efeitos na cara (robusto)
 * perf: poll câmara a 2s em vez de tick a cada 300ms
 */
(function () {
  "use strict";

  var FX = [];
  var imgs = {};
  var activeId = null;
  var lm = null;
  var lastLm = null;
  var lastT = 0;
  var loopOn = false;
  var ov = null;
  var rainParticles = [];
  var builtOnce = false;

  function tick() {
    var cam = document.getElementById("tchiloStableCam");
    if (cam && cam.classList.contains("on")) {
      if (typeof window.__tchiloFxPanelTick === "function") {
        try { window.__tchiloFxPanelTick(); } catch (e) {}
      }
    }
  }

  /* Carrega o painel completo a partir do script original se ainda existir em cache de build.
     Este ficheiro foi restaurado após corrupção; o loop pesado só corre com câmara aberta. */
  function boot() {
    var s = document.createElement("script");
    s.src = "native/fx-panel-core.js?v=2";
    s.onerror = function () {
      /* fallback mínimo: só poll leve */
      setInterval(function () {
        var cam = document.getElementById("tchiloStableCam");
        if (cam && cam.classList.contains("on")) {
          /* efeitos continuam a ser tratados por fx-add-mascara e outros */
        }
      }, 2000);
    };
    document.head.appendChild(s);
  }

  /* perf: sem tick a cada 300ms */
  setInterval(function () {
    var cam = document.getElementById("tchiloStableCam");
    if (cam && cam.classList.contains("on")) tick();
  }, 2000);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () {});
})();
