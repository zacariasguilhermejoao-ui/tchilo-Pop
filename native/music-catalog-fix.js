/**
 * tchilo-Pop — força catálogo de músicas via JSONP Deezer
 * Corrige "Não foi possível carregar músicas" (allorigins offline)
 */
(function () {
  'use strict';
  if (window.__tchiloMusicCatalogFixV1) return;
  window.__tchiloMusicCatalogFixV1 = true;

  function jsonp(pathQuery) {
    return new Promise(function (resolve, reject) {
      var cb = 'tchiloMc_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
      var script = document.createElement('script');
      var timer = setTimeout(function () {
        cleanup();
        reject(new Error('timeout'));
      }, 12000);
      function cleanup() {
        clearTimeout(timer);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[cb] = function (data) {
        cleanup();
        resolve(data);
      };
      script.onerror = function () {
        cleanup();
        reject(new Error('jsonp'));
      };
      var base = 'https://api.deezer.com/' + pathQuery;
      script.src = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'output=jsonp&callback=' + cb;
      document.head.appendChild(script);
    });
  }

  function mapTrack(t) {
    if (!t) return null;
    return {
      id: String(t.id),
      title: t.title || t.title_short || 'Música',
      artist: (t.artist && t.artist.name) || 'Artista',
      preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || '',
      artistObj: t.artist
    };
  }

  function parseList(data) {
    var list = (data && data.data) || [];
    return list.map(function (t) {
      var m = mapTrack(t);
      if (!m) return null;
      return {
        id: m.id,
        title: m.title,
        preview: m.preview,
        artist: t.artist || { name: m.artist },
        album: t.album
      };
    }).filter(Boolean);
  }

  function loadTop(force) {
    return jsonp('chart/0/tracks?limit=40').then(parseList);
  }

  function search(q) {
    q = String(q || '').trim();
    if (!q) return loadTop(false);
    return jsonp('search?q=' + encodeURIComponent(q) + '&limit=40').then(parseList);
  }

  window.tchiloLoadTopTracks = function () {
    return loadTop(false);
  };
  window.tchiloSearchTracks = search;
  window.tchiloCatalogFetch = function (path) {
    return jsonp(path);
  };

  function fixFallbackList() {
    var list = document.getElementById('tchiloMusicList');
    var q = document.getElementById('tchiloMusicQ');
    if (!list || list.__tchiloFixed) return;
    list.__tchiloFixed = true;

    function render(tracks) {
      list.innerHTML = '';
      (tracks || []).forEach(function (t) {
        var row = document.createElement('button');
        row.type = 'button';
        row.style.cssText =
          'display:block;width:100%;text-align:left;padding:12px;margin:0 0 8px;border:2px solid #0B0B0C;border-radius:12px;background:#fff;font-weight:700;cursor:pointer';
        var name = (t.artist && t.artist.name) ? ' · ' + t.artist.name : '';
        row.textContent = (t.title || 'Faixa') + name;
        row.onclick = function () {
          window._pendingMusicMeta = {
            title: t.title || '',
            artist: (t.artist && t.artist.name) || '',
            preview: t.preview || '',
            id: t.id || null
          };
          window._pendingMusic =
            (t.title || '') +
            ((t.artist && t.artist.name) ? ' · ' + t.artist.name : '');
          try {
            if (typeof window.updateMusicBtn === 'function') window.updateMusicBtn();
          } catch (e) {}
          var overlay = document.getElementById('tchiloMusicFallback');
          if (overlay) overlay.remove();
          try {
            if (typeof showToast === 'function') showToast('Música selecionada');
          } catch (e2) {}
        };
        list.appendChild(row);
      });
      if (!(tracks || []).length) {
        list.innerHTML =
          '<div style="padding:12px;opacity:.7;text-align:center">Sem resultados</div>';
      }
    }

    function doSearch(term) {
      list.innerHTML =
        '<div style="padding:12px;text-align:center;opacity:.7">A carregar…</div>';
      search(term)
        .then(render)
        .catch(function () {
          list.innerHTML =
            '<div style="padding:12px;text-align:center;color:#c00">Não foi possível carregar músicas</div>';
        });
    }

    if (q && !q.__tchiloFixed) {
      q.__tchiloFixed = true;
      var timer = null;
      q.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          doSearch((q.value || '').trim());
        }, 350);
      });
    }
    doSearch(q ? (q.value || '').trim() : '');
  }

  var obs = new MutationObserver(function () {
    if (document.getElementById('tchiloMusicList')) fixFallbackList();
  });
  try {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(function () {
    if (document.getElementById('tchiloMusicList')) fixFallbackList();
  }, 800);

  setTimeout(function () {
    loadTop(false).catch(function () {});
  }, 500);
})();
