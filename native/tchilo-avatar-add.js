/**
 * Tchilo — botão + estável na foto de perfil (sem piscar)
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarAddV2) return;
  window.__tchiloAvatarAddV2 = true;

  var plusInjected = false;

  function injectCSS() {
    if (document.getElementById('tchiloAvatarAddCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAvatarAddCSS';
    st.textContent =
      '.profile-avatar{position:relative;}' +
      '.tchilo-av-add{' +
      'position:absolute;right:-2px;bottom:-2px;z-index:5;' +
      'width:32px;height:32px;border-radius:50%;' +
      'background:#c8f560;color:#0B0B0C;' +
      'border:2.5px solid var(--ink,#0B0B0C);' +
      'display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.18);' +
      'touch-action:manipulation;-webkit-tap-highlight-color:transparent;' +
      'animation:none!important;transition:transform .1s ease;}' +
      '.tchilo-av-add:active{transform:scale(.94);}' +
      '.tchilo-av-add svg{width:16px;height:16px;display:block;pointer-events:none;}' +
      '#tchiloQuickAvatarInput{position:fixed;left:-9999px;width:1px;height:1px;opacity:0;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureInput() {
    var input = document.getElementById('tchiloQuickAvatarInput');
    if (input) return input;
    input = document.createElement('input');
    input.type = 'file';
    input.id = 'tchiloQuickAvatarInput';
    input.accept = 'image/*';
    input.addEventListener('change', onFilePicked);
    document.body.appendChild(input);
    return input;
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
    var session = getSessionSafe();
    return !!(session && session.username);
  }

  function showToastSafe(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
    } catch (e) {}
  }

  function compressImage(file, maxW, quality) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var scale = Math.min(1, (maxW || 720) / Math.max(w, h));
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(w * scale));
          c.height = Math.max(1, Math.round(h * scale));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          c.toBlob(
            function (blob) {
              resolve(blob || file);
            },
            'image/jpeg',
            quality || 0.85
          );
        } catch (e) {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  function blobToDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onloadend = function () {
        resolve(r.result);
      };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  async function saveAvatarFromDataUrl(dataUrl) {
    var session = getSessionSafe();
    if (!session || !session.username) throw new Error('Sem sessão');

    var cloudUrl = dataUrl;
    try {
      if (typeof tchiloUploadAvatar === 'function' && window.tchiloSupabase) {
        var uid = window.__tchiloCloudUserId || null;
        if (!uid) {
          var auth = await window.tchiloSupabase.auth.getSession();
          uid =
            auth &&
            auth.data &&
            auth.data.session &&
            auth.data.session.user &&
            auth.data.session.user.id;
          if (uid) window.__tchiloCloudUserId = uid;
        }
        if (uid) {
          var uploaded = await tchiloUploadAvatar(uid, dataUrl);
          if (uploaded) cloudUrl = uploaded;
        }
      }
    } catch (e) {
      console.warn('Tchilo quick avatar upload', e);
    }

    try {
      session.avatar = cloudUrl;
      if (typeof setSession === 'function') setSession(session);
      else localStorage.setItem('tchilo_session', JSON.stringify(session));
    } catch (e) {}

    try {
      if (typeof getProfileExtra === 'function' && typeof saveProfileExtra === 'function') {
        var extra = getProfileExtra(session.username) || {};
        extra.avatar = cloudUrl;
        saveProfileExtra(session.username, extra);
      }
    } catch (e) {}

    try {
      if (!window.__tchiloAvatarCache) window.__tchiloAvatarCache = {};
      window.__tchiloAvatarCache[session.username] = cloudUrl;
    } catch (e) {}

    try {
      if (window.tchiloSupabase && window.__tchiloCloudUserId) {
        await window.tchiloSupabase.from('profiles').upsert(
          {
            id: window.__tchiloCloudUserId,
            username: session.username,
            avatar_url: cloudUrl,
            display_name: session.displayName || session.username
          },
          { onConflict: 'id' }
        );
      }
    } catch (e) {}

    try {
      window.editAvatarData = cloudUrl;
    } catch (e) {}

    return cloudUrl;
  }

  function updateAvatarImgOnly(url) {
    if (!url) return;
    document.querySelectorAll('.profile-avatar').forEach(function (el) {
      el.style.overflow = 'hidden';
      el.style.position = 'relative';
      var img = el.querySelector('img');
      if (img) {
        if (img.getAttribute('src') !== url) img.src = url;
      } else {
        /* criar img sem apagar o botão + */
        var plus = el.querySelector('.tchilo-av-add');
        img = document.createElement('img');
        img.alt = '';
        img.src = url;
        img.style.cssText =
          'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;position:absolute;inset:0';
        el.insertBefore(img, plus || null);
      }
      ensurePlusOn(el);
    });
  }

  async function onFilePicked(e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type || file.type.indexOf('image/') !== 0) {
      showToastSafe('Escolhe uma imagem');
      return;
    }
    showToastSafe('A guardar foto…');
    try {
      var compressed = await compressImage(file, 720, 0.85);
      var dataUrl = await blobToDataURL(compressed);
      var url = await saveAvatarFromDataUrl(dataUrl);
      updateAvatarImgOnly(url);
      showToastSafe('Foto atualizada');
    } catch (err) {
      console.warn(err);
      showToastSafe((err && err.message) || 'Não foi possível guardar a foto');
    }
  }

  function openPicker(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isOwnProfile()) return;
    ensureInput().click();
  }

  function ensurePlusOn(avatarEl) {
    if (!avatarEl || !isOwnProfile()) return;
    var existing = avatarEl.querySelector('.tchilo-av-add');
    if (existing) return; /* não recriar — evita piscar */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tchilo-av-add';
    btn.setAttribute('aria-label', 'Adicionar foto');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">' +
      '<path d="M12 5v14M5 12h14"/></svg>';
    btn.addEventListener('click', openPicker);
    avatarEl.appendChild(btn);
  }

  function injectPlusButtons() {
    if (!isOwnProfile()) {
      document.querySelectorAll('.tchilo-av-add').forEach(function (b) {
        b.remove();
      });
      plusInjected = false;
      return;
    }
    var avatars = document.querySelectorAll('.profile-avatar');
    if (!avatars.length) return;
    avatars.forEach(ensurePlusOn);
    plusInjected = true;
  }

  function patchRenderProfile() {
    if (typeof window.renderProfile !== 'function') return;
    if (window.renderProfile.__avAddV2) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      /* Um único inject após o HTML novo */
      setTimeout(injectPlusButtons, 40);
      return r;
    };
    window.renderProfile.__avAddV2 = true;
  }

  function boot() {
    injectCSS();
    ensureInput();
    patchRenderProfile();
    injectPlusButtons();
    setTimeout(function () {
      patchRenderProfile();
      injectPlusButtons();
    }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
