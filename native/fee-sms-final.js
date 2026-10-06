/**
 * Icones graficos Feed + SMS (nao texto)
 * v12 - icone SMS do utilizador + feed maior 38px
 */
(function () {
  'use strict';
  if (window.__tchiloFeeSmsFinalV12) return;
  window.__tchiloFeeSmsFinalV12 = true;

  var SMS_SRC = 'sms-icon.svg?v=12';
  var FEED_SRC = 'native/icons/feed.svg?v=12';

  function css() {
    var st = document.getElementById('tchiloFeeSmsFinalCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloFeeSmsFinalCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.nav-item .nav-feed-icon,img.nav-feed-icon{display:block!important;width:38px!important;height:38px!important;object-fit:contain!important;opacity:1!important;visibility:visible!important;}' +
      '.nav-sms-icon,img.nav-sms-icon,[data-top-messages] img{display:block!important;width:32px!important;height:32px!important;object-fit:contain!important;opacity:1!important;visibility:visible!important;}' +
      '.nav-fee,.nav-text-icon.nav-fee,.nav-sms-text,span.nav-sms-text,[data-top-messages] span{display:none!important;}' +
      '.nav-item[data-screen="feed"] > svg{display:none!important;}' +
      '[data-top-messages]{display:inline-flex!important;align-items:center;justify-content:center;opacity:1!important;visibility:visible!important;}';
  }

  function fixFee() {
    var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
    if (!btn) return;
    btn.querySelectorAll('.nav-fee,.nav-text-icon,svg').forEach(function (n) {
      try {
        if (n.classList && n.classList.contains('dot')) return;
        n.remove();
      } catch (e) {}
    });
    var img = btn.querySelector('img.nav-feed-icon');
    if (!img) {
      img = document.createElement('img');
      img.className = 'nav-feed-icon';
      img.alt = 'Feed';
      var dot = btn.querySelector('.dot');
      if (dot) btn.insertBefore(img, dot);
      else btn.insertBefore(img, btn.firstChild);
    }
    img.src = FEED_SRC;
    img.width = 38;
    img.height = 38;
    img.style.cssText = 'width:38px;height:38px;object-fit:contain;display:block;';
    btn.setAttribute('aria-label', 'Feed');
  }

  function fixSms() {
    var el = document.querySelector('[data-top-messages]');
    if (!el) {
      var bar = document.querySelector('#screen-feed .topbar-icons,.topbar-icons');
      if (!bar) return;
      el = document.createElement('div');
      el.className = 'icon-btn';
      el.setAttribute('data-top-messages', '1');
      el.setAttribute('aria-label', 'Mensagens');
      el.onclick = function () {
        if (typeof tchiloOpenMessages === 'function') tchiloOpenMessages();
        else if (typeof openMessages === 'function') openMessages();
      };
      var search = bar.querySelector('[data-top-search],.icon-btn:last-child');
      if (search) bar.insertBefore(el, search);
      else bar.appendChild(el);
    }
    el.querySelectorAll('span,.nav-sms-text').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var img = el.querySelector('img.nav-sms-icon,img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'nav-sms-icon';
      img.alt = 'Mensagens';
      el.appendChild(img);
    }
    img.className = 'nav-sms-icon';
    img.src = SMS_SRC;
    img.width = 32;
    img.height = 32;
    img.style.cssText = 'width:32px;height:32px;object-fit:contain;display:block;';
    el.setAttribute('aria-label', 'Mensagens');
  }

  function run() {
    css();
    fixFee();
    fixSms();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);
  var obs = new MutationObserver(run);
  if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  else document.addEventListener('DOMContentLoaded', function () {
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();
