/* Tchilo Service Worker — offline shell + media cache */
/* eslint-disable no-restricted-globals */
var SW_VERSION = 'tchilo-sw-v3';
var SHELL_CACHE = SW_VERSION + '-shell';
var MEDIA_CACHE = 'tchilo-media-v1';
var RUNTIME_CACHE = SW_VERSION + '-runtime';

var PRECACHE = [
  './',
  './index.html',
  './logo.svg',
  './legal.css',
  './native/feed-stable.js',
  './native/feed-noflicker.js',
  './native/tchilo-router.js',
  './native/tchilo-app-fix.js',
  './native/chat-send-fix.js',
  './native/chat-audio-fix.js',
  './native/feed-names-fix.js',
  './native/legal-navbar-fix.js'
];

function isMediaRequest(url) {
  try {
    var u = typeof url === 'string' ? url : url.href;
    if (/\.(png|jpe?g|gif|webp|svg|mp4|webm|mov|m4v|aac|mp3|ogg)(\?|$)/i.test(u)) return true;
    if (/supabase\.co\/storage/i.test(u)) return true;
    if (/tchilo-media/i.test(u)) return true;
  } catch (e) {}
  return false;
}

function isAppShell(url) {
  try {
    var u = new URL(url, self.location.origin);
    if (u.origin !== self.location.origin) return false;
    var p = u.pathname;
    if (p === '/' || p === '/index.html') return true;
    if (p.indexOf('/native/') === 0) return true;
    if (/\.(js|css|svg|woff2?)$/i.test(p)) return true;
  } catch (e) {}
  return false;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(function (cache) {
        return cache.addAll(
          PRECACHE.map(function (p) {
            return new Request(p, { cache: 'reload' });
          })
        ).catch(function () {
          /* alguns ficheiros podem falhar — continua */
          return Promise.all(
            PRECACHE.map(function (p) {
              return cache.add(p).catch(function () {});
            })
          );
        });
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (k) {
            if (k === SHELL_CACHE || k === MEDIA_CACHE || k === RUNTIME_CACHE) return null;
            if (k.indexOf('tchilo-sw-') === 0 || k.indexOf('tchilo-media') === 0) {
              /* mantém MEDIA_CACHE partilhado com a app */
              if (k === MEDIA_CACHE) return null;
              if (k.indexOf('tchilo-media') === 0 && k !== MEDIA_CACHE) return caches.delete(k);
              if (k.indexOf('tchilo-sw-') === 0 && k !== SHELL_CACHE && k !== RUNTIME_CACHE) {
                return caches.delete(k);
              }
            }
            return null;
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  /* Não interceptar APIs / auth / paddle */
  if (
    /supabase\.co\/(auth|rest|realtime|functions)/i.test(url.href) ||
    /paddle\./i.test(url.href) ||
    /deezer\.com/i.test(url.href)
  ) {
    return;
  }

  /* Navegação HTML — network first, fallback cache/offline shell */
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1) {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  /* Media — cache first, depois rede e grava */
  if (isMediaRequest(url)) {
    event.respondWith(cacheFirstMedia(req));
    return;
  }

  /* Shell / native JS/CSS same-origin — stale-while-revalidate */
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }
});

function networkFirstNavigation(req) {
  return fetch(req)
    .then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) {
          c.put('./index.html', copy).catch(function () {});
          try {
            c.put(req, res.clone()).catch(function () {});
          } catch (e) {}
        });
      }
      return res;
    })
    .catch(function () {
      return caches.match('./index.html').then(function (hit) {
        if (hit) return hit;
        return caches.match(req).then(function (h2) {
          if (h2) return h2;
          return new Response(
            '<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Tchilo offline</title><style>body{font-family:system-ui;background:#0B0B0C;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px}h1{font-size:22px;margin:0 0 8px}p{opacity:.75;line-height:1.5}</style></head><body><div><h1>Tchilo</h1><p>Estás offline. Abre a app com internet uma vez para guardar o conteúdo.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        });
      });
    });
}

function cacheFirstMedia(req) {
  return caches.open(MEDIA_CACHE).then(function (cache) {
    return cache.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req)
        .then(function (res) {
          if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
            try {
              cache.put(req, res.clone()).catch(function () {});
            } catch (e) {}
          }
          return res;
        })
        .catch(function () {
          return new Response('', { status: 503, statusText: 'Offline' });
        });
    });
  });
}

function staleWhileRevalidate(req) {
  return caches.open(RUNTIME_CACHE).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var net = fetch(req)
        .then(function (res) {
          if (res && res.ok) {
            try {
              cache.put(req, res.clone()).catch(function () {});
            } catch (e) {}
          }
          return res;
        })
        .catch(function () {
          return hit || caches.match(req);
        });
      return hit || net;
    });
  });
}

/* Mensagens da página: aquecer cache de media */
self.addEventListener('message', function (event) {
  var data = event.data || {};
  if (data.type === 'TCHILO_WARM' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(MEDIA_CACHE).then(function (cache) {
        return Promise.all(
          data.urls.slice(0, 40).map(function (u) {
            if (!u) return null;
            return cache.match(u).then(function (hit) {
              if (hit) return;
              return fetch(u, { mode: 'cors', credentials: 'omit' })
                .then(function (res) {
                  if (res && res.ok) return cache.put(u, res);
                })
                .catch(function () {});
            });
          })
        );
      })
    );
  }
  if (data.type === 'TCHILO_SKIP_WAITING') {
    self.skipWaiting();
  }
});
