/**
 * tchilo-Pop — Chat UX (syntax fixed)
 */
(function () {
  "use strict";
  if (window.__tchiloChatUxV1) return;
  window.__tchiloChatUxV1 = true;

  var GIPHY_KEY = "dc6zaTOxFJmzC";
  var STICKERS = [
    "\uD83D\uDE00","\uD83D\uDE02","\uD83E\uDD70","\uD83D\uDE0D","\uD83D\uDE0E","\uD83D\uDE22","\uD83D\uDE21","\uD83D\uDC4D","\uD83D\uDC4E","\uD83D\uDE4F",
    "\uD83D\uDD25","\uD83D\uDCAF","\uD83C\uDF89","\u2764\uFE0F","\uD83D\uDC94","\u2B50","\u2728","\uD83D\uDC40","\uD83E\uDD1D","\uD83D\uDCAA"
  ];

  function toast(msg) {
    try {
      if (typeof window.showToast === "function") window.showToast(msg);
      else console.log("[chat-ux]", msg);
    } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById("tchiloChatUxStyles")) return;
    var st = document.createElement("style");
    st.id = "tchiloChatUxStyles";
    st.textContent =
      ".chat-input-bar .chat-attach-btn{width:40px;height:40px;border-radius:50%;border:2.5px solid var(--ink,#0B0B0C);background:var(--paper,#fff);display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;cursor:pointer}" +
      ".chat-input-bar .chat-send,.chat-input-bar .chat-mic-btn{width:42px;height:42px;border-radius:50%;border:2.5px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;padding:0;flex-shrink:0;cursor:pointer}" +
      ".chat-input-bar .chat-send{background:var(--yellow,#FFE14D)}" +
      ".chat-input-bar .chat-send.hide-ux,.chat-input-bar .chat-mic-btn.hide-ux{display:none !important}" +
      ".chat-input-bar .chat-gif-btn,.chat-input-bar .chat-sticker-btn{display:none !important}";
    document.head.appendChild(st);
  }

  function ensureBar() {
    var bar = document.querySelector("#chatScreen .chat-input-bar");
    if (!bar) return null;
    var input = document.getElementById("chatInput");
    if (input && !input.__uxToggle) {
      input.__uxToggle = true;
      input.addEventListener("input", syncSendMic);
      input.addEventListener("keyup", syncSendMic);
    }
    syncSendMic();
    return bar;
  }

  function syncSendMic() {
    var input = document.getElementById("chatInput");
    var send = document.querySelector("#chatScreen .chat-send");
    var mic = document.getElementById("chatMicBtn");
    var hasText = !!(input && String(input.value || "").trim());
    if (send) {
      if (hasText) send.classList.remove("hide-ux");
      else send.classList.add("hide-ux");
    }
    if (mic) {
      if (hasText) mic.classList.add("hide-ux");
      else mic.classList.remove("hide-ux");
    }
  }

  function boot() {
    injectStyles();
    ensureBar();
  }

  boot();
  setInterval(ensureBar, 1200);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  console.log("[Tchilo] chat-ux syntax-fixed");
})();
