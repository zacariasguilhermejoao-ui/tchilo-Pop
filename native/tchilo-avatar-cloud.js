/**
 * Tchilo — foto de perfil na Supabase (Storage + profiles.avatar_url)
 * v2 — corrige foto que sumia noutros telemóveis
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarCloudV2) return;
  window.__tchiloAvatarCloudV2 = true;

  function SB() {
    return window.tchiloSupabase || window.supabaseClient || null;
  }

  function sessionUser() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
    } catch (e) {}
  }

  async function currentUid() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    var s = SB();
    if (!s) return null;
    try {
      var auth = await s.auth.getSession();
      var uid =
        auth &&
        auth.data &&
        auth.data.session &&
        auth.data.session.user &&
        auth.data.session.user.id;
      if (uid) window.__tchiloCloudUserId = uid;
      return uid || null;
    } catch (e) {
      return null;
    }
  }

  function dataUrlToBlob(dataUrl) {
    try {
      var parts = String(dataUrl).split(',');
      var meta = parts[0] || '';
      var b64 = parts[1] || '';
      var mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
      var bin = atob(b64);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch (e) {
      return null;
    }
  }

  /** Upload para Storage + URL pública */
  async function uploadAvatarBlob(userId, blob, mime) {
    var s = SB();
    if (!s || !userId || !blob) return null;
    mime = mime || blob.type || 'image/jpeg';
    var ext = mime.indexOf('png') >= 0 ? 'png' : mime.indexOf('webp') >= 0 ? 'webp' : 'jpg';
    var path = userId + '/avatar.' + ext;

    var buckets = ['avatars', 'posts-media', 'media'];
    var lastErr = null;
    for (var b = 0; b < buckets.length; b++) {
      try {
        var up = await s.storage.from(buckets[b]).upload(path, blob, {
          contentType: mime,
          upsert: true,
          cacheControl: '3600'
        });
        if (up.error) {
          lastErr = up.error;
          continue;
        }
        var pub = s.storage.from(buckets[b]).getPublicUrl(path);
        var url =
          pub && pub.data && pub.data.publicUrl
            ? pub.data.publicUrl + '?v=' + Date.now()
            : null;
        if (url) return url;
      } catch (e) {
        lastErr = e;
      }
    }
    if (lastErr) console.warn('[Tchilo avatar] storage', lastErr);
    return null;
  }

  async function uploadFromDataUrl(dataUrl) {
    if (!dataUrl || String(dataUrl).indexOf('data:image') !== 0) return dataUrl;
    var uid = await currentUid();
    if (!uid) {
      console.warn('[Tchilo avatar] sem uid');
      return null;
    }
    var blob = dataUrlToBlob(dataUrl);
    if (!blob) return null;
    return uploadAvatarBlob(uid, blob, blob.type);
  }

  async function uploadFromFile(file) {
    if (!file) return null;
    var uid = await currentUid();
    if (!uid) return null;
    return uploadAvatarBlob(uid, file, file.type || 'image/jpeg');
  }

  /** Grava avatar_url na tabela profiles */
  async function persistProfileAvatar(publicUrl) {
    var s = SB();
    var sess = sessionUser();
    var uid = await currentUid();
    if (!s || !uid || !publicUrl) return false;

    var payload = {
      id: uid,
      avatar_url: publicUrl
    };
    if (sess && sess.username) payload.username = sess.username;
    if (sess && (sess.displayName || sess.display_name))
      payload.display_name = sess.displayName || sess.display_name;

    try {
      var r = await s.from('profiles').upsert(payload, { onConflict: 'id' });
      if (r.error) {
        var r2 = await s.from('profiles').update({ avatar_url: publicUrl }).eq('id', uid);
        if (r2.error) {
          console.warn('[Tchilo avatar] profiles', r2.error);
          return false;
        }
      }
    } catch (e) {
      console.warn('[Tchilo avatar] profiles', e);
      return false;
    }

    /* Atualiza posts do user para o feed mostrar o mesmo avatar */
    try {
      await s.from('posts').update({ avatar_url: publicUrl }).eq('user_id', uid);
    } catch (e2) {}

    return true;
  }

  function applyLocal(publicUrl) {
    var sess = sessionUser();
    if (!sess || !publicUrl) return;
    try {
      sess.avatar = publicUrl;
      if (typeof setSession === 'function') setSession(sess);
      else localStorage.setItem('tchilo_session', JSON.stringify(sess));
    } catch (e) {}
    try {
      if (typeof setProfileExtra === 'function') {
        var ex = typeof getProfileExtra === 'function' ? getProfileExtra(sess.username) || {} : {};
        ex.avatar = publicUrl;
        setProfileExtra(sess.username, ex);
      } else if (typeof saveProfileExtra === 'function') {
        saveProfileExtra(sess.username, { avatar: publicUrl });
      }
    } catch (e2) {}
    try {
      if (window.__tchiloAvatarCache) window.__tchiloAvatarCache[sess.username] = publicUrl;
    } catch (e3) {}
    try {
      if (typeof cacheUserProfile === 'function') {
        cacheUserProfile(sess.username, { avatar: publicUrl, avatar_url: publicUrl });
      }
    } catch (e4) {}
    try {
      if (typeof renderProfile === 'function') renderProfile();
    } catch (e5) {}
  }

  /** API pública: ficheiro ou dataURL → cloud + local */
  window.tchiloSaveAvatarToCloud = async function (fileOrDataUrl) {
    try {
      toast('A guardar foto…');
      var url = null;
      if (typeof fileOrDataUrl === 'string') {
        url = await uploadFromDataUrl(fileOrDataUrl);
      } else if (fileOrDataUrl && fileOrDataUrl.size) {
        url = await uploadFromFile(fileOrDataUrl);
      }
      if (!url) {
        toast('Não foi possível guardar a foto na nuvem');
        return null;
      }
      var ok = await persistProfileAvatar(url);
      applyLocal(url);
      toast(ok ? 'Foto de perfil guardada' : 'Foto enviada (perfil pode demorar a sincronizar)');
      return url;
    } catch (e) {
      console.warn('[Tchilo avatar]', e);
      toast('Erro ao guardar foto');
      return null;
    }
  };

  /* Interceptar picker rápido do botão + */
  function patchQuickInput() {
    var input = document.getElementById('tchiloQuickAvatarInput');
    if (!input || input.__cloudBound) return;
    input.__cloudBound = true;
    input.addEventListener(
      'change',
      function (ev) {
        var file = ev.target.files && ev.target.files[0];
        if (!file) return;
        ev.stopImmediatePropagation();
        window.tchiloSaveAvatarToCloud(file).then(function () {
          try {
            input.value = '';
          } catch (e) {}
        });
      },
      true
    );
  }

  /* Interceptar onAvatarPicked do edit profile — só marca local; no saveProfile já faz upload.
     Mas se o utilizador só usa o +, garantimos cloud. */
  function patchOnAvatarPicked() {
    if (typeof window.onAvatarPicked !== 'function') return;
    if (window.onAvatarPicked.__cloudV2) return;
    var orig = window.onAvatarPicked;
    window.onAvatarPicked = function (event) {
      var file = event && event.target && event.target.files && event.target.files[0];
      var r = orig.apply(this, arguments);
      /* Também envia logo para a cloud (não espera só pelo Guardar) */
      if (file) {
        window.tchiloSaveAvatarToCloud(file);
      }
      return r;
    };
    window.onAvatarPicked.__cloudV2 = true;
  }

  /* Substituir tchiloUploadAvatar se falhar ou não existir de forma robusta */
  window.tchiloUploadAvatar = async function (userId, dataUrl) {
    if (!dataUrl) return null;
    if (String(dataUrl).indexOf('http') === 0) return dataUrl;
    var blob = dataUrlToBlob(dataUrl);
    if (!blob) return null;
    var uid = userId || (await currentUid());
    return uploadAvatarBlob(uid, blob, blob.type);
  };

  /* Ao hidratar: se sessão tiver data: URL e cloud tiver avatar_url, preferir cloud */
  async function preferCloudAvatar() {
    var s = SB();
    var sess = sessionUser();
    var uid = await currentUid();
    if (!s || !uid) return;
    try {
      var r = await s.from('profiles').select('avatar_url,username,display_name').eq('id', uid).maybeSingle();
      if (r.data && r.data.avatar_url) {
        applyLocal(r.data.avatar_url);
      }
    } catch (e) {}
  }

  function boot() {
    patchQuickInput();
    patchOnAvatarPicked();
    preferCloudAvatar();
  }

  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
  setTimeout(preferCloudAvatar, 2500);
  setInterval(patchQuickInput, 3000);
})();
