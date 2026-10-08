/**
 * tchilo-Pop — trava global de performance
 * Intervalos curtos (< 2s) usados para inject/boot no DOM passam a 8s.
 * Nao mexe em timers de chamada/audio.
 */
(function () {
  'use strict';
  if (window.__tchiloPerfThrottleV1) return;
  window.__tchiloPerfThrottleV1 = true;

  var MIN_MS = 8000;
  var _si = window.setInterval;

  window.setInterval = function (fn, ms) {
    try {
      var delay = typeof ms === 'number' ? ms : 0;
      if (delay > 0 && delay < 2000 && typeof fn === 'function') {
        var src = '';
        try {
          src = fn.toString() || '';
        } catch (e) {}
        if (
          /inject|boot|hookBtn|ensure|patch|renderFeed|settings|boost|chip|logo|nav/i.test(src) &&
          !/pollIncoming|callId|webrtc|rtc|audio|ring/i.test(src)
        ) {
          delay = MIN_MS;
        }
      }
      return _si.call(this, fn, delay);
    } catch (e) {
      return _si.apply(this, arguments);
    }
  };
})();
