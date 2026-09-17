/**
 * tchilo-Pop — catálogo de músicas fiável no Android/iOS/Web
 * JSONP falha no WebView Capacitor; usa fetch + proxies de fallback.
 */
(function () {
  'use strict';

  var TOP_TTL = 10 * 60 * 1000;
  var topCache = null;
  var topCacheAt = 0;

  function mapTrack(t) {
    if (!t) return null;
    return {
      id: String(t.id),
      title: t.title || t.title_short || 'Música',
      artist: (t.artist && t.artist.name) || 'Artista',
      preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || ''
    };
  }

  function parsePayload(data) {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    var list = (data && data.data) || (Array.isArray(data) ? data : []);
    return list.map(mapTrack).filter(Boolean);
  }

  function fetchJson(url, timeoutMs) {
    timeoutMs = timeoutMs || 10000;
    return new Promise(function (resolve, reject) {
      var done = false;
      var t = setTimeout(function () {
        if (done) return;
        done = true;
        reject(new Error('timeout'));
      }, timeoutMs);
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'default'
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http ' + res.status);
          return res.json();
        })
        .then(function (json) {
          if (done) return;
          done = true;
          clearTimeout(t);
          resolve(json);
        })
        .catch(function (err) {
          if (done) return;
          done = true;
          clearTimeout(t);
          reject(err);
        });
    });
  }

  function fetchText(url, timeoutMs) {
    timeoutMs = timeoutMs || 10000;
    return new Promise(function (resolve, reject) {
      var done = false;
      var t = setTimeout(function () {
        if (done) return;
        done = true;
        reject(new Error('timeout'));
      }, timeoutMs);
      fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' })
        .then(function (res) {
          if (!res.ok) throw new Error('http ' + res.status);
          return res.text();
        })
        .then(function (txt) {
          if (done) return;
          done = true;
          clearTimeout(t);
          resolve(txt);
        })
        .catch(function (err) {
          if (done) return;
          done = true;
          clearTimeout(t);
          reject(err);
        });
    });
  }

  function jsonp(pathQuery) {
    return new Promise(function (resolve, reject) {
      var cb = 'tchiloDz_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
      var script = document.createElement('script');
      var timeout = setTimeout(function () {
        cleanup();
        reject(new Error('jsonp timeout'));
      }, 10000);
      function cleanup() {
        clearTimeout(timeout);
        try {
          delete window[cb];
        } catch (e) {
          window[cb] = undefined;
        }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[cb] = function (data) {
        cleanup();
        resolve(data);
      };
      var base = 'https://api.deezer.com/' + pathQuery;
      script.src = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'output=jsonp&callback=' + cb;
      script.onerror = function () {
        cleanup();
        reject(new Error('jsonp network'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * pathQuery ex: chart/0/tracks?limit=40  |  search?q=hello&limit=40
   */
  function catalogFetch(pathQuery) {
    var direct = 'https://api.deezer.com/' + pathQuery;
    // proxies públicos (só leitura de catálogo)
    var proxied =
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(direct);
    var proxied2 =
      'https://corsproxy.io/?' + encodeURIComponent(direct);

    return fetchJson(direct)
      .catch(function () {
        return fetchText(proxied).then(function (txt) {
          return JSON.parse(txt);
        });
      })
      .catch(function () {
        return fetchJson(proxied2);
      })
      .catch(function () {
        return jsonp(pathQuery);
      });
  }

  function loadTopTracks(force) {
    if (!force && topCache && Date.now() - topCacheAt < TOP_TTL) {
      return Promise.resolve(topCache);
    }
    try {
      var raw = sessionStorage.getItem('tchilo_top_tracks');
      if (!force && raw) {
        var o = JSON.parse(raw);
        if (o && o.list && o.list.length && Date.now() - (o.at || 0) < TOP_TTL) {
          topCache = o.list;
          topCacheAt = o.at;
          return Promise.resolve(topCache);
        }
      }
    } catch (e) {}

    return catalogFetch('chart/0/tracks?limit=40')
      .then(function (data) {
        var list = parsePayload(data);
        topCache = list;
        topCacheAt = Date.now();
        try {
          sessionStorage.setItem(
            'tchilo_top_tracks',
            JSON.stringify({ at: topCacheAt, list: list })
          );
        } catch (e2) {}
        return list;
      });
  }

  function searchTracks(q) {
    q = String(q || '').trim();
    if (!q) return loadTopTracks(false);
    return catalogFetch('search?q=' + encodeURIComponent(q) + '&limit=40').then(parsePayload);
  }

  // API global
  window.tchiloCatalogFetch = catalogFetch;
  window.tchiloLoadTopTracks = loadTopTracks;
  window.tchiloSearchTracks = searchTracks;
  window.tchiloMapTrack = mapTrack;

  // Pré-aquece catálogo
  setTimeout(function () {
    loadTopTracks(false).catch(function () {});
  }, 400);
})();
