/**
 * Tchilo — galeria de perfil: zoom + legendas + swipe
 */
(function () {
  'use strict';
  if (window.__tchiloProfilePhotosV2) return;
  window.__tchiloProfilePhotosV2 = true;

  var state = {
    items: [],
    index: 0,
    username: '',
    touchX: null,
    scale: 1,
    tx: 0,
    ty: 0,
    pinching: false,
    lastTap: 0
  };

  function injectUI() {
    if (document.getElementById('tchiloPhotoViewer')) return;

    var st = document.createElement('style');
    st.id = 'tchiloPhotoViewerCSS';
    st.textContent =
      '#tchiloPhotoViewer{display:none;position:fixed;inset:0;z-index:10050;' +
      'background:rgba(0,0,0,.96);align-items:center;justify-content:center;' +
      'flex-direction:column;touch-action:none;}' +
      '#tchiloPhotoViewer.open{display:flex!important;}' +
      '#tchiloPhotoViewer .tpv-img-wrap{flex:1;width:100%;display:flex;align-items:center;' +
      'justify-content:center;overflow:hidden;position:relative;min-height:0;}' +
      '#tchiloPhotoViewer img.tpv-img{max-width:100%;max-height:100%;object-fit:contain;' +
      'user-select:none;-webkit-user-drag:none;transform-origin:center center;' +
      'will-change:transform;transition:transform .15s ease-out;}' +
      '#tchiloPhotoViewer img.tpv-img.dragging{transition:none;}' +
      '#tchiloPhotoViewer .tpv-close{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));' +
      'right:14px;width:40px;height:40px;border-radius:50%;border:0;' +
      'background:rgba(255,255,255,.15);color:#fff;font-size:24px;line-height:1;' +
      'cursor:pointer;z-index:3;}' +
      '#tchiloPhotoViewer .tpv-nav{position:absolute;top:50%;transform:translateY(-50%);' +
      'width:44px;height:44px;border-radius:50%;border:0;' +
      'background:rgba(255,255,255,.12);color:#fff;font-size:28px;' +
      'cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;}' +
      '#tchiloPhotoViewer .tpv-prev{left:8px;}' +
      '#tchiloPhotoViewer .tpv-next{right:8px;}' +
      '#tchiloPhotoViewer .tpv-nav[hidden]{display:none!important;}' +
      '#tchiloPhotoViewer .tpv-counter{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));' +
      'left:0;right:0;text-align:center;color:rgba(255,255,255,.9);' +
      'font:600 13px system-ui,sans-serif;pointer-events:none;z-index:3;}' +
      '#tchiloPhotoViewer .tpv-caption{position:absolute;left:0;right:0;' +
      'bottom:0;padding:16px 18px calc(18px + env(safe-area-inset-bottom,0px));' +
      'background:linear-gradient(transparent,rgba(0,0,0,.75));' +
      'color:#fff;font:500 14px/1.4 system-ui,sans-serif;z-index:3;' +
      'max-height:35%;overflow:auto;text-align:left;}' +
      '#tchiloPhotoViewer .tpv-caption:empty{display:none;}' +
      '#tchiloPhotoViewer .tpv-caption b{display:block;font-size:13px;opacity:.8;margin-bottom:4px;}' +
      '#tchiloPhotoViewer .tpv-dots{position:absolute;bottom:calc(8px + env(safe-area-inset-bottom,0px));' +
      'left:0;right:0;display:flex;justify-content:center;gap:6px;z-index:4;pointer-events:none;}' +
      '#tchiloPhotoViewer .tpv-caption ~ .tpv-dots,' +
      '#tchiloPhotoViewer .tpv-dots{bottom:calc(12px + env(safe-area-inset-bottom,0px));}' +
      '#tchiloPhotoViewer.has-caption .tpv-dots{bottom:calc(72px + env(safe-area-inset-bottom,0px));}' +
      '#tchiloPhotoViewer .tpv-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.35);}' +
      '#tchiloPhotoViewer .tpv-dot.on{background:#fff;}' +
      '.profile-avatar{cursor:pointer;}';
    document.head.appendChild(st);

    var box = document.createElement('div');
    box.id = 'tchiloPhotoViewer';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML =
      '<button type="button" class="tpv-close" aria-label="Fechar">×</button>' +
      '<div class="tpv-counter"></div>' +
      '<button type="button" class="tpv-nav tpv-prev" aria-label="Anterior">‹</button>' +
      '<button type="button" class="tpv-nav tpv-next" aria-label="Seguinte">›</button>' +
      '<div class="tpv-img-wrap"><img class="tpv-img" alt=""></div>' +
      '<div class="tpv-caption"></div>' +
      '<div class="tpv-dots"></div>';
    document.body.appendChild(box);

    box.querySelector('.tpv-close').onclick = function (e) {
      e.stopPropagation();
      closeViewer();
    };
    box.querySelector('.tpv-prev').onclick = function (e) {
      e.stopPropagation();
      showIndex(state.index - 1);
    };
    box.querySelector('.tpv-next').onclick = function (e) {
      e.stopPropagation();
      showIndex(state.index + 1);
    };
    box.addEventListener('click', function (e) {
      if (e.target === box) closeViewer();
    });

    bindZoomAndSwipe(box);

    document.addEventListener('keydown', function (e) {
      var v = document.getElementById('tchiloPhotoViewer');
      if (!v || !v.classList.contains('open')) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft') showIndex(state.index - 1);
      if (e.key === 'ArrowRight') showIndex(state.index + 1);
      if (e.key === '+' || e.key === '=') setZoom(state.scale + 0.25);
      if (e.key === '-') setZoom(state.scale - 0.25);
    });
  }

  function applyTransform(img, animate) {
    if (!img) return;
    if (!animate) img.classList.add('dragging');
    else img.classList.remove('dragging');
    img.style.transform =
      'translate(' + state.tx + 'px,' + state.ty + 'px) scale(' + state.scale + ')';
  }

  function resetZoom() {
    state.scale = 1;
    state.tx = 0;
    state.ty = 0;
    var img = document.querySelector('#tchiloPhotoViewer img.tpv-img');
    applyTransform(img, true);
  }

  function setZoom(s) {
    state.scale = Math.max(1, Math.min(4, s));
    if (state.scale === 1) {
      state.tx = 0;
      state.ty = 0;
    }
    var img = document.querySelector('#tchiloPhotoViewer img.tpv-img');
    applyTransform(img, true);
  }

  function bindZoomAndSwipe(box) {
    var wrap = box.querySelector('.tpv-img-wrap');
    var img = box.querySelector('.tpv-img');
    var pointers = {};
    var pinchStartDist = 0;
    var pinchStartScale = 1;
    var panStartX = 0;
    var panStartY = 0;
    var panOriginTx = 0;
    var panOriginTy = 0;
    var swipeStartX = 0;
    var swipeActive = false;

    function dist(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function pointerList() {
      return Object.keys(pointers).map(function (k) {
        return pointers[k];
      });
    }

    wrap.addEventListener(
      'wheel',
      function (e) {
        if (!box.classList.contains('open')) return;
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.12 : 0.12;
        setZoom(state.scale + delta);
      },
      { passive: false }
    );

    wrap.addEventListener('dblclick', function (e) {
      e.preventDefault();
      if (state.scale > 1.2) setZoom(1);
      else setZoom(2.5);
    });

    wrap.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches) return;
        for (var i = 0; i < e.touches.length; i++) {
          var t = e.touches[i];
          pointers[t.identifier] = { x: t.clientX, y: t.clientY };
        }
        var pts = pointerList();
        if (pts.length === 2) {
          state.pinching = true;
          swipeActive = false;
          pinchStartDist = dist(pts[0], pts[1]) || 1;
          pinchStartScale = state.scale;
        } else if (pts.length === 1) {
          swipeStartX = pts[0].x;
          panStartX = pts[0].x;
          panStartY = pts[0].y;
          panOriginTx = state.tx;
          panOriginTy = state.ty;
          swipeActive = state.scale <= 1.05;
          state.touchX = pts[0].x;

          var now = Date.now();
          if (now - state.lastTap < 280) {
            if (state.scale > 1.2) setZoom(1);
            else setZoom(2.5);
            state.lastTap = 0;
          } else {
            state.lastTap = now;
          }
        }
      },
      { passive: true }
    );

    wrap.addEventListener(
      'touchmove',
      function (e) {
        if (!e.touches) return;
        for (var i = 0; i < e.touches.length; i++) {
          var t = e.touches[i];
          pointers[t.identifier] = { x: t.clientX, y: t.clientY };
        }
        var pts = pointerList();
        if (pts.length === 2 && state.pinching) {
          e.preventDefault();
          var d = dist(pts[0], pts[1]) || 1;
          state.scale = Math.max(1, Math.min(4, pinchStartScale * (d / pinchStartDist)));
          if (state.scale === 1) {
            state.tx = 0;
            state.ty = 0;
          }
          applyTransform(img, false);
        } else if (pts.length === 1 && state.scale > 1.05) {
          e.preventDefault();
          state.tx = panOriginTx + (pts[0].x - panStartX);
          state.ty = panOriginTy + (pts[0].y - panStartY);
          applyTransform(img, false);
        }
      },
      { passive: false }
    );

    wrap.addEventListener(
      'touchend',
      function (e) {
        if (e.changedTouches) {
          for (var i = 0; i < e.changedTouches.length; i++) {
            delete pointers[e.changedTouches[i].identifier];
          }
        }
        var pts = pointerList();
        if (pts.length < 2) state.pinching = false;

        if (swipeActive && state.scale <= 1.05 && e.changedTouches && e.changedTouches[0]) {
          var dx = e.changedTouches[0].clientX - swipeStartX;
          if (Math.abs(dx) > 50) {
            if (dx < 0) showIndex(state.index + 1);
            else showIndex(state.index - 1);
          }
        }
        swipeActive = false;
        applyTransform(img, true);
      },
      { passive: true }
    );
  }

  function uniqueItems(list) {
    var out = [];
    var seen = {};
    (list || []).forEach(function (it) {
      if (!it || !it.url) return;
      if (seen[it.url]) return;
      seen[it.url] = 1;
      out.push({
        url: it.url,
        caption: it.caption || '',
        label: it.label || ''
      });
    });
    return out;
  }

  function collectPhotosForUser(username) {
    var items = [];
    if (!username) return items;

    function add(url, caption, label) {
      if (!url) return;
      items.push({ url: url, caption: caption || '', label: label || '' });
    }

    try {
      if (window.__tchiloAvatarCache && window.__tchiloAvatarCache[username]) {
        add(window.__tchiloAvatarCache[username], '', 'Foto de perfil');
      }
    } catch (e) {}

    try {
      if (typeof resolveUserAvatarUrl === 'function') {
        var a = resolveUserAvatarUrl(username);
        if (a) add(a, '', 'Foto de perfil');
      }
    } catch (e) {}

    try {
      if (typeof getProfileExtra === 'function') {
        var extra = getProfileExtra(username);
        if (extra && extra.avatar) add(extra.avatar, extra.bio || '', 'Foto de perfil');
      }
    } catch (e) {}

    try {
      var session =
        typeof getSession === 'function'
          ? getSession()
          : JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      if (session && session.username === username && session.avatar) {
        add(session.avatar, '', 'Foto de perfil');
      }
    } catch (e) {}

    try {
      document.querySelectorAll('.profile-avatar img').forEach(function (im) {
        if (im.src) add(im.src, '', 'Foto de perfil');
      });
    } catch (e) {}

    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      (posts || []).forEach(function (p) {
        if (!p || p.username !== username) return;
        var cap = (p.caption || p.title || '').trim();
        var label = '@' + username;
        if (p.media && p.mediaType !== 'video') add(p.media, cap, label);
        if (p.thumbnail && p.mediaType === 'video') add(p.thumbnail, cap, label);
        if (Array.isArray(p.mediaItems)) {
          p.mediaItems.forEach(function (m) {
            if (!m) return;
            if (m.type === 'video') {
              if (m.thumbnail || m.poster) add(m.thumbnail || m.poster, cap, label);
            } else if (m.url) {
              add(m.url, cap, label);
            }
          });
        }
      });
    } catch (e) {}

    return uniqueItems(items);
  }

  function currentProfileUsername() {
    try {
      if (window.viewingProfileUser) return String(window.viewingProfileUser);
    } catch (e) {}
    try {
      var session =
        typeof getSession === 'function'
          ? getSession()
          : JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return session && session.username ? session.username : '';
    } catch (e) {
      return '';
    }
  }

  function showIndex(i) {
    if (!state.items.length) return;
    var n = state.items.length;
    state.index = ((i % n) + n) % n;
    resetZoom();

    var box = document.getElementById('tchiloPhotoViewer');
    if (!box) return;
    var item = state.items[state.index];
    var img = box.querySelector('.tpv-img');
    if (img && item) img.src = item.url;

    var multi = n > 1;
    box.querySelector('.tpv-prev').hidden = !multi;
    box.querySelector('.tpv-next').hidden = !multi;

    var counter = box.querySelector('.tpv-counter');
    if (counter) counter.textContent = multi ? state.index + 1 + ' / ' + n : '';

    var captionEl = box.querySelector('.tpv-caption');
    if (captionEl) {
      var parts = [];
      if (item.label) parts.push('<b>' + escapeHtml(item.label) + '</b>');
      if (item.caption) parts.push(escapeHtml(item.caption));
      captionEl.innerHTML = parts.join('');
      box.classList.toggle('has-caption', !!parts.length);
    }

    var dots = box.querySelector('.tpv-dots');
    if (dots) {
      if (!multi) {
        dots.innerHTML = '';
      } else {
        var html = '';
        for (var d = 0; d < n && d < 12; d++) {
          html += '<span class="tpv-dot' + (d === state.index ? ' on' : '') + '"></span>';
        }
        dots.innerHTML = html;
      }
    }
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openViewer(items, startIndex) {
    injectUI();
    state.items = uniqueItems(items);
    if (!state.items.length) return;
    state.index = Math.max(0, Math.min(startIndex || 0, state.items.length - 1));
    var box = document.getElementById('tchiloPhotoViewer');
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    showIndex(state.index);
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {}
  }

  function closeViewer() {
    var box = document.getElementById('tchiloPhotoViewer');
    if (!box) return;
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    resetZoom();
    try {
      document.body.style.overflow = '';
    } catch (e) {}
  }

  function openProfilePhotos(username, startUrl) {
    username = username || currentProfileUsername();
    var items = collectPhotosForUser(username);
    if (!items.length && startUrl) {
      items = [{ url: startUrl, caption: '', label: 'Foto de perfil' }];
    }
    if (!items.length) return;
    var start = 0;
    if (startUrl) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].url === startUrl) {
          start = i;
          break;
        }
      }
    }
    state.username = username;
    openViewer(items, start);
  }

  window.tchiloOpenProfilePhotos = openProfilePhotos;

  function onAvatarClick(e) {
    var av = e.target.closest && e.target.closest('.profile-avatar');
    if (!av) return;
    if (e.target.closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    var img = av.querySelector('img');
    var startUrl = img && img.src ? img.src : null;
    openProfilePhotos(currentProfileUsername(), startUrl);
  }

  function boot() {
    injectUI();
    document.addEventListener('click', onAvatarClick, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
