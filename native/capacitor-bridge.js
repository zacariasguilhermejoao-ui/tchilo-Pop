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
      if (permission.receive === 'granted') await PushNotifications.register();
      return permission;
    },

    call(phoneNumber) {
      if (!phoneNumber) return false;
      window.location.href = 'tel:' + String(phoneNumber).replace(/[^0-9+]/g, '');
      return true;
    }
  };

  window.TchiloNative = NativeBridge;
})();
