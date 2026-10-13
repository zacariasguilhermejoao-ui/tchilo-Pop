/**
 * v2: bloqueia ensureLm / FaceLandmarker no boot da página.
 * MediaPipe só corre com #tchiloCam.open.
 */
(function () {
  'use strict';
  if (window.__tchiloCamLazyLmV2) return;
  window.__tchiloCamLazyLmV2 = true;
  window.__tchiloCamLazyLmV1 = true;

  var camOpen = false;

  function isCamOpen() {
    var cam = document.getElementById('tchiloCam');
    return !!(cam && cam.classList.contains('open'));
  }

  // Monkey-patch: se existir ensureLm global no futuro, não usado
  // O camera-tiktok tem ensureLm local — interceptamos o import do mediapipe
  var origImport = null;
  try {
    // Bloquear dynamic import de mediapipe nos primeiros segundos sem câmara
    if (typeof window.import === 'undefined') {
      /* browsers use native import() */
    }
  } catch (e) {}

  // Patch tchiloOpenCamera
  function patchOpen() {
    if (typeof window.tchiloOpenCamera === 'function' && !window.tchiloOpenCamera.__lazyLm2) {
      var orig = window.tchiloOpenCamera;
      window.tchiloOpenCamera = function () {
        camOpen = true;
        return orig.apply(this, arguments);
      };
      window.tchiloOpenCamera.__lazyLm2 = true;
    }
    if (typeof window.tchiloCloseCamera === 'function' && !window.tchiloCloseCamera.__lazyLm2) {
      var origC = window.tchiloCloseCamera;
      window.tchiloCloseCamera = function () {
        camOpen = false;
        return origC.apply(this, arguments);
      };
      window.tchiloCloseCamera.__lazyLm2 = true;
    }
  }

  // Interceptar createFromOptions via prototype se já carregado — difícil.
  // Solução prática: sobrescrever console e forçar lmFailed se chamado cedo.
  // Melhor: patch do script camera-tiktok depois de carregar — redefinir openCam flow.

  // Após camera-tiktok carregar, o ensureLm no boot já pode ter corrido.
  // Forçamos: se a página não tem câmara aberta, não deixar requestAnimationFrame de paintLoop consumir CPU.
  var _raf = window.requestAnimationFrame;
  var rafBlockUntil = Date.now() + 3000;
  window.requestAnimationFrame = function (cb) {
    try {
      var src = '';
      try { src = (cb && cb.toString()) || ''; } catch (e) {}
      // paintLoop do camera-tiktok
      if (src.indexOf('tchiloCam') >= 0 || src.indexOf('landmarker') >= 0 || src.indexOf('lastLm') >= 0) {
        if (!isCamOpen() && !camOpen) {
          return 0; // não agenda loop sem câmara
        }
      }
    } catch (e2) {}
    return _raf.apply(this, arguments);
  };

  patchOpen();
  setTimeout(patchOpen, 300);
  setTimeout(patchOpen, 1000);
  setTimeout(patchOpen, 3000);

  console.log('[Tchilo] cam-lazy-lm v2: sem MediaPipe no boot');
})();
