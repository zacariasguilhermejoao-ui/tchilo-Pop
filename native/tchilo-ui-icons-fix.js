/**
 * Tchilo — SMS + lupa grande + botão + no perfil
 */
(function () {
  'use strict';
  if (window.__tchiloUiIconsFixV1) return;
  window.__tchiloUiIconsFixV1 = true;

  function injectCSS() {
    if (document.getElementById('tchiloUiIconsCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloUiIconsCSS';
    st.textContent =
      /* Topbar: sem caixa, ícones grandes */
      '#screen-feed .topbar-icons,' +
      '.topbar-icons{' +
      'display:flex!important;align-items:center!important;gap:14px!important;}' +
      '#screen-feed .topbar-icons .icon-btn,' +
      '.topbar-icons .icon-btn{' +
      'width:auto!important;height:auto!important;min-width:0!important;' +
      'border:0!important;border-radius:0!important;' +
      'background:transparent!important;box-shadow:none!important;' +
      'padding:4px!important;display:inline-flex!important;' +
      'align-items:center!important;justify-content:center!important;}' +
      '#screen-feed .topbar-icons .icon-btn svg,' +
      '.topbar-icons .icon-btn svg{' +
      'width:26px!important;height:26px!important;display:block!important;}' +
      /* SMS texto grande */
      '.topbar-icons .nav-sms-text,' +
      '.topbar-sms{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'font:900 18px Inter,system-ui,sans-serif!important;' +
      'letter-spacing:.02em!important;color:var(--ink,#0B0B0C)!important;' +
      'border:0!important;background:none!important;box-shadow:none!important;' +
      'padding:4px 2px!important;cursor:pointer!important;}' +
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

  function fixTopbarIcons() {
    var bar =
      document.querySelector('#screen-feed .topbar-icons') ||
      document.querySelector('.topbar .topbar-icons');
    if (!bar) return;

    /* Lupa: garantir SVG 26px */
    var searchBtn =
      bar.querySelector('.icon-btn[onclick*="search"]') ||
      bar.querySelector('.icon-btn');
    if (searchBtn) {
      searchBtn.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', '26');
        svg.setAttribute('height', '26');
        svg.style.width = '26px';
        svg.style.height = '26px';
      });
    }

    /* SMS ao lado da lupa */
    var sms = bar.querySelector('.topbar-sms, .nav-sms-text');
    if (!sms) {
      sms = document.createElement('button');
      sms.type = 'button';
      sms.className = 'topbar-sms nav-sms-text';
      sms.setAttribute('aria-label', 'Mensagens');
      sms.textContent = 'SMS';
      sms.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (typeof goTo === 'function') goTo('messages');
        } catch (err) {}
      });
      /* inserir antes da lupa se existir, senão no fim */
      if (searchBtn && searchBtn.parentNode === bar) {
        bar.insertBefore(sms, searchBtn);
      } else {
        bar.appendChild(sms);
      }
    } else {
      sms.style.display = 'inline-flex';
      sms.textContent = 'SMS';
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
      /* se o avatar-add já tiver handler, o change dele funciona;
         senão o utilizador usa o fluxo normal de editar perfil */
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
    if (typeof window.renderProfile !== 'function' || window.renderProfile.__uiIcons) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      setTimeout(ensureProfilePlus, 40);
      setTimeout(ensureProfilePlus, 200);
      return r;
    };
    window.renderProfile.__uiIcons = true;
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
  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(run, 2000);
  setInterval(function () {
    fixTopbarIcons();
    ensureProfilePlus();
  }, 3500);
})();
