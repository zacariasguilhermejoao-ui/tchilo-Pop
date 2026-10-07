/**
 * Story: NAO publicar ao escolher media — mostra preview + Publicar / Cancelar
 */
(function () {
  'use strict';
  if (window.__tchiloStoryPickFixV1) return;
  window.__tchiloStoryPickFixV1 = true;

  var pending = null; /* { media, mediaType, objectUrl? } */

  function injectUI() {
    if (document.getElementById('tchiloStoryPreview')) return;
    var st = document.createElement('style');
    st.id = 'tchiloStoryPreviewCSS';
    st.textContent =
      '#tchiloStoryPreview{display:none;position:fixed;inset:0;z-index:300;background:#000;flex-direction:column;}' +
      '#tchiloStoryPreview.open{display:flex!important;}' +
      '#tchiloStoryPreview .tsp-top{display:flex;align-items:center;justify-content:space-between;' +
      'padding:calc(12px + env(safe-area-inset-top)) 14px 10px;color:#fff;}' +
      '#tchiloStoryPreview .tsp-top button{background:none;border:0;color:#fff;font:700 15px system-ui,sans-serif;padding:8px 12px;cursor:pointer;}' +
      '#tchiloStoryPreview .tsp-body{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;}' +
      '#tchiloStoryPreview .tsp-body img,#tchiloStoryPreview .tsp-body video{' +
      'max-width:100%;max-height:100%;object-fit:contain;}' +
      '#tchiloStoryPreview .tsp-bottom{padding:12px 16px calc(18px + env(safe-area-inset-bottom));display:flex;gap:10px;}' +
      '#tchiloStoryPreview .tsp-pub{flex:1;padding:14px;border:0;border-radius:12px;background:#fff;color:#0B0B0C;' +
      'font:800 15px system-ui,sans-serif;cursor:pointer;}' +
      '#tchiloStoryPreview .tsp-cancel{padding:14px 18px;border:1.5px solid rgba(255,255,255,.5);border-radius:12px;' +
      'background:transparent;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer;}';
    document.head.appendChild(st);

    var el = document.createElement('div');
    el.id = 'tchiloStoryPreview';
    el.innerHTML =
      '<div class="tsp-top">' +
      '<button type="button" id="tspClose" aria-label="Fechar">Cancelar</button>' +
      '<span style="font:700 15px system-ui,sans-serif">Novo story</span>' +
      '<span style="width:72px"></span></div>' +
      '<div class="tsp-body" id="tspBody"></div>' +
      '<div class="tsp-bottom">' +
      '<button type="button" class="tsp-cancel" id="tspCancel">Voltar</button>' +
      '<button type="button" class="tsp-pub" id="tspPublish">Publicar</button>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('tspClose').onclick = closePreview;
    document.getElementById('tspCancel').onclick = closePreview;
    document.getElementById('tspPublish').onclick = function () {
      doPublish();
    };
  }

  function closePreview() {
    try {
      var el = document.getElementById('tchiloStoryPreview');
      if (el) el.classList.remove('open');
      var body = document.getElementById('tspBody');
      if (body) body.innerHTML = '';
      if (pending && pending.objectUrl) {
        try { URL.revokeObjectURL(pending.objectUrl); } catch (e) {}
      }
      pending = null;
    } catch (e) {}
  }

  function openPreview(media, mediaType, objectUrl) {
    injectUI();
    pending = { media: media, mediaType: mediaType, objectUrl: objectUrl || null };
    var body = document.getElementById('tspBody');
    body.innerHTML = '';
    if (mediaType === 'video') {
      var v = document.createElement('video');
      v.src = media;
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.autoplay = true;
      v.muted = true;
      v.loop = true;
      body.appendChild(v);
      try { v.play().catch(function () {}); } catch (e) {}
    } else {
      var img = document.createElement('img');
      img.src = media;
      img.alt = 'Story';
      body.appendChild(img);
    }
    document.getElementById('tchiloStoryPreview').classList.add('open');
  }

  function doPublish() {
    if (!pending || !pending.media) {
      closePreview();
      return;
    }
    var data = { media: pending.media, mediaType: pending.mediaType, text: '' };
    pending = null;
    closePreview();
    try {
      if (typeof publishStory === 'function') {
        publishStory(data);
      } else if (typeof window.publishStory === 'function') {
        window.publishStory(data);
      }
    } catch (e) {
      console.error('[story-pick]', e);
      try {
        if (typeof showToast === 'function') showToast('Erro ao publicar story');
      } catch (e2) {}
    }
  }

  function handlePicked(event) {
    try {
      if (typeof closeStoryCreateSheet === 'function') closeStoryCreateSheet();
    } catch (e) {}
    var input = event && event.target;
    var file = input && input.files && input.files[0];
    if (!file) return;

    var isVideo = file.type && file.type.indexOf('video') === 0;
    if (isVideo) {
      var url = URL.createObjectURL(file);
      openPreview(url, 'video', url);
      if (input) input.value = '';
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      var src = reader.result;
      var img = new Image();
      img.onload = function () {
        try {
          var max = 1600;
          var scale = Math.min(
            1,
            max / Math.max(img.naturalWidth || img.width || 1, img.naturalHeight || img.height || 1)
          );
          var w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
          var h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          var data = canvas.toDataURL('image/jpeg', 0.88);
          openPreview(data, 'image');
        } catch (err) {
          openPreview(src, 'image');
        }
        if (input) input.value = '';
      };
      img.onerror = function () {
        openPreview(src, 'image');
        if (input) input.value = '';
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  function install() {
    window.onStoryMediaPicked = handlePicked;
    /* tambem escuta o input por se o onchange inline falhar */
    var input = document.getElementById('storyMediaInput');
    if (input && !input.__tchiloPickFix) {
      input.__tchiloPickFix = true;
      input.addEventListener('change', function (e) {
        handlePicked(e);
      });
    }
  }

  install();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  setTimeout(install, 400);
  setTimeout(install, 1500);
})();
