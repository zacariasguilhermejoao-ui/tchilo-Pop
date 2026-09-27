/**
 * Tchilo — ecrã Criar profissional: só 2 botões
 * 1) Câmara Especial  2) Galeria
 * Sem animação de 3 pontos ao escolher da galeria
 */
(function () {
  'use strict';
  if (window.__tchiloCreateBtnsV2) return;
  window.__tchiloCreateBtnsV2 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function isVideo(file) {
    if (!file) return false;
    var t = String(file.type || '').toLowerCase();
    if (t.indexOf('video/') === 0) return true;
    if (t.indexOf('image/') === 0) return false;
    var n = String(file.name || '').toLowerCase();
    if (/\.(mp4|mov|m4v|webm|3gp|mkv)$/.test(n)) return true;
    if (/\.(jpe?g|png|gif|webp|heic)$/.test(n)) return false;
    if (!t && (file.size || 0) > 1500000) return true;
    return false;
  }

  function setMedia(file) {
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
    if (item.type === 'video') {
      var v = document.createElement('video');
      v.src = item.url;
      v.controls = true;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'metadata';
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;background:#000;';
      layer.appendChild(v);
      try {
        v.load();
      } catch (e) {}
    } else {
      var img = document.createElement('img');
      img.src = item.url;
      img.alt = '';
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

  function onFiles(files) {
    if (!files || !files.length) return;
    var file = files[0];
    var item = setMedia(file);
    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e) {}
    paint(item);
    setTimeout(function () {
      paint(item);
    }, 80);
    /* sem toast pesado / sem loading */
  }

  function ensureInput() {
    var input = document.getElementById('tchiloGalInputPro');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'tchiloGalInputPro';
      input.accept = 'image/*,video/*,.mp4,.mov,.m4v,.webm,.jpg,.jpeg,.png';
      input.multiple = false;
      input.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;';
      document.body.appendChild(input);
      input.addEventListener('change', function (e) {
        var fl = e.target.files;
        onFiles(fl);
        try {
          e.target.value = '';
        } catch (err) {}
      });
    }
    return input;
  }

  function openGallery() {
    /* abre galeria nativa — sem loading dots */
    try {
      ensureInput().click();
    } catch (e) {
      var mi = document.getElementById('mediaInput');
      if (mi) mi.click();
    }
  }

  function openCamera() {
    try {
      if (typeof window.tchiloOpenCamera === 'function') {
        window.tchiloOpenCamera();
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.openFaceEffects === 'function') {
        window.openFaceEffects();
        return;
      }
    } catch (e) {}
    toast('Câmara indisponível');
  }

  function injectCSS() {
    if (document.getElementById('tchiloCreateBtnsCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloCreateBtnsCSS';
    st.textContent =
      /* esconder botões antigos / extras */
      '#screen-create #faceFxOpenBtn,' +
      '#screen-create #galleryBtn,' +
      '#screen-create #tchiloOpenCamBtn,' +
      '#screen-create #tchiloForceGalBtn,' +
      '#screen-create #tchiloPickVideoBtn,' +
      '#screen-create #tchiloPickPhotoBtn,' +
      '#screen-create .gallery-btn:not(#removeMediaBtn):not(#tchiloBtnCam):not(#tchiloBtnGal){' +
      'display:none!important;visibility:hidden!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;}' +
      /* 2 botões profissionais */
      '#tchiloCreateActions{' +
      'display:flex!important;flex-direction:column;gap:10px;' +
      'width:calc(100% - 32px);max-width:340px;margin:12px 16px 8px;}' +
      '#tchiloBtnCam,#tchiloBtnGal{' +
      'display:flex!important;align-items:center;justify-content:center;gap:10px;' +
      'width:100%;padding:15px 18px;border-radius:16px;border:2.5px solid var(--ink,#0B0B0C);' +
      'font-weight:800;font-size:15px;letter-spacing:0.01em;cursor:pointer;' +
      'visibility:visible!important;opacity:1!important;pointer-events:auto!important;}' +
      '#tchiloBtnCam{background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);}' +
      '#tchiloBtnGal{background:var(--paper,#fff);color:var(--ink,#0B0B0C);}' +
      '#tchiloBtnCam svg,#tchiloBtnGal svg{flex:0 0 auto;}' +
      /* nunca loading nos botões de criar */
      '#tchiloBtnCam.tchilo-btn-loading,#tchiloBtnGal.tchilo-btn-loading,' +
      '#galleryBtn.tchilo-btn-loading{' +
      'pointer-events:auto!important;}' +
      '#createPreview .tchilo-pick-layer{z-index:6!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  var ICON_CAM =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">' +
    '<path d="M4 8h3l2-2h6l2 2h3v11H4V8z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  var ICON_GAL =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">' +
    '<rect x="3" y="4" width="18" height="16" rx="2"/>' +
    '<path d="M3 15l5-4 4 3 3-2 6 5"/><circle cx="8.5" cy="9" r="1.5" fill="currentColor" stroke="none"/></svg>';

  function ensureButtons() {
    injectCSS();
    var screen = document.getElementById('screen-create');
    if (!screen) return;

    var wrap = document.getElementById('tchiloCreateActions');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'tchiloCreateActions';

      var cam = document.createElement('button');
      cam.type = 'button';
      cam.id = 'tchiloBtnCam';
      cam.innerHTML = ICON_CAM + '<span>Câmara Especial</span>';
      cam.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openCamera();
      });

      var gal = document.createElement('button');
      gal.type = 'button';
      gal.id = 'tchiloBtnGal';
      gal.innerHTML = ICON_GAL + '<span>Galeria</span>';
      gal.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openGallery();
      });

      wrap.appendChild(cam);
      wrap.appendChild(gal);

      var body = screen.querySelector('.create-body');
      var preview = document.getElementById('createPreview');
      if (preview && preview.parentNode) {
        preview.parentNode.insertBefore(wrap, preview.nextSibling);
      } else if (body) {
        body.insertBefore(wrap, body.firstChild);
      } else {
        screen.appendChild(wrap);
      }
    }

    /* neutralizar loading no galleryBtn antigo */
    var gb = document.getElementById('galleryBtn');
    if (gb) {
      gb.onclick = function (e) {
        e.preventDefault();
        openGallery();
      };
    }
  }

  /* onMediaPicked: sem loading dots */
  function patchOnMedia() {
    if (typeof window.onMediaPicked === 'function' && !window.onMediaPicked.__proBtn) {
      window.onMediaPicked = function (event) {
        try {
          var files = event && event.target && event.target.files;
          if (files && files.length) onFiles(files);
          try {
            event.target.value = '';
          } catch (e) {}
        } catch (err) {
          console.warn(err);
        }
      };
      window.onMediaPicked.__proBtn = true;
    }
    /* tchiloSetLoading no create: ignorar para botões de media */
    if (typeof window.tchiloSetLoading === 'function' && !window.tchiloSetLoading.__proBtn) {
      var orig = window.tchiloSetLoading;
      window.tchiloSetLoading = function (btn, on) {
        if (
          btn &&
          (btn.id === 'galleryBtn' ||
            btn.id === 'tchiloBtnGal' ||
            btn.id === 'tchiloBtnCam' ||
            btn.id === 'faceFxOpenBtn')
        ) {
          /* nunca 3 pontos nestes botões */
          try {
            btn.classList.remove('tchilo-btn-loading');
            btn.disabled = false;
          } catch (e) {}
          return;
        }
        return orig.apply(this, arguments);
      };
      window.tchiloSetLoading.__proBtn = true;
    }
  }

  function patchPublish() {
    function ensureData() {
      if (
        (!window.createMediaData || !window.createMediaData.items) &&
        window.__tchiloPendingMedia
      ) {
        var it = window.__tchiloPendingMedia;
        window.createMediaData = {
          type: it.type,
          items: [it],
          src: it.url,
          file: it.file
        };
      }
    }
    if (typeof window.publishPost === 'function' && !window.publishPost.__proBtn) {
      var op = window.publishPost;
      window.publishPost = function () {
        ensureData();
        return op.apply(this, arguments);
      };
      window.publishPost.__proBtn = true;
    }
    if (typeof window.publishPostCore === 'function' && !window.publishPostCore.__proBtn) {
      var oc = window.publishPostCore;
      window.publishPostCore = async function () {
        ensureData();
        return oc.apply(this, arguments);
      };
      window.publishPostCore.__proBtn = true;
    }
  }

  function boot() {
    ensureButtons();
    patchOnMedia();
    patchPublish();
    ensureInput();
  }

  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setInterval(boot, 3000);
})();
