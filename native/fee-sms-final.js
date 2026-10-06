/**
 * Ícones gráficos Feed + SMS (não texto)
 * v10 — força imagens visíveis, remove casa/balão genéricos
 */
(function () {
  'use strict';
  if (window.__tchiloFeeSmsFinalV10) return;
  window.__tchiloFeeSmsFinalV10 = true;

  var FEED_SRC = 'native/icons/feed.svg?v=10';
  var SMS_SRC = 'sms-icon.svg?v=10';

  var FEED_HTML =
    '<img class="nav-feed-icon" src="' + FEED_SRC + '" alt="Feed" width="28" height="28" ' +
    'style="width:28px;height:28px;object-fit:contain;display:block;">';

  var SMS_HTML =
    '<img class="nav-sms-icon" src="' + SMS_SRC + '" alt="SMS" width="28" height="28" ' +
    'style="width:28px;height:28px;object-fit:contain;display:block;">';

  function css() {
    var st = document.getElementById('tchiloFeeSmsFinalCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloFeeSmsFinalCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.nav-item .nav-feed-icon,img.nav-feed-icon{' +
      'display:block!important;width:28px!important;height:28px!important;' +
      'object-fit:contain!important;opacity:1!important;visibility:visible!important;}' +
      '.nav-sms-icon,img.nav-sms-icon,[data-top-messages] img{' +
      'display:block!important;width:28px!important;height:28px!important;' +
      'object-fit:contain!important;opacity:1!important;visibility:visible!important;}' +
      '.nav-fee,.nav-text-icon.nav-fee,.nav-sms-text{display:none!important;}' +
      '.nav-item[data-screen="feed"] > svg:not(.nav-feed-icon){display:none!important;}' +
      '[data-top-messages]{display:inline-flex!important;align-items:center;justify-content:center;' +
      'opacity:1!important;visibility:visible!important;}';
  }

  function fixFee() {
    var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
    if (!btn) return;
    btn.querySelectorAll('.nav-fee, .nav-text-icon').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    btn.querySelectorAll('svg').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var img = btn.querySelector('img.nav-feed-icon');
    if (!img) {
      var dot = btn.querySelector('.dot');
      var w = document.createElement('div');
      w.innerHTML = FEED_HTML;
      img = w.firstChild;
      if (dot) btn.insertBefore(img, dot);
      else btn.insertBefore(img, btn.firstChild);
    } else {
      img.src = FEED_SRC;
      img.style.cssText = 'width:28px;height:28px;object-fit:contain;display:block;';
    }
    btn.setAttribute('aria-label', 'Feed');
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
    el.querySelectorAll('.nav-sms-text, svg').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var img = el.querySelector('img.nav-sms-icon, img[src*="sms-icon"]');
    if (!img) {
      var w = document.createElement('div');
      w.innerHTML = SMS_HTML;
      img = w.firstChild;
      el.insertBefore(img, el.firstChild);
    } else {
      img.src = SMS_SRC;
      img.className = 'nav-sms-icon';
      img.style.cssText = 'width:28px;height:28px;object-fit:contain;display:block;';
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
  [100, 400, 900, 1800, 3000].forEach(function (ms) {
    setTimeout(run, ms);
  });
})();
