/**
 * tchilo-Pop — Stories no mesmo scroll do Feed
 * + pull-to-refresh: 3 pontos por cima dos stories
 * + barra de cima (topbar) sobe com o scroll do feed
 */
(function () {
  'use strict';

  function injectCSS() {
    var st = document.getElementById('tchiloFeedStoriesScrollCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloFeedStoriesScrollCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#screen-feed.active{' +
      'display:flex!important;flex-direction:column!important;' +
      'overflow-y:auto!important;overflow-x:hidden!important;' +
      '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;' +
      'min-height:0;position:relative;}' +
      /* Topbar no fluxo do scroll — sobe junto com o feed ao arrastar para cima */
      '#screen-feed .topbar{' +
      'position:relative!important;top:auto!important;z-index:8;flex-shrink:0;' +
      'background:var(--paper,#F3F1E9)!important;' +
      'transition:none!important;}' +
      '#screen-feed .stories{' +
      'flex-shrink:0!important;position:relative!important;' +
      'max-height:none!important;height:auto!important;' +
      'opacity:1!important;pointer-events:auto!important;' +
      'overflow-x:auto!important;overflow-y:hidden!important;}' +
      '#screen-feed #feedList.feed{' +
      'flex:0 0 auto!important;min-height:0!important;' +
      'overflow:visible!important;height:auto!important;' +
      'max-height:none!important;}' +
      '#appFrame.chrome-hidden .stories{' +
      'max-height:none!important;height:auto!important;' +
      'padding-top:10px!important;padding-bottom:12px!important;' +
      'border-bottom-width:3px!important;' +
      'opacity:1!important;pointer-events:auto!important;overflow-x:auto!important;}' +
      /* 3 pontos por cima da fila de stories — não empurra a topbar */
      '#screen-feed .ptr-indicator,' +
      '#screen-feed .stories > .ptr-indicator{' +
      'position:absolute;left:0;right:0;top:0;z-index:7;' +
      'height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;' +
      'transition:height .18s ease;pointer-events:none;' +
      'background:transparent;}' +
      '#screen-feed .ptr-indicator.show,' +
      '#screen-feed .stories > .ptr-indicator.show{' +
      'height:44px;}' +
      '#screen-feed .ptr-indicator .tchilo-loading-dots{' +
      'display:inline-flex;align-items:center;justify-content:center;gap:8px;' +
      'min-width:78px;height:28px;pointer-events:none;}' +
      '#screen-feed .ptr-indicator .tchilo-loading-dots span{' +
      'width:8px;height:8px;border-radius:50%;background:#0B0B0C;' +
      'display:inline-block;animation:tchiloPtrDot 0.9s ease-in-out infinite;}' +
      '#screen-feed .ptr-indicator .tchilo-loading-dots span:nth-child(2){animation-delay:.15s;}' +
      '#screen-feed .ptr-indicator .tchilo-loading-dots span:nth-child(3){animation-delay:.3s;}' +
      '@keyframes tchiloPtrDot{0%,80%,100%{opacity:.25;transform:scale(.85)}40%{opacity:1;transform:scale(1)}}';
  }

  function ensurePtrIndicator() {
    var stories = document.querySelector('#screen-feed .stories');
    if (!stories) return null;
    var ind = stories.querySelector('.ptr-indicator');
    if (!ind) {
      ind = document.createElement('div');
      ind.className = 'ptr-indicator';
      ind.innerHTML =
        '<div class="tchilo-loading-dots" aria-hidden="true">' +
        '<span></span><span></span><span></span></div>';
      stories.insertBefore(ind, stories.firstChild);
    }
    return ind;
  }

  function setupFeedPTR() {
    var screen = document.getElementById('screen-feed');
    if (!screen || screen.dataset.ptrReady === '1') return;
    screen.dataset.ptrReady = '1';

    var startY = 0;
    var pulling = false;
    var armed = false;
    var refreshing = false;

    screen.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches || !e.touches.length) return;
        if (screen.scrollTop > 2) return;
        startY = e.touches[0].clientY;
        pulling = true;
        armed = false;
      },
      { passive: true }
    );

    screen.addEventListener(
      'touchmove',
      function (e) {
        if (!pulling || refreshing) return;
        if (!e.touches || !e.touches.length) return;
        if (screen.scrollTop > 2) {
          pulling = false;
          return;
        }
        var dy = e.touches[0].clientY - startY;
        var ind = ensurePtrIndicator();
        if (!ind) return;
        if (dy > 12) {
          armed = dy > 56;
          ind.classList.add('show');
        } else {
          ind.classList.remove('show');
          armed = false;
        }
      },
      { passive: true }
    );

    screen.addEventListener(
      'touchend',
      function () {
        if (!pulling) return;
        pulling = false;
        var ind = ensurePtrIndicator();
        if (armed && !refreshing && ind) {
          refreshing = true;
          ind.classList.add('show');
          function done() {
            refreshing = false;
            if (ind) ind.classList.remove('show');
          }
          try {
            var p =
              typeof window.tchiloRefreshFeed === 'function'
                ? window.tchiloRefreshFeed()
                : typeof window.refreshFeed === 'function'
                  ? window.refreshFeed()
                  : null;
            if (p && typeof p.then === 'function') p.then(done).catch(done);
            else setTimeout(done, 900);
          } catch (err) {
            done();
          }
        } else if (ind && !refreshing) {
          ind.classList.remove('show');
        }
        armed = false;
      },
      { passive: true }
    );
  }

  function rebindChromeScroll() {
    var feed = document.getElementById('feedList');
    var screen = document.getElementById('screen-feed');
    var frame = document.getElementById('appFrame');
    if (!screen || !frame) return;

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
      setupFeedPTR();
    };
    window.setupFeedChromeAutoHide.__unified = true;
  }

  function boot() {
    injectCSS();
    patchSetupChrome();
    rebindChromeScroll();
    setupFeedPTR();
    setTimeout(function () {
      injectCSS();
      patchSetupChrome();
      rebindChromeScroll();
      setupFeedPTR();
    }, 500);
    setTimeout(setupFeedPTR, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
