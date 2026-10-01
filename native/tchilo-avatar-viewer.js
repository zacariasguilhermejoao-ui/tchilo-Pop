/**
 * Tchilo — abrir foto de perfil em ecrã cheio
 * Zoom (pinça / duplo toque) · deslizar se houver várias · legenda
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarViewerV1) return;
  window.__tchiloAvatarViewerV1 = true;

  var state = {
    open: false,
    photos: [],
    index: 0,
    scale: 1,
    tx: 0,
    ty: 0
  };

  function injectCSS() {
    if (document.getElementById('tchiloAvatarViewerCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAvatarViewerCSS';
    st.textContent =
      '#tchiloAvViewer{position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.96);' +
      'display:none;flex-direction:column;align-items:stretch;justify-content:center;' +
      'touch-action:none;}' +
      '#tchiloAvViewer.open{display:flex!important;}' +
      '#tchiloAvViewer .av-top{position:absolute;top:0;left:0;right:0;z-index:5;' +
      'display:flex;align-items:center;justify-content:space-between;' +
      'padding:max(12px,env(safe-area-inset-top)) 14px 10px;}' +
      '#tchiloAvViewer .av-close,#tchiloAvViewer .av-count{' +
      'background:rgba(255,255,255,.12);border:none;color:#fff;font-weight:800;' +
      'border-radius:999px;padding:8px 14px;font-size:14px;cursor:pointer;}' +
      '#tchiloAvViewer .av-stage{flex:1;position:relative;overflow:hidden;' +
      'display:flex;align-items:center;justify-content:center;}' +
      '#tchiloAvViewer .av-img{max-width:100%;max-height:100%;object-fit:contain;' +
      'transform-origin:center center;will-change:transform;user-select:none;' +
      '-webkit-user-drag:none;}' +
      '#tchiloAvViewer .av-caption{position:absolute;left:0;right:0;bottom:0;z-index:5;' +
      'padding:14px 16px max(18px,env(safe-area-inset-bottom));' +
      'background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;' +
      'font:600 14px Inter,system-ui,sans-serif;text-align:center;}' +
      '#tchiloAvViewer .av-nav{position:absolute;top:50%;transform:translateY(-50%);' +
      'z-index:6;width:44px;height:44px;border-radius:50%;border:none;' +
      'background:rgba(255,255,255,.15);color:#fff;font-size:22px;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;}' +
      '#tchiloAvViewer .av-prev{left:8px;}' +
      '#tchiloAvViewer .av-next{right:8px;}' +
      '#tchiloAvViewer .av-nav[hidden]{display:none!important;}';
    document.head.appendChild(st);
  }

  function ensureUI() {
    injectCSS();
    var el = document.getElementById('tchiloAvViewer');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'tchiloAvViewer';
    el.innerHTML =
      '<div class="av-top">' +
      '<button type="button" class="av-close" aria-label="Fechar">Fechar</button>' +
      '<span class="av-count"></span>' +
      '</div>' +
      '<button type="button" class="av-nav av-prev" aria-label="Anterior">‹</button>' +
      '<button type="button" class="av-nav av-next" aria-label="Seguinte">›</button>' +
      '<div class="av-stage"><img class="av-img" alt="Foto de perfil"/></div>' +
      '<div class="av-caption" hidden></div>';
    document.body.appendChild(el);

    el.querySelector('.av-close').onclick = closeViewer;
    el.querySelector('.av-prev').onclick = function () {
      go(-1);
    };
    el.querySelector('.av-next').onclick = function () {
      go(1);
    };
    el.addEventListener('click', function (e) {
      if (e.target === el || e.target.classList.contains('av-stage')) {
        if (state.scale <= 1.05) closeViewer();
      }
    });

    bindGestures(el);
    return el;
  }

  function resetTransform() {
    state.scale = 1;
    state.tx = 0;
    state.ty = 0;
    applyTransform();
  }

  function applyTransform() {
    var img = document.querySelector('#tchiloAvViewer .av-img');
    if (!img) return;
    img.style.transform =
      'translate(' + state.tx + 'px,' + state.ty + 'px) scale(' + state.scale + ')';
  }

  function render() {
    var el = ensureUI();
    var p = state.photos[state.index];
    if (!p) {
      closeViewer();
      return;
    }
    var img = el.querySelector('.av-img');
    img.src = p.url;
    resetTransform();

    var count = el.querySelector('.av-count');
    count.textContent =
      state.photos.length > 1 ? state.index + 1 + ' / ' + state.photos.length : '';

    var cap = el.querySelector('.av-caption');
    if (p.caption) {
      cap.hidden = false;
      cap.textContent = p.caption;
    } else {
      cap.hidden = true;
      cap.textContent = '';
    }

    el.querySelector('.av-prev').hidden = state.photos.length < 2;
    el.querySelector('.av-next').hidden = state.photos.length < 2;
    el.classList.add('open');
    state.open = true;
  }

  function go(dir) {
    if (state.photos.length < 2) return;
    state.index = (state.index + dir + state.photos.length) % state.photos.length;
    render();
  }

  function closeViewer() {
    var el = document.getElementById('tchiloAvViewer');
    if (el) el.classList.remove('open');
    state.open = false;
    resetTransform();
  }

  function bindGestures(el) {
    var stage = el.querySelector('.av-stage');
    var img = el.querySelector('.av-img');
    var lastTap = 0;
    var pointers = new Map();
    var startDist = 0;
    var startScale = 1;
    var startTx = 0;
    var startTy = 0;
    var panX = 0;
    var panY = 0;
    var swipeX0 = 0;
    var swiping = false;

    function dist(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    stage.addEventListener(
      'pointerdown',
      function (e) {
        stage.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 1) {
          panX = e.clientX;
          panY = e.clientY;
          swipeX0 = e.clientX;
          swiping = state.scale <= 1.05;
          startTx = state.tx;
          startTy = state.ty;
          var now = Date.now();
          if (now - lastTap < 280) {
            if (state.scale > 1.1) resetTransform();
            else {
              state.scale = 2.4;
              applyTransform();
            }
            lastTap = 0;
          } else lastTap = now;
        } else if (pointers.size === 2) {
          var pts = Array.from(pointers.values());
          startDist = dist(pts[0], pts[1]) || 1;
          startScale = state.scale;
          swiping = false;
        }
      },
      { passive: true }
    );

    stage.addEventListener(
      'pointermove',
      function (e) {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          var pts = Array.from(pointers.values());
          var d = dist(pts[0], pts[1]) || 1;
          state.scale = Math.min(4, Math.max(1, startScale * (d / startDist)));
          applyTransform();
        } else if (pointers.size === 1) {
          var dx = e.clientX - panX;
          var dy = e.clientY - panY;
          if (state.scale > 1.05) {
            state.tx = startTx + dx;
            state.ty = startTy + dy;
            applyTransform();
          } else if (swiping && state.photos.length > 1) {
            img.style.transform = 'translateX(' + dx + 'px)';
          }
        }
      },
      { passive: true }
    );

    function endPointer(e) {
      if (pointers.size === 1 && state.scale <= 1.05 && state.photos.length > 1) {
        var dx = e.clientX - swipeX0;
        if (dx > 70) go(-1);
        else if (dx < -70) go(1);
        else applyTransform();
      }
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        if (state.scale < 1.05) resetTransform();
      }
    }

    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
  }

  function collectPhotos(username) {
    var list = [];
    function add(url, caption) {
      if (!url || String(url).indexOf('data:') === 0 && String(url).length < 40) return;
      url = String(url);
      if (!list.some(function (x) {
        return x.url === url;
      }))
        list.push({ url: url, caption: caption || '' });
    }

    try {
      if (typeof getProfileExtra === 'function' && username) {
        var ex = getProfileExtra(username) || {};
        if (Array.isArray(ex.photos)) {
          ex.photos.forEach(function (ph) {
            if (typeof ph === 'string') add(ph);
            else if (ph && ph.url) add(ph.url, ph.caption || ph.legenda || '');
          });
        }
        if (ex.avatar) add(ex.avatar, ex.avatarCaption || '');
      }
    } catch (e) {}

    try {
      if (window.__tchiloAvatarCache && window.__tchiloAvatarCache[username]) {
        add(window.__tchiloAvatarCache[username]);
      }
    } catch (e2) {}

    try {
      var sess = typeof getSession === 'function' ? getSession() : null;
      if (sess && sess.username === username && sess.avatar) add(sess.avatar);
    } catch (e3) {}

    try {
      var av =
        document.querySelector('#screen-profile .profile-avatar img') ||
        document.querySelector('#screen-profile .profile-avatar');
      if (av) {
        if (av.tagName === 'IMG' && av.src) add(av.src);
        else {
          var bg = window.getComputedStyle(av).backgroundImage || '';
          var m = bg.match(/url\(["']?(.*?)["']?\)/);
          if (m && m[1] && m[1] !== 'none') add(m[1]);
          var inner = av.querySelector('img');
          if (inner && inner.src) add(inner.src);
        }
      }
    } catch (e4) {}

    return list;
  }

  window.tchiloOpenProfilePhotos = function (username, startIndex) {
    var photos = collectPhotos(username);
    if (!photos.length) return false;
    state.photos = photos;
    state.index = Math.max(0, Math.min(photos.length - 1, startIndex || 0));
    render();
    return true;
  };

  function onProfileClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    /* não abrir se clicou no botão + */
    if (t.closest('#tchiloProfileAvatarPlus, .tchilo-av-add, button, a, input')) return;

    var av = t.closest(
      '#screen-profile .profile-avatar, #screen-profile [class*="avatar"]'
    );
    if (!av) return;

    /* só no ecrã de perfil */
    if (!document.getElementById('screen-profile') || !document.getElementById('screen-profile').classList.contains('active')) {
      /* alguns layouts usam display */
      var sp = document.getElementById('screen-profile');
      if (!sp) return;
      var visible = sp.classList.contains('active') || sp.style.display === 'block';
      if (!visible && !sp.offsetParent) return;
    }

    var username = null;
    try {
      username = window.viewingProfileUser;
    } catch (err) {}
    if (!username) {
      try {
        var s = typeof getSession === 'function' ? getSession() : null;
        username = s && s.username;
      } catch (err2) {}
    }
    if (!username) return;

    e.preventDefault();
    e.stopPropagation();
    window.tchiloOpenProfilePhotos(username, 0);
  }

  document.addEventListener('click', onProfileClick, true);

  document.addEventListener('keydown', function (e) {
    if (!state.open) return;
    if (e.key === 'Escape') closeViewer();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
})();
