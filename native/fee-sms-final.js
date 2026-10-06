/**
 * Feed + SMS topbar — v13
 * - Usa SEMPRE sms-icon.svg do utilizador (nunca icone antigo)
 * - Nao troca de lugar com a lupa (messages a esquerda, search a direita)
 * - Mensagem e lupa maiores
 */
(function () {
  'use strict';
  if (window.__tchiloFeeSmsFinalV13) return;
  window.__tchiloFeeSmsFinalV13 = true;
  window.__tchiloFeeSmsFinalV12 = true;
  window.__tchiloFeeSmsFinalV11 = true;

  var SMS_SRC = 'sms-icon.svg?v=20';
  var FEED_SRC = 'native/icons/feed.svg?v=13';
  var SMS_SIZE = 36;
  var SEARCH_SIZE = 34;
  var FEED_SIZE = 38;

  function css() {
    var st = document.getElementById('tchiloFeeSmsFinalCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloFeeSmsFinalCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.nav-item .nav-feed-icon,img.nav-feed-icon{' +
      'display:block!important;width:' + FEED_SIZE + 'px!important;height:' + FEED_SIZE + 'px!important;' +
      'object-fit:contain!important;opacity:1!important;visibility:visible!important;}' +
      '.nav-sms-icon,img.nav-sms-icon,[data-top-messages] img.nav-sms-icon,[data-top-messages] > img{' +
      'display:block!important;width:' + SMS_SIZE + 'px!important;height:' + SMS_SIZE + 'px!important;' +
      'object-fit:contain!important;opacity:1!important;visibility:visible!important;' +
      'max-width:' + SMS_SIZE + 'px!important;max-height:' + SMS_SIZE + 'px!important;}' +
      '.topbar-icons .icon-btn[onclick*="search"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="esquisar"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="Search"] svg{' +
      'width:' + SEARCH_SIZE + 'px!important;height:' + SEARCH_SIZE + 'px!important;' +
      'display:block!important;stroke-width:2.2!important;}' +
      '.nav-fee,.nav-text-icon.nav-fee,.nav-sms-text,span.nav-sms-text,[data-top-messages] span{display:none!important;}' +
      '.nav-item[data-screen="feed"] > svg{display:none!important;}' +
      '[data-top-messages]{display:inline-flex!important;align-items:center!important;' +
      'justify-content:center!important;opacity:1!important;visibility:visible!important;' +
      'order:1!important;flex-shrink:0!important;}' +
      '.topbar-icons .icon-btn[onclick*="search"],' +
      '.topbar-icons .icon-btn[aria-label*="esquisar"],' +
      '.topbar-icons .icon-btn[aria-label*="Search"]{order:2!important;flex-shrink:0!important;}' +
      '.topbar-icons{display:flex!important;align-items:center!important;gap:14px!important;}';
  }

  function isSearchBtn(el) {
    if (!el) return false;
    var oc = (el.getAttribute('onclick') || '') + '';
    var al = (el.getAttribute('aria-label') || '') + '';
    var ti = (el.getAttribute('title') || '') + '';
    return /search|pesquis/i.test(oc + al + ti);
  }

  function isMessagesBtn(el) {
    if (!el) return false;
    if (el.getAttribute('data-top-messages')) return true;
    var oc = (el.getAttribute('onclick') || '') + '';
    var al = (el.getAttribute('aria-label') || '') + '';
    var ti = (el.getAttribute('title') || '') + '';
    return /message|sms|mensagem/i.test(oc + al + ti);
  }

  function lockOrder() {
    var bar = document.querySelector('#screen-feed .topbar-icons, .topbar-icons');
    if (!bar) return;
    var kids = Array.prototype.slice.call(bar.children);
    var msg = null;
    var search = null;
    kids.forEach(function (el) {
      if (isMessagesBtn(el)) msg = el;
      else if (isSearchBtn(el)) search = el;
    });
    if (!msg || !search) return;
    // messages must come BEFORE search
    var msgIdx = kids.indexOf(msg);
    var searchIdx = kids.indexOf(search);
    if (msgIdx > searchIdx) {
      bar.insertBefore(msg, search);
    }
  }

  function fixFee() {
    var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
    if (!btn) return;
    btn.querySelectorAll('.nav-fee,.nav-text-icon').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    btn.querySelectorAll('svg').forEach(function (n) {
      try { n.style.display = 'none'; } catch (e) {}
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
    if (img.getAttribute('src') !== FEED_SRC) img.src = FEED_SRC;
    img.width = FEED_SIZE;
    img.height = FEED_SIZE;
    img.style.cssText =
      'width:' + FEED_SIZE + 'px;height:' + FEED_SIZE + 'px;object-fit:contain;display:block;';
    btn.setAttribute('aria-label', 'Feed');
  }

  function fixSms() {
    var bar = document.querySelector('#screen-feed .topbar-icons, .topbar-icons');
    var el = document.querySelector('[data-top-messages]');

    // Prefer existing messages button in HTML — do not recreate if present
    if (!el && bar) {
      var kids = Array.prototype.slice.call(bar.querySelectorAll('.icon-btn'));
      for (var i = 0; i < kids.length; i++) {
        if (isMessagesBtn(kids[i])) {
          el = kids[i];
          el.setAttribute('data-top-messages', '1');
          break;
        }
      }
    }

    if (!el && bar) {
      el = document.createElement('div');
      el.className = 'icon-btn';
      el.setAttribute('data-top-messages', '1');
      el.setAttribute('aria-label', 'Mensagens');
      el.setAttribute('title', 'SMS');
      el.onclick = function () {
        if (typeof goTo === 'function') goTo('messages');
      };
      var search = null;
      Array.prototype.slice.call(bar.children).forEach(function (c) {
        if (isSearchBtn(c)) search = c;
      });
      if (search) bar.insertBefore(el, search);
      else bar.appendChild(el);
    }
    if (!el) return;

    // Remove only text labels, keep img
    el.querySelectorAll('span,.nav-sms-text,.nav-sms-circle').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });

    var img = el.querySelector('img.nav-sms-icon, img[src*="sms-icon"], img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'nav-sms-icon';
      img.alt = 'Mensagens';
      el.insertBefore(img, el.firstChild);
    }

    // Force USER icon only (sms-icon.svg) — never bubble/old path
    var want = SMS_SRC;
    var cur = img.getAttribute('src') || '';
    if (cur.indexOf('sms-icon.svg') === -1 || cur.indexOf('v=20') === -1) {
      img.src = want;
    }
    img.className = 'nav-sms-icon';
    img.alt = 'Mensagens';
    img.width = SMS_SIZE;
    img.height = SMS_SIZE;
    img.style.cssText =
      'width:' +
      SMS_SIZE +
      'px;height:' +
      SMS_SIZE +
      'px;object-fit:contain;display:block;max-width:' +
      SMS_SIZE +
      'px;max-height:' +
      SMS_SIZE +
      'px;';

    // Hide any leftover SVGs inside messages btn
    el.querySelectorAll('svg').forEach(function (s) {
      try { s.style.display = 'none'; } catch (e) {}
    });

    el.setAttribute('data-top-messages', '1');
    el.setAttribute('aria-label', 'Mensagens');
  }

  function fixSearchSize() {
    var bar = document.querySelector('#screen-feed .topbar-icons, .topbar-icons');
    if (!bar) return;
    Array.prototype.slice.call(bar.children).forEach(function (el) {
      if (!isSearchBtn(el)) return;
      el.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', String(SEARCH_SIZE));
        svg.setAttribute('height', String(SEARCH_SIZE));
        svg.style.width = SEARCH_SIZE + 'px';
        svg.style.height = SEARCH_SIZE + 'px';
      });
    });
  }

  function run() {
    css();
    fixFee();
    fixSms();
    lockOrder();
    fixSearchSize();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 50);
  setTimeout(run, 300);
  setTimeout(run, 1000);
  setTimeout(run, 2500);

  var t = null;
  function schedule() {
    if (t) clearTimeout(t);
    t = setTimeout(run, 80);
  }
  var obs = new MutationObserver(schedule);
  if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  else
    document.addEventListener('DOMContentLoaded', function () {
      obs.observe(document.body, { childList: true, subtree: true });
    });
})();
