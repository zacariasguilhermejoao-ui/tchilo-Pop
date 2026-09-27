/**
 * Tchilo — vídeos da galeria aparecem no criar post + formato cloud
 */
(function () {
  'use strict';
  if (window.__tchiloGalVideoFixV1) return;
  window.__tchiloGalVideoFixV1 = true;

  function isVideoFile(file) {
    if (!file) return false;
    var t = (file.type || '').toLowerCase();
    if (t.indexOf('video/') === 0) return true;
    var n = (file.name || '').toLowerCase();
    return /\.(mp4|mov|webm|m4v|3gp|mkv)$/i.test(n);
  }

  function isImageFile(file) {
    if (!file) return false;
    var t = (file.type || '').toLowerCase();
    if (t.indexOf('image/') === 0) return true;
    var n = (file.name || '').toLowerCase();
    return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(n);
  }

  function showToastSafe(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
    } catch (e) {}
  }

  function paintCreatePreview(items) {
    var preview = document.getElementById('createPreview');
    if (!preview || !items || !items.length) return;
    preview.classList.add('has-media');
    preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) {
      try {
        n.remove();
      } catch (e) {}
    });
    if (items.length === 1) {
      var m = items[0];
      if (m.type === 'video') {
        var v = document.createElement('video');
        v.src = m.url;
        v.muted = true;
        v.loop = true;
        v.autoplay = true;
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.controls = true;
        v.style.cssText = 'width:100%;max-height:360px;object-fit:contain;background:#000;border-radius:12px;';
        preview.appendChild(v);
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        var img = document.createElement('img');
        img.src = m.url;
        img.alt = 'preview';
        img.style.cssText = 'width:100%;max-height:360px;object-fit:contain;border-radius:12px;';
        preview.appendChild(img);
      }
    } else {
      var wrap = document.createElement('div');
      wrap.className = 'multi-preview';
      items.forEach(function (m) {
        if (m.type === 'video') {
          var vv = document.createElement('video');
          vv.src = m.url;
          vv.muted = true;
          vv.playsInline = true;
          wrap.appendChild(vv);
        } else {
          var ii = document.createElement('img');
          ii.src = m.url;
          ii.alt = 'preview';
          wrap.appendChild(ii);
        }
      });
      preview.appendChild(wrap);
    }
    try {
      if (typeof setThemeSectionVisible === 'function') setThemeSectionVisible(false);
    } catch (e) {}
  }

  function applyFiles(files) {
    var list = Array.prototype.slice.call(files || []).filter(function (f) {
      return isVideoFile(f) || isImageFile(f);
    });
    if (!list.length) {
      showToastSafe('Escolhe uma foto ou um vídeo');
      return false;
    }
    var hasVideo = list.some(isVideoFile);
    if (hasVideo && list.length > 1) {
      showToastSafe('Vídeo só pode ser publicado sozinho');
      return false;
    }
    for (var i = 0; i < list.length; i++) {
      if (isVideoFile(list[i]) && list[i].size > 80 * 1024 * 1024) {
        showToastSafe('Vídeo demasiado grande (máx. ~80 MB)');
        return false;
      }
    }

    var items = list.map(function (file) {
      var vid = isVideoFile(file);
      var url = URL.createObjectURL(file);
      return {
        type: vid ? 'video' : 'image',
        url: url,
        name: file.name || (vid ? 'galeria.mp4' : 'galeria.jpg'),
        file: file,
        size: file.size || 0,
        mime: file.type || (vid ? 'video/mp4' : 'image/jpeg')
      };
    });

    window.createMediaData = {
      type: items[0].type,
      items: items,
      src: items[0].url,
      file: items[0].file
    };
    window.createMediaFiles = list;

    paintCreatePreview(items);
    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e) {}
    setTimeout(function () {
      paintCreatePreview(items);
    }, 150);
    setTimeout(function () {
      paintCreatePreview(items);
    }, 500);
    return true;
  }

  function patchOnMediaPicked() {
    if (typeof window.onMediaPicked !== 'function' || window.onMediaPicked.__galVid) return;
    var orig = window.onMediaPicked;
    window.onMediaPicked = function (event) {
      try {
        var files = event && event.target && event.target.files;
        if (files && files.length) {
          var ok = applyFiles(files);
          try {
            event.target.value = '';
          } catch (e) {}
          if (ok) return;
        }
      } catch (e) {
        console.warn('gal video', e);
      }
      return orig.apply(this, arguments);
    };
    window.onMediaPicked.__galVid = true;
  }

  /* input da câmera-galeria (tchiloCamGalInput) */
  function bindCamGalInput() {
    var input = document.getElementById('tchiloCamGalInput');
    if (!input || input.__galVidBound) return;
    input.__galVidBound = true;
    input.accept = 'image/*,video/*';
    input.addEventListener(
      'change',
      function (e) {
        var files = e.target.files;
        e.target.value = '';
        if (!files || !files.length) return;
        applyFiles(files);
        try {
          if (typeof window.tchiloCloseCamera === 'function') window.tchiloCloseCamera();
        } catch (err) {}
      },
      true
    );
  }

  /* mediaInput principal */
  function bindMediaInput() {
    var input = document.getElementById('mediaInput');
    if (!input || input.__galVidBound) return;
    input.__galVidBound = true;
    input.accept = 'image/*,video/*';
    input.addEventListener(
      'change',
      function (e) {
        /* onMediaPicked já trata; reforço se falhar */
        setTimeout(function () {
          if (!window.createMediaData || !window.createMediaData.items || !window.createMediaData.items.length) {
            if (e.target.files && e.target.files.length) applyFiles(e.target.files);
          }
        }, 50);
      },
      true
    );
  }

  function boot() {
    patchOnMediaPicked();
    bindCamGalInput();
    bindMediaInput();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setInterval(boot, 4000);
})();
