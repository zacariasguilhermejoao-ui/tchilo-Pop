/**
 * tchilo-Pop — entrega a foto da câmara com efeitos para o ecrã Criar post
 * Cobre createMediaData, File, input file e pré-visualização.
 */
(function () {
  'use strict';

  function blobToFile(blob, name) {
    try {
      return new File([blob], name || 'tchilo-face-fx.jpg', {
        type: blob.type || 'image/jpeg',
        lastModified: Date.now()
      });
    } catch (e) {
      // Safari antigo: File pode falhar
      blob.name = name || 'tchilo-face-fx.jpg';
      blob.lastModified = Date.now();
      return blob;
    }
  }

  function setFileInput(file) {
    var selectors = [
      '#createFileInput',
      '#createMediaInput',
      '#galleryInput',
      'input[type="file"][accept*="image"]',
      '#screen-create input[type="file"]'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var input = document.querySelector(selectors[i]);
      if (!input) continue;
      try {
        var dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      } catch (e) {}
    }
    return false;
  }

  function showPreview(url) {
    var preview =
      document.getElementById('createPreview') ||
      document.querySelector('#screen-create .create-preview') ||
      document.querySelector('#screen-create .media-preview');
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
    var rm =
      document.getElementById('removeMediaBtn') ||
      document.querySelector('#screen-create .remove-media');
    if (rm) rm.style.display = '';
  }

  function deliverFaceFxPhoto(blob, url) {
    if (!blob) return false;
    var file = blobToFile(blob, 'tchilo-face-fx.jpg');
    var objectUrl = url || URL.createObjectURL(blob);

    var item = {
      type: 'image',
      url: objectUrl,
      name: file.name || 'tchilo-face-fx.jpg',
      file: file,
      blob: blob
    };

    // Vários formatos que o index.html pode ler
    try {
      window.createMediaData = {
        type: 'image',
        items: [item],
        files: [file]
      };
    } catch (e) {}
    try {
      window.createMediaFiles = [file];
    } catch (e2) {}
    try {
      window.__tchiloCreateMedia = { type: 'image', file: file, url: objectUrl, blob: blob };
    } catch (e3) {}
    try {
      window.selectedCreateFile = file;
    } catch (e4) {}

    setFileInput(file);
    showPreview(objectUrl);

    try {
      if (typeof window.setThemeSectionVisible === 'function') {
        window.setThemeSectionVisible(false);
      }
    } catch (e5) {}

    // Hooks oficiais se existirem
    try {
      if (typeof window.setCreateMediaFromCapture === 'function') {
        window.setCreateMediaFromCapture(objectUrl, blob, file);
      }
    } catch (e6) {}
    try {
      if (typeof window.tchiloSetCreateMedia === 'function') {
        window.tchiloSetCreateMedia([file]);
      }
    } catch (e7) {}
    try {
      if (typeof window.handleCreateFiles === 'function') {
        window.handleCreateFiles([file]);
      }
    } catch (e8) {}
    try {
      if (typeof window.onCreateMediaSelected === 'function') {
        window.onCreateMediaSelected([file]);
      }
    } catch (e9) {}

    // Evento custom para o resto da app
    try {
      window.dispatchEvent(
        new CustomEvent('tchilo-face-fx-captured', {
          detail: { file: file, blob: blob, url: objectUrl }
        })
      );
    } catch (e10) {}

    return true;
  }

  window.tchiloDeliverFaceFxPhoto = deliverFaceFxPhoto;

  /** Patch capturePhoto do face-effects.js */
  function patchCapture() {
    // Re-bind no botão Capturar
    var btn = document.getElementById('tchiloFxCapture');
    if (!btn || btn.__deliverPatched) return;
    btn.__deliverPatched = true;

    btn.addEventListener(
      'click',
      function () {
        // Depois do handler original (mesmo tick + próximo)
        setTimeout(function () {
          // Se createMediaData já tem blob, reforça entrega
          try {
            var d = window.createMediaData;
            if (d && d.items && d.items[0] && d.items[0].file) {
              var f = d.items[0].file;
              var blob = f instanceof Blob ? f : d.items[0].blob;
              var url = d.items[0].url;
              if (blob) deliverFaceFxPhoto(blob, url);
            }
          } catch (e) {}
        }, 50);
        setTimeout(function () {
          try {
            var d = window.createMediaData;
            if (d && d.items && d.items[0] && d.items[0].file) {
              deliverFaceFxPhoto(d.items[0].file || d.items[0].blob, d.items[0].url);
            }
          } catch (e) {}
        }, 300);
      },
      true
    );
  }

  /** Override global capture se exposto */
  function wrapGlobals() {
    // Monkey-patch: quando face-effects define capture via DOM only
    // Observa abertura da UI
    var root = document.getElementById('tchiloFaceFx');
    if (root && !root.__deliverObs) {
      root.__deliverObs = true;
      new MutationObserver(function () {
        if (root.classList.contains('open')) patchCapture();
      }).observe(root, { attributes: true, attributeFilter: ['class'] });
    }
    patchCapture();
  }

  /**
   * Substitui toBlob path: intercepta URL.createObjectURL usado após captura
   * Mais fiável: reescreve window.openFaceEffects close path via patching createMediaData setter
   */
  function installCreateMediaGuard() {
    var last = null;
    try {
      Object.defineProperty(window, 'createMediaData', {
        configurable: true,
        enumerable: true,
        get: function () {
          return last;
        },
        set: function (v) {
          last = v;
          try {
            if (v && v.items && v.items[0]) {
              var it = v.items[0];
              var blob = it.file || it.blob;
              if (blob && (it.name === 'face-fx.jpg' || (it.url && String(it.url).indexOf('blob:') === 0))) {
                // Normalizar para File
                var file = blobToFile(blob, it.name || 'tchilo-face-fx.jpg');
                it.file = file;
                it.blob = blob;
                v.files = [file];
                last = v;
                setTimeout(function () {
                  deliverFaceFxPhoto(blob, it.url);
                }, 0);
              }
            }
          } catch (e) {}
        }
      });
    } catch (e) {
      // defineProperty pode falhar se já for non-configurable
    }
  }

  function boot() {
    installCreateMediaGuard();
    wrapGlobals();
    setTimeout(wrapGlobals, 500);
    setTimeout(wrapGlobals, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
