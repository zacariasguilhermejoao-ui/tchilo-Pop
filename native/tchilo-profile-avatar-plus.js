/**
 * Tchilo — botão + no avatar do próprio perfil
 * v2 — estático: sem setInterval, sem recriar em loop
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarPlusV2) return;
  window.__tchiloAvatarPlusV2 = true;
  window.__tchiloAvatarPlusV1 = true;

  var BTN_ID = 'tchiloProfileAvatarPlus';
  var attachedTo = null;

  function injectCSS() {
    var old = document.getElementById('tchiloAvatarPlusCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloAvatarPlusCSS';
    st.textContent =
      '#screen-profile .profile-avatar{position:relative!important;overflow:visible!important;}' +
      '#' +
      BTN_ID +
      '{'
      +
      'position:absolute!important;right:0!important;bottom:0!important;' +
      'left:auto!important;top:auto!important;z-index:5!important;' +
      'width:28px!important;height:28px!important;' +
      'border-radius:50%!important;' +
      'background:#c8f560!important;color:#0B0B0C!important;' +
      'border:2.5px solid var(--ink,#0B0B0C)!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;padding:0!important;margin:0!important;' +
      'box-shadow:none!important;' +
      'animation:none!important;transition:none!important;transform:none!important;' +
      'opacity:1!important;visibility:visible!important;' +
      'pointer-events:auto!important;' +
      '-webkit-tap-highlight-color:transparent;' +
      'will-change:auto!important;' +
      '}' +
      '#' +
      BTN_ID +
      ' svg{width:14px!important;height:14px!important;display:block!important;pointer-events:none!important;' +
      'animation:none!important;transform:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function sessionUser() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  function isOwnProfile() {
    var s = sessionUser();
    if (!s || !s.username) return false;
    var viewing = window.viewingProfileUser;
    if (viewing == null || viewing === '' || viewing === false) return true;
    return String(viewing).toLowerCase() === String(s.username).toLowerCase();
  }

  function findAvatar() {
    return document.querySelector('#screen-profile .profile-avatar');
  }

  function openPicker(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var editInput = document.getElementById('editAvatarInput');
    if (editInput) {
      try {
        editInput.value = '';
        editInput.click();
        return;
      } catch (err) {}
    }
    var input = document.getElementById('tchiloQuickAvatarInput');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'tchiloQuickAvatarInput';
      input.accept = 'image/*';
      input.style.cssText = 'position:fixed;left:-9999px;opacity:0;width:1px;height:1px;';
      document.body.appendChild(input);
      input.addEventListener('change', function (ev) {
        try {
          if (typeof window.onAvatarPicked === 'function') {
            window.onAvatarPicked(ev);
            return;
          }
        } catch (err) {}
      });
    }
    input.value = '';
    input.click();
  }

  function makeBtn() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = BTN_ID;
    btn.className = 'tchilo-av-add';
    btn.setAttribute('aria-label', 'Adicionar foto');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">' +
      '<path d="M12 5v14M5 12h14"/></svg>';
    btn.addEventListener('click', openPicker);
    return btn;
  }

  function ensure() {
    injectCSS();
    var own = isOwnProfile();
    var av = findAvatar();
    var btn = document.getElementById(BTN_ID);

    if (!own) {
      if (btn) {
        try {
          btn.remove();
        } catch (e) {}
      }
      attachedTo = null;
      return;
    }
    if (!av) return;

    /* Já está neste avatar — não tocar (evita mecher/piscar) */
    if (btn && btn.parentNode === av && attachedTo === av) {
      return;
    }

    if (!btn) btn = makeBtn();

    if (btn.parentNode !== av) {
      try {
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      } catch (e2) {}
      av.appendChild(btn);
    }
    attachedTo = av;
  }

  function patchRenderProfile() {
    if (typeof window.renderProfile !== 'function' || window.renderProfile.__avatarPlusV2) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      attachedTo = null; /* HTML recriado — precisa reatar uma vez */
      var r = orig.apply(this, arguments);
      requestAnimationFrame(function () {
        ensure();
      });
      return r;
    };
    window.renderProfile.__avatarPlusV2 = true;
  }

  function boot() {
    injectCSS();
    ensure();
    patchRenderProfile();
  }

  boot();
  setTimeout(boot, 400);
  /* SEM setInterval — era isso que fazia o + "mexer" */
})();
