/**
 * Tchilo — gera miniatura do vídeo no upload e grava no Storage + post.thumbnail
 */
(function () {
  'use strict';
  if (window.__tchiloThumbUpload) return;
  window.__tchiloThumbUpload = true;

  function isVideoItem(item) {
    if (!item) return false;
    if (item.type === 'video') return true;
    if (item.mime && String(item.mime).indexOf('video') === 0) return true;
    if (item.file && item.file.type && String(item.file.type).indexOf('video') === 0) return true;
    if (item.url && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(item.url)) return true;
    return false;
  }

  function hasPoster(item) {
    if (!item) return false;
    if (item.posterFile && item.posterFile.size) return true;
    if (item.poster && String(item.poster).indexOf('data:') === 0) return true;
    if (item.poster && String(item.poster).indexOf('http') === 0) return true;
    return false;
  }

  /** Extrai JPEG do frame ~0.4–1s do vídeo */
  function generateVideoThumbnailBlob(fileOrBlob) {
    return new Promise(function (resolve) {
      if (!fileOrBlob) return resolve(null);
      var url = null;
      try {
        url = URL.createObjectURL(fileOrBlob);
      } catch (e) {
        return resolve(null);
      }
      var video = document.createElement('video');
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.preload = 'auto';
      video.crossOrigin = 'anonymous';

      var done = false;
      var finish = function (blob) {
        if (done) return;
        done = true;
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
        resolve(blob || null);
      };

      var timer = setTimeout(function () {
        finish(null);
      }, 12000);

      video.onerror = function () {
        clearTimeout(timer);
        finish(null);
      };

      video.onloadedmetadata = function () {
        try {
          var d = Number(video.duration);
          var t = 0.5;
          if (Number.isFinite(d) && d > 0) {
            t = Math.min(Math.max(d * 0.08, 0.35), Math.min(d * 0.5, 2.5));
          }
          video.currentTime = t;
        } catch (e) {
          try {
            video.currentTime = 0.3;
          } catch (e2) {
            clearTimeout(timer);
            finish(null);
          }
        }
      };

      video.onseeked = function () {
        try {
          var vw = video.videoWidth || 0;
          var vh = video.videoHeight || 0;
          if (vw < 2 || vh < 2) {
            clearTimeout(timer);
            finish(null);
            return;
          }
          var maxW = 720;
          var w = Math.min(maxW, vw);
          var h = Math.round(w * (vh / vw));
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          if (!ctx) {
            clearTimeout(timer);
            finish(null);
            return;
          }
          ctx.drawImage(video, 0, 0, w, h);
          if (canvas.toBlob) {
            canvas.toBlob(
              function (blob) {
                clearTimeout(timer);
                finish(blob);
              },
              'image/jpeg',
              0.85
            );
          } else {
            try {
              var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              fetch(dataUrl)
                .then(function (r) {
                  return r.blob();
                })
                .then(function (b) {
                  clearTimeout(timer);
                  finish(b);
                })
                .catch(function () {
                  clearTimeout(timer);
                  finish(null);
                });
            } catch (e) {
              clearTimeout(timer);
              finish(null);
            }
          }
        } catch (e) {
          clearTimeout(timer);
          finish(null);
        }
      };

      video.src = url;
      try {
        video.load();
      } catch (e) {}
    });
  }

  async function ensureItemPoster(item) {
    if (!isVideoItem(item) || hasPoster(item)) return item;
    var blob = null;
    try {
      if (item.file && (item.file instanceof Blob || item.file instanceof File)) {
        blob = item.file;
      } else if (item.url && String(item.url).indexOf('blob:') === 0) {
        blob = await (await fetch(item.url)).blob();
      } else if (item.url && String(item.url).indexOf('data:') === 0) {
        blob = await (await fetch(item.url)).blob();
      }
    } catch (e) {
      return item;
    }
    if (!blob || !blob.size) return item;
    var thumb = await generateVideoThumbnailBlob(blob);
    if (thumb && thumb.size) {
      item.posterFile = thumb;
      try {
        item.poster = URL.createObjectURL(thumb);
      } catch (e) {}
    }
    return item;
  }

  async function ensureItemsPosters(items) {
    if (!items || !items.length) return items || [];
    var out = [];
    for (var i = 0; i < items.length; i++) {
      out.push(await ensureItemPoster(items[i]));
    }
    return out;
  }

  window.tchiloGenerateVideoThumbnail = generateVideoThumbnailBlob;
  window.tchiloEnsureVideoPosters = ensureItemsPosters;

  function patchCloudPublish() {
    if (!window.tchiloCloud || typeof window.tchiloCloud.publishPost !== 'function') return false;
    if (window.tchiloCloud.publishPost.__thumbPatched) return true;
    var orig = window.tchiloCloud.publishPost;
    window.tchiloCloud.publishPost = async function (post, items) {
      var withThumbs = await ensureItemsPosters(items);
      var result = await orig.call(this, post, withThumbs);
      try {
        if (result && result.mediaItems && result.mediaItems[0]) {
          var th =
            result.mediaItems[0].thumbnail ||
            result.mediaItems[0].poster ||
            null;
          if (th && post) {
            post.thumbnail = th;
            post.poster = th;
          }
        }
      } catch (e) {}
      return result;
    };
    window.tchiloCloud.publishPost.__thumbPatched = true;
    return true;
  }

  /** Ao escolher vídeo no create, gera poster logo para o preview */
  function patchCreateMediaAssign() {
    try {
      if (window.__tchiloCreateMediaPosterHook) return;
      window.__tchiloCreateMediaPosterHook = true;
      var desc = Object.getOwnPropertyDescriptor(window, 'createMediaData');
      /* createMediaData é let no scope do index — observamos mudanças via polling leve */
      var lastRef = null;
      setInterval(function () {
        try {
          var data = window.createMediaData;
          if (!data || !data.items || !data.items.length) {
            lastRef = null;
            return;
          }
          if (data === lastRef) return;
          lastRef = data;
          data.items.forEach(function (item) {
            if (!isVideoItem(item) || hasPoster(item)) return;
            if (item.__thumbGen) return;
            item.__thumbGen = true;
            ensureItemPoster(item).then(function (it) {
              if (it && it.poster) {
                var preview = document.getElementById('createPreview');
                if (preview) {
                  var vid = preview.querySelector('video');
                  if (vid) {
                    vid.setAttribute('poster', it.poster);
                    vid.poster = it.poster;
                  }
                }
              }
            });
          });
        } catch (e) {}
      }, 700);
    } catch (e) {}
  }

  function boot() {
    patchCloudPublish();
    patchCreateMediaAssign();
    setTimeout(patchCloudPublish, 800);
    setTimeout(patchCloudPublish, 2500);
    setTimeout(patchCloudPublish, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
