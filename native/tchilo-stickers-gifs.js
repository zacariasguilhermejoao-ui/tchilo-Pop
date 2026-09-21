/**
 * tchilo-Pop — Figurinhas e GIFs (100% grátis)
 * Sem chave, sem conta, sem pagamento.
 * Figurinhas: SVG próprios | GIFs: pack gratuito filtrável
 */
(function () {
  "use strict";

  var context = { target: null };

  function svgUri(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* Figurinhas SVG (sem emoji) */
  var STICKERS = [
    { id: "heart", label: "Coração", tags: "coracao amor", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#FFE0EC"/><path d="M64 98S28 74 28 50c0-14 10-24 24-24 8 0 14 4 12 12C66 30 72 26 80 26c14 0 24 10 24 24 0 24-36 48-40 48z" fill="#FF4D8D"/></svg>') },
    { id: "fire", label: "Fogo", tags: "fogo hot", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#FFE8D6"/><path d="M64 20c8 18-4 28-4 42 0 8 6 14 14 14 12 0 22-12 22-28 18 14 20 34 20 46 0 22-18 34-52 34S12 94 12 72c0-20 14-36 28-46-2 12 6 22 14 22 6 0 10-6 10-14 0-10-4-20 0-34z" fill="#FF6B2C"/></svg>') },
    { id: "star", label: "Estrela", tags: "estrela", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#FFF6C8"/><path d="M64 18l12 34h36L84 74l12 36-32-22-32 22 12-36L16 52h36z" fill="#F5C400"/></svg>') },
    { id: "like", label: "Gosto", tags: "gosto like", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#E4F0FF"/><path d="M48 56V98H28V56h20zm8 0h36c6 0 12 6 12 14v6c0 4-1 8-4 10l-8 24c-2 6-8 10-14 10H56V56z" fill="#3B82F6"/></svg>') },
    { id: "clap", label: "Aplauso", tags: "aplauso", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#F3E8FF"/><path d="M40 70l12-28c2-6 10-8 14-4l4 6 8-18c2-6 10-8 14-2l18 28c4 6 2 14-4 18L78 98H48c-8 0-14-6-16-14l-2-8c-2-4 0-6 2-6h8z" fill="#A855F7"/></svg>') },
    { id: "wow", label: "Surpresa", tags: "surpresa wow", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#E8FFF3"/><circle cx="64" cy="64" r="36" fill="#22C55E"/><circle cx="52" cy="56" r="6" fill="#fff"/><circle cx="76" cy="56" r="6" fill="#fff"/><ellipse cx="64" cy="78" rx="12" ry="14" fill="#fff"/></svg>') },
    { id: "sad", label: "Triste", tags: "triste", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#E8F4FF"/><circle cx="64" cy="64" r="36" fill="#60A5FA"/><circle cx="52" cy="56" r="5" fill="#0B0B0C"/><circle cx="76" cy="56" r="5" fill="#0B0B0C"/><path d="M48 84c8-10 24-10 32 0" fill="none" stroke="#0B0B0C" stroke-width="5" stroke-linecap="round"/></svg>') },
    { id: "laugh", label: "Riso", tags: "riso rir", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#FFF7D6"/><circle cx="64" cy="64" r="36" fill="#FBBF24"/><path d="M48 54c4-6 12-6 16 0M64 54c4-6 12-6 16 0" fill="none" stroke="#0B0B0C" stroke-width="4" stroke-linecap="round"/><path d="M44 70c6 16 34 16 40 0" fill="#0B0B0C"/></svg>') },
    { id: "party", label: "Festa", tags: "festa", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#FFE4F1"/><path d="M36 96l56-56 12 12-56 56-16-4 4-8z" fill="#EC4899"/><circle cx="88" cy="36" r="6" fill="#F59E0B"/><circle cx="104" cy="52" r="5" fill="#3B82F6"/><circle cx="72" cy="28" r="4" fill="#22C55E"/></svg>') },
    { id: "ok", label: "OK", tags: "ok certo", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#E7F9ED"/><circle cx="64" cy="64" r="34" fill="#16A34A"/><path d="M42 66l14 14 30-32" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>') },
    { id: "music", label: "Música", tags: "musica", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#EDE9FE"/><path d="M52 88V44l40-8v44" fill="none" stroke="#7C3AED" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="90" r="12" fill="#7C3AED"/><circle cx="84" cy="82" r="12" fill="#7C3AED"/></svg>') },
    { id: "tchilo", label: "Tchilo", tags: "tchilo", url: svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#C8F560"/><text x="64" y="76" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="36" fill="#0B0B0C">T</text></svg>') }
  ];

  /* GIFs animados grátis (SVG animado — funciona offline, zero API) */
  function animGif(id, bg, draw) {
    return svgUri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
        '<rect width="200" height="200" rx="24" fill="' + bg + '"/>' +
        draw +
      "</svg>"
    );
  }

  var FREE_GIFS = [
    {
      id: "pulse-heart",
      label: "Coração a bater",
      tags: "coracao amor love heart",
      url: animGif(
        "h",
        "#FFE0EC",
        '<path d="M100 160S40 120 40 80c0-24 18-40 40-40 14 0 24 8 20 20 6-12 16-20 30-20 22 0 40 16 40 40 0 40-60 80-70 80z" fill="#FF4D8D"><animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="0.8s" repeatCount="indefinite" additive="sum"/><animate attributeName="opacity" values="1;0.85;1" dur="0.8s" repeatCount="indefinite"/></path>'
      )
    },
    {
      id: "spin-star",
      label: "Estrela",
      tags: "estrela star",
      url: animGif(
        "s",
        "#FFF6C8",
        '<g transform="translate(100 100)"><path d="M0-60 L14-18 H58 L22 8 L36 52 L0 28 L-36 52 L-22 8 L-58-18 H-14 Z" fill="#F5C400"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/></path></g>'
      )
    },
    {
      id: "bounce-ok",
      label: "OK",
      tags: "ok certo yes",
      url: animGif(
        "o",
        "#E7F9ED",
        '<circle cx="100" cy="100" r="54" fill="#16A34A"/><path d="M70 102l20 20 40-44" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="stroke-dasharray" values="0 120;120 0" dur="1.2s" repeatCount="indefinite"/></path>'
      )
    },
    {
      id: "wave-hi",
      label: "Olá",
      tags: "ola hi wave ola",
      url: animGif(
        "w",
        "#E4F0FF",
        '<circle cx="100" cy="70" r="28" fill="#FBBF24"/><rect x="78" y="98" width="44" height="55" rx="18" fill="#3B82F6"/><g transform="translate(130 90)"><rect x="0" y="0" width="18" height="40" rx="9" fill="#FBBF24"><animateTransform attributeName="transform" type="rotate" values="-25;25;-25" dur="0.6s" repeatCount="indefinite"/></rect></g>'
      )
    },
    {
      id: "fire-up",
      label: "Fogo",
      tags: "fogo fire hot",
      url: animGif(
        "f",
        "#FFE8D6",
        '<path d="M100 40c10 22-4 34-4 50 0 10 8 18 18 18 14 0 26-14 26-34 20 16 24 40 24 54 0 28-22 42-64 42S36 156 36 128c0-24 16-44 34-56-2 14 8 26 18 26 8 0 12-8 12-18 0-12-4-24 0-40z" fill="#FF6B2C"><animate attributeName="opacity" values="1;0.7;1" dur="0.7s" repeatCount="indefinite"/></path>'
      )
    },
    {
      id: "laugh-face",
      label: "Riso",
      tags: "riso rir haha lol",
      url: animGif(
        "l",
        "#FFF7D6",
        '<circle cx="100" cy="100" r="56" fill="#FBBF24"/><path d="M78 88c6-8 18-8 24 0M98 88c6-8 18-8 24 0" fill="none" stroke="#0B0B0C" stroke-width="6" stroke-linecap="round"/><path d="M70 115c10 22 50 22 60 0" fill="#0B0B0C"><animate attributeName="d" values="M70 115c10 22 50 22 60 0;M70 110c10 28 50 28 60 0;M70 115c10 22 50 22 60 0" dur="1s" repeatCount="indefinite"/></path>'
      )
    },
    {
      id: "clap-hands",
      label: "Aplauso",
      tags: "aplauso clap",
      url: animGif(
        "c",
        "#F3E8FF",
        '<g><ellipse cx="70" cy="110" rx="28" ry="36" fill="#A855F7" transform="rotate(-15 70 110)"/><ellipse cx="130" cy="110" rx="28" ry="36" fill="#C084FC" transform="rotate(15 130 110)"><animateTransform attributeName="transform" type="rotate" values="15 130 110;5 130 110;15 130 110" dur="0.4s" repeatCount="indefinite"/></ellipse></g>'
      )
    },
    {
      id: "party-pop",
      label: "Festa",
      tags: "festa party",
      url: animGif(
        "p",
        "#FFE4F1",
        '<path d="M50 160 L140 50 L160 70 L70 180 Z" fill="#EC4899"/><circle cx="150" cy="40" r="8" fill="#F59E0B"><animate attributeName="cy" values="40;20;40" dur="1s" repeatCount="indefinite"/></circle><circle cx="170" cy="70" r="6" fill="#3B82F6"><animate attributeName="cy" values="70;50;70" dur="0.8s" repeatCount="indefinite"/></circle><circle cx="120" cy="30" r="5" fill="#22C55E"><animate attributeName="cy" values="30;15;30" dur="1.2s" repeatCount="indefinite"/></circle>'
      )
    },
    {
      id: "thumbs",
      label: "Gosto",
      tags: "gosto like thumbs",
      url: animGif(
        "t",
        "#E4F0FF",
        '<g transform="translate(100 100)"><g><animateTransform attributeName="transform" type="translate" values="0 8;0 -8;0 8" dur="0.9s" repeatCount="indefinite"/><path d="M-30-10 V40 H-55 V-10 H-30 Z M-25-10 H25 c10 0 18 10 18 22 v8 c0 6-2 12-6 16 l-12 36 c-4 10-12 16-22 16 H-25 V-10 Z" fill="#3B82F6"/></g></g>'
      )
    },
    {
      id: "music-note",
      label: "Música",
      tags: "musica music",
      url: animGif(
        "m",
        "#EDE9FE",
        '<g><path d="M80 140 V70 L150 55 V125" fill="none" stroke="#7C3AED" stroke-width="10" stroke-linecap="round"/><circle cx="70" cy="145" r="18" fill="#7C3AED"/><circle cx="140" cy="130" r="18" fill="#7C3AED"><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="0.6s" repeatCount="indefinite"/></circle></g>'
      )
    },
    {
      id: "sad-drop",
      label: "Triste",
      tags: "triste sad",
      url: animGif(
        "d",
        "#E8F4FF",
        '<circle cx="100" cy="95" r="55" fill="#60A5FA"/><circle cx="80" cy="85" r="7" fill="#0B0B0C"/><circle cx="120" cy="85" r="7" fill="#0B0B0C"/><path d="M78 125c12-14 32-14 44 0" fill="none" stroke="#0B0B0C" stroke-width="6" stroke-linecap="round"/><ellipse cx="78" cy="100" rx="5" ry="8" fill="#93C5FD"><animate attributeName="cy" values="100;130;100" dur="1.4s" repeatCount="indefinite"/></ellipse>'
      )
    },
    {
      id: "tchilo-pop",
      label: "Tchilo",
      tags: "tchilo brand",
      url: animGif(
        "tp",
        "#C8F560",
        '<text x="100" y="120" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="72" fill="#0B0B0C">T<animate attributeName="font-size" values="72;80;72" dur="1s" repeatCount="indefinite"/></text>'
      )
    }
  ];

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
    } catch (e) {}
  }

  function ensureCSS() {
    if (document.getElementById("tchiloSGCss")) return;
    var st = document.createElement("style");
    st.id = "tchiloSGCss";
    st.textContent =
      "#tchiloSGSheet{display:none;position:fixed;left:0;right:0;bottom:0;z-index:3000;background:var(--paper,#f7f6f2);border-radius:20px 20px 0 0;border:3px solid var(--ink,#0B0B0C);border-bottom:none;max-height:72vh;flex-direction:column;box-shadow:0 -12px 40px rgba(0,0,0,.18)}" +
      "#tchiloSGSheet.open{display:flex}" +
      ".sg-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:2px solid var(--ink,#0B0B0C)}" +
      ".sg-tabs{display:flex;gap:8px;flex:1}" +
      ".sg-tab{padding:8px 14px;border:2.5px solid var(--ink,#0B0B0C);border-radius:999px;background:#fff;font:800 13px Inter,system-ui,sans-serif;cursor:pointer}" +
      ".sg-tab.on{background:#c8f560}" +
      ".sg-close{width:40px;height:40px;border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#fff;font:900 18px Inter,sans-serif;cursor:pointer}" +
      ".sg-search{padding:10px 14px;border-bottom:1px solid rgba(0,0,0,.08)}" +
      ".sg-search input{width:100%;box-sizing:border-box;padding:12px 14px;border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;font:600 14px Inter,sans-serif;background:#fff}" +
      ".sg-grid{flex:1;overflow:auto;padding:12px 14px calc(16px + env(safe-area-inset-bottom));display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;-webkit-overflow-scrolling:touch}" +
      ".sg-grid.gif-mode{grid-template-columns:repeat(3,minmax(0,1fr))}" +
      ".sg-item{border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;background:#fff;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;padding:0}" +
      ".sg-item img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".sg-item.sticker img{object-fit:contain;padding:8px}" +
      ".sg-item:active{transform:scale(.96)}" +
      ".sg-empty{grid-column:1/-1;text-align:center;padding:28px 12px;font:700 14px Inter,sans-serif;opacity:.65}" +
      ".sg-trigger{width:40px;height:40px;border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;padding:0}" +
      ".sg-trigger svg{width:20px;height:20px}" +
      ".chat-input-bar .sg-trigger{margin:0 2px}" +
      ".comment-input-row .sg-trigger{margin-right:6px}" +
      ".sg-media-bubble img,.comment-item .sg-inline-media{max-width:180px;max-height:180px;border-radius:12px;display:block;margin-top:6px;border:2px solid var(--ink,#0B0B0C)}" +
      ".bubble .sg-media-bubble{padding:4px}" +
      "#storySGBar{position:absolute;left:12px;right:12px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:8;display:flex;gap:8px;align-items:center}" +
      "#storySGBar .sg-trigger{background:rgba(255,255,255,.92)}";
    document.head.appendChild(st);
  }

  function ensureSheet() {
    ensureCSS();
    if (document.getElementById("tchiloSGSheet")) return;
    var el = document.createElement("div");
    el.id = "tchiloSGSheet";
    el.innerHTML =
      '<div class="sg-head"><div class="sg-tabs">' +
      '<button type="button" class="sg-tab on" data-tab="stickers">Figurinhas</button>' +
      '<button type="button" class="sg-tab" data-tab="gifs">GIFs</button></div>' +
      '<button type="button" class="sg-close" id="sgClose" aria-label="Fechar">×</button></div>' +
      '<div class="sg-search" id="sgSearchWrap" style="display:none">' +
      '<input type="search" id="sgSearch" placeholder="Procurar (ex: riso, festa, ok)…" autocomplete="off"/></div>' +
      '<div class="sg-grid" id="sgGrid"></div>';
    document.body.appendChild(el);
    document.getElementById("sgClose").onclick = closeSheet;
    el.querySelectorAll(".sg-tab").forEach(function (tab) {
      tab.onclick = function () {
        el.querySelectorAll(".sg-tab").forEach(function (t) {
          t.classList.toggle("on", t === tab);
        });
        var which = tab.getAttribute("data-tab");
        document.getElementById("sgSearchWrap").style.display =
          which === "gifs" ? "block" : "none";
        if (which === "stickers") renderStickers();
        else renderGifs(document.getElementById("sgSearch").value || "");
      };
    });
    var search = document.getElementById("sgSearch");
    search.oninput = function () {
      renderGifs(search.value.trim());
    };
  }

  function openSheet(target) {
    context.target = target;
    ensureSheet();
    var sheet = document.getElementById("tchiloSGSheet");
    sheet.classList.add("open");
    sheet.querySelectorAll(".sg-tab").forEach(function (t, i) {
      t.classList.toggle("on", i === 0);
    });
    document.getElementById("sgSearchWrap").style.display = "none";
    renderStickers();
  }

  function closeSheet() {
    var sheet = document.getElementById("tchiloSGSheet");
    if (sheet) sheet.classList.remove("open");
  }

  function renderStickers() {
    var grid = document.getElementById("sgGrid");
    if (!grid) return;
    grid.classList.remove("gif-mode");
    grid.innerHTML = STICKERS.map(function (s) {
      return (
        '<button type="button" class="sg-item sticker" data-id="' +
        s.id +
        '" aria-label="' +
        s.label +
        '"><img src="' +
        s.url +
        '" alt="' +
        s.label +
        '"/></button>'
      );
    }).join("");
    grid.querySelectorAll("[data-id]").forEach(function (btn) {
      btn.onclick = function () {
        var s = STICKERS.find(function (x) {
          return x.id === btn.getAttribute("data-id");
        });
        if (s) sendMedia("sticker", s.url, s.label);
      };
    });
  }

  function renderGifs(q) {
    var grid = document.getElementById("sgGrid");
    if (!grid) return;
    grid.classList.add("gif-mode");
    var qq = String(q || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    var list = FREE_GIFS.filter(function (g) {
      if (!qq) return true;
      var hay = (g.label + " " + g.tags).toLowerCase();
      return hay.indexOf(qq) >= 0;
    });
    if (!list.length) {
      grid.innerHTML = '<div class="sg-empty">Nenhum GIF neste pack. Tenta: riso, festa, ok…</div>';
      return;
    }
    grid.innerHTML = list
      .map(function (g) {
        return (
          '<button type="button" class="sg-item" data-gif="' +
          g.id +
          '" aria-label="' +
          g.label +
          '"><img src="' +
          g.url +
          '" alt="' +
          g.label +
          '"/></button>'
        );
      })
      .join("");
    grid.querySelectorAll("[data-gif]").forEach(function (btn) {
      btn.onclick = function () {
        var g = FREE_GIFS.find(function (x) {
          return x.id === btn.getAttribute("data-gif");
        });
        if (g) sendMedia("gif", g.url, g.label);
      };
    });
  }

  function sendMedia(kind, url, label) {
    closeSheet();
    if (context.target === "chat") sendChatMedia(kind, url);
    else if (context.target === "comment") sendCommentMedia(kind, url);
    else if (context.target === "story") sendStoryMedia(kind, url, label);
  }

  function sendChatMedia(kind, url) {
    try {
      if (typeof currentChatUser === "undefined" || !currentChatUser) {
        toast("Abre uma conversa");
        return;
      }
      var chats = typeof getChats === "function" ? getChats() : {};
      if (!chats[currentChatUser]) chats[currentChatUser] = [];
      chats[currentChatUser].push({
        from: "me",
        text: "",
        type: kind,
        mediaUrl: url,
        mediaType: "image/svg+xml",
        createdAt: Date.now()
      });
      if (typeof saveChats === "function") saveChats(chats);
      if (typeof renderChat === "function") renderChat();
      else if (typeof renderChatBody === "function") renderChatBody();
      try {
        if (window.tchiloCloud && window.tchiloCloud.syncNormalized)
          window.tchiloCloud.syncNormalized("chats", chats);
      } catch (e0) {}
    } catch (e) {
      toast("Erro ao enviar");
    }
  }

  function sendCommentMedia(kind, url) {
    try {
      var session = typeof getSession === "function" ? getSession() : null;
      var postId =
        typeof currentCommentPostId !== "undefined" ? currentCommentPostId : null;
      if (!session || !postId) {
        toast("Abre os comentários primeiro");
        return;
      }
      var all = typeof getComments === "function" ? getComments() : {};
      if (!all[postId]) all[postId] = [];
      all[postId].push({
        user: session.username,
        text: "",
        type: kind,
        mediaUrl: url,
        createdAt: Date.now()
      });
      if (typeof saveComments === "function") saveComments(all);
      if (typeof renderCommentList === "function") renderCommentList();
      toast("Comentário publicado");
      try {
        if (window.tchiloCloud && window.tchiloCloud.syncNormalized)
          window.tchiloCloud.syncNormalized("comments", all);
      } catch (e1) {}
    } catch (e) {}
  }

  function sendStoryMedia(kind, url, label) {
    try {
      var owner =
        window.__tchiloCurrentStoryUser || window.currentStoryUser || null;
      if (owner && typeof openChat === "function") {
        var name =
          typeof owner === "string" ? owner : owner.username || owner.name;
        if (name) {
          if (typeof closeStory === "function") closeStory();
          else {
            var sv = document.querySelector(".story-viewer.open, #storyViewer");
            if (sv) sv.classList.remove("open");
          }
          setTimeout(function () {
            try {
              openChat(name, String(name).slice(0, 2).toUpperCase(), "var(--mint)");
              setTimeout(function () {
                context.target = "chat";
                sendChatMedia(kind, url);
              }, 250);
            } catch (e2) {}
          }, 150);
          return;
        }
      }
      toast("Figurinha pronta para resposta");
      window.__tchiloStoryPendingMedia = { kind: kind, url: url, label: label };
    } catch (e) {}
  }

  function triggerBtn(target, aria) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sg-trigger";
    b.setAttribute("aria-label", aria || "Figurinhas e GIFs");
    b.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none"/><path d="M8 15c1.5 2 6.5 2 8 0"/></svg>';
    b.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSheet(target);
    };
    return b;
  }

  function injectChat() {
    var bar = document.querySelector(".chat-input-bar");
    if (!bar || bar.querySelector(".sg-trigger")) return;
    var input = document.getElementById("chatInput");
    if (!input) return;
    bar.insertBefore(triggerBtn("chat"), input);
  }

  function injectComment() {
    var input = document.getElementById("commentInput");
    if (!input) return;
    var parent = input.parentElement;
    if (!parent || parent.querySelector(".sg-trigger")) return;
    parent.insertBefore(triggerBtn("comment"), input);
    parent.classList.add("comment-input-row");
    parent.style.display = "flex";
    parent.style.alignItems = "center";
    parent.style.gap = "6px";
  }

  function injectStory() {
    var viewer =
      document.querySelector(".story-viewer") ||
      document.getElementById("storyViewer");
    if (!viewer || document.getElementById("storySGBar")) return;
    var bar = document.createElement("div");
    bar.id = "storySGBar";
    bar.appendChild(triggerBtn("story", "Responder com figurinha ou GIF"));
    viewer.appendChild(bar);
  }

  function patchCommentRender() {
    if (typeof window.renderCommentList !== "function") return false;
    if (window.renderCommentList.__sgPatch) return true;
    var orig = window.renderCommentList;
    window.renderCommentList = function () {
      var r = orig.apply(this, arguments);
      try {
        var list = document.getElementById("commentList");
        if (!list || typeof getComments !== "function") return r;
        var all = getComments()[currentCommentPostId] || [];
        var items = list.querySelectorAll(".comment-item");
        all.forEach(function (c, i) {
          if (!c || !c.mediaUrl || !items[i]) return;
          if (items[i].querySelector(".sg-inline-media")) return;
          var img = document.createElement("img");
          img.className = "sg-inline-media";
          img.src = c.mediaUrl;
          img.alt = c.type === "gif" ? "GIF" : "Figurinha";
          var box =
            items[i].querySelector('div[style*="flex:1"]') || items[i];
          box.appendChild(img);
        });
      } catch (e) {}
      return r;
    };
    window.renderCommentList.__sgPatch = true;
    return true;
  }

  function patchChatRender() {
    var body = document.getElementById("chatBody");
    if (!body || body.__sgObs) return;
    body.__sgObs = true;
    new MutationObserver(function () {
      try {
        if (typeof getChats !== "function" || !currentChatUser) return;
        var msgs = getChats()[currentChatUser] || [];
        var bubbles = body.querySelectorAll(".bubble");
        msgs.forEach(function (m, i) {
          if (!m || !m.mediaUrl || !bubbles[i]) return;
          if (bubbles[i].querySelector(".sg-media-bubble")) return;
          if (m.type === "gif" || m.type === "sticker" || m.type === "image") {
            var wrap = document.createElement("div");
            wrap.className = "sg-media-bubble";
            var img = document.createElement("img");
            img.src = m.mediaUrl;
            img.alt = m.type || "media";
            wrap.appendChild(img);
            if (!String(m.text || "").trim()) bubbles[i].textContent = "";
            bubbles[i].appendChild(wrap);
          }
        });
      } catch (e) {}
    }).observe(body, { childList: true, subtree: true });
  }

  function trackStoryOwner() {
    if (typeof window.openStory !== "function" || window.openStory.__sgTrack) return;
    var orig = window.openStory;
    window.openStory = function (data) {
      try {
        if (data)
          window.__tchiloCurrentStoryUser =
            data.username || data.name || data.user || null;
      } catch (e) {}
      var r = orig.apply(this, arguments);
      setTimeout(injectStory, 50);
      return r;
    };
    window.openStory.__sgTrack = true;
  }

  function boot() {
    ensureCSS();
    injectChat();
    injectComment();
    injectStory();
    patchCommentRender();
    patchChatRender();
    trackStoryOwner();
  }

  setInterval(function () {
    injectChat();
    injectComment();
    injectStory();
    patchCommentRender();
    trackStoryOwner();
  }, 1500);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 600);
  setTimeout(boot, 2000);

  window.tchiloOpenStickers = function (target) {
    openSheet(target || "chat");
  };
})();
