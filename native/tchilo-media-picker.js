/**
 * Tchilo Create Flow v3
 * + → Hub (voltar / tema / story + câmara + galeria + recentes)
 * Tema → escrever + fundo + publicar
 * Post → composição (descrição, música, cortar) → Publicar + progresso
 * Story → layout story → publicar
 */
(function () {
  'use strict';
  if (window.__TCHILO_MEDIA_PICKER_V3) return;
  window.__TCHILO_MEDIA_PICKER_V3 = true;
  window.__TCHILO_MEDIA_PICKER_V2 = true;

  var MODE = 'post'; // post | story | theme

  var MODE_ORDER = ['post', 'story', 'theme'];

  function syncModeTabs() {
    var modes = document.querySelectorAll('#mpModes .mp-mode');
    if (!modes.length) return;
    var active = STEP === 'theme' ? 'theme' : MODE;
    modes.forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-mode') === active);
    });
    var title = $('mpTitle');
    if (title) title.textContent = active === 'theme' ? 'TEMA' : active === 'story' ? 'STORY' : 'POST';
  }

  function setCreateMode(mode) {
    if (mode === 'theme') {
      MODE = 'post';
      setStep('theme');
      try { syncThemePreview(); } catch (e) {}
      syncModeTabs();
      return;
    }
    MODE = mode === 'story' ? 'story' : 'post';
    if (STEP === 'theme' || STEP === 'compose' || STEP === 'story') {
      selected = [];
      setStep('hub');
      try { loadRecent(false); } catch (e2) {}
    }
    syncModeTabs();
  }

  function bindModeTabs() {
    var host = $('mpModes');
    if (!host || host.__bound) return;
    host.__bound = true;
    host.querySelectorAll('.mp-mode').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setCreateMode(btn.getAttribute('data-mode'));
      });
    });
    var sx = 0;
    host.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches[0]) return;
      sx = e.touches[0].clientX;
    }, { passive: true });
    host.addEventListener('touchend', function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) < 40) return;
      var cur = STEP === 'theme' ? 'theme' : MODE;
      var i = MODE_ORDER.indexOf(cur);
      if (i < 0) i = 0;
      if (dx < 0 && i < MODE_ORDER.length - 1) setCreateMode(MODE_ORDER[i + 1]);
      else if (dx > 0 && i > 0) setCreateMode(MODE_ORDER[i - 1]);
    }, { passive: true });
  }

  var STEP = 'hub'; // hub | theme | compose | story | publishing
  var items = [];
  var selected = [];
  var thumbCache = Object.create(null);
  var page = 0;
  var PAGE_SIZE = 60;
  var loading = false;
  var hasMore = true;
  var permDenied = false;
  var limitedAccess = false;
  var returnScreen = 'feed';
  var themeBg = 'm1';
  var publishPct = 0;

  var THEME_COLORS = [
    { id: 'm1', bg: '#7DFFB3' },
    { id: 'm2', bg: '#C8F560' },
    { id: 'm3', bg: '#B39CFF' },
    { id: 'm4', bg: '#FF4B75' },
    { id: 'm5', bg: '#F7F6F2' },
    { id: 'm6', bg: '#0B0B0C' },
    { id: 'm7', bg: '#4FC3F7' },
    { id: 'm8', bg: '#FFB74D' }
  ];

  function $(id) { return document.getElementById(id); }
  function toast(m) {
    try { if (typeof showToast === 'function') showToast(m); } catch (e) {}
  }

  function nativeGallery() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TchiloMediaGallery)
        return window.Capacitor.Plugins.TchiloMediaGallery;
    } catch (e) {}
    return null;
  }

  function getCamera() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Camera)
        return window.Capacitor.Plugins.Camera;
    } catch (e) {}
    return null;
  }

  function rememberReturn() {
    try {
      var active = document.querySelector('.screen.active');
      if (active && active.id) {
        var id = active.id.replace(/^screen-/, '');
        if (id && id !== 'create') returnScreen = id;
      }
    } catch (e) {}
  }

  function injectCSS() {
    if ($('tchilo-mp-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-mp-css';
    st.textContent = [
      '#tchiloMediaPicker{position:fixed;inset:0;z-index:10050;display:none;flex-direction:column;background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);',
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
      '#tchiloMediaPicker.open{display:flex!important;}',
      '#tchiloMediaPicker *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}',
      /* top */
      '#tchiloMediaPicker .mp-top{display:flex;align-items:center;gap:8px;padding:10px 12px;',
      'padding-top:max(10px,env(safe-area-inset-top));flex-shrink:0;}',
      '#tchiloMediaPicker .mp-icon-btn{width:40px;height:40px;border:0;border-radius:50%;background:transparent;',
      'color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex-shrink:0;}',
      '#tchiloMediaPicker .mp-icon-btn svg{width:20px;height:20px;stroke:currentColor;fill:none;}',
      '#tchiloMediaPicker .mp-modes{flex:1;display:flex;align-items:center;justify-content:center;gap:0;min-width:0;overflow:hidden;touch-action:pan-y;}',
      '#tchiloMediaPicker .mp-mode{border:0;background:transparent;color:rgba(11,11,12,.28);font:800 22px/1.1 system-ui,-apple-system,sans-serif;',
      'letter-spacing:0.04em;text-transform:uppercase;padding:6px 10px;cursor:pointer;transition:color .15s ease;}',
      '#tchiloMediaPicker .mp-mode.on{color:var(--ink,#0B0B0C);}',
      '#tchiloMediaPicker .mp-top-title{display:none;}',
      '#tchiloMediaPicker .mp-chip{display:none!important;border:0;border-radius:999px;padding:8px 14px;font:600 13px system-ui,sans-serif;',
      'background:rgba(11,11,12,.08);color:var(--ink,#0B0B0C);cursor:pointer;}',
      '#tchiloMediaPicker .mp-chip.on{background:#fff;color:#0B0B0C;}',
      '#tchiloMediaPicker .mp-publish{border:0;border-radius:999px;padding:8px 16px;font:700 14px system-ui,sans-serif;',
      'background:var(--ink,#0B0B0C);color:var(--ink,#0B0B0C);cursor:pointer;}',
      '#tchiloMediaPicker .mp-publish:disabled{opacity:.4;}',
      /* body steps */
      '#tchiloMediaPicker .mp-step{display:none;flex:1;min-height:0;flex-direction:column;}',
      '#tchiloMediaPicker .mp-step.on{display:flex!important;}',
      /* hub actions */
      '#tchiloMediaPicker .mp-actions{display:flex;gap:12px;padding:12px 14px;flex-shrink:0;}',
      '#tchiloMediaPicker .mp-action{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;',
      'padding:16px 10px;border-radius:0;border:0;background:transparent;color:var(--ink,#0B0B0C);cursor:pointer;',
      'font:600 13px system-ui,sans-serif;box-shadow:none;}',
      '#tchiloMediaPicker .mp-action svg{width:28px;height:28px;stroke:var(--ink,#0B0B0C);fill:none;}',
      '#tchiloMediaPicker .mp-section{padding:0 14px 8px;font:600 13px system-ui,sans-serif;opacity:.7;flex-shrink:0;}',
      /* grid */
      '#tchiloMediaPicker .mp-grid-wrap{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
      '#tchiloMediaPicker .mp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:rgba(11,11,12,.06);}',
      '#tchiloMediaPicker .mp-cell{position:relative;aspect-ratio:1;background:rgba(11,11,12,.04);border:0;padding:0;overflow:hidden;cursor:pointer;}',
      '#tchiloMediaPicker .mp-cell img{width:100%;height:100%;object-fit:cover;display:block;}',
      '#tchiloMediaPicker .mp-cell .mp-dur{position:absolute;right:4px;bottom:4px;font:600 11px system-ui,sans-serif;color:var(--ink,#0B0B0C);text-shadow:0 1px 2px #000;}',
      '#tchiloMediaPicker .mp-cell.on::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 3px #3897f0;pointer-events:none;}',
      '#tchiloMediaPicker .mp-cell .mp-check{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;',
      'border:1.5px solid #fff;background:rgba(0,0,0,.3);color:var(--ink,#0B0B0C);font:700 11px system-ui,sans-serif;',
      'display:flex;align-items:center;justify-content:center;}',
      '#tchiloMediaPicker .mp-cell.on .mp-check{background:var(--ink,#0B0B0C);border-color:#3897f0;}',
      '#tchiloMediaPicker .mp-empty{padding:32px 20px;text-align:center;color:rgba(11,11,12,.5);font:500 14px system-ui,sans-serif;line-height:1.45;}',
      '#tchiloMediaPicker .mp-empty button{margin-top:12px;padding:12px 18px;border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:var(--ink,#0B0B0C);font:600 14px system-ui,sans-serif;cursor:pointer;}',
      /* theme */
      '#tchiloMediaPicker .mp-theme-preview{margin:12px 16px;border-radius:16px;min-height:42vh;display:flex;align-items:center;justify-content:center;',
      'padding:24px;text-align:center;font:700 28px system-ui,-apple-system,sans-serif;line-height:1.2;word-break:break-word;}',
      '#tchiloMediaPicker .mp-theme-colors{display:flex;gap:10px;padding:8px 16px;overflow-x:auto;flex-shrink:0;}',
      '#tchiloMediaPicker .mp-swatch{width:36px;height:36px;border-radius:50%;border:2px solid transparent;cursor:pointer;flex-shrink:0;}',
      '#tchiloMediaPicker .mp-swatch.on{border-color:var(--ink,#0B0B0C);box-shadow:0 0 0 2px #3897f0;}',
      '#tchiloMediaPicker .mp-theme-input{margin:8px 16px;width:calc(100% - 32px);border:0;border-radius:12px;padding:14px;',
      'background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C);font:500 16px system-ui,sans-serif;outline:none;}',
      '#tchiloMediaPicker .mp-theme-input::placeholder{color:rgba(11,11,12,.4);}',
      /* compose */
      '#tchiloMediaPicker .mp-compose-body{flex:1;min-height:0;display:flex;flex-direction:column;position:relative;}',
      '#tchiloMediaPicker .mp-preview{flex:1;min-height:0;background:#000;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;overflow:hidden;overflow:hidden;overflow:hidden;overflow:hidden;}',
      '#tchiloMediaPicker .mp-preview img,#tchiloMediaPicker .mp-preview video{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:cover;}',
      '#tchiloMediaPicker .mp-side{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px;z-index:2;}',
      '#tchiloMediaPicker .mp-side button{width:44px;height:44px;border-radius:50%;border:0;background:rgba(0,0,0,.45);',
      'color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(8px);}',
      '#tchiloMediaPicker .mp-side button svg{width:20px;height:20px;stroke:currentColor;fill:none;}',
      '#tchiloMediaPicker .mp-caption-bar{flex-shrink:0;padding:12px 14px;padding-bottom:max(12px,env(safe-area-inset-bottom));',
      'background:rgba(11,11,12,.06);border-top:1px solid rgba(11,11,12,.08);}',
      '#tchiloMediaPicker .mp-caption{width:100%;border:0;border-radius:12px;padding:12px 14px;background:rgba(11,11,12,.05);',
      'color:var(--ink,#0B0B0C);font:500 15px system-ui,sans-serif;outline:none;resize:none;min-height:44px;max-height:100px;}',
      '#tchiloMediaPicker .mp-caption::placeholder{color:rgba(11,11,12,.4);}',
      /* story compose — vertical full */
      '#tchiloMediaPicker .mp-story-preview{flex:1;margin:0;background:rgba(11,11,12,.06);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}',
      '#tchiloMediaPicker .mp-story-preview img,#tchiloMediaPicker .mp-story-preview video{width:100%;height:100%;object-fit:cover;}',
      /* publishing */
      '#tchiloMediaPicker .mp-pub{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;}',
      '#tchiloMediaPicker .mp-ring{width:88px;height:88px;border-radius:50%;border:4px solid rgba(255,255,255,.15);',
      'border-top-color:var(--ink,#0B0B0C);animation:mpSpin 0.9s linear infinite;}',
      '@keyframes mpSpin{to{transform:rotate(360deg)}}',
      '#tchiloMediaPicker .mp-pct{font:700 28px system-ui,-apple-system,sans-serif;letter-spacing:-0.02em;}',
      '#tchiloMediaPicker .mp-pub-label{font:500 14px system-ui,sans-serif;opacity:.65;}',
      '#tchiloMediaPicker .mp-hidden{position:fixed;left:-9999px;width:1px;height:1px;opacity:0;}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  function ensureDOM() {
    injectCSS();
    if ($('tchiloMediaPicker')) return;
    var root = document.createElement('div');
    root.id = 'tchiloMediaPicker';
    root.innerHTML =
      /* TOP */
      '<div class="mp-top" id="mpTop">' +
      '<button type="button" class="mp-icon-btn" data-a="back" aria-label="Voltar">' +
      svg('<path d="M15 18l-6-6 6-6"/>') + '</button>' +
      '<div class="mp-modes" id="mpModes">' +
      '<button type="button" class="mp-mode on" data-mode="post" id="mpModePost">POST</button>' +
      '<button type="button" class="mp-mode" data-mode="story" id="mpModeStory">STORY</button>' +
      '<button type="button" class="mp-mode" data-mode="theme" id="mpModeTheme">TEMA</button>' +
      '</div>' +
      '<div class="mp-top-title" id="mpTitle" style="display:none">POST</div>' +
      '<button type="button" class="mp-publish" data-a="do-publish" id="mpPublishBtn" style="display:none">Publicar</button>' +
      '</div>' +

      /* HUB */
      '<div class="mp-step on" id="mpStepHub" data-step="hub">' +
      '<div class="mp-actions">' +
      '<button type="button" class="mp-action" data-a="camera">' +
      svg('<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>') +
      '<span>Câmara</span></button>' +
      '<button type="button" class="mp-action" data-a="gallery">' +
      svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>') +
      '<span>Galeria</span></button>' +
      '</div>' +
      '<div class="mp-section">Recentes</div>' +
      '<div class="mp-grid-wrap" id="mpGridWrap"><div class="mp-grid" id="mpGrid"></div></div>' +
      '</div>' +

      /* THEME */
      '<div class="mp-step" id="mpStepTheme" data-step="theme">' +
      '<div class="mp-theme-preview" id="mpThemePreview">Escreve algo…</div>' +
      '<div class="mp-theme-colors" id="mpThemeColors"></div>' +
      '<input class="mp-theme-input" id="mpThemeTitle" maxlength="40" placeholder="Título (opcional)" />' +
      '<textarea class="mp-theme-input" id="mpThemeText" rows="3" maxlength="200" placeholder="Escreve o teu texto…"></textarea>' +
      '</div>' +

      /* COMPOSE POST */
      '<div class="mp-step" id="mpStepCompose" data-step="compose">' +
      '<div class="mp-compose-body">' +
      '<div class="mp-preview" id="mpComposePreview"></div>' +
      '<div class="mp-side">' +
      '<button type="button" data-a="music" title="Música">' + svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>') + '</button>' +
      '<button type="button" data-a="crop" title="Cortar">' + svg('<path d="M6 3v15h15"/><path d="M3 6h15v15"/>') + '</button>' +
      '</div>' +
      '<div class="mp-caption-bar">' +
      '<div id="mpMusicChip" style="display:none;margin-bottom:8px;padding:8px 12px;border-radius:999px;background:rgba(11,11,12,.06);font:600 13px system-ui,sans-serif"></div><textarea class="mp-caption" id="mpCaption" rows="2" placeholder="Escreve uma descrição…"></textarea>' +
      '</div></div></div>' +

      /* STORY */
      '<div class="mp-step" id="mpStepStory" data-step="story">' +
      '<div class="mp-story-preview" id="mpStoryPreview">' +
      '<div class="mp-empty">Escolhe uma foto ou vídeo<br>ou usa a câmara</div></div>' +
      '<div class="mp-caption-bar">' +
      '<textarea class="mp-caption" id="mpStoryCaption" rows="2" placeholder="Adiciona texto ao story…"></textarea>' +
      '</div></div>' +

      /* PUBLISHING */
      '<div class="mp-step" id="mpStepPublishing" data-step="publishing">' +
      '<div class="mp-pub">' +
      '<div class="mp-ring" id="mpRing"></div>' +
      '<div class="mp-pct" id="mpPct">0%</div>' +
      '<div class="mp-pub-label" id="mpPubLabel">A publicar…</div>' +
      '</div></div>' +

      '<input class="mp-hidden" id="mpFileInput" type="file" accept="image/*,video/*" multiple />' +
      '<input class="mp-hidden" id="mpCamInput" type="file" accept="image/*,video/*" capture="environment" />';

    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    $('mpGridWrap').addEventListener('scroll', onScroll);
    $('mpFileInput').addEventListener('change', onFiles);
    $('mpCamInput').addEventListener('change', onFiles);
    $('mpThemeText').addEventListener('input', syncThemePreview);
    $('mpThemeTitle').addEventListener('input', syncThemePreview);

    var colors = $('mpThemeColors');
    THEME_COLORS.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mp-swatch' + (i === 0 ? ' on' : '');
      b.style.background = c.bg;
      b.setAttribute('data-a', 'swatch');
      b.setAttribute('data-bg', c.id);
      b.setAttribute('data-color', c.bg);
      colors.appendChild(b);
    });
    themeBg = THEME_COLORS[0].bg;
  }

  function setStep(step) {
    try { syncModeTabs(); } catch (e) {}
    STEP = step;
    document.querySelectorAll('#tchiloMediaPicker .mp-step').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-step') === step);
    });
    var title = $('mpTitle');
    var themeBtn = $('mpThemeBtn');
    var storyBtn = $('mpStoryBtn');
    var pubBtn = $('mpPublishBtn');

    themeBtn.style.display = step === 'hub' ? '' : 'none';
    storyBtn.style.display = step === 'hub' ? '' : 'none';
    pubBtn.style.display = (step === 'compose' || step === 'story' || step === 'theme') ? '' : 'none';

    if (step === 'hub') title.textContent = MODE === 'story' ? 'Story' : 'Criar';
    if (step === 'theme') title.textContent = 'Tema';
    if (step === 'compose') title.textContent = 'Nova publicação';
    if (step === 'story') title.textContent = 'Novo story';
    if (step === 'publishing') title.textContent = 'Publicar';

    storyBtn.classList.toggle('on', MODE === 'story');
  }

  function formatDur(sec) {
    if (!sec || !isFinite(sec)) return '';
    sec = Math.round(Number(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function uid() {
    return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function mapNative(n) {
    return {
      id: String(n.id),
      url: n.uri || n.thumbUri || '',
      thumb: n.thumbUri || n.uri || '',
      type: n.mediaType === 'video' ? 'video' : 'image',
      duration: n.duration || 0,
      file: null,
      name: 'media_' + n.id
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
    if (reset) { page = 0; items = []; hasMore = true; }
    var gal = nativeGallery();
    if (gal) {
      var ok = await ensurePermission();
      if (!ok) { loading = false; renderGrid(); return; }
      try {
        var res = await gal.getRecentMedia({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, mediaType: 'all' });
        var list = (res && res.items) || [];
        if (res && res.limited) limitedAccess = true;
        list.forEach(function (n) {
          var it = mapNative(n);
          if (it.thumb) thumbCache[it.id] = it.thumb;
          items.push(it);
        });
        hasMore = list.length >= PAGE_SIZE;
        page += 1;
        loading = false;
        renderGrid();
        return;
      } catch (e) {
        if (String(e && e.message || e).toLowerCase().indexOf('permission') >= 0) permDenied = true;
      }
    }
    loading = false;
    renderGrid();
  }

  function renderGrid() {
    var grid = $('mpGrid');
    if (!grid) return;
    if (permDenied) {
      grid.innerHTML = '<div class="mp-empty" style="grid-column:1/-1">Sem acesso à galeria.<br><button type="button" data-a="gallery">Abrir galeria</button></div>';
      return;
    }
    if (!items.length) {
      grid.innerHTML = '<div class="mp-empty" style="grid-column:1/-1">' +
        (nativeGallery() ? 'A carregar recentes…' : 'Toca em Galeria para escolher fotos ou vídeos.') +
        '<br><button type="button" data-a="gallery">Abrir galeria</button></div>';
      return;
    }
    var html = items.map(function (it) {
      var on = selected.some(function (s) { return s.id === it.id; });
      var num = selected.findIndex(function (s) { return s.id === it.id; });
      var badge = on ? String(num + 1) : '';
      var dur = it.type === 'video' && it.duration ? formatDur(it.duration) : '';
      var src = thumbCache[it.id] || it.thumb || it.url;
      return '<button type="button" class="mp-cell' + (on ? ' on' : '') + '" data-a="pick" data-id="' + it.id + '">' +
        '<img src="' + src + '" alt="" loading="lazy"/>' +
        (dur ? '<span class="mp-dur">' + dur + '</span>' : '') +
        '<span class="mp-check">' + badge + '</span></button>';
    }).join('');
    grid.innerHTML = html;
  }

  function onScroll() {
    var wrap = $('mpGridWrap');
    if (!wrap || loading || !hasMore || STEP !== 'hub') return;
    if (wrap.scrollTop + wrap.clientHeight > wrap.scrollHeight - 200) loadRecent(false);
  }

  function fileToItem(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var isVid = (file.type || '').indexOf('video/') === 0 || /\.(mp4|mov|m4v|webm)$/i.test(file.name || '');
      var item = { id: uid(), url: url, thumb: url, type: isVid ? 'video' : 'image', file: file, name: file.name || 'media', duration: 0 };
      if (!isVid) { resolve(item); return; }
      var v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.onloadedmetadata = function () { item.duration = v.duration || 0; resolve(item); };
      v.onerror = function () { resolve(item); };
      setTimeout(function () { resolve(item); }, 2000);
      v.src = url;
    });
  }

  async function onFiles(e) {
    var files = e.target && e.target.files;
    if (!files || !files.length) return;
    var arr = Array.prototype.slice.call(files);
    var picked = [];
    for (var i = 0; i < arr.length; i++) {
      picked.push(await fileToItem(arr[i]));
    }
    try { e.target.value = ''; } catch (err) {}
    selected = picked.slice(0, 10);
    goAfterPick();
  }

  function goAfterPick() {
    if (!selected.length) return;
    if (MODE === 'story') {
      paintStory();
      setStep('story');
    } else {
      paintCompose();
      setStep('compose');
    }
  }

  function paintCompose() {
    var box = $('mpComposePreview');
    if (!box || !selected[0]) return;
    box.innerHTML = '';
    try { if (typeof window.tchiloSyncCreateMediaForMusic === 'function') window.tchiloSyncCreateMediaForMusic(selected[0]); } catch (eSync) {}
    var m = selected[0];
    if (m.type === 'video') {
      var v = document.createElement('video');
      v.src = m.url;
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.style.width='100%';v.style.height='100%';v.style.objectFit='cover';
      v.muted = false;
      box.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.src = m.url;
      img.style.width='100%';img.style.height='100%';img.style.objectFit='cover';
      img.alt = '';
      box.appendChild(img);
    }
  }

  function paintStory() {
    var box = $('mpStoryPreview');
    if (!box) return;
    box.innerHTML = '';
    if (!selected[0]) {
      box.innerHTML = '<div class="mp-empty">Escolhe uma foto ou vídeo</div>';
      return;
    }
    var m = selected[0];
    if (m.type === 'video') {
      var v = document.createElement('video');
      v.src = m.url;
      v.autoplay = true;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      box.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.src = m.url;
      img.alt = '';
      box.appendChild(img);
    }
  }

  function syncThemePreview() {
    var title = ($('mpThemeTitle').value || '').trim();
    var text = ($('mpThemeText').value || '').trim();
    var el = $('mpThemePreview');
    el.style.background = themeBg;
    el.style.color = (themeBg === '#0B0B0C' || themeBg === '#FF4B75') ? '#fff' : '#0B0B0C';
    if (!title && !text) el.textContent = 'Escreve algo…';
    else el.innerHTML = (title ? title + (text ? '<br>' : '') : '') + (text || '');
  }

  async function openCameraEffects() {
    window.__tchiloCreateFlowActive = true;
    // Prefer in-app camera with effects
    if (typeof window.tchiloOpenCamera === 'function') {
      closePicker(false);
      window.tchiloOpenCamera();
      return;
    }
    if (typeof window.openFaceEffects === 'function') {
      closePicker(false);
      window.openFaceEffects();
      return;
    }
    var Cam = getCamera();
    if (Cam && typeof Cam.getPhoto === 'function') {
      try {
        var photo = await Cam.getPhoto({ quality: 92, resultType: 'uri', source: 'CAMERA', correctOrientation: true });
        var path = photo.webPath || photo.path;
        if (path) {
          var resp = await fetch(path);
          var blob = await resp.blob();
          var file = new File([blob], 'camera.jpg', { type: blob.type || 'image/jpeg' });
          selected = [await fileToItem(file)];
          goAfterPick();
          return;
        }
      } catch (e) {}
    }
    var cam = $('mpCamInput');
    if (cam) cam.click();
  }

  function openGalleryPicker() {
    if (nativeGallery()) {
      // already showing recent grid — also allow system file picker
      var inp = $('mpFileInput');
      if (inp) inp.click();
      return;
    }
    var inp2 = $('mpFileInput');
    if (inp2) inp2.click();
  }

  async function resolveFiles(list) {
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (s.file) {
        out.push(s);
        continue;
      }
      try {
        var resp = await fetch(s.url);
        var blob = await resp.blob();
        var file = new File([blob], (s.name || 'media') + (s.type === 'video' ? '.mp4' : '.jpg'), {
          type: blob.type || (s.type === 'video' ? 'video/mp4' : 'image/jpeg')
        });
        out.push({
          id: s.id,
          type: s.type,
          url: URL.createObjectURL(file),
          file: file,
          name: file.name,
          duration: s.duration || 0
        });
      } catch (e) {
        out.push(s);
      }
    }
    return out;
  }

  function animatePublish(done) {
    setStep('publishing');
    publishPct = 0;
    $('mpPct').textContent = '0%';
    $('mpPubLabel').textContent = 'A publicar…';
    var t0 = Date.now();
    var dur = 1600;
    function tick() {
      var p = Math.min(1, (Date.now() - t0) / dur);
      // ease out
      var e = 1 - Math.pow(1 - p, 3);
      publishPct = Math.round(e * 100);
      $('mpPct').textContent = publishPct + '%';
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        $('mpPubLabel').textContent = 'Concluído';
        setTimeout(done, 280);
      }
    }
    requestAnimationFrame(tick);
  }

  async function doPublish() {
    if (STEP === 'theme') {
      var title = ($('mpThemeTitle').value || '').trim();
      var text = ($('mpThemeText').value || '').trim();
      if (!title && !text) {
        toast('Escreve um texto');
        return;
      }
      animatePublish(function () {
        // try existing themed story/post helpers
        try {
          if (typeof publishThemedStory === 'function') {
            var st = document.getElementById('storyThemeTitle');
            var stx = document.getElementById('storyThemeText');
            if (st) st.value = title;
            if (stx) stx.value = text;
            publishThemedStory();
          } else if (typeof publishPost === 'function') {
            window.createMediaData = {
              type: 'theme',
              theme: themeBg,
              title: title,
              text: text,
              items: []
            };
            var cap = document.getElementById('createCaption');
            if (cap) cap.value = text || title;
            publishPost();
          }
        } catch (e) {}
        finishAndReturn();
      });
      return;
    }

    if (STEP === 'compose' || STEP === 'story') {
      if (!selected.length) {
        toast('Escolhe uma foto ou vídeo');
        return;
      }
      var list = await resolveFiles(selected);
      var caption = STEP === 'story'
        ? (($('mpStoryCaption').value || '').trim())
        : (($('mpCaption').value || '').trim());

      window.__tchiloPendingMedia = list[0];
      window.createMediaFiles = list.map(function (x) { return x.file; }).filter(Boolean);
      window.createMediaData = {
        type: list[0].type,
        items: list,
        src: list[0].url,
        file: list[0].file,
        caption: caption,
        mode: STEP === 'story' ? 'story' : 'post'
      };
      try { (0, eval)('createMediaData = window.createMediaData'); } catch (e) {}

      animatePublish(function () {
        try {
          if (STEP === 'story' && typeof publishStory === 'function') {
            publishStory();
          } else if (typeof publishPost === 'function') {
            var capEl = document.getElementById('createCaption');
            if (capEl) capEl.value = caption;
            // paint create preview then publish
            var preview = document.getElementById('createPreview');
            if (preview && list[0]) {
              preview.classList.add('has-media');
              preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) {
                try { n.remove(); } catch (e) {}
              });
              if (list[0].type === 'video') {
                var v = document.createElement('video');
                v.src = list[0].url;
                preview.appendChild(v);
              } else {
                var img = document.createElement('img');
                img.src = list[0].url;
                preview.appendChild(img);
              }
            }
            publishPost();
          }
        } catch (e) {
          console.warn(e);
        }
        finishAndReturn();
      });
    }
  }

  function finishAndReturn() {
    closePicker(true);
    try {
      if (typeof goTo === 'function') goTo(returnScreen || 'feed');
    } catch (e) {}
  }

  function onClick(e) {
    var t = e.target.closest('[data-a]');
    if (!t) return;
    var a = t.getAttribute('data-a');

    if (a === 'back') {
      if (STEP === 'hub') closePicker(true);
      else if (STEP === 'publishing') return;
      else {
        selected = [];
        setStep('hub');
        loadRecent(false);
      }
      return;
    }
    if (a === 'theme') {
      setCreateMode('theme');
      return;
    }
    if (a === 'story-mode') {
      setCreateMode(MODE === 'story' ? 'post' : 'story');
      return;
    }
    if (a === 'camera') {
      openCameraEffects();
      return;
    }
    if (a === 'gallery') {
      openGalleryPicker();
      return;
    }
    if (a === 'pick') {
      var id = t.getAttribute('data-id');
      var it = items.find(function (x) { return x.id === id; });
      if (!it) return;
      // single select for flow (multi optional: toggle)
      selected = [it];
      goAfterPick();
      return;
    }
    if (a === 'swatch') {
      themeBg = t.getAttribute('data-color') || themeBg;
      document.querySelectorAll('#mpThemeColors .mp-swatch').forEach(function (el) {
        el.classList.toggle('on', el === t);
      });
      syncThemePreview();
      return;
    }
    if (a === 'music') {
      if (typeof window.tchiloOpenCreateMusic === 'function') window.tchiloOpenCreateMusic(selected[0]);
      else if (typeof window.tchiloOpenPostMusic === 'function') {
        try { if (typeof window.tchiloSyncCreateMediaForMusic === 'function') window.tchiloSyncCreateMediaForMusic(selected[0]); } catch (e) {}
        window.tchiloOpenPostMusic();
      }
      return;
    }
    if (a === 'crop') {
      if (typeof window.tchiloOpenCreateCrop === 'function') window.tchiloOpenCreateCrop(selected[0]);
      else toast('Cortar');
      return;
    }
    if (a === 'do-publish') {
      doPublish();
    }
  }

  function openPicker(opts) {
    window.__tchiloCreateFlowActive = true;
    opts = opts || {};
    if (opts.mode) MODE = opts.mode;
    rememberReturn();
    ensureDOM();
    selected = [];
    setStep('hub');
    $('tchiloMediaPicker').classList.add('open');
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    loadRecent(true);
  }

  function closePicker(restoreScroll) {
    var el = $('tchiloMediaPicker');
    if (el) el.classList.remove('open');
    if (restoreScroll !== false) {
      try { document.body.style.overflow = ''; } catch (e) {}
    }
  }

  // Allow camera pipeline to hand media back into this flow
  window.tchiloReceiveCreateMedia = function (fileOrItem) {
    ensureDOM();
    function go(item) {
      selected = [item];
      $('tchiloMediaPicker').classList.add('open');
      goAfterPick();
    }
    if (fileOrItem && fileOrItem.file) {
      go(fileOrItem);
    } else if (fileOrItem instanceof File || (fileOrItem && fileOrItem.name && fileOrItem.size != null)) {
      fileToItem(fileOrItem).then(go);
    } else if (fileOrItem && fileOrItem.url) {
      go({
        id: uid(),
        url: fileOrItem.url,
        thumb: fileOrItem.url,
        type: fileOrItem.type || 'image',
        file: fileOrItem.file || null,
        name: fileOrItem.name || 'media',
        duration: fileOrItem.duration || 0
      });
    }
  };

  window.tchiloOpenMediaPicker = openPicker;
  window.tchiloCloseMediaPicker = closePicker;

  function wirePlus() {
    document.querySelectorAll('.nav-post, #navPost').forEach(function (btn) {
      if (btn.__mpWired3) return;
      btn.__mpWired3 = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openPicker({ mode: 'post' });
      }, true);
    });
    if (!window.__mpGoToWrap3 && typeof window.goTo === 'function') {
      window.__mpGoToWrap3 = true;
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
  setTimeout(boot, 1600);
})();
