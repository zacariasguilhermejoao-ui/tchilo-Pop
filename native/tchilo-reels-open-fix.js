/**
 * Tchilo — Reels: abrir pelo icone sem travar a UI
 * v3 — slides com botoes (like, mensagem, partilhar, seguir)
 */
(function () {
  'use strict';
  if (window.__tchiloReelsOpenFixV3) return;
  window.__tchiloReelsOpenFixV3 = true;
  window.__tchiloReelsOpenFixV2 = true;

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
      '#reelsTrack{height:100%;overflow-y:auto;scroll-snap-type:y mandatory;-webkit-overflow-scrolling:touch;}' +
      '#reelsTrack .reel-slide{height:100%;scroll-snap-align:start;position:relative;background:#000;}' +
      '#reelsTrack .reel-slide video{width:100%;height:100%;object-fit:contain;background:#000;}' +
      '#reelsViewer .reels-close{position:fixed;top:max(12px,env(safe-area-inset-top,0px)+8px);left:max(12px,env(safe-area-inset-left,0px)+8px);' +
      'z-index:40;width:40px;height:40px;border-radius:50%;border:none;background:rgba(0,0,0,.45);color:#fff;font-size:24px;cursor:pointer;}' +

      /* Coluna de acoes a direita */
      '#reelsTrack .reel-actions{' +
      'position:absolute!important;right:10px!important;bottom:110px!important;left:auto!important;' +
      'z-index:25!important;display:flex!important;flex-direction:column!important;' +
      'align-items:center!important;gap:18px!important;pointer-events:auto!important;}' +
      '#reelsTrack .reel-actions .act{' +
      'display:flex!important;flex-direction:column!important;align-items:center!important;' +
      'gap:4px!important;background:none!important;border:none!important;color:#fff!important;' +
      'padding:0!important;cursor:pointer!important;pointer-events:auto!important;' +
      '-webkit-user-select:none;user-select:none;}' +
      '#reelsTrack .reel-actions .act svg{width:28px!important;height:28px!important;display:block!important;' +
      'filter:drop-shadow(0 1px 3px rgba(0,0,0,.6));}' +
      '#reelsTrack .reel-actions .act span{font:700 11px Inter,system-ui,sans-serif;text-shadow:0 1px 3px #000;}' +
      '#reelsTrack .reel-actions .act.liked svg{fill:#ff2d55;stroke:#ff2d55;}' +

      /* Seguir topo direito */
      '#reelsTrack .reel-follow{' +
      'position:absolute!important;top:max(14px,calc(env(safe-area-inset-top,0px)+10px))!important;' +
      'right:max(12px,calc(env(safe-area-inset-right,0px)+8px))!important;left:auto!important;' +
      'z-index:30!important;min-width:78px!important;padding:8px 14px!important;' +
      'border:2px solid #fff!important;border-radius:10px!important;' +
      'background:rgba(0,0,0,.45)!important;color:#fff!important;' +
      'font:800 12px Inter,system-ui,sans-serif!important;cursor:pointer!important;' +
      'pointer-events:auto!important;display:inline-flex!important;}' +
      '#reelsTrack .reel-follow.following{background:rgba(255,255,255,.18)!important;}' +

      /* Meta em baixo a esquerda */
      '#reelsTrack .reel-meta{' +
      'position:absolute!important;left:12px!important;right:72px!important;' +
      'bottom:max(28px,calc(env(safe-area-inset-bottom,0px)+20px))!important;' +
      'color:#fff!important;text-shadow:0 1px 4px #000;z-index:20!important;pointer-events:none!important;}' +
      '#reelsTrack .reel-meta b{pointer-events:auto!important;cursor:pointer!important;}';
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
      viewer.querySelector('.reels-close').addEventListener('click', function () {
        if (typeof closeReels === 'function') closeReels();
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
      if (vids.length >= 40) break;
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

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function fmtCount(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function buildSlide(p) {
    var src = mediaUrl(p);
    var user = esc(p.username || 'user');
    var cap = esc(String(p.caption || '').slice(0, 120));
    var id = esc(p.id);
    var likes = fmtCount(p.likes || p.likeCount || 0);
    var comments = fmtCount(p.comments || p.commentCount || 0);

    var svgHeart =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>' +
      '</svg>';
    var svgMsg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>' +
      '</svg>';
    var svgShare =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>' +
      '<path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>' +
      '</svg>';

    return (
      '<div class="reel-slide" data-id="' +
      id +
      '">' +
      '<video src="' +
      esc(src) +
      '" loop playsinline webkit-playsinline preload="metadata"></video>' +

      '<button type="button" class="reel-follow" data-user="' +
      user +
      '" data-id="' +
      id +
      '">Seguir</button>' +

      '<div class="reel-actions">' +
      '<button type="button" class="act act-like" data-id="' +
      id +
      '" aria-label="Gostar">' +
      svgHeart +
      '<span class="cnt">' +
      likes +
      '</span></button>' +
      '<button type="button" class="act act-comment" data-id="' +
      id +
      '" aria-label="Comentarios">' +
      svgMsg +
      '<span class="cnt">' +
      comments +
      '</span></button>' +
      '<button type="button" class="act act-share" data-id="' +
      id +
      '" aria-label="Partilhar">' +
      svgShare +
      '<span>Partilhar</span></button>' +
      '</div>' +

      '<div class="reel-meta">' +
      '<b data-user="' +
      user +
      '">@' +
      user +
      '</b>' +
      (cap ? '<div style="font-size:13px;margin-top:4px">' + cap + '</div>' : '') +
      '</div></div>'
    );
  }

  function wireActions(track) {
    if (!track || track.__tchiloActionsWired) return;
    track.__tchiloActionsWired = true;

    track.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;

      // Like
      var likeBtn = t.closest && t.closest('.act-like');
      if (likeBtn) {
        e.preventDefault();
        e.stopPropagation();
        likeBtn.classList.toggle('liked');
        var cnt = likeBtn.querySelector('.cnt');
        if (cnt) {
          var n = parseInt(String(cnt.textContent).replace(/[KM]/g, ''), 10) || 0;
          if (likeBtn.classList.contains('liked')) n += 1;
          else n = Math.max(0, n - 1);
          cnt.textContent = fmtCount(n);
        }
        try {
          var pid = likeBtn.getAttribute('data-id');
          if (typeof toggleLike === 'function') toggleLike(pid);
          else if (typeof window.likePost === 'function') window.likePost(pid);
        } catch (err) {}
        return;
      }

      // Comment
      var cmtBtn = t.closest && t.closest('.act-comment');
      if (cmtBtn) {
        e.preventDefault();
        e.stopPropagation();
        var cid = cmtBtn.getAttribute('data-id');
        try {
          if (typeof openComments === 'function') openComments(cid);
          else if (typeof goTo === 'function') goTo('comments');
          else toast('Comentarios');
        } catch (err2) {}
        return;
      }

      // Share
      var shBtn = t.closest && t.closest('.act-share');
      if (shBtn) {
        e.preventDefault();
        e.stopPropagation();
        var sid = shBtn.getAttribute('data-id');
        try {
          if (typeof sharePost === 'function') sharePost(sid);
          else if (navigator.share) {
            navigator.share({ title: 'Tchilo', url: location.href }).catch(function () {});
          } else toast('Partilhar');
        } catch (err3) {}
        return;
      }

      // Follow
      var fol = t.closest && t.closest('.reel-follow');
      if (fol) {
        e.preventDefault();
        e.stopPropagation();
        var following = fol.classList.toggle('following');
        fol.textContent = following ? 'A seguir' : 'Seguir';
        try {
          var uid = fol.getAttribute('data-user');
          if (typeof toggleFollow === 'function') toggleFollow(uid);
          else if (typeof window.followUser === 'function') window.followUser(uid);
        } catch (err4) {}
        return;
      }
    });
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
      toast('Sem videos para Reels');
      opening = false;
      return;
    }

    try {
      window.reelsPosts = posts;
    } catch (e) {}

    box.viewer.classList.add('open');
    box.viewer.style.display = 'block';
    box.track.innerHTML =
      '<div style="color:#fff;padding:40px;text-align:center;font-weight:700">A carregar Reels…</div>';

    setTimeout(function () {
      try {
        box.track.innerHTML = posts.map(buildSlide).join('');
        wireActions(box.track);

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

        // Observer play/pause ao fazer scroll
        try {
          if (window._reelsObs) window._reelsObs.disconnect();
        } catch (e4) {}
        if ('IntersectionObserver' in window) {
          window._reelsObs = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (en) {
                var vid = en.target.querySelector('video');
                if (!vid) return;
                if (en.isIntersecting && en.intersectionRatio > 0.5) {
                  vid.play().catch(function () {});
                } else {
                  try {
                    vid.pause();
                  } catch (e5) {}
                }
              });
            },
            { root: box.track, threshold: [0.5, 0.7] }
          );
          box.track.querySelectorAll('.reel-slide').forEach(function (s) {
            window._reelsObs.observe(s);
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

  function safeOpen(startId, startTime) {
    // Preferir caminho fast (com botoes garantidos) se o original nao montar acoes
    openReelsFast(startId, startTime);
  }

  if (typeof window.openReels === 'function' && !window.openReels.__patchedV3) {
    window.openReels.__isOriginal = window.openReels.__isOriginal || window.openReels;
    window.openReels = function (startId, startTime) {
      try {
        openReelsFast(startId, startTime);
      } catch (err) {
        console.warn('[Tchilo openReels]', err);
        try {
          if (window.openReels.__isOriginal) window.openReels.__isOriginal.call(window, startId, startTime);
        } catch (e2) {}
      }
    };
    window.openReels.__patchedV3 = true;
    window.openReels.__patchedV2 = true;
    window.openReels.__fast = true;
  } else if (typeof window.openReels !== 'function') {
    window.openReels = openReelsFast;
    window.openReels.__patchedV3 = true;
    window.openReels.__fast = true;
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

  if (typeof window.closeReels === 'function' && !window.closeReels.__patchedV3) {
    var oc = window.closeReels;
    window.closeReels = function () {
      try {
        oc.apply(this, arguments);
      } catch (e) {}
      closeSafe();
    };
    window.closeReels.__patchedV3 = true;
  } else if (typeof window.closeReels !== 'function') {
    window.closeReels = closeSafe;
  }

  function bindNav() {
    var btn =
      document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
      document.querySelector('.navbar .nav-item[aria-label="Reels"]') ||
      document.querySelector('.bottom-nav .nav-item[data-screen="reels"]');
    if (!btn || btn.__reelsNavBoundV3) return;
    btn.__reelsNavBoundV3 = true;
    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        safeOpen();
      },
      true
    );
  }

  function boot() {
    injectCSS();
    ensureViewer();
    bindNav();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
})();
