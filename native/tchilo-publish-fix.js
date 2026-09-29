/**
 * Tchilo — corrigir publicação de foto/vídeo + limpar media presa + música no post
 *
 * BUG: native/tchilo-video-pick grava em window.createMediaData,
 * mas publishPostCore lê a variável lexical `createMediaData` (let) — são coisas diferentes.
 * Resultado: escolhes vídeo, o preview mostra, mas publica só o tema/stamp.
 */
(function () {
  'use strict';
  if (window.__tchiloPublishFixV2) return;
  window.__tchiloPublishFixV2 = true;

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
    var mime = String(item.mime || item.fileType || '').toLowerCase();
    if (mime.indexOf('video/') === 0) return true;
    var url = String(item.url || item.src || '');
    if (/\.(mp4|mov|webm|m4v|3gp|mkv)(\?|$)/i.test(url)) return true;
    if (item.file && item.file.type && String(item.file.type).indexOf('video/') === 0) return true;
    return false;
  }

  function getMediaData() {
    /* unificar todas as fontes */
    var d =
      (typeof createMediaData !== 'undefined' && createMediaData) ||
      window.createMediaData ||
      null;
    if (d && d.items && d.items.length) return d;
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
    return d;
  }

  function setMediaData(data) {
    window.createMediaData = data;
    try {
      /* tenta sincronizar a variável lexical do index, se existir no scope global */
      if (typeof createMediaData !== 'undefined') {
        /* assignment to lexical via Function may fail; use globalThis trick */
      }
    } catch (e) {}
    try {
      /* força no scope global do browser (scripts clássicos) */
      (0, eval)('createMediaData = window.createMediaData');
    } catch (e2) {
      try {
        window['createMediaData'] = data;
      } catch (e3) {}
    }
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
    window._pendingMusic = null;
    window._pendingMusicMeta = null;
    updateMusicBtn();
  }

  /* ---------- Música no create (só fotos) ---------- */
  function ensureMusicBtn() {
    var screen = document.getElementById('screen-create');
    if (!screen) return null;
    var btn = document.getElementById('tchiloCreateMusicBtn');
    if (btn) return btn;

    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tchiloCreateMusicBtn';
    btn.className = 'gallery-btn';
    btn.textContent = 'Adicionar música';
    btn.style.cssText =
      'margin-top:10px;width:100%;display:none;font-weight:800;border:2px solid currentColor;';

    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openMusicPicker();
    };

    var body = screen.querySelector('.create-body') || screen;
    var pub =
      screen.querySelector('.publish-btn') ||
      screen.querySelector('button[onclick*="publishPost"]');
    if (pub && pub.parentNode) pub.parentNode.insertBefore(btn, pub);
    else body.appendChild(btn);

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
    /* só fotos — vídeos sem música */
    if (hasImage && !hasVideo) {
      btn.style.display = 'block';
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
    /* reutilizar sheet do app se existir */
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
    try {
      if (typeof window.showMusicSheet === 'function') {
        window.showMusicSheet();
        return;
      }
    } catch (e3) {}

    /* fallback mínimo com Deezer search se o sheet nativo não existir */
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
            ((t.artist && t.artist.name) ? ' · ' + t.artist.name : '');
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
      var url =
        'https://api.deezer.com/chart/0/tracks?limit=25' +
        (term
          ? ''
          : '');
      if (term) {
        url =
          'https://api.deezer.com/search/track?q=' +
          encodeURIComponent(term) +
          '&limit=25';
      }
      var proxy =
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
      fetch(proxy)
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          var tracks = (data && data.data) || [];
          renderTracks(tracks);
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

  /* ---------- Patch clearCreateMedia ---------- */
  function patchClear() {
    if (typeof window.clearCreateMedia === 'function' && !window.clearCreateMedia.__pubFix) {
      var orig = window.clearCreateMedia;
      window.clearCreateMedia = function () {
        hardClearMedia();
        try {
          return orig.apply(this, arguments);
        } catch (e) {}
      };
      window.clearCreateMedia.__pubFix = true;
    }
    if (typeof window.removeMedia === 'function' && !window.removeMedia.__pubFix) {
      window.removeMedia = function () {
        hardClearMedia();
        toast('Media removida');
      };
      window.removeMedia.__pubFix = true;
    }
  }

  /* ---------- Patch publishPostCore ---------- */
  function patchPublish() {
    if (typeof window.publishPostCore !== 'function') return false;
    if (window.publishPostCore.__pubFixV2) return true;

    var orig = window.publishPostCore;
    window.publishPostCore = async function () {
      /* sincronizar media ANTES de publicar */
      var data = getMediaData();
      if (data && data.items && data.items.length) {
        setMediaData(data);
        /* garantir file nos items */
        data.items.forEach(function (it) {
          if (!it.file && window.__tchiloPendingMedia && window.__tchiloPendingMedia.file) {
            if (it.url === window.__tchiloPendingMedia.url) {
              it.file = window.__tchiloPendingMedia.file;
            }
          }
        });
      }

      try {
        var result = await orig.apply(this, arguments);
        /* limpar depois de sucesso */
        hardClearMedia();
        try {
          if (typeof goTo === 'function') goTo('feed');
        } catch (e) {}
        return result;
      } catch (err) {
        console.error('[Tchilo] publish failed', err);
        toast('Erro: ' + ((err && err.message) || 'não publicou'));
        throw err;
      }
    };
    window.publishPostCore.__pubFixV2 = true;
    return true;
  }

  /* ---------- Patch publishPost outer ---------- */
  function patchPublishOuter() {
    if (typeof window.publishPost !== 'function') return;
    if (window.publishPost.__pubFixV2) return;
    var orig = window.publishPost;
    window.publishPost = async function () {
      var data = getMediaData();
      if (data && data.items && data.items.length) {
        setMediaData(data);
      }
      return orig.apply(this, arguments);
    };
    window.publishPost.__pubFixV2 = true;
  }

  /* ---------- Quando escolhe ficheiro, atualizar botão música ---------- */
  function watchMediaInput() {
    var input = document.getElementById('mediaInput');
    if (!input || input.__pubFixWatch) return;
    input.__pubFixWatch = true;
    input.addEventListener(
      'change',
      function () {
        setTimeout(updateMusicBtn, 100);
        setTimeout(updateMusicBtn, 500);
        setTimeout(updateMusicBtn, 1200);
      },
      true
    );
  }

  /* ao sair do create, se publicou ok media já limpa; se cancelar e voltar, limpar stuck blobs opcional */
  function patchGoTo() {
    if (typeof window.goTo !== 'function') return;
    if (window.goTo.__pubFixClear) return;
    var orig = window.goTo._orig || window.goTo;
    var wrapped = function (name) {
      var r = orig.apply(this, arguments);
      if (name === 'create') {
        setTimeout(function () {
          updateMusicBtn();
          ensureMusicBtn();
        }, 100);
      }
      return r;
    };
    wrapped.__pubFixClear = true;
    wrapped._orig = orig;
    /* preserve other patches */
    Object.keys(orig).forEach(function (k) {
      try {
        wrapped[k] = orig[k];
      } catch (e) {}
    });
    window.goTo = wrapped;
  }

  function boot() {
    patchClear();
    patchPublish();
    patchPublishOuter();
    watchMediaInput();
    ensureMusicBtn();
    updateMusicBtn();
    patchGoTo();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
  setInterval(function () {
    patchPublish();
    patchClear();
    updateMusicBtn();
  }, 4000);

  /* API pública */
  window.tchiloHardClearCreateMedia = hardClearMedia;
  window.tchiloGetCreateMediaData = getMediaData;
})();
