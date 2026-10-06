/**
 * Tchilo Stable UI — fonte unica (anti-flicker, anti-?)
 * v1 — carregar PRIMEIRO; desativa scripts rivais
 */
(function () {
  'use strict';
  if (window.__tchiloStableUiV1) return;
  window.__tchiloStableUiV1 = true;

  window.__tchiloFeeSmsFinalV14 = true;
  window.__tchiloFeeSmsFinalV13 = true;
  window.__tchiloFeeSmsFinalV12 = true;
  window.__tchiloUiIconsFixV7 = true;
  window.__tchiloUiIconsFixV6 = true;
  window.__tchiloUiIconsFixV5 = true;
  window.__tchiloDefaultAvatarV1 = true;
  window.__tchiloUiPolishV1 = true;
  window.__tchiloNavLayoutV2 = true;

  var ICON = 48;
  var AV_LIGHT = 'avatar-claro.svg?v=3';
  var AV_DARK = 'avatar-escuro.svg?v=3';
  var AV_VIOLET = 'avatar-roxo.svg?v=3';

  function defAvatar() {
    try {
      var t = (
        (document.documentElement && document.documentElement.getAttribute('data-theme')) ||
        (document.body && document.body.getAttribute('data-theme')) ||
        ''
      ).toLowerCase();
      if (t === 'dark') return AV_DARK;
      if (t === 'violet') return AV_VIOLET;
    } catch (e) {}
    return AV_LIGHT;
  }

  function injectCSS() {
    if (document.getElementById('tchiloStableUiCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloStableUiCSS';
    st.textContent =
      '#screen-feed .topbar-icons [data-top-messages] img,' +
      '#screen-feed .topbar-icons .nav-sms-icon,' +
      '.topbar-icons [data-top-messages] img,' +
      '.topbar-icons img.nav-sms-icon,' +
      '.topbar-icons .icon-btn[data-top-messages] img{' +
      'width:' + ICON + 'px!important;height:' + ICON + 'px!important;' +
      'max-width:none!important;max-height:none!important;' +
      'min-width:' + ICON + 'px!important;min-height:' + ICON + 'px!important;' +
      'object-fit:contain!important;display:block!important;}' +
      '#screen-feed .topbar-icons .icon-btn[onclick*="search"] svg,' +
      '.topbar-icons .icon-btn[onclick*="search"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="esquisar"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="Pesquisar"] svg{' +
      'width:' + ICON + 'px!important;height:' + ICON + 'px!important;' +
      'min-width:' + ICON + 'px!important;min-height:' + ICON + 'px!important;}' +
      '.topbar-icons .icon-btn{width:auto!important;height:auto!important;' +
      'min-width:48px!important;min-height:48px!important;' +
      'border:0!important;background:transparent!important;box-shadow:none!important;}' +
      '.avatar,.post .avatar,#screen-feed .avatar,#screen-profile .profile-avatar,' +
      '.profile-avatar,.story-profile-initials{' +
      'border:0!important;border-width:0!important;outline:0!important;' +
      'box-shadow:none!important;-webkit-box-shadow:none!important;' +
      'overflow:hidden!important;}' +
      '.avatar img,.profile-avatar img,.post .avatar img{' +
      'border:0!important;box-shadow:none!important;' +
      'width:100%!important;height:100%!important;object-fit:cover!important;' +
      'border-radius:50%!important;display:block!important;}' +
      '.avatar.tchilo-stable-av{color:transparent!important;font-size:0!important;' +
      'background:transparent!important;}' +
      '.nav-fee,.nav-sms-text,[data-top-messages] span{display:none!important;}' +
      '.nav-item .nav-feed-icon{width:38px!important;height:38px!important;display:block!important;opacity:1!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function safeUrl(u) {
    return String(u || '').replace(/"/g, '"').replace(/'/g, '&#39;');
  }

  function avatarHTML(url) {
    var src = url || defAvatar();
    var fallback = defAvatar();
    return (
      '<div class="avatar tchilo-stable-av" style="border:none;box-shadow:none;overflow:hidden;background:transparent">' +
      '<img src="' + safeUrl(src) + '" alt="" loading="lazy" ' +
      'style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none" ' +
      'onerror="this.onerror=null;this.src=\'' + fallback + '\'">' +
      '</div>'
    );
  }

  function patchAvatarFns() {
    window.renderUserAvatarHTML = function (username) {
      var url = null;
      try {
        if (typeof window.resolveUserAvatarUrl === 'function') {
          url = window.resolveUserAvatarUrl(username);
        }
      } catch (e) {}
      return avatarHTML(url);
    };
    window.renderUserAvatarHTML.__tchiloStable = true;

    window.applyAvatarToElement = function (el, username) {
      if (!el) return;
      var url = null;
      try {
        if (typeof window.resolveUserAvatarUrl === 'function') {
          url = window.resolveUserAvatarUrl(username);
        }
      } catch (e) {}
      el.classList.add('tchilo-stable-av');
      el.style.border = 'none';
      el.style.boxShadow = 'none';
      el.style.overflow = 'hidden';
      el.style.background = 'transparent';
      el.style.color = 'transparent';
      el.style.fontSize = '0';
      var src = url || defAvatar();
      var fb = defAvatar();
      el.innerHTML =
        '<img src="' +
        safeUrl(src) +
        '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none" ' +
        'onerror="this.onerror=null;this.src=\'' +
        fb +
        '\'">';
      el.dataset.tchiloAvOk = '1';
    };
    window.applyAvatarToElement.__tchiloStable = true;
  }

  function fixExistingAvatars() {
    var nodes = document.querySelectorAll('.avatar, .profile-avatar, .story-profile-initials');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.tchiloAvOk === '1') continue;
      var img = el.querySelector('img');
      var src = img ? (img.getAttribute('src') || '') : '';
      var hasPhoto =
        !!src &&
        !/avatar-(escuro|claro|roxo)/.test(src) &&
        (src.indexOf('data:image') === 0 ||
          /https?:|supabase|\.jpg|\.jpeg|\.png|\.webp|storage/i.test(src));
      el.style.border = 'none';
      el.style.boxShadow = 'none';
      if (hasPhoto) {
        el.dataset.tchiloAvOk = '1';
        el.classList.add('tchilo-stable-av');
        img.onerror = function () {
          this.onerror = null;
          this.src = defAvatar();
        };
        continue;
      }
      var text = (el.textContent || '').replace(/\s+/g, '');
      if (!img || !src || text === '?' || (text.length > 0 && text.length <= 3)) {
        window.applyAvatarToElement(el, null);
      }
    }
  }

  function fixTopbarOnce() {
    var bar = document.querySelector('#screen-feed .topbar-icons, .topbar-icons');
    if (!bar) return;
    var msg = bar.querySelector('[data-top-messages]');
    if (msg) {
      msg.querySelectorAll('span,.nav-sms-text').forEach(function (n) {
        try { n.remove(); } catch (e) {}
      });
      var img = msg.querySelector('img');
      if (img) {
        var s = img.getAttribute('src') || '';
        if (s.indexOf('sms-icon') === -1) img.src = 'sms-icon.svg?v=40';
        img.width = ICON;
        img.height = ICON;
        img.style.cssText =
          'width:' + ICON + 'px;height:' + ICON + 'px;object-fit:contain;display:block';
      } else {
        img = document.createElement('img');
        img.className = 'nav-sms-icon';
        img.src = 'sms-icon.svg?v=40';
        img.alt = '';
        img.width = ICON;
        img.height = ICON;
        img.style.cssText =
          'width:' + ICON + 'px;height:' + ICON + 'px;object-fit:contain;display:block';
        msg.appendChild(img);
      }
    }
    Array.prototype.forEach.call(bar.children, function (c) {
      var oc = ((c.getAttribute('onclick') || '') + (c.getAttribute('aria-label') || '')).toLowerCase();
      if (oc.indexOf('search') < 0 && oc.indexOf('pesquis') < 0) return;
      c.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', String(ICON));
        svg.setAttribute('height', String(ICON));
        svg.style.width = ICON + 'px';
        svg.style.height = ICON + 'px';
      });
    });
  }

  function boot() {
    injectCSS();
    patchAvatarFns();
    fixTopbarOnce();
    fixExistingAvatars();
  }

  injectCSS();
  patchAvatarFns();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 300);
  setTimeout(boot, 1200);
})();
