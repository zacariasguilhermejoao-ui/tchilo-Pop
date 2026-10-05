/** tchilo-settings-icons v26 — mono SVG icons + global flat UI CSS */
(function () {
  if (window.__TCHILO_SI_V26) return;
  window.__TCHILO_SI_V26 = true;

  var FLAT_CSS = [
    '/* tchilo-flat-runtime */',
    '.back-btn,button.back-btn,.screen-header .back-btn{border:0!important;background:transparent!important;box-shadow:none!important;border-radius:50%!important}',
    '#tchiloModalHost .tm-actions>button{border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important}',
    '#tchiloModalHost .tm-actions>button.tm-primary{background:var(--ink,#0B0B0C)!important;color:#fff!important}',
    '#tchiloModalHost .tm-actions>button:not(.tm-primary):not(.tm-danger){background:rgba(11,11,12,.06)!important;color:var(--ink)!important}',
    '#tchiloModalHost .tm-input{border:0!important;background:rgba(11,11,12,.06)!important;border-radius:12px!important}',
    '#tchiloModalHost .tm-option{border:0.5px solid rgba(11,11,12,.12)!important;box-shadow:none!important}',
    '.saved-tab{border:0!important;background:rgba(11,11,12,.06)!important;border-radius:999px!important;color:var(--ink)!important}',
    '.saved-tab.active{background:var(--ink,#0B0B0C)!important;color:#fff!important}',
    '.saved-remove{border:0!important;background:rgba(11,11,12,.06)!important}',
    '.playlist-create{border:0!important;background:var(--ink,#0B0B0C)!important;color:#fff!important}',
    '.notif-tab.active{background:var(--ink,#0B0B0C)!important;color:#fff!important}',
    '#tchiloAdsPro .ap-back,#tchiloAdsPro .ap-x,#tchiloVerifiedSheet .tv-back,#tchiloPremiumSheet .tp-back,#tchiloSupport .su-back{border:0!important;background:transparent!important;border-radius:50%!important;box-shadow:none!important}',
    '#tchiloAdsPro .ap-btn.primary,#tchiloAdsPro .ap-pay,#tchiloAdsPro .ap-chip.on,#tchiloAdsPro .pv-cta{background:#0B0B0C!important;color:#fff!important;border:0!important}',
    '#tchiloAdsPro .ap-btn,#tchiloAdsPro .ap-card{border:0.5px solid rgba(11,11,12,.12)!important;box-shadow:none!important;background:#fff!important}',
    '#tchiloAdsPro .ap-btn.primary{background:#0B0B0C!important;color:#fff!important}',
    '#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select{border:0!important;background:rgba(11,11,12,.06)!important}',
    '#tchiloAdsPro .ap-chip{border:0!important;background:rgba(11,11,12,.06)!important}',
    '#tchiloVerifiedSheet .tv-card,#tchiloVerifiedSheet .tv-ico,#tchiloVerifiedSheet .tv-price-box,#tchiloVerifiedSheet .tv-hero-badge,#tchiloVerifiedSheet .close,#tchiloVerifiedSheet .active-badge,#tchiloPremiumSheet .tp-card,#tchiloPremiumSheet .tp-hero-icon{border:0!important;box-shadow:none!important}',
    '#tchiloVerifiedSheet .pay,#tchiloPremiumSheet .pay{border:0!important;border-radius:12px!important;box-shadow:none!important}',
    '#tchiloQrModal .card{border:0!important;box-shadow:0 12px 40px rgba(0,0,0,.2)!important}',
    '#tchiloQrModal .actions button{border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important}',
    '#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C)!important;color:#fff!important}',
    '#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06)!important;color:var(--ink)!important}',
    '.settings-item .si-icon{width:24px!important;height:24px!important;border:0!important;border-radius:0!important;background:transparent!important}',
    '.settings-item .si-icon svg{display:block!important;visibility:visible!important;opacity:1!important;width:22px!important;height:22px!important}'
  ].join('');

  function inject() {
    if (document.getElementById('tchilo-flat-runtime')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-flat-runtime';
    st.textContent = FLAT_CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
  setTimeout(inject, 100);
  setTimeout(inject, 500);
  setTimeout(inject, 1500);
})();
