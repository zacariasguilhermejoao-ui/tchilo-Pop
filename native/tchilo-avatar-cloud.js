/**
 * Tchilo — foto de perfil sempre na Supabase (storage + profiles.avatar_url)
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarCloudV1) return;
  window.__tchiloAvatarCloudV1 = true;

  function getSB() {
    return window.tchiloSupabase || window.SB || null;
  }

  function getSessionSafe() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  function showToastSafe(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
    } catch (e) {}
  }

  function setLocalAvatar(username, url) {
    if (!username || !url) return;
    try {
      if (!window.__tchiloAvatarCache) window.__tchiloAvatarCache = {};
      window.__tchiloAvatarCache[username] = url;
    } catch (e) {}
    try {
      var session = getSessionSafe();
      if (session && session.username === username) {
        session.avatar = url;
        if (typeof setSession === 'function') setSession(session);
        else localStorage.setItem('tchilo_session', JSON.stringify(session));
      }
    } catch (e) {}
    try {
      if (typeof getProfileExtra === 'function' && typeof saveProfileExtra === 'function') {
        var extra = getProfileExtra(username) || {};
        extra.avatar = url;
        saveProfileExtra(username, extra);
      }
    } catch (e) {}
  }

  function paintAll(url) {
    if (!url) return;
    document.querySelectorAll('.profile-avatar, .post-avatar, .user-avatar, [class*="avatar"]').forEach(function (el) {
      try {
        var img = el.querySelector('img');
        if (img) {
          img.src = url;
          img.style.display = 'block';
        } else if (el.classList.contains('profile-avatar')) {
          var plus = el.querySelector('.tchilo-av-add');
          img = document.createElement('img');
          img.alt = '';
          img.src = url;
          img.style.cssText =
            'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;position:absolute;inset:0;';
          el.style.position = 'relative';
          el.insertBefore(img, plus || null);
        }
      } catch (e) {}
    });
  }

  function compressFile(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var max = 720;
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var scale = Math.min(1, max / Math.max(w, h));
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
            0.85
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

  async function resolveUserId(SB, session) {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    if (session && session.id && String(session.id).length > 20) {
      window.__tchiloCloudUserId = session.id;
      return session.id;
    }
    try {
      var auth = await SB.auth.getSession();
      var uid =
        auth &&
        auth.data &&
        auth.data.session &&
        auth.data.session.user &&
        auth.data.session.user.id;
      if (uid) {
        window.__tchiloCloudUserId = uid;
        return uid;
      }
    } catch (e) {}
    return null;
  }

  /**
   * Upload real para Storage + update profiles.avatar_url
   * Nunca grava data: URL na cloud.
   */
  window.tchiloUploadAvatarCloud = async function (fileOrBlob) {
    var SB = getSB();
    if (!SB) throw new Error('Supabase não ligada');
    var session = getSessionSafe();
    if (!session || !session.username) throw new Error('Sem sessão');

    var uid = await resolveUserId(SB, session);
    if (!uid) throw new Error('Sem ID de utilizador (inicia sessão de novo)');

    var blob = fileOrBlob;
    if (fileOrBlob && fileOrBlob.type && fileOrBlob.type.indexOf('image/') === 0) {
      blob = await compressFile(fileOrBlob);
    }

    var path = uid + '/avatar.jpg';
    var up = await SB.storage.from('posts-media').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '3600'
    });
    if (up.error) {
      /* tentar pasta avatars/ */
      path = 'avatars/' + uid + '/avatar.jpg';
      up = await SB.storage.from('posts-media').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '3600'
      });
      if (up.error) throw new Error(up.error.message || 'Falha no storage');
    }

    var pub = SB.storage.from('posts-media').getPublicUrl(path);
    var publicUrl = pub && pub.data && pub.data.publicUrl;
    if (!publicUrl) throw new Error('URL pública inválida');
    publicUrl = publicUrl.split('?')[0] + '?v=' + Date.now();

    var upProfile = await SB.from('profiles').upsert(
      {
        id: uid,
        username: session.username,
        avatar_url: publicUrl,
        display_name: session.displayName || session.username,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );
    if (upProfile.error) {
      console.warn('profiles upsert', upProfile.error);
      /* tenta update */
      await SB.from('profiles').update({ avatar_url: publicUrl }).eq('id', uid);
    }

    setLocalAvatar(session.username, publicUrl);
    paintAll(publicUrl);

    try {
      if (typeof renderProfile === 'function') renderProfile();
    } catch (e) {}
    try {
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e) {}

    return publicUrl;
  };

  /* Substitui tchiloUploadAvatar se existir, para o fluxo de editar perfil também usar cloud */
  window.tchiloUploadAvatar = async function (userId, dataUrl) {
    if (!dataUrl) return null;
    var SB = getSB();
    if (!SB) return null;
    var blob = await fetch(dataUrl).then(function (r) {
      return r.blob();
    });
    var path = userId + '/avatar.jpg';
    var up = await SB.storage.from('posts-media').upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
      cacheControl: '3600'
    });
    if (up.error) {
      path = 'avatars/' + userId + '/avatar.jpg';
      up = await SB.storage.from('posts-media').upload(path, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
        cacheControl: '3600'
      });
      if (up.error) throw new Error(up.error.message || 'Storage falhou');
    }
    var pub = SB.storage.from('posts-media').getPublicUrl(path);
    var url = pub && pub.data && pub.data.publicUrl;
    if (url) {
      url = url.split('?')[0] + '?v=' + Date.now();
      try {
        await SB.from('profiles').upsert(
          {
            id: userId,
            avatar_url: url,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );
      } catch (e) {}
      var session = getSessionSafe();
      if (session && session.username) setLocalAvatar(session.username, url);
    }
    return url || null;
  };

  function ensureInput() {
    var input = document.getElementById('tchiloQuickAvatarInput');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'tchiloQuickAvatarInput';
      input.accept = 'image/*';
      input.style.cssText = 'position:fixed;left:-9999px;opacity:0;width:1px;height:1px;';
      document.body.appendChild(input);
    }
    if (!input.__tchiloCloudBound) {
      input.__tchiloCloudBound = true;
      input.addEventListener('change', async function (e) {
        var file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type || file.type.indexOf('image/') !== 0) {
          showToastSafe('Escolhe uma imagem');
          return;
        }
        showToastSafe('A enviar foto para a cloud…');
        try {
          var url = await window.tchiloUploadAvatarCloud(file);
          showToastSafe('Foto guardada na cloud');
          paintAll(url);
        } catch (err) {
          console.warn('avatar cloud', err);
          showToastSafe((err && err.message) || 'Falha ao enviar foto');
        }
      });
    }
    return input;
  }

  /* Boot: garantir input com handler cloud */
  ensureInput();
  setTimeout(ensureInput, 500);
  setTimeout(ensureInput, 1500);

  window.tchiloEnsureAvatarInput = ensureInput;
})();
