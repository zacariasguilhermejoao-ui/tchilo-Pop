/**
 * tchilo-Pop — Editor de Story/Post + biblioteca de músicas
 * Folhas de música usam var(--paper)/var(--ink). Sem edição de trecho.
 */
(function () {
  'use strict';

  var state = {
    mode: 'story',
    mediaType: 'image',
    src: null,
    file: null,
    filter: 'original',
    crop: 0,
    videoStart: 0,
    videoEnd: 0,
    videoDuration: 0,
    music: null,
    mentions: [],
    audio: null
  };

  var FILTERS = [
    { id: 'original', label: 'Original' },
    { id: 'hd', label: 'HD' },
    { id: '4k', label: '4K' },
    { id: 'warm', label: 'Quente' },
    { id: 'cool', label: 'Frio' },
    { id: 'vivid', label: 'Vivo' },
    { id: 'soft', label: 'Suave' },
    { id: 'mono', label: 'Mono' },
    { id: 'film', label: 'Filme' }
  ];

  var CROPS = [
    { id: 0, label: 'Livre' },
    { id: 1, label: '1:1' },
    { id: 2, label: '9:16' },
    { id: 3, label: '4:5' }
  ];

  function svg(path) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }
  var ICO = {
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    music: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
    crop: svg('<path d="M6 3v15h15"/><path d="M3 6h15v15"/>'),
    filter: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    mention: svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.2-3.2 3.5-5 7-5s5.8 1.8 7 5"/>'),
    trim: svg('<path d="M5 5v14M19 5v14M5 12h14"/>'),
    search: svg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>')
  };

  function catalogFetch(pathQuery) {
    return new Promise(function (resolve, reject) {
      var cb = 'tchiloMus_' + Date.now() + '_' + Math.floor(Math.random() * 1e5);
      var timeout = setTimeout(function () {
        cleanup();
        reject(new Error('timeout'));
      }, 12000);
      function cleanup() {
        clearTimeout(timeout);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (script && script.parentNode) script.parentNode.removeChild(script);
      }
      window[cb] = function (data) {
        cleanup();
        resolve(data);
      };
      var script = document.createElement('script');
      var base = 'https://api.deezer.com/' + pathQuery;
      script.src = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'output=jsonp&callback=' + cb;
      script.onerror = function () {
        cleanup();
        reject(new Error('network'));
      };
      document.head.appendChild(script);
    });
  }

  function mapTrack(t) {
    if (!t) return null;
    return {
      id: String(t.id),
      title: t.title || t.title_short || 'Música',
      artist: (t.artist && t.artist.name) || 'Artista',
      preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || ''
    };
  }

  function loadTopTracks() {
    return catalogFetch('chart/0/tracks?limit=40').then(function (data) {
      return ((data && data.data) || []).map(mapTrack).filter(Boolean);
    });
  }

  function searchTracks(q) {
    q = String(q || '').trim();
    if (!q) return loadTopTracks();
    return catalogFetch('search?q=' + encodeURIComponent(q) + '&limit=40').then(function (data) {
      return ((data && data.data) || []).map(mapTrack).filter(Boolean);
    });
  }

  function ensureEditor() {
    if (document.getElementById('tchiloMediaEd')) return;
    var root = document.createElement('div');
    root.id = 'tchiloMediaEd';
    root.innerHTML =
      '<style>' +
      '#tchiloMediaEd{display:none;position:fixed;inset:0;z-index:280;background:#0c0c0e;flex-direction:column;color:#fff;}' +
      '#tchiloMediaEd.open{display:flex;}' +
      '#tchiloMediaEd .me-top{display:flex;align-items:center;justify-content:space-between;padding:calc(10px + env(safe-area-inset-top)) 12px 8px;gap:8px;}' +
      '#tchiloMediaEd .me-top b{font-size:16px;font-weight:800;}' +
      '#tchiloMediaEd .me-iconbtn{width:42px;height:42px;border:2px solid var(--ink,#0B0B0C);border-radius:12px;background:var(--mint,#2EE6A6);color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer;}' +
      '#tchiloMediaEd .me-publish{border:0;border-radius:999px;padding:10px 18px;font-weight:800;background:#c8f560;color:#111;cursor:pointer;}' +
      '#tchiloMediaEd .me-stage{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:#000;overflow:hidden;}' +
      '#tchiloMediaEd .me-stage img,#tchiloMediaEd .me-stage video{max-width:100%;max-height:100%;object-fit:contain;}' +
      '#tchiloMediaEd .me-stage.f-hd img,#tchiloMediaEd .me-stage.f-hd video{filter:contrast(1.08) saturate(1.1);}' +
      '#tchiloMediaEd .me-stage.f-4k img,#tchiloMediaEd .me-stage.f-4k video{filter:contrast(1.15) saturate(1.2) brightness(1.05);}' +
      '#tchiloMediaEd .me-stage.f-warm img,#tchiloMediaEd .me-stage.f-warm video{filter:sepia(.18) saturate(1.15) brightness(1.05);}' +
      '#tchiloMediaEd .me-stage.f-cool img,#tchiloMediaEd .me-stage.f-cool video{filter:hue-rotate(15deg) saturate(1.05) brightness(.98);}' +
      '#tchiloMediaEd .me-stage.f-vivid img,#tchiloMediaEd .me-stage.f-vivid video{filter:saturate(1.45) contrast(1.1);}' +
      '#tchiloMediaEd .me-stage.f-soft img,#tchiloMediaEd .me-stage.f-soft video{filter:brightness(1.08) contrast(.92) saturate(.95);}' +
      '#tchiloMediaEd .me-stage.f-mono img,#tchiloMediaEd .me-stage.f-mono video{filter:grayscale(1) contrast(1.1);}' +
      '#tchiloMediaEd .me-stage.f-film img,#tchiloMediaEd .me-stage.f-film video{filter:sepia(.25) contrast(1.05) saturate(.9);}' +
      '#tchiloMediaEd .me-tools{display:flex;gap:6px;padding:8px 10px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}' +
      '#tchiloMediaEd .me-tools::-webkit-scrollbar{display:none;height:0;}' +
      '#tchiloMediaEd .me-tool{flex:0 0 auto;border:0;border-radius:14px;padding:10px 12px;background:rgba(255,255,255,.08);color:#fff;font-weight:700;font-size:12px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;min-width:64px;}' +
      '#tchiloMediaEd .me-tool.active{background:rgba(200,245,96,.25);outline:2px solid #c8f560;}' +
      '#tchiloMediaEd .me-panel{padding:0 12px 12px;max-height:42vh;overflow:auto;scrollbar-width:none;}' +
      '#tchiloMediaEd .me-panel::-webkit-scrollbar{display:none;}' +
      '#tchiloMediaEd .me-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none;}' +
      '#tchiloMediaEd .me-chips::-webkit-scrollbar{display:none;}' +
      '#tchiloMediaEd .me-chip{flex:0 0 auto;border:2px solid transparent;border-radius:999px;padding:8px 12px;background:rgba(255,255,255,.1);color:#fff;font-weight:700;font-size:12px;cursor:pointer;}' +
      '#tchiloMediaEd .me-chip.active{border-color:#c8f560;background:rgba(200,245,96,.22);}' +
      '#tchiloMediaEd .me-range{width:100%;margin:8px 0;accent-color:var(--mint,#c8f560);}' +
      '#tchiloMediaEd .me-musicbar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(255,255,255,.08);border-radius:14px;margin:0 12px 8px;}' +
      '#tchiloMediaEd .me-musicbar img{width:40px;height:40px;border-radius:8px;object-fit:cover;background:#333;}' +
      '#tchiloMediaEd .me-musicbar .meta{flex:1;min-width:0;}' +
      '#tchiloMediaEd .me-musicbar .meta b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloMediaEd .me-musicbar .meta span{font-size:11px;opacity:.7;}' +
      '#tchiloMediaEd .me-sheet{display:none;position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.35);align-items:flex-end;justify-content:center;}' +
      '#tchiloMediaEd .me-sheet.open{display:flex;}' +
      '#tchiloMediaEd .me-sheet-panel{width:min(100%,520px);max-height:78vh;background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px 20px 0 0;padding:14px 14px calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px;border:3px solid var(--ink,#0B0B0C);border-bottom:0;}' +
      '#tchiloMediaEd .me-sheet-panel h3{margin:0;font-size:17px;color:var(--ink,#0B0B0C);}' +
      '#tchiloMediaEd .me-search{display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.85);border:2px solid var(--ink,#0B0B0C);border-radius:12px;padding:8px 10px;}' +
      '#tchiloMediaEd .me-search input{flex:1;border:0;background:transparent;color:var(--ink,#0B0B0C);font-size:15px;outline:none;font-weight:600;}' +
      '#tchiloMediaEd .me-list{overflow:auto;flex:1;min-height:120px;scrollbar-width:none;}' +
      '#tchiloMediaEd .me-list::-webkit-scrollbar{display:none;}' +
      '#tchiloMediaEd .me-track{display:flex;gap:10px;align-items:center;padding:10px 4px;border-bottom:1px solid rgba(11,11,12,.08);cursor:pointer;color:var(--ink,#0B0B0C);}' +
      '#tchiloMediaEd .me-track img{width:48px;height:48px;border-radius:10px;object-fit:cover;background:#ddd;}' +
      '#tchiloMediaEd .me-track .t{flex:1;min-width:0;}' +
      '#tchiloMediaEd .me-track .t b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloMediaEd .me-track .t span{font-size:12px;opacity:.65;}' +
      '#tchiloMediaEd .me-empty{padding:24px;text-align:center;opacity:.75;font-size:14px;color:var(--ink,#0B0B0C);}' +
      '[data-theme="dark"] #tchiloMediaEd .me-search{background:rgba(255,255,255,.08);}' +
      '#tchiloMediaEd .me-mention-input{width:100%;border:2px solid var(--ink,#0B0B0C);border-radius:12px;padding:12px;background:#fff;color:var(--ink,#0B0B0C);font-size:15px;outline:none;box-sizing:border-box;}' +
      '#tchiloMediaEd .me-mention-list{max-height:200px;overflow:auto;}' +
      '#tchiloMediaEd .me-mention-item{display:flex;align-items:center;gap:10px;padding:10px 4px;cursor:pointer;color:var(--ink,#0B0B0C);}' +
      '</style>' +
      '<div class="me-top">' +
      '<button type="button" class="me-iconbtn" id="meClose">' + ICO.close + '</button>' +
      '<b id="meTitle">Editar</b>' +
      '<button type="button" class="me-publish" id="mePublish">Publicar</button>' +
      '</div>' +
      '<div class="me-stage" id="meStage"></div>' +
      '<div class="me-musicbar" id="meMusicBar" style="display:none"></div>' +
      '<div class="me-tools" id="meTools"></div>' +
      '<div class="me-panel" id="mePanel"></div>' +
      '<div class="me-sheet" id="meMusicSheet"><div class="me-sheet-panel">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><h3>Música</h3><button type="button" class="me-iconbtn" id="meMusicClose">' + ICO.close + '</button></div>' +
      '<div class="me-search">' + ICO.search + '<input id="meMusicSearch" type="search" placeholder="Pesquisar músicas e artistas" autocomplete="off"></div>' +
      '<div class="me-list" id="meMusicList"><div class="me-empty">A carregar…</div></div>' +
      '</div></div>' +
      '<div class="me-sheet" id="meMentionSheet"><div class="me-sheet-panel">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><h3>Mencionar</h3><button type="button" class="me-iconbtn" id="meMentionClose">' + ICO.close + '</button></div>' +
      '<input class="me-mention-input" id="meMentionSearch" type="search" placeholder="Procurar utilizador" autocomplete="off">' +
      '<div class="me-mention-list" id="meMentionList"></div>' +
      '<button type="button" class="me-publish" id="meMentionDone" style="width:100%">Pronto</button>' +
      '</div></div>';
    document.body.appendChild(root);

    document.getElementById('meClose').onclick = closeEditor;
    document.getElementById('mePublish').onclick = publishFromEditor;
    document.getElementById('meMusicClose').onclick = function () {
      document.getElementById('meMusicSheet').classList.remove('open');
      stopPreviewAudio();
    };
    document.getElementById('meMentionClose').onclick = function () {
      document.getElementById('meMentionSheet').classList.remove('open');
    };
    document.getElementById('meMentionDone').onclick = function () {
      document.getElementById('meMentionSheet').classList.remove('open');
      renderMusicBar();
    };

    var searchTimer = null;
    document.getElementById('meMusicSearch').oninput = function () {
      var q = this.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        renderMusicList(q);
      }, 320);
    };
    document.getElementById('meMentionSearch').oninput = function () {
      renderMentionList(this.value);
    };

    document.addEventListener('tchilo-story-music', function (ev) {
      if (ev.detail) {
        state.music = ev.detail;
        renderMusicBar();
      }
    });
  }

  function stopPreviewAudio() {
    if (state.audio) {
      try { state.audio.pause(); } catch (e) {}
      state.audio = null;
    }
  }

  function openEditor(opts) {
    ensureEditor();
    state.mode = opts.mode || 'story';
    state.mediaType = opts.mediaType || 'image';
    state.src = opts.src;
    state.file = opts.file || null;
    state.filter = 'original';
    state.crop = 0;
    state.videoStart = 0;
    state.videoEnd = 0;
    state.videoDuration = 0;
    state.music = null;
    state.mentions = [];
    stopPreviewAudio();

    document.getElementById('meTitle').textContent = 'Editar';
    document.getElementById('tchiloMediaEd').classList.add('open');
    document.body.style.overflow = 'hidden';

    var stage = document.getElementById('meStage');
    stage.className = 'me-stage f-original';
    stage.innerHTML = '';
    if (state.mediaType === 'video') {
      var v = document.createElement('video');
      v.src = state.src;
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.id = 'meVideo';
      v.onloadedmetadata = function () {
        state.videoDuration = v.duration || 0;
        state.videoEnd = state.videoDuration;
        renderPanel('trim');
      };
      stage.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.src = state.src;
      img.alt = '';
      img.id = 'meImage';
      stage.appendChild(img);
    }

    renderTools();
    renderPanel('filter');
    renderMusicBar();
  }

  function closeEditor() {
    stopPreviewAudio();
    var ed = document.getElementById('tchiloMediaEd');
    if (ed) ed.classList.remove('open');
    document.body.style.overflow = '';
    ['meMusicSheet', 'meMentionSheet'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('open');
    });
  }

  function canUseMusic() {
    if (state.mode === 'story') return true;
    return state.mediaType === 'image';
  }

  function renderTools() {
    var tools = document.getElementById('meTools');
    var items = [
      { id: 'filter', label: 'Filtros', icon: ICO.filter },
      { id: 'crop', label: 'Recortar', icon: ICO.crop }
    ];
    if (state.mediaType === 'video') {
      items.push({ id: 'trim', label: 'Cortar', icon: ICO.trim });
    }
    if (canUseMusic()) {
      items.push({ id: 'music', label: 'Música', icon: ICO.music });
    }
    items.push({ id: 'mention', label: 'Mencionar', icon: ICO.mention });

    tools.innerHTML = items
      .map(function (t) {
        return '<button type="button" class="me-tool" data-tool="' + t.id + '">' + t.icon + '<span>' + t.label + '</span></button>';
      })
      .join('');

    tools.querySelectorAll('.me-tool').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-tool');
        if (id === 'music') {
          openMusicSheet();
          return;
        }
        if (id === 'mention') {
          openMentionSheet();
          return;
        }
        tools.querySelectorAll('.me-tool').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        renderPanel(id);
      };
    });
    var first = tools.querySelector('.me-tool');
    if (first) first.classList.add('active');
  }

  function renderPanel(which) {
    var panel = document.getElementById('mePanel');
    if (which === 'filter') {
      panel.innerHTML =
        '<div class="me-chips">' +
        FILTERS.map(function (f) {
          return '<button type="button" class="me-chip' + (state.filter === f.id ? ' active' : '') + '" data-f="' + f.id + '">' + f.label + '</button>';
        }).join('') +
        '</div>';
      panel.querySelectorAll('.me-chip').forEach(function (c) {
        c.onclick = function () {
          state.filter = c.getAttribute('data-f');
          document.getElementById('meStage').className = 'me-stage f-' + state.filter;
          renderPanel('filter');
        };
      });
    } else if (which === 'crop') {
      panel.innerHTML =
        '<div class="me-chips">' +
        CROPS.map(function (c) {
          return '<button type="button" class="me-chip' + (state.crop === c.id ? ' active' : '') + '" data-c="' + c.id + '">' + c.label + '</button>';
        }).join('') +
        '</div>';
      panel.querySelectorAll('.me-chip').forEach(function (c) {
        c.onclick = function () {
          state.crop = Number(c.getAttribute('data-c'));
          applyCropPreview();
          renderPanel('crop');
        };
      });
    } else if (which === 'trim') {
      var dur = state.videoDuration || 0;
      panel.innerHTML =
        '<label style="font-size:12px;opacity:.7">Início do vídeo</label>' +
        '<input type="range" class="me-range" id="meVidStart" min="0" max="' + dur + '" step="0.1" value="' + state.videoStart + '">' +
        '<label style="font-size:12px;opacity:.7">Fim do vídeo</label>' +
        '<input type="range" class="me-range" id="meVidEnd" min="0" max="' + dur + '" step="0.1" value="' + state.videoEnd + '">' +
        '<div id="meVidLabel" style="font-size:13px;font-weight:700">' + state.videoStart.toFixed(1) + 's – ' + state.videoEnd.toFixed(1) + 's</div>';
      var vs = document.getElementById('meVidStart');
      var ve = document.getElementById('meVidEnd');
      function syncVid() {
        state.videoStart = Number(vs.value) || 0;
        state.videoEnd = Number(ve.value) || dur;
        if (state.videoEnd < state.videoStart + 0.5) state.videoEnd = state.videoStart + 0.5;
        document.getElementById('meVidLabel').textContent = state.videoStart.toFixed(1) + 's – ' + state.videoEnd.toFixed(1) + 's';
        var v = document.getElementById('meVideo');
        if (v) {
          try { v.currentTime = state.videoStart; } catch (e) {}
        }
      }
      if (vs) vs.oninput = syncVid;
      if (ve) ve.oninput = syncVid;
    } else {
      panel.innerHTML = '';
    }
  }

  function applyCropPreview() {
    var el = document.getElementById('meImage') || document.getElementById('meVideo');
    if (!el) return;
    var ratios = { 0: null, 1: 1, 2: 9 / 16, 3: 4 / 5 };
    var r = ratios[state.crop];
    if (!r) {
      el.style.objectFit = 'contain';
      el.style.width = 'auto';
      el.style.height = 'auto';
      el.style.maxWidth = '100%';
      el.style.maxHeight = '100%';
      return;
    }
    el.style.objectFit = 'cover';
    var stage = document.getElementById('meStage');
    var sw = stage.clientWidth || 360;
    var sh = stage.clientHeight || 480;
    var boxW = sw * 0.92;
    var boxH = boxW / r;
    if (boxH > sh * 0.92) {
      boxH = sh * 0.92;
      boxW = boxH * r;
    }
    el.style.width = boxW + 'px';
    el.style.height = boxH + 'px';
    el.style.maxWidth = 'none';
    el.style.maxHeight = 'none';
  }

  function renderMusicBar() {
    var bar = document.getElementById('meMusicBar');
    if (!state.music) {
      bar.style.display = 'none';
      bar.innerHTML = '';
      return;
    }
    bar.style.display = 'flex';
    var m = state.music;
    bar.innerHTML =
      (m.cover ? '<img src="' + String(m.cover).replace(/"/g, '') + '" alt="">' : '') +
      '<div class="meta"><b>' +
      String(m.title).replace(/</g, '<') +
      '</b><span>' +
      String(m.artist).replace(/</g, '<') +
      '</span></div>' +
      '<button type="button" class="me-iconbtn" id="meRemoveMusic">' +
      ICO.close +
      '</button>';
    document.getElementById('meRemoveMusic').onclick = function () {
      stopPreviewAudio();
      state.music = null;
      renderMusicBar();
    };
  }

  function openMusicSheet() {
    document.getElementById('meMusicSheet').classList.add('open');
    document.getElementById('meMusicSearch').value = '';
    renderMusicList('');
    setTimeout(function () {
      if (typeof window.tchiloEnrichStoryMusic === 'function') window.tchiloEnrichStoryMusic();
    }, 200);
  }

  function renderMusicList(q) {
    var list = document.getElementById('meMusicList');
    list.innerHTML = '<div class="me-empty">A carregar…</div>';
    var fn = q && String(q).trim() ? searchTracks(q) : loadTopTracks();
    fn
      .then(function (tracks) {
        if (!tracks.length) {
          list.innerHTML = '<div class="me-empty">Sem resultados</div>';
          return;
        }
        list.innerHTML = tracks
          .map(function (t, idx) {
            return (
              '<div class="me-track" data-i="' +
              idx +
              '" data-id="' +
              t.id +
              '" data-preview="' +
              String(t.preview || '').replace(/"/g, '') +
              '">' +
              (t.cover
                ? '<img src="' + String(t.cover).replace(/"/g, '') + '" alt="">'
                : '<div style="width:48px;height:48px;border-radius:10px;background:#ddd"></div>') +
              '<div class="t"><b>' +
              String(t.title).replace(/</g, '<') +
              '</b><span>' +
              String(t.artist).replace(/</g, '<') +
              '</span></div></div>'
            );
          })
          .join('');

        list.querySelectorAll('.me-track').forEach(function (row, idx) {
          row.onclick = function () {
            var t = tracks[idx];
            state.music = {
              id: t.id,
              title: t.title,
              artist: t.artist,
              preview: t.preview,
              cover: t.cover
            };
            stopPreviewAudio();
            document.getElementById('meMusicSheet').classList.remove('open');
            renderMusicBar();
            if (typeof showToast === 'function') showToast('Música adicionada');
          };
        });
        if (typeof window.tchiloEnrichStoryMusic === 'function') window.tchiloEnrichStoryMusic();
      })
      .catch(function () {
        list.innerHTML = '<div class="me-empty">Não foi possível carregar músicas.</div>';
      });
  }

  function openMentionSheet() {
    document.getElementById('meMentionSheet').classList.add('open');
    document.getElementById('meMentionSearch').value = '';
    renderMentionList('');
  }

  function getKnownUsers() {
    var names = {};
    try {
      (typeof getFollowing === 'function' ? getFollowing() : []).forEach(function (u) {
        if (u) names[u] = 1;
      });
    } catch (e) {}
    try {
      Object.keys(typeof getChats === 'function' ? getChats() || {} : {}).forEach(function (u) {
        if (u) names[u] = 1;
      });
    } catch (e) {}
    try {
      (typeof getPosts === 'function' ? getPosts() : []).forEach(function (p) {
        if (p && p.username) names[p.username] = 1;
      });
    } catch (e) {}
    return Object.keys(names).sort();
  }

  function renderMentionList(q) {
    q = String(q || '').toLowerCase();
    var list = document.getElementById('meMentionList');
    var users = getKnownUsers().filter(function (u) {
      return !q || u.toLowerCase().indexOf(q) >= 0;
    });
    if (!users.length) {
      list.innerHTML = '<div class="me-empty">Sem utilizadores</div>';
      return;
    }
    list.innerHTML = users
      .map(function (u) {
        var on = state.mentions.indexOf(u) >= 0;
        return (
          '<div class="me-mention-item" data-u="' +
          String(u).replace(/"/g, '') +
          '">' +
          '<div style="width:36px;height:36px;border-radius:50%;background:#c8f560;color:#111;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px">' +
          String(u).slice(0, 2).toUpperCase() +
          '</div><b style="flex:1">@' +
          String(u).replace(/</g, '<') +
          '</b>' +
          (on ? '<span style="color:#2EE6A6;font-weight:800">Sim</span>' : '') +
          '</div>'
        );
      })
      .join('');
    list.querySelectorAll('.me-mention-item').forEach(function (row) {
      row.onclick = function () {
        var u = row.getAttribute('data-u');
        var i = state.mentions.indexOf(u);
        if (i >= 0) state.mentions.splice(i, 1);
        else state.mentions.push(u);
        renderMentionList(document.getElementById('meMentionSearch').value);
      };
    });
  }

  function exportImageDataUrl() {
    return new Promise(function (resolve) {
      var img = document.getElementById('meImage');
      if (!img) return resolve(state.src);
      var canvas = document.createElement('canvas');
      var w = img.naturalWidth || 1080;
      var h = img.naturalHeight || 1080;
      var max = state.filter === '4k' ? 1920 : state.filter === 'hd' ? 1440 : 1280;
      var scale = Math.min(1, max / Math.max(w, h));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      var ctx = canvas.getContext('2d');
      var ratios = { 0: null, 1: 1, 2: 9 / 16, 3: 4 / 5 };
      var r = ratios[state.crop];
      function cssFilterFor(id) {
        var map = {
          original: 'none',
          hd: 'contrast(1.08) saturate(1.1)',
          '4k': 'contrast(1.15) saturate(1.2) brightness(1.05)',
          warm: 'sepia(0.18) saturate(1.15) brightness(1.05)',
          cool: 'hue-rotate(15deg) saturate(1.05)',
          vivid: 'saturate(1.45) contrast(1.1)',
          soft: 'brightness(1.08) contrast(0.92)',
          mono: 'grayscale(1) contrast(1.1)',
          film: 'sepia(0.25) contrast(1.05) saturate(0.9)'
        };
        return map[id] || 'none';
      }
      if (r) {
        var srcR = w / h;
        var sw, sh, sx, sy;
        if (srcR > r) {
          sh = h;
          sw = h * r;
          sx = (w - sw) / 2;
          sy = 0;
        } else {
          sw = w;
          sh = w / r;
          sx = 0;
          sy = (h - sh) / 2;
        }
        canvas.width = Math.round(sw * scale);
        canvas.height = Math.round(sh * scale);
        ctx.filter = cssFilterFor(state.filter);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.filter = cssFilterFor(state.filter);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      resolve(canvas.toDataURL('image/jpeg', state.filter === '4k' ? 0.92 : 0.88));
    });
  }

  function musicPayload() {
    if (!state.music) return null;
    return {
      id: state.music.id,
      title: state.music.title,
      artist: state.music.artist,
      preview: state.music.preview,
      cover: state.music.cover
    };
  }

  async function publishFromEditor() {
    if (window._storyMusicPick && !state.music) {
      state.music = window._storyMusicPick;
      window._storyMusicPick = null;
    }
    var music = canUseMusic() ? musicPayload() : null;
    var mentions = state.mentions.slice();
    var mentionText = mentions.length
      ? mentions
          .map(function (u) {
            return '@' + u;
          })
          .join(' ')
      : '';

    if (state.mode === 'story') {
      var media = state.src;
      if (state.mediaType === 'image') {
        try {
          media = await exportImageDataUrl();
        } catch (e) {}
      }
      if (typeof publishStory === 'function') {
        publishStory({
          media: media,
          mediaType: state.mediaType,
          text: mentionText,
          music: music,
          mentions: mentions,
          filter: state.filter,
          videoStart: state.videoStart,
          videoEnd: state.videoEnd
        });
      }
      closeEditor();
      return;
    }

    if (state.mediaType === 'image') {
      var dataUrl = state.src;
      try {
        dataUrl = await exportImageDataUrl();
      } catch (e) {}
      window.createMediaData = {
        type: 'image',
        items: [{ type: 'image', url: dataUrl, name: 'edit.jpg' }]
      };
      var preview = document.getElementById('createPreview');
      if (preview) {
        preview.classList.add('has-media');
        preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) {
          n.remove();
        });
        var im = document.createElement('img');
        im.src = dataUrl;
        im.style.cssText = 'width:100%;height:100%;object-fit:cover';
        preview.appendChild(im);
      }
      if (music) {
        window._pendingMusic = music.title + ' · ' + music.artist;
        window._pendingMusicMeta = music;
      } else {
        window._pendingMusic = null;
        window._pendingMusicMeta = null;
      }
      if (mentionText) {
        var cap = document.getElementById('createCaption');
        if (cap && !cap.value) cap.value = mentionText;
      }
      if (typeof window.tchiloUpdatePostMusicBtn === 'function') window.tchiloUpdatePostMusicBtn();
      if (typeof showToast === 'function') showToast('Pronto a publicar');
    }
    closeEditor();
    if (typeof goTo === 'function') goTo('create');
  }

  window.tchiloOpenMediaEditor = openEditor;

  function hookStoryPicker() {
    if (typeof window.onStoryMediaPicked !== 'function') return;
    if (window.onStoryMediaPicked.__tchiloEd) return;
    var orig = window.onStoryMediaPicked;
    window.onStoryMediaPicked = function (event) {
      try {
        if (typeof closeStoryCreateSheet === 'function') closeStoryCreateSheet();
        var input = event.target;
        var file = input.files && input.files[0];
        if (!file) return;
        var isVideo = file.type.indexOf('video') === 0;
        var url = URL.createObjectURL(file);
        if (isVideo) {
          openEditor({ mode: 'story', mediaType: 'video', src: url, file: file });
          input.value = '';
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          openEditor({ mode: 'story', mediaType: 'image', src: reader.result, file: file });
          input.value = '';
        };
        reader.readAsDataURL(file);
      } catch (e) {
        orig.apply(this, arguments);
      }
    };
    window.onStoryMediaPicked.__tchiloEd = true;
  }

  function hookPublishStory() {
    if (typeof window.publishStory !== 'function' || window.publishStory.__tchiloMus) return;
    var orig = window.publishStory;
    window.publishStory = async function (data) {
      data = data || {};
      if (data.music) {
        data.text =
          (data.text || '') +
          (data.text ? '\n' : '') +
          '♪ ' +
          data.music.title +
          ' · ' +
          data.music.artist;
      }
      return orig.call(this, data);
    };
    window.publishStory.__tchiloMus = true;
  }

  function boot() {
    hookStoryPicker();
    hookPublishStory();
    setTimeout(hookStoryPicker, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
