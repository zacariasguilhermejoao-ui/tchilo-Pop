/**
 * Fee + Sms (ícones de texto pedidos pelo user)
 * Remove casa e balão antigos
 * v9
 */
(function () {
  'use strict';
  if (window.__tchiloFeeSmsFinalV9) return;
  window.__tchiloFeeSmsFinalV9 = true;

  var FEE = '<span class="nav-text-icon nav-fee" aria-hidden="true">Fee</span>';
  var SMS = '<span class="nav-sms-text" aria-hidden="true">Sms</span>';

  function css() {
    if (document.getElementById('tchiloFeeSmsFinalCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeeSmsFinalCSS';
    st.textContent =
      '.nav-item .nav-fee,.nav-fee{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'font:900 20px "Segoe Script","Apple Chancery",cursive,system-ui,sans-serif!important;' +
      'color:currentColor!important;opacity:1!important;visibility:visible!important;' +
      'letter-spacing:-0.02em;}' +
      '.nav-item[data-screen="feed"] > svg,' +
      '.nav-item[data-screen="feed"] .nav-feed-icon{display:none!important;}' +
      '.topbar-icons .nav-sms-text,' +
      '[data-top-messages] .nav-sms-text,' +
      '.nav-sms-text{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'font:900 18px Inter,system-ui,sans-serif!important;' +
      'letter-spacing:0.02em;color:currentColor!important;' +
      'opacity:1!important;visibility:visible!important;' +
      'border:none!important;background:none!important;}' +
      '[data-top-messages] img.nav-sms-icon,' +
      '.topbar-icons img[src*="sms-icon"]{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function fixFee() {
    var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
    if (!btn) return;
    btn.querySelectorAll('svg, .nav-feed-icon').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    if (!btn.querySelector('.nav-fee')) {
      var dot = btn.querySelector('.dot');
      if (dot) dot.insertAdjacentHTML('beforebegin', FEE);
      else btn.insertAdjacentHTML('afterbegin', FEE);
    }
  }

  function fixSms() {
    var el = document.querySelector('[data-top-messages]');
    if (!el) {
      var bar = document.querySelector('#screen-feed .topbar-icons, .topbar-icons');
      if (!bar) return;
      el = document.createElement('div');
      el.className = 'icon-btn';
      el.setAttribute('data-top-messages', '1');
      el.setAttribute('aria-label', 'Mensagens');
      el.onclick = function (e) {
        e.preventDefault();
        if (typeof goTo === 'function') goTo('messages');
      };
      var search = bar.querySelector('[onclick*="search"]');
      if (search) bar.insertBefore(el, search);
      else bar.appendChild(el);
    }
    el.querySelectorAll('img.nav-sms-icon, img[src*="sms-icon"], svg').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    if (!el.querySelector('.nav-sms-text')) {
      el.insertAdjacentHTML('afterbegin', SMS);
    }
  }

  function run() {
    css();
    fixFee();
    fixSms();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  [100, 300, 700, 1500, 2800].forEach(function (ms) {
    setTimeout(run, ms);
  });
})();
