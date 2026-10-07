/**
 * Tchilo Reels v7 — abre sem colar o telemovel
 * Limita slides iniciais, DOM em batches, close fiavel
 */
(function () {
  'use strict';
  if (window.__tchiloReelsOpenFixV7) return;
  window.__tchiloReelsOpenFixV7 = true;

  var MAX_INITIAL = 6;
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
      '#reelsViewer.open{display:flex!important;visibility:visible!important;opacity:1!important;' +
      'pointer-events:auto!important;}' +
      '#reelsTrack{flex:1!important;height:100%!important;overflow-y:scroll!important;' +
      'scroll-snap-type:y mandatory!important;-webkit-overflow-scrolling:touch!important;}' +
      '#reelsTrack .reel-slide{height:100%!important;min-height:100%!important;' +
      'scroll-snap-align:start!important;position:relative!important;background:#000;}' +
      '#reelsTrack .reel-slide video{width:100%!important;height:100%!important;' +
      'object-fit:cover!important;background:#000!important;}' +
      '#reelsViewer .reels-close{position:fixed!important;top:max(12px,env(safe-area-inset-top)+8px)!important;' +
      'left:max(12px,env(safe-area-inset-left)+8px)!important;z-index:50!important;' +
      'width:40px;height:40px;border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;' +
      'font:700 22px system-ui,sans-serif;pointer-events:auto!important;}' +
      '#reelsTrack .reel-actions{z-index:30!important;pointer-events:auto!important;}';
  }

  function ensureDom() {
    var viewer = document.getElementById('reelsViewer');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'reelsViewer';
      viewer.className = 'reels-viewer';
      viewer.innerHTML =
        '<button class="reels-close" type="button" aria-label="Fechar">×</button>' +
        '<div class="reels-track" id="reelsTrack"></div>';
      document.body.appendChild(viewer);
      viewer.querySelector('.reels-close').onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeSafe();
      };
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

  function mediaUrlOf(p) {
    if (!p) return '';
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && m.url) return m.url;
      }
    } catch (e) {}
    return p.media_url || p.video_url || (typeof p.media === 'string' ? p.media : '') || '';
  }

  function isVideoPost(p) {
    if (!p) return false;
    var t = String(p.mediaType || p.media_type || '').toLowerCase();
    if (t === 'video' || t.indexOf('video/') === 0) return true;
    try {
      if (typeof resolveMedia === 'function') {
        var m = resolveMedia(p);
        if (m && (m.type === 'video' || (m.url && /\.(mp4|webm|mov)/i.test(m.url)))) return true;
      }
    } catch (e) {}
    var u = mediaUrlOf(p);
    return !!(u && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u));
  }

  function collectVideos(startId) {
    var list = [];
    try {
      if (typeof getVideoPosts === 'function') list = getVideoPosts() || [];
    } catch (e) {}
    if (!list.length) {
      try {
        var all = typeof getPosts === 'function' ? getPosts() || [] : [];
        list = all.filter(isVideoPost);
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
    return list;
  }

  function slideHtml(p) {
    var src = mediaUrlOf(p);
    if (!src) return '';
    var id = p.id || '';
    var user = p.username || p.user || '';
    return (
      '<div class="reel-slide" data-id="' +
      String(id).replace(/"/g, '') +
      '">' +
      '<video src="' +
      String(src).replace(/"/g, '&quot;') +
      '" playsinline webkit-playsinline loop preload="metadata" muted></video>' +
      '<div class="reel-meta" style="position:absolute;left:12px;bottom:88px;color:#fff;text-shadow:0 1px 4px #000;font:700 14px system-ui,sans-serif">@' +
      String(user).replace(/</g, '') +
      '</div></div>'
    );
  }

  function playFirst(track) {
    try {
      var v = track.querySelector('video');
      if (!v) return;
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function openSafe(startId, startTime) {
    if (opening) return;
    opening = true;
    setTimeout(function () {
      opening = false;
    }, 800);

    injectCSS();
    var dom = ensureDom();
    var list = collectVideos(startId);
    if (!list.length) {
      toast('Sem vídeos');
      opening = false;
      return;
    }

    /* So os primeiros N — evita colar o telemovel */
    var initial = list.slice(0, MAX_INITIAL);
    var html = '';
    for (var i = 0; i < initial.length; i++) {
      html += slideHtml(initial[i]);
    }
    dom.track.innerHTML = html;
    dom.viewer.classList.add('open');
    dom.viewer.style.setProperty('display', 'flex', 'important');

    /* play no primeiro frame seguinte */
    requestAnimationFrame(function () {
      playFirst(dom.track);
    });

    /* carregar mais em idle, se houver */
    if (list.length > MAX_INITIAL) {
      setTimeout(function () {
        try {
          var more = list.slice(MAX_INITIAL, MAX_INITIAL + 10);
          var frag = '';
          for (var j = 0; j < more.length; j++) frag += slideHtml(more[j]);
          if (frag) dom.track.insertAdjacentHTML('beforeend', frag);
        } catch (e) {}
      }, 600);
    }
  }

  function closeSafe() {
    try {
      var viewer = document.getElementById('reelsViewer');
      if (viewer) {
        viewer.classList.remove('open');
        viewer.style.setProperty('display', 'none', 'important');
      }
      document.querySelectorAll('#reelsTrack video').forEach(function (v) {
        try {
          v.pause();
          v.removeAttribute('src');
          v.load();
        } catch (e) {}
      });
      var track = document.getElementById('reelsTrack');
      if (track) track.innerHTML = '';
    } catch (e2) {}
    opening = false;
  }

  function install() {
    injectCSS();
    ensureDom();

    window.openReels = function (startId, startTime) {
      openSafe(startId, startTime);
    };
    window.openReels.__patchedV7 = true;

    window.closeReels = function () {
      closeSafe();
    };
    window.closeReels.__patchedV7 = true;

    /* Botao visual de reels (2o nav) — se for messages com icone reels, abre reels */
    try {
      var items = document.querySelectorAll('.navbar .nav-item');
      var reelsBtn =
        document.querySelector('.navbar .nav-item[data-screen="reels"]') ||
        document.querySelector('.navbar .nav-item[aria-label="Reels"]');
      if (!reelsBtn && items.length >= 2) {
        /* nao forcar o 2o botao (mensagens) a ser reels — so se tiver aria/img reels */
        var cand = items[1];
        if (
          cand &&
          (cand.querySelector('img[src*="reels"], img[alt*="[Rr]eel"]') ||
            /reels/i.test(cand.getAttribute('aria-label') || ''))
        ) {
          reelsBtn = cand;
        }
      }
      if (reelsBtn && !reelsBtn.__reelsNavV7) {
        reelsBtn.__reelsNavV7 = true;
        reelsBtn.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            openSafe();
          },
          true
        );
      }
    } catch (e) {}
  }

  install();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  setTimeout(install, 500);
  setTimeout(install, 2000);
})();
