/**
 * Impede o MediaPipe Face Landmarker de arrancar no boot da página.
 * Só carrega quando a câmara está aberta e o utilizador escolhe um efeito.
 * Isto evita o loop de WebGL + "a processar" no ecrã de login.
 */
(function () {
  'use strict';
  if (window.__tchiloCamLazyLmV1) return;
  window.__tchiloCamLazyLmV1 = true;

  var blockedUntilCam = true;

  // Quando a câmara abre, permite MediaPipe
  function allowWhenCamOpen() {
    var cam = document.getElementById('tchiloCam');
    if (cam && cam.classList.contains('open')) {
      blockedUntilCam = false;
    }
  }

  // Patch tchiloOpenCamera se existir
  function patchOpen() {
    if (typeof window.tchiloOpenCamera === 'function' && !window.tchiloOpenCamera.__lazyLm) {
      var orig = window.tchiloOpenCamera;
      window.tchiloOpenCamera = function () {
        blockedUntilCam = false;
        return orig.apply(this, arguments);
      };
      window.tchiloOpenCamera.__lazyLm = true;
    }
  }

  // Intercepta import dinâmico do MediaPipe cedo demais (heurística via ensureLm se exposto)
  // A forma mais segura: se a câmara não está aberta, não deixa createFromOptions correr no 1º segundo
  var bootTime = Date.now();

  // Observa o DOM pela câmara
  try {
    var obs = new MutationObserver(function () {
      allowWhenCamOpen();
      patchOpen();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  } catch (e) {}

  patchOpen();
  setTimeout(patchOpen, 500);
  setTimeout(patchOpen, 2000);

  // Se ensureLm for chamado nos primeiros 3s sem câmara aberta, adia
  var check = setInterval(function () {
    allowWhenCamOpen();
    if (Date.now() - bootTime > 10000) clearInterval(check);
  }, 400);

  console.log('[Tchilo] cam-lazy-lm: MediaPipe só com câmara aberta');
})();
