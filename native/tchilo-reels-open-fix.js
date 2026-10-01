/**
 * Tchilo Reels — correção definitiva
 * v6: chama openReels ORIGINAL (botões completos); melhora deteção de vídeo; CSS fixo
 */
(function () {
  'use strict';
  if (window.__tchiloReelsOpenFixV6) return;
  window.__tchiloReelsOpenFixV6 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function injectCSS() {
    var st = document.getElementById('tchiloReelsFixCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloReelsFixCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#reelsViewer.reels-viewer,#reelsViewer{' +
      'position:fixed!important;inset:0!important;z-index:2147483000!important;' +
      'background:#000!important;flex-direction:column!important;}' +
      '#reelsViewer.open{display:flex!important;visibility:visible!important;opacity:1!important;' +
      'pointer-events:auto!important;}' +
      '#reelsTrack{flex:1!important;height:100%!important;overflow-y:scroll!important;' +
      'scroll-snap-type:y mandatory!important;-webkit-overflow-scrolling:touch!important;}' +
      '#reelsTrack .reel-slide{height:100%!important;min-height:100%!important;' +
      'scroll-snap-align:start!important;position:relative!important;}' +
      '#reelsTrack .reel-slide video{width:100%!important;height:100%!important;' +
      'object-fit:cover!important;background:#000!important;}' +
      '#reelsViewer .reels-close{z-index:50!important;pointer-events:auto!important;}' +
      '#reelsTrack .reel-actions{z-index:30!important;pointer-events:auto!important;' +
      'display:flex!important;flex-direction:column!important;}' +
      '#reelsTrack .reel-follow{z-index:35!important;pointer-events:auto!important;}' +
      '#reelsTrack .reel-meta{z-index:20!important;}';
  }

  function ensureDom() {
    var viewer = document.getElementById('reelsViewer');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'reelsViewer';
      viewer.className = 'reels-viewer';
      viewer.innerHTML =
        '<button class="reels-close" type="button" onclick="closeReels()" aria-label="Fechar">×</button>' +
        '<div class="reels-track" id="reelsTrack"></div>';
      document.body.appendChild(viewer);
    }
    var track = document.getElementById('reelsTrack');
    if (!track) {
      track = document.createElement('div');
      track.id = 'reelsTrack';
      track.className = 'reels-track';
      viewer.appendChild(track);
    }
    viewer.classList.add('reels-viewer');
    return { viewer: viewer, track: track };
  }

  function mediaUrlOf(p) {
    if (!p) return '';
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url) return m.url;
      }
    } catch (e) {}
    if (Array.isArray(p.mediaItems) && p.mediaItems[0]) {
      var a = p.mediaItems[0];
      return typeof a === 'string' ? a : a.url || a.media_url || '';
    }
    if (Array.isArray(p.media) && p.media[0]) {
      var b = p.media[0];
      return typeof b === 'string' ? b : b.url || '';
    }
    return p.media_url || (typeof p.media === 'string' ? p.media : '') || p.video_url || '';
  }

  function isVideoPost(p) {
    if (!p) return false;
    var t = String(p.mediaType || p.media_type || '').toLowerCase();
    if (t === 'video' || t.indexOf('video/') === 0) return true;
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url) {
          if (m.type === 'video') return true;
          if (typeof tchiloIsVideoType === 'function' && tchiloIsVideoType(m.type, m.url)) return true;
        }
      }
    } catch (e) {}
    var u = mediaUrlOf(p);
    if (!u) return false;
    if (typeof tchiloIsVideoType === 'function') return tchiloIsVideoType(t, u);
    return /\.(mp4|webm|mov|m4v|3gp)(\?|$)/i.test(u) || /video/i.test(u);
  }

  function collectVideos(startId, maxN) {
    maxN = maxN || 25;
    var all = [];
    try {
      all = typeof getPosts === 'function' ? getPosts() || [] : [];
    } catch (e) {}
    var vids = [];
    for (var i = 0; i < all.length; i++) {
      if (isVideoPost(all[i]) && mediaUrlOf(all[i])) vids.push(all[i]);
      if (vids.length >= 80) break;
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
        if (found && mediaUrlOf(found)) vids.unshift(found);
      }
    }
    return vids.slice(0, maxN);
  }

  /* Melhorar getVideoPosts global (para o openReels original) */
  function patchGetVideoPosts() {
    window.getVideoPosts = function () {
      return collectVideos(null, 40);
    };
  }

  function captureOriginalOpenReels() {
    if (window.__tchiloOpenReelsNative) return window.__tchiloOpenReelsNative;
    var fn = window.openReels;
    if (typeof fn === 'function' && !fn.__tchiloWrapper && !fn.__fast && !fn.__patchedV4 && !fn.__patchedV5 && !fn.__patchedV6) {
      window.__tchiloOpenReelsNative = fn;
      return fn;
    }
    if (fn && fn.__isOriginal) {
      window.__tchiloOpenReelsNative = fn.__isOriginal;
      return fn.__isOriginal;
    }
    return window.__tchiloOpenReelsNative || null;
  }

  function openWithOriginal(startId, startTime) {
    var orig = captureOriginalOpenReels();
    if (typeof orig !== 'function') return false;
    var box = ensureDom();
    var vids = collectVideos(startId, 25);
    if (!vids.length) {
      toast('Sem vídeos');
      return true;
    }
    patchGetVideoPosts();
    window.reelsPosts = vids.slice();
    /* getVideoPosts devolve a lista limitada */
    var prev = window.getVideoPosts;
    window.getVideoPosts = function () {
      return vids.slice();
    };
    try {
      orig.call(window, startId, startTime);
    } catch (err) {
      console.warn('[Reels original]', err);
      window.getVideoPosts = prev;
      return false;
    }
    window.getVideoPosts = prev;

    box.viewer.classList.add('open');
    /* se track vazio, original falhou */
    if (!box.track.children.length) return false;

    /* forçar play no primeiro */
    setTimeout(function () {
      var v = box.track.querySelector('video');
      if (!v) return;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.loop = true;
      var tryPlay = function () {
        v.play().catch(function () {
          v.muted = true;
          v.play().catch(function () {});
        });
      };
      if (v.readyState >= 2) tryPlay();
      else {
        v.addEventListener('loadeddata', tryPlay, { once: true });
        try {
          v.load();
        } catch (e) {}
      }
    }, 60);

    try {
      if (typeof setupReelsObserver === 'function') setupReelsObserver();
    } catch (e2) {}

    return true;
  }

  /** Fallback com a MESMA estrutura de botões do index */
  function openFallback(startId, startTime) {
    var box = ensureDom();
    var vids = collectVideos(startId, 20);
    if (!vids.length) {
      toast('Sem vídeos');
      return;
    }
    window.reelsPosts = vids;

    var likes = {};
    var shares = {};
    var saves = {};
    try {
      if (typeof getLikes === 'function') likes = getLikes() || {};
    } catch (e) {}
    try {
      if (typeof getShareCounts === 'function') shares = getShareCounts() || {};
    } catch (e2) {}
    try {
      if (typeof getSaves === 'function') saves = getSaves() || {};
    } catch (e3) {}

    var sess = null;
    try {
      sess = typeof getSession === 'function' ? getSession() : null;
    } catch (e4) {}

    function esc(s) {
      return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
    }
    function fmt(n) {
      n = Number(n) || 0;
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      return String(n);
    }

    box.track.innerHTML = vids
      .map(function (p) {
        var src = mediaUrlOf(p);
        if (!src) return '';
        var id = esc(p.id);
        var user = esc(p.username || 'user');
        var cap = esc(String(p.caption || '').slice(0, 160));
        var isLiked = !!likes[p.id];
        var likeCount = (p.likes || 0) + (isLiked ? 1 : 0);
        var shareCount = shares[p.id] || 0;
        var isSaved = !!saves[p.id];
        var followBtn =
          sess && sess.username === p.username
            ? ''
            : '<button class="reel-follow" data-username="' +
              user +
              '" onclick="event.stopPropagation();try{toggleReelFollow(this)}catch(e){}">Seguir</button>';

        return (
          '<div class="reel-slide" data-id="' +
          id +
          '">' +
          followBtn +
          '<video src="' +
          esc(src) +
          '" loop playsinline webkit-playsinline preload="auto" ' +
          'onclick="try{toggleReelPlayback(this)}catch(e){this.paused?this.play():this.pause()}"></video>' +
          '<div class="reel-meta">' +
          '<b class="user-tap" data-user="' +
          user +
          '" onclick="event.stopPropagation();try{openUserProfile(\'' +
          user +
          '\')}catch(e){}">@' +
          user +
          '</b>' +
          (cap ? '<span>' + cap + '</span>' : '') +
          '</div>' +
          '<div class="reel-actions">' +
          '<button class="reel-main-action' +
          (isLiked ? ' liked' : '') +
          '" title="Gostar" onclick="event.stopPropagation();try{toggleReelLike(\'' +
          id +
          '\',this)}catch(e){}">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.4 2 5 5.5 5c2 0 3.3 1 4.5 2.6C11.2 6 12.5 5 14.5 5 18 5 19.6 8.4 22 11.7 19.5 16.1 12 21 12 21z"/></svg>' +
          '<span class="reel-action-count">' +
          fmt(likeCount) +
          '</span></button>' +
          '<button class="reel-main-action' +
          (isSaved ? ' saved-active' : '') +
          '" title="Guardar" onclick="event.stopPropagation();try{toggleReelSaveQuick(\'' +
          id +
          '\',this)}catch(e){}">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 4h12v17l-6-3-6 3z"/></svg></button>' +
          '<button class="reel-main-action" title="Comentar" onclick="event.stopPropagation();try{openComments(\'' +
          id +
          '\')}catch(e){}">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg></button>' +
          '<button class="reel-main-action" title="Partilhar" onclick="event.stopPropagation();try{openShare(\'' +
          id +
          '\')}catch(e){}">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
          '<span class="reel-action-count">' +
          fmt(shareCount) +
          '</span></button>' +
          '<button class="reel-more" title="Mais" onclick="event.stopPropagation();try{openReelMenu(\'' +
          id +
          '\')}catch(e){}">⋯</button>' +
          '</div></div>'
        );
      })
      .filter(Boolean)
      .join('');

    box.viewer.classList.add('open');

    try {
      if (typeof setupReelsObserver === 'function') setupReelsObserver();
    } catch (e) {}

    var first = box.track.querySelector('video');
    if (first) {
      if (typeof startTime === 'number' && startTime > 0.2) {
        try {
          first.currentTime = startTime;
        } catch (e5) {}
      }
      first.play().catch(function () {
        first.muted = true;
        first.play().catch(function () {});
      });
    }
  }

  function openSafe(startId, startTime) {
    injectCSS();
    ensureDom();
    if (openWithOriginal(startId, startTime)) return;
    openFallback(startId, startTime);
  }

  function closeSafe() {
    var viewer = document.getElementById('reelsViewer');
    if (viewer) viewer.classList.remove('open');
    try {
      document.querySelectorAll('#reelsTrack video').forEach(function (v) {
        try {
          v.pause();
        } catch (e) {}
      });
    } catch (e2) {}
    try {
      if (window._reelsObs) window._reelsObs.disconnect();
    } catch (e3) {}
  }

  function install() {
    injectCSS();
    ensureDom();
    captureOriginalOpenReels();
    patchGetVideoPosts();

    window.openReels = function (startId, startTime) {
      openSafe(startId, startTime);
    };
    window.openReels.__patchedV6 = true;
    window.openReels.__tchiloWrapper = true;

    if (typeof window.closeReels === 'function' && !window.closeReels.__patchedV6) {
      var oc = window.closeReels;
      window.closeReels = function () {
        try {
          oc.apply(this, arguments);
        } catch (e) {}
        closeSafe();
      };
      window.closeReels.__patchedV6 = true;
    } else if (typeof window.closeReels !== 'function') {
      window.closeReels = closeSafe;
      window.closeReels.__patchedV6 = true;
    }

    var btn =
      document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
      document.querySelector('.navbar .nav-item[aria-label="Reels"]');
    if (btn && !btn.__reelsNavV6) {
      btn.__reelsNavV6 = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openSafe();
      });
    }
  }

  function waitAndInstall() {
    var n = 0;
    var t = setInterval(function () {
      if (typeof window.openReels === 'function' && !window.openReels.__tchiloWrapper) {
        window.__tchiloOpenReelsNative = window.openReels;
        clearInterval(t);
        install();
      } else if (++n > 60) {
        clearInterval(t);
        install();
      }
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndInstall);
  } else {
    waitAndInstall();
  }
  setTimeout(install, 2500);
})();
