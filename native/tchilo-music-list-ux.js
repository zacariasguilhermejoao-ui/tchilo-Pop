/**
 * Music list UX v2 — play on cover (real audio), star, arrow, no card borders
 */
(function () {
  'use strict';
  if (window.__TCHILO_MUSIC_LIST_UX_V2) return;
  window.__TCHILO_MUSIC_LIST_UX_V2 = true;

  function formatTrackDur(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function svgPlay() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  function svgPause() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';
  }
  function svgStar(on) {
    if (on)
      return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/></svg>';
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/></svg>';
  }
  function svgArrow() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
  }

  var offset = 0;
  var loading = false;
  var hasMore = true;
  var currentAudio = null;
  var currentId = null;

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.src = '';
      } catch (e) {}
      currentAudio = null;
    }
    currentId = null;
    document.querySelectorAll('#pmList .cover-play.playing').forEach(function (b) {
      b.classList.remove('playing');
      var ico = b.querySelector('.cover-ico');
      if (ico) ico.innerHTML = svgPlay();
    });
  }

  function playPreview(url, id, coverBtn) {
    if (!url) {
      if (typeof showToast === 'function') showToast('Pré-visualização indisponível');
      return;
    }
    if (currentId === id && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    try {
      var a = new Audio();
      a.crossOrigin = 'anonymous';
      a.preload = 'auto';
      a.src = url;
      currentAudio = a;
      currentId = id;
      if (coverBtn) {
        coverBtn.classList.add('playing');
        var ico = coverBtn.querySelector('.cover-ico');
        if (ico) ico.innerHTML = svgPause();
      }
      var p = a.play();
      if (p && p.catch) {
        p.catch(function (err) {
          console.warn('music play', err);
          stopAudio();
          if (typeof showToast === 'function') showToast('Não foi possível reproduzir');
        });
      }
      a.onended = function () {
        stopAudio();
      };
      a.onerror = function () {
        stopAudio();
        if (typeof showToast === 'function') showToast('Áudio indisponível');
      };
    } catch (e) {
      stopAudio();
      if (typeof showToast === 'function') showToast('Erro ao tocar');
    }
  }

  function getTrackForRow(row) {
    var i = Number(row.getAttribute('data-i'));
    var list = document.getElementById('pmList');
    var store = (list && list._pmTracks) || window.__lastPmTracks || [];
    if (store[i]) return store[i];
    // from data attributes
    var prev = row.getAttribute('data-preview');
    if (prev) {
      return {
        id: row.getAttribute('data-id') || String(i),
        preview: prev,
        title: (row.querySelector('.t b') || {}).textContent || '',
        artist: (row.querySelector('.t span') || {}).textContent || ''
      };
    }
    return null;
  }

  function restyleRows(list) {
    // keep tracks store if post-music put it
    if (window.__lastPmTracks && window.__lastPmTracks.length) {
      list._pmTracks = window.__lastPmTracks;
    }

    list.querySelectorAll('.track').forEach(function (row) {
      // strip any card border styles inline
      row.style.border = 'none';
      row.style.boxShadow = 'none';
      row.style.outline = 'none';
      row.style.borderRadius = '0';
      row.style.background = 'transparent';

      if (row.__uxV2) return;
      row.__uxV2 = true;

      var playBtn = row.querySelector('.playbtn');
      var img = row.querySelector('img:not(.cover-play img)');
      // if already has cover-play from native render
      var existingCover = row.querySelector('.cover-play');
      if (existingCover) {
        wireCover(existingCover, row, playBtn);
        ensureArrow(row);
        return;
      }

      var cover = img ? img.getAttribute('src') : '';
      var coverBtn = document.createElement('button');
      coverBtn.type = 'button';
      coverBtn.className = 'cover-play';
      coverBtn.setAttribute('aria-label', 'Pré-ouvir');
      if (cover) {
        var im = document.createElement('img');
        im.src = cover;
        im.alt = '';
        coverBtn.appendChild(im);
      } else {
        var ph = document.createElement('div');
        ph.className = 'cover-ph';
        coverBtn.appendChild(ph);
      }
      var ico = document.createElement('span');
      ico.className = 'cover-ico';
      ico.innerHTML = svgPlay();
      coverBtn.appendChild(ico);

      if (img && img.parentNode === row) img.remove();
      if (playBtn) playBtn.style.display = 'none';
      row.insertBefore(coverBtn, row.firstChild);
      wireCover(coverBtn, row, playBtn);
      ensureArrow(row);
    });
  }

  function wireCover(coverBtn, row, playBtn) {
    if (coverBtn.__wired) return;
    coverBtn.__wired = true;
    coverBtn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        var tr = getTrackForRow(row);
        var url = (tr && tr.preview) || row.getAttribute('data-preview') || '';
        // try extract from original handler store
        if (!url && playBtn) {
          var idx = playBtn.getAttribute('data-play');
          var store = (document.getElementById('pmList') || {})._pmTracks || window.__lastPmTracks || [];
          if (store[Number(idx)] && store[Number(idx)].preview) url = store[Number(idx)].preview;
          tr = store[Number(idx)] || tr;
        }
        if (!url) {
          // last resort: trigger old playbtn then read audio
          if (playBtn) {
            try {
              playBtn.click();
            } catch (err) {}
          }
          if (typeof showToast === 'function') showToast('Pré-visualização indisponível');
          return;
        }
        playPreview(url, (tr && tr.id) || url, coverBtn);
      },
      true
    );
  }

  function ensureArrow(row) {
    if (row.querySelector('.usebtn')) return;
    var use = document.createElement('button');
    use.type = 'button';
    use.className = 'usebtn';
    use.setAttribute('aria-label', 'Usar');
    use.innerHTML = svgArrow();
    use.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      // prefer original row click / selectTrack
      var tr = getTrackForRow(row);
      if (tr && tr.title) {
        window._pendingMusic = tr.title + (tr.artist ? ' · ' + tr.artist : '');
        window._pendingMusicMeta = {
          id: tr.id,
          title: tr.title,
          artist: tr.artist || '',
          preview: tr.preview || '',
          cover: tr.cover || ''
        };
        try {
          var sheet = document.getElementById('tchiloPostMusicSheet');
          if (sheet) sheet.classList.remove('open');
        } catch (e2) {}
        try {
          window.dispatchEvent(
            new CustomEvent('tchilo-music-selected', {
              detail: { label: window._pendingMusic, meta: window._pendingMusicMeta }
            })
          );
        } catch (e3) {}
        if (typeof showToast === 'function') showToast('Música adicionada');
        return;
      }
      row.click();
    });
    row.appendChild(use);
  }

  function loadMore(list) {
    if (loading || !hasMore) return;
    loading = true;
    offset += 40;
    var fetchFn = window.tchiloCatalogFetch;
    if (typeof fetchFn !== 'function') {
      loading = false;
      hasMore = false;
      return;
    }
    fetchFn('chart/0/tracks?limit=40&index=' + offset)
      .then(function (data) {
        var arr = ((data && data.data) || []).map(function (t) {
          return {
            id: String(t.id),
            title: t.title || t.title_short || 'Música',
            artist: (t.artist && t.artist.name) || 'Artista',
            preview: t.preview || '',
            cover: (t.album && (t.album.cover_medium || t.album.cover)) || '',
            duration: t.duration || 0
          };
        });
        if (!arr.length) {
          hasMore = false;
          return;
        }
        if (arr.length < 40) hasMore = false;
        if (!list._pmTracks) list._pmTracks = [];
        var base = list._pmTracks.length;
        arr.forEach(function (tr, i) {
          list._pmTracks.push(tr);
          appendRow(list, tr, base + i);
        });
        window.__lastPmTracks = list._pmTracks.slice();
      })
      .catch(function () {
        hasMore = false;
      })
      .finally(function () {
        loading = false;
      });
  }

  function appendRow(list, tr, idx) {
    var dur = tr.duration ? formatTrackDur(tr.duration) : '';
    var row = document.createElement('div');
    row.className = 'track';
    row.setAttribute('data-i', String(idx));
    row.setAttribute('data-preview', tr.preview || '');
    row.setAttribute('data-id', tr.id || '');
    row.__uxV2 = true;
    row.innerHTML =
      '<button type="button" class="cover-play" aria-label="Pré-ouvir">' +
      (tr.cover ? '<img src="' + String(tr.cover).replace(/"/g, '') + '" alt="">' : '<div class="cover-ph"></div>') +
      '<span class="cover-ico">' +
      svgPlay() +
      '</span></button>' +
      '<div class="t"><b>' +
      String(tr.title).replace(/</g, '') +
      '</b><span>' +
      String(tr.artist).replace(/</g, '') +
      (dur ? ' · ' + dur : '') +
      '</span></div>' +
      '<button type="button" class="favbtn" aria-label="Favorita">' +
      svgStar(false) +
      '</button>';
    var coverBtn = row.querySelector('.cover-play');
    wireCover(coverBtn, row, null);
    ensureArrow(row);
    list.appendChild(row);
  }

  function hookRenderTracks() {
    // Patch: after tracks render, store them
    var list = document.getElementById('pmList');
    if (!list || list.__storeHook) return;
    list.__storeHook = true;
    var obs = new MutationObserver(function () {
      // try to capture from playbtn data-play max index
      restyleRows(list);
    });
    obs.observe(list, { childList: true });
  }

  // Expose setter for post-music if it calls us
  window.tchiloSetPmTracks = function (tracks) {
    window.__lastPmTracks = tracks || [];
    var list = document.getElementById('pmList');
    if (list) {
      list._pmTracks = window.__lastPmTracks.slice();
      // stamp data-preview on rows
      list.querySelectorAll('.track').forEach(function (row) {
        var i = Number(row.getAttribute('data-i'));
        var tr = window.__lastPmTracks[i];
        if (tr && tr.preview) row.setAttribute('data-preview', tr.preview);
        if (tr && tr.id) row.setAttribute('data-id', tr.id);
        if (tr && tr.duration) {
          var sp = row.querySelector('.t span');
          if (sp && sp.textContent.indexOf('·') < 0) {
            sp.textContent = (tr.artist || sp.textContent) + ' · ' + formatTrackDur(tr.duration);
          }
        }
      });
      restyleRows(list);
    }
  };

  // Wrap render by intercepting list innerHTML changes after open
  function enhanceList() {
    var list = document.getElementById('pmList');
    if (!list) return;
    if (!list.__uxScroll) {
      list.__uxScroll = true;
      list.addEventListener('scroll', function () {
        if (loading || !hasMore) return;
        var q = document.getElementById('pmSearch');
        if (q && q.value && String(q.value).trim()) return;
        if (list.scrollTop + list.clientHeight < list.scrollHeight - 140) return;
        loadMore(list);
      });
    }
    hookRenderTracks();
    restyleRows(list);
  }

  function watchSheet() {
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (!sheet || sheet.__uxWatch2) return;
    sheet.__uxWatch2 = true;
    var obs = new MutationObserver(function () {
      if (sheet.classList.contains('open')) {
        offset = 0;
        hasMore = true;
        loading = false;
        setTimeout(enhanceList, 50);
        setTimeout(enhanceList, 300);
      } else {
        stopAudio();
      }
    });
    obs.observe(sheet, { attributes: true, attributeFilter: ['class'] });
  }

  // Monkey-patch: when post-music finishes loading tracks, store them
  function patchCatalogSide() {
    if (typeof window.tchiloCatalogFetch !== 'function' || window.tchiloCatalogFetch.__ux) return;
    var orig = window.tchiloCatalogFetch;
    window.tchiloCatalogFetch = function (path) {
      return orig.apply(this, arguments).then(function (data) {
        try {
          if (data && data.data && path && String(path).indexOf('track') >= 0) {
            var mapped = data.data.map(function (t) {
              return {
                id: String(t.id),
                title: t.title || t.title_short || 'Música',
                artist: (t.artist && t.artist.name) || 'Artista',
                preview: t.preview || '',
                cover: (t.album && (t.album.cover_medium || t.album.cover)) || '',
                duration: t.duration || 0
              };
            });
            // merge into last tracks if chart first page
            if (String(path).indexOf('index=') < 0 || String(path).indexOf('index=0') >= 0) {
              window.__lastPmTracks = mapped;
              setTimeout(function () {
                if (typeof window.tchiloSetPmTracks === 'function') window.tchiloSetPmTracks(mapped);
              }, 100);
            }
          }
        } catch (e) {}
        return data;
      });
    };
    window.tchiloCatalogFetch.__ux = true;
  }

  function boot() {
    patchCatalogSide();
    watchSheet();
    enhanceList();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(boot, 1500);
})();
