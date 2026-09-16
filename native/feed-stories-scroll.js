/**
 * tchilo-Pop — Stories no mesmo scroll vertical do Feed
 * - #screen-feed passa a ser o contentor de scroll
 * - #feedList deixa de ser scroll isolado
 * - chrome-hidden deixa de colapsar .stories (sobe/desce naturalmente)
 */
(function () {
  'use strict';

  function injectCSS() {
    if (document.getElementById('tchiloFeedStoriesScrollCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeedStoriesScrollCSS';
    st.textContent =
      '/* Scroll único: ecrã do feed */' +
      '#screen-feed.active{' +
      'display:flex!important;flex-direction:column!important;' +
      'overflow-y:auto!important;overflow-x:hidden!important;' +
      '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;' +
      'min-height:0;}' +
      '#screen-feed .topbar{' +
      'position:sticky;top:0;z-index:6;flex-shrink:0;' +
      'background:var(--paper);}' +
      '#screen-feed .stories{' +
      'flex-shrink:0!important;position:relative!important;' +
      'max-height:none!important;height:auto!important;' +
      'opacity:1!important;pointer-events:auto!important;' +
      'overflow-x:auto!important;overflow-y:hidden!important;}' +
      '#screen-feed #feedList.feed{' +
      'flex:0 0 auto!important;min-height:0!important;' +
      'overflow:visible!important;height:auto!important;' +
      'max-height:none!important;}' +
      '/* Não esconder stories no chrome-hidden — sobem com o scroll */' +
      '#appFrame.chrome-hidden .stories{' +
      'max-height:none!important;height:auto!important;' +
      'padding-top:10px!important;padding-bottom:12px!important;' +
      'border-bottom-width:3px!important;' +
      'opacity:1!important;pointer-events:auto!important;overflow-x:auto!important;}' +
      '/* topbar pode continuar a esconder-se no chrome se existir, mas stories não */';
    document.head.appendChild(st);
  }

  function rebindChromeScroll() {
    var feed = document.getElementById('feedList');
    var screen = document.getElementById('screen-feed');
    var frame = document.getElementById('appFrame');
    if (!screen || !frame) return;

    // Desativar listener antigo no feedList isolado
    if (feed) {
      try {
        delete feed.dataset.chromeScrollReady;
      } catch (e) {}
    }

    if (screen.dataset.unifiedScroll === '1') return;
    screen.dataset.unifiedScroll = '1';

    var lastTop = screen.scrollTop || 0;
    var ticking = false;

    screen.addEventListener(
      'scroll',
      function () {
        if (typeof feedChromeLock !== 'undefined' && feedChromeLock) return;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var top = screen.scrollTop || 0;
          var dy = top - lastTop;
          lastTop = top;
          // Só esconde navbar (e opcionalmente topbar), NÃO stories
          try {
            if (typeof setFeedChromeHidden === 'function') {
              if (dy > 8 && top > 48) setFeedChromeHidden(true);
              else if (dy < -8) setFeedChromeHidden(false);
              else if (top < 24) setFeedChromeHidden(false);
            } else if (frame) {
              if (dy > 8 && top > 48) frame.classList.add('chrome-hidden');
              else if (dy < -8 || top < 24) frame.classList.remove('chrome-hidden');
            }
          } catch (e2) {}
        });
      },
      { passive: true }
    );
  }

  function patchSetupChrome() {
    if (typeof window.setupFeedChromeAutoHide !== 'function') return;
    if (window.setupFeedChromeAutoHide.__unified) return;
    var orig = window.setupFeedChromeAutoHide;
    window.setupFeedChromeAutoHide = function () {
      try {
        orig.apply(this, arguments);
      } catch (e) {}
      rebindChromeScroll();
    };
    window.setupFeedChromeAutoHide.__unified = true;
  }

  function boot() {
    injectCSS();
    patchSetupChrome();
    rebindChromeScroll();
    setTimeout(function () {
      injectCSS();
      patchSetupChrome();
      rebindChromeScroll();
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
