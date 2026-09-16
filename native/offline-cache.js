/**
 * tchilo-Pop — cache offline (estilo TikTok / Facebook)
 * Guarda posts recentes + ficheiros de media para ver sem dados.
 *
 * - Cache API: imagens e vídeos já vistos / pré-carregados
 * - localStorage: lista de posts (já existe via KEYS.posts)
 * - Pré-carrega os primeiros do feed e reels quando há rede
 */
(function () {
  'use strict';

  var CACHE_NAME = 'tchilo-media-v1';
  var META_KEY = 'tchilo_offline_meta_v1';
  var MAX_MEDIA = 40; // ficheiros no cache
  var MAX_PREFETCH = 12;

  function isOnline() {
    try {
      return navigator.onLine !== false;
    } catch (e) {
      return true;
    }
  }

  function openCache() {
    if (!('caches' in window)) return Promise.resolve(null);
    return caches.open(CACHE_NAME).catch(function () {
      return null;
    });
  }

  function isMediaUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.indexOf('blob:') === 0) return false;
    if (url.indexOf('data:') === 0) return false;
    // supabase storage, cdn, common media
    return /\.(mp4|webm|mov|m4v|jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) ||
      /supabase\.co\/storage/i.test(url) ||
      /firebasestorage/i.test(url);
  }

  function collectMediaUrls(posts) {
    var urls = [];
    var seen = {};
    (posts || []).forEach(function (p) {
      if (!p) return;
      function add(u) {
        if (!u || seen[u] || !isMediaUrl(u)) return;
        seen[u] = 1;
        urls.push(u);
      }
      if (p.media) add(p.media);
      if (p.mediaUrl) add(p.mediaUrl);
      if (p.cover) add(p.cover);
      if (Array.isArray(p.mediaItems)) {
        p.mediaItems.forEach(function (m) {
          if (m && m.url) add(m.url);
        });
      }
      try {
        if (typeof resolveMedia === 'function') {
          var m = resolveMedia(p);
          if (m && m.url) add(m.url);
        }
      } catch (e) {}
    });
    return urls;
  }

  function cacheUrl(cache, url) {
    if (!cache || !url) return Promise.resolve(false);
    return cache.match(url).then(function (hit) {
      if (hit) return true;
      return fetch(url, { mode: 'cors', credentials: 'omit', cache: 'force-cache' })
        .then(function (res) {
          if (!res || !res.ok) {
            // tenta no-cors opaco (ainda guarda bytes no dispositivo)
            return fetch(url, { mode: 'no-cors', credentials: 'omit' }).then(function (r2) {
              if (r2) return cache.put(url, r2).then(function () { return true; });
              return false;
            });
          }
          return cache.put(url, res.clone()).then(function () {
            return true;
          });
        })
        .catch(function () {
          return false;
        });
    });
  }

  function trimCache(cache) {
    if (!cache) return Promise.resolve();
    return cache.keys().then(function (keys) {
      if (keys.length <= MAX_MEDIA) return;
      var extra = keys.length - MAX_MEDIA;
      var chain = Promise.resolve();
      keys.slice(0, extra).forEach(function (req) {
        chain = chain.then(function () {
          return cache.delete(req);
        });
      });
      return chain;
    });
  }

  function saveOfflineMeta(posts) {
    try {
      var light = (posts || []).slice(0, 30).map(function (p) {
        return {
          id: p.id,
          username: p.username,
          displayName: p.displayName,
          caption: p.caption,
          media: p.media,
          mediaType: p.mediaType,
          mediaItems: p.mediaItems,
          mediaUrl: p.mediaUrl,
          cover: p.cover,
          music: p.music,
          musicMeta: p.musicMeta,
          likes: p.likes,
          comments: p.comments,
          color: p.color,
          stamp: p.stamp,
          time: p.time || 'offline',
          offline: true
        };
      });
      localStorage.setItem(META_KEY, JSON.stringify({ at: Date.now(), posts: light }));
    } catch (e) {}
  }

  function loadOfflineMeta() {
    try {
      var raw = localStorage.getItem(META_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return (data && data.posts) || [];
    } catch (e) {
      return [];
    }
  }

  /** Quando offline e o feed está vazio, injeta posts da cache local */
  function ensureOfflineFeed() {
    if (isOnline()) return;
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (Array.isArray(posts) && posts.length > 0) {
        // já há algo em KEYS.posts — bom
        setTimeout(function () {
          try {
            if (typeof renderFeed === 'function') renderFeed(true);
            if (typeof renderStories === 'function') renderStories();
          } catch (e) {}
        }, 50);
        return;
      }
      var cached = loadOfflineMeta();
      if (!cached.length) return;
      if (typeof save === 'function' && typeof KEYS !== 'undefined') {
        save(KEYS.posts, cached);
      } else {
        try {
          localStorage.setItem('tchilo_posts', JSON.stringify(cached));
        } catch (e2) {}
      }
      setTimeout(function () {
        try {
          if (typeof renderFeed === 'function') renderFeed(true);
        } catch (e3) {}
      }, 80);
    } catch (e) {}
  }

  /** Pré-carrega media dos posts atuais */
  function prefetchFromPosts(posts) {
    if (!isOnline()) return;
    var list = (posts || []).slice(0, MAX_PREFETCH);
    saveOfflineMeta(list.concat(loadOfflineMeta()).slice(0, 30));
    var urls = collectMediaUrls(list).slice(0, MAX_PREFETCH);
    if (!urls.length) return;
    openCache().then(function (cache) {
      if (!cache) return;
      var i = 0;
      function next() {
        if (i >= urls.length) {
          trimCache(cache);
          return;
        }
        var u = urls[i++];
        cacheUrl(cache, u).finally(function () {
          // espaça pedidos para não saturar a rede
          setTimeout(next, 120);
        });
      }
      next();
    });
  }

  function hookFeed() {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__offlineCache) {
      var orig = window.renderFeed;
      window.renderFeed = function () {
        var r = orig.apply(this, arguments);
        try {
          var posts = typeof getPosts === 'function' ? getPosts() : [];
          if (isOnline()) prefetchFromPosts(posts);
        } catch (e) {}
        return r;
      };
      window.renderFeed.__offlineCache = true;
    }

    if (typeof window.save === 'function' && !window.save.__offlineCache) {
      var origSave = window.save;
      window.save = function (key, val) {
        var r = origSave.apply(this, arguments);
        try {
          if (typeof KEYS !== 'undefined' && key === KEYS.posts && Array.isArray(val) && isOnline()) {
            prefetchFromPosts(val);
          }
        } catch (e) {}
        return r;
      };
      window.save.__offlineCache = true;
    }
  }

  /** Ao abrir reels offline, só mostra os que têm media em cache / local */
  function patchGetVideoPosts() {
    if (typeof window.getVideoPosts !== 'function') return;
    if (window.getVideoPosts.__offlineAware) return;
    var orig = window.getVideoPosts;
    window.getVideoPosts = function () {
      var all = [];
      try {
        all = orig.apply(this, arguments) || [];
      } catch (e) {
        all = [];
      }
      if (isOnline()) return all;
      // offline: devolve o que houver (já filtrado pela lista local)
      return all;
    };
    window.getVideoPosts.__offlineAware = true;
  }

  /** Tenta servir src de video/img a partir da Cache API se a rede falhar */
  function attachMediaFallback() {
    document.addEventListener(
      'error',
      function (ev) {
        var el = ev.target;
        if (!el || (el.tagName !== 'VIDEO' && el.tagName !== 'IMG')) return;
        var src = el.currentSrc || el.src;
        if (!src || el.dataset.offlineTried === '1') return;
        el.dataset.offlineTried = '1';
        openCache().then(function (cache) {
          if (!cache) return;
          return cache.match(src).then(function (res) {
            if (!res) return;
            return res.blob().then(function (blob) {
              var u = URL.createObjectURL(blob);
              if (el.tagName === 'VIDEO') {
                el.src = u;
                el.load();
                el.play && el.play().catch(function () {});
              } else {
                el.src = u;
              }
            });
          });
        });
      },
      true
    );
  }

  /** Banner discreto offline */
  function showOfflineBanner() {
    var id = 'tchiloOfflineBanner';
    var el = document.getElementById(id);
    if (!isOnline()) {
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.textContent = 'Sem ligação — a mostrar conteúdos guardados';
        el.style.cssText =
          'position:fixed;top:0;left:0;right:0;z-index:9999;padding:8px 12px;' +
          'background:#111;color:#fff;font:700 12px Inter,system-ui,sans-serif;' +
          'text-align:center;pointer-events:none;';
        document.body.appendChild(el);
      }
      el.style.display = 'block';
      ensureOfflineFeed();
    } else if (el) {
      el.style.display = 'none';
    }
  }

  function boot() {
    hookFeed();
    patchGetVideoPosts();
    attachMediaFallback();
    showOfflineBanner();

    window.addEventListener('online', function () {
      showOfflineBanner();
      try {
        var posts = typeof getPosts === 'function' ? getPosts() : [];
        prefetchFromPosts(posts);
        if (typeof softRefreshFeed === 'function') softRefreshFeed(false);
      } catch (e) {}
    });
    window.addEventListener('offline', function () {
      showOfflineBanner();
      ensureOfflineFeed();
    });

    setTimeout(function () {
      hookFeed();
      if (isOnline()) {
        try {
          prefetchFromPosts(typeof getPosts === 'function' ? getPosts() : []);
        } catch (e) {}
      } else {
        ensureOfflineFeed();
      }
    }, 800);

    setTimeout(hookFeed, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
