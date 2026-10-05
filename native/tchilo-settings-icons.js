/** tchilo-settings-icons v25 — keep native SVG mono icons (Instagram-style) */
(function () {
  if (window.__TCHILO_SI_V25) return;
  window.__TCHILO_SI_V25 = true;

  function injectCSS() {
    if (document.getElementById('si-v25-css')) return;
    var st = document.createElement('style');
    st.id = 'si-v25-css';
    st.textContent = [
      '#screen-settings .settings-item .si-icon,',
      '.settings-item .si-icon{',
      '  width:24px!important;height:24px!important;min-width:24px!important;',
      '  border:0!important;border-radius:0!important;background:transparent!important;',
      '  background-color:transparent!important;box-shadow:none!important;',
      '  display:inline-flex!important;align-items:center!important;justify-content:center!important;',
      '  padding:0!important;flex-shrink:0!important;overflow:visible!important;',
      '  color:var(--ink,#0B0B0C)!important;',
      '}',
      '#screen-settings .settings-item .si-icon svg,',
      '.settings-item .si-icon svg{',
      '  display:block!important;visibility:visible!important;opacity:1!important;',
      '  width:22px!important;height:22px!important;',
      '  stroke:currentColor!important;',
      '}',
      '#screen-settings .settings-item .si-icon img{display:none!important;}',
      '#screen-settings .settings-item{',
      '  display:flex!important;align-items:center!important;gap:14px!important;',
      '  background:transparent!important;',
      '}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  function run() {
    injectCSS();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 200);
  setTimeout(run, 800);
})();
