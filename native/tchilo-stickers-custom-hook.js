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
          if (typeof window.tchiloOpenStickers === "function") {
          }
          var target = "chat";
          try {
            var sheet = document.getElementById("tchiloSGSheet");
            if (sheet && sheet.__sgTarget) target = sheet.__sgTarget;
          } catch (e0) {}
          if (typeof window.__tchiloSendSticker === "function") {
            window.__tchiloSendSticker(s.url, s.label);
            return;
          }
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

  /* perf: sem poll 400ms — observer + check lento só se sheet existir */
  try {
    var _sgObs = new MutationObserver(function () {
      var sheet = document.getElementById("tchiloSGSheet");
      if (sheet && sheet.classList.contains("open")) enhanceRender();
    });
    _sgObs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  } catch (e) {}
  setInterval(function () {
    var sheet = document.getElementById("tchiloSGSheet");
    if (sheet && sheet.classList.contains("open")) enhanceRender();
  }, 3000);

  window.addEventListener("tchilo-stickers-updated", function () {
    setTimeout(enhanceRender, 100);
  });
})();
