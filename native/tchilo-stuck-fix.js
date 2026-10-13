/**
 * tchilo-Pop — fix stuck processing
 * 1) Força fim de loading flags após timeout
 * 2) Esconde UI de "A atualizar / A carregar" preso
 * 3) Garante que loadPublicFeed limpa o estado mesmo com erro
 */
(function () {
  'use strict';
  if (window.__tchiloStuckFixV1) return;
  window.__tchiloStuckFixV1 = true;

  function clearFeedLoading() {
    try {
      window.__publicFeedLoading = false;
    } catch (e) {}
    try {
      document.querySelectorAll('.empty, .tchilo-loading-dots, [class*="loading"]').forEach(function (el) {
        var t = (el.textContent || '').toLowerCase();
        if (
          t.indexOf('atualizar') >= 0 ||
          t.indexOf('carregar') >= 0 ||
          t.indexOf('loading') >= 0 ||
          t.indexOf('process') >= 0
        ) {
          var posts = [];
          try {
            if (typeof getPosts === 'function') posts = getPosts() || [];
          } catch (e2) {}
          if (posts.length || t.indexOf('atualizar') >= 0) {
            el.style.display = 'none';
          }
        }
      });
    } catch (e3) {}
  }

  function forceStopProcessing() {
    clearFeedLoading();
    try {
      if (typeof renderFeed === 'function') {
        var posts = typeof getPosts === 'function' ? getPosts() : [];
        if (posts && posts.length) renderFeed();
      }
    } catch (e) {}
  }

  // Após 4s / 8s / 15s: se ainda estiver "a processar", força fim
  setTimeout(forceStopProcessing, 4000);
  setTimeout(forceStopProcessing, 8000);
  setTimeout(forceStopProcessing, 15000);

  function hookLoad() {
    if (typeof window.loadPublicFeedFromSupabase === 'function' && !window.loadPublicFeedFromSupabase.__stuckFix) {
      var orig = window.loadPublicFeedFromSupabase;
      window.loadPublicFeedFromSupabase = async function () {
        try {
          window.__publicFeedLoading = true;
          var r = await orig.apply(this, arguments);
          window.__publicFeedLoading = false;
          window.__publicFeedLoaded = true;
          clearFeedLoading();
          return r;
        } catch (e) {
          window.__publicFeedLoading = false;
          clearFeedLoading();
          throw e;
        }
      };
      window.loadPublicFeedFromSupabase.__stuckFix = true;
    }
  }
  hookLoad();
  setTimeout(hookLoad, 500);
  setTimeout(hookLoad, 2000);

  console.log('[Tchilo] stuck-fix v1: timeout de segurança + limpa loading');
})();
