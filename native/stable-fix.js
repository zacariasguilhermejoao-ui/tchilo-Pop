/**
 * tchilo-Pop — loader stable-fix (efeitos menores + galeria)
 */
(function () {
  'use strict';
  var parts = window.__tchiloSFB64 = window.__tchiloSFB64 || [];
  function tryRun() {
    var n = 0;
    for (var i = 0; i < 3; i++) if (parts[i]) n++;
    if (n < 3) return;
    if (window.__tchiloSFDone) return;
    window.__tchiloSFDone = true;
    try {
      var bin = atob(parts.join(''));
      var code = decodeURIComponent(escape(bin));
      (0, eval)(code);
    } catch (e) {
      console.error('stable-fix load', e);
    }
  }
  window.__tchiloSFReady = tryRun;
  [0, 1, 2].forEach(function (i) {
    var s = document.createElement('script');
    s.src = 'native/sf-part-' + i + '.js?v=2';
    s.onload = tryRun;
    document.head.appendChild(s);
  });
})();
