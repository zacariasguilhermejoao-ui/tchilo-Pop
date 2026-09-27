/**
 * Tchilo — força galeria + vídeo a funcionar (Android/iOS)
 */
(function () {
  'use strict';
  if (window.__tchiloGalForceV3) return;
  window.__tchiloGalForceV3 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
      else alert(msg);
    } catch (e) {
      try {
        alert(msg);
      } catch (e2) {}
    }
  }

  function isVideo(file) {
    if (!file) return false;
    var t = String(file.type || '').toLowerCase();
    if (t.indexOf('video/') === 0) return true;
    return /\.(mp4|mov|webm|m4v|3gp|mkv|avi)$/i.test(file.name || '');
  }

  function isImage(file) {
    if (!file) return false;
    var t = String(file.type || '').toLowerCase();
    if (t.indexOf('image/') === 0) return true;
    return /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(file.name || '');
  }

  function paintPreview(items) {
    var preview = document.getElementById('createPreview');
    if (!preview) return;
    preview.classList.add('has-media');
    Array.prototype.slice.call(preview.querySelectorAll('img,video,.multi-preview')).forEach(function (n) {
      try {
        n.remove();
      } catch (e) {}
    });
    var m = items[0];
    if (!m) return;
    if (m.type === 'video') {
      var v = document.createElement('video');
      v.src = m.url;
      v.controls = true;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', 'true');
      v.setAttribute('webkit-playsinline', 'true');
      v.preload = 'metadata';
      v.style.cssText =
        'display:block!important;width:100%!important;max-height:420px!important;min-height:180px!important;object-fit:contain!important;background:#000!important;border-radius:12px!important;z-index:5!important;';
      preview.appendChild(v);
      try {
        v.load();
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    } else {
      var img = document.createElement('img');
      img.src = m.url;
      img.alt = 'preview';
      img.style.cssText =
        'display:block!important;width:100%!important;max-height:420px!important;object-fit:contain!important;border-radius:12px!important;';
      preview.appendChild(img);
    }
    var rm = document.getElementById('removeMediaBtn');
    if (rm) rm.style.display = '';
    try {
      if (typeof setThemeSectionVisible === 'function') setThemeSectionVisible(false);
    } catch (e) {}
  }

  function applyFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) {
      toast('Nenhum ficheiro');
      return false;
    }

    var usable = files.filter(function (f) {
      return isVideo(f) || isImage(f);
    });
    /* Android por vezes devolve type vazio e nome sem extensão — aceita o 1.º ficheiro */
    if (!usable.length && files.length === 1) {
      usable = [files[0]];
    }
    if (!usable.length) {
      toast('Formato não suportado. Tenta MP4 ou JPG.');
      return false;
    }

    var hasVid = usable.some(isVideo);
    if (hasVid && usable.length > 1) {
      toast('Vídeo só pode ser um de cada vez');
      return false;
    }

    var items = usable.map(function (file) {
      var vid = isVideo(file);
      /* se type vazio, assume vídeo se size grande */
      if (!vid && !isImage(file) && file.size > 2 * 1024 * 1024) vid = true;
      var url = URL.createObjectURL(file);
      return {
        type: vid ? 'video' : 'image',
        url: url,
        name: file.name || (vid ? 'video.mp4' : 'foto.jpg'),
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
    window.createMediaFiles = usable;

    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e) {}

    paintPreview(items);
    setTimeout(function () {
      paintPreview(items);
    }, 80);
    setTimeout(function () {
      paintPreview(items);
    }, 400);

    toast(items[0].type === 'video' ? 'Vídeo selecionado' : 'Foto selecionada');
    return true;
  }

  function ensureHiddenInput() {
    var id = 'tchiloForceMediaInput';
    var input = document.getElementById(id);
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = id;
      input.accept = 'image/*,video/*,.mp4,.mov,.webm,.jpg,.jpeg,.png';
      input.multiple = false;
      input.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;';
      document.body.appendChild(input);
      input.addEventListener('change', function (e) {
        var files = e.target.files;
        try {
          e.target.value = '';
        } catch (err) {}
        if (!files || !files.length) {
          toast('Não foi possível ler o ficheiro');
          return;
        }
        applyFiles(files);
        try {
          if (typeof window.tchiloCloseCamera === 'function') window.tchiloCloseCamera();
        } catch (err) {}
      });
    }
    return input;
  }

  window.tchiloOpenGallery = function () {
    try {
      ensureHiddenInput().click();
    } catch (e) {
      toast('Não foi possível abrir a galeria');
    }
  };

  function showCreateGalleryBtn() {
    var css = document.getElementById('tchiloGalForceCSS');
    if (!css) {
      css = document.createElement('style');
      css.id = 'tchiloGalForceCSS';
      css.textContent =
        '#galleryBtn,#tchiloForceGalBtn{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;}' +
        '#screen-create .gallery-btn{display:flex!important;}' +
        '#tchiloForceGalBtn{width:calc(100% - 32px);max-width:340px;margin:8px 16px;padding:14px;border:2px solid var(--ink,#0B0B0C);' +
        'border-radius:16px;background:#fff;color:#0B0B0C;font-weight:800;font-size:15px;align-items:center;justify-content:center;gap:8px;}' +
        '#tchiloCamGalBtn{display:flex!important;visibility:visible!important;}';
      (document.head || document.documentElement).appendChild(css);
    }

    /* botão Galeria no ecrã criar */
    var screen = document.getElementById('screen-create');
    if (!screen) return;
    var btn = document.getElementById('tchiloForceGalBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloForceGalBtn';
      btn.innerHTML = '<span>Abrir galeria (foto ou vídeo)</span>';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.tchiloOpenGallery();
      });
      var camBtn = document.getElementById('tchiloOpenCamBtn');
      if (camBtn && camBtn.parentNode) {
        camBtn.parentNode.insertBefore(btn, camBtn.nextSibling);
      } else {
        screen.insertBefore(btn, screen.firstChild);
      }
    }

    /* reativar galleryBtn original */
    var gb = document.getElementById('galleryBtn');
    if (gb) {
      gb.style.display = 'flex';
      gb.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.tchiloOpenGallery();
      };
    }

    /* mediaInput nativo */
    var mi = document.getElementById('mediaInput');
    if (mi && !mi.__forceBound) {
      mi.__forceBound = true;
      mi.accept = 'image/*,video/*,.mp4,.mov,.webm,.jpg,.jpeg,.png';
      mi.addEventListener(
        'change',
        function (e) {
          if (e.target.files && e.target.files.length) {
            applyFiles(e.target.files);
          }
        },
        true
      );
    }
  }

  function wireCamGallery() {
    var camGal = document.getElementById('tchiloCamGalBtn');
    if (camGal && !camGal.__forceBound) {
      camGal.__forceBound = true;
      camGal.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          window.tchiloOpenGallery();
        },
        true
      );
    }
  }

  function boot() {
    ensureHiddenInput();
    showCreateGalleryBtn();
    wireCamGallery();
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
  setInterval(function () {
    showCreateGalleryBtn();
    wireCamGallery();
  }, 3000);
})();
