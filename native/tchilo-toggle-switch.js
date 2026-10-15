/**
 * tchilo-toggle-switch v1
 * Transforma os .settings-toggle em toggle switches reais.
 * Ligado (on) = preto (var(--ink)).
 */
(function () {
  'use strict';
  if (window.__TCHILO_TOGGLE_V1) return;
  window.__TCHILO_TOGGLE_V1 = true;

  function injectCSS() {
    if (document.getElementById('tchilo-toggle-v1-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-toggle-v1-css';
    st.textContent =
      /* Toggle switch real — preto quando ligado */
      '.settings-toggle{' +
      'width:48px!important;height:28px!important;border-radius:14px!important;' +
      'border:none!important;background:color-mix(in srgb, var(--ink) 18%, transparent)!important;' +
      'position:relative!important;flex-shrink:0!important;' +
      'transition:background .2s ease!important;' +
      'display:block!important;align-items:unset!important;justify-content:unset!important;' +
      'box-sizing:border-box!important;' +
      '}' +
      '.settings-toggle::after{' +
      'content:""!important;position:absolute!important;top:3px!important;left:3px!important;' +
      'width:22px!important;height:22px!important;border-radius:50%!important;' +
      'background:#fff!important;box-shadow:0 1px 3px rgba(0,0,0,.22)!important;' +
      'transition:transform .2s ease!important;' +
      'mask:none!important;-webkit-mask:none!important;opacity:1!important;' +
      'transform:translateX(0)!important;' +
      '}' +
      '.settings-toggle.on{' +
      'background:var(--ink,#0B0B0C)!important;border-color:transparent!important;' +
      '}' +
      '.settings-toggle.on::after{' +
      'transform:translateX(20px)!important;background:#fff!important;opacity:1!important;' +
      '}' +
      '.settings-toggle:active{transform:none!important;}' +
      /* Também aplica a lang-dot / theme-check se quiseres o mesmo estilo de check circular preto */
      '.lang-dot.on,.theme-check.on{' +
      'background:var(--ink,#0B0B0C)!important;border-color:var(--ink,#0B0B0C)!important;' +
      '}';
    (document.head || document.documentElement).appendChild(st);
  }

  function run() {
    injectCSS();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  [100, 500, 1500].forEach(function (ms) {
    setTimeout(run, ms);
  });
})();
