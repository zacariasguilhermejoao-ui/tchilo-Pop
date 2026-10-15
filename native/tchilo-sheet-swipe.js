/**
 * Tchilo — swipe para baixo fecha bottom sheets
 * v3 — cobre .sheet, gift, music, profile share, modal host, etc.
 * Restaura o comportamento do modal de Presentes em todos os sheets.
 */
(function () {
  'use strict';
  if (window.__tchiloSheetSwipeV3) return;
  window.__tchiloSheetSwipeV3 = true;
  window.__tchiloSheetSwipeV2 = true;
  window.__tchiloSheetSwipeV1 = true;

  var THRESH = 80;
  var VELOCITY = 0.4;

  function isOpenSheet(el) {
    if (!el) return false;
    if (el.classList.contains('open') || el.classList.contains('is-open')) return true;
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
      var cancel = backdrop.querySelector(
        '[data-a="close"], .cancel, .sheet-cancel, button[aria-label="Fechar"], button[aria-label="Voltar"], .tchilo-sheet-back'
      );
      if (cancel) {
        cancel.click();
        return;
      }
    } catch (e) {}

    /* handlers conhecidos */
    try {
      if (backdrop.id === 'commentSheet' && typeof window.closeComments === 'function') {
        window.closeComments();
        return;
      }
      if (backdrop.id === 'shareSheet' && typeof window.closeShare === 'function') {
        window.closeShare();
        return;
      }
      if (backdrop.id === 'reportSheet' && typeof window.closeReport === 'function') {
        window.closeReport();
        return;
      }
      if (backdrop.id === 'postMenuSheet' && typeof window.closePostMenu === 'function') {
        window.closePostMenu();
        return;
      }
      if (backdrop.id === 'reelMenuSheet' && typeof window.closeReelMenu === 'function') {
        window.closeReelMenu();
        return;
      }
      if (backdrop.id === 'storyMenuSheet' && typeof window.closeStoryMenu === 'function') {
        window.closeStoryMenu();
        return;
      }
      if (backdrop.id === 'tchiloGiftSheet' && typeof window.closeGiftSheet === 'function') {
        /* fallback */
      }
      if (backdrop.id === 'tchiloModalHost' && typeof window.tchiloModalClose === 'function') {
        window.tchiloModalClose(null);
        return;
      }
      if (backdrop.id === 'profileActionSheet' && typeof window.closeProfileActions === 'function') {
        window.closeProfileActions();
        return;
      }
    } catch (eH) {}

    try {
      backdrop.click();
    } catch (e2) {}
    try {
      backdrop.classList.remove('open', 'is-open');
    } catch (e3) {}
    try {
      var panel =
        backdrop.querySelector('.sheet-panel, .panel, .tchilo-ps-panel, .tm-sheet, .card') ||
        backdrop.firstElementChild;
      if (panel) {
        panel.style.transition = '';
        panel.style.transform = '';
      }
    } catch (e4) {}
  }

  function bindPanel(backdrop, panel) {
    if (!panel || panel.__tchiloSwipeBoundV3) return;
    panel.__tchiloSwipeBoundV3 = true;

    var startY = 0;
    var lastT = 0;
    var dragging = false;
    var dy = 0;

    function onStart(e) {
      if (!isOpenSheet(backdrop)) return;
      var t = e.touches && e.touches[0];
      if (!t) return;
      /* não iniciar swipe se o conteúdo estiver scrolled */
      var scrollEl =
        panel.querySelector(
          '.sheet-scroll, .share-options, .settings-list, .grid, .list, .sheet-list, .tm-body'
        ) || panel;
      if (scrollEl.scrollTop > 4) return;
      startY = t.clientY;
      lastT = Date.now();
      dragging = true;
      dy = 0;
      panel.style.transition = 'none';
      panel.style.willChange = 'transform';
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
        /* esbater backdrop ligeiramente */
        try {
          if (backdrop.style) {
            var op = Math.max(0.15, 0.5 - dy / 500);
            if (backdrop.classList.contains('sheet') || backdrop.id === 'tchiloGiftSheet') {
              /* o próprio backdrop tem o overlay */
            }
          }
        } catch (eB) {}
      }
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      var elapsed = Math.max(1, Date.now() - lastT);
      var vel = dy / elapsed;
      var shouldClose = dy >= THRESH || (dy > 36 && vel > VELOCITY);

      panel.style.transition = 'transform .22s ease';
      if (shouldClose) {
        panel.style.transform = 'translateY(110%)';
        setTimeout(function () {
          closeSheet(backdrop);
          panel.style.transition = '';
          panel.style.transform = '';
          panel.style.willChange = '';
        }, 220);
      } else {
        panel.style.transform = '';
        setTimeout(function () {
          panel.style.transition = '';
          panel.style.willChange = '';
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

      document.querySelectorAll('.profile-action-sheet').forEach(function (sheet) {
        var panel = sheet.querySelector('.profile-action-card, .panel') || sheet.firstElementChild;
        if (panel) bindPanel(sheet, panel);
      });

      [
        '#tchiloGiftSheet',
        '#tchiloMusicFallback',
        '#tchiloPostMusicSheet',
        '#tchiloProfileShareSheet',
        '#tchiloQrModal',
        '#tchiloModalHost',
        '#tchiloLiveSetup',
        '#tchiloSGSheet'
      ].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (!el) return;
        var panel =
          el.querySelector('.sheet-panel, .panel, .tchilo-ps-panel, .tm-sheet, .card') ||
          el.firstElementChild;
        if (panel) bindPanel(el, panel);
      });
    } catch (e) {}
  }

  scan();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  }
  setTimeout(scan, 300);
  setTimeout(scan, 1000);
  setTimeout(scan, 2500);

  try {
    new MutationObserver(function () {
      scan();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();
