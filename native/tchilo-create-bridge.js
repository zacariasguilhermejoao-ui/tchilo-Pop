/**
 * Bridge: camera-with-effects + media-editor crop/music → create flow v3
 */
(function () {
  'use strict';
  if (window.__TCHILO_CREATE_BRIDGE_V1) return;
  window.__TCHILO_CREATE_BRIDGE_V1 = true;

  function toast(m) {
    try {
      if (typeof showToast === 'function') showToast(m);
    } catch (e) {}
  }

  function dataUrlToFile(dataUrl, name) {
    try {
      var parts = dataUrl.split(',');
      var mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
      var bin = atob(parts[1] || '');
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new File([arr], name || 'edit.jpg', { type: mime });
    } catch (e) {
      return null;
    }
  }

  /** After camera capture during create flow → compose screen */
  function handoffToCreate(file, url, mediaType) {
    if (typeof window.tchiloReceiveCreateMedia === 'function') {
      window.tchiloReceiveCreateMedia({
        file: file,
        url: url,
        type: mediaType === 'video' ? 'video' : 'image',
        name: (file && file.name) || (mediaType === 'video' ? 'video.mp4' : 'camera.jpg')
      });
      return true;
    }
    return false;
  }

  /** Patch camera deliver so create flow gets media back */
  function patchCameraDeliver() {
    // Hook tchiloDeliverFaceFxPhoto if present
    var prevFx = window.tchiloDeliverFaceFxPhoto;
    window.tchiloDeliverFaceFxPhoto = function (file, url) {
      if (window.__tchiloCreateFlowActive) {
        if (handoffToCreate(file, url, 'image')) return;
      }
      if (typeof prevFx === 'function') return prevFx.apply(this, arguments);
    };

    // Wrap open media editor when create flow is active — return to compose instead of publish
    if (typeof window.tchiloOpenMediaEditor === 'function' && !window.tchiloOpenMediaEditor.__bridge) {
      var _open = window.tchiloOpenMediaEditor;
      window.tchiloOpenMediaEditor = function (opts) {
        opts = opts || {};
        if (window.__tchiloCreateFlowActive && !opts.__fromCrop) {
          // Camera went to editor — after user publishes in editor, send to create compose
          armEditorReturnToCompose(opts);
        }
        return _open.apply(this, arguments);
      };
      window.tchiloOpenMediaEditor.__bridge = true;
    }
  }

  function armEditorReturnToCompose(opts) {
    // Intercept mePublish once
    setTimeout(function () {
      var btn = document.getElementById('mePublish');
      if (!btn || btn.__bridgeHooked) return;
      btn.__bridgeHooked = true;
      var orig = btn.onclick;
      btn.textContent = 'Pronto';
      btn.onclick = async function (e) {
        e && e.preventDefault && e.preventDefault();
        try {
          // Prefer canvas export from editor stage
          var img = document.getElementById('meImage');
          var src = opts.src;
          var file = opts.file || null;
          var mediaType = opts.mediaType || 'image';

          if (img && mediaType === 'image') {
            try {
              var canvas = document.createElement('canvas');
              var w = img.naturalWidth || 1080;
              var h = img.naturalHeight || 1080;
              var max = 1600;
              var scale = Math.min(1, max / Math.max(w, h));
              canvas.width = Math.max(1, Math.round(w * scale));
              canvas.height = Math.max(1, Math.round(h * scale));
              var ctx = canvas.getContext('2d');
              // apply stage filter class roughly via css filter on draw is limited — draw as-is
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              src = canvas.toDataURL('image/jpeg', 0.92);
              file = dataUrlToFile(src, 'edit.jpg');
            } catch (err) {}
          }

          // close editor
          if (typeof window.tchiloCloseMediaEditor === 'function') {
            window.tchiloCloseMediaEditor();
          } else {
            var ed = document.getElementById('tchiloMediaEd');
            if (ed) ed.classList.remove('open');
            try { document.body.style.overflow = ''; } catch (e2) {}
          }

          handoffToCreate(file, src, mediaType);
        } catch (err) {
          toast('Erro ao aplicar edição');
          if (typeof orig === 'function') orig.call(btn, e);
        }
      };
    }, 200);
  }

  /** Open crop editor for current create selection */
  window.tchiloOpenCreateCrop = function (item) {
    if (!item || !item.url) {
      toast('Sem media para cortar');
      return;
    }
    window.__tchiloCreateFlowActive = true;
    if (typeof window.tchiloOpenMediaEditor !== 'function') {
      toast('Editor indisponível');
      return;
    }
    // Keep picker open underneath; editor is higher z-index
    armEditorReturnToCompose({
      mode: 'post',
      mediaType: item.type === 'video' ? 'video' : 'image',
      src: item.url,
      file: item.file || null,
      __fromCrop: true
    });
    window.tchiloOpenMediaEditor({
      mode: 'post',
      mediaType: item.type === 'video' ? 'video' : 'image',
      src: item.url,
      file: item.file || null,
      __fromCrop: true
    });
  };

  /** Open music from create compose */
  window.tchiloOpenCreateMusic = function () {
    try {
      if (typeof openMusicPicker === 'function') {
        openMusicPicker();
        return;
      }
      if (typeof window.tchiloOpenMusic === 'function') {
        window.tchiloOpenMusic();
        return;
      }
      // open media editor music sheet if possible
      var sheet = document.getElementById('meMusicSheet');
      if (sheet) {
        sheet.classList.add('open');
        return;
      }
    } catch (e) {}
    toast('Música');
  };

  /** Mark create flow when picker opens camera */
  var _openCam = null;
  function patchOpenCamera() {
    if (typeof window.tchiloOpenCamera !== 'function') return;
    if (window.tchiloOpenCamera.__bridge) return;
    _openCam = window.tchiloOpenCamera;
    window.tchiloOpenCamera = function () {
      // leave flag as set by caller
      return _openCam.apply(this, arguments);
    };
    window.tchiloOpenCamera.__bridge = true;
  }

  function boot() {
    patchCameraDeliver();
    patchOpenCamera();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
})();
