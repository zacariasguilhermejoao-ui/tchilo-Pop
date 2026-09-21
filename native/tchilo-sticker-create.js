/**
 * tchilo-Pop — Criar figurinhas (foto/vídeo) nas conversas
 * Apenas contas Premium.
 */
(function () {
  "use strict";

  var STORE_KEY = "tchilo_custom_stickers_v1";
  var MAX_STICKERS = 40;

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
      else if (window.__tchiloRealShowToast) window.__tchiloRealShowToast(msg);
      else alert(msg);
    } catch (e) {
      try {
        alert(msg);
      } catch (e2) {}
    }
  }

  function userId() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && (s.id || s.user_id)) return s.id || s.user_id;
      }
      if (window.session && window.session.user) return window.session.user.id;
      if (window.session && window.session.id) return window.session.id;
    } catch (e) {}
    return "anon";
  }

  function isPremium() {
    try {
      if (typeof window.tchiloIsPremium === "function") return !!window.tchiloIsPremium();
      if (window.__tchiloIsPremium === true) return true;
      var uid = userId();
      if (uid && localStorage.getItem("tchilo_premium_" + uid) === "1") return true;
      if (localStorage.getItem("tchilo_premium") === "1") return true;
      // perfil
      if (window.session && window.session.is_premium) return true;
      if (window.session && window.session.user && window.session.user.is_premium) return true;
    } catch (e) {}
    return false;
  }

  function storageKey() {
    return STORE_KEY + "_" + userId();
  }

  function loadMine() {
    try {
      var raw = localStorage.getItem(storageKey());
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveMine(list) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(list.slice(0, MAX_STICKERS)));
    } catch (e) {
      toast("Não foi possível guardar a figurinha");
    }
    window.__tchiloCustomStickers = loadMine();
  }

  function ensureCSS() {
    if (document.getElementById("tchiloStickerCreateCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloStickerCreateCSS";
    st.textContent =
      "#tchiloStickerCreate{display:none;position:fixed;inset:0;z-index:4200;background:rgba(0,0,0,.55);align-items:flex-end;justify-content:center}" +
      "#tchiloStickerCreate.open{display:flex}" +
      "#tchiloStickerCreate .sc-panel{width:100%;max-width:480px;background:var(--paper,#f7f6f2);border-radius:20px 20px 0 0;border:3px solid var(--ink,#0B0B0C);border-bottom:none;max-height:88vh;display:flex;flex-direction:column;color:var(--ink,#0B0B0C)}" +
      "#tchiloStickerCreate .sc-head{display:flex;align-items:center;gap:10px;padding:14px;border-bottom:2px solid var(--ink,#0B0B0C)}" +
      "#tchiloStickerCreate .sc-head h2{flex:1;margin:0;font:800 16px Inter,system-ui,sans-serif}" +
      "#tchiloStickerCreate .sc-close{width:40px;height:40px;border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#ffe566;font:900 18px Inter,sans-serif}" +
      "#tchiloStickerCreate .sc-body{padding:14px;overflow:auto;padding-bottom:calc(18px + env(safe-area-inset-bottom))}" +
      "#tchiloStickerCreate .sc-preview{width:100%;aspect-ratio:1;max-height:280px;border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:12px}" +
      "#tchiloStickerCreate .sc-preview img,#tchiloStickerCreate .sc-preview video{max-width:100%;max-height:100%;object-fit:contain}" +
      "#tchiloStickerCreate .sc-actions{display:flex;gap:8px;flex-wrap:wrap}" +
      "#tchiloStickerCreate .sc-btn{flex:1;min-width:120px;padding:12px;border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;font:800 13px Inter,sans-serif;background:#fff;cursor:pointer}" +
      "#tchiloStickerCreate .sc-btn.primary{background:#c8f560}" +
      "#tchiloStickerCreate .sc-btn:disabled{opacity:.45}" +
      "#tchiloStickerCreate .sc-hint{font:600 12px Inter,sans-serif;opacity:.7;margin:8px 0 0}" +
      "#tchiloStickerCreate .sc-lock{padding:16px;border:2.5px dashed var(--ink,#0B0B0C);border-radius:14px;background:#fff;text-align:center}" +
      "#tchiloStickerCreate .sc-lock b{display:block;font:900 15px Inter,sans-serif;margin-bottom:8px}" +
      ".sc-create-trigger{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#c8f560;flex-shrink:0;cursor:pointer;padding:0}" +
      ".sc-create-trigger svg{width:18px;height:18px}" +
      ".chat-input-bar .sc-create-trigger{margin:0 2px}";
    document.head.appendChild(st);
  }

  var state = { file: null, url: null, isVideo: false };

  function ensureUI() {
    ensureCSS();
    if (document.getElementById("tchiloStickerCreate")) return;
    var el = document.createElement("div");
    el.id = "tchiloStickerCreate";
    el.innerHTML =
      '<div class="sc-panel">' +
      '<div class="sc-head"><h2>Criar figurinha</h2><button type="button" class="sc-close" id="scClose" aria-label="Fechar">×</button></div>' +
      '<div class="sc-body" id="scBody"></div>' +
      "</div>";
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target === el) close();
    });
    document.getElementById("scClose").onclick = close;
  }

  function close() {
    var el = document.getElementById("tchiloStickerCreate");
    if (el) el.classList.remove("open");
    try {
      if (state.url) URL.revokeObjectURL(state.url);
    } catch (e) {}
    state = { file: null, url: null, isVideo: false };
  }

  function openPremiumGate() {
    ensureUI();
    var body = document.getElementById("scBody");
    body.innerHTML =
      '<div class="sc-lock">' +
      "<b>Só no Tchilo Premium</b>" +
      "<p style=\"margin:0 0 14px;font:600 13px Inter,sans-serif;opacity:.8\">Cria figurinhas a partir de fotos ou vídeos e usa-as nas conversas.</p>" +
      '<button type="button" class="sc-btn primary" id="scGoPremium">Obter Premium</button>' +
      "</div>";
    document.getElementById("tchiloStickerCreate").classList.add("open");
    document.getElementById("scGoPremium").onclick = function () {
      close();
      try {
        if (typeof window.tchiloOpenPremium === "function") window.tchiloOpenPremium();
        else if (typeof window.openPremium === "function") window.openPremium();
        else if (typeof goTo === "function") goTo("settings");
        else toast("Abre Definições → Tchilo Premium");
      } catch (e) {
        toast("Abre Definições → Tchilo Premium");
      }
    };
  }

  function openCreator() {
    if (!isPremium()) {
      openPremiumGate();
      return;
    }
    ensureUI();
    state = { file: null, url: null, isVideo: false };
    renderEditor();
    document.getElementById("tchiloStickerCreate").classList.add("open");
  }

  function renderEditor() {
    var body = document.getElementById("scBody");
    var preview =
      '<div class="sc-preview" id="scPreview">' +
      (state.url
        ? state.isVideo
          ? '<video src="' + state.url + '" muted autoplay loop playsinline></video>'
          : '<img src="' + state.url + '" alt=""/>'
        : '<span style="color:#fff;font:700 13px Inter,sans-serif;opacity:.7">Escolhe foto ou vídeo</span>') +
      "</div>";

    body.innerHTML =
      preview +
      '<div class="sc-actions">' +
      '<button type="button" class="sc-btn" id="scPickPhoto">Foto</button>' +
      '<button type="button" class="sc-btn" id="scPickVideo">Vídeo</button>' +
      '<button type="button" class="sc-btn primary" id="scSave" ' +
      (state.file ? "" : "disabled") +
      ">Guardar figurinha</button>" +
      "</div>" +
      '<p class="sc-hint">A figurinha fica quadrada e aparece no teu pack de figurinhas nas conversas.</p>' +
      '<input type="file" id="scFilePhoto" accept="image/*" style="display:none"/>' +
      '<input type="file" id="scFileVideo" accept="video/*" style="display:none"/>';

    document.getElementById("scPickPhoto").onclick = function () {
      document.getElementById("scFilePhoto").click();
    };
    document.getElementById("scPickVideo").onclick = function () {
      document.getElementById("scFileVideo").click();
    };
    document.getElementById("scFilePhoto").onchange = function (e) {
      onPicked(e, false);
    };
    document.getElementById("scFileVideo").onchange = function (e) {
      onPicked(e, true);
    };
    document.getElementById("scSave").onclick = function () {
      saveSticker();
    };
  }

  function onPicked(e, isVideo) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) {
      toast("Ficheiro demasiado grande (máx. 12 MB)");
      return;
    }
    try {
      if (state.url) URL.revokeObjectURL(state.url);
    } catch (err) {}
    state.file = f;
    state.isVideo = !!isVideo;
    state.url = URL.createObjectURL(f);
    renderEditor();
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function videoFrameToCanvas(url) {
    return new Promise(function (resolve, reject) {
      var v = document.createElement("video");
      v.muted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.onloadeddata = function () {
        try {
          v.currentTime = Math.min(0.2, (v.duration || 1) * 0.1);
        } catch (e) {}
      };
      v.onseeked = function () {
        try {
          var size = 512;
          var c = document.createElement("canvas");
          c.width = size;
          c.height = size;
          var ctx = c.getContext("2d");
          var vw = v.videoWidth || size;
          var vh = v.videoHeight || size;
          var side = Math.min(vw, vh);
          var sx = (vw - side) / 2;
          var sy = (vh - side) / 2;
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(v, sx, sy, side, side, 0, 0, size, size);
          resolve(c);
        } catch (err) {
          reject(err);
        }
      };
      v.onerror = reject;
      v.src = url;
    });
  }

  async function toStickerDataUrl() {
    var size = 512;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    if (state.isVideo) {
      var vc = await videoFrameToCanvas(state.url);
      ctx.drawImage(vc, 0, 0);
    } else {
      var img = await loadImage(state.url);
      var side = Math.min(img.width, img.height);
      var sx = (img.width - side) / 2;
      var sy = (img.height - side) / 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    }

    // canto arredondado tipo figurinha
    try {
      var rounded = document.createElement("canvas");
      rounded.width = size;
      rounded.height = size;
      var rctx = rounded.getContext("2d");
      var r = 64;
      rctx.beginPath();
      rctx.moveTo(r, 0);
      rctx.arcTo(size, 0, size, size, r);
      rctx.arcTo(size, size, 0, size, r);
      rctx.arcTo(0, size, 0, 0, r);
      rctx.arcTo(0, 0, size, 0, r);
      rctx.closePath();
      rctx.clip();
      rctx.drawImage(canvas, 0, 0);
      return rounded.toDataURL("image/png");
    } catch (e) {
      return canvas.toDataURL("image/png");
    }
  }

  async function saveSticker() {
    if (!isPremium()) {
      openPremiumGate();
      return;
    }
    if (!state.file) {
      toast("Escolhe uma foto ou vídeo");
      return;
    }
    var btn = document.getElementById("scSave");
    if (btn) btn.disabled = true;
    try {
      var dataUrl = await toStickerDataUrl();
      var list = loadMine();
      var item = {
        id: "cs_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        label: "Minha figurinha",
        url: dataUrl,
        createdAt: Date.now()
      };
      list.unshift(item);
      saveMine(list);
      toast("Figurinha criada");
      close();

      // abrir pack de figurinhas se existir
      try {
        if (typeof window.tchiloOpenStickers === "function") {
          window.tchiloOpenStickers("chat");
        }
      } catch (e2) {}

      // notificar sheet de stickers para refrescar
      try {
        window.dispatchEvent(new CustomEvent("tchilo-stickers-updated"));
      } catch (e3) {}
    } catch (e) {
      console.warn(e);
      toast("Erro ao criar figurinha");
      if (btn) btn.disabled = false;
    }
  }

  function injectChatButton() {
    ensureCSS();
    var bar = document.querySelector(".chat-input-bar");
    if (!bar || bar.querySelector(".sc-create-trigger")) return;
    var input = document.getElementById("chatInput");
    if (!input) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sc-create-trigger";
    b.setAttribute("aria-label", "Criar figurinha");
    b.title = "Criar figurinha";
    b.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/></svg>';
    b.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCreator();
    };
    // depois do botão de stickers se existir, senão antes do input
    var sg = bar.querySelector(".sg-trigger");
    if (sg && sg.nextSibling) bar.insertBefore(b, sg.nextSibling);
    else bar.insertBefore(b, input);
  }

  // expor lista para o módulo de stickers
  window.tchiloGetCustomStickers = function () {
    return loadMine();
  };
  window.tchiloOpenStickerCreate = openCreator;

  function boot() {
    window.__tchiloCustomStickers = loadMine();
    injectChatButton();
  }

  setInterval(injectChatButton, 1200);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
})();
