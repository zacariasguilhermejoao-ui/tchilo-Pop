/**
 * Tchilo Stable UI v3
 * - + do perfil: preto com + branco (sem piscar)
 * - avatares: nunca ?, nunca letras; fallback avatar-*.svg
 * - sem MutationObserver agressivo
 */
(function () {
  'use strict';
  if (window.__tchiloStableUiV3) return;
  window.__tchiloStableUiV3 = true;
  window.__tchiloStableUiV2 = true;
  window.__tchiloStableUiV1 = true;

  window.__tchiloFeeSmsFinalV14 = true;
  window.__tchiloFeeSmsFinalV13 = true;
  window.__tchiloUiIconsFixV7 = true;
  window.__tchiloDefaultAvatarV1 = true;
  window.__tchiloUiPolishV1 = true;
  window.__tchiloNavLayoutV2 = true;
  window.__tchiloAvatarPlusV3 = true;

  var SMS_SIZE = 48;
  var SEARCH_SIZE = 28;
  var AV_LIGHT = 'avatar-claro.svg?v=5';
  var AV_DARK = 'avatar-escuro.svg?v=5';
  var AV_VIOLET = 'avatar-roxo.svg?v=5';

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
    var st = document.getElementById('tchiloStableUiCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloStableUiCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#tchiloProfileAvatarPlus.tchilo-av-add,#tchiloProfileAvatarPlus{' +
      'background:#0B0B0C!important;color:#FFFFFF!important;' +
      'border:2px solid #0B0B0C!important;box-shadow:none!important;' +
      'animation:none!important;transition:none!important;transform:none!important;}' +
      '#tchiloProfileAvatarPlus.tchilo-av-add svg,#tchiloProfileAvatarPlus svg{' +
      'stroke:#FFFFFF!important;color:#FFFFFF!important;}' +
      '#screen-feed .topbar-icons [data-top-messages] img,' +
      '.topbar-icons [data-top-messages] img,.topbar-icons img.nav-sms-icon{' +
      'width:' + SMS_SIZE + 'px!important;height:' + SMS_SIZE + 'px!important;' +
      'object-fit:contain!important;display:block!important;}' +
      '.topbar-icons .icon-btn[onclick*="search"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="esquisar"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="Pesquisar"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="Search"] svg{' +
      'width:' + SEARCH_SIZE + 'px!important;height:' + SEARCH_SIZE + 'px!important;}' +
      '.avatar,.post .avatar,#screen-feed .avatar,#screen-profile .profile-avatar,.profile-avatar{' +
      'border:0!important;box-shadow:none!important;outline:0!important;overflow:hidden!important;}' +
      '.avatar img,.profile-avatar img,.post .avatar img{' +
      'border:0!important;box-shadow:none!important;' +
      'width:100%!important;height:100%!important;object-fit:cover!important;' +
      'border-radius:50%!important;display:block!important;}' +
      '.avatar.tchilo-stable-av{color:transparent!important;font-size:0!important;background:transparent!important;}' +
      '.nav-fee,.nav-sms-text,[data-top-messages] span{display:none!important;}' +
      '.nav-item .nav-feed-icon{width:38px!important;height:38px!important;display:block!important;opacity:1!important;}';
  }

  function safeUrl(u) {
    return String(u || '').replace(/"/g, '"').replace(/'/g, '&#39;');
  }

  function avatarHTML(url) {
    var src = url || defAvatar();
    var fallback = defAvatar();
    return (
      '<div class="avatar tchilo-stable-av" style="background:transparent;overflow:hidden;border:none;box-shadow:none">' +
      '<img src="' + safeUrl(src) + '" alt="" loading="lazy" ' +
      'style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none" ' +
      'onerror="this.onerror=null;this.src=\'' + fallback + '\'">' +
      '</div>'
    );
  }

  function patchAvatarFns() {
    window.tchiloDefaultAvatarSrc = defAvatar;
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

  function needsDefault(el) {
    if (!el) return true;
    var img = el.querySelector('img');
    var src = img ? (img.getAttribute('src') || '') : '';
    var text = (el.textContent || '').replace(/\s+/g, '');
    if (text === '?' || text === '??') return true;
    if (!img) return true;
    if (!src) return true;
    if (img.naturalWidth === 0 && img.complete) return true;
    if (text.length > 0 && text.length <= 2 && !/avatar-(escuro|claro|roxo)/.test(src) &&
        !/https?:|supabase|\.jpg|\.jpeg|\.png|\.webp|storage|data:image/i.test(src)) {
      return true;
    }
    return false;
  }

  function fixExistingAvatars() {
    var nodes = document.querySelectorAll('.avatar, .profile-avatar, .story-profile-initials');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var img = el.querySelector('img');
      var src = img ? (img.getAttribute('src') || '') : '';
      el.style.border = 'none';
      el.style.boxShadow = 'none';

      var hasPhoto =
        !!src &&
        !/avatar-(escuro|claro|roxo)/.test(src) &&
        (src.indexOf('data:image') === 0 ||
          /https?:|supabase|\.jpg|\.jpeg|\.png|\.webp|storage/i.test(src));

      if (hasPhoto && img && !(img.complete && img.naturalWidth === 0)) {
        el.dataset.tchiloAvOk = '1';
        el.classList.add('tchilo-stable-av');
        img.onerror = function () {
          this.onerror = null;
          this.src = defAvatar();
        };
        continue;
      }
      if (needsDefault(el) || el.dataset.tchiloAvOk !== '1') {
        window.applyAvatarToElement(el, null);
      }
    }
  }

  function fixPlusBtn() {
    var btn = document.getElementById('tchiloProfileAvatarPlus');
    if (!btn) return;
    btn.style.background = '#0B0B0C';
    btn.style.color = '#FFFFFF';
    btn.style.border = '2px solid #0B0B0C';
    btn.style.boxShadow = 'none';
    btn.style.animation = 'none';
    btn.style.transition = 'none';
    btn.style.transform = 'none';
    var svgs = btn.querySelectorAll('svg');
    for (var i = 0; i < svgs.length; i++) {
      svgs[i].setAttribute('stroke', '#FFFFFF');
      svgs[i].style.stroke = '#FFFFFF';
      svgs[i].style.color = '#FFFFFF';
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
        img.style.cssText =
          'width:' + SMS_SIZE + 'px;height:' + SMS_SIZE + 'px;object-fit:contain;display:block';
      }
    }
    Array.prototype.forEach.call(bar.children, function (c) {
      var oc = ((c.getAttribute('onclick') || '') + (c.getAttribute('aria-label') || '')).toLowerCase();
      if (oc.indexOf('search') < 0 && oc.indexOf('pesquis') < 0) return;
      c.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', String(SEARCH_SIZE));
        svg.setAttribute('height', String(SEARCH_SIZE));
        svg.style.width = SEARCH_SIZE + 'px';
        svg.style.height = SEARCH_SIZE + 'px';
      });
    });
  }

  function boot() {
    injectCSS();
    patchAvatarFns();
    fixPlusBtn();
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
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
})();
