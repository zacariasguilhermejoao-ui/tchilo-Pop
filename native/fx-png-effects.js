/** tchilo-Pop — carrega fotos reais dos 4 efeitos (sequencial, fiavel) */
(function () {
  'use strict';
  window.TchiloFxPngAssets = window.TchiloFxPngAssets || {};

  var GROUPS = [
    { key: 'oculos-cat-eye-prata.png', prefix: 'cateye', n: 4 },
    { key: 'oculos-estrela-rosa.png', prefix: 'estrela', n: 4 },
    { key: 'chifres-pretos.png', prefix: 'chifres', n: 4 },
    { key: 'colar-corrente-dourado.png', prefix: 'colar', n: 4 }
  ];

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src + '?v=5';
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function assemble(group) {
    var parts = [];
    for (var i = 0; i < group.n; i++) {
      var p = window['__' + group.prefix + '_' + i];
      if (!p) return false;
      parts.push(p);
    }
    window.TchiloFxPngAssets[group.key] = 'data:image/webp;base64,' + parts.join('');
    return true;
  }

  function tryAssembleAll() {
    var ok = 0;
    GROUPS.forEach(function (g) {
      if (window.TchiloFxPngAssets[g.key] && String(window.TchiloFxPngAssets[g.key]).indexOf('data:image') === 0) {
        ok++;
        return;
      }
      if (assemble(g)) ok++;
    });
    return ok;
  }

  async function run() {
    // 1) carregar partes em ordem
    for (var g = 0; g < GROUPS.length; g++) {
      var group = GROUPS[g];
      for (var i = 0; i < group.n; i++) {
        await loadScript('native/fx-one/' + group.prefix + '_p' + i + '.js');
      }
    }
    // 2) montar assets (com retry)
    var tries = 0;
    while (tryAssembleAll() < GROUPS.length && tries < 30) {
      tries++;
      await new Promise(function (r) { setTimeout(r, 100); });
    }
    try {
      window.dispatchEvent(new Event('tchilo-fx-assets-ready'));
    } catch (e) {}
    // 3) avisar câmara para redesenhar chips
    try {
      if (typeof window.tchiloRebuildFxChips === 'function') window.tchiloRebuildFxChips();
    } catch (e2) {}
  }

  run();
})();
