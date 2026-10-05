/**
 * Tchilo — foto de perfil sempre no Supabase Storage + profiles.avatar_url
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarCloudV1) return;
  window.__tchiloAvatarCloudV1 = true;

  function SB() {
    return window.tchiloSupabase || window.supabaseClient || null;
  }

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  async function uid() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    var s = SB();
    if (!s) return null;
    try {
      var auth = await s.auth.getSession();
      var id =
        auth &&
        auth.data &&
        auth.data.session &&
        auth.data.session.user &&
        auth.data.session.user.id;
      if (id) window.__tchiloCloudUserId = id;
      return id || null;
    } catch (e) {
      return null;
    }
  }

  async function uploadDataUrl(userId, dataUrl) {
    if (!dataUrl || !userId) return null;
    var s = SB();
    if (!s) return null;
    if (typeof window.tchiloUploadAvatar === 'function') {
      try {
        return await window.tchiloUploadAvatar(userId, dataUrl);
      } catch (e) {
        console.warn('tchiloUploadAvatar', e);
      }
    }
    try {
      var blob = await fetch(dataUrl).then(function (r) {
        return r.blob();
      });
      var mime = blob.type || 'image/jpeg';
      var ext = mime.indexOf('png') >= 0 ? 'png' : mime.indexOf('webp') >= 0 ? 'webp' : 'jpg';
      var path = userId + '/avatar.' + ext;
      var up = await s.storage.from('posts-media').upload(path, blob, {
        contentType: mime,
        upsert: true,
        cacheControl: '3600'
      });
      if (up.error) throw up.error;
      var pub = s.storage.from('posts-media').getPublicUrl(path);
      var url = pub && pub.data && pub.data.publicUrl;
      return url ? url + '?v=' + Date.now() : null;
    } catch (err) {
      console.warn('avatar upload', err);
      toast('Não foi possível guardar a foto na nuvem');
      return null;
    }
  }

  async function writeProfileAvatar(url) {
    if (!url) return false;
    var s = SB();
    var id = await uid();
    if (!s || !id) return false;
    try {
      var payload = { id: id, avatar_url: url };
      var r = await s.from('profiles').upsert(payload, { onConflict: 'id' });
      if (r.error) {
        r = await s.from('profiles').update({ avatar_url: url }).eq('id', id);
      }
      if (r.error) {
        console.warn('avatar profile write', r.error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('avatar profile write', e);
      return false;
    }
  }

  async function persistLocal(url) {
    try {
      if (typeof getSession === 'function' && typeof setSession === 'function') {
        var sess = getSession();
        if (sess) {
          sess.avatar = url;
          setSession(sess);
        }
      }
    } catch (e) {}
    try {
      if (typeof getSession === 'function' && typeof saveProfileExtra === 'function') {
        var s2 = getSession();
        if (s2 && s2.username) {
          var extra =
            typeof getProfileExtra === 'function' ? getProfileExtra(s2.username) || {} : {};
          extra.avatar = url;
          saveProfileExtra(s2.username, extra);
        }
      }
    } catch (e2) {}
  }

  /** Public: upload data URL and save to profiles */
  window.tchiloSaveAvatarToCloud = async function (dataUrl) {
    var id = await uid();
    if (!id) {
      toast('Inicia sessão para guardar a foto');
      return null;
    }
    var url = await uploadDataUrl(id, dataUrl);
    if (!url) return null;
    await writeProfileAvatar(url);
    await persistLocal(url);
    return url;
  };

  function patchSaveProfile() {
    if (typeof window.saveProfile !== 'function' || window.saveProfile.__avatarCloud) return;
    var orig = window.saveProfile;
    window.saveProfile = async function () {
      try {
        if (window.editAvatarData && /^data:image\//i.test(window.editAvatarData)) {
          var url = await window.tchiloSaveAvatarToCloud(window.editAvatarData);
          if (url) {
            window.editAvatarData = url;
          }
        }
      } catch (e) {
        console.warn('pre-save avatar', e);
      }
      return orig.apply(this, arguments);
    };
    window.saveProfile.__avatarCloud = true;
  }

  function patchOnAvatarPicked() {
    if (typeof window.onAvatarPicked !== 'function' || window.onAvatarPicked.__avatarCloud) return;
    var orig = window.onAvatarPicked;
    window.onAvatarPicked = function (event) {
      var r = orig.apply(this, arguments);
      // After local preview, try cloud upload in background
      setTimeout(async function () {
        try {
          if (window.editAvatarData && /^data:image\//i.test(window.editAvatarData)) {
            var url = await window.tchiloSaveAvatarToCloud(window.editAvatarData);
            if (url) {
              window.editAvatarData = url;
              if (typeof refreshEditAvatarPreview === 'function') refreshEditAvatarPreview();
              toast('Foto guardada');
            }
          }
        } catch (e) {}
      }, 300);
      return r;
    };
    window.onAvatarPicked.__avatarCloud = true;
  }

  async function hydrateFromCloud() {
    var s = SB();
    var id = await uid();
    if (!s || !id) return;
    try {
      var r = await s.from('profiles').select('avatar_url').eq('id', id).maybeSingle();
      var url = r && r.data && r.data.avatar_url;
      if (url && String(url).indexOf('http') === 0) {
        await persistLocal(url);
        try {
          if (typeof renderProfile === 'function') renderProfile();
        } catch (e) {}
      }
    } catch (e2) {}
  }

  function boot() {
    patchSaveProfile();
    patchOnAvatarPicked();
    hydrateFromCloud();
  }

  boot();
  [500, 2000].forEach(function (ms) {
    setTimeout(boot, ms);
  });
})();
