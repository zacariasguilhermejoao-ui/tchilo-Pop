/**
 * tchilo-Pop — Seguir no topo direito; X no topo esquerdo
 * v2 — sobrescreve .reel-follow{left:18px} do index
 * perf: sem setInterval; MutationObserver + patch openReels basta
 */
(function () {
  'use strict';
  if (window.__tchiloReelsFollowV2) return;
  window.__tchiloReelsFollowV2 = true;

  function injectCSS() {
    var st = document.getElementById('tchiloReelsFollowCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloReelsFollowCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      /* X — canto superior ESQUERDO */
      '#reelsViewer .reels-close,' +
      '.reels-viewer .reels-close,' +
      '#reelsViewer button.reels-close{' +
      'position:fixed!important;' +
      'top:max(12px, env(safe-area-inset-top, 0px) + 8px)!important;' +
      'left:max(12px, env(safe-area-inset-left, 0px) + 8px)!important;' +
      'right:auto!important;bottom:auto!important;' +
      'z-index:40!important;}' +

      /* Seguir — canto superior DIREITO (anula left:18px do index) */
      '#reelsViewer .reel-follow,' +
      '#reelsViewer .reel-slide .reel-follow,' +
      '.reels-viewer .reel-follow,' +
      '.reel-slide .reel-follow,' +
      '.reel-slide > button.reel-follow,' +
      'button.reel-follow,' +
      '#reelsViewer button.reel-follow{' +
      'position:absolute!important;' +
      'top:max(12px, env(safe-area-inset-top, 0px) + 8px)!important;' +
      'right:max(12px, env(safe-area-inset-right, 0px) + 8px)!important;' +
      'left:auto!important;' +
      'bottom:auto!important;' +
      'inset:auto max(12px, env(safe-area-inset-right, 0px) + 8px) auto auto!important;' +
      'transform:none!important;' +
      'margin:0!important;' +
      'z-index:35!important;' +
      'align-self:auto!important;' +
      'float:none!important;' +
      'display:inline-flex!important;' +
      'align-items:center!important;' +
      'justify-content:center!important;' +
      'min-width:78px!important;' +
      'padding:8px 14px!important;' +
      'border:2px solid #fff!important;' +
      'border-radius:10px!important;' +
      'background:rgba(0,0,0,.45)!important;' +
      'color:#fff!important;' +
      'font:800 12px Inter,system-ui,sans-serif!important;' +
      '}' +

      '#reelsViewer .reel-follow.following,' +
      'button.reel-follow.following{' +
      'background:rgba(255,255,255,.18)!important;}' +

      /* labels que competiam com o seguir */
      '#reelsViewer .duet-label{' +
      'top:56px!important;right:12px!important;left:auto!important;}';
  }

  function pinBtn(btn) {
    if (!btn) return;
    btn.style.setProperty('position', 'absolute', 'important');
    btn.style.setProperty('top', '12px', 'important');
    btn.style.setProperty('right', '12px', 'important');
    btn.style.setProperty('left', 'auto', 'important');
    btn.style.setProperty('bottom', 'auto', 'important');
    btn.style.setProperty('inset', '12px 12px auto auto', 'important');
    btn.style.setProperty('transform', 'none', 'important');
    btn.style.setProperty('margin', '0', 'important');
    btn.style.setProperty('z-index', '35', 'important');
  }

  function pinAll() {
    document
      .querySelectorAll(
        '#reelsViewer .reel-follow, .reel-slide .reel-follow, button.reel-follow'
      )
      .forEach(pinBtn);

    document.querySelectorAll('#reelsViewer .reels-close, .reels-close').forEach(function (close) {
      close.style.setProperty('position', 'fixed', 'important');
      close.style.setProperty('top', '12px', 'important');
      close.style.setProperty('left', '12px', 'important');
      close.style.setProperty('right', 'auto', 'important');
      close.style.setProperty('z-index', '40', 'important');
    });
  }

  function watch() {
    var viewer = document.getElementById('reelsViewer');
    if (!viewer) return;
    if (!viewer.__followPinV2) {
      viewer.__followPinV2 = true;
      try {
        var _t = null;
        new MutationObserver(function () {
          if (_t) return;
          _t = setTimeout(function () {
            _t = null;
            pinAll();
          }, 50);
        }).observe(viewer, { childList: true, subtree: true });
      } catch (e) {}
    }
    var track = document.getElementById('reelsTrack');
    if (track && !track.__followScrollV2) {
      track.__followScrollV2 = true;
      track.addEventListener(
        'scroll',
        function () {
          pinAll();
        },
        { passive: true }
      );
    }
  }

  function patchOpen() {
    if (typeof window.openReels !== 'function') return;
    if (window.openReels.__followPinV2) return;
    var orig = window.openReels;
    window.openReels = function () {
      var r = orig.apply(this, arguments);
      injectCSS();
      setTimeout(pinAll, 0);
      setTimeout(pinAll, 40);
      setTimeout(pinAll, 120);
      setTimeout(pinAll, 300);
      setTimeout(watch, 0);
      return r;
    };
    window.openReels.__followPinV2 = true;
    if (orig.__fast) window.openReels.__fast = true;
    if (orig.__followRight) window.openReels.__followRight = true;
    if (orig.__followPin) window.openReels.__followPin = true;
  }

  function boot() {
    injectCSS();
    pinAll();
    watch();
    patchOpen();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  /* sem setInterval contínuo */
})();
