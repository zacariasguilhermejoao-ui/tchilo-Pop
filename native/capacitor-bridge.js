/*
 * Native bridge helpers for tchilo-Pop.
 * Loaded by the existing index only when this file is explicitly included.
 * The bridge never replaces the existing UI.
 */
(function () {
  'use strict';

  var lastPushToken = null;
  var tokenSaveAttempts = 0;

  async function saveTokenToSupabase(token) {
    if (!token) return;
    lastPushToken = token;

    // Wait for Supabase client (SB) and a logged-in user
    var SB = window.SB || window.supabase || null;
    if (!SB || !SB.auth) {
      if (tokenSaveAttempts < 15) {
        tokenSaveAttempts++;
        setTimeout(function () { saveTokenToSupabase(token); }, 2000);
      }
      return;
    }

    try {
      var sessionRes = await SB.auth.getSession();
      var session = sessionRes && sessionRes.data && sessionRes.data.session;
      var user = session && session.user;
      if (!user || !user.id) {
        // User not logged in yet — retry a few times
        if (tokenSaveAttempts < 20) {
          tokenSaveAttempts++;
          setTimeout(function () { saveTokenToSupabase(token); }, 3000);
        }
        return;
      }

      var platform = 'web';
      try {
        if (window.Capacitor && window.Capacitor.getPlatform) {
          platform = window.Capacitor.getPlatform() || 'web';
        }
      } catch (e) {}

      var row = {
        user_id: user.id,
        token: token,
        platform: platform,
        updated_at: new Date().toISOString()
      };

      var result = await SB.from('device_tokens').upsert(row, {
        onConflict: 'user_id,token'
      });

      if (result && result.error) {
        console.warn('Tchilo: failed to save push token', result.error.message || result.error);
      } else {
        console.log('Tchilo: push token saved for user', user.id);
        tokenSaveAttempts = 0;
      }
    } catch (err) {
      console.warn('Tchilo: saveTokenToSupabase error', err && err.message ? err.message : err);
      if (tokenSaveAttempts < 10) {
        tokenSaveAttempts++;
        setTimeout(function () { saveTokenToSupabase(token); }, 4000);
      }
    }
  }

  // Re-save token after login (if the app dispatches this)
  window.addEventListener('tchilo-user-logged-in', function () {
    if (lastPushToken) {
      tokenSaveAttempts = 0;
      saveTokenToSupabase(lastPushToken);
    }
  });

  const NativeBridge = {
    isNative() {
      return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    },

    async cameraPhoto(source) {
      if (!this.isNative()) throw new Error('NATIVE_ONLY');
      const { Camera, CameraResultType, CameraSource } = window.Capacitor.Plugins;
      if (!Camera) throw new Error('CAMERA_PLUGIN_MISSING');
      return Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === 'gallery' ? CameraSource.Photos : CameraSource.Camera,
        saveToGallery: false,
      });
    },

    async location() {
      if (!this.isNative()) throw new Error('NATIVE_ONLY');
      const { Geolocation } = window.Capacitor.Plugins;
      if (!Geolocation) throw new Error('GEOLOCATION_PLUGIN_MISSING');
      return Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    },

    async requestNotifications() {
      if (!this.isNative()) throw new Error('NATIVE_ONLY');
      const { PushNotifications } = window.Capacitor.Plugins;
      if (!PushNotifications) throw new Error('PUSH_PLUGIN_MISSING');

      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();
      }
      return permission;
    },

    /** Call once after the app is ready (native only) to wire push listeners */
    setupPushListeners(handlers) {
      if (!this.isNative()) return;
      const { PushNotifications } = window.Capacitor.Plugins;
      if (!PushNotifications) return;

      handlers = handlers || {};

      // Registration success → we get the FCM/APNs token
      PushNotifications.addListener('registration', function (token) {
        console.log('Tchilo push token:', token.value);
        saveTokenToSupabase(token.value);
        if (typeof handlers.onToken === 'function') handlers.onToken(token.value);
        try {
          window.dispatchEvent(new CustomEvent('tchilo-push-token', { detail: token.value }));
        } catch (e) {}
      });

      // Registration error
      PushNotifications.addListener('registrationError', function (err) {
        console.warn('Tchilo push registration error:', err);
        if (typeof handlers.onError === 'function') handlers.onError(err);
      });

      // Notification received while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', function (notification) {
        console.log('Tchilo push received:', notification);
        if (typeof handlers.onReceived === 'function') handlers.onReceived(notification);
        try {
          window.dispatchEvent(new CustomEvent('tchilo-push-received', { detail: notification }));
        } catch (e) {}
      });

      // User tapped the notification
      PushNotifications.addListener('pushNotificationActionPerformed', function (action) {
        console.log('Tchilo push action:', action);
        if (typeof handlers.onAction === 'function') handlers.onAction(action);
        try {
          window.dispatchEvent(new CustomEvent('tchilo-push-action', { detail: action }));
        } catch (e) {}
      });
    },

    call(phoneNumber) {
      if (!phoneNumber) return false;
      window.location.href = 'tel:' + String(phoneNumber).replace(/[^0-9+]/g, '');
      return true;
    },

    async hideSplash() {
      if (!this.isNative()) return;
      try {
        const { SplashScreen } = window.Capacitor.Plugins;
        if (SplashScreen) await SplashScreen.hide();
      } catch (e) {}
    },

    /** Call this after successful login so the token is saved if it arrived early */
    refreshPushToken() {
      if (lastPushToken) {
        tokenSaveAttempts = 0;
        saveTokenToSupabase(lastPushToken);
      }
    }
  };

  window.TchiloNative = NativeBridge;

  // Auto-setup when running inside Capacitor
  if (NativeBridge.isNative()) {
    document.addEventListener('DOMContentLoaded', function () {
      NativeBridge.setupPushListeners({});

      // Request notification permission shortly after launch
      setTimeout(function () {
        NativeBridge.requestNotifications().catch(function (e) {
          console.warn('Tchilo: requestNotifications', e && e.message ? e.message : e);
        });
      }, 1500);

      // Hide splash after a short delay so the web UI is ready
      setTimeout(function () {
        NativeBridge.hideSplash();
      }, 600);
    });
  }
})();
