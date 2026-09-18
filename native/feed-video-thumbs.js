/**
 * tchilo-Pop — miniaturas dos vídeos no feed
 * Gera poster a partir do 1.º frame se não existir
 */
(function () {
  'use strict';

  function injectCSS() {
    if (document.getElementById('tchiloVidThumbCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloVidThumbCSS';
    st.textContent =
      '#feedList .feed-video-wrap{position:relative;min-height:180px;background:#1a1a1a;}' +
      '#feedList .feed-video-wrap video.feed-video{' +
      'display:block!important;width:100%!important;height:100%!important;' +
      'object-fit:cover!important;background:#1a1a1a!important;opacity:1!important;visibility:visible!important;}' +
      '#feedList .feed-video-wrap .tchilo-vthumb{' +
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;background:#1a1a1a;}' +
      '#feedList .feed-video-wrap.playing .tchilo-vthumb{display:none;}' +
      '#feedList .feed-video-wrap .tchilo-play-badge{' +
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'width:56px;height:56px;border-radius:50%;z-index:3;' +
      'background:rgba(0,0,0,.5);border:2.5px solid #fff;' +
      'display:flex;align-items:center;justify-content:center;pointer-events:none;}' +
      '#feedList .feed-video-wrap .tchilo-play-badge svg{margin-left:3px;}';
    document.head.appendChild(st);
  }

  var PLAY =
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';

  function ensureBadge(wrap) {
    if (!wrap || wrap.querySelector('.tchilo-play-badge')) return;
    var b = document.createElement('div');
    b.className = 'tchilo-play-badge';
    b.innerHTML = PLAY;
    wrap.appendChild(b);
  }

  function setThumb(wrap, dataUrl) {
    if (!wrap || !dataUrl) return;
    var img = wrap.querySelector('.tchilo-vthumb');
    if (!img) {
      img = document.createElement('img');
      img.className = 'tchilo-vthumb';
      img.alt = '';
      wrap.insertBefore(img, wrap.firstChild);
    }
    img.src = dataUrl;
    var v = wrap.querySelector('video');
    if (v && !v.getAttribute('poster')) v.setAttribute('poster', dataUrl);
  }

  function captureFrame(video, wrap) {
    if (!video || video.dataset.thumbDone === '1') return;
    function tryCap() {
      try {
        if (video.videoWidth < 2 || video.videoHeight < 2) return false;
        var c = document.createElement('canvas');
        var w = Math.min(video.videoWidth, 640);
        var h = Math.round((video.videoHeight / video.videoWidth) * w);
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(video, 0, 0, w, h);
        var url = c.toDataURL('image/jpeg', 0.7);
        video.dataset.thumbDone = '1';
        setThumb(wrap, url);
        return true;
      } catch (e) {
        return false;
      }
    }
    if (tryCap()) return;
    var onMeta = function () {
      try {
        if (video.currentTime < 0.05) video.currentTime = 0.1;
      } catch (e) {}
    };
    var onSeek = function () {
      tryCap();
      video.removeEventListener('seeked', onSeek);
    };
    video.addEventListener('loadeddata', function once() {
      video.removeEventListener('loadeddata', once);
      if (!tryCap()) {
        video.addEventListener('seeked', onSeek);
        onMeta();
      }
    });
    video.addEventListener('loadedmetadata', onMeta);
  }

  function processWrap(wrap) {
    if (!wrap) return;
    ensureBadge(wrap);
    var video = wrap.querySelector('video.feed-video, video');
    if (!video) return;

    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.muted = true;
    // metadata para conseguir frame da miniatura
    if (video.getAttribute('preload') === 'none') {
      video.setAttribute('preload', 'metadata');
    }

    var poster = video.getAttribute('poster');
    if (poster) {
      setThumb(wrap, poster);
      video.dataset.thumbDone = '1';
    } else {
      captureFrame(video, wrap);
    }

    // play/pause ao tocar
    if (!video.dataset.tapBound) {
      video.dataset.tapBound = '1';
      var toggle = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (video.paused) {
          document.querySelectorAll('#feedList video').forEach(function (o) {
            if (o !== video) {
              try {
                o.pause();
              } catch (err) {}
              var w = o.closest('.feed-video-wrap');
              if (w) w.classList.remove('playing');
            }
          });
          video.muted = false;
          var p = video.play();
          wrap.classList.add('playing');
          if (p && p.catch)
            p.catch(function () {
              video.muted = true;
              video.play().catch(function () {});
            });
        } else {
          video.pause();
          wrap.classList.remove('playing');
        }
      };
      wrap.addEventListener('click', toggle);
    }
  }

  function scan() {
    injectCSS();
    document.querySelectorAll('#feedList .feed-video-wrap').forEach(processWrap);
    // vídeos soltos sem wrap
    document.querySelectorAll('#feedList .post-media > video').forEach(function (v) {
      var host = v.parentElement;
      if (!host.classList.contains('feed-video-wrap')) {
        host.classList.add('feed-video-wrap');
      }
      processWrap(host);
    });
  }

  function boot() {
    scan();
    [300, 1000, 2500].forEach(function (ms) {
      setTimeout(scan, ms);
    });
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__vidThumbs) {
      var rf = window.renderFeed;
      window.renderFeed = function () {
        var r = rf.apply(this, arguments);
        setTimeout(scan, 60);
        setTimeout(scan, 400);
        return r;
      };
      window.renderFeed.__vidThumbs = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
