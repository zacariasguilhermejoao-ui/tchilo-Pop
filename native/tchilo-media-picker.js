/**
 * Tchilo Media Picker — Instagram-style + native PhotoKit/MediaStore
 */
(function () {
  'use strict';
  if (window.__TCHILO_MEDIA_PICKER_V2) return;
  window.__TCHILO_MEDIA_PICKER_V2 = true;
  window.__TCHILO_MEDIA_PICKER_V1 = true;

  var MODE = 'post';
  var TAB = 'fotos';
  var selected = [];
  var items = [];
  var albums = [];
  var thumbCache = Object.create(null);
  var page = 0;
  var PAGE_SIZE = 60;
  var loading = false;
  var limitedAccess = false;
  var permDenied = false;
  var hasMore = true;

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
    } catch (e) {}
  }

  function nativeGallery() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TchiloMediaGallery) {
        return window.Capacitor.Plugins.TchiloMediaGallery;
      }
    } catch (e) {}
    return null;
  }

  function getCamera() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Camera) {
        return window.Capacitor.Plugins.Camera;
      }
    } catch (e) {}
    return null;
  }

  function injectCSS() {
    if ($('tchilo-mp-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-mp-css';
    st.textContent = [
      '#tchiloMediaPicker{position:fixed;inset:0;z-index:10050;display:none;flex-direction:column;background:#000;color:#fff;',
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
      '#tchiloMediaPicker.open{display:flex!important;}',
      '#tchiloMediaPicker *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}',
      '#tchiloMediaPicker .mp-top{display:flex;align-items:center;justify-content:space-between;',
      'padding:12px 14px;padding-top:max(12px,env(safe-area-inset-top));flex-shrink:0;}',
      '#tchiloMediaPicker .mp-top button{background:none;border:0;color:#fff;font:600 16px system-ui,-apple-system,sans-serif;cursor:pointer;padding:8px;}',
      '#tchiloMediaPicker .mp-top .mp-title{font:700 17px system-ui,-apple-system,sans-serif;}',
      '#tchiloMediaPicker .mp-top .mp-next{color:#3897f0;font-weight:700;}',
      '#tchiloMediaPicker .mp-top .mp-next:disabled{opacity:.35;}',
      '#tchiloMediaPicker .mp-tabs{display:flex;gap:8px;padding:0 14px 10px;flex-shrink:0;}',
      '#tchiloMediaPicker .mp-tab{padding:8px 14px;border-radius:10px;border:0;background:rgba(255,255,255,.12);color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer;}',
      '#tchiloMediaPicker .mp-tab.on{background:rgba(255,255,255,.22);}',
      '#tchiloMediaPicker .mp-tools{display:flex;gap:10px;padding:0 14px 12px;overflow-x:auto;flex-shrink:0;scrollbar-width:none;}',
      '#tchiloMediaPicker .mp-tools::-webkit-scrollbar{display:none;}',
      '#tchiloMediaPicker .mp-tool{min-width:88px;padding:14px 12px;border-radius:14px;background:rgba(255,255,255,.1);border:0;color:#fff;text-align:center;cursor:pointer;font:600 12px system-ui,sans-serif;}',
      '#tchiloMediaPicker .mp-tool svg{display:block;margin:0 auto 6px;stroke:#34c759;}',
      '#tchiloMediaPicker .mp-grid-wrap{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
      '#tchiloMediaPicker .mp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#111;}',
      '#tchiloMediaPicker .mp-cell{position:relative;aspect-ratio:1;background:#1a1a1a;overflow:hidden;cursor:pointer;border:0;padding:0;}',
      '#tchiloMediaPicker .mp-cell img{width:100%;height:100%;object-fit:cover;display:block;background:#222;}',
      '#tchiloMediaPicker .mp-cell.cam{background:#0d0d0d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#fff;}',
      '#tchiloMediaPicker .mp-cell.cam svg{width:36px;height:36px;stroke:#fff;fill:none;}',
      '#tchiloMediaPicker .mp-cell.cam span{font:600 12px system-ui,sans-serif;}',
      '#tchiloMediaPicker .mp-cell .mp-dur{position:absolute;right:4px;bottom:4px;font:600 11px system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.8);}',
      '#tchiloMediaPicker .mp-cell .mp-check{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;border:1.5px solid #fff;background:rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;font:700 11px system-ui,sans-serif;color:#fff;}',
      '#tchiloMediaPicker .mp-cell.on .mp-check{background:#3897f0;border-color:#3897f0;}',
      '#tchiloMediaPicker .mp-cell.on::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 3px #3897f0;pointer-events:none;}',
      '#tchiloMediaPicker .mp-bottom{flex-shrink:0;padding:10px 14px;padding-bottom:max(12px,env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:space-between;background:#0a0a0a;}',
      '#tchiloMediaPicker .mp-recent{background:none;border:0;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;}',
      '#tchiloMediaPicker .mp-select{padding:10px 18px;border-radius:999px;border:0;background:rgba(255,255,255,.14);color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer;}',
      '#tchiloMediaPicker .mp-modes{position:absolute;left:50%;bottom:max(72px,calc(56px + env(safe-area-inset-bottom)));transform:translateX(-50%);display:flex;padding:4px;border-radius:999px;background:rgba(40,40,40,.92);backdrop-filter:blur(12px);}',
      '#tchiloMediaPicker .mp-mode{border:0;background:transparent;color:rgba(255,255,255,.45);font:700 12px system-ui,sans-serif;letter-spacing:.06em;padding:10px 16px;border-radius:999px;cursor:pointer;}',
      '#tchiloMediaPicker .mp-mode.on{background:rgba(255,255,255,.16);color:#fff;}',
      '#tchiloMediaPicker .mp-empty{padding:40px 24px;text-align:center;color:rgba(255,255,255,.55);font:500 14px system-ui,sans-serif;line-height:1.5;}',
      '#tchiloMediaPicker .mp-empty button{margin-top:14px;padding:12px 20px;border-radius:12px;border:0;background:#3897f0;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer;}',
      '#tchiloMediaPicker .mp-album{display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer;background:transparent;border-left:0;border-right:0;border-top:0;width:100%;color:#fff;text-align:left;}',
      '#tchiloMediaPicker .mp-album img{width:56px;height:56px;object-fit:cover;border-radius:6px;background:#222;}',
      '#tchiloMediaPicker .mp-album b{display:block;font:600 15px system-ui,sans-serif;}',
      '#tchiloMediaPicker .mp-album span{font:500 12px system-ui,sans-serif;opacity:.55;}',
      '#tchiloMediaPicker .mp-hidden-input{position:fixed;left:-9999px;width:1px;height:1px;opacity:0;}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureDOM() {
    injectCSS();
    if ($('tchiloMediaPicker')) return;
    var root = document.createElement('div');
    root.id = 'tchiloMediaPicker';
    root.innerHTML =
      '<div class="mp-top">' +
      '<button type="button" class="mp-cancel" data-a="cancel">Cancelar</button>' +
      '<div class="mp-title">Novo post</div>' +
      '<button type="button" class="mp-next" data-a="next" disabled>Avançar</button></div>' +
      '<div class="mp-tabs">' +
      '<button type="button" class="mp-tab on" data-tab="fotos">Fotos</button>' +
      '<button type="button" class="mp-tab" data-tab="albuns">Álbuns</button></div>' +
      '<div class="mp-tools">' +
      '<button type="button" class="mp-tool" data-tool="text"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V5h16v2M12 5v14M9 19h6"/></svg>Texto</button>' +
      '<button type="button" class="mp-tool" data-tool="music"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>Música</button>' +
      '<button type="button" class="mp-tool" data-tool="layout"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>Layout</button></div>' +
      '<div class="mp-grid-wrap" id="mpGridWrap"><div class="mp-grid" id="mpGrid"></div></div>' +
      '<div class="mp-modes">' +
      '<button type="button" class="mp-mode on" data-mode="post">POST</button>' +
      '<button type="button" class="mp-mode" data-mode="story">STORY</button>' +
      '<button type="button" class="mp-mode" data-mode="instant">INSTANT</button></div>' +
      '<div class="mp-bottom">' +
      '<button type="button" class="mp-recent" data-a="library">Recentes ›</button>' +
      '<button type="button" class="mp-select" data-a="select">Selecionar</button></div>' +
      '<input class="mp-hidden-input" id="mpFileInput" type="file" accept="image/*,video/*" multiple />' +
      '<input class="mp-hidden-input" id="mpCamInput" type="file" accept="image/*,video/*" capture="environment" />';
    document.body.appendChild(root);
    root.addEventListener('click', onRootClick);
    $('mpGridWrap').addEventListener('scroll', onScroll);
    $('mpFileInput').addEventListener('change', onFilesPicked);
    $('mpCamInput').addEventListener('change', onFilesPicked);
  }

  function setTitle() {
    var t = $('tchiloMediaPicker').querySelector('.mp-title');
    if (t) t.textContent = MODE === 'story' ? 'Novo story' : MODE === 'instant' ? 'Instant' : 'Novo post';
  }

  function updateNext() {
    var btn = $('tchiloMediaPicker').querySelector('.mp-next');
    if (btn) btn.disabled = selected.length === 0;
  }

  function formatDur(sec) {
    if (!sec || !isFinite(sec)) return '';
    sec = Math.round(Number(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function uid() {
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function mapNativeItem(n) {
    return {
      id: String(n.id),
      url: n.uri || n.thumbUri || '',
      thumb: n.thumbUri || n.uri || '',
      type: n.mediaType === 'video' ? 'video' : 'image',
      duration: n.duration || 0,
      file: null,
      name: (n.mediaType === 'video' ? 'video' : 'foto') + '_' + n.id,
      native: true
    };
  }

  async function ensurePermission() {
    var gal = nativeGallery();
    if (!gal) return true;
    try {
      var st = await gal.checkPermissions();
      if (st.photos === 'granted' || st.photos === 'limited') {
        limitedAccess = st.photos === 'limited';
        permDenied = false;
        return true;
      }
      st = await gal.requestPermissions();
      limitedAccess = st.photos === 'limited';
      permDenied = st.photos === 'denied';
      return st.photos === 'granted' || st.photos === 'limited';
    } catch (e) {
      permDenied = true;
      return false;
    }
  }

  async function loadRecent(reset) {
    if (loading) return;
    loading = true;
    if (reset) {
      page = 0;
      items = [];
      hasMore = true;
      selected = [];
    }
    var gal = nativeGallery();
    if (gal) {
      var ok = await ensurePermission();
      if (!ok) {
        loading = false;
        renderGrid();
        return;
      }
      try {
        var res = await gal.getRecentMedia({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, mediaType: 'all' });
        var list = (res && res.items) || [];
        if (res && res.limited) limitedAccess = true;
        list.forEach(function (n) {
          var it = mapNativeItem(n);
          if (it.thumb) thumbCache[it.id] = it.thumb;
          items.push(it);
        });
        hasMore = list.length >= PAGE_SIZE;
        page += 1;
        loading = false;
        renderGrid();
        updateNext();
        return;
      } catch (e) {
        console.warn('native gallery', e);
        if (String(e && e.message || e).toLowerCase().indexOf('permission') >= 0) {
          permDenied = true;
          loading = false;
          renderGrid();
          return;
        }
      }
    }
    loading = false;
    // web fallback: empty until user picks files
    renderGrid();
  }

  async function loadAlbums() {
    var gal = nativeGallery();
    if (!gal) {
      albums = [];
      renderAlbums();
      return;
    }
    var ok = await ensurePermission();
    if (!ok) {
      renderAlbums();
      return;
    }
    try {
      var res = await gal.getAlbums();
      albums = (res && res.albums) || [];
    } catch (e) {
      albums = [];
    }
    renderAlbums();
  }

  async function openAlbum(albumId) {
    TAB = 'fotos';
    $('tchiloMediaPicker').querySelectorAll('.mp-tab').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-tab') === 'fotos');
    });
    loading = true;
    items = [];
    selected = [];
    page = 0;
    var gal = nativeGallery();
    try {
      var res = await gal.getAlbumMedia({ albumId: albumId, limit: PAGE_SIZE, offset: 0 });
      var list = (res && res.items) || [];
      list.forEach(function (n) {
        var it = mapNativeItem(n);
        if (it.thumb) thumbCache[it.id] = it.thumb;
        items.push(it);
      });
      hasMore = list.length >= PAGE_SIZE;
      page = 1;
    } catch (e) {
      toast('Não foi possível abrir o álbum');
    }
    loading = false;
    renderGrid();
    updateNext();
  }

  function renderAlbums() {
    var grid = $('mpGrid');
    if (!grid) return;
    if (permDenied) {
      grid.innerHTML = '<div class="mp-empty" style="grid-column:1/-1">Sem acesso à galeria.<br><button type="button" data-a="library">Pedir permissão</button></div>';
      return;
    }
    if (!albums.length) {
      grid.innerHTML = '<div class="mp-empty" style="grid-column:1/-1">Sem álbuns.<br><button type="button" data-a="library">Recarregar</button></div>';
      return;
    }
    var html = albums.map(function (a) {
      return '<button type="button" class="mp-album" data-a="album" data-id="' + a.id + '">' +
        (a.coverUri ? '<img src="' + a.coverUri + '" alt=""/>' : '<img alt=""/>') +
        '<div><b>' + (a.title || 'Álbum') + '</b><span>' + (a.count || 0) + ' itens</span></div></button>';
    }).join('');
    grid.style.display = 'block';
    grid.innerHTML = html;
  }

  function renderGrid() {
    var grid = $('mpGrid');
    if (!grid) return;
    grid.style.display = 'grid';
    var html = [];
    html.push(
      '<button type="button" class="mp-cell cam" data-a="camera">' +
      '<svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>' +
      '<span>Câmara</span></button>'
    );
    if (permDenied) {
      grid.innerHTML = html.join('') +
        '<div class="mp-empty" style="grid-column:1/-1">Sem acesso à galeria.<br>Permite nas definições do telemóvel.' +
        '<br><button type="button" data-a="perm">Pedir permissão</button></div>';
      return;
    }
    if (!items.length) {
      grid.innerHTML = html.join('') +
        '<div class="mp-empty" style="grid-column:1/-1">' +
        (limitedAccess ? 'Acesso limitado.<br>' : '') +
        (nativeGallery()
          ? 'A carregar a galeria… ou toca para permitir acesso.'
          : 'No browser usa <b>Selecionar</b> para escolher ficheiros.') +
        '<br><button type="button" data-a="library">Abrir galeria</button></div>';
      return;
    }
    items.forEach(function (it) {
      var on = selected.some(function (s) { return s.id === it.id; });
      var num = selected.findIndex(function (s) { return s.id === it.id; });
      var badge = on ? String(num + 1) : '';
      var dur = it.type === 'video' && it.duration ? formatDur(it.duration) : '';
      var src = thumbCache[it.id] || it.thumb || it.url;
      html.push(
        '<button type="button" class="mp-cell' + (on ? ' on' : '') + '" data-a="toggle" data-id="' + it.id + '">' +
        '<img src="' + src + '" alt="" loading="lazy"/>' +
        (dur ? '<span class="mp-dur">' + dur + '</span>' : '') +
        '<span class="mp-check">' + badge + '</span></button>'
      );
    });
    grid.innerHTML = html.join('');
  }

  function onScroll() {
    var wrap = $('mpGridWrap');
    if (!wrap || loading || !hasMore || TAB !== 'fotos') return;
    if (wrap.scrollTop + wrap.clientHeight > wrap.scrollHeight - 240) {
      loadRecent(false);
    }
  }

  function fileToItem(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var isVid = (file.type || '').indexOf('video/') === 0 || /\.(mp4|mov|m4v|webm)$/i.test(file.name || '');
      var item = { id: uid(), url: url, thumb: url, type: isVid ? 'video' : 'image', file: file, name: file.name || 'media', duration: 0, native: false };
      if (!isVid) { resolve(item); return; }
      var v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.onloadedmetadata = function () {
        item.duration = v.duration || 0;
        resolve(item);
      };
      v.onerror = function () { resolve(item); };
      setTimeout(function () { resolve(item); }, 2000);
      v.src = url;
    });
  }

  async function addFiles(fileList) {
    if (!fileList || !fileList.length) return;
    var arr = Array.prototype.slice.call(fileList);
    for (var i = 0; i < arr.length; i++) {
      var it = await fileToItem(arr[i]);
      items.unshift(it);
      if (selected.length < 10) selected.push(it);
    }
    renderGrid();
    updateNext();
  }

  function onFilesPicked(e) {
    addFiles(e.target.files);
    try { e.target.value = ''; } catch (err) {}
  }

  async function openCamera() {
    var Cam = getCamera();
    if (Cam && typeof Cam.getPhoto === 'function') {
      try {
        var photo = await Cam.getPhoto({ quality: 92, resultType: 'uri', source: 'CAMERA', correctOrientation: true });
        var path = photo.webPath || photo.path;
        if (path) {
          var resp = await fetch(path);
          var blob = await resp.blob();
          var file = new File([blob], 'camera.jpg', { type: blob.type || 'image/jpeg' });
          await addFiles([file]);
          return;
        }
      } catch (e) {}
    }
    var cam = $('mpCamInput');
    if (cam) cam.click();
  }

  function toggleItem(id) {
    var it = items.find(function (x) { return x.id === id; });
    if (!it) return;
    var idx = selected.findIndex(function (s) { return s.id === id; });
    if (idx >= 0) selected.splice(idx, 1);
    else {
      if (selected.length >= 10) { toast('Máximo 10 itens'); return; }
      selected.push(it);
    }
    renderGrid();
    updateNext();
  }

  async function resolveSelectedFiles() {
    var out = [];
    for (var i = 0; i < selected.length; i++) {
      var s = selected[i];
      if (s.file) {
        out.push({ type: s.type, url: s.url, file: s.file, name: s.name, duration: s.duration || 0 });
        continue;
      }
      // native uri → fetch blob
      try {
        var resp = await fetch(s.url);
        var blob = await resp.blob();
        var ext = s.type === 'video' ? 'mp4' : 'jpg';
        var file = new File([blob], (s.name || 'media') + '.' + ext, { type: blob.type || (s.type === 'video' ? 'video/mp4' : 'image/jpeg') });
        var url = URL.createObjectURL(file);
        out.push({ type: s.type, url: url, file: file, name: file.name, duration: s.duration || 0 });
      } catch (e) {
        out.push({ type: s.type, url: s.url, file: null, name: s.name, duration: s.duration || 0 });
      }
    }
    return out;
  }

  async function handoffToCreate() {
    if (!selected.length) return;
    var list = await resolveSelectedFiles();
    window.__tchiloPendingMedia = list[0];
    window.createMediaFiles = list.map(function (x) { return x.file; }).filter(Boolean);
    window.createMediaData = { type: list[0].type, items: list, src: list[0].url, file: list[0].file };
    try { (0, eval)('createMediaData = window.createMediaData'); } catch (e) {}
    closePicker();
    if (typeof goTo === 'function') {
      window.__mpSkipPicker = true;
      goTo('create');
      setTimeout(function () { window.__mpSkipPicker = false; }, 300);
    }
    setTimeout(function () {
      try {
        var preview = document.getElementById('createPreview');
        if (!preview || !list[0]) return;
        preview.classList.add('has-media');
        preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) { try { n.remove(); } catch (e) {} });
        if (list[0].type === 'video') {
          var v = document.createElement('video');
          v.src = list[0].url; v.muted = true; v.playsInline = true; v.controls = true;
          preview.appendChild(v);
        } else {
          var img = document.createElement('img');
          img.src = list[0].url; img.alt = '';
          preview.appendChild(img);
        }
      } catch (e) {}
    }, 100);
  }

  function onRootClick(e) {
    var t = e.target.closest('[data-a],[data-tab],[data-mode],[data-tool]');
    if (!t) return;
    var a = t.getAttribute('data-a');
    var tab = t.getAttribute('data-tab');
    var mode = t.getAttribute('data-mode');
    var tool = t.getAttribute('data-tool');

    if (tab === 'fotos') {
      TAB = 'fotos';
      $('tchiloMediaPicker').querySelectorAll('.mp-tab').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-tab') === 'fotos');
      });
      loadRecent(true);
      return;
    }
    if (tab === 'albuns') {
      TAB = 'albuns';
      $('tchiloMediaPicker').querySelectorAll('.mp-tab').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-tab') === 'albuns');
      });
      loadAlbums();
      return;
    }
    if (mode) {
      MODE = mode;
      $('tchiloMediaPicker').querySelectorAll('.mp-mode').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-mode') === mode);
      });
      setTitle();
      return;
    }
    if (tool === 'text') { closePicker(); if (typeof goTo === 'function') { window.__mpSkipPicker = true; goTo('create'); setTimeout(function () { window.__mpSkipPicker = false; }, 300); } return; }
    if (tool === 'music') { toast('Música'); return; }
    if (tool === 'layout') { toast('Layout'); return; }
    if (a === 'cancel') { closePicker(); return; }
    if (a === 'next') { handoffToCreate(); return; }
    if (a === 'camera') { openCamera(); return; }
    if (a === 'perm') { ensurePermission().then(function () { loadRecent(true); }); return; }
    if (a === 'library' || a === 'select') {
      if (nativeGallery()) loadRecent(true);
      else { var inp = $('mpFileInput'); if (inp) inp.click(); }
      return;
    }
    if (a === 'album') {
      var aid = t.getAttribute('data-id');
      if (aid) openAlbum(aid);
      return;
    }
    if (a === 'toggle') {
      var id = t.getAttribute('data-id');
      if (id) toggleItem(id);
    }
  }

  function openPicker(opts) {
    opts = opts || {};
    if (opts.mode) MODE = opts.mode;
    ensureDOM();
    setTitle();
    $('tchiloMediaPicker').querySelectorAll('.mp-mode').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-mode') === MODE);
    });
    TAB = 'fotos';
    $('tchiloMediaPicker').querySelectorAll('.mp-tab').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-tab') === 'fotos');
    });
    $('tchiloMediaPicker').classList.add('open');
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    loadRecent(true);
  }

  function closePicker() {
    var el = $('tchiloMediaPicker');
    if (el) el.classList.remove('open');
    try { document.body.style.overflow = ''; } catch (e) {}
  }

  window.tchiloOpenMediaPicker = openPicker;
  window.tchiloCloseMediaPicker = closePicker;

  function wirePlus() {
    document.querySelectorAll('.nav-post, #navPost').forEach(function (btn) {
      if (btn.__mpWired) return;
      btn.__mpWired = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openPicker({ mode: 'post' });
      }, true);
    });
    if (!window.__mpGoToWrap && typeof window.goTo === 'function') {
      window.__mpGoToWrap = true;
      var _go = window.goTo;
      window.goTo = function (screen) {
        if (screen === 'create' && !window.__mpSkipPicker) {
          openPicker({ mode: 'post' });
          return;
        }
        return _go.apply(this, arguments);
      };
    }
  }

  function boot() {
    ensureDOM();
    wirePlus();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
})();
