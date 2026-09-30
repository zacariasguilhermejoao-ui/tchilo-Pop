/**
 * Tchilo — publicar foto/vídeo + música (só fotos)
 * v4: media via window; cloud com fallback local; música não some
 */
(function () {
  'use strict';
  if (window.__tchiloPublishFixV4) return;
  window.__tchiloPublishFixV4 = true;
  window.__tchiloPublishFixV3 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {
      console.log('[Tchilo]', msg);
    }
  }

  function isVideoItem(item) {
    if (!item) return false;
    if (item.type === 'video') return true;
    var mime = String(item.mime || '').toLowerCase();
    if (mime.indexOf('video/') === 0) return true;
    var url = String(item.url || '');
    if (/\.(mp4|mov|webm|m4v|3gp|mkv)(\?|$)/i.test(url)) return true;
    if (item.file && item.file.type && String(item.file.type).indexOf('video/') === 0) return true;
    return false;
  }

  function getMediaData() {
    if (window.createMediaData && window.createMediaData.items && window.createMediaData.items.length) {
      return window.createMediaData;
    }
    if (window.__tchiloPendingMedia) {
      var p = window.__tchiloPendingMedia;
      return { type: p.type || 'image', items: [p] };
    }
    if (window.createMediaFiles && window.createMediaFiles[0]) {
      var f = window.createMediaFiles[0];
      var vid =
        (f.type && String(f.type).indexOf('video/') === 0) ||
        /\.(mp4|mov|webm|m4v)$/i.test(f.name || '');
      var url = f.__tchiloObjectUrl || URL.createObjectURL(f);
      f.__tchiloObjectUrl = url;
      return {
        type: vid ? 'video' : 'image',
        items: [
          {
            type: vid ? 'video' : 'image',
            url: url,
            file: f,
            name: f.name,
            mime: f.type
          }
        ]
      };
    }
    /* última hipótese: preview no DOM */
    try {
      var preview = document.getElementById('createPreview');
      if (preview) {
        var vidEl = preview.querySelector('video');
        var imgEl = preview.querySelector('img');
        if (vidEl && vidEl.src) {
          return {
            type: 'video',
            items: [{ type: 'video', url: vidEl.src, mime: 'video/mp4' }]
          };
        }
        if (imgEl && imgEl.src && imgEl.src.indexOf('data:') !== 0) {
          return {
            type: 'image',
            items: [{ type: 'image', url: imgEl.src, mime: 'image/jpeg' }]
          };
        }
      }
    } catch (e) {}
    return null;
  }

  function syncLexical(data) {
    window.createMediaData = data;
    try {
      (0, eval)('createMediaData = window.createMediaData');
    } catch (e) {}
  }

  function hardClearMedia() {
    try {
      var d = getMediaData();
      if (d && d.items) {
        d.items.forEach(function (m) {
          try {
            if (m && m.url && String(m.url).indexOf('blob:') === 0) URL.revokeObjectURL(m.url);
          } catch (e) {}
        });
      }
    } catch (e) {}
    window.createMediaData = null;
    window.__tchiloPendingMedia = null;
    window.createMediaFiles = null;
    try {
      (0, eval)('createMediaData = null');
    } catch (e2) {}
    var input = document.getElementById('mediaInput');
    if (input) {
      try {
        input.value = '';
      } catch (e3) {}
    }
    var preview = document.getElementById('createPreview');
    if (preview) {
      preview.querySelectorAll('img,video,.multi-preview,.tchilo-pick-layer').forEach(function (n) {
        try {
          n.remove();
        } catch (e4) {}
      });
      preview.classList.remove('has-media');
    }
    var rm = document.getElementById('removeMediaBtn');
    if (rm) rm.style.display = 'none';
    try {
      if (typeof hideVideoCoverBox === 'function') hideVideoCoverBox();
    } catch (e5) {}
    try {
      if (typeof setThemeSectionVisible === 'function') setThemeSectionVisible(true);
    } catch (e6) {}
    try {
      if (typeof updateStamp === 'function') updateStamp();
    } catch (e7) {}
    window._pendingMusic = null;
    window._pendingMusicMeta = null;
    updateMusicBtn();
  }

  function ensureMusicBtn() {
    var screen = document.getElementById('screen-create');
    if (!screen) return null;
    var btn = document.getElementById('tchiloCreateMusicBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloCreateMusicBtn';
      btn.className = 'tchilo-music-btn';
      btn.textContent = 'Adicionar música';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openMusicPicker();
      };
      var pub =
        screen.querySelector('.publish-btn') ||
        screen.querySelector('button[onclick*="publishPost"]');
      if (pub && pub.parentNode) pub.parentNode.insertBefore(btn, pub);
      else (screen.querySelector('.create-body') || screen).appendChild(btn);
    }
    btn.className = 'tchilo-music-btn';
    btn.style.cssText =
      'margin-top:10px;width:100%;font-weight:800;border:2px solid currentColor;' +
      'padding:12px;border-radius:14px;background:transparent;cursor:pointer;' +
      'visibility:visible;opacity:1;pointer-events:auto;display:none';
    return btn;
  }

  function updateMusicBtn() {
    var btn = ensureMusicBtn();
    if (!btn) return;
    var d = getMediaData();
    var hasItems = d && d.items && d.items.length;
    var hasVideo = hasItems && d.items.some(isVideoItem);
    var hasImage = hasItems && d.items.some(function (m) {
      return !isVideoItem(m);
    });
    if (hasImage && !hasVideo) {
      btn.style.display = 'block';
      btn.style.visibility = 'visible';
      btn.style.opacity = '1';
      if (window._pendingMusicMeta) {
        btn.textContent =
          'Música: ' +
          (window._pendingMusicMeta.title || '') +
          (window._pendingMusicMeta.artist ? ' · ' + window._pendingMusicMeta.artist : '');
      } else if (window._pendingMusic) {
        btn.textContent = 'Música: ' + window._pendingMusic;
      } else {
        btn.textContent = 'Adicionar música';
      }
    } else {
      btn.style.display = 'none';
      if (hasVideo) {
        window._pendingMusic = null;
        window._pendingMusicMeta = null;
      }
    }
  }

  function openMusicPicker() {
    try {
      if (typeof window.openMusicUseSheet === 'function') {
        window.openMusicUseSheet({ mode: 'post' });
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.tchiloOpenMusicSheet === 'function') {
        window.tchiloOpenMusicSheet('post');
        return;
      }
    } catch (e2) {}

    var overlay = document.getElementById('tchiloMusicFallback');
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'tchiloMusicFallback';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center';
    overlay.innerHTML =
      '<div style="width:100%;max-width:480px;background:#fff;color:#0B0B0C;border-radius:20px 20px 0 0;padding:16px;border:3px solid #0B0B0C;max-height:80vh;overflow:auto">' +
      '<div style="font-weight:900;font-size:17px;margin-bottom:10px;text-align:center">Adicionar música</div>' +
      '<input id="tchiloMusicQ" type="search" placeholder="Pesquisar música" style="width:100%;padding:12px;border:2px solid #0B0B0C;border-radius:12px;font-size:15px;box-sizing:border-box"/>' +
      '<div id="tchiloMusicList" style="margin-top:12px"></div>' +
      '<button type="button" id="tchiloMusicClose" style="width:100%;margin-top:10px;padding:12px;border-radius:12px;border:2px solid #0B0B0C;font-weight:800;background:#fff">Fechar</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.onclick = function (e) {
      if (e.target === overlay) overlay.remove();
    };
    document.getElementById('tchiloMusicClose').onclick = function () {
      overlay.remove();
    };
    var list = document.getElementById('tchiloMusicList');
    var q = document.getElementById('tchiloMusicQ');

    function renderTracks(tracks) {
      list.innerHTML = '';
      (tracks || []).forEach(function (t) {
        var row = document.createElement('button');
        row.type = 'button';
        row.style.cssText =
          'display:block;width:100%;text-align:left;padding:12px;margin:0 0 8px;border:2px solid #0B0B0C;border-radius:12px;background:#fff;font-weight:700;cursor:pointer';
        row.textContent =
          (t.title || 'Faixa') +
          (t.artist && t.artist.name ? ' · ' + t.artist.name : '');
        row.onclick = function () {
          window._pendingMusicMeta = {
            title: t.title || '',
            artist: (t.artist && t.artist.name) || '',
            preview: t.preview || '',
            id: t.id || null
          };
          window._pendingMusic =
            (t.title || '') +
            (t.artist && t.artist.name ? ' · ' + t.artist.name : '');
          updateMusicBtn();
          toast('Música selecionada');
          overlay.remove();
        };
        list.appendChild(row);
      });
      if (!(tracks || []).length) {
        list.innerHTML =
          '<div style="padding:12px;opacity:.7;text-align:center">Sem resultados</div>';
      }
    }

    function search(term) {
      list.innerHTML =
        '<div style="padding:12px;text-align:center;opacity:.7">A carregar…</div>';
      var url = term
        ? 'https://api.deezer.com/search/track?q=' + encodeURIComponent(term) + '&limit=25'
        : 'https://api.deezer.com/chart/0/tracks?limit=25';
      var proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
      fetch(proxy)
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          renderTracks((data && data.data) || []);
        })
        .catch(function () {
          list.innerHTML =
            '<div style="padding:12px;text-align:center;color:#c00">Não foi possível carregar músicas</div>';
        });
    }
    var timer = null;
    q.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        search((q.value || '').trim());
      }, 400);
    });
    search('');
  }

  function uuid() {
    try {
      if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    } catch (e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function finishLocal(post, items) {
    if (items && items.length) {
      if (items.length === 1) {
        post.media = items[0].url;
        post.mediaType = isVideoItem(items[0]) ? 'video' : 'image';
      } else {
        post.mediaItems = items.map(function (m) {
          return { url: m.url, type: isVideoItem(m) ? 'video' : 'image' };
        });
        post.mediaType = 'image';
      }
      try {
        if (!window.__tchiloMedia) window.__tchiloMedia = {};
        window.__tchiloMedia[post.id] =
          items.length === 1 ? items[0] : { items: items };
      } catch (e) {}
    }
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      posts.unshift(post);
      if (typeof save === 'function' && typeof KEYS !== 'undefined') {
        try {
          save(KEYS.posts, posts);
        } catch (e) {
          try {
            save(KEYS.posts, posts.slice(0, 20));
          } catch (e2) {}
        }
      }
    } catch (e3) {
      console.warn(e3);
    }
  }

  async function publishFixed() {
    var session = typeof getSession === 'function' ? getSession() : null;
    if (!session || !session.username) {
      toast('Inicia sessão para publicar');
      return;
    }

    var titleEl = document.getElementById('createTitle');
    var capEl = document.getElementById('createCaption');
    var title = (titleEl && titleEl.value ? titleEl.value.trim() : '') || 'NOVO POST';
    var caption = (capEl && capEl.value ? capEl.value.trim() : '') || '';
    var stamp = title
      .toUpperCase()
      .split(/\s+/)
      .slice(0, 3)
      .join('\n');
    var tags = caption.match(/#[\wÀ-ÿ]+/g) || [];
    var postId = uuid();
    var data = getMediaData();
    if (data) syncLexical(data);
    var items = (data && data.items) || [];

    /* garantir File em cada item */
    items = items.map(function (it) {
      if (it && !it.file && window.createMediaFiles && window.createMediaFiles[0]) {
        it.file = window.createMediaFiles[0];
      }
      return it;
    });

    if (items.some(isVideoItem) && items.length !== 1) {
      toast('Vídeo só pode ser publicado sozinho');
      return;
    }

    if (!items.length) {
      toast('Escolhe uma foto ou vídeo primeiro');
      return;
    }

    var color =
      typeof currentColor !== 'undefined' && currentColor
        ? currentColor
        : window.currentColor || 'm1';

    var post = {
      id: postId,
      username: session.username,
      initials: String(session.username).slice(0, 2).toUpperCase(),
      avatar:
        session.avatar ||
        (typeof getProfileExtra === 'function'
          ? (getProfileExtra(session.username) || {}).avatar
          : null) ||
        null,
      location: null,
      time: 'agora',
      color: color,
      stamp: stamp,
      caption: caption.replace(/#[\wÀ-ÿ]+/g, '').trim(),
      tags: tags,
      likes: 0,
      comments: 0,
      media: null,
      mediaType: null,
      mediaItems: null,
      music: window._pendingMusic || null,
      musicMeta: window._pendingMusicMeta || null
    };

    var cloudOk = false;
    if (window.tchiloCloud && typeof window.tchiloCloud.publishPost === 'function') {
      try {
        toast('A enviar…');
        var cloudResult = await window.tchiloCloud.publishPost(post, items);
        if (cloudResult && cloudResult.ok) {
          cloudOk = true;
          if (cloudResult.mediaItems && cloudResult.mediaItems.length) {
            post.mediaItems = cloudResult.mediaItems;
            if (cloudResult.mediaItems.length === 1) {
              post.media = cloudResult.mediaItems[0].url;
              post.mediaType =
                cloudResult.mediaItems[0].type ||
                (isVideoItem(items[0]) ? 'video' : 'image');
            } else {
              post.mediaType = 'image';
            }
          }
        } else {
          throw new Error(
            (cloudResult && cloudResult.error) || 'Falha ao guardar na nuvem'
          );
        }
      } catch (cloudErr) {
        console.error('[Tchilo] cloud publish', cloudErr);
        var msg = (cloudErr && cloudErr.message) || 'erro na nuvem';
        /* se sessão supabase em falta — tenta local mesmo assim */
        if (/sessão supabase|não encontrada|não está ligado/i.test(msg)) {
          toast('Sem sessão cloud — a guardar neste aparelho');
          finishLocal(post, items);
        } else {
          toast('Erro: ' + msg);
          return;
        }
      }
    } else {
      finishLocal(post, items);
    }

    if (cloudOk) {
      /* também guarda local para feed imediato */
      try {
        var posts2 = typeof getPosts === 'function' ? getPosts() : [];
        posts2.unshift(post);
        if (typeof save === 'function' && typeof KEYS !== 'undefined') {
          try {
            save(KEYS.posts, posts2);
          } catch (e) {}
        }
      } catch (e) {}
    }

    if (!post.media && !(post.mediaItems && post.mediaItems.length)) {
      /* ainda sem media — finishLocal de emergência */
      finishLocal(post, items);
    }

    if (!post.media && !(post.mediaItems && post.mediaItems.length)) {
      toast('Não foi possível enviar a media. Tenta de novo.');
      return;
    }

    window._pendingMusic = null;
    window._pendingMusicMeta = null;
    hardClearMedia();

    try {
      if (titleEl) titleEl.value = '';
      if (capEl) capEl.value = '';
    } catch (e4) {}

    toast('Publicado');
    try {
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e5) {}
    try {
      if (typeof goTo === 'function') goTo('feed');
    } catch (e6) {}
  }

  function patchPublish() {
    window.publishPostCore = publishFixed;
    window.publishPostCore.__pubFixV4 = true;

    window.publishPost = async function () {
      var btn =
        document.querySelector('.publish-btn[onclick="publishPost()"]') ||
        document.querySelector('#screen-create .publish-btn') ||
        document.querySelector('.publish-btn');
      try {
        if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, true);
      } catch (e) {}
      try {
        var data = getMediaData();
        if (data) syncLexical(data);
        if (!data || !data.items || !data.items.length) {
          toast('Escolhe uma foto ou vídeo primeiro');
          return;
        }
        toast('A enviar…');
        await publishFixed();
      } catch (err) {
        console.error(err);
        toast('Erro: ' + ((err && err.message) || 'não publicou'));
      } finally {
        try {
          if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, false);
        } catch (e2) {}
        try {
          if (typeof tchiloHideBusy === 'function') tchiloHideBusy();
        } catch (e3) {}
      }
    };
    window.publishPost.__pubFixV4 = true;
  }

  function patchClear() {
    window.clearCreateMedia = function () {
      hardClearMedia();
    };
    window.clearCreateMedia.__pubFixV4 = true;
    window.removeMedia = function () {
      hardClearMedia();
      toast('Media removida');
    };
    window.removeMedia.__pubFixV4 = true;
  }

  function watchMediaInput() {
    var input = document.getElementById('mediaInput');
    if (input && !input.__pubFixWatchV4) {
      input.__pubFixWatchV4 = true;
      input.addEventListener(
        'change',
        function () {
          setTimeout(updateMusicBtn, 80);
          setTimeout(updateMusicBtn, 400);
          setTimeout(updateMusicBtn, 1000);
        },
        true
      );
    }
    if (!window.__tchiloMusicMediaListener) {
      window.__tchiloMusicMediaListener = true;
      window.addEventListener('tchilo-media-ready', function () {
        setTimeout(updateMusicBtn, 50);
        setTimeout(updateMusicBtn, 300);
      });
    }
  }

  function boot() {
    patchClear();
    patchPublish();
    watchMediaInput();
    ensureMusicBtn();
    updateMusicBtn();
  }

  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setInterval(function () {
    patchPublish();
    patchClear();
    updateMusicBtn();
  }, 2500);

  window.tchiloHardClearCreateMedia = hardClearMedia;
  window.tchiloGetCreateMediaData = getMediaData;
})();
