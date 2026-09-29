/**
 * Tchilo — seleção de vídeo/foto da galeria (forçado)
 * Grava SEMPRE em window.createMediaData E tenta a variável lexical createMediaData
 */
(function () {
  'use strict';
  if (window.__tchiloVideoPickV6) return;
  window.__tchiloVideoPickV6 = true;

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
    if (!t && (file.size || 0) > 1500000) return true;
    return false;
  }

  function syncLexical(data) {
    window.createMediaData = data;
    try {
      (0, eval)('createMediaData = window.createMediaData');
    } catch (e) {}
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
    var data = {
      type: item.type,
      items: [item],
      src: url,
      file: file
    };
    syncLexical(data);
    return item;
  }

  function paint(item) {
    if (!item) return;
    var preview = document.getElementById('createPreview');
    if (!preview) return;

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
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000;z-index:2;overflow:hidden;border-radius:inherit';

    if (item.type === 'video') {
      var v = document.createElement('video');
      v.src = item.url;
      v.controls = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.muted = true;
      v.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain';
      layer.appendChild(v);
      try {
        v.play().catch(function () {});
      } catch (e) {}
      try {
        if (typeof setThemeSectionVisible === 'function') setThemeSectionVisible(false);
      } catch (e2) {}
    } else {
      var img = document.createElement('img');
      img.src = item.url;
      img.alt = '';
      img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain';
      layer.appendChild(img);
      try {
        if (typeof setThemeSectionVisible === 'function') setThemeSectionVisible(false);
      } catch (e3) {}
    }

    preview.style.position = preview.style.position || 'relative';
    preview.appendChild(layer);

    var rm = document.getElementById('removeMediaBtn');
    if (rm) rm.style.display = 'block';

    try {
      if (typeof window.tchiloGetCreateMediaData === 'function') {
        /* trigger music btn */
      }
    } catch (e4) {}
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    var file = files[0];
    var item = setPending(file);
    paint(item);
    toast(item.type === 'video' ? 'Vídeo pronto a publicar' : 'Foto pronta a publicar');
    try {
      var input = document.getElementById('mediaInput');
      if (input) input.value = '';
    } catch (e) {}
  }

  function wireInput() {
    var input = document.getElementById('mediaInput');
    if (!input) return;
    if (input.__tchiloPickV6) return;
    input.__tchiloPickV6 = true;
    input.addEventListener(
      'change',
      function (e) {
        e.stopPropagation();
        handleFiles(e.target.files);
      },
      true
    );
  }

  function wireGalleryBtn() {
    var btn = document.getElementById('galleryBtn');
    if (!btn || btn.__tchiloPickV6) return;
    btn.__tchiloPickV6 = true;
    btn.addEventListener(
      'click',
      function (e) {
        var input = document.getElementById('mediaInput');
        if (input) {
          /* deixa o handler nativo + o nosso change */
          try {
            input.accept = 'image/*,video/*';
          } catch (err) {}
        }
      },
      true
    );
  }

  function boot() {
    wireInput();
    wireGalleryBtn();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setInterval(boot, 3000);
})();
