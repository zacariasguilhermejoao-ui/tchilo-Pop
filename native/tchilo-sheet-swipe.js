/**
 * Tchilo — swipe para baixo fecha modais a meio (bottom sheets)
 * v1 — .sheet > .sheet-panel + sheets nativos (perfil, etc.)
 */
(function () {
  'use strict';
  if (window.__tchiloSheetSwipeV1) return;
  window.__tchiloSheetSwipeV1 = true;

  var THRESH = 90;
  var VELOCITY = 0.45;

  function isOpenSheet(el) {
    if (!el) return false;
    if (el.classList.contains('open')) return true;
    var st = window.getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden';
  }

  function closeSheet(backdrop) {
    if (!backdrop) return;
    try {
      /* clique no fundo (já fecha na maioria dos sheets do index) */
      backdrop.click();
    } catch (e) {}
    try {
      backdrop.classList.remove('open');
    } catch (e2) {}
    /* limpar transform residual no painel */
    try {
      var panel =
        backdrop.querySelector('.sheet-panel') ||
        backdrop.querySelector('.tchilo-ps-panel') ||
        backdrop.firstElementChild;
      if (panel) {
        panel.style.transition = '';
        panel.style.transform = '';
      }
    } catch (e3) {}
  }

  function bindPanel(backdrop, panel) {
    if (!panel || panel.__tchiloSwipeBound) return;
    panel.__tchiloSwipeBound = true;

    var startY = 0;
    var lastY = 0;
    var lastT = 0;
    var dragging = false;
    var dy = 0;

    function onStart(e) {
      if (!isOpenSheet(backdrop)) return;
      var t = e.touches && e.touches[0];
      if (!t) return;
      /* só inicia se o scroll interno estiver no topo */
      var scrollEl =
        panel.querySelector('.sheet-scroll, .share-options, .settings-list') || panel;
      if (scrollEl.scrollTop > 2) return;
      startY = t.clientY;
      lastY = startY;
      lastT = Date.now();
      dragging = true;
      dy = 0;
      panel.style.transition = 'none';
    }

    function onMove(e) {
      if (!dragging) return;
      var t = e.touches && e.touches[0];
      if (!t) return;
      dy = t.clientY - startY;
      lastY = t.clientY;
      lastT = Date.now();
      if (dy < 0) dy = 0;
      if (dy > 0) {
        try {
          e.preventDefault();
        } catch (err) {}
        panel.style.transform = 'translateY(' + dy + 'px)';
      }
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      var elapsed = Math.max(1, Date.now() - lastT);
      var vel = dy / elapsed;
      var shouldClose = dy >= THRESH || (dy > 40 && vel > VELOCITY);

      panel.style.transition = 'transform .22s ease-out';
      if (shouldClose) {
        panel.style.transform = 'translateY(110%)';
        setTimeout(function () {
          closeSheet(backdrop);
          panel.style.transition = '';
          panel.style.transform = '';
        }, 220);
      } else {
        panel.style.transform = 'translateY(0)';
        setTimeout(function () {
          panel.style.transition = '';
          panel.style.transform = '';
        }, 220);
      }
      dy = 0;
    }

    panel.addEventListener('touchstart', onStart, { passive: true });
    panel.addEventListener('touchmove', onMove, { passive: false });
    panel.addEventListener('touchend', onEnd, { passive: true });
    panel.addEventListener('touchcancel', onEnd, { passive: true });
  }

  function scan() {
    try {
      /* Index: .sheet com .sheet-panel */
      document.querySelectorAll('.sheet').forEach(function (sheet) {
        var panel = sheet.querySelector('.sheet-panel');
        if (panel) bindPanel(sheet, panel);
      });
      /* Native / outros bottom sheets */
      [
        '#tchiloProfileShareSheet',
        '#tchiloQrModal',
        '#tchiloModalSheet'
      ].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (!el) return;
        var panel =
          el.querySelector('.tchilo-ps-panel, .sheet-panel, .card') ||
          el.firstElementChild;
        if (panel) bindPanel(el, panel);
      });
    } catch (e) {}
  }

  scan();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  }
  setTimeout(scan, 400);
  setTimeout(scan, 1500);

  try {
    new MutationObserver(function () {
      scan();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
