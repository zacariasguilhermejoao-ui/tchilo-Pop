/**
 * tchilo-Pop — bloqueia seleção e zoom indesejados
 * Mantém seleção em inputs / textareas / contenteditable
 */
(function () {
  "use strict";

  if (window.__tchiloTouchLock) return;
  window.__tchiloTouchLock = true;

  var css =
    "html,body{" +
    "-webkit-text-size-adjust:100%;" +
    "text-size-adjust:100%;" +
    "touch-action:manipulation;" +
    "}" +
    "html,body,#appFrame,#app,*{" +
    "-webkit-tap-highlight-color:transparent;" +
    "}" +
    "html,body,#appFrame{" +
    "-webkit-user-select:none !important;" +
    "-moz-user-select:none !important;" +
    "-ms-user-select:none !important;" +
    "user-select:none !important;" +
    "-webkit-touch-callout:none !important;" +
    "}" +
    "input,textarea,select,[contenteditable],[contenteditable=\"true\"],.allow-select{" +
    "-webkit-user-select:text !important;" +
    "-moz-user-select:text !important;" +
    "user-select:text !important;" +
    "-webkit-touch-callout:default !important;" +
    "touch-action:auto !important;" +
    "}" +
    "img,video,svg,canvas{" +
    "-webkit-user-drag:none !important;" +
    "user-select:none !important;" +
    "-webkit-touch-callout:none !important;" +
    "}" +
    "a,button,[role=\"button\"],.btn,.profile-btn,.chat-call-btn{" +
    "touch-action:manipulation;" +
    "-webkit-user-select:none !important;" +
    "user-select:none !important;" +
    "}";

  function injectCss() {
    if (document.getElementById("tchiloTouchLockStyles")) return;
    var st = document.createElement("style");
    st.id = "tchiloTouchLockStyles";
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function isEditable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    var tag = (el.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    if (el.closest && el.closest("input,textarea,select,[contenteditable],[contenteditable=true],.allow-select"))
      return true;
    return false;
  }

  function onContextMenu(e) {
    if (isEditable(e.target)) return;
    e.preventDefault();
  }

  function onSelectStart(e) {
    if (isEditable(e.target)) return;
    e.preventDefault();
  }

  function onDragStart(e) {
    if (isEditable(e.target)) return;
    var tag = (e.target && e.target.tagName || "").toLowerCase();
    if (tag === "img" || tag === "a" || tag === "svg") {
      e.preventDefault();
    }
  }

  /* Bloquear pinch-zoom (iOS / alguns Android) */
  function onGesture(e) {
    e.preventDefault();
  }

  var lastTouchEnd = 0;
  function onTouchEnd(e) {
    var now = Date.now();
    // bloqueia double-tap zoom
    if (now - lastTouchEnd <= 300) {
      if (!isEditable(e.target)) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }

  function onTouchMove(e) {
    // multi-touch pinch
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }

  function hardenViewport() {
    try {
      var meta = document.querySelector('meta[name="viewport"]');
      var content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover";
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content = content;
        (document.head || document.documentElement).appendChild(meta);
      }
    } catch (e) {}
  }

  function bind() {
    injectCss();
    hardenViewport();

    document.addEventListener("contextmenu", onContextMenu, { capture: true });
    document.addEventListener("selectstart", onSelectStart, { capture: true });
    document.addEventListener("dragstart", onDragStart, { capture: true });
    document.addEventListener("gesturestart", onGesture, { passive: false, capture: true });
    document.addEventListener("gesturechange", onGesture, { passive: false, capture: true });
    document.addEventListener("gestureend", onGesture, { passive: false, capture: true });
    document.addEventListener("touchend", onTouchEnd, { passive: false, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
