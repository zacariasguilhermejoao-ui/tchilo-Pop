/* Tchilo Service Worker — offline shell + media cache + push + share target */
/* eslint-disable no-restricted-globals */
var SW_VERSION = 'tchilo-sw-v5';
var SHELL_CACHE = SW_VERSION + '-shell';
var MEDIA_CACHE = 'tchilo-media-v1';
var RUNTIME_CACHE = SW_VERSION + '-runtime';

var PRECACHE = [
  './',
  './index.html',
  './logo.svg',
  './legal.css',
  './manifest.webmanifest',
  './native/feed-stable.js',
  './native/feed-noflicker.js',
  './native/tchilo-router.js',
  './native/tchilo-app-fix.js',
  './native/chat-send-fix.js',
  './native/chat-audio-fix.js',
  './native/feed-names-fix.js',
  './native/legal-navbar-fix.js',
  './native/tchilo-offline.js',
  './native/tchilo-push.js',
  './native/tchilo-share-target.js'
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

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(function (cache) {
        return Promise.all(
          PRECACHE.map(function (p) {
            return cache.add(p).catch(function () {});
          })
        );
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
            if (k === SHELL_CACHE || k === MEDIA_CACHE || k === RUNTIME_CACHE || k === 'tchilo-notif-v1') return null;
            if (k.indexOf('tchilo-sw-') === 0) return caches.delete(k);
            return null;
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

/* Web Share Target: POST multipart → redireciona para app com dados em clients */
function handleShareTargetPost(event) {
  event.respondWith(
    (async function () {
      try {
        var formData = await event.request.formData();
        var title = formData.get('title') || '';
        var text = formData.get('text') || '';
        var url = formData.get('url') || '';
        var media = formData.getAll('media');
        var filesMeta = [];

        /* Guardar ficheiros em cache temporária para a página ler */
        var cache = await caches.open('tchilo-share-v1');
        await cache.delete('pending');
        var payload = {
          title: String(title),
          text: String(text),
          url: String(url),
          fileCount: media.length,
          at: Date.now()
        };

        for (var i = 0; i < media.length; i++) {
          var f = media[i];
          if (!f || typeof f.arrayBuffer !== 'function') continue;
          var buf = await f.arrayBuffer();
          var mime = f.type || 'application/octet-stream';
          var name = f.name || 'shared-' + i;
          var key = 'file-' + i;
          await cache.put(
            key,
            new Response(buf, {
              headers: {
                'Content-Type': mime,
                'X-Filename': encodeURIComponent(name)
              }
            })
          );
          filesMeta.push({ key: key, name: name, mime: mime, size: buf.byteLength });
        }
        payload.files = filesMeta;
        await cache.put(
          'pending',
          new Response(JSON.stringify(payload), {
            headers: { 'Content-Type': 'application/json' }
          })
        );

        /* Notificar clientes abertos */
        var list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (var j = 0; j < list.length; j++) {
          list[j].postMessage({ type: 'TCHILO_SHARE_TARGET', payload: payload });
        }

        return Response.redirect('/?share=1', 303);
      } catch (err) {
        console.warn('[SW] share target', err);
        return Response.redirect('/?share=1', 303);
      }
    })()
  );
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  /* Share Target POST */
  if (req.method === 'POST' && /\/share-target\/?$/.test(url.pathname)) {
    handleShareTargetPost(event);
    return;
  }

  if (req.method !== 'GET') return;

  if (
    /supabase\.co\/(auth|rest|realtime|functions)/i.test(url.href) ||
    /paddle\./i.test(url.href) ||
    /deezer\.com/i.test(url.href)
  ) {
    return;
  }

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1) {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  if (isMediaRequest(url)) {
    event.respondWith(cacheFirstMedia(req));
    return;
  }

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

/* ===== PUSH NOTIFICATIONS (app fechada / background) ===== */
self.addEventListener('push', function (event) {
  var title = 'Tchilo';
  var options = {
    body: 'Tens uma nova notificação',
    icon: './logo.svg',
    badge: './logo.svg',
    tag: 'tchilo-push',
    renotify: true,
    data: { url: './' },
    vibrate: [120, 60, 120]
  };

  try {
    if (event.data) {
      var payload = null;
      try {
        payload = event.data.json();
      } catch (e) {
        try {
          payload = { body: event.data.text() };
        } catch (e2) {}
      }
      if (payload) {
        if (payload.title) title = String(payload.title);
        if (payload.body) options.body = String(payload.body);
        if (payload.icon) options.icon = payload.icon;
        if (payload.badge) options.badge = payload.badge;
        if (payload.tag) options.tag = String(payload.tag);
        if (payload.url) options.data = { url: payload.url };
        if (payload.data && typeof payload.data === 'object') {
          options.data = Object.assign({}, options.data || {}, payload.data);
          if (payload.data.url) options.data.url = payload.data.url;
        }
        if (payload.image) options.image = payload.image;
      }
    }
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(title, options).then(function () {
      return caches.open('tchilo-notif-v1').then(function (cache) {
        var body = JSON.stringify({
          title: title,
          body: options.body,
          url: (options.data && options.data.url) || './',
          at: Date.now()
        });
        return cache.put(
          'last-notification',
          new Response(body, { headers: { 'Content-Type': 'application/json' } })
        );
      }).catch(function () {});
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = './';
  try {
    if (event.notification && event.notification.data && event.notification.data.url) {
      target = event.notification.data.url;
    }
  } catch (e) {}

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url && 'focus' in c) {
          c.postMessage({ type: 'TCHILO_NOTIF_CLICK', url: target });
          return c.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(target);
      }
    })
  );
});

self.addEventListener('sync', function (event) {
  if (event.tag === 'tchilo-push-sync') {
    event.waitUntil(
      caches.open('tchilo-notif-v1').then(function (cache) {
        return cache.match('pending-actions').then(function (res) {
          if (!res) return;
          return res.json().then(function () {
            return cache.delete('pending-actions');
          }).catch(function () {});
        });
      })
    );
  }
});
