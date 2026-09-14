/*
 * Native bridge helpers for tchilo-Pop.
 * Loaded by the existing index only when this file is explicitly included.
 * The bridge never replaces the existing UI.
 */
(function () {
  'use strict';

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
      PushNotifications.addListener('registration', (token) => {
        console.log('Tchilo push token:', token.value);
        if (typeof handlers.onToken === 'function') handlers.onToken(token.value);
      });

      // Registration error
      PushNotifications.addListener('registrationError', (err) => {
        console.warn('Tchilo push registration error:', err);
        if (typeof handlers.onError === 'function') handlers.onError(err);
      });

      // Notification received while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Tchilo push received:', notification);
        if (typeof handlers.onReceived === 'function') handlers.onReceived(notification);
      });

      // User tapped the notification
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Tchilo push action:', action);
        if (typeof handlers.onAction === 'function') handlers.onAction(action);
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
    }
  };

  window.TchiloNative = NativeBridge;

  // Auto-setup when running inside Capacitor
  if (NativeBridge.isNative()) {
    document.addEventListener('DOMContentLoaded', function () {
      NativeBridge.setupPushListeners({
        onToken: function (token) {
          // Optional: send token to your backend / Supabase
          try {
            window.dispatchEvent(new CustomEvent('tchilo-push-token', { detail: token }));
          } catch (e) {}
        },
        onReceived: function (notification) {
          try {
            window.dispatchEvent(new CustomEvent('tchilo-push-received', { detail: notification }));
          } catch (e) {}
        },
        onAction: function (action) {
          try {
            window.dispatchEvent(new CustomEvent('tchilo-push-action', { detail: action }));
          } catch (e) {}
        }
      });

      // Hide splash after a short delay so the web UI is ready
      setTimeout(function () {
        NativeBridge.hideSplash();
      }, 600);
    });
  }
})();
