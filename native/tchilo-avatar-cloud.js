/**
 * Tchilo — fotos de perfil APENAS na Supabase
 * v4 — bloqueia data:image no localStorage / sessão / profile_extra
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarCloudV4) return;
  window.__tchiloAvatarCloudV4 = true;
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
    return typeof u === 'string' && /^data:image\//i.test(u);
  }

  function isHttpUrl(u) {
    return typeof u === 'string' && /^https?:\/\//i.test(u);
  }

  function cloudOnly(u) {
    return isHttpUrl(u) ? u : null;
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

  async function uploadFile(file) {
    var uid = await currentUid();
    if (!uid || !file) return null;
    return uploadBlob(uid, file, file.type || 'image/jpeg');
  }

  async function uploadDataUrl(dataUrl) {
    var uid = await currentUid();
    if (!uid || !isDataUrl(dataUrl)) return isHttpUrl(dataUrl) ? dataUrl : null;
    var blob = dataUrlToBlob(dataUrl);
    if (!blob) return null;
    return uploadBlob(uid, blob, blob.type);
  }

  async function persistAvatarUrl(publicUrl) {
    var s = SB();
    var sess = sessionUser();
    var uid = await currentUid();
    if (!s || !uid || !isHttpUrl(publicUrl)) return false;
    var payload = { id: uid, avatar_url: publicUrl };
    if (sess && sess.username) payload.username = sess.username;
    if (sess && (sess.displayName || sess.display_name))
      payload.display_name = sess.displayName || sess.display_name;
    try {
      var r = await s.from('profiles').upsert(payload, { onConflict: 'id' });
      if (r.error) {
        var r2 = await s.from('profiles').update({ avatar_url: publicUrl }).eq('id', uid);
        if (r2.error) return false;
      }
    } catch (e) {
      return false;
    }
    try {
      await s.from('posts').update({ avatar_url: publicUrl }).eq('user_id', uid);
    } catch (e2) {}
    return true;
  }

  function applySessionHttp(url) {
    if (!isHttpUrl(url)) return;
    var sess = sessionUser();
    if (!sess) return;
    sess.avatar = url;
    try {
      if (typeof setSession === 'function') setSession(sess);
      else {
        var clean = JSON.parse(JSON.stringify(sess));
        if (isDataUrl(clean.avatar)) clean.avatar = url;
        localStorage.setItem('tchilo_session', JSON.stringify(clean));
      }
    } catch (e) {}
    try {
      if (!window.__tchiloAvatarCache) window.__tchiloAvatarCache = {};
      window.__tchiloAvatarCache[sess.username] = url;
    } catch (e2) {}
    try {
      if (typeof getProfileExtra === 'function' && typeof setProfileExtra === 'function') {
        var ex = getProfileExtra(sess.username) || {};
        ex.avatar = url;
        setProfileExtra(sess.username, ex);
      }
    } catch (e3) {}
    try {
      if (typeof cacheUserProfile === 'function') {
        cacheUserProfile(sess.username, { avatar: url, avatar_url: url });
      }
    } catch (e4) {}
    try {
      if (typeof renderProfile === 'function') renderProfile();
    } catch (e5) {}
  }

  /** Remove data:image de localStorage */
  function purgeLocalImageStorage() {
    try {
      var raw = localStorage.getItem('tchilo_session');
      if (raw && raw.indexOf('data:image') >= 0) {
        var s = JSON.parse(raw);
        if (s && isDataUrl(s.avatar)) {
          s.avatar = null;
          localStorage.setItem('tchilo_session', JSON.stringify(s));
        }
      }
    } catch (e) {}
    try {
      var pr = localStorage.getItem('tchilo_profiles');
      if (pr && pr.indexOf('data:image') >= 0) {
        var all = JSON.parse(pr);
        Object.keys(all || {}).forEach(function (k) {
          if (all[k] && isDataUrl(all[k].avatar)) all[k].avatar = null;
          if (all[k] && Array.isArray(all[k].photos)) {
            all[k].photos = all[k].photos.filter(function (p) {
              var u = typeof p === 'string' ? p : p && p.url;
              return isHttpUrl(u);
            });
          }
        });
        localStorage.setItem('tchilo_profiles', JSON.stringify(all));
      }
    } catch (e2) {}
    try {
      /* editAvatarData global do index — não deixar data URL permanente */
      if (typeof window.editAvatarData === 'string' && isDataUrl(window.editAvatarData)) {
        /* mantém só se upload a decorrer; limpa se já há URL http em sessão */
        var sess = sessionUser();
        if (sess && isHttpUrl(sess.avatar)) {
          try {
            (0, eval)('editAvatarData = null');
          } catch (e3) {
            window.editAvatarData = null;
          }
        }
      }
    } catch (e4) {}
  }

  window.tchiloSaveAvatarToCloud = async function (fileOrDataUrl) {
    if (!SB()) {
      toast('Sem ligação à nuvem — foto não guardada');
      return null;
    }
    toast('A enviar foto para a nuvem…');
    var url = null;
    try {
      if (fileOrDataUrl && fileOrDataUrl.size) url = await uploadFile(fileOrDataUrl);
      else if (typeof fileOrDataUrl === 'string') url = await uploadDataUrl(fileOrDataUrl);
    } catch (e) {
      console.warn(e);
    }
    if (!isHttpUrl(url)) {
      toast('Falha no upload (Supabase)');
      return null;
    }
    await persistAvatarUrl(url);
    applySessionHttp(url);
    /* limpar qualquer data URL pendente no editor */
    try {
      (0, eval)('editAvatarData = ' + JSON.stringify(url));
    } catch (e2) {
      try {
        window.editAvatarData = url;
      } catch (e3) {}
    }
    purgeLocalImageStorage();
    toast('Foto na nuvem');
    return url;
  };

  window.tchiloUploadAvatar = async function (userId, dataUrl) {
    if (isHttpUrl(dataUrl)) return dataUrl;
    if (!isDataUrl(dataUrl)) return null;
    var url = await uploadDataUrl(dataUrl);
    if (isHttpUrl(url)) await persistAvatarUrl(url);
    return url;
  };

  /* onAvatarPicked: NÃO guardar data URL — upload imediato */
  function patchOnAvatarPicked() {
    window.onAvatarPicked = async function (event) {
      var file = event && event.target && event.target.files && event.target.files[0];
      if (!file) return;
      var btn = document.querySelector('#screen-editprofile .gallery-btn');
      try {
        if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, true);
      } catch (e) {}
      /* preview leve com object URL (não vai para localStorage) */
      try {
        var previewUrl = URL.createObjectURL(file);
        try {
          (0, eval)('editAvatarData = ' + JSON.stringify(previewUrl));
        } catch (e2) {
          window.editAvatarData = previewUrl;
        }
        if (typeof refreshEditAvatarPreview === 'function') refreshEditAvatarPreview();
      } catch (e3) {}
      var cloud = await window.tchiloSaveAvatarToCloud(file);
      if (cloud) {
        try {
          (0, eval)('editAvatarData = ' + JSON.stringify(cloud));
        } catch (e4) {
          window.editAvatarData = cloud;
        }
        if (typeof refreshEditAvatarPreview === 'function') refreshEditAvatarPreview();
      }
      try {
        if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, false);
      } catch (e5) {}
    };
  }

  function patchQuickInput() {
    var input = document.getElementById('tchiloQuickAvatarInput');
    if (!input || input.__cloudV4) return;
    input.__cloudV4 = true;
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

  /* setSession: nunca gravar data:image */
  function patchSetSession() {
    if (typeof window.setSession !== 'function' || window.setSession.__avatarV4) return;
    var orig = window.setSession;
    window.setSession = function (sess) {
      if (sess && isDataUrl(sess.avatar)) {
        sess = Object.assign({}, sess, { avatar: null });
      }
      return orig.call(this, sess);
    };
    window.setSession.__avatarV4 = true;
  }

  /* saveProfileExtra: strip data urls */
  function patchSaveProfileExtra() {
    if (typeof window.saveProfileExtra !== 'function' || window.saveProfileExtra.__avatarV4) return;
    var orig = window.saveProfileExtra;
    window.saveProfileExtra = function (username, data) {
      data = data ? Object.assign({}, data) : {};
      if (isDataUrl(data.avatar)) data.avatar = null;
      if (Array.isArray(data.photos)) {
        data.photos = data.photos.filter(function (p) {
          var u = typeof p === 'string' ? p : p && p.url;
          return isHttpUrl(u);
        });
      }
      return orig.call(this, username, data);
    };
    window.saveProfileExtra.__avatarV4 = true;
  }

  function patchSetProfileExtra() {
    if (typeof window.setProfileExtra !== 'function' || window.setProfileExtra.__avatarV4) return;
    var orig = window.setProfileExtra;
    window.setProfileExtra = function (username, data) {
      data = data ? Object.assign({}, data) : {};
      if (isDataUrl(data.avatar)) data.avatar = null;
      return orig.call(this, username, data);
    };
    window.setProfileExtra.__avatarV4 = true;
  }

  async function hydrateFromCloud() {
    var s = SB();
    var uid = await currentUid();
    if (!s || !uid) return;
    try {
      var r = await s.from('profiles').select('avatar_url').eq('id', uid).maybeSingle();
      if (r.data && isHttpUrl(r.data.avatar_url)) applySessionHttp(r.data.avatar_url);
    } catch (e) {}
  }

  function boot() {
    purgeLocalImageStorage();
    patchOnAvatarPicked();
    patchQuickInput();
    patchSetSession();
    patchSaveProfileExtra();
    patchSetProfileExtra();
    hydrateFromCloud();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(hydrateFromCloud, 2000);
  setInterval(function () {
    purgeLocalImageStorage();
    patchQuickInput();
  }, 5000);
})();
