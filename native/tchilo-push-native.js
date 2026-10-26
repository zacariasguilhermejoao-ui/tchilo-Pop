/**
 * Tchilo — notificações push na app Android (FCM via @capacitor/push-notifications)
 * - cria o canal "tchilo_default" (o mesmo que a Edge Function send-push usa)
 * - pede permissão (Android 13+) e regista o dispositivo DEPOIS de haver sessão iniciada
 * - grava o token em device_tokens (e volta a gravar se mudar a conta ou o token)
 * - ao tocar na notificação, abre Mensagens ou Notificações
 * iOS: não faz nada de propósito (precisa de configuração própria de APNs/FCM).
 */
(function () {
  'use strict';
  if (window.__tchiloPushNative) return;
  window.__tchiloPushNative = true;

  var TOKEN_KEY = 'tchilo_fcm_token';
  var SAVED_KEY = 'tchilo_fcm_saved';
  var CHANNEL_ID = 'tchilo_default';

  var started = false;
  var listenersOn = false;
  var authHooked = false;
  var saving = false;

  function platform() {
    try {
      var C = window.Capacitor;
      return (C && C.getPlatform && C.getPlatform()) || 'web';
    } catch (e) {
      return 'web';
    }
  }

  function plugin() {
    try {
      var C = window.Capacitor;
      return (C && C.Plugins && C.Plugins.PushNotifications) || null;
    } catch (e) {
      return null;
    }
  }

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  async function currentUserId() {
    var SB = window.tchiloSupabase;
    if (!SB || !SB.auth) return null;
    try {
      var r = await SB.auth.getSession();
      var s = r && r.data && r.data.session;
      return (s && s.user && s.user.id) || null;
    } catch (e) {
      return null;
    }
  }

  /** grava o token em device_tokens para a conta atual */
  async function ensureSaved() {
    if (saving) return;
    var token = getToken();
    var SB = window.tchiloSupabase;
    if (!token || !SB || !SB.from) return;
    saving = true;
    try {
      var uid = await currentUserId();
      if (!uid) return;
      var mark = uid + ':' + token;
      try {
        if (localStorage.getItem(SAVED_KEY) === mark) return;
      } catch (e) {}

      var row = { user_id: uid, token: token, platform: 'android', updated_at: new Date().toISOString() };
      var res = await SB.from('device_tokens').upsert(row, { onConflict: 'user_id,token' });
      if (res && res.error) res = await SB.from('device_tokens').upsert(row, { onConflict: 'token' });
      if (res && res.error) res = await SB.from('device_tokens').insert(row);
      if (res && res.error) {
        console.warn('Tchilo push: não gravou o token', res.error.message || res.error);
        return;
      }
      /* este telemóvel deixa de receber as notificações de outra conta */
      try {
        await SB.from('device_tokens').delete().eq('token', token).neq('user_id', uid);
      } catch (e) {}
      try {
        localStorage.setItem(SAVED_KEY, mark);
      } catch (e) {}
    } catch (e) {
      console.warn('Tchilo push: erro a gravar token', e);
    } finally {
      saving = false;
    }
  }

  function toastPush(n) {
    try {
      if (typeof showToast !== 'function' || !n) return;
      var t = n.title || '';
      var b = n.body || '';
      if (t || b) showToast(t && b ? t + ': ' + b : t || b);
    } catch (e) {}
  }

  function openFromPush(action) {
    var d = (action && action.notification && action.notification.data) || {};
    var type = String(d.type || '');
    var url = String(d.url || '');
    var screen = type === 'message' || url.indexOf('mensag') >= 0 ? 'messages' : 'notifs';
    var tries = 0;
    (function go() {
      tries++;
      try {
        if (typeof window.goTo === 'function' && document.getElementById('screen-' + screen)) {
          window.goTo(screen);
          return;
        }
      } catch (e) {}
      if (tries < 20) setTimeout(go, 500);
    })();
  }

  function attachListeners(Push) {
    if (listenersOn) return;
    listenersOn = true;
    Push.addListener('registration', function (token) {
      var v = token && token.value ? token.value : '';
      if (!v) return;
      try {
        localStorage.setItem(TOKEN_KEY, v);
      } catch (e) {}
      ensureSaved();
    });
    Push.addListener('registrationError', function (err) {
      console.warn('Tchilo push: erro de registo', err);
    });
    Push.addListener('pushNotificationReceived', toastPush);
    Push.addListener('pushNotificationActionPerformed', openFromPush);
  }

  async function start() {
    var Push = plugin();
    if (!Push || started) return;
    started = true;
    try {
      attachListeners(Push);
      try {
        await Push.createChannel({
          id: CHANNEL_ID,
          name: 'Tchilo',
          description: 'Mensagens, gostos e comentários',
          importance: 4,
          visibility: 1,
          vibration: true
        });
      } catch (e) {}
      var perm = await Push.checkPermissions();
      if (perm && (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale')) {
        perm = await Push.requestPermissions();
      }
      if (perm && perm.receive === 'granted') await Push.register();
    } catch (e) {
      console.warn('Tchilo push: arranque', e);
      started = false;
    }
  }

  function hookAuth() {
    if (authHooked) return;
    var SB = window.tchiloSupabase;
    if (!SB || !SB.auth || typeof SB.auth.onAuthStateChange !== 'function') return;
    authHooked = true;
    try {
      SB.auth.onAuthStateChange(function (ev) {
        if (ev === 'SIGNED_IN') setTimeout(tick, 300);
      });
    } catch (e) {}
  }

  async function tick() {
    hookAuth();
    if (!started) {
      /* só pede permissão e regista quando já há sessão iniciada */
      var uid = await currentUserId();
      if (uid) await start();
    }
    ensureSaved();
  }

  window.tchiloPushNative = { refresh: tick };
  window.addEventListener('tchilo-user-logged-in', function () {
    setTimeout(tick, 300);
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });

  function boot() {
    var waited = 0;
    (function waitCap() {
      if (window.Capacitor || waited > 3000) {
        if (platform() !== 'android') return;
        setTimeout(tick, 2000);
        setInterval(tick, 15000);
        return;
      }
      waited += 200;
      setTimeout(waitCap, 200);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
