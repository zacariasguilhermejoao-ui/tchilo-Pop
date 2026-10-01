/**
 * Tchilo — Reels estáveis
 * v4: URLs de vídeo corretas, sem ficar em "A carregar", nav sem bloquear
 */
(function () {
  'use strict';
  if (window.__tchiloReelsOpenFixV4) return;
  window.__tchiloReelsOpenFixV4 = true;

  var opening = false;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function injectCSS() {
    var st = document.getElementById('tchiloReelsOpenCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloReelsOpenCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#reelsViewer{position:fixed;inset:0;z-index:2147483000;background:#000;display:none;}' +
      '#reelsViewer.open{display:block!important;}' +
      '#reelsTrack{height:100%;height:100dvh;overflow-y:auto;scroll-snap-type:y mandatory;' +
      '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}' +
      '#reelsTrack .reel-slide{height:100%;height:100dvh;min-height:100%;scroll-snap-align:start;' +
      'position:relative;background:#000;}' +
      '#reelsTrack .reel-slide video{width:100%;height:100%;object-fit:contain;background:#000;}' +
      '#reelsViewer .reels-close{position:fixed;top:max(12px,env(safe-area-inset-top,0px)+8px);' +
      'left:max(12px,env(safe-area-inset-left,0px)+8px);z-index:50;width:44px;height:44px;' +
      'border-radius:50%;border:none;background:rgba(0,0,0,.55);color:#fff;font-size:28px;' +
      'line-height:1;cursor:pointer;}' +
      '#reelsTrack .reel-meta{position:absolute;left:14px;right:72px;' +
      'bottom:max(24px,env(safe-area-inset-bottom,0px)+16px);color:#fff;' +
      'text-shadow:0 1px 4px #000;z-index:20;pointer-events:none;}' +
      '#reelsTrack .reel-meta b{pointer-events:auto;cursor:pointer;}' +
      '#reelsTrack .reel-empty{color:#fff;padding:48px 24px;text-align:center;font-weight:700;}';
  }

  function ensureViewer() {
    injectCSS();
    var viewer = document.getElementById('reelsViewer');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'reelsViewer';
      viewer.className = 'reels-viewer';
      viewer.innerHTML =
        '<button type="button" class="reels-close" aria-label="Fechar">×</button>' +
        '<div id="reelsTrack" class="reels-track"></div>';
      document.body.appendChild(viewer);
    }
    var closeBtn = viewer.querySelector('.reels-close');
    if (closeBtn && !closeBtn.__bound) {
      closeBtn.__bound = true;
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeSafe();
      });
    }
    var track = document.getElementById('reelsTrack');
    if (!track) {
      track = document.createElement('div');
      track.id = 'reelsTrack';
      track.className = 'reels-track';
      viewer.appendChild(track);
    }
    return { viewer: viewer, track: track };
  }

  function pickUrl(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return (
      obj.url ||
      obj.src ||
      obj.media ||
      obj.media_url ||
      obj.publicUrl ||
      obj.public_url ||
      ''
    );
  }

  function mediaUrl(p) {
    if (!p) return '';
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url) return m.url;
      }
    } catch (e) {}
    if (Array.isArray(p.mediaItems) && p.mediaItems[0]) {
      var u = pickUrl(p.mediaItems[0]);
      if (u) return u;
    }
    if (Array.isArray(p.media) && p.media[0]) {
      var u2 = pickUrl(p.media[0]);
      if (u2) return u2;
    }
    return pickUrl(p.media) || p.media_url || p.video_url || p.thumbnail_url || p.thumbnail || '';
  }

  function isVideoUrl(u) {
    u = String(u || '').toLowerCase();
    if (!u) return false;
    if (/\.(mp4|mov|webm|m4v|3gp|mkv)(\?|$)/i.test(u)) return true;
    if (u.indexOf('video') >= 0) return true;
    if (u.indexOf('/object/public/') >= 0 && u.indexOf('image') < 0) return true;
    return false;
  }

  function isVideoPost(p) {
    if (!p) return false;
    var t = String(p.mediaType || p.media_type || '').toLowerCase();
    if (t === 'video' || t.indexOf('video') === 0) return true;
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url && (m.type === 'video' || isVideoUrl(m.url))) return true;
      }
    } catch (e) {}
    if (Array.isArray(p.mediaItems)) {
      for (var i = 0; i < p.mediaItems.length; i++) {
        var it = p.mediaItems[i];
        if (!it) continue;
        if (String(it.type || '').toLowerCase() === 'video') return true;
        if (isVideoUrl(pickUrl(it))) return true;
      }
    }
    return isVideoUrl(mediaUrl(p));
  }

  function allPosts() {
    try {
      if (typeof getPosts === 'function') return getPosts() || [];
    } catch (e) {}
    return [];
  }

  function videoPostsLimited(startId, maxN) {
    maxN = maxN || 15;
    var all = allPosts();
    var vids = [];
    for (var i = 0; i < all.length; i++) {
      if (isVideoPost(all[i]) && mediaUrl(all[i])) vids.push(all[i]);
      if (vids.length >= 60) break;
    }
    if (startId) {
      var idx = vids.findIndex(function (p) {
        return String(p.id) === String(startId);
      });
      if (idx > 0) {
        var one = vids.splice(idx, 1)[0];
        vids.unshift(one);
      } else if (idx < 0) {
        var found = all.find(function (p) {
          return String(p.id) === String(startId);
        });
        if (found && mediaUrl(found)) vids.unshift(found);
      }
    }
    return vids.slice(0, maxN);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function buildSlide(p) {
    var src = mediaUrl(p);
    if (!src) return '';
    var user = esc(p.username || 'user');
    var cap = esc(String(p.caption || '').slice(0, 140));
    var id = esc(p.id);
    return (
      '<div class="reel-slide" data-id="' +
      id +
      '">' +
      '<video src="' +
      esc(src) +
      '" playsinline webkit-playsinline loop preload="auto" ' +
      'muted ' +
      'onclick="try{this.paused?this.play():this.pause()}catch(e){}"></video>' +
      '<div class="reel-meta">' +
      '<b onclick="event.stopPropagation();try{openUserProfile&&openUserProfile(\'' +
      user +
      '\')}catch(e){}">@' +
      user +
      '</b>' +
      (cap ? '<div style="font-size:13px;margin-top:6px;font-weight:600">' + cap + '</div>' : '') +
      '</div></div>'
    );
  }

  function setupObserver(track) {
    try {
      if (window._reelsObs) window._reelsObs.disconnect();
    } catch (e) {}
    if (!('IntersectionObserver' in window) || !track) return;
    window._reelsObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          var vid = en.target.querySelector('video');
          if (!vid) return;
          if (en.isIntersecting && en.intersectionRatio > 0.55) {
            vid.muted = false;
            vid.play().catch(function () {
              vid.muted = true;
              vid.play().catch(function () {});
            });
          } else {
            try {
              vid.pause();
            } catch (e2) {}
          }
        });
      },
      { root: track, threshold: [0.55] }
    );
    track.querySelectorAll('.reel-slide').forEach(function (slide) {
      window._reelsObs.observe(slide);
    });
  }

  function openReelsFast(startId, startTime) {
    if (opening) return;
    opening = true;

    var box = ensureViewer();
    var posts = videoPostsLimited(startId, 15);

    box.viewer.classList.add('open');
    box.viewer.style.display = 'block';

    if (!posts.length) {
      box.track.innerHTML =
        '<div class="reel-empty">Sem vídeos para Reels.<br><br>Publica um vídeo no feed e volta aqui.</div>';
      opening = false;
      return;
    }

    try {
      window.reelsPosts = posts;
    } catch (e) {}

    var html = posts.map(buildSlide).filter(Boolean).join('');
    if (!html) {
      box.track.innerHTML =
        '<div class="reel-empty">Os vídeos não têm URL válida.</div>';
      opening = false;
      return;
    }

    box.track.innerHTML = html;
    setupObserver(box.track);

    var first = box.track.querySelector('video');
    if (first) {
      var play = function () {
        try {
          if (typeof startTime === 'number' && startTime > 0.2) {
            first.currentTime = startTime;
          }
        } catch (e2) {}
        first.muted = false;
        first.play().catch(function () {
          first.muted = true;
          first.play().catch(function () {});
        });
      };
      if (first.readyState >= 2) play();
      else {
        first.addEventListener('loadeddata', play, { once: true });
        first.load();
      }
    }

    opening = false;
  }

  function closeSafe() {
    var viewer = document.getElementById('reelsViewer');
    if (viewer) {
      viewer.classList.remove('open');
      viewer.style.display = 'none';
    }
    try {
      document.querySelectorAll('#reelsTrack video').forEach(function (v) {
        try {
          v.pause();
        } catch (e) {}
      });
    } catch (e2) {}
    opening = false;
  }

  /* Substituir openReels */
  window.openReels = function (startId, startTime) {
    try {
      openReelsFast(startId, startTime);
    } catch (err) {
      console.warn('[Tchilo Reels]', err);
      toast('Erro ao abrir Reels');
      opening = false;
    }
  };
  window.openReels.__patchedV4 = true;
  window.openReels.__fast = true;

  if (typeof window.closeReels !== 'function' || !window.closeReels.__patchedV4) {
    var prevClose = window.closeReels;
    window.closeReels = function () {
      try {
        if (typeof prevClose === 'function' && !prevClose.__patchedV4) prevClose();
      } catch (e) {}
      closeSafe();
    };
    window.closeReels.__patchedV4 = true;
  }

  function bindNav() {
    var btn =
      document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
      document.querySelector('.navbar .nav-item[aria-label="Reels"]');
    if (!btn || btn.__reelsNavBoundV4) return;
    btn.__reelsNavBoundV4 = true;
    /* Não usar capture+stopImmediatePropagation (colava outros ícones) */
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openReelsFast();
    });
  }

  function boot() {
    ensureViewer();
    bindNav();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
