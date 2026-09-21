/** Junta figurinhas personalizadas (Premium) ao pack de Figurinhas */
(function () {
  "use strict";

  function getCustom() {
    try {
      if (typeof window.tchiloGetCustomStickers === "function")
        return window.tchiloGetCustomStickers() || [];
      return window.__tchiloCustomStickers || [];
    } catch (e) {
      return [];
    }
  }

  function enhanceRender() {
    var grid = document.getElementById("sgGrid");
    if (!grid || grid.classList.contains("gif-mode")) return;
    if (grid.querySelector("[data-custom-sticker]")) return;

    var custom = getCustom();
    if (!custom.length) return;

    // prepend custom stickers
    var frag = document.createDocumentFragment();
    custom.forEach(function (s) {
      if (!s || !s.url) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sg-item sticker";
      btn.setAttribute("data-custom-sticker", s.id || "1");
      btn.setAttribute("aria-label", s.label || "Figurinha");
      btn.innerHTML = '<img src="' + s.url + '" alt=""/>';
      btn.onclick = function () {
        try {
          // reutilizar envio: simular contexto chat se sheet aberto
          if (typeof window.tchiloOpenStickers === "function") {
            /* send via same path as built-in: dispatch synthetic */
          }
          // enviar como mensagem/sticker
          var target = "chat";
          try {
            var sheet = document.getElementById("tchiloSGSheet");
            if (sheet && sheet.__sgTarget) target = sheet.__sgTarget;
          } catch (e0) {}
          // fallback: usar API interna se exposta
          if (typeof window.__tchiloSendSticker === "function") {
            window.__tchiloSendSticker(s.url, s.label);
            return;
          }
          // enviar direto no chat
          if (typeof currentChatUser !== "undefined" && currentChatUser) {
            var chats = typeof getChats === "function" ? getChats() : {};
            if (!chats[currentChatUser]) chats[currentChatUser] = [];
            chats[currentChatUser].push({
              from: "me",
              text: "",
              type: "sticker",
              mediaUrl: s.url,
              mediaType: "image/png",
              createdAt: Date.now()
            });
            if (typeof saveChats === "function") saveChats(chats);
            if (typeof renderChat === "function") renderChat();
            else if (typeof renderChatBody === "function") renderChatBody();
            var sh = document.getElementById("tchiloSGSheet");
            if (sh) sh.classList.remove("open");
          }
        } catch (e) {}
      };
      frag.appendChild(btn);
    });
    if (grid.firstChild) grid.insertBefore(frag, grid.firstChild);
    else grid.appendChild(frag);
  }

  // observar abertura da grelha
  setInterval(function () {
    var sheet = document.getElementById("tchiloSGSheet");
    if (sheet && sheet.classList.contains("open")) enhanceRender();
  }, 400);

  window.addEventListener("tchilo-stickers-updated", function () {
    setTimeout(enhanceRender, 100);
  });
})();
