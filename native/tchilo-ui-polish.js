/**
 * Tchilo UI polish v1
 * 1) Mensagem + lupa maiores (48px)
 * 2) Sem letras / sem "?" nos avatares — so icone default ou foto
 * 3) Sem circulo preto a volta das fotos
 * 4) Sem piscar (marca elementos ja corrigidos)
 */
(function () {
  'use strict';
  if (window.__tchiloUiPolishV1) return;
  window.__tchiloUiPolishV1 = true;

  var ICON = 48;
  var DEF = {
    dark: 'avatar-escuro.svg?v=2',
    violet: 'avatar-roxo.svg?v=2',
    light: 'avatar-claro.svg?v=2'
  };

  function themeKey() {
    try {
      var t = (
        (document.documentElement && document.documentElement.getAttribute('data-theme')) ||
        (document.body && document.body.getAttribute('data-theme')) ||
        ''
      ).toLowerCase();
      if (t === 'dark') return 'dark';
      if (t === 'violet') return 'violet';
      return 'light';
    } catch (e) {
      return 'light';
    }
  }

  function defSrc() {
    return DEF[themeKey()] || DEF.light;
  }

  function css() {
    var st = document.getElementById('tchiloUiPolishCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloUiPolishCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.avatar,.post .avatar,.feed .avatar,.profile-avatar,.story-avatar,' +
      '#screen-profile .profile-avatar,#screen-feed .avatar{' +
      'border:none!important;border-width:0!important;outline:none!important;' +
      'box-shadow:none!important;-webkit-box-shadow:none!important;' +
      'overflow:hidden!important;background-clip:padding-box!important;}' +
      '.avatar img,.profile-avatar img,.post .avatar img{' +
      'border:none!important;outline:none!important;box-shadow:none!important;' +
      'width:100%!important;height:100%!important;object-fit:cover!important;' +
      'border-radius:50%!important;display:block!important;}' +
      '.avatar.tchilo-polished,.avatar.tchilo-has-default{' +
      'color:transparent!important;font-size:0!important;text-indent:-9999px!important;}' +
      '.topbar-icons .icon-btn{min-width:48px!important;min-height:48px!important;}' +
      '.topbar-icons .nav-sms-icon,.topbar-icons [data-top-messages] img,' +
      '[data-top-messages] img.nav-sms-icon,[data-top-messages] > img{' +
      'width:' + ICON + 'px!important;height:' + ICON + 'px!important;' +
      'max-width:' + ICON + 'px!important;max-height:' + ICON + 'px!important;' +
      'object-fit:contain!important;display:block!important;}' +
      '.topbar-icons .icon-btn[onclick*="search"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="esquisar"] svg,' +
      '.topbar-icons .icon-btn[aria-label*="Search"] svg{' +
      'width:' + ICON + 'px!important;height:' + ICON + 'px!important;' +
      'display:block!important;stroke-width:2!important;}' +
      '[data-top-messages] span,.nav-sms-text,.topbar-icons .nav-sms-text{display:none!important;}' +
      '.nav-item .nav-feed-icon,img.nav-feed-icon{' +
      'width:38px!important;height:38px!important;display:block!important;' +
      'object-fit:contain!important;opacity:1!important;}' +
      '.nav-fee,.nav-text-icon.nav-fee{display:none!important;}';
  }

  function isSearch(el) {
    if (!el) return false;
    var s = ((el.getAttribute('onclick') || '') + (el.getAttribute('aria-label') || '')).toLowerCase();
    return s.indexOf('search') >= 0 || s.indexOf('pesquis') >= 0;
  }

  function isMsg(el) {
    if (!el) return false;
    if (el.getAttribute('data-top-messages')) return true;
    var s = (
      (el.getAttribute('onclick') || '') +
      (el.getAttribute('aria-label') || '') +
      (el.getAttribute('title') || '')
    ).toLowerCase();
    return s.indexOf('message') >= 0 || s.indexOf('sms') >= 0 || s.indexOf('mensagem') >= 0;
  }

  function hasRealPhoto(el) {
    var img = el && el.querySelector && el.querySelector('img');
    if (!img) return false;
    var s = (img.getAttribute('src') || '') + '';
    if (!s) return false;
    if (/avatar-(escuro|claro|roxo)/.test(s)) return false;
    if (s.indexOf('data:image') === 0) return true;
    if (/https?:|supabase|\.jpg|\.jpeg|\.png|\.webp|storage/i.test(s)) return true;
    return false;
  }

  function textLooksPlaceholder(el) {
    var t = ((el && el.textContent) || '').replace(/\s+/g, '');
    if (!t) return true;
    if (t === '?' || t === '??' || t === '\u2026') return true;
    if (t.length <= 3 && /^[A-Za-z\u00C0-\u00FF0-9?]+$/.test(t)) return true;
    return false;
  }

  function setDefaultAvatar(el) {
    if (!el || el.dataset.tchiloAvOk === '1') return;
    if (hasRealPhoto(el)) {
      el.dataset.tchiloAvOk = '1';
      el.classList.add('tchilo-polished');
      el.style.border = 'none';
      el.style.boxShadow = 'none';
      return;
    }
    var src = defSrc();
    el.classList.add('tchilo-has-default', 'tchilo-polished');
    el.style.border = 'none';
    el.style.boxShadow = 'none';
    el.style.outline = 'none';
    el.style.overflow = 'hidden';
    el.style.background = 'transparent';
    el.style.color = 'transparent';
    el.style.fontSize = '0';
    el.innerHTML =
      '<img class="tchilo-default-avatar" src="' +
      src +
      '" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none">';
    el.dataset.tchiloAvOk = '1';
  }

  function fixAvatars() {
    var list = document.querySelectorAll(
      '.avatar, .profile-avatar, .story-profile-initials, .post-header .avatar, #screen-feed .avatar'
    );
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.dataset.tchiloAvOk === '1' && hasRealPhoto(el)) continue;
      if (hasRealPhoto(el)) {
        el.style.border = 'none';
        el.style.boxShadow = 'none';
        el.classList.add('tchilo-polished');
        el.dataset.tchiloAvOk = '1';
        continue;
      }
      if (!el.querySelector('img') || textLooksPlaceholder(el)) {
        setDefaultAvatar(el);
      } else {
        el.style.border = 'none';
        el.style.boxShadow = 'none';
      }
    }
  }

  function fixTopbarIcons() {
    var bar = document.querySelector('#screen-feed .topbar-icons, .topbar-icons');
    if (!bar) return;

    var msg = bar.querySelector('[data-top-messages]');
    if (!msg) {
      Array.prototype.forEach.call(bar.children, function (c) {
        if (isMsg(c)) {
          msg = c;
          c.setAttribute('data-top-messages', '1');
        }
      });
    }
    if (msg) {
      msg.querySelectorAll('span,.nav-sms-text').forEach(function (n) {
        try { n.remove(); } catch (e) {}
      });
      var img = msg.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.className = 'nav-sms-icon';
        img.alt = 'Mensagens';
        msg.appendChild(img);
      }
      var cur = img.getAttribute('src') || '';
      if (cur.indexOf('sms-icon.svg') === -1) {
        img.src = 'sms-icon.svg?v=30';
      }
      img.className = 'nav-sms-icon';
      img.width = ICON;
      img.height = ICON;
      img.style.cssText =
        'width:' + ICON + 'px;height:' + ICON + 'px;object-fit:contain;display:block;';
      msg.dataset.tchiloIconOk = '1';
    }

    Array.prototype.forEach.call(bar.children, function (c) {
      if (!isSearch(c)) return;
      c.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', String(ICON));
        svg.setAttribute('height', String(ICON));
        svg.style.width = ICON + 'px';
        svg.style.height = ICON + 'px';
      });
    });

    if (msg) {
      var search = null;
      Array.prototype.forEach.call(bar.children, function (c) {
        if (isSearch(c)) search = c;
      });
      if (search) {
        var kids = Array.prototype.slice.call(bar.children);
        if (kids.indexOf(msg) > kids.indexOf(search)) bar.insertBefore(msg, search);
      }
    }
  }

  function patchRender() {
    if (typeof window.renderUserAvatarHTML === 'function' && !window.renderUserAvatarHTML.__polish) {
      window.renderUserAvatarHTML = function (username) {
        var url = null;
        try {
          if (typeof window.resolveUserAvatarUrl === 'function') url = window.resolveUserAvatarUrl(username);
        } catch (e) {}
        if (url) {
          return (
            '<div class="avatar tchilo-polished" style="border:none;box-shadow:none;overflow:hidden;background:transparent">' +
            '<img src="' +
            String(url).replace(/"/g, '&quot;') +
            '" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none" ' +
            'onerror="this.onerror=null;this.src=\'' +
            defSrc() +
            '\'">' +
            '</div>'
          );
        }
        return (
          '<div class="avatar tchilo-has-default tchilo-polished" style="border:none;box-shadow:none;overflow:hidden;background:transparent">' +
          '<img class="tchilo-default-avatar" src="' +
          defSrc() +
          '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none">' +
          '</div>'
        );
      };
      window.renderUserAvatarHTML.__polish = true;
    }

    if (typeof window.applyAvatarToElement === 'function' && !window.applyAvatarToElement.__polish) {
      window.applyAvatarToElement = function (el, username) {
        if (!el) return;
        var url = null;
        try {
          if (typeof window.resolveUserAvatarUrl === 'function') url = window.resolveUserAvatarUrl(username);
        } catch (e) {}
        el.style.border = 'none';
        el.style.boxShadow = 'none';
        el.style.overflow = 'hidden';
        el.classList.add('tchilo-polished');
        if (url) {
          el.innerHTML =
            '<img src="' +
            String(url).replace(/"/g, '&quot;') +
            '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:none" ' +
            'onerror="this.onerror=null;this.src=\'' +
            defSrc() +
            '\'">';
          el.dataset.tchiloAvOk = '1';
        } else {
          setDefaultAvatar(el);
        }
      };
      window.applyAvatarToElement.__polish = true;
    }
  }

  function run() {
    css();
    patchRender();
    fixTopbarIcons();
    fixAvatars();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 150);
  setTimeout(run, 700);
  setTimeout(run, 1800);

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      run();
    }, 200);
  }
  try {
    var obs = new MutationObserver(schedule);
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    else
      document.addEventListener('DOMContentLoaded', function () {
        obs.observe(document.body, { childList: true, subtree: true });
      });
  } catch (e) {}
})();
