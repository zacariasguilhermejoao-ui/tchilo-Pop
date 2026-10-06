/**
 * Bridge v2: camera + crop + music → create flow
 */
(function () {
  'use strict';
  if (window.__TCHILO_CREATE_BRIDGE_V2) return;
  window.__TCHILO_CREATE_BRIDGE_V2 = true;
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

  window.tchiloSyncCreateMediaForMusic = function (item) {
    if (!item) return;
    var list = [
      {
        type: item.type === 'video' ? 'video' : 'image',
        url: item.url,
        file: item.file || null,
        name: item.name || 'media'
      }
    ];
    window.createMediaData = {
      type: list[0].type,
      items: list,
      src: list[0].url,
      file: list[0].file
    };
    window.__tchiloPendingMedia = list[0];
    try {
      (0, eval)('createMediaData = window.createMediaData');
    } catch (e) {}
    try {
      var preview = document.getElementById('createPreview');
      if (preview && list[0].type === 'image') {
        preview.classList.add('has-media');
        preview.querySelectorAll('img,video,.multi-preview').forEach(function (n) {
          try {
            n.remove();
          } catch (e2) {}
        });
        var img = document.createElement('img');
        img.src = list[0].url;
        img.alt = '';
        preview.appendChild(img);
      }
    } catch (e3) {}
    if (typeof window.tchiloUpdatePostMusicBtn === 'function') {
      try {
        window.tchiloUpdatePostMusicBtn();
      } catch (e4) {}
    }
  };

  function patchCameraDeliver() {
    var prevFx = window.tchiloDeliverFaceFxPhoto;
    window.tchiloDeliverFaceFxPhoto = function (file, url) {
      if (window.__tchiloCreateFlowActive) {
        if (handoffToCreate(file, url, 'image')) return;
      }
      if (typeof prevFx === 'function') return prevFx.apply(this, arguments);
    };

    if (typeof window.tchiloOpenMediaEditor === 'function' && !window.tchiloOpenMediaEditor.__bridge) {
      var _open = window.tchiloOpenMediaEditor;
      window.tchiloOpenMediaEditor = function (opts) {
        opts = opts || {};
        if (window.__tchiloCreateFlowActive) armEditorReturnToCompose(opts);
        return _open.apply(this, arguments);
      };
      window.tchiloOpenMediaEditor.__bridge = true;
    }
  }

  function armEditorReturnToCompose(opts) {
    setTimeout(function () {
      var btn = document.getElementById('mePublish');
      if (!btn || btn.__bridgeHooked) return;
      btn.__bridgeHooked = true;
      btn.textContent = 'Pronto';
      btn.onclick = async function (e) {
        e && e.preventDefault && e.preventDefault();
        try {
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
              canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
              src = canvas.toDataURL('image/jpeg', 0.92);
              file = dataUrlToFile(src, 'edit.jpg');
            } catch (err) {}
          }
          var ed = document.getElementById('tchiloMediaEd');
          if (ed) ed.classList.remove('open');
          try {
            document.body.style.overflow = '';
          } catch (e2) {}
          handoffToCreate(file, src, mediaType);
        } catch (err) {
          toast('Erro ao aplicar edição');
        }
      };
    }, 200);
  }

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
    var opts = {
      mode: 'post',
      mediaType: item.type === 'video' ? 'video' : 'image',
      src: item.url,
      file: item.file || null
    };
    armEditorReturnToCompose(opts);
    window.tchiloOpenMediaEditor(opts);
  };

  window.tchiloOpenCreateMusic = function (item) {
    window.__tchiloCreateFlowActive = true;
    if (item) window.tchiloSyncCreateMediaForMusic(item);

    if (typeof window.tchiloOpenPostMusic === 'function') {
      try {
        window.tchiloOpenPostMusic();
        setTimeout(function () {
          var sheet = document.getElementById('tchiloPostMusicSheet');
          if (!sheet || !sheet.classList.contains('open')) forceOpenPostMusicSheet();
        }, 120);
        return;
      } catch (e) {
        console.warn(e);
      }
    }
    forceOpenPostMusicSheet();
  };

  function forceOpenPostMusicSheet() {
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (sheet) {
      sheet.classList.add('open');
      try {
        if (typeof window.tchiloUpdatePostMusicBtn === 'function') window.tchiloUpdatePostMusicBtn();
      } catch (e) {}
      var search = document.getElementById('pmSearch');
      if (search) {
        try {
          search.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e2) {}
      }
      return;
    }
    toast('Lista de música a carregar…');
    setTimeout(function () {
      if (typeof window.tchiloOpenPostMusic === 'function') {
        try {
          window.tchiloOpenPostMusic();
        } catch (e3) {}
      }
    }, 600);
  }

  function watchMusicSelection() {
    var last = null;
    setInterval(function () {
      var cur = window._pendingMusic || null;
      if (cur === last) return;
      last = cur;
      try {
        window.dispatchEvent(
          new CustomEvent('tchilo-music-selected', {
            detail: { label: cur, meta: window._pendingMusicMeta || null }
          })
        );
      } catch (e) {}
    }, 400);
  }

  function boot() {
    patchCameraDeliver();
    watchMusicSelection();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
})();
