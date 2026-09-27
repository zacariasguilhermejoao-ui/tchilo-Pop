/**
 * Tchilo — botão Galeria na câmera + garantir media no formato da cloud
 */
(function () {
  'use strict';
  if (window.__tchiloCamGalleryFixV1) return;
  window.__tchiloCamGalleryFixV1 = true;

  function injectCSS() {
    if (document.getElementById('tchiloCamGalCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloCamGalCSS';
    st.textContent =
      /* não esconder o botão de galeria DENTRO da câmera */
      '#tchiloCamGalBtn{display:flex!important;visibility:visible!important;' +
      'width:48px!important;height:48px!important;border-radius:12px!important;' +
      'border:2px solid rgba(255,255,255,.55)!important;padding:0!important;' +
      'overflow:hidden!important;background:rgba(0,0,0,.4)!important;' +
      'align-items:center!important;justify-content:center!important;cursor:pointer!important;}' +
      '#tchiloCamGalBtn img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;}' +
      '#tchiloCamGalBtn .gal-ph{color:#fff;font-size:11px;font-weight:800;}' +
      '#tchiloCamGalInput{position:fixed!important;left:-9999px!important;opacity:0!important;width:1px!important;height:1px!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureGalInput() {
    var input = document.getElementById('tchiloCamGalInput');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'tchiloCamGalInput';
      input.accept = 'image/*,video/*';
      input.multiple = true;
      document.body.appendChild(input);
      input.addEventListener('change', onGalleryPicked);
    }
    return input;
  }

  function setCreateMediaFromFiles(files) {
    var list = Array.prototype.slice.call(files || []).filter(Boolean);
    if (!list.length) return;
    var items = list.map(function (file) {
      var isVid = (file.type || '').indexOf('video/') === 0;
      var url = URL.createObjectURL(file);
      return {
        url: url,
        type: isVid ? 'video' : 'image',
        file: file,
        mime: file.type || (isVid ? 'video/mp4' : 'image/jpeg'),
        name: file.name || (isVid ? 'galeria.mp4' : 'galeria.jpg')
      };
    });
    /* formato que publishPostCore / tchiloCloud esperam */
    window.createMediaData = {
      items: items,
      src: items[0].url,
      type: items[0].type,
      file: items[0].file
    };
    window.createMediaFiles = list;
    try {
      if (typeof window.tchiloCloseCamera === 'function') window.tchiloCloseCamera();
    } catch (e) {}
    try {
      if (typeof goTo === 'function') goTo('create');
    } catch (e) {}
    /* pré-visualização no ecrã criar */
    setTimeout(function () {
      try {
        if (typeof renderCreatePreview === 'function') renderCreatePreview();
      } catch (e) {}
      try {
        var preview = document.getElementById('createPreview');
        if (preview && items[0]) {
          preview.classList.add('has-media');
          preview.querySelectorAll('img,video').forEach(function (n) {
            try {
              n.remove();
            } catch (e2) {}
          });
          if (items[0].type === 'video') {
            var v = document.createElement('video');
            v.src = items[0].url;
            v.controls = true;
            v.playsInline = true;
            preview.appendChild(v);
          } else {
            var img = document.createElement('img');
            img.src = items[0].url;
            img.alt = '';
            preview.appendChild(img);
          }
        }
      } catch (e) {}
    }, 100);
  }

  function onGalleryPicked(e) {
    var files = e.target.files;
    e.target.value = '';
    if (!files || !files.length) return;
    setCreateMediaFromFiles(files);
  }

  function openGalleryPicker(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    ensureGalInput().click();
  }

  function updateGalThumb(btn) {
    if (!btn) return;
    /* tenta última imagem local se existir */
    try {
      var last = localStorage.getItem('tchilo_last_gallery_thumb');
      if (last) {
        btn.innerHTML = '<img src="' + last + '" alt="">';
        return;
      }
    } catch (e) {}
    if (!btn.querySelector('img') && !btn.querySelector('.gal-ph')) {
      btn.innerHTML = '<span class="gal-ph">Galeria</span>';
    }
  }

  function ensureGalleryButton() {
    injectCSS();
    var root = document.getElementById('tchiloCam');
    if (!root) return;
    var acts = root.querySelector('.acts');
    if (!acts) return;

    var btn = document.getElementById('tchiloCamGalBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloCamGalBtn';
      btn.setAttribute('aria-label', 'Galeria');
      btn.innerHTML = '<span class="gal-ph">Galeria</span>';
      btn.addEventListener('click', openGalleryPicker);
      /* substituir o placeholder 48px à esquerda do shutter */
      var placeholder = acts.querySelector('div[style*="width:48px"]');
      if (placeholder) {
        acts.replaceChild(btn, placeholder);
      } else {
        var shutter = document.getElementById('tchiloCamShutter');
        if (shutter && shutter.parentNode === acts) {
          acts.insertBefore(btn, shutter);
        } else {
          acts.insertBefore(btn, acts.firstChild);
        }
      }
    }
    updateGalThumb(btn);
  }

  /** Corrige deliver da câmera: items[] obrigatório para upload Supabase */
  function patchDeliver() {
    if (window.__tchiloDeliverPatched) return;
    /* interceptar createMediaData assignments via periodic check + publish pre-hook */
    window.__tchiloDeliverPatched = true;

    var origPublish =
      typeof window.publishPostCore === 'function'
        ? window.publishPostCore
        : null;

    function normalizeCreateMedia() {
      var d = window.createMediaData;
      if (!d) return;
      if (d.items && d.items.length) {
        /* já ok — garantir file em cada item */
        d.items = d.items.map(function (it) {
          if (!it.file && window.createMediaFiles && window.createMediaFiles[0]) {
            it.file = window.createMediaFiles[0];
          }
          return it;
        });
        return;
      }
      /* formato antigo da câmera: {src,type,file} */
      if (d.src || d.file || d.url) {
        var url = d.src || d.url;
        var file = d.file || (window.createMediaFiles && window.createMediaFiles[0]) || null;
        var type = d.type || (file && file.type && file.type.indexOf('video/') === 0 ? 'video' : 'image');
        window.createMediaData = {
          items: [
            {
              url: url,
              type: type,
              file: file,
              mime: (file && file.type) || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
              name: (file && file.name) || (type === 'video' ? 'cam.mp4' : 'cam.jpg')
            }
          ],
          src: url,
          type: type,
          file: file
        };
      }
    }

    if (typeof window.publishPost === 'function' && !window.publishPost.__normMedia) {
      var op = window.publishPost;
      window.publishPost = function () {
        normalizeCreateMedia();
        return op.apply(this, arguments);
      };
      window.publishPost.__normMedia = true;
    }

    if (origPublish && !window.publishPostCore.__normMedia) {
      window.publishPostCore = async function () {
        normalizeCreateMedia();
        return origPublish.apply(this, arguments);
      };
      window.publishPostCore.__normMedia = true;
    }

    /* patch deliver if exposed later */
    setInterval(function () {
      normalizeCreateMedia();
      ensureGalleryButton();
    }, 2000);
  }

  function boot() {
    injectCSS();
    ensureGalInput();
    ensureGalleryButton();
    patchDeliver();
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setTimeout(ensureGalleryButton, 3000);

  /* quando a câmara abre */
  var obs = new MutationObserver(function () {
    if (document.getElementById('tchiloCam')) ensureGalleryButton();
  });
  try {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
