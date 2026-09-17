/**
 * tchilo-Pop — foto da câmara com efeitos → editor / criar post
 */
(function () {
  'use strict';

  function blobToFile(blob, name) {
    name = name || 'tchilo-face-fx.jpg';
    try {
      return new File([blob], name, {
        type: blob.type || 'image/jpeg',
        lastModified: Date.now()
      });
    } catch (e) {
      try {
        blob.name = name;
        blob.lastModified = Date.now();
      } catch (e2) {}
      return blob;
    }
  }

  function setFileInput(file) {
    var selectors = [
      '#createFileInput',
      '#createMediaInput',
      '#galleryInput',
      '#screen-create input[type="file"]',
      'input[type="file"][accept*="image"]'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var input = document.querySelector(selectors[i]);
      if (!input) continue;
      try {
        var dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (e) {}
    }
    return false;
  }

  function showCreatePreview(url) {
    var preview =
      document.getElementById('createPreview') ||
      document.querySelector('#screen-create .create-preview');
    if (!preview) return;
    preview.classList.add('has-media');
    preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) {
      try {
        n.remove();
      } catch (e) {}
    });
    var img = document.createElement('img');
    img.src = url;
    img.alt = 'Foto com efeito';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    preview.appendChild(img);
    var rm = document.getElementById('removeMediaBtn');
    if (rm) rm.style.display = '';
  }

  function deliverFaceFxPhoto(blob, url) {
    if (!blob) return false;
    var file = blobToFile(blob);
    var objectUrl = url || URL.createObjectURL(blob);

    // Estado global do criar post
    var item = {
      type: 'image',
      url: objectUrl,
      name: 'tchilo-face-fx.jpg',
      file: file,
      blob: blob
    };
    window.createMediaData = { type: 'image', items: [item], files: [file] };
    window.createMediaFiles = [file];
    window.__tchiloCreateMedia = { type: 'image', file: file, url: objectUrl, blob: blob };
    window.selectedCreateFile = file;

    setFileInput(file);
    showCreatePreview(objectUrl);

    try {
      if (typeof window.setThemeSectionVisible === 'function') window.setThemeSectionVisible(false);
    } catch (e) {}

    // Preferir o editor de media (mesmo fluxo da galeria)
    try {
      if (typeof window.tchiloOpenMediaEditor === 'function') {
        window.tchiloOpenMediaEditor({
          mode: 'post',
          mediaType: 'image',
          src: objectUrl,
          file: file
        });
        return true;
      }
    } catch (e) {
      console.warn('tchiloOpenMediaEditor', e);
    }

    // Fallbacks
    try {
      if (typeof window.setCreateMediaFromCapture === 'function') {
        window.setCreateMediaFromCapture(objectUrl, blob, file);
      }
    } catch (e2) {}
    try {
      if (typeof window.handleCreateFiles === 'function') window.handleCreateFiles([file]);
    } catch (e3) {}
    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e4) {}

    return true;
  }

  window.tchiloDeliverFaceFxPhoto = deliverFaceFxPhoto;

  /** Reescreve o capturePhoto do botão para garantir entrega */
  function interceptCaptureButton() {
    var btn = document.getElementById('tchiloFxCapture');
    if (!btn || btn.__fxDeliver) return;
    btn.__fxDeliver = true;

    btn.addEventListener(
      'click',
      function (ev) {
        // Captura própria a partir do canvas/video se o original falhar
        setTimeout(function () {
          try {
            var d = window.createMediaData;
            if (d && d.items && d.items[0] && (d.items[0].file || d.items[0].blob)) {
              var it = d.items[0];
              deliverFaceFxPhoto(it.file || it.blob, it.url);
              return;
            }
          } catch (e) {}
          // Captura manual do vídeo/canvas da face-fx
          try {
            var video = document.getElementById('tchiloFxVideo');
            var canvas = document.getElementById('tchiloFxCanvas');
            var srcCanvas = canvas && canvas.width ? canvas : null;
            if (!srcCanvas && video && video.readyState >= 2) {
              srcCanvas = document.createElement('canvas');
              srcCanvas.width = video.videoWidth || 640;
              srcCanvas.height = video.videoHeight || 480;
              var ctx = srcCanvas.getContext('2d');
              ctx.drawImage(video, 0, 0);
            }
            if (srcCanvas) {
              srcCanvas.toBlob(
                function (blob) {
                  if (!blob) return;
                  deliverFaceFxPhoto(blob, URL.createObjectURL(blob));
                  try {
                    if (typeof window.closeFaceEffects === 'function') window.closeFaceEffects();
                  } catch (e2) {}
                },
                'image/jpeg',
                0.92
              );
            }
          } catch (e3) {
            console.warn('face-fx manual capture', e3);
          }
        }, 80);
      },
      false
    );
  }

  function watchUi() {
    interceptCaptureButton();
    var root = document.getElementById('tchiloFaceFx');
    if (root && !root.__fxDeliverObs) {
      root.__fxDeliverObs = true;
      new MutationObserver(function () {
        if (root.classList.contains('open')) interceptCaptureButton();
      }).observe(root, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // Guard em createMediaData (quando face-effects atribui)
  function installSetter() {
    var stored = window.createMediaData;
    try {
      Object.defineProperty(window, 'createMediaData', {
        configurable: true,
        enumerable: true,
        get: function () {
          return stored;
        },
        set: function (v) {
          stored = v;
          try {
            if (v && v.items && v.items[0]) {
              var it = v.items[0];
              var blob = it.file || it.blob;
              if (blob && (it.name === 'face-fx.jpg' || it.name === 'tchilo-face-fx.jpg')) {
                setTimeout(function () {
                  deliverFaceFxPhoto(blob, it.url);
                }, 30);
              }
            }
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  function boot() {
    installSetter();
    watchUi();
    setTimeout(watchUi, 600);
    setTimeout(watchUi, 2000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
