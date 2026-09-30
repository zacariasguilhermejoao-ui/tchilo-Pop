/**
 * Tchilo — Reels: abrir pelo ícone sem travar a UI
 * v2
 */
(function () {
  'use strict';
  if (window.__tchiloReelsOpenFixV2) return;
  window.__tchiloReelsOpenFixV2 = true;

  var opening = false;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function ensureViewer() {
    var viewer = document.getElementById('reelsViewer');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'reelsViewer';
      viewer.className = 'reels-viewer';
      viewer.innerHTML =
        '<button type="button" class="reels-close" aria-label="Fechar" onclick="closeReels&&closeReels()">×</button>' +
        '<div id="reelsTrack" class="reels-track"></div>';
      document.body.appendChild(viewer);
    }
    var track = document.getElementById('reelsTrack');
    if (!track) {
      track = document.createElement('div');
      track.id = 'reelsTrack';
      track.className = 'reels-track';
      viewer.appendChild(track);
    }
    if (!document.getElementById('tchiloReelsOpenCSS')) {
      var st = document.createElement('style');
      st.id = 'tchiloReelsOpenCSS';
      st.textContent =
        '#reelsViewer{position:fixed;inset:0;z-index:2147483000;background:#000;display:none;}' +
        '#reelsViewer.open{display:block!important;}' +
        '#reelsTrack{height:100%;overflow-y:auto;scroll-snap-type:y mandatory;-webkit-overflow-scrolling:touch;}' +
        '#reelsTrack .reel-slide{height:100%;scroll-snap-align:start;position:relative;background:#000;}' +
        '#reelsTrack .reel-slide video{width:100%;height:100%;object-fit:contain;background:#000;}' +
        '#reelsViewer .reels-close{position:fixed;top:12px;left:12px;z-index:40;width:40px;height:40px;' +
        'border-radius:50%;border:none;background:rgba(0,0,0,.45);color:#fff;font-size:24px;cursor:pointer;}';
      document.head.appendChild(st);
    }
    return { viewer: viewer, track: track };
  }

  function isVideoPost(p) {
    if (!p) return false;
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url && (m.type === 'video' || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(m.url))) return true;
      }
    } catch (e) {}
    var t = String(p.mediaType || p.media_type || '').toLowerCase();
    if (t === 'video') return true;
    var u = String(p.media || p.media_url || '');
    if (/\.(mp4|mov|webm|m4v)(\?|$)/i.test(u)) return true;
    return false;
  }

  function videoPostsLimited(startId, maxN) {
    maxN = maxN || 12;
    var all = [];
    try {
      all = typeof getPosts === 'function' ? getPosts() : [];
    } catch (e) {}
    var vids = [];
    for (var i = 0; i < all.length; i++) {
      if (isVideoPost(all[i])) vids.push(all[i]);
      if (vids.length >= 40) break; // cap scan
    }
    if (startId) {
      var idx = vids.findIndex(function (p) {
        return p.id === startId;
      });
      if (idx > 0) {
        var one = vids.splice(idx, 1)[0];
        vids.unshift(one);
      } else if (idx < 0) {
        try {
          var found = all.find(function (p) {
            return p.id === startId;
          });
          if (found) vids.unshift(found);
        } catch (e2) {}
      }
    }
    return vids.slice(0, maxN);
  }

  function mediaUrl(p) {
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url) return m.url;
      }
    } catch (e) {}
    return p.media || p.media_url || p.thumbnail || '';
  }

  function buildSlide(p) {
    var src = mediaUrl(p);
    var user = String(p.username || 'user').replace(/</g, '');
    var cap = String(p.caption || '').replace(/</g, '').slice(0, 120);
    return (
      '<div class="reel-slide" data-id="' +
      String(p.id).replace(/"/g, '') +
      '">' +
      '<video src="' +
      String(src).replace(/"/g, '&quot;') +
      '" loop playsinline webkit-playsinline preload="metadata"></video>' +
      '<div class="reel-meta" style="position:absolute;left:12px;right:70px;bottom:28px;color:#fff;text-shadow:0 1px 4px #000">' +
      '<b>@' +
      user +
      '</b>' +
      (cap ? '<div style="font-size:13px;margin-top:4px">' + cap + '</div>' : '') +
      '</div></div>'
    );
  }

  function openReelsFast(startId, startTime) {
    if (opening) return;
    opening = true;
    setTimeout(function () {
      opening = false;
    }, 800);

    var box = ensureViewer();
    var posts = videoPostsLimited(startId, 12);
    if (!posts.length) {
      toast('Sem vídeos para Reels');
      opening = false;
      return;
    }

    try {
      window.reelsPosts = posts;
    } catch (e) {}

    /* abrir já o overlay (feedback imediato) */
    box.viewer.classList.add('open');
    box.viewer.style.display = 'block';
    box.track.innerHTML =
      '<div style="color:#fff;padding:40px;text-align:center;font-weight:700">A carregar Reels…</div>';

    /* montar slides no próximo tick (não cola o toque) */
    setTimeout(function () {
      try {
        box.track.innerHTML = posts.map(buildSlide).join('');
        var first = box.track.querySelector('video');
        if (first) {
          first.muted = false;
          if (typeof startTime === 'number' && startTime > 0.2) {
            try {
              first.currentTime = startTime;
            } catch (e2) {}
          }
          first.play().catch(function () {
            first.muted = true;
            first.play().catch(function () {});
          });
        }
        try {
          if (typeof setupReelsObserver === 'function') setupReelsObserver();
        } catch (e3) {}
      } catch (err) {
        console.warn('[Tchilo Reels]', err);
        toast('Erro ao abrir Reels');
        box.viewer.classList.remove('open');
      }
    }, 40);
  }

  /* Preferir openReels original se existir e for seguro; senão o fast */
  function safeOpen(startId, startTime) {
    try {
      var track = document.getElementById('reelsTrack');
      var viewer = document.getElementById('reelsViewer');
      if (typeof window.openReels === 'function' && window.openReels.__isOriginal && track && viewer) {
        /* limitar posts antes para não colar */
        try {
          var limited = videoPostsLimited(startId, 12);
          if (!limited.length) {
            toast('Sem vídeos para Reels');
            return;
          }
          var origGet = window.getVideoPosts;
          window.getVideoPosts = function () {
            return limited;
          };
          window.openReels.__isOriginal.call(window, startId, startTime);
          window.getVideoPosts = origGet;
          return;
        } catch (e) {
          console.warn('openReels orig fail', e);
        }
      }
    } catch (e2) {}
    openReelsFast(startId, startTime);
  }

  /* Marcar original e substituir */
  if (typeof window.openReels === 'function' && !window.openReels.__patchedV2) {
    window.openReels.__isOriginal = window.openReels;
    var orig = window.openReels;
    window.openReels = function (startId, startTime) {
      try {
        /* se há poucos vídeos, usa original; se muitos, fast */
        var n = 0;
        try {
          n = videoPostsLimited(null, 50).length;
        } catch (e) {}
        if (n > 15) return openReelsFast(startId, startTime);
        var track = document.getElementById('reelsTrack');
        if (!track) return openReelsFast(startId, startTime);
        return orig.apply(this, arguments);
      } catch (err) {
        console.warn('[Tchilo openReels]', err);
        openReelsFast(startId, startTime);
      }
    };
    window.openReels.__patchedV2 = true;
  } else if (typeof window.openReels !== 'function') {
    window.openReels = openReelsFast;
    window.openReels.__patchedV2 = true;
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
  }

  if (typeof window.closeReels === 'function' && !window.closeReels.__patchedV2) {
    var oc = window.closeReels;
    window.closeReels = function () {
      try {
        oc.apply(this, arguments);
      } catch (e) {}
      closeSafe();
    };
    window.closeReels.__patchedV2 = true;
  } else if (typeof window.closeReels !== 'function') {
    window.closeReels = closeSafe;
  }

  function bindNav() {
    var btn =
      document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
      document.querySelector('.navbar .nav-item[aria-label="Reels"]') ||
      document.querySelector('.bottom-nav .nav-item[data-screen="reels"]');
    if (!btn || btn.__reelsNavBoundV2) return;
    btn.__reelsNavBoundV2 = true;
    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        safeOpen();
      },
      true
    );
  }

  function boot() {
    ensureViewer();
    bindNav();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setInterval(bindNav, 3000);
})();
