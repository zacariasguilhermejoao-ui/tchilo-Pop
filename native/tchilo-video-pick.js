/**
 * Tchilo — seleção de vídeo/foto da galeria (forçado)
 * Não depende do onMediaPicked antigo nem do hideGal
 */
(function () {
  'use strict';
  if (window.__tchiloVideoPickV5) return;
  window.__tchiloVideoPickV5 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
      else console.log('[Tchilo]', msg);
    } catch (e) {
      console.log('[Tchilo]', msg);
    }
  }

  function isVideo(file) {
    if (!file) return false;
    var t = String(file.type || '').toLowerCase();
    if (t.indexOf('video/') === 0) return true;
    if (t.indexOf('image/') === 0) return false;
    var n = String(file.name || '').toLowerCase();
    if (/\.(mp4|mov|m4v|webm|3gp|mkv|avi)$/.test(n)) return true;
    if (/\.(jpe?g|png|gif|webp|heic|heif)$/.test(n)) return false;
    /* Android às vezes sem type nem extensão — ficheiros grandes = vídeo */
    if (!t && (file.size || 0) > 1500000) return true;
    return false;
  }

  function setPending(file) {
    var vid = isVideo(file);
    var url = URL.createObjectURL(file);
    var item = {
      type: vid ? 'video' : 'image',
      url: url,
      file: file,
      name: file.name || (vid ? 'video.mp4' : 'foto.jpg'),
      size: file.size || 0,
      mime: file.type || (vid ? 'video/mp4' : 'image/jpeg')
    };
    window.__tchiloPendingMedia = item;
    window.createMediaFiles = [file];
    window.createMediaData = {
      type: item.type,
      items: [item],
      src: url,
      file: file
    };
    return item;
  }

  function paint(item) {
    if (!item) return;
    var preview = document.getElementById('createPreview');
    if (!preview) return;

    preview.classList.add('has-media');
    /* limpar media anterior, manter stamp escondido via has-media */
    Array.prototype.forEach.call(preview.querySelectorAll('img,video,.multi-preview,.tchilo-pick-layer'), function (n) {
      try {
        n.remove();
      } catch (e) {}
    });

    var layer = document.createElement('div');
    layer.className = 'tchilo-pick-layer';
    layer.style.cssText =
      'position:absolute;inset:0;z-index:6;background:#000;display:flex;align-items:center;justify-content:center;';

    if (item.type === 'video') {
      var v = document.createElement('video');
      v.src = item.url;
      v.controls = true;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.preload = 'auto';
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;background:#000;';
      layer.appendChild(v);
      try {
        v.load();
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    } else {
      var img = document.createElement('img');
      img.src = item.url;
      img.alt = 'preview';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      layer.appendChild(img);
    }
    preview.appendChild(layer);

    var rm = document.getElementById('removeMediaBtn');
    if (rm) rm.style.display = '';
    try {
      if (typeof setThemeSectionVisible === 'function') setThemeSectionVisible(false);
    } catch (e) {}
    try {
      if (typeof hideVideoCoverBox === 'function') hideVideoCoverBox();
    } catch (e) {}
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) {
      toast('Nenhum ficheiro escolhido');
      return;
    }
    var file = files[0];
    var item = setPending(file);

    try {
      if (typeof window.tchiloCloseCamera === 'function') window.tchiloCloseCamera();
    } catch (e) {}
    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e) {}

    paint(item);
    setTimeout(function () {
      paint(item);
    }, 100);
    setTimeout(function () {
      paint(item);
    }, 400);
    setTimeout(function () {
      paint(item);
    }, 900);

    toast(item.type === 'video' ? 'Vídeo pronto para publicar' : 'Foto pronta para publicar');
  }

  function ensureInput() {
    var id = 'tchiloVideoPickInput';
    var input = document.getElementById(id);
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = id;
      /* sem capture — abre galeria, não câmara */
      input.accept = 'video/*,image/*,.mp4,.mov,.m4v,.webm,.jpg,.jpeg,.png';
      input.multiple = false;
      input.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
      document.body.appendChild(input);
      input.addEventListener('change', function (e) {
        var fl = e.target.files;
        /* não limpar value antes de ler */
        handleFiles(fl);
        try {
          e.target.value = '';
        } catch (err) {}
      });
    }
    return input;
  }

  window.tchiloPickFromGallery = function () {
    var input = ensureInput();
    try {
      input.click();
    } catch (e) {
      toast('Não foi possível abrir a galeria');
    }
  };

  function ensureUI() {
    if (!document.getElementById('tchiloVideoPickCSS')) {
      var st = document.createElement('style');
      st.id = 'tchiloVideoPickCSS';
      st.textContent =
        '#tchiloPickVideoBtn,#tchiloPickPhotoBtn{' +
        'display:flex!important;visibility:visible!important;opacity:1!important;' +
        'pointer-events:auto!important;z-index:80!important;' +
        'width:calc(100% - 32px);max-width:340px;margin:8px 16px;padding:14px 16px;' +
        'border:2px solid #0B0B0C;border-radius:16px;font-weight:800;font-size:15px;' +
        'align-items:center;justify-content:center;gap:8px;cursor:pointer;}' +
        '#tchiloPickVideoBtn{background:#c8f560;color:#0B0B0C;}' +
        '#tchiloPickPhotoBtn{background:#fff;color:#0B0B0C;}' +
        '#screen-create #galleryBtn{display:flex!important;visibility:visible!important;}' +
        '#createPreview.has-media .tchilo-pick-layer{display:flex!important;}' +
        '#createPreview video,#createPreview img{z-index:5!important;}';
      (document.head || document.documentElement).appendChild(st);
    }

    var screen = document.getElementById('screen-create');
    if (!screen) return;

    function makeBtn(id, label, onlyVideo) {
      var b = document.getElementById(id);
      if (!b) {
        b = document.createElement('button');
        b.type = 'button';
        b.id = id;
        b.textContent = label;
        b.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var input = ensureInput();
          if (onlyVideo) input.accept = 'video/*,.mp4,.mov,.m4v,.webm';
          else input.accept = 'image/*,video/*,.mp4,.mov,.jpg,.jpeg,.png';
          window.tchiloPickFromGallery();
        });
        var anchor =
          document.getElementById('tchiloOpenCamBtn') ||
          document.getElementById('galleryBtn') ||
          screen.querySelector('.create-body') ||
          screen;
        if (anchor && anchor.parentNode && anchor !== screen) {
          anchor.parentNode.insertBefore(b, anchor.nextSibling);
        } else {
          screen.insertBefore(b, screen.firstChild);
        }
      }
      return b;
    }

    makeBtn('tchiloPickVideoBtn', 'Escolher VÍDEO da galeria', true);
    makeBtn('tchiloPickPhotoBtn', 'Escolher foto ou vídeo', false);

    var gb = document.getElementById('galleryBtn');
    if (gb) {
      gb.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.tchiloPickFromGallery();
      };
    }

    var mi = document.getElementById('mediaInput');
    if (mi && !mi.__vpBound) {
      mi.__vpBound = true;
      mi.addEventListener(
        'change',
        function (e) {
          if (e.target.files && e.target.files.length) handleFiles(e.target.files);
        },
        true
      );
    }

    /* se já há pending, repintar */
    if (window.__tchiloPendingMedia) {
      paint(window.__tchiloPendingMedia);
    }
  }

  /* publish usa pending se createMediaData falhar */
  function patchPublish() {
    if (typeof window.publishPost === 'function' && !window.publishPost.__vp) {
      var op = window.publishPost;
      window.publishPost = function () {
        if (
          (!window.createMediaData || !window.createMediaData.items) &&
          window.__tchiloPendingMedia
        ) {
          var it = window.__tchiloPendingMedia;
          window.createMediaData = { type: it.type, items: [it], src: it.url, file: it.file };
        }
        return op.apply(this, arguments);
      };
      window.publishPost.__vp = true;
    }
    if (typeof window.publishPostCore === 'function' && !window.publishPostCore.__vp) {
      var oc = window.publishPostCore;
      window.publishPostCore = async function () {
        if (
          (!window.createMediaData || !window.createMediaData.items) &&
          window.__tchiloPendingMedia
        ) {
          var it = window.__tchiloPendingMedia;
          window.createMediaData = { type: it.type, items: [it], src: it.url, file: it.file };
        }
        return oc.apply(this, arguments);
      };
      window.publishPostCore.__vp = true;
    }
  }

  function boot() {
    ensureInput();
    ensureUI();
    patchPublish();
  }

  boot();
  document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setInterval(function () {
    ensureUI();
    patchPublish();
  }, 2500);

  console.log('[Tchilo] video-pick v5 ativo');
})();
