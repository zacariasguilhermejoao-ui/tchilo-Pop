/**
 * tchilo-Pop — força o Gestor de Anúncios profissional a abrir
 */
(function () {
  "use strict";

  var LOADED = false;

  function loadScript(src) {
    return new Promise(function (resolve) {
      if (document.querySelector('script[data-src-key="' + src + '"]')) {
        resolve(true);
        return;
      }
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.setAttribute("data-src-key", src);
      s.onload = function () {
        resolve(true);
      };
      s.onerror = function () {
        resolve(false);
      };
      document.head.appendChild(s);
    });
  }

  function candidates(path) {
    var origin = "";
    try {
      origin = location.origin || "";
    } catch (e) {}
    var v = "v=20260922adsforce2";
    return [
      "native/" + path + "?" + v,
      "./native/" + path + "?" + v,
      "/" + path + "?" + v,
      origin + "/native/" + path + "?" + v,
      "https://zacariasguilhermejoao-ui.github.io/tchilo-Pop/native/" + path + "?" + v,
      "https://tchilopop.com/native/" + path + "?" + v,
      "https://www.tchilopop.com/native/" + path + "?" + v
    ];
  }

  async function ensurePro() {
    if (typeof window.tchiloOpenAdsPro === "function") return true;
    var files = ["tchilo-ads-pro.js", "tchilo-ads-preview.js"];
    for (var f = 0; f < files.length; f++) {
      var list = candidates(files[f]);
      for (var i = 0; i < list.length; i++) {
        await loadScript(list[i]);
        if (typeof window.tchiloOpenAdsPro === "function") return true;
      }
    }
    return typeof window.tchiloOpenAdsPro === "function";
  }

  function openPro() {
    ensurePro().then(function (ok) {
      if (typeof window.tchiloOpenAdsPro === "function") {
        window.tchiloOpenAdsPro();
        return;
      }
      if (typeof window.tchiloOpenAdsManager === "function") {
        window.tchiloOpenAdsManager();
        return;
      }
      alert(
        ok
          ? "Gestor carregado, mas não abriu. Faz hard refresh."
          : "Não foi possível carregar o Gestor de Anúncios. Verifica a internet e faz hard refresh."
      );
    });
  }

  function wireBtn() {
    var btn = document.getElementById("tchiloAdsMgrBtn");
    if (!btn) return;
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openPro();
    };
    var label = btn.querySelector("span");
    if (label && label.textContent.indexOf("Anúnc") >= 0) {
      label.textContent = "Gestor de Anúncios";
    }
  }

  function injectBtn() {
    if (document.getElementById("tchiloAdsMgrBtn")) {
      wireBtn();
      return;
    }
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloAdsMgrBtn";
    btn.className = "settings-item";
    btn.innerHTML =
      '<div class="si-icon" style="width:36px;height:36px;border-radius:10px;background:#c8f560;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font-weight:900">A</div>' +
      "<span>Gestor de Anúncios</span>" +
      '<div class="chev" style="margin-left:auto;opacity:.5">›</div>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openPro();
    };
    var first = list.querySelector(".settings-item");
    if (first) list.insertBefore(btn, first);
    else list.appendChild(btn);
  }

  // interceptar Turbinar para abrir pro
  function patchBoost() {
    if (typeof window.tchiloBoostPost === "function" && !window.tchiloBoostPost.__forcePro) {
      var orig = window.tchiloBoostPost;
      window.tchiloBoostPost = function (postId) {
        try {
          window.__tchiloBoostPostId = postId || null;
        } catch (e) {}
        openPro();
        setTimeout(function () {
          try {
            var b = document.getElementById("apGoCreate");
            if (b) b.click();
          } catch (e2) {}
        }, 200);
      };
      window.tchiloBoostPost.__forcePro = true;
      window.tchiloBoostPost.__orig = orig;
    }
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

  setInterval(function () {
    injectBtn();
    wireBtn();
    patchBoost();
  }, 1200);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
})();
