/**
 * Avatares por defeito (sem foto) — icones, nunca letras
 * v1: avatar-escuro / avatar-claro / avatar-roxo conforme tema
 */
(function () {
  'use strict';
  if (window.__tchiloDefaultAvatarV1) return;
  window.__tchiloDefaultAvatarV1 = true;

  var V = '1';
  var SRC = {
    dark: 'avatar-escuro.svg?v=' + V,
    violet: 'avatar-roxo.svg?v=' + V,
    light: 'avatar-claro.svg?v=' + V
  };

  function currentTheme() {
    try {
      var t =
        (document.documentElement && document.documentElement.getAttribute('data-theme')) ||
        (document.body && document.body.getAttribute('data-theme')) ||
        '';
      t = String(t).toLowerCase();
      if (t === 'dark') return 'dark';
      if (t === 'violet') return 'violet';
      return 'light';
    } catch (e) {
      return 'light';
    }
  }

  function defaultSrc() {
    return SRC[currentTheme()] || SRC.light;
  }

  window.tchiloDefaultAvatarSrc = defaultSrc;

  function imgHtml(src) {
    return (
      '<img class="tchilo-default-avatar" src="' +
      src +
      '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block" onerror="this.style.display=\'none\'">'
    );
  }

  function injectCSS() {
    var st = document.getElementById('tchiloDefaultAvatarCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloDefaultAvatarCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.avatar{overflow:hidden!important;}' +
      '.avatar img,.avatar .tchilo-default-avatar,' +
      '.story-profile-initials img,.profile-avatar img.tchilo-default-avatar{' +
      'width:100%!important;height:100%!important;object-fit:cover!important;' +
      'border-radius:50%!important;display:block!important;}' +
      '.avatar.tchilo-has-default{background:transparent!important;color:transparent!important;font-size:0!important;}' +
      '.story-profile-initials.tchilo-has-default{background:transparent!important;color:transparent!important;font-size:0!important;}';
  }

  function hasRealPhoto(el) {
    if (!el) return false;
    var img = el.querySelector('img');
    if (!img) return false;
    var s = (img.getAttribute('src') || '') + '';
    if (!s) return false;
    if (s.indexOf('avatar-escuro') >= 0 || s.indexOf('avatar-claro') >= 0 || s.indexOf('avatar-roxo') >= 0)
      return false;
    if (s.indexOf('data:') === 0 && s.indexOf('image') > 0) return true;
    if (s.indexOf('http') === 0 || s.indexOf('//') === 0 || s.indexOf('supabase') >= 0 || s.indexOf('storage') >= 0)
      return true;
    if (s.indexOf('.jpg') >= 0 || s.indexOf('.jpeg') >= 0 || s.indexOf('.png') >= 0 || s.indexOf('.webp') >= 0)
      return true;
    return false;
  }

  function looksLikeLettersOnly(el) {
    if (!el) return false;
    if (el.querySelector('img')) return false;
    var t = (el.textContent || '').replace(/\s+/g, '');
    return t.length > 0 && t.length <= 3;
  }

  function applyDefaultToEl(el) {
    if (!el) return;
    if (hasRealPhoto(el)) return;
    var src = defaultSrc();
    el.classList.add('tchilo-has-default');
    el.style.overflow = 'hidden';
    el.style.background = 'transparent';
    el.innerHTML = imgHtml(src);
  }

  function patchRenderFns() {
    if (typeof window.renderUserAvatarHTML === 'function' && !window.renderUserAvatarHTML.__tchiloDefAv) {
      var origR = window.renderUserAvatarHTML;
      window.renderUserAvatarHTML = function (username, initials, bg) {
        try {
          if (typeof window.resolveUserAvatarUrl === 'function') {
            var url = window.resolveUserAvatarUrl(username);
            if (url) return origR.apply(this, arguments);
          }
        } catch (e) {}
        var src = defaultSrc();
        return (
          '<div class="avatar tchilo-has-default" style="background:transparent;overflow:hidden">' +
          imgHtml(src) +
          '</div>'
        );
      };
      window.renderUserAvatarHTML.__tchiloDefAv = true;
    }

    if (typeof window.applyAvatarToElement === 'function' && !window.applyAvatarToElement.__tchiloDefAv) {
      var origA = window.applyAvatarToElement;
      window.applyAvatarToElement = function (el, username, initials, bg) {
        if (!el) return;
        var url = null;
        try {
          if (typeof window.resolveUserAvatarUrl === 'function') {
            url = window.resolveUserAvatarUrl(username);
          }
        } catch (e) {}
        if (url) {
          return origA.apply(this, arguments);
        }
        applyDefaultToEl(el);
      };
      window.applyAvatarToElement.__tchiloDefAv = true;
    }
  }

  function scanAndFix() {
    injectCSS();
    patchRenderFns();
    var nodes = document.querySelectorAll(
      '.avatar, .story-profile-initials, .profile-avatar'
    );
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (hasRealPhoto(el)) continue;
      if (looksLikeLettersOnly(el) || !el.querySelector('img')) {
        applyDefaultToEl(el);
      }
    }
  }

  function onThemeChange() {
    var nodes = document.querySelectorAll('.avatar.tchilo-has-default, .story-profile-initials.tchilo-has-default');
    var src = defaultSrc();
    for (var i = 0; i < nodes.length; i++) {
      var img = nodes[i].querySelector('img');
      if (img) img.src = src;
      else applyDefaultToEl(nodes[i]);
    }
  }

  scanAndFix();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scanAndFix);
  setTimeout(scanAndFix, 200);
  setTimeout(scanAndFix, 800);
  setTimeout(scanAndFix, 2000);

  var t = null;
  function schedule() {
    if (t) clearTimeout(t);
    t = setTimeout(scanAndFix, 120);
  }
  var obs = new MutationObserver(schedule);
  if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  else
    document.addEventListener('DOMContentLoaded', function () {
      obs.observe(document.body, { childList: true, subtree: true });
    });

  try {
    var themeObs = new MutationObserver(onThemeChange);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (document.body) themeObs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) {}
})();
