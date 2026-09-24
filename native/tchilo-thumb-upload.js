/**
 * Tchilo — miniatura no upload com compressão otimizada
 * Alvo: ~30–80 KB, nítida no telemóvel, rápida a carregar no feed.
 */
(function () {
  'use strict';
  if (window.__tchiloThumbUpload) return;
  window.__tchiloThumbUpload = true;

  /* Config compressão */
  var THUMB_MAX_W = 480; /* 480px chega para feed mobile 2x */
  var THUMB_MAX_H = 854; /* ~9:16 */
  var THUMB_TARGET_BYTES = 70 * 1024; /* ~70 KB */
  var THUMB_HARD_MAX_BYTES = 120 * 1024;

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

  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) {
        canvas.toBlob(function (b) {
          resolve(b || null);
        }, type, quality);
      } else {
        try {
          var dataUrl = canvas.toDataURL(type, quality);
          fetch(dataUrl)
            .then(function (r) {
              return r.blob();
            })
            .then(resolve)
            .catch(function () {
              resolve(null);
            });
        } catch (e) {
          resolve(null);
        }
      }
    });
  }

  function supportsWebP() {
    try {
      var c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) {
      return false;
    }
  }

  /**
 * Comprime o canvas: tenta WebP, senão JPEG.
 * Reduz qualidade e/ou escala se passar do alvo de KB.
 */
  async function compressCanvas(canvas) {
    var useWebP = supportsWebP();
    var type = useWebP ? 'image/webp' : 'image/jpeg';
    var qualities = useWebP ? [0.78, 0.68, 0.58, 0.48] : [0.78, 0.68, 0.58, 0.5];

    var best = null;
    for (var i = 0; i < qualities.length; i++) {
      var blob = await canvasToBlob(canvas, type, qualities[i]);
      if (!blob || !blob.size) continue;
      best = blob;
      if (blob.size <= THUMB_TARGET_BYTES) break;
    }

    /* Ainda grande: reduz resolução 75% e re-tenta */
    if (best && best.size > THUMB_HARD_MAX_BYTES) {
      var c2 = document.createElement('canvas');
      c2.width = Math.max(160, Math.round(canvas.width * 0.75));
      c2.height = Math.max(160, Math.round(canvas.height * 0.75));
      var ctx = c2.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, c2.width, c2.height);
        for (var j = 0; j < qualities.length; j++) {
          var b2 = await canvasToBlob(c2, type, qualities[j]);
          if (!b2) continue;
          if (!best || b2.size < best.size) best = b2;
          if (b2.size <= THUMB_TARGET_BYTES) break;
        }
      }
    }

    /* Fallback JPEG se WebP falhar */
    if (!best && useWebP) {
      best = await canvasToBlob(canvas, 'image/jpeg', 0.7);
    }

    return best;
  }

  function fitSize(vw, vh) {
    var maxW = THUMB_MAX_W;
    var maxH = THUMB_MAX_H;
    var w = vw;
    var h = vh;
    if (w > maxW) {
      h = Math.round((h * maxW) / w);
      w = maxW;
    }
    if (h > maxH) {
      w = Math.round((w * maxH) / h);
      h = maxH;
    }
    w = Math.max(2, w);
    h = Math.max(2, h);
    return { w: w, h: h };
  }

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
        (async function () {
          try {
            var vw = video.videoWidth || 0;
            var vh = video.videoHeight || 0;
            if (vw < 2 || vh < 2) {
              clearTimeout(timer);
              finish(null);
              return;
            }
            var size = fitSize(vw, vh);
            var canvas = document.createElement('canvas');
            canvas.width = size.w;
            canvas.height = size.h;
            var ctx = canvas.getContext('2d');
            if (!ctx) {
              clearTimeout(timer);
              finish(null);
              return;
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(video, 0, 0, size.w, size.h);
            var blob = await compressCanvas(canvas);
            clearTimeout(timer);
            finish(blob);
          } catch (e) {
            clearTimeout(timer);
            finish(null);
          }
        })();
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
  window.tchiloCompressThumbCanvas = compressCanvas;

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

  function patchCreateMediaAssign() {
    try {
      if (window.__tchiloCreateMediaPosterHook) return;
      window.__tchiloCreateMediaPosterHook = true;
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
