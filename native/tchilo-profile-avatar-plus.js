/**
 * Tchilo — botão + no avatar do próprio perfil
 * Estável: não recria em loop (evita piscar)
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarPlusV1) return;
  window.__tchiloAvatarPlusV1 = true;

  var BTN_ID = 'tchiloProfileAvatarPlus';

  function injectCSS() {
    if (document.getElementById('tchiloAvatarPlusCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAvatarPlusCSS';
    st.textContent =
      '#screen-profile .profile-avatar,' +
      '#screen-profile .profile-header .profile-avatar,' +
      '.profile-avatar{' +
      'position:relative!important;overflow:visible!important;}' +
      /* dentro do círculo, canto inferior direito — não é cortado */
      '#' +
      BTN_ID +
      ',.tchilo-av-add{' +
      'position:absolute!important;' +
      'right:2px!important;bottom:2px!important;' +
      'left:auto!important;top:auto!important;' +
      'z-index:30!important;' +
      'width:34px!important;height:34px!important;' +
      'min-width:34px!important;min-height:34px!important;' +
      'border-radius:50%!important;' +
      'background:#c8f560!important;color:#0B0B0C!important;' +
      'border:2.5px solid var(--ink,#0B0B0C)!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;padding:0!important;margin:0!important;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.25)!important;' +
      'animation:none!important;transition:none!important;' +
      'opacity:1!important;visibility:visible!important;' +
      'pointer-events:auto!important;' +
      '-webkit-tap-highlight-color:transparent;}' +
      '#' +
      BTN_ID +
      ' svg,.tchilo-av-add svg{' +
      'width:16px!important;height:16px!important;display:block!important;' +
      'pointer-events:none!important;}';
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
    var viewing = null;
    try {
      viewing = window.viewingProfileUser;
    } catch (e) {}
    if (viewing == null || viewing === '' || viewing === false) return true;
    return String(viewing).toLowerCase() === String(s.username).toLowerCase();
  }

  function findAvatar() {
    return (
      document.querySelector('#screen-profile .profile-avatar') ||
      document.querySelector('#screen-profile [class*="avatar"]') ||
      null
    );
  }

  function openPicker(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    /* Preferir input do ecrã editar perfil */
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
        var file = ev.target.files && ev.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onloadend = function () {
          try {
            var s = sessionUser();
            if (!s) return;
            if (typeof getProfileExtra === 'function' && typeof setProfileExtra === 'function') {
              var ex = getProfileExtra(s.username) || {};
              ex.avatar = reader.result;
              setProfileExtra(s.username, ex);
            }
            s.avatar = reader.result;
            try {
              localStorage.setItem('tchilo_session', JSON.stringify(s));
            } catch (e2) {}
            if (typeof renderProfile === 'function') renderProfile();
            if (typeof showToast === 'function') showToast('Foto atualizada');
          } catch (e3) {
            console.warn(e3);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
    input.click();
  }

  function getOrCreateBtn() {
    var btn = document.getElementById(BTN_ID);
    if (btn) return btn;
    /* migrar antigo */
    var old = document.querySelector('.tchilo-av-add');
    if (old) {
      old.id = BTN_ID;
      return old;
    }
    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = BTN_ID;
    btn.className = 'tchilo-av-add';
    btn.setAttribute('aria-label', 'Adicionar foto');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">' +
      '<path d="M12 5v14M5 12h14"/></svg>';
    btn.addEventListener('click', openPicker);
    btn.addEventListener(
      'pointerup',
      function (e) {
        if (e.button === 0) openPicker(e);
      },
      true
    );
    return btn;
  }

  function ensure() {
    injectCSS();
    var own = isOwnProfile();
    var btn = document.getElementById(BTN_ID);

    if (!own) {
      if (btn && btn.parentNode) {
        try {
          btn.parentNode.removeChild(btn);
        } catch (e) {}
      }
      document.querySelectorAll('.tchilo-av-add').forEach(function (b) {
        if (b.id !== BTN_ID) {
          try {
            b.remove();
          } catch (e2) {}
        }
      });
      return;
    }

    var av = findAvatar();
    if (!av) return;

    try {
      av.style.setProperty('overflow', 'visible', 'important');
      av.style.setProperty('position', 'relative', 'important');
    } catch (e) {}

    btn = getOrCreateBtn();

    /* já está no sítio certo — não mexer (anti-piscar) */
    if (btn.parentNode === av && document.getElementById(BTN_ID) === btn) {
      btn.style.setProperty('display', 'flex', 'important');
      btn.style.setProperty('opacity', '1', 'important');
      btn.style.setProperty('visibility', 'visible', 'important');
      return;
    }

    /* reatachar sem destruir */
    if (btn.parentNode && btn.parentNode !== av) {
      try {
        btn.parentNode.removeChild(btn);
      } catch (e3) {}
    }
    if (!btn.parentNode) {
      av.appendChild(btn);
    }
    btn.style.setProperty('display', 'flex', 'important');
    btn.style.setProperty('opacity', '1', 'important');
    btn.style.setProperty('visibility', 'visible', 'important');
  }

  var scheduled = null;
  function scheduleEnsure() {
    if (scheduled) return;
    scheduled = setTimeout(function () {
      scheduled = null;
      ensure();
    }, 60);
  }

  function patchRenderProfile() {
    if (typeof window.renderProfile !== 'function') return;
    if (window.renderProfile.__avatarPlusV1) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      scheduleEnsure();
      setTimeout(ensure, 120);
      setTimeout(ensure, 350);
      return r;
    };
    window.renderProfile.__avatarPlusV1 = true;
  }

  function watchProfile() {
    var body = document.getElementById('profileBody') || document.getElementById('screen-profile');
    if (!body || body.__avatarPlusWatch) return;
    body.__avatarPlusWatch = true;
    try {
      new MutationObserver(function () {
        scheduleEnsure();
      }).observe(body, { childList: true, subtree: true });
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    ensure();
    patchRenderProfile();
    watchProfile();
  }

  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 1800);
  /* intervalo leve — só garante, sem recriar se já existe */
  setInterval(ensure, 4000);
})();
