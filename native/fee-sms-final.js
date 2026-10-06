/**
 * Fee + SMS do user (força, por cima de qualquer script antigo)
 * v8
 */
(function () {
  'use strict';
  if (window.__tchiloFeeSmsFinalV8) return;
  window.__tchiloFeeSmsFinalV8 = true;

  var FEE = '<span class="nav-text-icon nav-fee" aria-hidden="true">Fee</span>';
  var SMS = '<img class="nav-sms-icon" src="sms-icon.svg?v=8" alt="SMS" width="28" height="28" style="width:28px;height:28px;object-fit:contain;display:block;">';

  function css() {
    if (document.getElementById('tchiloFeeSmsFinalCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeeSmsFinalCSS';
    st.textContent =
      '.nav-item .nav-fee,.nav-fee{display:inline-flex!important;align-items:center;justify-content:center;' +
      'font:900 20px "Segoe Script","Apple Chancery",cursive,system-ui,sans-serif!important;color:currentColor!important;' +
      'opacity:1!important;visibility:visible!important;}' +
      '.nav-item[data-screen="feed"] > svg,.nav-item[data-screen="feed"] .nav-feed-icon{display:none!important;}' +
      '.nav-sms-text{display:none!important;}' +
      '.nav-sms-icon{width:28px!important;height:28px!important;object-fit:contain!important;display:block!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function fixFee() {
    var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
    if (!btn) return;
    btn.querySelectorAll('svg, .nav-feed-icon').forEach(function (n) { try { n.remove(); } catch (e) {} });
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
      el.onclick = function (e) { e.preventDefault(); if (typeof goTo === 'function') goTo('messages'); };
      var search = bar.querySelector('[onclick*="search"]');
      if (search) bar.insertBefore(el, search); else bar.appendChild(el);
    }
    el.querySelectorAll('.nav-sms-text, svg').forEach(function (n) { try { n.remove(); } catch (e) {} });
    var img = el.querySelector('img.nav-sms-icon, img[src*="sms-icon"]');
    if (!img) {
      var w = document.createElement('div');
      w.innerHTML = SMS;
      img = w.firstChild;
      el.insertBefore(img, el.firstChild);
    } else {
      img.src = 'sms-icon.svg?v=8';
      img.className = 'nav-sms-icon';
    }
  }

  function run() { css(); fixFee(); fixSms(); }
  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  [150, 400, 900, 1800, 3000].forEach(function (ms) { setTimeout(run, ms); });
})();
