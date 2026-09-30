/**
 * Tchilo — Share Target (receber partilha do sistema)
 * Foto/vídeo → Postar | Story | Mensagem
 * Outros ficheiros → Mensagem
 * Web PWA (manifest share_target) + Android nativo (intent SEND)
 */
(function () {
  'use strict';
  if (window.__tchiloShareTargetV1) return;
  window.__tchiloShareTargetV1 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
      else console.log('[Tchilo Share]', msg);
    } catch (e) {}
  }

  function isImageMime(m) {
    return String(m || '').toLowerCase().indexOf('image/') === 0;
  }
  function isVideoMime(m) {
    return String(m || '').toLowerCase().indexOf('video/') === 0;
  }
  function isMediaMime(m) {
    return isImageMime(m) || isVideoMime(m);
  }
  function isVideoName(n) {
    return /\.(mp4|mov|m4v|webm|3gp|mkv)$/i.test(String(n || ''));
  }
  function isImageName(n) {
    return /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(String(n || ''));
  }

  function classifyItem(item) {
    var mime = item.mime || item.type || '';
    var name = item.name || item.filename || '';
    if (isVideoMime(mime) || isVideoName(name)) return 'video';
    if (isImageMime(mime) || isImageName(name)) return 'image';
    if (item.kind === 'video') return 'video';
    if (item.kind === 'image') return 'image';
    return 'file';
  }

  function dataUrlToFile(dataUrl, filename, mime) {
    try {
      var parts = String(dataUrl).split(',');
      var meta = parts[0] || '';
      var b64 = parts[1] || '';
      var m = mime || (meta.match(/data:([^;]+)/) || [])[1] || 'application/octet-stream';
      var bin = atob(b64);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new File([arr], filename || 'shared.bin', { type: m });
    } catch (e) {
      console.warn('[Tchilo Share] dataUrlToFile', e);
      return null;
    }
  }

  function blobToFile(blob, filename, mime) {
    try {
      return new File([blob], filename || 'shared.bin', {
        type: mime || blob.type || 'application/octet-stream'
      });
    } catch (e) {
      return null;
    }
  }

  async function normalizePayload(raw) {
    var out = {
      title: (raw && raw.title) || '',
      text: (raw && raw.text) || '',
      url: (raw && raw.url) || '',
      items: []
    };
    var files = (raw && (raw.files || raw.items || raw.media)) || [];
    if (!Array.isArray(files) && files) files = [files];

    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!f) continue;
      if (f instanceof File || f instanceof Blob) {
        var fileObj = f instanceof File ? f : blobToFile(f, f.name || 'shared.bin', f.type);
        if (fileObj) {
          out.items.push({
            file: fileObj,
            name: fileObj.name,
            mime: fileObj.type,
            kind: classifyItem({ mime: fileObj.type, name: fileObj.name }),
            url: URL.createObjectURL(fileObj)
          });
        }
        continue;
      }
      if (f.dataUrl || f.dataURL) {
        var du = f.dataUrl || f.dataURL;
        var nm = f.name || f.filename || 'shared.bin';
        var mm = f.mime || f.type || '';
        var converted = dataUrlToFile(du, nm, mm);
        if (converted) {
          out.items.push({
            file: converted,
            name: converted.name,
            mime: converted.type,
            kind: classifyItem({ mime: converted.type, name: converted.name }),
            url: URL.createObjectURL(converted)
          });
        }
        continue;
      }
      if (f.uri || f.path) {
        out.items.push({
          uri: f.uri || f.path,
          name: f.name || f.filename || 'shared',
          mime: f.mime || f.type || '',
          kind: classifyItem(f),
          url: f.uri || f.path
        });
      }
    }

    if (!out.items.length && (out.text || out.url || out.title)) {
      out.items.push({
        kind: 'text',
        text: [out.title, out.text, out.url].filter(Boolean).join('\n'),
        name: 'texto'
      });
    }
    return out;
  }

  function setCreateMedia(item) {
    if (!item || !item.file) return false;
    var kind = item.kind === 'video' ? 'video' : 'image';
    var url = item.url || URL.createObjectURL(item.file);
    var mediaItem = {
      type: kind,
      url: url,
      file: item.file,
      name: item.name || item.file.name,
      size: item.file.size || 0,
      mime: item.mime || item.file.type
    };
    window.__tchiloPendingMedia = mediaItem;
    window.createMediaFiles = [item.file];
    window.createMediaData = {
      type: kind,
      items: [mediaItem],
      src: url,
      file: item.file
    };
    try {
      (0, eval)('createMediaData = window.createMediaData');
    } catch (e) {}
    return true;
  }

  function paintCreatePreview(item) {
    var preview = document.getElementById('createPreview');
    if (!preview || !item) return;
    preview.classList.add('has-media');
    Array.prototype.forEach.call(
      preview.querySelectorAll('img,video,.multi-preview,.tchilo-pick-layer'),
      function (n) {
        try {
          n.remove();
        } catch (e) {}
      }
    );
    var layer = document.createElement('div');
    layer.className = 'tchilo-pick-layer';
    layer.style.cssText =
      'position:absolute;inset:0;z-index:6;background:#000;display:flex;align-items:center;justify-content:center;';
    if (item.kind === 'video') {
      var v = document.createElement('video');
      v.src = item.url;
      v.controls = true;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;background:#000;';
      layer.appendChild(v);
    } else if (item.kind === 'image') {
      var img = document.createElement('img');
      img.src = item.url;
      img.alt = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      layer.appendChild(img);
    }
    preview.appendChild(layer);
    var rm = document.getElementById('removeMediaBtn');
    if (rm) rm.style.display = '';
  }

  function goCreateWithMedia(item) {
    if (!setCreateMedia(item)) {
      toast('Não foi possível abrir a media');
      return;
    }
    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e) {}
    setTimeout(function () {
      paintCreatePreview(item);
    }, 80);
    setTimeout(function () {
      paintCreatePreview(item);
    }, 300);
    toast(item.kind === 'video' ? 'Vídeo pronto a publicar' : 'Foto pronta a publicar');
  }

  function goStoryWithMedia(item) {
    /* Story: reutiliza create se não houver ecrã dedicado */
    try {
      if (typeof window.openStoryComposer === 'function') {
        setCreateMedia(item);
        window.openStoryComposer(item);
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.tchiloOpenStoryWithMedia === 'function') {
        window.tchiloOpenStoryWithMedia(item);
        return;
      }
    } catch (e2) {}
    /* fallback: criar post com legenda a indicar story */
    goCreateWithMedia(item);
    setTimeout(function () {
      var cap = document.getElementById('createCaption');
      if (cap && !cap.value) cap.value = '';
      var title = document.getElementById('createTitle');
      if (title && !title.value) title.value = 'STORY';
      toast('Abre como publicação — usa Stories quando disponível');
    }, 200);
  }

  function goMessageWithPayload(payload) {
    try {
      if (typeof goTo === 'function') goTo('messages');
    } catch (e) {}
    window.__tchiloPendingShareMessage = payload;
    try {
      window.dispatchEvent(
        new CustomEvent('tchilo-share-message', { detail: payload })
      );
    } catch (e2) {}
    toast('Abre uma conversa e envia o anexo');
    /* tenta preencher composer de mensagem se existir */
    setTimeout(function () {
      tryAttachToChatComposer(payload);
    }, 400);
    setTimeout(function () {
      tryAttachToChatComposer(payload);
    }, 1200);
  }

  function tryAttachToChatComposer(payload) {
    var item = payload.items && payload.items[0];
    if (!item) {
      var text = payload.text || payload.url || payload.title || '';
      var input =
        document.querySelector('#screen-messages textarea') ||
        document.querySelector('#screen-messages input[type="text"]') ||
        document.querySelector('.msg-input, .chat-input, #msgInput');
      if (input && text) {
        input.value = text;
        try {
          input.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) {}
      }
      return;
    }
    if (item.file) {
      window.__tchiloChatPendingFile = item.file;
      window.__tchiloChatPendingItem = item;
      try {
        var fileInput =
          document.querySelector('#screen-messages input[type="file"]') ||
          document.querySelector('.chat-file-input, #chatFileInput');
        if (fileInput && typeof DataTransfer !== 'undefined') {
          var dt = new DataTransfer();
          dt.items.add(item.file);
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } catch (e3) {}
    }
  }

  function ensureCSS() {
    if (document.getElementById('tchiloShareTargetCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloShareTargetCSS';
    st.textContent =
      '#tchiloShareTargetSheet{position:fixed;inset:0;z-index:2147483600;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.55);}' +
      '#tchiloShareTargetSheet.open{display:flex!important;}' +
      '#tchiloShareTargetSheet .sheet{width:100%;max-width:480px;background:#fff;color:#0B0B0C;border-radius:22px 22px 0 0;padding:18px 16px 28px;border:3px solid #0B0B0C;border-bottom:none;box-shadow:0 -8px 40px rgba(0,0,0,.35);}' +
      '#tchiloShareTargetSheet h3{margin:0 0 6px;font-size:18px;font-weight:900;text-align:center;}' +
      '#tchiloShareTargetSheet .sub{text-align:center;font-size:13px;opacity:.7;margin:0 0 14px;}' +
      '#tchiloShareTargetSheet .preview{display:flex;justify-content:center;margin:0 0 14px;}' +
      '#tchiloShareTargetSheet .preview img,#tchiloShareTargetSheet .preview video{max-width:120px;max-height:120px;border-radius:12px;border:2px solid #0B0B0C;object-fit:cover;}' +
      '#tchiloShareTargetSheet .opt{display:flex;align-items:center;gap:12px;width:100%;padding:14px 12px;margin:0 0 8px;border-radius:14px;border:2px solid #0B0B0C;background:#fff;font-weight:800;font-size:15px;cursor:pointer;text-align:left;color:#0B0B0C;}' +
      '#tchiloShareTargetSheet .opt .ic{width:40px;height:40px;border-radius:12px;background:#c8f560;color:#0B0B0C;display:flex;align-items:center;justify-content:center;flex:0 0 auto;font-size:18px;}' +
      '#tchiloShareTargetSheet .opt.cancel{background:#f3f1e9;}' +
      '#tchiloShareTargetSheet .file-name{font-size:12px;opacity:.65;word-break:break-all;text-align:center;margin:-6px 0 12px;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function closeSheet() {
    var el = document.getElementById('tchiloShareTargetSheet');
    if (el) el.classList.remove('open');
  }

  function openActionSheet(payload) {
    ensureCSS();
    var hasMedia = payload.items.some(function (it) {
      return it.kind === 'image' || it.kind === 'video';
    });
    var first = payload.items[0];
    var label =
      first && first.name
        ? first.name
        : payload.title || payload.text || payload.url || 'Conteúdo partilhado';

    var wrap = document.getElementById('tchiloShareTargetSheet');
    if (wrap) wrap.remove();
    wrap = document.createElement('div');
    wrap.id = 'tchiloShareTargetSheet';
    wrap.className = 'open';

    var previewHtml = '';
    if (first && (first.kind === 'image' || first.kind === 'video') && first.url) {
      if (first.kind === 'video') {
        previewHtml =
          '<div class="preview"><video src="' +
          String(first.url).replace(/"/g, '') +
          '" muted playsinline></video></div>';
      } else {
        previewHtml =
          '<div class="preview"><img src="' +
          String(first.url).replace(/"/g, '') +
          '" alt=""/></div>';
      }
    }

    var opts = '';
    if (hasMedia) {
      opts +=
        '<button type="button" class="opt" data-act="post"><span class="ic">📷</span><span>Postar</span></button>' +
        '<button type="button" class="opt" data-act="story"><span class="ic">⭕</span><span>Story</span></button>';
    }
    opts +=
      '<button type="button" class="opt" data-act="message"><span class="ic">💬</span><span>Enviar como mensagem</span></button>' +
      '<button type="button" class="opt cancel" data-act="close"><span class="ic">✕</span><span>Cancelar</span></button>';

    wrap.innerHTML =
      '<div class="sheet" role="dialog" aria-label="Partilhar no Tchilo">' +
      '<h3>Tchilo</h3>' +
      '<p class="sub">O que queres fazer?</p>' +
      previewHtml +
      '<div class="file-name">' +
      String(label).replace(/</g, '&lt;').slice(0, 120) +
      '</div>' +
      opts +
      '</div>';

    document.body.appendChild(wrap);
    wrap.addEventListener(
      'click',
      function (e) {
        if (e.target === wrap) closeSheet();
      },
      true
    );

    wrap.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var act = btn.getAttribute('data-act');
        if (act === 'close') {
          closeSheet();
          return;
        }
        closeSheet();
        if (act === 'post' && first) goCreateWithMedia(first);
        else if (act === 'story' && first) goStoryWithMedia(first);
        else if (act === 'message') goMessageWithPayload(payload);
      });
    });
  }

  async function handleSharePayload(raw) {
    if (!raw) return;
    try {
      var payload = await normalizePayload(raw);
      if (!payload.items.length && !payload.text && !payload.url) {
        toast('Nada para partilhar');
        return;
      }
      window.__tchiloLastSharePayload = payload;
      openActionSheet(payload);
    } catch (err) {
      console.warn('[Tchilo Share]', err);
      toast('Erro ao processar partilha');
    }
  }

  window.TchiloShareTarget = {
    handle: handleSharePayload,
    open: openActionSheet
  };

  /* —— Web PWA: /share-target (GET query ou POST via SW/form) —— */
  function checkWebShareTarget() {
    try {
      var path = (location.pathname || '').replace(/\/+$/, '') || '/';
      if (path !== '/share-target') return;

      var params = new URLSearchParams(location.search || '');
      var raw = {
        title: params.get('title') || '',
        text: params.get('text') || '',
        url: params.get('url') || '',
        files: []
      };

      /* launchQueue (File Handling / share) */
      if (window.launchQueue && typeof window.launchQueue.setConsumer === 'function') {
        window.launchQueue.setConsumer(function (launchParams) {
          try {
            if (launchParams && launchParams.files && launchParams.files.length) {
              Promise.all(
                Array.from(launchParams.files).map(function (fh) {
                  return fh.getFile ? fh.getFile() : Promise.resolve(null);
                })
              ).then(function (files) {
                raw.files = files.filter(Boolean);
                handleSharePayload(raw);
              });
              return;
            }
          } catch (e) {}
          handleSharePayload(raw);
        });
      } else {
        handleSharePayload(raw);
      }

      /* limpa URL para não reabrir o sheet */
      try {
        history.replaceState(null, '', '/');
      } catch (e2) {}
    } catch (e) {}
  }

  /* —— Android nativo: payload injectado pelo MainActivity —— */
  function checkNativeShare() {
    try {
      if (window.__tchiloSharePayload) {
        var p = window.__tchiloSharePayload;
        window.__tchiloSharePayload = null;
        handleSharePayload(p);
        return true;
      }
    } catch (e) {}
    return false;
  }

  /* Capacitor App plugin — alguns builds enviam via URL custom */
  function wireCapacitor() {
    try {
      var Cap = window.Capacitor;
      if (!Cap || !Cap.Plugins || !Cap.Plugins.App) return;
      var App = Cap.Plugins.App;
      App.addListener('appUrlOpen', function (data) {
        if (!data || !data.url) return;
        var u = String(data.url);
        if (u.indexOf('share-target') >= 0 || u.indexOf('tchilo://share') === 0) {
          try {
            var q = u.split('?')[1] || '';
            var params = new URLSearchParams(q);
            handleSharePayload({
              title: params.get('title') || '',
              text: params.get('text') || '',
              url: params.get('url') || '',
              files: []
            });
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  /* polling leve para payload nativo (MainActivity injecta após load) */
  var polls = 0;
  var pollIv = setInterval(function () {
    if (checkNativeShare() || ++polls > 40) clearInterval(pollIv);
  }, 250);

  window.addEventListener('tchilo-native-share', function (ev) {
    if (ev && ev.detail) handleSharePayload(ev.detail);
  });

  function boot() {
    checkWebShareTarget();
    checkNativeShare();
    wireCapacitor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setTimeout(boot, 600);
  setTimeout(boot, 1500);
})();
