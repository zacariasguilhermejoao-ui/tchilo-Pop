/**
 * Tchilo — Story viewer UI (nivel Instagram)
 * v2b — closed state NUNCA cobre a app + syntax fix
 */
(function () {
  'use strict';
  if (window.__tchiloStoryUiProV2b) return;
  window.__tchiloStoryUiProV2b = true;
  window.__tchiloStoryUiProV2 = true;

  var HEART_OUT =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var HEART_ON =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="#FF3B5C" stroke="#FF3B5C" stroke-width="1.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  function injectCSS() {
    var old = document.getElementById('tchiloStoryUiProCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloStoryUiProCSS';
    st.textContent = [
      '/* CRITICAL: never cover the app when closed */',
      '#storyViewer.story-viewer{',
      '  position:fixed!important;inset:0!important;',
      '  background:#000!important;flex-direction:column;',
      '  display:none!important;visibility:hidden!important;pointer-events:none!important;',
      '  z-index:-1!important;opacity:0!important;',
      '}',
      '#storyViewer.story-viewer.open{',
      '  display:flex!important;visibility:visible!important;pointer-events:auto!important;',
      '  z-index:200!important;opacity:1!important;',
      '}',
      '#storyViewer .story-viewer-progress{',
      '  position:absolute;left:10px;right:10px;top:calc(8px + env(safe-area-inset-top));',
      '  z-index:20;display:flex;gap:3px;height:2.5px;margin:0!important;',
      '}',
      '#storyViewer .story-viewer-progress .seg{',
      '  flex:1;background:rgba(255,255,255,.35);border-radius:2px;overflow:hidden;height:2.5px;',
      '}',
      '#storyViewer .story-viewer-progress .seg i{display:block;height:100%;width:0;background:#fff;}',
      '#storyViewer .story-viewer-top{',
      '  position:absolute;left:0;right:0;top:calc(18px + env(safe-area-inset-top));',
      '  z-index:20;padding:8px 12px 8px 14px!important;margin:0;',
      '  background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 100%);',
      '  padding-bottom:28px!important;',
      '}',
      '#storyViewer .story-viewer-body{',
      '  position:absolute!important;inset:0!important;padding:0!important;',
      '  margin:0!important;width:100%!important;height:100%!important;',
      '  display:flex!important;align-items:center;justify-content:center;',
      '  overflow:hidden!important;z-index:1;',
      '}',
      '#storyViewer .story-viewer-body .story-media{',
      '  position:absolute!important;inset:0!important;',
      '  width:100%!important;height:100%!important;',
      '  object-fit:cover!important;border-radius:0!important;',
      '  background:#000!important;display:block!important;',
      '}',
      '#storyViewer .story-hit-left,#storyViewer .story-hit-right{z-index:4;}'
    ].join('');
    document.head.appendChild(st);
  }

  function forceHideIfClosed() {
    try {
      var v = document.getElementById('storyViewer');
      if (v && !v.classList.contains('open')) {
        v.style.display = 'none';
        v.style.visibility = 'hidden';
        v.style.pointerEvents = 'none';
        v.style.zIndex = '-1';
        v.style.opacity = '0';
      }
    } catch (e) {}
  }

  function patchCloseStory() {
    if (typeof window.closeStory !== 'function' || window.closeStory.__proHide) return;
    var orig = window.closeStory;
    window.closeStory = function () {
      var r = orig.apply(this, arguments);
      forceHideIfClosed();
      return r;
    };
    window.closeStory.__proHide = true;
  }

  function boot() {
    injectCSS();
    patchCloseStory();
    forceHideIfClosed();
  }

  boot();
  [100, 400, 1200].forEach(function (ms) {
    setTimeout(boot, ms);
  });
})();
