/**
 * Tchilo — fotos de perfil só na Supabase (Storage + profiles)
 * v3 — nunca guardar data:image no telemóvel como fonte de verdade
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarCloudV3) return;
  window.__tchiloAvatarCloudV3 = true;
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
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function isDataUrl(u) {
    return typeof u === 'string' && u.indexOf('data:image') === 0;
  }

  function isHttpUrl(u) {
    return typeof u === 'string' && /^https?:\/\//i.test(u);
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

  async function uploadBlob(userId, blob, mime, pathSuffix) {
    var s = SB();
    if (!s || !userId || !blob) return null;
    mime = mime || blob.type || 'image/jpeg';
    var ext = mime.indexOf('png') >= 0 ? 'png' : mime.indexOf('webp') >= 0 ? 'webp' : 'jpg';
    var path = pathSuffix || userId + '/avatar.' + ext;

    var buckets = ['posts-media', 'avatars', 'media'];
    var lastErr = null;
    for (var i = 0; i < buckets.length; i++) {
      try {
        var up = await s.storage.from(buckets[i]).upload(path, blob, {
          contentType: mime,
          upsert: true,
          cacheControl: '3600'
        });
        if (up.error) {
          lastErr = up.error;
          continue;
        }
        var pub = s.storage.from(buckets[i]).getPublicUrl(path);
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

  async function uploadFromDataUrl(dataUrl, pathSuffix) {
    if (!isDataUrl(dataUrl)) return isHttpUrl(dataUrl) ? dataUrl : null;
    var uid = await currentUid();
    if (!uid) return null;
    var blob = dataUrlToBlob(dataUrl);
    if (!blob) return null;
    return uploadBlob(uid, blob, blob.type, pathSuffix);
  }

  async function uploadFromFile(file, pathSuffix) {
    if (!file) return null;
    var uid = await currentUid();
    if (!uid) return null;
    return uploadBlob(uid, file, file.type || 'image/jpeg', pathSuffix);
  }

  async function persistProfileAvatar(publicUrl, gallery) {
    var s = SB();
    var sess = sessionUser();
    var uid = await currentUid();
    if (!s || !uid || !publicUrl) return false;

    var payload = {
      id: uid,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString()
    };
    if (sess && sess.username) payload.username = sess.username;
    if (sess && (sess.displayName || sess.display_name))
      payload.display_name = sess.displayName || sess.display_name;
    if (gallery && gallery.length) {
      payload.avatar_gallery = gallery;
      payload.photos = gallery;
    }

    try {
      var r = await s.from('profiles').upsert(payload, { onConflict: 'id' });
      if (r.error) {
        /* tenta só avatar_url se colunas extra não existirem */
        var r2 = await s
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', uid);
        if (r2.error) {
          console.warn('[Tchilo avatar] profiles', r2.error);
          return false;
        }
      }
    } catch (e) {
      console.warn('[Tchilo avatar] profiles', e);
      return false;
    }

    try {
      await s.from('posts').update({ avatar_url: publicUrl }).eq('user_id', uid);
    } catch (e2) {}

    return true;
  }

  function applyLocalHttpOnly(publicUrl) {
    if (!isHttpUrl(publicUrl)) return;
    var sess = sessionUser();
    if (!sess) return;

    try {
      sess.avatar = publicUrl;
      delete sess.avatarData;
      if (typeof setSession === 'function') setSession(sess);
      else localStorage.setItem('tchilo_session', JSON.stringify(sess));
    } catch (e) {}

    try {
      if (typeof getProfileExtra === 'function' && typeof setProfileExtra === 'function') {
        var ex = getProfileExtra(sess.username) || {};
        ex.avatar = publicUrl;
        /* remover data URLs antigas */
        if (isDataUrl(ex.avatar)) ex.avatar = publicUrl;
        if (Array.isArray(ex.photos)) {
          ex.photos = ex.photos
            .map(function (ph) {
              if (typeof ph === 'string') return isHttpUrl(ph) ? ph : null;
              if (ph && isHttpUrl(ph.url)) return ph;
              return null;
            })
            .filter(Boolean);
        }
        setProfileExtra(sess.username, ex);
      } else if (typeof saveProfileExtra === 'function') {
        saveProfileExtra(sess.username, { avatar: publicUrl });
      }
    } catch (e2) {}

    try {
      if (!window.__tchiloAvatarCache) window.__tchiloAvatarCache = {};
      window.__tchiloAvatarCache[sess.username] = publicUrl;
    } catch (e3) {}

    try {
      if (typeof cacheUserProfile === 'function') {
        cacheUserProfile(sess.username, { avatar: publicUrl, avatar_url: publicUrl });
      }
    } catch (e4) {}

    try {
      if (typeof renderProfile === 'function') renderProfile();
    } catch (e5) {}

    try {
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e6) {}
  }

  /** Limpa data URLs da sessão (ocupam espaço e não sincronizam) */
  function scrubLocalDataUrls() {
    try {
      var sess = sessionUser();
      if (sess && isDataUrl(sess.avatar)) {
        sess.avatar = null;
        if (typeof setSession === 'function') setSession(sess);
        else localStorage.setItem('tchilo_session', JSON.stringify(sess));
      }
    } catch (e) {}
    try {
      var all = JSON.parse(localStorage.getItem('tchilo_profiles') || '{}');
      var changed = false;
      Object.keys(all).forEach(function (u) {
        if (all[u] && isDataUrl(all[u].avatar)) {
          all[u].avatar = null;
          changed = true;
        }
      });
      if (changed) localStorage.setItem('tchilo_profiles', JSON.stringify(all));
    } catch (e2) {}
  }

  window.tchiloSaveAvatarToCloud = async function (fileOrDataUrl) {
    try {
      if (!SB()) {
        toast('Sem ligação à nuvem');
        return null;
      }
      toast('A guardar foto na nuvem…');
      var url = null;
      if (typeof fileOrDataUrl === 'string') {
        url = await uploadFromDataUrl(fileOrDataUrl);
      } else if (fileOrDataUrl && fileOrDataUrl.size) {
        url = await uploadFromFile(fileOrDataUrl);
      }
      if (!url || !isHttpUrl(url)) {
        toast('Não foi possível guardar na Supabase');
        return null;
      }
      var ok = await persistProfileAvatar(url);
      applyLocalHttpOnly(url);
      scrubLocalDataUrls();
      toast(ok ? 'Foto guardada na nuvem' : 'Foto enviada (a sincronizar perfil…)');
      return url;
    } catch (e) {
      console.warn('[Tchilo avatar]', e);
      toast('Erro ao guardar foto na nuvem');
      return null;
    }
  };

  /** Adicionar foto extra à galeria do perfil (também na Supabase Storage) */
  window.tchiloAddProfilePhotoToCloud = async function (fileOrDataUrl, caption) {
    var uid = await currentUid();
    if (!uid) {
      toast('Inicia sessão');
      return null;
    }
    var path =
      uid +
      '/gallery/' +
      Date.now().toString(36) +
      '_' +
      Math.floor(Math.random() * 1e5) +
      '.jpg';
    var url = null;
    if (typeof fileOrDataUrl === 'string') url = await uploadFromDataUrl(fileOrDataUrl, path);
    else url = await uploadFromFile(fileOrDataUrl, path);
    if (!url) {
      toast('Falha no upload');
      return null;
    }

    var sess = sessionUser();
    var photos = [];
    try {
      if (typeof getProfileExtra === 'function') {
        var ex = getProfileExtra(sess.username) || {};
        photos = Array.isArray(ex.photos) ? ex.photos.slice() : [];
      }
    } catch (e) {}
    photos.unshift({ url: url, caption: caption || '' });
    photos = photos.filter(function (p) {
      return p && isHttpUrl(typeof p === 'string' ? p : p.url);
    }).slice(0, 12);

    try {
      if (typeof setProfileExtra === 'function') {
        var ex2 = (typeof getProfileExtra === 'function' && getProfileExtra(sess.username)) || {};
        ex2.photos = photos;
        if (!ex2.avatar) ex2.avatar = url;
        setProfileExtra(sess.username, ex2);
      }
    } catch (e2) {}

    await persistProfileAvatar(url, photos);
    applyLocalHttpOnly(url);
    toast('Foto adicionada');
    return url;
  };

  function patchQuickInput() {
    var input = document.getElementById('tchiloQuickAvatarInput');
    if (!input || input.__cloudBoundV3) return;
    input.__cloudBoundV3 = true;
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

  function patchOnAvatarPicked() {
    if (typeof window.onAvatarPicked !== 'function') return;
    if (window.onAvatarPicked.__cloudV3) return;
    var orig = window.onAvatarPicked;
    window.onAvatarPicked = function (event) {
      var file = event && event.target && event.target.files && event.target.files[0];
      var r = orig.apply(this, arguments);
      if (file) window.tchiloSaveAvatarToCloud(file);
      return r;
    };
    window.onAvatarPicked.__cloudV3 = true;
  }

  window.tchiloUploadAvatar = async function (userId, dataUrl) {
    if (!dataUrl) return null;
    if (isHttpUrl(dataUrl)) return dataUrl;
    var uid = userId || (await currentUid());
    if (isDataUrl(dataUrl)) return uploadFromDataUrl(dataUrl);
    return null;
  };

  async function hydrateFromCloud() {
    var s = SB();
    var uid = await currentUid();
    if (!s || !uid) return;
    try {
      var r = await s
        .from('profiles')
        .select('avatar_url,username,display_name,avatar_gallery,photos')
        .eq('id', uid)
        .maybeSingle();
      if (r.data && r.data.avatar_url && isHttpUrl(r.data.avatar_url)) {
        applyLocalHttpOnly(r.data.avatar_url);
        var gallery = r.data.avatar_gallery || r.data.photos;
        if (gallery && Array.isArray(gallery)) {
          try {
            var sess = sessionUser();
            if (sess && typeof setProfileExtra === 'function') {
              var ex = (typeof getProfileExtra === 'function' && getProfileExtra(sess.username)) || {};
              ex.photos = gallery;
              ex.avatar = r.data.avatar_url;
              setProfileExtra(sess.username, ex);
            }
          } catch (e2) {}
        }
      }
    } catch (e) {
      /* select com colunas extra pode falhar — tenta só avatar_url */
      try {
        var r2 = await s.from('profiles').select('avatar_url').eq('id', uid).maybeSingle();
        if (r2.data && r2.data.avatar_url) applyLocalHttpOnly(r2.data.avatar_url);
      } catch (e3) {}
    }
  }

  function boot() {
    scrubLocalDataUrls();
    patchQuickInput();
    patchOnAvatarPicked();
    hydrateFromCloud();
  }

  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
  setTimeout(hydrateFromCloud, 2500);
  setInterval(patchQuickInput, 4000);
})();
