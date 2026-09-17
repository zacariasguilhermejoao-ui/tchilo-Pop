/**
 * tchilo-Pop — força pesquisa/destaques de música via deezer-fetch
 * Cobre post-music-feed.js e media-editor.js sem reescrever ficheiros grandes.
 */
(function () {
  'use strict';

  function waitApi(cb, tries) {
    tries = tries || 0;
    if (typeof window.tchiloCatalogFetch === 'function') {
      cb();
      return;
    }
    if (tries > 40) return;
    setTimeout(function () {
      waitApi(cb, tries + 1);
    }, 150);
  }

  function patchOpenPostMusic() {
    // Quando a lista mostra "Não foi possível" / "Sem resultados" após erro, recarrega
    document.addEventListener(
      'click',
      function (ev) {
        var t = ev.target;
        if (!t) return;
        var empty = t.closest && t.closest('#pmList .empty, #meMusicList .me-empty');
        if (!empty) return;
        if (typeof window.tchiloLoadTopTracks !== 'function') return;
        empty.textContent = 'A carregar…';
        window.tchiloLoadTopTracks(true).then(function (list) {
          // dispara input vazio para re-render se existir
          var search = document.getElementById('pmSearch') || document.getElementById('meMusicSearch');
          if (search) {
            search.dispatchEvent(new Event('input', { bubbles: true }));
          }
          // tenta reabrir lista via botões de tab
          var tab = document.getElementById('pmTabDestaque');
          if (tab) tab.click();
        }).catch(function () {
          empty.textContent = 'Sem ligação às músicas. Verifica a internet.';
        });
      },
      true
    );
  }

  /**
   * Monkey-patch: qualquer função que use script JSONP Deezer
   * Intercepta criação de script para api.deezer.com e cancela + usa fetch.
   */
  function interceptDeezerScripts() {
    var origAppend = Node.prototype.appendChild;
    Node.prototype.appendChild = function (child) {
      try {
        if (
          child &&
          child.tagName === 'SCRIPT' &&
          child.src &&
          /api\.deezer\.com/i.test(child.src) &&
          typeof window.tchiloCatalogFetch === 'function'
        ) {
          var src = child.src;
          var cbMatch = src.match(/callback=([A-Za-z0-9_]+)/);
          var pathMatch = src.match(/api\.deezer\.com\/(.+?)(?:\?|$)/);
          var pathQuery = pathMatch ? pathMatch[1] : '';
          if (src.indexOf('?') >= 0) {
            var q = src.split('?')[1] || '';
            // reconstrói pathQuery com query sem callback/output
            var parts = q.split('&').filter(function (p) {
              return p && !/^callback=/.test(p) && !/^output=/.test(p);
            });
            var basePath = (pathMatch ? pathMatch[1].split('?')[0] : '');
            pathQuery = basePath + (parts.length ? '?' + parts.join('&') : '');
          }
          var cbName = cbMatch && cbMatch[1];
          window.tchiloCatalogFetch(pathQuery).then(function (data) {
            if (cbName && typeof window[cbName] === 'function') {
              window[cbName](data);
            }
          }).catch(function () {
            if (cbName && typeof window[cbName] === 'function') {
              try {
                window[cbName]({ data: [] });
              } catch (e) {}
            }
          });
          // não injecta o script JSONP
          return child;
        }
      } catch (e) {}
      return origAppend.apply(this, arguments);
    };
  }

  function boot() {
    interceptDeezerScripts();
    waitApi(function () {
      patchOpenPostMusic();
      // pré-carrega destaques
      if (typeof window.tchiloLoadTopTracks === 'function') {
        window.tchiloLoadTopTracks(false).catch(function () {});
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
