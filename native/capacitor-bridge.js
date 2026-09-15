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

  window.addEventListener('tchilo-user-logged-in', function () {
    if (lastPushToken) {
      tokenSaveAttempts = 0;
      saveTokenToSupabase(lastPushToken);
    }
  });

  /*
   * Android physical back button.
   * Priority:
   * 1. Click the app's own visible back control when one exists.
   * 2. Use browser history when the app has history entries.
   * 3. Otherwise allow Capacitor/Android to perform the default back action.
   *
   * This is deliberately generic so it does not change the existing Tchilo UI.
   */
  function findVisibleBackControl() {
    var selectors = [
      '[data-back]',
      '[data-action="back"]',
      '[aria-label*="Voltar" i]',
      '[aria-label*="Back" i]',
      '[title*="Voltar" i]',
      '[title*="Back" i]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var nodes = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < nodes.length; j++) {
        var el = nodes[j];
        if (!el || el.disabled) continue;
        var style = window.getComputedStyle(el);
        var rect = el.getBoundingClientRect();
        if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) {
          return el;
        }
      }
    }

    // Fallback for common text-based back buttons.
    var candidates = document.querySelectorAll('button, [role="button"], a');
    for (var k = 0; k < candidates.length; k++) {
      var candidate = candidates[k];
      var text = (candidate.textContent || '').trim().toLowerCase();
      if (text !== 'voltar' && text !== 'back') continue;
      var cs = window.getComputedStyle(candidate);
      var cr = candidate.getBoundingClientRect();
      if (cs.display !== 'none' && cs.visibility !== 'hidden' && cr.width > 0 && cr.height > 0) {
        return candidate;
      }
    }

    return null;
  }

  function handleNativeBack() {
    try {
      var backControl = findVisibleBackControl();
      if (backControl) {
        backControl.click();
        return true;
      }

      if (window.history && window.history.length > 1) {
        window.history.back();
        return true;
      }
    } catch (e) {
      console.warn('Tchilo: back navigation error', e);
    }
    return false;
  }

  function setupNativeBackButton() {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform || !window.Capacitor.isNativePlatform()) return;

    try {
      var App = window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (!App || typeof App.addListener !== 'function') {
        console.warn('Tchilo: Capacitor App plugin not available');
        return;
      }

      App.addListener('backButton', function () {
        var handled = handleNativeBack();
        if (!handled) {
          try {
            App.exitApp();
          } catch (e) {
            console.warn('Tchilo: unable to exit app', e);
          }
        }
      });

      window.TchiloNativeBack = handleNativeBack;
    } catch (e) {
      console.warn('Tchilo: failed to setup native back button', e);
    }
  }

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

    setupPushListeners(handlers) {
      if (!this.isNative()) return;
      const { PushNotifications } = window.Capacitor.Plugins;
      if (!PushNotifications) return;

      handlers = handlers || {};

      PushNotifications.addListener('registration', function (token) {
        console.log('Tchilo push token:', token.value);
        saveTokenToSupabase(token.value);
        if (typeof handlers.onToken === 'function') handlers.onToken(token.value);
        try {
          window.dispatchEvent(new CustomEvent('tchilo-push-token', { detail: token.value }));
        } catch (e) {}
      });

      PushNotifications.addListener('registrationError', function (err) {
        console.warn('Tchilo push registration error:', err);
        if (typeof handlers.onError === 'function') handlers.onError(err);
      });

      PushNotifications.addListener('pushNotificationReceived', function (notification) {
        console.log('Tchilo push received:', notification);
        if (typeof handlers.onReceived === 'function') handlers.onReceived(notification);
        try {
          window.dispatchEvent(new CustomEvent('tchilo-push-received', { detail: notification }));
        } catch (e) {}
      });

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

    refreshPushToken() {
      if (lastPushToken) {
        tokenSaveAttempts = 0;
        saveTokenToSupabase(lastPushToken);
      }
    }
  };

  window.TchiloNative = NativeBridge;

  if (NativeBridge.isNative()) {
    document.addEventListener('DOMContentLoaded', function () {
      setupNativeBackButton();
      NativeBridge.setupPushListeners({});

      setTimeout(function () {
        NativeBridge.requestNotifications().catch(function (e) {
          console.warn('Tchilo: requestNotifications', e && e.message ? e.message : e);
        });
      }, 1500);

      setTimeout(function () {
        NativeBridge.hideSplash();
      }, 600);
    });
  }
})();
