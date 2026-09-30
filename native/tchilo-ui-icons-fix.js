/**
 * Tchilo — SMS no topbar + lupa grande + botão + no perfil
 * v2 — SMS garantido (antes da lupa), ícones maiores
 */
(function () {
  'use strict';
  if (window.__tchiloUiIconsFixV2) return;
  window.__tchiloUiIconsFixV2 = true;
  window.__tchiloUiIconsFixV1 = true;

  function injectCSS() {
    var old = document.getElementById('tchiloUiIconsCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloUiIconsCSS';
    st.textContent =
      '#screen-feed .topbar-icons,' +
      '.topbar-icons{' +
      'display:flex!important;align-items:center!important;gap:16px!important;}' +
      '#screen-feed .topbar-icons .icon-btn,' +
      '.topbar-icons .icon-btn{' +
      'width:auto!important;height:auto!important;min-width:0!important;' +
      'border:0!important;border-radius:0!important;' +
      'background:transparent!important;box-shadow:none!important;' +
      'padding:4px!important;display:inline-flex!important;' +
      'align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;}' +
      '#screen-feed .topbar-icons .icon-btn svg,' +
      '.topbar-icons .icon-btn svg{' +
      'width:28px!important;height:28px!important;display:block!important;' +
      'stroke-width:2.4!important;}' +
      /* SMS texto grande e visível */
      '.topbar-icons .nav-sms-text,' +
      '.topbar-icons .topbar-sms,' +
      '.topbar-sms,' +
      '[data-top-messages] .nav-sms-text{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'font:900 20px Inter,system-ui,sans-serif!important;' +
      'letter-spacing:.03em!important;line-height:1!important;' +
      'color:var(--ink,#0B0B0C)!important;' +
      'border:0!important;background:none!important;box-shadow:none!important;' +
      'padding:4px 2px!important;cursor:pointer!important;' +
      'opacity:1!important;visibility:visible!important;' +
      'user-select:none;-webkit-user-select:none;}' +
      '[data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;' +
      'opacity:1!important;visibility:visible!important;' +
      'pointer-events:auto!important;}' +
      /* Botão + fora do círculo do avatar */
      '.profile-avatar{' +
      'position:relative!important;overflow:visible!important;}' +
      '.tchilo-av-add{' +
      'position:absolute!important;right:-12px!important;bottom:-12px!important;' +
      'z-index:20!important;width:36px!important;height:36px!important;' +
      'border-radius:50%!important;background:#c8f560!important;color:#0B0B0C!important;' +
      'border:2.5px solid var(--ink,#0B0B0C)!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;padding:0!important;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.22)!important;' +
      'animation:none!important;visibility:visible!important;opacity:1!important;}' +
      '.tchilo-av-add svg{width:18px!important;height:18px!important;display:block!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function openMessages(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (typeof goTo === 'function') goTo('messages');
    } catch (err) {}
  }

  function fixTopbarIcons() {
    var bar =
      document.querySelector('#screen-feed .topbar-icons') ||
      document.querySelector('.topbar .topbar-icons') ||
      document.querySelector('.topbar-icons');
    if (!bar) return;

    /* Lupa: SVG 28px */
    var searchBtn =
      bar.querySelector('.icon-btn[onclick*="search"]') ||
      bar.querySelector('[onclick*="search"]') ||
      null;
    if (!searchBtn) {
      var candidates = bar.querySelectorAll('.icon-btn');
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].querySelector('svg circle') && !candidates[i].getAttribute('data-top-messages')) {
          searchBtn = candidates[i];
          break;
        }
      }
    }
    if (searchBtn) {
      searchBtn.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', '28');
        svg.setAttribute('height', '28');
        svg.style.setProperty('width', '28px', 'important');
        svg.style.setProperty('height', '28px', 'important');
      });
    }

    /* SMS — sempre presente, ANTES da lupa */
    var sms =
      bar.querySelector('[data-top-messages]') ||
      bar.querySelector('.topbar-sms');

    if (!sms) {
      sms = document.createElement('button');
      sms.type = 'button';
      sms.className = 'icon-btn topbar-sms';
      sms.setAttribute('data-top-messages', '1');
      sms.setAttribute('aria-label', 'Mensagens');
      sms.innerHTML = '<span class="nav-sms-text">SMS</span>';
      sms.addEventListener('click', openMessages);
      sms.addEventListener('pointerup', function (e) {
        if (e.button === 0) openMessages(e);
      });
      if (searchBtn && searchBtn.parentNode === bar) {
        bar.insertBefore(sms, searchBtn);
      } else {
        bar.insertBefore(sms, bar.firstChild);
      }
    } else {
      sms.style.setProperty('display', 'inline-flex', 'important');
      sms.style.setProperty('visibility', 'visible', 'important');
      sms.style.setProperty('opacity', '1', 'important');
      if (!sms.querySelector('.nav-sms-text')) {
        sms.innerHTML = '<span class="nav-sms-text">SMS</span>';
      } else {
        sms.querySelector('.nav-sms-text').textContent = 'SMS';
      }
      if (!sms.__tchiloSmsBound) {
        sms.__tchiloSmsBound = true;
        sms.addEventListener('click', openMessages);
      }
      /* ordem: SMS antes da lupa */
      if (searchBtn && searchBtn.parentNode === bar && sms.nextSibling !== searchBtn) {
        bar.insertBefore(sms, searchBtn);
      }
    }
  }

  function getSessionSafe() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  function isOwnProfile() {
    try {
      if (window.viewingProfileUser) return false;
    } catch (e) {}
    var s = getSessionSafe();
    return !!(s && s.username);
  }

  function openAvatarPicker(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var input = document.getElementById('tchiloQuickAvatarInput');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'tchiloQuickAvatarInput';
      input.accept = 'image/*';
      input.style.cssText = 'position:fixed;left:-9999px;opacity:0;width:1px;height:1px;';
      document.body.appendChild(input);
    }
    input.value = '';
    input.click();
  }

  function ensureProfilePlus() {
    if (!isOwnProfile()) {
      document.querySelectorAll('.tchilo-av-add').forEach(function (b) {
        try {
          b.remove();
        } catch (e) {}
      });
      return;
    }
    document.querySelectorAll('#screen-profile .profile-avatar, .profile-avatar').forEach(function (av) {
      try {
        av.style.overflow = 'visible';
        av.style.position = 'relative';
      } catch (e) {}
      var btn = av.querySelector('.tchilo-av-add');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tchilo-av-add';
        btn.setAttribute('aria-label', 'Adicionar foto');
        btn.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">' +
          '<path d="M12 5v14M5 12h14"/></svg>';
        btn.addEventListener('click', openAvatarPicker);
        av.appendChild(btn);
      } else {
        btn.style.display = 'flex';
        btn.style.width = '36px';
        btn.style.height = '36px';
        btn.style.right = '-12px';
        btn.style.bottom = '-12px';
      }
    });
  }

  function patchRenderProfile() {
    if (typeof window.renderProfile !== 'function' || window.renderProfile.__uiIconsV2) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      setTimeout(ensureProfilePlus, 40);
      setTimeout(ensureProfilePlus, 200);
      return r;
    };
    window.renderProfile.__uiIconsV2 = true;
  }

  function run() {
    injectCSS();
    fixTopbarIcons();
    ensureProfilePlus();
    patchRenderProfile();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 150);
  setTimeout(run, 500);
  setTimeout(run, 1200);
  setTimeout(run, 2500);
  setInterval(function () {
    fixTopbarIcons();
    ensureProfilePlus();
  }, 2000);
})();
