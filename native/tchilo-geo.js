/**
 * tchilo-Pop — Localizacao nativa em tempo real
 * Capacitor Geolocation + navigator.geolocation
 */
(function () {
  "use strict";

  var KEY = "tchilo_user_geo";
  var watchId = null;
  var last = null;

  function save(pos) {
    if (!pos || pos.lat == null || pos.lng == null) return;
    last = {
      lat: pos.lat,
      lng: pos.lng,
      accuracy: pos.accuracy != null ? pos.accuracy : null,
      at: Date.now()
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(last));
    } catch (e) {}
    window.__tchiloUserGeo = last;
    try {
      document.dispatchEvent(new CustomEvent("tchilo:geo", { detail: last }));
    } catch (e2) {}
  }

  function loadCached() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        last = JSON.parse(raw);
        window.__tchiloUserGeo = last;
      }
    } catch (e) {}
    return last;
  }

  function fromBrowserPosition(p) {
    if (!p || !p.coords) return null;
    return {
      lat: p.coords.latitude,
      lng: p.coords.longitude,
      accuracy: p.coords.accuracy
    };
  }

  async function requestPermissionNative() {
    try {
      var Cap = window.Capacitor;
      if (Cap && Cap.Plugins && Cap.Plugins.Geolocation) {
        var Geo = Cap.Plugins.Geolocation;
        if (typeof Geo.requestPermissions === "function") {
          var perm = await Geo.requestPermissions();
          return perm && (perm.location === "granted" || perm.coarseLocation === "granted");
        }
        return true;
      }
    } catch (e) {}
    return null;
  }

  async function getOnce() {
    // 1) Capacitor nativo
    try {
      var Cap = window.Capacitor;
      if (Cap && Cap.Plugins && Cap.Plugins.Geolocation) {
        await requestPermissionNative();
        var pos = await Cap.Plugins.Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000
        });
        var mapped = fromBrowserPosition(pos) || {
          lat: pos.coords ? pos.coords.latitude : pos.latitude,
          lng: pos.coords ? pos.coords.longitude : pos.longitude,
          accuracy: pos.coords ? pos.coords.accuracy : pos.accuracy
        };
        save(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn("[geo] capacitor", e);
    }

    // 2) Browser / WebView
    return new Promise(function (resolve) {
      if (!navigator.geolocation) {
        resolve(loadCached());
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (p) {
          var m = fromBrowserPosition(p);
          save(m);
          resolve(m);
        },
        function () {
          resolve(loadCached());
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  function startWatch() {
    stopWatch();
    try {
      var Cap = window.Capacitor;
      if (Cap && Cap.Plugins && Cap.Plugins.Geolocation && Cap.Plugins.Geolocation.watchPosition) {
        Cap.Plugins.Geolocation.watchPosition(
          { enableHighAccuracy: true },
          function (pos, err) {
            if (err || !pos) return;
            var m = fromBrowserPosition(pos) || {
              lat: pos.latitude,
              lng: pos.longitude,
              accuracy: pos.accuracy
            };
            save(m);
          }
        ).then(function (id) {
          watchId = id;
        }).catch(function () {});
        return;
      }
    } catch (e) {}

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        function (p) {
          save(fromBrowserPosition(p));
        },
        function () {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }
  }

  function stopWatch() {
    try {
      if (watchId != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    } catch (e) {}
    watchId = null;
  }

  function get() {
    return window.__tchiloUserGeo || loadCached();
  }

  /** distancia em km (Haversine) */
  function distanceKm(a, b) {
    if (!a || !b || a.lat == null || b.lat == null) return Infinity;
    var R = 6371;
    var dLat = ((b.lat - a.lat) * Math.PI) / 180;
    var dLng = ((b.lng - a.lng) * Math.PI) / 180;
    var la1 = (a.lat * Math.PI) / 180;
    var la2 = (b.lat * Math.PI) / 180;
    var x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  /** anuncio visivel para o utilizador actual? */
  function adMatchesUser(ad) {
    if (!ad) return false;
    var lat = ad.target_lat != null ? Number(ad.target_lat) : ad.lat != null ? Number(ad.lat) : null;
    var lng = ad.target_lng != null ? Number(ad.target_lng) : ad.lng != null ? Number(ad.lng) : null;
    var radius = ad.target_radius_km != null ? Number(ad.target_radius_km) : ad.radius_km != null ? Number(ad.radius_km) : null;
    // sem geo no anuncio = global
    if (lat == null || lng == null || !radius || radius <= 0) return true;
    var user = get();
    if (!user) return true; // sem permissao ainda: mostra
    return distanceKm(user, { lat: lat, lng: lng }) <= radius;
  }

  window.tchiloGeo = {
    get: get,
    getOnce: getOnce,
    startWatch: startWatch,
    stopWatch: stopWatch,
    distanceKm: distanceKm,
    adMatchesUser: adMatchesUser,
    requestPermission: requestPermissionNative
  };

  function boot() {
    loadCached();
    getOnce().then(function () {
      startWatch();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1500);
})();
