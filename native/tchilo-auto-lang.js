/**
 * tchilo-Pop — idioma automático do telefone
 * Se o utilizador nunca escolheu idioma nas definições,
 * usa navigator.language (pt, en, fr, it, zh).
 */
(function () {
  "use strict";

  if (window.__tchiloAutoLang) return;
  window.__tchiloAutoLang = true;

  var LANGUAGE_KEY = "tchilo_language";
  var MANUAL_KEY = "tchilo_language_manual";
  var SUPPORTED = { pt: 1, en: 1, fr: 1, it: 1, zh: 1 };

  function detectDeviceLang() {
    try {
      var list = [];
      if (navigator.languages && navigator.languages.length) {
        for (var i = 0; i < navigator.languages.length; i++) {
          list.push(String(navigator.languages[i] || ""));
        }
      }
      if (navigator.language) list.push(String(navigator.language));
      if (navigator.userLanguage) list.push(String(navigator.userLanguage));

      for (var j = 0; j < list.length; j++) {
        var raw = list[j].toLowerCase().replace("_", "-");
        var primary = raw.split("-")[0];
        // zh-CN / zh-TW → zh
        if (primary === "zh") return "zh";
        if (SUPPORTED[primary]) return primary;
        // pt-BR, pt-PT → pt
        if (raw.indexOf("pt") === 0) return "pt";
      }
    } catch (e) {}
    return "pt";
  }

  function isManual() {
    try {
      return localStorage.getItem(MANUAL_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markManual() {
    try {
      localStorage.setItem(MANUAL_KEY, "1");
    } catch (e) {}
  }

  function resolveLang() {
    // Escolha manual nas definições tem prioridade
    if (isManual()) {
      try {
        var saved = localStorage.getItem(LANGUAGE_KEY);
        if (saved && SUPPORTED[saved]) return saved;
      } catch (e) {}
    }

    // Sem escolha manual → idioma do telefone
    var device = detectDeviceLang();
    try {
      // Não marcar como manual; só sincronizar valor efectivo
      localStorage.setItem(LANGUAGE_KEY, device);
    } catch (e) {}
    return device;
  }

  function patch() {
    // Sobrescrever getLanguage
    window.getLanguage = function () {
      return resolveLang();
    };

    // Quando o utilizador escolhe nas definições, marcar como manual
    var originalSet =
      typeof window.setLanguage === "function" ? window.setLanguage : null;
    window.setLanguage = function (lang) {
      markManual();
      if (originalSet) return originalSet.apply(this, arguments);
      lang = SUPPORTED[lang] ? lang : "pt";
      try {
        localStorage.setItem(LANGUAGE_KEY, lang);
      } catch (e) {}
      if (typeof window.applyLanguage === "function") window.applyLanguage();
    };

    // Aplicar já
    try {
      if (typeof window.applyLanguage === "function") window.applyLanguage();
    } catch (e) {}
  }

  function boot() {
    patch();
    // Reaplicar depois do boot principal (index chama applyLanguage no DOMContentLoaded)
    setTimeout(patch, 50);
    setTimeout(function () {
      try {
        if (typeof window.applyLanguage === "function") window.applyLanguage();
        if (typeof window.renderSettingsLanguage === "function")
          window.renderSettingsLanguage();
      } catch (e) {}
    }, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
