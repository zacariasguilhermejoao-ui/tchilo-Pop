/**
 * Tchilo — notificações push (Web Push + Capacitor + local)
 * App fechada / background via Service Worker.
 */
(function () {
  'use strict';
  if (window.__tchiloPushBoot) return;
  window.__tchiloPushBoot = true;

  var VAPID_PUBLIC =
    (window.TCHILO_VAPID_PUBLIC_KEY ||
      localStorage.getItem('tchilo_vapid_public') ||
      '') + '';

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(base64);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function canNotify() {
    return typeof Notification !== 'undefined';
  }

  async function ensurePermission() {
    if (!canNotify()) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try {
      return await Notification.requestPermission();
    } catch (e) {
      return Notification.permission;
    }
  }

  async function getSWRegistration() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      return await navigator.serviceWorker.ready;
    } catch (e) {
      try {
        return await navigator.serviceWorker.register('./sw.js', { scope: './' });
      } catch (e2) {
        return null;
      }
    }
  }

  async function subscribePush() {
    var perm = await ensurePermission();
    if (perm !== 'granted') return null;

    var reg = await getSWRegistration();
    if (!reg || !reg.pushManager) return null;

    try {
      var existing = await reg.pushManager.getSubscription();
      if (existing) {
        await saveSubscription(existing);
        return existing;
      }
    } catch (e) {}

    if (!VAPID_PUBLIC) return null;

    try {
      var sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
      });
      await saveSubscription(sub);
      return sub;
    } catch (e) {
      console.warn('Tchilo push subscribe', e);
      return null;
    }
  }

  async function saveSubscription(sub) {
    if (!sub) return;
    var json = null;
    try {
      json = sub.toJSON ? sub.toJSON() : JSON.parse(JSON.stringify(sub));
    } catch (e) {
      return;
    }
    try {
      localStorage.setItem('tchilo_push_subscription', JSON.stringify(json));
    } catch (e) {}

    try {
      var SB = window.tchiloSupabase;
      if (!SB) return;
      var session = null;
      try {
        var s = await SB.auth.getSession();
        session = s && s.data && s.data.session;
      } catch (e) {}
      var uid = session && session.user && session.user.id;
      if (!uid) return;
      await SB.from('push_subscriptions').upsert(
        {
          user_id: uid,
          endpoint: json.endpoint,
          keys: json.keys || {},
          subscription: json,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'endpoint' }
      );
    } catch (e) {}
  }

  async function showLocalNotification(title, body, data) {
    var perm = await ensurePermission();
    if (perm !== 'granted') return false;
    var reg = await getSWRegistration();
    var opts = {
      body: body || '',
      icon: './logo.svg',
      badge: './logo.svg',
      tag: (data && data.tag) || 'tchilo-local',
      data: data || { url: './' },
      vibrate: [100, 50, 100]
    };
    try {
      if (reg && reg.showNotification) {
        await reg.showNotification(title || 'Tchilo', opts);
        return true;
      }
      if (canNotify()) {
        new Notification(title || 'Tchilo', opts);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function hookInAppEvents() {
    if (typeof window.mergeIncomingNotification === 'function' && !window.mergeIncomingNotification.__pushHook) {
      var orig = window.mergeIncomingNotification;
      window.mergeIncomingNotification = function (row) {
        var r = orig.apply(this, arguments);
        try {
          if (row && document.hidden) {
            var title = row.title || row.type || 'Tchilo';
            var body = row.body || row.message || row.text || 'Nova atividade';
            showLocalNotification(String(title), String(body), {
              url: row.url || '/notificacoes',
              tag: 'tchilo-' + (row.id || Date.now())
            });
          }
        } catch (e) {}
        return r;
      };
      window.mergeIncomingNotification.__pushHook = true;
    }
  }

  async function setupCapacitorPush() {
    try {
      var Cap = window.Capacitor;
      if (!Cap || !Cap.Plugins || !Cap.Plugins.PushNotifications) return;
      var Push = Cap.Plugins.PushNotifications;
      var perm = await Push.requestPermissions();
      if (perm && (perm.receive === 'granted' || perm.receive === 'prompt')) {
        await Push.register();
      }
      Push.addListener('registration', function (token) {
        try {
          localStorage.setItem('tchilo_fcm_token', token && token.value ? token.value : String(token));
        } catch (e) {}
        try {
          var SB = window.tchiloSupabase;
          if (!SB) return;
          SB.auth.getSession().then(function (s) {
            var uid = s && s.data && s.data.session && s.data.session.user && s.data.session.user.id;
            if (!uid) return;
            SB.from('push_subscriptions')
              .upsert(
                {
                  user_id: uid,
                  endpoint: 'fcm:' + (token && token.value),
                  keys: {},
                  subscription: { fcm: token && token.value },
                  updated_at: new Date().toISOString()
                },
                { onConflict: 'endpoint' }
              )
              .catch(function () {});
          });
        } catch (e) {}
      });
      Push.addListener('pushNotificationReceived', function (n) {
        try {
          if (typeof showToast === 'function' && n && n.title) showToast(n.title);
        } catch (e) {}
      });
      Push.addListener('pushNotificationActionPerformed', function (n) {
        try {
          var url = (n && n.notification && n.notification.data && n.notification.data.url) || '/notificacoes';
          if (typeof goTo === 'function' && String(url).indexOf('notif') !== -1) goTo('notifs');
        } catch (e) {}
      });
    } catch (e) {}
  }

  async function boot() {
    hookInAppEvents();
    await setupCapacitorPush();
    setTimeout(function () {
      try {
        var session = null;
        try {
          session = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
        } catch (e) {}
        if (session && session.username) subscribePush();
      } catch (e) {}
    }, 4000);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', function (ev) {
        var d = ev.data || {};
        if (d.type === 'TCHILO_NOTIF_CLICK') {
          try {
            if (d.url && String(d.url).indexOf('notif') !== -1 && typeof goTo === 'function') {
              goTo('notifs');
            } else if (d.url && d.url !== './' && d.url !== '/') {
              location.href = d.url;
            }
          } catch (e) {}
        }
      });
    }
  }

  window.tchiloRequestPushPermission = function () {
    return subscribePush();
  };
  window.tchiloShowLocalNotification = showLocalNotification;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
