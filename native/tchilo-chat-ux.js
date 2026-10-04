/**
 * tchilo-Pop — Chat UX
 * - Mic ↔ Enviar ao escrever
 * - Botão + profissional
 * - GIF + Figurinhas dentro do +
 * - Remove ícones soltos de gif/sticker da barra
 * - Melhora feedback das chamadas
 */
(function () {
  "use strict";

  if (window.__tchiloChatUxV1) return;
  window.__tchiloChatUxV1 = true;

  var GIPHY_KEY = "dc6zaTOxFJmzC"; // chave pública legada (fallback)
  var STICKERS = [
    "😀","😂","🥰","😍","😎","😢","😡","👍","👎","🙏",
    "🔥","💯","🎉","❤️","💔","⭐","✨","👀","🤝","💪",
    "🥳","😴","🤔","😱","🤣","😘","🤗","👏","🙌","😇",
    "🤮","🥺","😏","😜","🤩","😌","🤓","😤","💤","🎊"
  ];

  function toast(msg) {
    try {
      if (typeof window.showToast === "function") window.showToast(msg);
      else console.log("[chat-ux]", msg);
    } catch (e) {}
  }

  function iconPlus() {
    return (
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>'
    );
  }
  function iconMic() {
    return (
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'
    );
  }
  function iconSend() {
    return (
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
    );
  }

  function injectStyles() {
    if (document.getElementById("tchiloChatUxStyles")) return;
    var css =
      ".chat-input-bar .chat-attach-btn{" +
      "width:40px;height:40px;border-radius:50%;border:2.5px solid var(--ink,#0B0B0C);" +
      "background:var(--paper,#fff);display:flex;align-items:center;justify-content:center;" +
      "padding:0;flex-shrink:0;cursor:pointer}" +
      ".chat-input-bar .chat-attach-btn svg{display:block}" +
      ".chat-input-bar .chat-send,.chat-input-bar .chat-mic-btn{" +
      "width:42px;height:42px;border-radius:50%;border:2.5px solid var(--ink,#0B0B0C);" +
      "display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;cursor:pointer}" +
      ".chat-input-bar .chat-send{background:var(--yellow,#FFE14D)}" +
      ".chat-input-bar .chat-mic-btn{background:var(--paper,#fff)}" +
      ".chat-input-bar .chat-send.hide-ux,.chat-input-bar .chat-mic-btn.hide-ux{display:none !important}" +
      ".chat-input-bar .chat-gif-btn,.chat-input-bar .chat-sticker-btn," +
      ".chat-input-bar [data-chat-gif],.chat-input-bar [data-chat-sticker]," +
      ".chat-input-bar .gif-btn,.chat-input-bar .sticker-btn{display:none !important}" +
      "#tchiloGifSheet{position:fixed;inset:0;z-index:1300;background:rgba(0,0,0,.45);display:none;align-items:flex-end}" +
      "#tchiloGifSheet.open{display:flex}" +
      "#tchiloGifSheet .gs-panel{width:100%;max-height:72%;background:var(--paper,#fff);border-top:3px solid var(--ink,#0B0B0C);" +
      "border-radius:18px 18px 0 0;display:flex;flex-direction:column;padding-bottom:env(safe-area-inset-bottom)}" +
      "#tchiloGifSheet .gs-head{display:flex;align-items:center;gap:10px;padding:14px 14px 8px}" +
      "#tchiloGifSheet .gs-head b{flex:1;font:800 16px Inter,sans-serif}" +
      "#tchiloGifSheet .gs-close{border:2px solid var(--ink);border-radius:12px;background:#fff;padding:6px 10px;font:800 12px Inter,sans-serif;cursor:pointer}" +
      "#tchiloGifSheet .gs-tabs{display:flex;gap:8px;padding:0 14px 8px}" +
      "#tchiloGifSheet .gs-tab{border:2px solid var(--ink);border-radius:999px;padding:6px 14px;font:800 12px Inter,sans-serif;background:#fff;cursor:pointer}" +
      "#tchiloGifSheet .gs-tab.active{background:var(--yellow,#FFE14D)}" +
      "#tchiloGifSheet .gs-search{margin:0 14px 10px;border:2.5px solid var(--ink);border-radius:14px;padding:10px 12px;font:600 14px Inter,sans-serif;width:auto;box-sizing:border-box}" +
      "#tchiloGifSheet .gs-grid{flex:1;overflow:auto;padding:8px 12px 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}" +
      "#tchiloGifSheet .gs-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;border:2px solid var(--ink);cursor:pointer;background:#eee}" +
      "#tchiloGifSheet .gs-stickers{flex:1;overflow:auto;padding:8px 12px 16px;display:grid;grid-template-columns:repeat(6,1fr);gap:8px}" +
      "#tchiloGifSheet .gs-stickers button{border:2px solid var(--ink);border-radius:14px;background:#fff;font-size:28px;padding:10px 0;cursor:pointer}" +
      "#tchiloGifSheet .gs-empty{padding:24px;text-align:center;color:var(--muted);font:600 13px Inter,sans-serif}";
    var st = document.createElement("style");
    st.id = "tchiloChatUxStyles";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function ensureBar() {
    var bar = document.querySelector("#chatScreen .chat-input-bar");
    if (!bar) return null;

    // + profissional
    var plus = document.getElementById("chatAttachBtn");
    if (plus && !plus.getAttribute("data-ux-plus")) {
      plus.setAttribute("data-ux-plus", "1");
      plus.innerHTML = iconPlus();
      plus.setAttribute("aria-label", "Anexar");
    }

    // esconder gif/sticker soltos
    bar.querySelectorAll(
      ".chat-gif-btn,.chat-sticker-btn,[data-chat-gif],[data-chat-sticker],.gif-btn,.sticker-btn"
    ).forEach(function (el) {
      el.style.display = "none";
    });

    // mic button
    var mic = document.getElementById("chatMicBtn");
    if (!mic) {
      mic = document.createElement("button");
      mic.type = "button";
      mic.id = "chatMicBtn";
      mic.className = "chat-mic-btn";
      mic.setAttribute("aria-label", "Gravar áudio");
      mic.innerHTML = iconMic();
      mic.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.startChatAudioRecord === "function") {
          window.startChatAudioRecord();
        } else {
          toast("Gravação indisponível");
        }
      };
      bar.appendChild(mic);
    }

    var send = bar.querySelector(".chat-send");
    if (send && !send.getAttribute("data-ux-send")) {
      send.setAttribute("data-ux-send", "1");
      send.innerHTML = iconSend();
    }

    var input = document.getElementById("chatInput");
    if (input && !input.__uxToggle) {
      input.__uxToggle = true;
      input.addEventListener("input", syncSendMic);
      input.addEventListener("keyup", syncSendMic);
      input.addEventListener("change", syncSendMic);
    }

    syncSendMic();
    return bar;
  }

  function syncSendMic() {
    var input = document.getElementById("chatInput");
    var send = document.querySelector("#chatScreen .chat-send");
    var mic = document.getElementById("chatMicBtn");
    var pending = window.__tchiloChatPending;
    var hasText = !!(input && String(input.value || "").trim());
    var showSend = hasText || !!pending;

    if (send) {
      if (showSend) send.classList.remove("hide-ux");
      else send.classList.add("hide-ux");
    }
    if (mic) {
      if (showSend) mic.classList.add("hide-ux");
      else mic.classList.remove("hide-ux");
    }
  }

  /* ---------- GIF / Stickers sheet ---------- */
  function ensureGifSheet() {
    if (document.getElementById("tchiloGifSheet")) return;
    var el = document.createElement("div");
    el.id = "tchiloGifSheet";
    el.innerHTML =
      '<div class="gs-panel">' +
      '<div class="gs-head"><b id="gsTitle">GIF</b>' +
      '<button type="button" class="gs-close" id="gsClose">Fechar</button></div>' +
      '<div class="gs-tabs">' +
      '<button type="button" class="gs-tab active" data-tab="gif">GIF</button>' +
      '<button type="button" class="gs-tab" data-tab="sticker">Figurinhas</button>' +
      "</div>" +
      '<input class="gs-search" id="gsSearch" placeholder="Pesquisar GIF…" />' +
      '<div class="gs-grid" id="gsGrid"></div>' +
      '<div class="gs-stickers" id="gsStickers" style="display:none"></div>' +
      "</div>";
    document.body.appendChild(el);

    el.addEventListener("click", function (e) {
      if (e.target === el) closeGifSheet();
    });
    document.getElementById("gsClose").onclick = closeGifSheet;

    el.querySelectorAll(".gs-tab").forEach(function (tab) {
      tab.onclick = function () {
        el.querySelectorAll(".gs-tab").forEach(function (t) {
          t.classList.remove("active");
        });
        tab.classList.add("active");
        var mode = tab.getAttribute("data-tab");
        if (mode === "sticker") {
          document.getElementById("gsTitle").textContent = "Figurinhas";
          document.getElementById("gsSearch").style.display = "none";
          document.getElementById("gsGrid").style.display = "none";
          document.getElementById("gsStickers").style.display = "grid";
          renderStickers();
        } else {
          document.getElementById("gsTitle").textContent = "GIF";
          document.getElementById("gsSearch").style.display = "";
          document.getElementById("gsGrid").style.display = "grid";
          document.getElementById("gsStickers").style.display = "none";
          searchGifs(document.getElementById("gsSearch").value || "trending");
        }
      };
    });

    var searchTimer = null;
    document.getElementById("gsSearch").addEventListener("input", function () {
      clearTimeout(searchTimer);
      var q = this.value;
      searchTimer = setTimeout(function () {
        searchGifs(q || "trending");
      }, 350);
    });
  }

  function openGifSheet(mode) {
    ensureGifSheet();
    var el = document.getElementById("tchiloGifSheet");
    el.classList.add("open");
    var tab = el.querySelector('.gs-tab[data-tab="' + (mode || "gif") + '"]');
    if (tab) tab.click();
    else searchGifs("trending");
  }

  function closeGifSheet() {
    var el = document.getElementById("tchiloGifSheet");
    if (el) el.classList.remove("open");
  }

  function renderStickers() {
    var box = document.getElementById("gsStickers");
    if (!box) return;
    box.innerHTML = STICKERS.map(function (s) {
      return (
        '<button type="button" data-sticker="' +
        s +
        '">' +
        s +
        "</button>"
      );
    }).join("");
    box.querySelectorAll("button").forEach(function (btn) {
      btn.onclick = function () {
        sendSticker(btn.getAttribute("data-sticker"));
        closeGifSheet();
      };
    });
  }

  async function searchGifs(query) {
    var grid = document.getElementById("gsGrid");
    if (!grid) return;
    grid.innerHTML =
      '<div class="gs-empty" style="grid-column:1/-1">A carregar…</div>';

    var q = String(query || "trending").trim() || "trending";
    var urls = [];

    // 1) Giphy
    try {
      var endpoint =
        q === "trending"
          ? "https://api.giphy.com/v1/gifs/trending?api_key=" +
            GIPHY_KEY +
            "&limit=24&rating=pg-13"
          : "https://api.giphy.com/v1/gifs/search?api_key=" +
            GIPHY_KEY +
            "&q=" +
            encodeURIComponent(q) +
            "&limit=24&rating=pg-13";
      var res = await fetch(endpoint);
      var data = await res.json();
      if (data && data.data && data.data.length) {
        urls = data.data
          .map(function (g) {
            return (
              (g.images &&
                g.images.fixed_width &&
                g.images.fixed_width.url) ||
              (g.images && g.images.downsized && g.images.downsized.url) ||
              ""
            );
          })
          .filter(Boolean);
      }
    } catch (e) {
      console.warn("[gif] giphy", e);
    }

    // 2) Fallback: Tenor public (sem key às vezes falha)
    if (!urls.length) {
      try {
        var tUrl =
          "https://g.tenor.com/v1/search?q=" +
          encodeURIComponent(q === "trending" ? "hello" : q) +
          "&key=LIVDSRZULELA&limit=24&media_filter=minimal";
        var tRes = await fetch(tUrl);
        var tData = await tRes.json();
        if (tData && tData.results) {
          urls = tData.results
            .map(function (r) {
              var m = r.media && r.media[0];
              return (
                (m && m.tinygif && m.tinygif.url) ||
                (m && m.gif && m.gif.url) ||
                ""
              );
            })
            .filter(Boolean);
        }
      } catch (e2) {
        console.warn("[gif] tenor", e2);
      }
    }

    if (!urls.length) {
      grid.innerHTML =
        '<div class="gs-empty" style="grid-column:1/-1">Sem GIFs. Tenta outra pesquisa.</div>';
      return;
    }

    grid.innerHTML = urls
      .map(function (u) {
        return (
          '<img src="' +
          String(u).replace(/"/g, """) +
          '" alt="gif" loading="lazy" data-gif="' +
          String(u).replace(/"/g, """) +
          '">' 
        );
      })
      .join("");

    grid.querySelectorAll("img").forEach(function (img) {
      img.onclick = function () {
        sendGif(img.getAttribute("data-gif"));
        closeGifSheet();
      };
    });
  }

  function sendSticker(emoji) {
    var input = document.getElementById("chatInput");
    if (input) input.value = emoji;
    syncSendMic();
    if (typeof window.sendChat === "function") window.sendChat();
  }

  async function sendGif(url) {
    if (!url || !window.currentChatUser) {
      toast("Abre uma conversa primeiro");
      return;
    }
    try {
      // enviar como mensagem de imagem (URL externa)
      var chats =
        typeof getChats === "function" ? getChats() : {};
      if (!chats[currentChatUser]) chats[currentChatUser] = [];
      var msg = {
        from: "me",
        text: "",
        createdAt: Date.now(),
        type: "image",
        mediaUrl: url,
        mediaType: "image/gif",
        _synced: false,
      };
      chats[currentChatUser].push(msg);
      if (typeof saveChats === "function") saveChats(chats);
      else localStorage.setItem("tchilo_chats", JSON.stringify(chats));
      if (typeof renderChatBody === "function") renderChatBody();
      toast("GIF enviado");
    } catch (e) {
      toast("Não foi possível enviar o GIF");
    }
  }

  /* ---------- Attach menu: + com GIF e Figurinhas ---------- */
  function patchAttachMenu() {
    if (typeof window.openChatAttachMenu !== "function") return;
    if (window.openChatAttachMenu.__uxPatched) return;
    var orig = window.openChatAttachMenu;
    window.openChatAttachMenu = function () {
      if (!window.currentChatUser) {
        toast("Abre uma conversa primeiro");
        return;
      }

      // construir menu estendido
      var attachIcons = {
        photo:
          '<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="4" fill="#54c99d"/><circle cx="30" cy="20" r="4" fill="#ffd45c"/><path d="M10 32l8-10 6 7 5-5 9 8H10z" fill="#2e9b70"/></svg>',
        video:
          '<svg viewBox="0 0 48 48"><rect x="6" y="12" width="26" height="24" rx="3" fill="#6b5cff"/><path d="M34 18l10-6v24l-10-6z" fill="#9b8cff"/></svg>',
        file:
          '<svg viewBox="0 0 48 48"><path d="M12 6h18l8 8v28H12z" fill="#ffe14d"/><path d="M30 6v10h8" fill="#f2f2f2"/></svg>',
        camera:
          '<svg viewBox="0 0 48 48"><rect x="6" y="14" width="36" height="24" rx="4" fill="#4e9ac7"/><circle cx="24" cy="26" r="8" fill="#9ed7ff"/><circle cx="24" cy="26" r="4" fill="#222"/></svg>',
        audio:
          '<svg viewBox="0 0 48 48"><rect x="18" y="8" width="12" height="22" rx="6" fill="#ff4b75"/><path d="M12 22a12 12 0 0 0 24 0" fill="none" stroke="#ff4b75" stroke-width="3"/><path d="M24 34v8M18 42h12" stroke="#ff4b75" stroke-width="3"/></svg>',
        loc:
          '<svg viewBox="0 0 48 48"><path d="M24 6c-8 0-14 6-14 14 0 10 14 22 14 22s14-12 14-22c0-8-6-14-14-14z" fill="#e53f3f"/><circle cx="24" cy="20" r="6" fill="#fff"/></svg>',
        gif:
          '<svg viewBox="0 0 48 48"><rect x="6" y="10" width="36" height="28" rx="6" fill="#111"/><text x="24" y="30" text-anchor="middle" font-size="14" font-weight="900" fill="#7CFFB2" font-family="Inter,sans-serif">GIF</text></svg>',
        sticker:
          '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#FFE14D" stroke="#0B0B0C" stroke-width="2"/><circle cx="18" cy="20" r="2" fill="#0B0B0C"/><circle cx="30" cy="20" r="2" fill="#0B0B0C"/><path d="M16 28c2 4 14 4 16 0" fill="none" stroke="#0B0B0C" stroke-width="2" stroke-linecap="round"/></svg>',
      };

      var opts = [
        {
          id: "photo",
          label: "Fotos",
          icon: attachIcons.photo,
          bg: "var(--mint)",
          action: "document.getElementById('chatFilePhotos').click()",
        },
        {
          id: "video",
          label: "Vídeos",
          icon: attachIcons.video,
          bg: "var(--violet)",
          action: "document.getElementById('chatFileVideos').click()",
        },
        {
          id: "camera",
          label: "Câmera",
          icon: attachIcons.camera,
          bg: "#9ED7FF",
          action: "document.getElementById('chatFileCamera').click()",
        },
        {
          id: "gif",
          label: "GIF",
          icon: attachIcons.gif,
          bg: "#111",
          action: "window.tchiloOpenGifPicker && window.tchiloOpenGifPicker('gif')",
        },
        {
          id: "sticker",
          label: "Figurinhas",
          icon: attachIcons.sticker,
          bg: "var(--yellow)",
          action: "window.tchiloOpenGifPicker && window.tchiloOpenGifPicker('sticker')",
        },
        {
          id: "file",
          label: "Arquivos",
          icon: attachIcons.file,
          bg: "var(--yellow)",
          action: "document.getElementById('chatFileDocs').click()",
        },
        {
          id: "audio",
          label: "Áudio",
          icon: attachIcons.audio,
          bg: "var(--pink)",
          action: "startChatAudioRecord()",
        },
        {
          id: "loc",
          label: "Localização",
          icon: attachIcons.loc,
          bg: "#FFB36B",
          action: "sendChatLocation()",
        },
      ];

      var body =
        '<div class="attach-sheet-grid">' +
        opts
          .map(function (o) {
            return (
              '<button type="button" class="attach-opt" onclick="tchiloModalClose(true);' +
              o.action +
              '">' +
              '<div class="ao-icon" style="background:' +
              o.bg +
              '">' +
              o.icon +
              "</div>" +
              o.label +
              "</button>"
            );
          })
          .join("") +
        "</div>";

      if (typeof tchiloModalOpen === "function") {
        tchiloModalOpen({
          title: "Anexar",
          message: "Escolhe o tipo de anexo",
          bodyHtml: body,
          cancelValue: null,
          buttons: [{ label: "Fechar", value: null }],
        });
      } else {
        orig.apply(this, arguments);
      }
    };
    window.openChatAttachMenu.__uxPatched = true;
  }

  /* ---------- Calls: melhor feedback ---------- */
  function patchCalls() {
    // re-bind botões se existirem
    var audioBtn = document.getElementById("chatAudioCallBtn");
    var videoBtn = document.getElementById("chatVideoCallBtn");

    function go(type) {
      return function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!window.currentChatUser) {
          toast("Abre uma conversa primeiro");
          return;
        }
        if (typeof window.tchiloStartCall === "function") {
          toast(type === "audio" ? "A iniciar chamada de voz…" : "A iniciar videochamada…");
          window.tchiloStartCall(type).catch(function (err) {
            console.error("[call]", err);
            toast("Erro na chamada: " + ((err && err.message) || err));
          });
        } else {
          toast("Chamadas ainda a carregar… tenta de novo");
        }
      };
    }

    if (audioBtn) audioBtn.onclick = go("audio");
    if (videoBtn) videoBtn.onclick = go("video");
  }

  window.tchiloOpenGifPicker = openGifSheet;

  function boot() {
    injectStyles();
    ensureBar();
    ensureGifSheet();
    patchAttachMenu();
    patchCalls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  setInterval(function () {
    ensureBar();
    patchAttachMenu();
    patchCalls();
    syncSendMic();
  }, 1200);

  // quando anexos mudam
  var _setPending = window.setChatPending;
  if (typeof _setPending === "function") {
    window.setChatPending = function () {
      var r = _setPending.apply(this, arguments);
      setTimeout(syncSendMic, 30);
      return r;
    };
  }
  var _clear = window.clearChatAttachment;
  if (typeof _clear === "function") {
    window.clearChatAttachment = function () {
      var r = _clear.apply(this, arguments);
      setTimeout(syncSendMic, 30);
      return r;
    };
  }
})();
