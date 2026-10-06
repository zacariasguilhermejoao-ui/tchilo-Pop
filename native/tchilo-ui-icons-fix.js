/**
 * Tchilo — SMS topbar + lupa — v6
 * Nao substitui o sms-icon.svg do utilizador; so garante tamanho e ordem.
 */
(function () {
  'use strict';
  if (window.__tchiloUiIconsFixV6) return;
  window.__tchiloUiIconsFixV6 = true;
  window.__tchiloUiIconsFixV5 = true;
  window.__tchiloUiIconsFixV4 = true;
  window.__tchiloUiIconsFixV3 = true;
  window.__tchiloUiIconsFixV2 = true;
  window.__tchiloUiIconsFixV1 = true;

  var SMS_SRC = 'sms-icon.svg?v=20';
  var SMS_SIZE = 36;
  var SEARCH_SIZE = 34;

  function injectCSS() {
    var st = document.getElementById('tchiloUiIconsCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloUiIconsCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#screen-feed .topbar-icons,.topbar-icons{' +
      'display:flex!important;align-items:center!important;gap:14px!important;}' +
      '#screen-feed .topbar-icons .icon-btn,.topbar-icons .icon-btn{' +
      'width:auto!important;height:auto!important;min-width:0!important;' +
      'border:0!important;border-radius:0!important;' +
      'background:transparent!important;box-shadow:none!important;' +
      'padding:4px!important;display:inline-flex!important;' +
      'align-items:center!important;justify-content:center!important;}' +
      '.topbar-icons .nav-sms-text{display:none!important;}' +
      '.topbar-icons .nav-sms-icon,[data-top-messages] .nav-sms-icon,[data-top-messages] img{' +
      'width:' + SMS_SIZE + 'px!important;height:' + SMS_SIZE + 'px!important;' +
      'object-fit:contain!important;display:block!important;border:0!important;' +
      'background:none!important;padding:0!important;margin:0!important;}' +
      '.topbar-icons .icon-btn[onclick*="search"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="esquisar"] svg{' +
      'width:' + SEARCH_SIZE + 'px!important;height:' + SEARCH_SIZE + 'px!important;}' +
      '[data-top-messages]{display:inline-flex!important;order:1!important;}' +
      '.topbar-icons .icon-btn[onclick*="search"]{order:2!important;}';
  }

  function isSearch(el) {
    var s = ((el.getAttribute('onclick') || '') + (el.getAttribute('aria-label') || '')).toLowerCase();
    return s.indexOf('search') >= 0 || s.indexOf('pesquis') >= 0;
  }

  function isMsg(el) {
    if (el.getAttribute('data-top-messages')) return true;
    var s = ((el.getAttribute('onclick') || '') + (el.getAttribute('aria-label') || '') + (el.getAttribute('title') || '')).toLowerCase();
    return s.indexOf('message') >= 0 || s.indexOf('sms') >= 0 || s.indexOf('mensagem') >= 0;
  }

  function fixTopbarIcons() {
    var bar = document.querySelector('#screen-feed .topbar-icons, .topbar-icons');
    if (!bar) return;

    var sms = bar.querySelector('[data-top-messages]');
    if (!sms) {
      Array.prototype.slice.call(bar.children).forEach(function (c) {
        if (isMsg(c)) {
          sms = c;
          sms.setAttribute('data-top-messages', '1');
        }
      });
    }

    if (!sms) {
      sms = document.createElement('div');
      sms.className = 'icon-btn';
      sms.setAttribute('data-top-messages', '1');
      sms.setAttribute('aria-label', 'Mensagens');
      sms.setAttribute('title', 'SMS');
      sms.onclick = function () {
        try {
          if (typeof goTo === 'function') goTo('messages');
        } catch (e) {}
      };
      var searchEl = null;
      Array.prototype.slice.call(bar.children).forEach(function (c) {
        if (isSearch(c)) searchEl = c;
      });
      if (searchEl) bar.insertBefore(sms, searchEl);
      else bar.appendChild(sms);
    }

    var img = sms.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'nav-sms-icon';
      img.alt = 'Mensagens';
      sms.insertBefore(img, sms.firstChild);
    }
    var cur = img.getAttribute('src') || '';
    if (cur.indexOf('sms-icon.svg') === -1 || cur.indexOf('v=20') === -1) {
      img.src = SMS_SRC;
    }
    img.className = 'nav-sms-icon';
    img.width = SMS_SIZE;
    img.height = SMS_SIZE;
    img.style.cssText =
      'width:' + SMS_SIZE + 'px;height:' + SMS_SIZE + 'px;object-fit:contain;display:block;';

    sms.querySelectorAll('span,.nav-sms-text').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    sms.querySelectorAll('svg').forEach(function (s) {
      try { s.style.display = 'none'; } catch (e) {}
    });

    var search = null;
    Array.prototype.slice.call(bar.children).forEach(function (c) {
      if (isSearch(c)) search = c;
    });
    if (search && sms) {
      var kids = Array.prototype.slice.call(bar.children);
      if (kids.indexOf(sms) > kids.indexOf(search)) {
        bar.insertBefore(sms, search);
      }
      search.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', String(SEARCH_SIZE));
        svg.setAttribute('height', String(SEARCH_SIZE));
        svg.style.width = SEARCH_SIZE + 'px';
        svg.style.height = SEARCH_SIZE + 'px';
      });
    }
  }

  function run() {
    injectCSS();
    fixTopbarIcons();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 100);
  setTimeout(run, 600);
  setTimeout(run, 1500);
})();
