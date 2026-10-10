/**
 * Tchilo — pull-to-refresh correto
 * Só atualiza se o utilizador PUXAR para baixo no topo.
 * Não refresca só por chegar ao topo / toque leve.
 */
(function () {
  'use strict';
  if (window.__tchiloPtrFixV1) return;
  window.__tchiloPtrFixV1 = true;

  var MIN_PULL = 72; /* px mínimos de puxão */
  var ARM_PULL = 80;

  function softRefresh() {
    try {
      if (typeof window.softRefreshFeed === 'function') return window.softRefreshFeed(false);
    } catch (e) {}
    try {
      if (typeof window.tchiloRefreshFeed === 'function') return window.tchiloRefreshFeed();
    } catch (e2) {}
    try {
      if (typeof window.renderFeed === 'function') window.renderFeed();
    } catch (e3) {}
  }

  function bindPTR(scrollEl) {
    if (!scrollEl || scrollEl.__tchiloPtrV1) return;
    scrollEl.__tchiloPtrV1 = true;

    /* desativa PTR antigo do index neste elemento */
    try {
      scrollEl.dataset.ptr = '1';
    } catch (e) {}

    var startY = 0;
    var pulling = false;
    var armed = false;
    var dy = 0;

    var indicator = scrollEl.querySelector(':scope > .ptr-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'ptr-indicator';
      indicator.innerHTML =
        '<span class="tchilo-loading-dots" aria-label="A atualizar"><i></i><i></i><i></i></span>';
      if (scrollEl.firstChild) scrollEl.insertBefore(indicator, scrollEl.firstChild);
      else scrollEl.appendChild(indicator);
    }

    scrollEl.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        /* só começa se já estás no topo */
        if ((scrollEl.scrollTop || 0) > 1) {
          pulling = false;
          armed = false;
          return;
        }
        startY = e.touches[0].clientY;
        pulling = true;
        armed = false;
        dy = 0;
      },
      { passive: true }
    );

    scrollEl.addEventListener(
      'touchmove',
      function (e) {
        if (!pulling || !e.touches || !e.touches[0]) return;
        if ((scrollEl.scrollTop || 0) > 1) {
          pulling = false;
          armed = false;
          if (indicator) indicator.classList.remove('show');
          return;
        }
        dy = e.touches[0].clientY - startY;
        /* só puxão para BAIXO conta */
        if (dy < MIN_PULL) {
          armed = false;
          if (indicator) indicator.classList.remove('show');
          return;
        }
        armed = dy >= ARM_PULL;
        if (indicator) indicator.classList.add('show');
      },
      { passive: true }
    );

    scrollEl.addEventListener(
      'touchend',
      function () {
        if (!pulling) return;
        pulling = false;
        if (armed && dy >= ARM_PULL) {
          if (indicator) indicator.classList.add('show');
          Promise.resolve()
            .then(function () {
              return softRefresh();
            })
            .catch(function () {})
            .then(function () {
              setTimeout(function () {
                if (indicator) indicator.classList.remove('show');
              }, 450);
            });
        } else {
          if (indicator) indicator.classList.remove('show');
        }
        armed = false;
        dy = 0;
      },
      { passive: true }
    );
  }

  function install() {
    var candidates = [
      document.getElementById('feedList'),
      document.getElementById('screen-feed'),
      document.querySelector('#screen-feed .feed-scroll')
    ];
    candidates.forEach(function (el) {
      if (el) bindPTR(el);
    });
  }

  /* substituir setupPullToRefresh do index para o feed */
  function patchIndex() {
    try {
      if (typeof window.setupPullToRefresh === 'function' && !window.setupPullToRefresh.__tchiloPtr) {
        var orig = window.setupPullToRefresh;
        window.setupPullToRefresh = function (scrollEl, onRefresh) {
          if (!scrollEl) return;
          var id = scrollEl.id || '';
          if (
            id === 'feedList' ||
            id === 'screen-feed' ||
            (scrollEl.closest && scrollEl.closest('#screen-feed'))
          ) {
            /* usa o nosso PTR, não o antigo */
            bindPTR(scrollEl);
            return;
          }
          return orig.apply(this, arguments);
        };
        window.setupPullToRefresh.__tchiloPtr = true;
      }
    } catch (e) {}
  }

  /* desativar PTR duplicado do feed-stories-scroll no mesmo gesto */
  try {
    if (typeof window.setupFeedPTR === 'function') {
      window.setupFeedPTR = function () {};
    }
  } catch (e) {}

  patchIndex();
  install();
  setTimeout(function () {
    patchIndex();
    install();
  }, 400);
  setTimeout(install, 1500);
})();
