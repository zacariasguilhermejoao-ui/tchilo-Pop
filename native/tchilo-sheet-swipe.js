/**
 * Tchilo — swipe para baixo fecha bottom sheets
 * v2 — cobre .sheet, gift, music, profile share, etc.
 */
(function () {
  'use strict';
  if (window.__tchiloSheetSwipeV2) return;
  window.__tchiloSheetSwipeV2 = true;
  window.__tchiloSheetSwipeV1 = true;

  var THRESH = 90;
  var VELOCITY = 0.45;

  function isOpenSheet(el) {
    if (!el) return false;
    if (el.classList.contains('open')) return true;
    try {
      var st = window.getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity || '1') > 0.1;
    } catch (e) {
      return false;
    }
  }

  function closeSheet(backdrop) {
    if (!backdrop) return;
    try {
      var cancel =
        backdrop.querySelector('[data-a="close"], .cancel, .sheet-cancel, button[aria-label="Fechar"]');
      if (cancel) {
        cancel.click();
        return;
      }
    } catch (e) {}
    try {
      backdrop.click();
    } catch (e2) {}
    try {
      backdrop.classList.remove('open');
    } catch (e3) {}
    try {
      var panel =
        backdrop.querySelector('.sheet-panel, .panel, .tchilo-ps-panel') ||
        backdrop.firstElementChild;
      if (panel) {
        panel.style.transition = '';
        panel.style.transform = '';
      }
    } catch (e4) {}
  }

  function bindPanel(backdrop, panel) {
    if (!panel || panel.__tchiloSwipeBoundV2) return;
    panel.__tchiloSwipeBoundV2 = true;

    var startY = 0;
    var lastT = 0;
    var dragging = false;
    var dy = 0;

    function onStart(e) {
      if (!isOpenSheet(backdrop)) return;
      var t = e.touches && e.touches[0];
      if (!t) return;
      var scrollEl =
        panel.querySelector('.sheet-scroll, .share-options, .settings-list, .grid, .list') || panel;
      if (scrollEl.scrollTop > 2) return;
      startY = t.clientY;
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

      panel.style.transition = 'transform .22s ease';
      if (shouldClose) {
        panel.style.transform = 'translateY(110%)';
        setTimeout(function () {
          closeSheet(backdrop);
          panel.style.transition = '';
          panel.style.transform = '';
        }, 220);
      } else {
        panel.style.transform = '';
        setTimeout(function () {
          panel.style.transition = '';
        }, 220);
      }
    }

    panel.addEventListener('touchstart', onStart, { passive: true });
    panel.addEventListener('touchmove', onMove, { passive: false });
    panel.addEventListener('touchend', onEnd, { passive: true });
    panel.addEventListener('touchcancel', onEnd, { passive: true });
  }

  function scan() {
    try {
      document.querySelectorAll('.sheet').forEach(function (sheet) {
        var panel = sheet.querySelector('.sheet-panel') || sheet.firstElementChild;
        if (panel) bindPanel(sheet, panel);
      });

      [
        '#tchiloGiftSheet',
        '#tchiloMusicFallback',
        '#tchiloPostMusicSheet',
        '#tchiloProfileShareSheet',
        '#tchiloQrModal',
        '#tchiloModalSheet',
        '#tchiloLiveSetup'
      ].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (!el) return;
        var panel =
          el.querySelector('.sheet-panel, .panel, .tchilo-ps-panel, .card') ||
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
