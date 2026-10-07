/**
 * Tchilo — avatares estáveis (sem piscar)
 * - URLs partidas vão para blacklist e nunca são reutilizadas
 * - Sem foto → ícone SVG por tema (não letras que oscilam)
 * - onerror → fallback uma vez, sem remove()+recreate loop
 * - Não reescreve o DOM se src já está correto
 */
(function () {
  'use strict';
  if (window.__TCHILO_AVATAR_STABLE_V1) return;
  window.__TCHILO_AVATAR_STABLE_V1 = true;

  var BROKEN = (window.__tchiloAvatarBroken = window.__tchiloAvatarBroken || {});
  var V = '2';
  var SRC = {
    dark: 'avatar-escuro.svg?v=' + V,
    violet: 'avatar-roxo.svg?v=' + V,
    light: 'avatar-claro.svg?v=' + V
  };

  function theme() {
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
    return SRC[theme()] || SRC.light;
  }
  window.tchiloDefaultAvatarSrc = defaultSrc;

  function isBroken(url) {
    if (!url) return true;
    return !!BROKEN[String(url)];
  }

  function markBroken(url) {
    if (!url) return;
    BROKEN[String(url)] = 1;
    try {
      if (window.__tchiloAvatarCache) {
        var c = window.__tchiloAvatarCache;
        Object.keys(c).forEach(function (k) {
          if (c[k] === url) delete c[k];
        });
      }
    } catch (e) {}
  }

  function isDefaultSrc(url) {
    if (!url) return false;
    return (
      url.indexOf('avatar-escuro') >= 0 ||
      url.indexOf('avatar-claro') >= 0 ||
      url.indexOf('avatar-roxo') >= 0
    );
  }

  function safeUrl(url) {
    if (!url) return null;
    url = String(url).trim();
    if (!url || url === 'null' || url === 'undefined') return null;
    if (isBroken(url)) return null;
    if (isDefaultSrc(url)) return url;
    return url;
  }

  function injectCSS() {
    if (document.getElementById('tchilo-avatar-stable-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-avatar-stable-css';
    st.textContent =
      '.avatar img,.profile-avatar img,.story-card-avatar img,.story-profile-initials img,' +
      '.chat-header .avatar img,[class*="avatar"] img.tchilo-av-stable{' +
      'width:100%!important;height:100%!important;object-fit:cover!important;' +
      'border-radius:50%!important;display:block!important;' +
      'animation:none!important;transition:opacity .15s ease!important;}' +
      '.avatar.tchilo-av-ready,.profile-avatar.tchilo-av-ready{overflow:hidden!important;}' +
      '.avatar.tchilo-av-ready{color:transparent!important;font-size:0!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function makeImg(url, isDefault) {
    var img = document.createElement('img');
    img.className = 'tchilo-av-stable' + (isDefault ? ' tchilo-default-avatar' : '');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.draggable = false;
    img.style.cssText =
      'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;animation:none;';
    img.setAttribute('data-av-src', url);
    img.onerror = function () {
      this.onerror = null;
      if (!isDefaultSrc(url)) markBroken(url);
      var fb = defaultSrc();
      if (this.getAttribute('src') === fb) {
        this.style.display = 'none';
        return;
      }
      this.classList.add('tchilo-default-avatar');
      this.setAttribute('data-av-src', fb);
      this.src = fb;
    };
    img.src = url;
    return img;
  }

  function paintStable(el, username, initials, bg) {
    if (!el) return;
    injectCSS();

    var url = null;
    try {
      if (typeof window.resolveUserAvatarUrl === 'function') {
        url = safeUrl(window.resolveUserAvatarUrl(username));
      }
    } catch (e) {}
    if (!url) url = null;

    var key = (url || '') + '|' + theme();
    if (el.getAttribute('data-av-stable-key') === key) {
      var existing = el.querySelector('img.tchilo-av-stable');
      if (existing && existing.getAttribute('src') && existing.style.display !== 'none') {
        return;
      }
    }

    var color = bg || 'var(--mint)';
    try {
      if (typeof getProfileExtra === 'function') {
        var ex = getProfileExtra(username) || {};
        if (ex.avatarColor) color = ex.avatarColor;
      }
    } catch (e) {}

    var plus = el.querySelector('.tchilo-av-add, #tchiloProfileAvatarPlus');
    var plusNode = plus ? plus.cloneNode(true) : null;

    var finalUrl = url || defaultSrc();
    var isDef = !url || isDefaultSrc(finalUrl);

    el.style.background = isDef ? 'transparent' : color;
    el.style.overflow = 'hidden';
    el.classList.add('tchilo-av-ready');
    if (isDef) el.classList.add('tchilo-has-default');
    else el.classList.remove('tchilo-has-default');

    var cur = el.querySelector('img.tchilo-av-stable, img');
    if (cur && cur.getAttribute('src') === finalUrl && cur.style.display !== 'none') {
      el.setAttribute('data-av-stable-key', key);
      return;
    }

    el.textContent = '';
    var img = makeImg(finalUrl, isDef);
    el.appendChild(img);
    if (plusNode) {
      el.style.position = el.style.position || 'relative';
      el.appendChild(plusNode);
    }
    el.setAttribute('data-av-stable-key', key);
    el.setAttribute('data-av-url', finalUrl);
  }

  function patchFns() {
    if (typeof window.applyAvatarToElement === 'function' && !window.applyAvatarToElement.__stableV1) {
      window.applyAvatarToElement = function (el, username, initials, bg) {
        paintStable(el, username, initials, bg);
      };
      window.applyAvatarToElement.__stableV1 = true;
    }

    if (typeof window.renderUserAvatarHTML === 'function' && !window.renderUserAvatarHTML.__stableV1) {
      window.renderUserAvatarHTML = function (username, initials, bg) {
        var url = null;
        try {
          if (typeof window.resolveUserAvatarUrl === 'function') {
            url = safeUrl(window.resolveUserAvatarUrl(username));
          }
        } catch (e) {}
        var color = bg || 'var(--mint)';
        try {
          if (typeof getProfileExtra === 'function') {
            var ex = getProfileExtra(username) || {};
            if (ex.avatarColor) color = ex.avatarColor;
          }
        } catch (e2) {}
        var finalUrl = url || defaultSrc();
        var isDef = !url;
        var bgCss = isDef ? 'transparent' : color;
        return (
          '<div class="avatar tchilo-av-ready' +
          (isDef ? ' tchilo-has-default' : '') +
          '" style="background:' +
          bgCss +
          ';overflow:hidden" data-av-stable-key="' +
          String(finalUrl).replace(/"/g, '') +
          '|' +
          theme() +
          '">' +
          '<img class="tchilo-av-stable' +
          (isDef ? ' tchilo-default-avatar' : '') +
          '" src="' +
          String(finalUrl).replace(/"/g, '&quot;') +
          '" alt="" loading="lazy" decoding="async" draggable="false" ' +
          'style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;animation:none" ' +
          'onerror="this.onerror=null;try{window.__tchiloAvatarBroken=window.__tchiloAvatarBroken||{};window.__tchiloAvatarBroken[this.getAttribute(\'data-av-src\')||this.src]=1;}catch(e){}' +
          'this.src=\'' +
          defaultSrc().replace(/'/g, '') +
          '\';this.classList.add(\'tchilo-default-avatar\');">' +
          '</div>'
        );
      };
      window.renderUserAvatarHTML.__stableV1 = true;
    }

    if (typeof window.resolveUserAvatarUrl === 'function' && !window.resolveUserAvatarUrl.__stableV1) {
      var origResolve = window.resolveUserAvatarUrl;
      window.resolveUserAvatarUrl = function (username) {
        var u = origResolve.apply(this, arguments);
        return safeUrl(u);
      };
      window.resolveUserAvatarUrl.__stableV1 = true;
    }

    if (typeof window.cacheUserProfile === 'function' && !window.cacheUserProfile.__stableV1) {
      var origCache = window.cacheUserProfile;
      window.cacheUserProfile = function (username, data) {
        if (data && data.avatar && isBroken(data.avatar)) {
          data = Object.assign({}, data, { avatar: null });
        }
        return origCache.call(this, username, data);
      };
      window.cacheUserProfile.__stableV1 = true;
    }
  }

  function fixProfileImgs() {
    document.querySelectorAll('.profile-avatar img, .avatar img, .story-card-avatar img').forEach(function (img) {
      if (img.__stableBound) return;
      img.__stableBound = true;
      var src = img.getAttribute('src') || '';
      if (isBroken(src)) {
        img.onerror = null;
        img.src = defaultSrc();
        img.classList.add('tchilo-default-avatar');
        return;
      }
      if (!img.onerror || String(img.getAttribute('onerror') || '').indexOf('remove') >= 0) {
        img.removeAttribute('onerror');
        img.onerror = function () {
          this.onerror = null;
          markBroken(src);
          this.src = defaultSrc();
          this.classList.add('tchilo-default-avatar');
        };
      }
    });
  }

  function upgradeLetterAvatars() {
    document.querySelectorAll('.avatar, .story-profile-initials, .story-card-avatar').forEach(function (el) {
      if (el.getAttribute('data-av-stable-key')) return;
      if (el.querySelector('img')) return;
      var t = (el.textContent || '').replace(/\s+/g, '');
      if (t.length >= 1 && t.length <= 3) {
        el.textContent = '';
        el.style.background = 'transparent';
        el.classList.add('tchilo-has-default', 'tchilo-av-ready');
        el.appendChild(makeImg(defaultSrc(), true));
        el.setAttribute('data-av-stable-key', defaultSrc() + '|' + theme());
      }
    });
  }

  function boot() {
    injectCSS();
    patchFns();
    fixProfileImgs();
    upgradeLetterAvatars();
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(function () {
    patchFns();
    fixProfileImgs();
  }, 3000);

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      patchFns();
      fixProfileImgs();
      upgradeLetterAvatars();
    }, 200);
  }
  try {
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) {
          schedule();
          return;
        }
      }
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    else
      document.addEventListener('DOMContentLoaded', function () {
        obs.observe(document.body, { childList: true, subtree: true });
      });
  } catch (e) {}

  try {
    var themeObs = new MutationObserver(function () {
      var src = defaultSrc();
      document.querySelectorAll('img.tchilo-default-avatar').forEach(function (img) {
        if (img.getAttribute('src') !== src) img.src = src;
      });
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) {}
})();
