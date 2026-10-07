/**
 * Tchilo Reels v8
 * - Usa openReels ORIGINAL (botoes like/comentar/partilhar/seguir/X)
 * - Limita a 8 videos para nao colar
 * - Fallback com UI completa se original falhar
 */
(function () {
  'use strict';
  if (window.__tchiloReelsOpenFixV8) return;
  window.__tchiloReelsOpenFixV8 = true;

  var MAX = 8;
  var opening = false;

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
      '#reelsViewer:not(.open){display:none!important;pointer-events:none!important;visibility:hidden!important;}' +
      '#reelsViewer.open{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;}' +
      '#reelsTrack{flex:1!important;height:100%!important;overflow-y:scroll!important;' +
      'scroll-snap-type:y mandatory!important;-webkit-overflow-scrolling:touch!important;}' +
      '#reelsTrack .reel-slide{height:100%!important;min-height:100%!important;scroll-snap-align:start!important;position:relative!important;}' +
      '#reelsTrack .reel-slide video{width:100%!important;height:100%!important;object-fit:cover!important;}' +
      '#reelsViewer .reels-close{z-index:50!important;pointer-events:auto!important;}' +
      '#reelsTrack .reel-actions,#reelsTrack .reel-follow,#reelsTrack .reel-meta{pointer-events:auto!important;}';
  }

  function mediaUrl(p) {
    if (!p) return '';
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url) return m.url;
      }
    } catch (e) {}
    return p.media_url || p.video_url || (typeof p.media === 'string' ? p.media : '') || '';
  }

  function isVideo(p) {
    if (!p) return false;
    var t = String(p.mediaType || p.media_type || '').toLowerCase();
    if (t === 'video' || t.indexOf('video/') === 0) return true;
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.type === 'video') return true;
      }
    } catch (e) {}
    return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(mediaUrl(p));
  }

  function collect(startId) {
    var list = [];
    try {
      if (typeof getVideoPosts === 'function') list = getVideoPosts() || [];
    } catch (e) {}
    if (!list.length) {
      try {
        var all = typeof getPosts === 'function' ? getPosts() || [] : [];
        list = all.filter(isVideo);
      } catch (e2) {}
    }
    if (startId) {
      var idx = list.findIndex(function (p) {
        return p && String(p.id) === String(startId);
      });
      if (idx > 0) {
        var one = list.splice(idx, 1)[0];
        list.unshift(one);
      }
    }
    return list.slice(0, MAX);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function slideHtml(p) {
    var src = mediaUrl(p);
    if (!src) return '';
    var id = esc(p.id);
    var user = esc(p.username || '');
    var cap = esc((p.caption || '').slice(0, 120));
    var likes = 0;
    var isLiked = false;
    try {
      var L = typeof getLikes === 'function' ? getLikes() : {};
      isLiked = !!L[p.id];
      likes = (p.likes || 0) + (isLiked ? 1 : 0);
    } catch (e) {}
    var me = '';
    try {
      var s = typeof getSession === 'function' ? getSession() : null;
      me = s && s.username ? s.username : '';
    } catch (e2) {}
    var followBtn =
      me && user && me !== p.username
        ? '<button class="reel-follow" data-username="' +
          user +
          '" onclick="event.stopPropagation();if(typeof toggleReelFollow===\'function\')toggleReelFollow(this)">Seguir</button>'
        : '';
    return (
      '<div class="reel-slide" data-id="' +
      id +
      '">' +
      followBtn +
      '<video src="' +
      esc(src) +
      '" loop playsinline webkit-playsinline muted preload="metadata" ' +
      'onclick="if(typeof toggleReelPlayback===\'function\')toggleReelPlayback(this)"></video>' +
      '<div class="reel-meta">' +
      '<b class="user-tap" data-user="' +
      user +
      '" onclick="event.stopPropagation();if(typeof openUserProfile===\'function\')openUserProfile(this.getAttribute(\'data-user\'))">@' +
      user +
      '</b>' +
      (cap ? '<span>' + cap + '</span>' : '') +
      '</div>' +
      '<div class="reel-actions">' +
      '<button class="reel-main-action' +
      (isLiked ? ' liked' : '') +
      '" onclick="event.stopPropagation();if(typeof toggleReelLike===\'function\')toggleReelLike(\'' +
      id +
      '\')">♥<span class="reel-action-count">' +
      likes +
      '</span></button>' +
      '<button class="reel-main-action" onclick="event.stopPropagation();if(typeof openComments===\'function\')openComments(\'' +
      id +
      '\')">💬</button>' +
      '<button class="reel-main-action" onclick="event.stopPropagation();if(typeof openShare===\'function\')openShare(\'' +
      id +
      '\')">↗</button>' +
      '<button class="reel-more" onclick="event.stopPropagation();if(typeof openReelMenu===\'function\')openReelMenu(\'' +
      id +
      '\')">⋯</button>' +
      '</div></div>'
    );
  }

  function openFallback(startId, startTime) {
    injectCSS();
    var viewer = document.getElementById('reelsViewer');
    var track = document.getElementById('reelsTrack');
    if (!viewer || !track) {
      toast('Reels indisponível');
      return;
    }
    var list = collect(startId);
    if (!list.length) {
      toast('Sem vídeos');
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) html += slideHtml(list[i]);
    track.innerHTML = html;
    viewer.classList.add('open');
    viewer.style.setProperty('display', 'flex', 'important');

    var first = track.querySelector('video');
    if (first) {
      first.muted = true;
      first.loop = true;
      var play = function () {
        try {
          if (typeof startTime === 'number' && startTime > 0.15) first.currentTime = startTime;
        } catch (e) {}
        first.play().catch(function () {});
      };
      if (first.readyState >= 1) play();
      else first.addEventListener('loadedmetadata', play, { once: true });
    }
    try {
      if (typeof setupReelsObserver === 'function') setupReelsObserver();
    } catch (e2) {}
  }

  function openSafe(startId, startTime) {
    if (opening) return;
    opening = true;
    setTimeout(function () {
      opening = false;
    }, 600);

    injectCSS();
    var list = collect(startId);
    if (!list.length) {
      toast('Sem vídeos');
      opening = false;
      return;
    }

    /* Preferir o openReels nativo do index (UI completa) com lista limitada */
    var native = window.__tchiloOpenReelsNative;
    if (typeof native === 'function') {
      var origGet = window.getVideoPosts;
      window.getVideoPosts = function () {
        return list;
      };
      try {
        native.call(window, startId, startTime);
        /* garantir open e play */
        setTimeout(function () {
          var v = document.getElementById('reelsViewer');
          if (v) {
            v.classList.add('open');
            v.style.setProperty('display', 'flex', 'important');
          }
          var vid = document.querySelector('#reelsTrack video');
          if (vid) {
            vid.muted = true;
            vid.play().catch(function () {});
          }
        }, 50);
        return;
      } catch (e) {
        console.warn('[reels-v8] native fail', e);
      } finally {
        if (origGet) window.getVideoPosts = origGet;
      }
    }
    openFallback(startId, startTime);
  }

  function closeSafe() {
    try {
      var v = document.getElementById('reelsViewer');
      if (v) {
        v.classList.remove('open');
        v.style.removeProperty('display');
      }
      document.querySelectorAll('#reelsTrack video').forEach(function (vid) {
        try {
          vid.pause();
        } catch (e) {}
      });
      if (window._reelsObs) window._reelsObs.disconnect();
    } catch (e2) {}
    opening = false;
  }

  function captureNative() {
    if (typeof window.openReels === 'function' && !window.openReels.__tchiloWrapper && !window.openReels.__patchedV8) {
      window.__tchiloOpenReelsNative = window.openReels;
      return true;
    }
    return !!window.__tchiloOpenReelsNative;
  }

  function install() {
    injectCSS();
    captureNative();

    window.openReels = function (startId, startTime) {
      openSafe(startId, startTime);
    };
    window.openReels.__patchedV8 = true;
    window.openReels.__tchiloWrapper = true;

    var prevClose = window.closeReels;
    window.closeReels = function () {
      try {
        if (typeof prevClose === 'function' && !prevClose.__patchedV8) prevClose.apply(this, arguments);
      } catch (e) {}
      closeSafe();
    };
    window.closeReels.__patchedV8 = true;

    /* botao X no viewer */
    try {
      var btn = document.querySelector('#reelsViewer .reels-close');
      if (btn && !btn.__v8) {
        btn.__v8 = true;
        btn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          closeSafe();
        };
      }
    } catch (e) {}
  }

  /* Capturar nativo cedo, depois instalar wrapper */
  var tries = 0;
  var iv = setInterval(function () {
    captureNative();
    if (window.__tchiloOpenReelsNative || ++tries > 40) {
      clearInterval(iv);
      install();
    }
  }, 50);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      captureNative();
      install();
    });
  } else {
    captureNative();
    install();
  }
  setTimeout(install, 1500);
})();
