/**
 * Tchilo — correções críticas app (feed estável, vídeos, localização)
 */
(function () {
  'use strict';
  if (window.__tchiloAppFix) return;
  window.__tchiloAppFix = true;

  function lockFeedChromeStable() {
    try {
      window.feedChromeLock = true;
      window.feedChromeState = 'shown';
      var frame = document.getElementById('appFrame');
      if (frame) frame.classList.remove('chrome-hidden');
      if (typeof window.setFeedChromeHidden === 'function' && !window.setFeedChromeHidden.__patched) {
        var orig = window.setFeedChromeHidden;
        window.setFeedChromeHidden = function (hidden) {
          if (hidden) return;
          return orig.apply(this, arguments);
        };
        window.setFeedChromeHidden.__patched = true;
      }
    } catch (e) {}
  }

  function injectCSS() {
    if (document.getElementById('tchiloAppFixCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAppFixCSS';
    st.textContent =
      '#appFrame .navbar,#appFrame .topbar,#appFrame .stories{' +
      'transition:none!important;transform:none!important;opacity:1!important;pointer-events:auto!important;}' +
      '#appFrame.chrome-hidden .navbar,#appFrame.chrome-hidden .topbar{' +
      'transform:none!important;opacity:1!important;pointer-events:auto!important;}' +
      '#feedList .post{animation:none!important;}' +
      '#feedList .post-media{background:#111;min-height:180px;}' +
      '#feedList .post-media img,#feedList .post-media video.feed-video{' +
      'width:100%;height:100%;object-fit:cover;display:block;background:#111;}' +
      '#feedList .feed-video-wrap{position:relative;width:100%;min-height:200px;background:#111;}' +
      '#feedList .feed-video-wrap .feed-play-icon{' +
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'width:56px;height:56px;border-radius:999px;background:rgba(0,0,0,.45);' +
      'display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2;}' +
      '#feedList .feed-video-wrap .feed-play-icon svg{width:28px;height:28px;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureVideoPosters(root) {
    root = root || document.getElementById('feedList') || document;
    if (!root) return;
    root.querySelectorAll('video.feed-video').forEach(function (v) {
      try {
        if (!v.getAttribute('playsinline')) v.setAttribute('playsinline', '');
        if (!v.getAttribute('webkit-playsinline')) v.setAttribute('webkit-playsinline', '');
        v.muted = true;
        v.setAttribute('muted', '');
        if (!v.getAttribute('poster') || !v.poster) {
          if (v.preload === 'none') v.preload = 'metadata';
          var tryPoster = function () {
            try {
              if (v.videoWidth < 2) return;
              var c = document.createElement('canvas');
              c.width = Math.min(480, v.videoWidth);
              c.height = Math.round(c.width * (v.videoHeight / v.videoWidth));
              var ctx = c.getContext('2d');
              if (!ctx) return;
              ctx.drawImage(v, 0, 0, c.width, c.height);
              var url = c.toDataURL('image/jpeg', 0.7);
              if (url && url.length > 100) {
                v.setAttribute('poster', url);
                v.poster = url;
              }
            } catch (e) {}
          };
          v.addEventListener('loadeddata', tryPoster, { once: true });
          v.addEventListener('loadedmetadata', function () {
            try {
              if (v.currentTime < 0.05) v.currentTime = 0.1;
            } catch (e) {}
          }, { once: true });
          try { v.load(); } catch (e) {}
        }
        var wrap = v.closest('.feed-video-wrap') || v.parentElement;
        if (wrap && !wrap.querySelector('.feed-play-icon')) {
          var ic = document.createElement('div');
          ic.className = 'feed-play-icon';
          ic.innerHTML = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
          wrap.appendChild(ic);
        }
        v.classList.add('media-ready');
      } catch (e) {}
    });
  }

  function wireVideoClicks() {
    var feed = document.getElementById('feedList');
    if (!feed || feed.__tchiloVidClick) return;
    feed.__tchiloVidClick = true;
    feed.addEventListener(
      'click',
      function (e) {
        var wrap = e.target.closest && e.target.closest('.feed-video-wrap');
        if (!wrap) return;
        var v = wrap.querySelector('video.feed-video');
        if (!v) return;
        e.preventDefault();
        e.stopPropagation();
        try {
          if (v.paused) {
            feed.querySelectorAll('video.feed-video').forEach(function (o) {
              if (o !== v) {
                try { o.pause(); } catch (err) {}
              }
            });
            v.muted = false;
            var p = v.play();
            if (p && p.catch) p.catch(function () {
              v.muted = true;
              v.play().catch(function () {});
            });
            var ic = wrap.querySelector('.feed-play-icon');
            if (ic) ic.style.display = 'none';
          } else {
            v.pause();
            var ic2 = wrap.querySelector('.feed-play-icon');
            if (ic2) ic2.style.display = '';
          }
        } catch (err) {}
      },
      true
    );
  }

  function requestLocationPermission() {
    try {
      var Cap = window.Capacitor;
      if (Cap && Cap.Plugins) {
        var Perm = Cap.Plugins.Permissions || Cap.Plugins.Permission;
        var Geo = Cap.Plugins.Geolocation;
        if (Perm && Perm.requestPermissions) {
          Perm.requestPermissions({ permissions: ['location', 'coarseLocation'] }).catch(function () {});
        }
        if (Geo && Geo.requestPermissions) {
          Geo.requestPermissions().catch(function () {});
        }
        if (Geo && Geo.getCurrentPosition) {
          Geo.getCurrentPosition({ enableHighAccuracy: false, timeout: 12000 })
            .then(function (pos) {
              if (pos && pos.coords) {
                window.__tchiloUserGeo = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  at: Date.now()
                };
                try {
                  localStorage.setItem('tchilo_user_geo', JSON.stringify(window.__tchiloUserGeo));
                } catch (e) {}
              }
            })
            .catch(function () {});
        }
      }
    } catch (e) {}

    try {
      if (navigator.geolocation && !window.__tchiloUserGeo) {
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            window.__tchiloUserGeo = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              at: Date.now()
            };
            try {
              localStorage.setItem('tchilo_user_geo', JSON.stringify(window.__tchiloUserGeo));
            } catch (e) {}
          },
          function () {},
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
        );
      }
    } catch (e) {}
  }

  function watchFeed() {
    var feed = document.getElementById('feedList');
    if (!feed || feed.__tchiloFixObs) return;
    feed.__tchiloFixObs = true;
    try {
      var obs = new MutationObserver(function () {
        ensureVideoPosters(feed);
      });
      obs.observe(feed, { childList: true, subtree: true });
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    lockFeedChromeStable();
    ensureVideoPosters();
    wireVideoClicks();
    watchFeed();
    requestLocationPermission();
    setTimeout(function () {
      lockFeedChromeStable();
      ensureVideoPosters();
      requestLocationPermission();
    }, 800);
    setTimeout(function () {
      lockFeedChromeStable();
      ensureVideoPosters();
    }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('pageshow', function () {
    lockFeedChromeStable();
    ensureVideoPosters();
  });
})();
