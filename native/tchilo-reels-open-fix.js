/**
 * Tchilo — Reels: usa a interface ORIGINAL (botões like, seguir, etc.)
 * v5 — não substitui o HTML dos slides; só garante abertura estável
 */
(function () {
  'use strict';
  if (window.__tchiloReelsOpenFixV5) return;
  window.__tchiloReelsOpenFixV5 = true;

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
    /* Só reforça visibilidade — não remove estilos do index */
    st.textContent =
      '#reelsViewer.open{display:block!important;visibility:visible!important;opacity:1!important;' +
      'pointer-events:auto!important;z-index:2147483000!important;}' +
      '#reelsViewer .reels-close{z-index:50!important;pointer-events:auto!important;}' +
      '#reelsTrack .reel-follow{z-index:30!important;pointer-events:auto!important;}' +
      '#reelsTrack .reel-actions, #reelsTrack .reel-main-actions, #reelsTrack .reel-side{' +
      'z-index:25!important;pointer-events:auto!important;}';
  }

  function ensureDom() {
    var viewer = document.getElementById('reelsViewer');
    var track = document.getElementById('reelsTrack');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'reelsViewer';
      viewer.className = 'reels-viewer';
      viewer.innerHTML =
        '<button class="reels-close" type="button" onclick="closeReels()">×</button>' +
        '<div class="reels-track" id="reelsTrack"></div>';
      document.body.appendChild(viewer);
      track = document.getElementById('reelsTrack');
    }
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
    return obj.url || obj.src || obj.media || obj.media_url || obj.publicUrl || '';
  }

  function mediaUrl(p) {
    if (!p) return '';
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url) return m.url;
      }
    } catch (e) {}
    if (Array.isArray(p.mediaItems) && p.mediaItems[0]) return pickUrl(p.mediaItems[0]);
    if (Array.isArray(p.media) && p.media[0]) return pickUrl(p.media[0]);
    return pickUrl(p.media) || p.media_url || p.video_url || '';
  }

  function isVideoPost(p) {
    if (!p) return false;
    var t = String(p.mediaType || p.media_type || '').toLowerCase();
    if (t.indexOf('video') === 0) return true;
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url && (m.type === 'video' || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(m.url))) return true;
      }
    } catch (e) {}
    var u = mediaUrl(p);
    return /\.(mp4|mov|webm|m4v|3gp)(\?|$)/i.test(u) || /video/i.test(u);
  }

  function collectVideos(startId, maxN) {
    maxN = maxN || 20;
    var all = [];
    try {
      all = typeof getPosts === 'function' ? getPosts() || [] : [];
    } catch (e) {}
    var vids = [];
    for (var i = 0; i < all.length; i++) {
      if (isVideoPost(all[i]) && mediaUrl(all[i])) vids.push(all[i]);
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
        if (found) vids.unshift(found);
      }
    }
    return vids.slice(0, maxN);
  }

  /* Guardar openReels original do index (antes de qualquer patch) */
  function captureOriginal() {
    if (window.__tchiloOpenReelsOriginal) return window.__tchiloOpenReelsOriginal;
    if (typeof window.openReels === 'function' && !window.openReels.__fast && !window.openReels.__patchedV4) {
      window.__tchiloOpenReelsOriginal = window.openReels;
      return window.openReels;
    }
    if (window.openReels && window.openReels.__isOriginal) {
      window.__tchiloOpenReelsOriginal = window.openReels.__isOriginal;
      return window.openReels.__isOriginal;
    }
    return null;
  }

  function callOriginal(startId, startTime) {
    var orig = captureOriginal();
    if (!orig) return false;
    var box = ensureDom();
    var vids = collectVideos(startId, 20);
    if (!vids.length) {
      toast('Sem vídeos');
      return true;
    }

    /* Limitar getVideoPosts só durante a chamada */
    var prevGet = window.getVideoPosts;
    window.getVideoPosts = function () {
      return vids.slice();
    };
    try {
      window.reelsPosts = vids.slice();
      orig.call(window, startId, startTime);
      /* Garantir classe open */
      box.viewer.classList.add('open');
      return true;
    } catch (err) {
      console.warn('[Tchilo Reels original]', err);
      return false;
    } finally {
      if (typeof prevGet === 'function') window.getVideoPosts = prevGet;
      else
        try {
          delete window.getVideoPosts;
        } catch (e) {
          window.getVideoPosts = prevGet;
        }
    }
  }

  function openSafe(startId, startTime) {
    injectCSS();
    ensureDom();

    /* 1) Tentar interface original completa */
    if (callOriginal(startId, startTime)) {
      /* Se o track ficou vazio, falhou */
      var track = document.getElementById('reelsTrack');
      var viewer = document.getElementById('reelsViewer');
      if (track && track.children.length > 0 && viewer && viewer.classList.contains('open')) {
        return;
      }
    }

    /* 2) Fallback mínimo SÓ se original falhar — mas com estrutura de botões básica */
    var vids = collectVideos(startId, 15);
    var box = ensureDom();
    if (!vids.length) {
      toast('Sem vídeos');
      return;
    }

    var likes = {};
    try {
      if (typeof getLikes === 'function') likes = getLikes() || {};
    } catch (e) {}

    box.track.innerHTML = vids
      .map(function (p) {
        var src = mediaUrl(p);
        if (!src) return '';
        var user = String(p.username || 'user').replace(/</g, '');
        var cap = String(p.caption || '').replace(/</g, '').slice(0, 120);
        var id = String(p.id).replace(/"/g, '');
        var isLiked = !!likes[id];
        var sess = null;
        try {
          sess = typeof getSession === 'function' ? getSession() : null;
        } catch (e2) {}
        var followBtn =
          sess && sess.username === user
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
          src.replace(/"/g, '&quot;') +
          '" loop playsinline onclick="try{toggleReelPlayback(this)}catch(e){this.paused?this.play():this.pause()}"></video>' +
          '<div class="reel-meta">' +
          '<b class="user-tap" data-user="' +
          user +
          '" onclick="event.stopPropagation();try{openUserProfile(this.getAttribute(\'data-user\'))}catch(e){}">@' +
          user +
          '</b>' +
          (cap ? '<span>' + cap + '</span>' : '') +
          '</div>' +
          '<div class="reel-actions" style="position:absolute;right:12px;bottom:120px;display:flex;flex-direction:column;gap:16px;z-index:25">' +
          '<button type="button" class="reel-main-action' +
          (isLiked ? ' liked' : '') +
          '" onclick="event.stopPropagation();try{toggleReelLike(\'' +
          id +
          '\')}catch(e){}" style="background:none;border:none;color:#fff;cursor:pointer">♥</button>' +
          '<button type="button" class="reel-main-action" onclick="event.stopPropagation();try{openComments(\'' +
          id +
          '\')}catch(e){}" style="background:none;border:none;color:#fff;cursor:pointer">💬</button>' +
          '<button type="button" class="reel-main-action" onclick="event.stopPropagation();try{openShare(\'' +
          id +
          '\')}catch(e){}" style="background:none;border:none;color:#fff;cursor:pointer">↗</button>' +
          '</div></div>'
        );
      })
      .filter(Boolean)
      .join('');

    box.viewer.classList.add('open');
    window.reelsPosts = vids;

    try {
      if (typeof setupReelsObserver === 'function') setupReelsObserver();
    } catch (e3) {}

    var first = box.track.querySelector('video');
    if (first) {
      first.play().catch(function () {
        first.muted = true;
        first.play().catch(function () {});
      });
    }
  }

  function install() {
    injectCSS();
    ensureDom();
    captureOriginal();

    if (typeof window.openReels === 'function' && !window.openReels.__patchedV5) {
      if (!window.__tchiloOpenReelsOriginal && !window.openReels.__fast && !window.openReels.__patchedV4) {
        window.__tchiloOpenReelsOriginal = window.openReels;
      }
      window.openReels = function (startId, startTime) {
        openSafe(startId, startTime);
      };
      window.openReels.__patchedV5 = true;
    } else if (typeof window.openReels !== 'function') {
      window.openReels = openSafe;
      window.openReels.__patchedV5 = true;
    }

    /* Nav Reels */
    var btn =
      document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
      document.querySelector('.navbar .nav-item[aria-label="Reels"]');
    if (btn && !btn.__reelsNavV5) {
      btn.__reelsNavV5 = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openSafe();
      });
    }
  }

  /* Capturar original o mais cedo possível, depois de o index definir openReels */
  function waitOriginal() {
    if (typeof window.openReels === 'function' && !window.openReels.__patchedV5 && !window.openReels.__fast) {
      window.__tchiloOpenReelsOriginal = window.openReels;
      install();
      return;
    }
    if (window.__tchiloOpenReelsOriginal) {
      install();
      return;
    }
    /* index ainda não carregou */
    var n = 0;
    var t = setInterval(function () {
      if (typeof window.openReels === 'function' && !window.openReels.__patchedV5 && !window.openReels.__fast) {
        window.__tchiloOpenReelsOriginal = window.openReels;
        clearInterval(t);
        install();
      } else if (++n > 80) {
        clearInterval(t);
        install();
      }
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitOriginal);
  } else {
    waitOriginal();
  }
  setTimeout(install, 2000);
})();
