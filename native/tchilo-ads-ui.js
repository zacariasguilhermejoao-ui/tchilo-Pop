/**
 * tchilo-Pop — garante UI de anúncios (Definições + menu do post)
 */
(function () {
  "use strict";

  function ensureCSS() {
    if (document.getElementById("tchiloAdsUiCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsUiCSS";
    st.textContent =
      "#tchiloAdsMgrBtn{display:flex!important;align-items:center;gap:12px;width:100%;border:0;background:none;padding:14px 18px;text-align:left;font:700 15px Inter,system-ui,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)}" +
      "#tchiloAdsMgrBtn .si-icon{width:36px;height:36px;border-radius:10px;background:#c8f560;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0}" +
      "#tchiloAdsMgrBtn .chev{margin-left:auto;opacity:.5;font-size:18px}";
    document.head.appendChild(st);
  }

  function openMgr() {
    if (typeof window.tchiloOpenAdsManager === "function") window.tchiloOpenAdsManager();
    else if (typeof window.tchiloOpenAdCreate === "function") window.tchiloOpenAdCreate();
    else alert("A carregar anúncios… atualiza a página (hard refresh).");
  }

  function openCreateFromPost(postId) {
    try {
      window.__tchiloBoostPostId = postId || null;
      if (postId && typeof getPosts === "function") {
        var posts = getPosts() || [];
        var p = posts.find(function (x) {
          return x && String(x.id) === String(postId);
        });
        if (p) {
          var mediaUrl = "";
          var mediaType = "image";
          try {
            if (typeof resolveMedia === "function") {
              var m = resolveMedia(p);
              if (m && m.url) {
                mediaUrl = m.url;
                mediaType = m.type === "video" ? "video" : "image";
              }
            }
          } catch (e0) {}
          if (!mediaUrl) {
            mediaUrl = (p.media && p.media.url) || p.image || p.video || "";
            mediaType = p.video ? "video" : "image";
          }
          window.__tchiloBoostDraft = {
            body: p.text || p.caption || p.body || "",
            media_url: mediaUrl,
            media_type: mediaType
          };
        }
      }
    } catch (e) {}
    if (typeof window.tchiloOpenAdCreate === "function") window.tchiloOpenAdCreate();
    else openMgr();
  }

  function injectSettings() {
    ensureCSS();
    if (document.getElementById("tchiloAdsMgrBtn")) return;

    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloAdsMgrBtn";
    btn.className = "settings-item";
    btn.innerHTML =
      '<div class="si-icon">A</div><span>Meus Anúncios</span><div class="chev">›</div>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openMgr();
    };

    var firstItem = list.querySelector(".settings-item");
    if (firstItem) list.insertBefore(btn, firstItem);
    else list.appendChild(btn);
  }

  function patchPostMenu() {
    if (typeof window.openPostMenu !== "function") return false;
    if (window.openPostMenu.__adsBoost) return true;
    var orig = window.openPostMenu;
    window.openPostMenu = function (postId) {
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        try {
          var box = document.getElementById("postMenuOptions");
          if (!box || box.querySelector("[data-tchilo-boost]")) return;

          var b = document.createElement("button");
          b.type = "button";
          b.className = "share-opt";
          b.setAttribute("data-tchilo-boost", "1");
          b.innerHTML =
            '<div class="so-icon" style="background:#c8f560;color:#0B0B0C;font-weight:900">⚡</div>' +
            "<div><b>Turbinar / Anunciar</b>" +
            '<div style="font-size:12px;color:var(--muted);font-weight:500">Impulsionar no feed</div></div>';
          b.onclick = function () {
            try {
              if (typeof closePostMenu === "function") closePostMenu();
            } catch (e3) {}
            openCreateFromPost(postId);
          };
          if (box.firstChild) box.insertBefore(b, box.firstChild);
          else box.appendChild(b);
        } catch (e) {}
      }, 40);
      return r;
    };
    window.openPostMenu.__adsBoost = true;
    return true;
  }

  function patchGoTo() {
    if (typeof window.goTo !== "function" || window.goTo.__adsUi) return;
    var orig = window.goTo;
    window.goTo = function (s) {
      var r = orig.apply(this, arguments);
      if (s === "settings" || s === "profile") {
        setTimeout(injectSettings, 50);
        setTimeout(injectSettings, 300);
      }
      return r;
    };
    window.goTo.__adsUi = true;
  }

  function boot() {
    ensureCSS();
    injectSettings();
    patchPostMenu();
    patchGoTo();
  }

  setInterval(function () {
    injectSettings();
    patchPostMenu();
  }, 800);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);
})();
