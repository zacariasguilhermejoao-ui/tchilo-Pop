/**
 * tchilo-Pop — UI anúncios: só posts próprios + botão no header + abrir criar
 */
(function () {
  "use strict";

  function sessionUser() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s) return s;
      }
      if (window.session) return window.session;
      if (window.tchiloSession) return window.tchiloSession;
    } catch (e) {}
    return null;
  }

  function myUsername() {
    var s = sessionUser();
    return s && s.username ? String(s.username) : "";
  }

  function myId() {
    var s = sessionUser();
    return s && (s.id || s.user_id) ? String(s.id || s.user_id) : "";
  }

  function isOwnPost(postId) {
    try {
      if (typeof getPosts !== "function") return false;
      var posts = getPosts() || [];
      var p = posts.find(function (x) {
        return x && String(x.id) === String(postId);
      });
      if (!p) return false;
      var me = myUsername();
      var uid = myId();
      if (me && p.username && String(p.username) === me) return true;
      if (uid && (p.user_id === uid || p.uid === uid || p.owner_id === uid)) return true;
      if (p.isMine === true) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  function ensureCSS() {
    if (document.getElementById("tchiloAdsUiCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsUiCSS";
    st.textContent =
      "#tchiloAdsMgrBtn{display:flex!important;align-items:center;gap:12px;width:100%;border:0;background:none;padding:14px 18px;text-align:left;font:700 15px Inter,system-ui,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)}" +
      "#tchiloAdsMgrBtn .si-icon{width:36px;height:36px;border-radius:10px;background:#c8f560;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0}" +
      "#tchiloAdsMgrBtn .chev{margin-left:auto;opacity:.5;font-size:18px}" +
      ".post-boost-btn{flex-shrink:0;margin-left:6px;padding:6px 10px;border:2px solid var(--ink,#0B0B0C);border-radius:999px;background:#c8f560;font:800 11px Inter,system-ui,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;line-height:1;white-space:nowrap}" +
      ".post-boost-btn:active{transform:scale(.96)}" +
      ".post-head{align-items:center}";
    document.head.appendChild(st);
  }

  function ensureAdsScript(cb) {
    if (typeof window.tchiloOpenAdCreate === "function") {
      cb && cb();
      return;
    }
    if (!document.querySelector("script[data-tchilo-ads]")) {
      var s = document.createElement("script");
      s.src = "native/tchilo-ads.js?v=20260921boost1";
      s.defer = true;
      s.setAttribute("data-tchilo-ads", "1");
      document.head.appendChild(s);
    }
    var n = 0;
    var t = setInterval(function () {
      if (typeof window.tchiloOpenAdCreate === "function") {
        clearInterval(t);
        cb && cb();
      } else if (++n > 40) {
        clearInterval(t);
        alert("Não foi possível abrir anúncios. Atualiza a página.");
      }
    }, 150);
  }

  function openMgr() {
    ensureAdsScript(function () {
      if (typeof window.tchiloOpenAdsManager === "function") window.tchiloOpenAdsManager();
      else if (typeof window.tchiloOpenAdCreate === "function") window.tchiloOpenAdCreate();
    });
  }

  function openCreateFromPost(postId) {
    if (postId && !isOwnPost(postId)) {
      if (typeof showToast === "function") showToast("Só podes anunciar as tuas publicações");
      else alert("Só podes anunciar as tuas publicações");
      return;
    }
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
            body: p.caption || p.text || p.body || "",
            media_url: mediaUrl,
            media_type: mediaType
          };
        }
      }
    } catch (e) {}

    ensureAdsScript(function () {
      // aplicar draft no módulo de ads se existir
      try {
        if (window.__tchiloBoostDraft && typeof window.tchiloApplyAdDraft === "function") {
          window.tchiloApplyAdDraft(window.__tchiloBoostDraft);
        }
      } catch (e2) {}
      if (typeof window.tchiloOpenAdCreate === "function") {
        window.tchiloOpenAdCreate();
      } else {
        alert("A carregar… tenta outra vez.");
      }
    });
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

  /** Botão Turbinar no header do post — só posts próprios, no lugar do Seguir */
  function injectBoostButtons() {
    ensureCSS();
    var me = myUsername();
    if (!me) return;
    var feed = document.getElementById("feedList");
    if (!feed) return;

    feed.querySelectorAll(".post").forEach(function (post) {
      if (post.querySelector(".post-boost-btn")) return;
      var id = post.getAttribute("data-id");
      if (!id || !isOwnPost(id)) return;

      var head = post.querySelector(".post-head");
      if (!head) return;

      // não meter em posts de outros (double-check via @ no who)
      var whoUser = post.querySelector(".post-user-tap, .post-user");
      var dataUser = whoUser && whoUser.getAttribute("data-user");
      if (dataUser && String(dataUser) !== me) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "post-boost-btn";
      btn.textContent = "Turbinar";
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openCreateFromPost(id);
      };

      // ao lado do menu ⋯ — no slot onde estaria o Seguir (antes do menu)
      var menu = head.querySelector(".post-menu-btn");
      if (menu) head.insertBefore(btn, menu);
      else head.appendChild(btn);
    });
  }

  function patchPostMenu() {
    if (typeof window.openPostMenu !== "function") return false;
    if (window.openPostMenu.__adsBoost2) return true;
    var orig = window.openPostMenu;
    window.openPostMenu = function (postId) {
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        try {
          var box = document.getElementById("postMenuOptions");
          if (!box) return;
          var old = box.querySelector("[data-tchilo-boost]");
          if (old) old.remove();

          // SÓ posts próprios
          if (!isOwnPost(postId)) return;

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
    window.openPostMenu.__adsBoost2 = true;
    return true;
  }

  function patchRenderFeed() {
    if (typeof window.renderFeed !== "function" || window.renderFeed.__adsBoostBtn) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var r = orig.apply(this, arguments);
      setTimeout(injectBoostButtons, 50);
      setTimeout(injectBoostButtons, 300);
      return r;
    };
    window.renderFeed.__adsBoostBtn = true;
  }

  function patchGoTo() {
    if (typeof window.goTo !== "function" || window.goTo.__adsUi2) return;
    var orig = window.goTo;
    window.goTo = function (s) {
      var r = orig.apply(this, arguments);
      if (s === "settings") setTimeout(injectSettings, 80);
      if (s === "feed") setTimeout(injectBoostButtons, 100);
      return r;
    };
    window.goTo.__adsUi2 = true;
  }

  function boot() {
    ensureCSS();
    injectSettings();
    injectBoostButtons();
    patchPostMenu();
    patchRenderFeed();
    patchGoTo();
  }

  setInterval(function () {
    injectSettings();
    injectBoostButtons();
    patchPostMenu();
    patchRenderFeed();
  }, 1200);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);

  window.tchiloBoostPost = openCreateFromPost;
})();
