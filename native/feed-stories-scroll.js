/**
 * tchilo-Pop — Stories no mesmo scroll vertical do Feed
 * + pull-to-refresh no contentor de scroll certo (#screen-feed)
 *   com animação dos 3 pontos
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
      'min-height:0;}' +
      '#screen-feed .topbar{' +
      'position:sticky;top:0;z-index:6;flex-shrink:0;' +
      'background:var(--paper,#F3F1E9);}' +
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
      /* PTR indicator */
      '#screen-feed > .ptr-indicator{' +
      'height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;' +
      'transition:height .18s ease;flex-shrink:0;order:-1;}' +
      '#screen-feed > .ptr-indicator.show{height:48px;}' +
      '#screen-feed > .ptr-indicator .tchilo-loading-dots{pointer-events:none;}' +
      '#screen-feed > .ptr-indicator .tchilo-loading-dots i{' +
      'width:11px;height:11px;border-radius:50%;display:block;' +
      'animation:tchiloDot .7s infinite ease-in-out both;}' +
      '#screen-feed > .ptr-indicator .tchilo-loading-dots i:nth-child(1){background:#0B0B0C;animation-delay:0s;}' +
      '#screen-feed > .ptr-indicator .tchilo-loading-dots i:nth-child(2){background:#6B3DFF;animation-delay:.15s;}' +
      '#screen-feed > .ptr-indicator .tchilo-loading-dots i:nth-child(3){background:#FF2D5C;animation-delay:.3s;}' +
      '@keyframes tchiloDot{0%,80%,100%{transform:scale(.55);opacity:.45}40%{transform:scale(1);opacity:1}}';
  }

  function dotsHtml() {
    return '<span class="tchilo-loading-dots" aria-label="A atualizar"><i></i><i></i><i></i></span>';
  }

  function setupFeedPTR() {
    var screen = document.getElementById('screen-feed');
    if (!screen) return;
    if (screen.dataset.ptrUnified === '1') return;
    screen.dataset.ptrUnified = '1';

    // limpa PTR antigo no feedList (já não é scroll container)
    var feed = document.getElementById('feedList');
    if (feed) {
      try {
        delete feed.dataset.ptr;
        var old = feed.querySelector(':scope > .ptr-indicator');
        if (old) old.remove();
      } catch (e) {}
    }

    var indicator = screen.querySelector(':scope > .ptr-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'ptr-indicator';
      indicator.innerHTML = dotsHtml();
      // inserir no topo do ecrã (antes do topbar)
      screen.insertBefore(indicator, screen.firstChild);
    }

    var startY = 0;
    var pulling = false;
    var armed = false;
    var refreshing = false;

    screen.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        if (screen.scrollTop <= 2) {
          startY = e.touches[0].clientY;
          pulling = true;
          armed = false;
        } else {
          pulling = false;
        }
      },
      { passive: true }
    );

    screen.addEventListener(
      'touchmove',
      function (e) {
        if (!pulling || refreshing || !e.touches || !e.touches[0]) return;
        var dy = e.touches[0].clientY - startY;
        if (dy > 12 && screen.scrollTop <= 2) {
          armed = dy > 56;
          indicator.classList.add('show');
        } else if (dy < 8) {
          indicator.classList.remove('show');
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
        if (armed && !refreshing) {
          refreshing = true;
          indicator.classList.add('show');
          var done = function () {
            setTimeout(function () {
              indicator.classList.remove('show');
              refreshing = false;
            }, 450);
          };
          try {
            var p =
              typeof softRefreshFeed === 'function'
                ? softRefreshFeed(false)
                : null;
            Promise.resolve(p)
              .catch(function () {})
              .then(done);
          } catch (err) {
            done();
          }
        } else if (!refreshing) {
          indicator.classList.remove('show');
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
