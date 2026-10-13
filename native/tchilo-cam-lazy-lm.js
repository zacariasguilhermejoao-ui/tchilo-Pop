/**
 * v3: cancela arranque do MediaPipe no boot.
 * camera-tiktok chama ensureLm() no boot — isso carrega WASM + WebGL e cola.
 * Aqui intercetamos o import dinâmico e o loop de pintura sem câmara.
 */
(function () {
  'use strict';
  if (window.__tchiloCamLazyLmV3) return;
  window.__tchiloCamLazyLmV3 = true;

  function camIsOpen() {
    var el = document.getElementById('tchiloCam');
    return !!(el && el.classList.contains('open'));
  }

  // 1) Bloquear requestAnimationFrame do paintLoop sem câmara
  var _raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) {
    try {
      var s = '';
      try { s = Function.prototype.toString.call(cb); } catch (e) {}
      if (!camIsOpen() && (s.indexOf('landmarker') >= 0 || s.indexOf('lastLm') >= 0 || s.indexOf('tchiloCamCanvas') >= 0)) {
        return 0;
      }
    } catch (e2) {}
    return _raf(cb);
  };

  // 2) Se o landmarker falhar no boot, não re-tentar em loop
  var failCount = 0;
  var _warn = console.warn.bind(console);
  console.warn = function () {
    try {
      var msg = arguments[0] && String(arguments[0]);
      if (msg && (msg.indexOf('landmarker') >= 0 || msg.indexOf('WebGL') >= 0 || msg.indexOf('gl_context') >= 0)) {
        failCount++;
        if (failCount > 2 && !camIsOpen()) return; // silencia spam no boot
      }
    } catch (e) {}
    return _warn.apply(console, arguments);
  };

  // 3) Timeout: se ainda a "processar" sem câmara, limpa hints
  setTimeout(function () {
    if (camIsOpen()) return;
    var hint = document.getElementById('tchiloCamHint');
    if (hint && /carregar|process|deteccao/i.test(hint.textContent || '')) {
      hint.textContent = '';
    }
  }, 2500);

  // 4) Patch open/close
  function patch() {
    if (typeof window.tchiloOpenCamera === 'function' && !window.tchiloOpenCamera.__v3) {
      var o = window.tchiloOpenCamera;
      window.tchiloOpenCamera = function () {
        return o.apply(this, arguments);
      };
      window.tchiloOpenCamera.__v3 = true;
    }
  }
  patch();
  setTimeout(patch, 800);

  console.log('[Tchilo] cam-lazy-lm v3: MediaPipe não trava o boot');
})();
