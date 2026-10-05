/**
 * Tchilo — força Stories e Avatar no Supabase (não só localStorage)
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloCloudPersistV1) return;
  window.__tchiloCloudPersistV1 = true;

  function SB() {
    return window.tchiloSupabase || null;
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
      var a = await s.auth.getSession();
      var id =
        a && a.data && a.data.session && a.data.session.user && a.data.session.user.id;
      if (id) window.__tchiloCloudUserId = id;
      return id || null;
    } catch (e) {
      return null;
    }
  }

  async function uploadBlob(path, blob, contentType) {
    var s = SB();
    if (!s) throw new Error('Supabase offline');
    var up = await s.storage.from('posts-media').upload(path, blob, {
      contentType: contentType || blob.type || 'application/octet-stream',
      upsert: true,
      cacheControl: '3600'
    });
    if (up.error) throw up.error;
    var pub = s.storage.from('posts-media').getPublicUrl(path);
    var url = pub && pub.data && pub.data.publicUrl;
    if (!url) throw new Error('URL pública em falta');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now();
  }

  async function mediaToCloud(userId, media, mediaType) {
    if (!media) return { url: null, type: mediaType || null };
    var str = String(media);
    if (str.indexOf('http://') === 0 || str.indexOf('https://') === 0) {
      return { url: str, type: mediaType || null };
    }
    var blob;
    if (str.indexOf('data:') === 0 || str.indexOf('blob:') === 0) {
      blob = await fetch(str).then(function (r) {
        return r.blob();
      });
    } else {
      return { url: str, type: mediaType || null };
    }
    var isVideo =
      (mediaType === 'video') ||
      (blob.type && blob.type.indexOf('video') === 0);
    var ext = isVideo ? 'mp4' : blob.type && blob.type.indexOf('png') >= 0 ? 'png' : 'jpg';
    var path = userId + '/stories/' + Date.now() + '.' + ext;
    var url = await uploadBlob(path, blob, blob.type);
    return { url: url, type: isVideo ? 'video' : 'image' };
  }

  async function insertStoryRow(userId, text, mediaUrl, mediaType, color, createdAt) {
    var s = SB();
    var created = createdAt
      ? new Date(createdAt).toISOString()
      : new Date().toISOString();
    var candidates = [
      {
        user_id: userId,
        text: text || '',
        media_url: mediaUrl,
        media_type: mediaType,
        color: color || null,
        created_at: created
      },
      {
        user_id: userId,
        content: text || '',
        media_url: mediaUrl,
        media_type: mediaType,
        created_at: created
      },
      {
        user_id: userId,
        caption: text || '',
        media_url: mediaUrl,
        media_type: mediaType,
        created_at: created
      }
    ];
    var last = null;
    for (var i = 0; i < candidates.length; i++) {
      var r = await s.from('stories').insert(candidates[i]);
      if (!r.error) return true;
      last = r.error;
    }
    throw last || new Error('Insert stories falhou');
  }

  /** Public API used by publishStory */
  window.tchiloPersistStory = async function (item) {
    var s = SB();
    var id = await uid();
    if (!s || !id) throw new Error('Sem sessão Supabase');
    var up = await mediaToCloud(id, item.media, item.mediaType);
    await insertStoryRow(
      id,
      item.text || '',
      up.url,
      up.type || item.mediaType,
      item.color || null,
      item.createdAt
    );
    return { media: up.url, mediaType: up.type || item.mediaType };
  };

  window.tchiloPersistAvatar = async function (dataUrl) {
    var s = SB();
    var id = await uid();
    if (!s || !id) throw new Error('Sem sessão Supabase');
    if (!dataUrl) return null;
    if (String(dataUrl).indexOf('http') === 0) {
      await s.from('profiles').upsert(
        { id: id, avatar_url: dataUrl },
        { onConflict: 'id' }
      );
      return dataUrl;
    }
    var blob = await fetch(dataUrl).then(function (r) {
      return r.blob();
    });
    var mime = blob.type || 'image/jpeg';
    var ext =
      mime.indexOf('png') >= 0 ? 'png' : mime.indexOf('webp') >= 0 ? 'webp' : 'jpg';
    var path = id + '/avatar.' + ext;
    var url = await uploadBlob(path, blob, mime);
    var r = await s.from('profiles').upsert(
      { id: id, avatar_url: url },
      { onConflict: 'id' }
    );
    if (r.error) {
      r = await s.from('profiles').update({ avatar_url: url }).eq('id', id);
      if (r.error) throw r.error;
    }
    return url;
  };

  /** Patch publishStory — cloud first, then local mirror */
  function patchPublishStory() {
    if (typeof window.publishStory !== 'function') return;
    if (window.publishStory.__persistV1) return;
    var orig = window.publishStory;
    window.publishStory = async function (data) {
      var session = typeof getSession === 'function' ? getSession() : null;
      if (!session) {
        toast('Inicia sessão');
        return;
      }
      var item = {
        text: (data && data.text) || '',
        media: (data && data.media) || null,
        mediaType: (data && data.mediaType) || null,
        color: data && data.media ? null : (data && data.color) || 'm1',
        music: (data && (data.music || data.musicMeta)) || null,
        musicMeta: (data && (data.musicMeta || data.music)) || null,
        createdAt: Date.now()
      };
      try {
        toast('A guardar story na nuvem…');
        var res = await window.tchiloPersistStory(item);
        if (res && res.media) {
          item.media = res.media;
          item.mediaType = res.mediaType || item.mediaType;
        }
        item._synced = true;
        // mirror local for UI
        try {
          if (typeof getStoriesStore === 'function' && typeof saveStoriesStore === 'function') {
            var all = getStoriesStore();
            var arr = Array.isArray(all[session.username])
              ? all[session.username]
              : all[session.username]
                ? [all[session.username]]
                : [];
            arr.push(item);
            arr = arr.filter(function (x) {
              return Date.now() - (x.createdAt || 0) <= 24 * 60 * 60 * 1000;
            });
            all[session.username] = arr;
            saveStoriesStore(all);
          }
        } catch (e2) {}
        if (typeof renderStories === 'function') renderStories();
        toast('Story publicado (24h) · guardado na nuvem');
        return;
      } catch (err) {
        console.error('[persist story]', err);
        toast(
          'Story NÃO gravado na nuvem: ' +
            ((err && err.message) || 'erro') +
            ' — tenta outra vez'
        );
        // still try original path as fallback
        try {
          return await orig.apply(this, arguments);
        } catch (e3) {
          return;
        }
      }
    };
    window.publishStory.__persistV1 = true;
  }

  /** Patch saveProfile avatar path */
  function patchSaveProfile() {
    if (typeof window.saveProfile !== 'function') return;
    if (window.saveProfile.__persistV1) return;
    var orig = window.saveProfile;
    window.saveProfile = async function () {
      try {
        if (
          typeof editAvatarData !== 'undefined' &&
          editAvatarData &&
          /^data:image\//i.test(String(editAvatarData))
        ) {
          toast('A enviar foto para a nuvem…');
          var url = await window.tchiloPersistAvatar(editAvatarData);
          if (url) {
            editAvatarData = url;
            try {
              var sess = getSession();
              if (sess) {
                sess.avatar = url;
                setSession(sess);
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('[persist avatar]', err);
        toast(
          'Foto NÃO gravada na nuvem: ' +
            ((err && err.message) || 'erro') +
            ' — verifica a ligação'
        );
      }
      return await orig.apply(this, arguments);
    };
    window.saveProfile.__persistV1 = true;
  }

  /** Also patch onAvatarPicked to upload immediately */
  function patchOnAvatarPicked() {
    if (typeof window.onAvatarPicked !== 'function') return;
    if (window.onAvatarPicked.__persistV1) return;
    var orig = window.onAvatarPicked;
    window.onAvatarPicked = function (event) {
      orig.apply(this, arguments);
      setTimeout(async function () {
        try {
          if (
            typeof editAvatarData !== 'undefined' &&
            editAvatarData &&
            /^data:image\//i.test(String(editAvatarData))
          ) {
            var url = await window.tchiloPersistAvatar(editAvatarData);
            if (url) {
              editAvatarData = url;
              if (typeof refreshEditAvatarPreview === 'function') {
                refreshEditAvatarPreview();
              }
              toast('Foto guardada na nuvem');
            }
          }
        } catch (err) {
          console.warn('[avatar immediate]', err);
          toast('Foto ainda local — guarda o perfil para tentar na nuvem');
        }
      }, 400);
    };
    window.onAvatarPicked.__persistV1 = true;
  }

  /** Pull stories + avatar from Supabase after cache clear */
  async function hydrateFromCloud() {
    var s = SB();
    var id = await uid();
    if (!s || !id) return;

    // Avatar
    try {
      var pr = await s.from('profiles').select('avatar_url,display_name,username').eq('id', id).maybeSingle();
      var row = pr && pr.data;
      if (row && row.avatar_url) {
        var sess = typeof getSession === 'function' ? getSession() : null;
        if (sess) {
          sess.avatar = row.avatar_url;
          if (row.display_name) sess.displayName = row.display_name;
          setSession(sess);
        }
        try {
          if (typeof saveProfileExtra === 'function' && sess) {
            var extra = getProfileExtra(sess.username) || {};
            extra.avatar = row.avatar_url;
            if (row.display_name) extra.displayName = row.display_name;
            saveProfileExtra(sess.username, extra);
          }
        } catch (e) {}
        try {
          if (typeof cacheUserProfile === 'function' && sess) {
            cacheUserProfile(sess.username, {
              avatar: row.avatar_url,
              displayName: row.display_name || sess.username
            });
          }
        } catch (e2) {}
      }
    } catch (e) {
      console.warn('[hydrate avatar]', e);
    }

    // Stories
    try {
      if (
        window.tchiloCloud &&
        typeof window.tchiloCloud.loadCloudStories === 'function'
      ) {
        await window.tchiloCloud.loadCloudStories();
      } else {
        var since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        var res = await s
          .from('stories')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(300);
        var rows = (res && res.data) || [];
        if (rows.length && typeof getStoriesStore === 'function') {
          var store = getStoriesStore();
          var ids = [];
          rows.forEach(function (r) {
            if (r.user_id) ids.push(r.user_id);
          });
          var profileMap = {};
          if (ids.length) {
            var uniq = ids.filter(function (v, i, a) {
              return a.indexOf(v) === i;
            });
            var profs = await s.from('profiles').select('id,username').in('id', uniq);
            (profs.data || []).forEach(function (p) {
              profileMap[p.id] = p.username;
            });
          }
          rows.forEach(function (r) {
            var uname = profileMap[r.user_id] || r.username;
            if (!uname) return;
            var item = {
              text: r.text || r.content || r.caption || '',
              media: r.media_url || r.media || null,
              mediaType: r.media_type || null,
              color: r.color || null,
              createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
              _synced: true
            };
            if (!Array.isArray(store[uname])) store[uname] = [];
            var exists = store[uname].some(function (x) {
              return Number(x.createdAt) === Number(item.createdAt);
            });
            if (!exists) store[uname].push(item);
          });
          saveStoriesStore(store);
        }
      }
      if (typeof renderStories === 'function') renderStories();
      if (typeof renderProfile === 'function') renderProfile();
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e) {
      console.warn('[hydrate stories]', e);
    }
  }

  function boot() {
    patchPublishStory();
    patchSaveProfile();
    patchOnAvatarPicked();
    hydrateFromCloud();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 200);
      setTimeout(boot, 1200);
      setTimeout(hydrateFromCloud, 2500);
    });
  } else {
    setTimeout(boot, 200);
    setTimeout(boot, 1200);
    setTimeout(hydrateFromCloud, 2500);
  }

  // After auth
  try {
    var s = SB();
    if (s && s.auth && s.auth.onAuthStateChange) {
      s.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          setTimeout(boot, 300);
          setTimeout(hydrateFromCloud, 1000);
        }
      });
    }
  } catch (e) {}

  window.tchiloHydrateCloud = hydrateFromCloud;
})();
