/**
 * Tchilo — clicar na foto de perfil abre em ecrã inteiro;
 * com várias fotos, deslizar esquerda/direita troca.
 */
(function () {
  'use strict';
  if (window.__tchiloProfilePhotos) return;
  window.__tchiloProfilePhotos = true;

  var state = {
    urls: [],
    index: 0,
    username: '',
    touchX: null
  };

  function injectUI() {
    if (document.getElementById('tchiloPhotoViewer')) return;

    var st = document.createElement('style');
    st.id = 'tchiloPhotoViewerCSS';
    st.textContent =
      '#tchiloPhotoViewer{display:none;position:fixed;inset:0;z-index:10050;' +
      'background:rgba(0,0,0,.94);align-items:center;justify-content:center;' +
      'flex-direction:column;touch-action:pan-y;}' +
      '#tchiloPhotoViewer.open{display:flex!important;}' +
      '#tchiloPhotoViewer .tpv-img-wrap{flex:1;width:100%;display:flex;align-items:center;' +
      'justify-content:center;overflow:hidden;position:relative;}' +
      '#tchiloPhotoViewer img.tpv-img{max-width:100%;max-height:100%;object-fit:contain;' +
      'user-select:none;-webkit-user-drag:none;}' +
      '#tchiloPhotoViewer .tpv-close{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));' +
      'right:14px;width:40px;height:40px;border-radius:50%;border:0;' +
      'background:rgba(255,255,255,.15);color:#fff;font-size:24px;line-height:1;' +
      'cursor:pointer;z-index:2;}' +
      '#tchiloPhotoViewer .tpv-nav{position:absolute;top:50%;transform:translateY(-50%);' +
      'width:44px;height:44px;border-radius:50%;border:0;' +
      'background:rgba(255,255,255,.12);color:#fff;font-size:28px;' +
      'cursor:pointer;z-index:2;display:flex;align-items:center;justify-content:center;}' +
      '#tchiloPhotoViewer .tpv-prev{left:8px;}' +
      '#tchiloPhotoViewer .tpv-next{right:8px;}' +
      '#tchiloPhotoViewer .tpv-nav[hidden]{display:none!important;}' +
      '#tchiloPhotoViewer .tpv-dots{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom,0px));' +
      'left:0;right:0;display:flex;justify-content:center;gap:6px;z-index:2;}' +
      '#tchiloPhotoViewer .tpv-dot{width:7px;height:7px;border-radius:50%;' +
      'background:rgba(255,255,255,.35);}' +
      '#tchiloPhotoViewer .tpv-dot.on{background:#fff;}' +
      '#tchiloPhotoViewer .tpv-counter{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));' +
      'left:0;right:0;text-align:center;color:rgba(255,255,255,.85);' +
      'font:600 13px system-ui,sans-serif;pointer-events:none;}' +
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
      if (e.target === box || e.target.classList.contains('tpv-img-wrap')) closeViewer();
    });

    var wrap = box.querySelector('.tpv-img-wrap');
    wrap.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        state.touchX = e.touches[0].clientX;
      },
      { passive: true }
    );
    wrap.addEventListener(
      'touchend',
      function (e) {
        if (state.touchX == null) return;
        var x = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : state.touchX;
        var dx = x - state.touchX;
        state.touchX = null;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) showIndex(state.index + 1);
        else showIndex(state.index - 1);
      },
      { passive: true }
    );

    document.addEventListener('keydown', function (e) {
      var v = document.getElementById('tchiloPhotoViewer');
      if (!v || !v.classList.contains('open')) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft') showIndex(state.index - 1);
      if (e.key === 'ArrowRight') showIndex(state.index + 1);
    });
  }

  function uniqueUrls(list) {
    var out = [];
    var seen = {};
    (list || []).forEach(function (u) {
      if (!u || typeof u !== 'string') return;
      if (u.indexOf('blob:') === 0 && u.length < 10) return;
      if (seen[u]) return;
      seen[u] = 1;
      out.push(u);
    });
    return out;
  }

  function collectPhotosForUser(username) {
    var urls = [];
    if (!username) return urls;

    try {
      if (window.__tchiloAvatarCache && window.__tchiloAvatarCache[username]) {
        urls.push(window.__tchiloAvatarCache[username]);
      }
    } catch (e) {}

    try {
      if (typeof resolveUserAvatarUrl === 'function') {
        var a = resolveUserAvatarUrl(username);
        if (a) urls.push(a);
      }
    } catch (e) {}

    try {
      if (typeof getProfileExtra === 'function') {
        var extra = getProfileExtra(username);
        if (extra && extra.avatar) urls.push(extra.avatar);
      }
    } catch (e) {}

    try {
      var session =
        typeof getSession === 'function'
          ? getSession()
          : JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      if (session && session.username === username && session.avatar) {
        urls.push(session.avatar);
      }
    } catch (e) {}

    /* Fotos dos posts desse utilizador */
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      (posts || []).forEach(function (p) {
        if (!p || p.username !== username) return;
        if (p.media && p.mediaType !== 'video') urls.push(p.media);
        if (p.thumbnail) urls.push(p.thumbnail);
        if (p.poster && p.mediaType !== 'video') urls.push(p.poster);
        if (Array.isArray(p.mediaItems)) {
          p.mediaItems.forEach(function (m) {
            if (!m) return;
            if (m.type === 'video') {
              if (m.thumbnail || m.poster) urls.push(m.thumbnail || m.poster);
            } else if (m.url) {
              urls.push(m.url);
            }
          });
        }
      });
    } catch (e) {}

    /* img já visível no avatar do perfil */
    try {
      document.querySelectorAll('.profile-avatar img').forEach(function (img) {
        if (img.src) urls.unshift(img.src);
      });
    } catch (e) {}

    return uniqueUrls(urls);
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
    if (!state.urls.length) return;
    var n = state.urls.length;
    state.index = ((i % n) + n) % n;
    var box = document.getElementById('tchiloPhotoViewer');
    if (!box) return;
    var img = box.querySelector('.tpv-img');
    var url = state.urls[state.index];
    if (img && url) img.src = url;

    var multi = n > 1;
    box.querySelector('.tpv-prev').hidden = !multi;
    box.querySelector('.tpv-next').hidden = !multi;

    var counter = box.querySelector('.tpv-counter');
    if (counter) counter.textContent = multi ? state.index + 1 + ' / ' + n : '';

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

  function openViewer(urls, startIndex) {
    injectUI();
    state.urls = uniqueUrls(urls);
    if (!state.urls.length) return;
    state.index = Math.max(0, Math.min(startIndex || 0, state.urls.length - 1));
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
    try {
      document.body.style.overflow = '';
    } catch (e) {}
  }

  function openProfilePhotos(username, startUrl) {
    username = username || currentProfileUsername();
    var urls = collectPhotosForUser(username);
    if (!urls.length && startUrl) urls = [startUrl];
    if (!urls.length) return;
    var start = 0;
    if (startUrl) {
      var i = urls.indexOf(startUrl);
      if (i >= 0) start = i;
    }
    state.username = username;
    openViewer(urls, start);
  }

  window.tchiloOpenProfilePhotos = openProfilePhotos;

  function onAvatarClick(e) {
    var av = e.target.closest && e.target.closest('.profile-avatar');
    if (!av) return;
    /* não interceptar botões dentro */
    if (e.target.closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    var img = av.querySelector('img');
    var startUrl = img && img.src ? img.src : null;
    openProfilePhotos(currentProfileUsername(), startUrl);
  }

  function bind() {
    document.addEventListener('click', onAvatarClick, true);
  }

  function boot() {
    injectUI();
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
