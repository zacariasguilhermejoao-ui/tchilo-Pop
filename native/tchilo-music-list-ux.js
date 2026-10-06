/**
 * Music list UX v3 — cover play ONLY plays (never selects); star/arrow separate
 */
(function () {
  'use strict';
  if (window.__TCHILO_MUSIC_LIST_UX_V3) return;
  window.__TCHILO_MUSIC_LIST_UX_V3 = true;

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
        currentAudio.removeAttribute('src');
        currentAudio.load();
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
      var a = new Audio(url);
      a.preload = 'auto';
      currentAudio = a;
      currentId = id;
      if (coverBtn) {
        coverBtn.classList.add('playing');
        var ico = coverBtn.querySelector('.cover-ico');
        if (ico) ico.innerHTML = svgPause();
      }
      var p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {}).catch(function (err) {
          console.warn('music play fail', err);
          // retry without crossOrigin issues
          try {
            var a2 = new Audio();
            a2.src = url;
            currentAudio = a2;
            a2.play().catch(function () {
              stopAudio();
              if (typeof showToast === 'function') showToast('Não foi possível reproduzir');
            });
            a2.onended = function () {
              stopAudio();
            };
          } catch (e2) {
            stopAudio();
            if (typeof showToast === 'function') showToast('Não foi possível reproduzir');
          }
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
    if (!isNaN(i) && store[i]) return store[i];
    var id = row.getAttribute('data-id');
    if (id) {
      for (var k = 0; k < store.length; k++) {
        if (store[k] && String(store[k].id) === String(id)) return store[k];
      }
    }
    var prev = row.getAttribute('data-preview');
    if (prev) {
      return {
        id: id || String(i),
        preview: prev,
        title: ((row.querySelector('.t b') || {}).textContent || '').replace(/TOP.*/g, '').trim(),
        artist: ((row.querySelector('.t span') || {}).textContent || '').split('·')[0].trim()
      };
    }
    return null;
  }

  function restyleRows(list) {
    if (window.__lastPmTracks && window.__lastPmTracks.length) {
      list._pmTracks = window.__lastPmTracks;
    }

    list.querySelectorAll('.track').forEach(function (row) {
      row.style.border = 'none';
      row.style.boxShadow = 'none';
      row.style.outline = 'none';
      row.style.borderRadius = '0';
      row.style.background = 'transparent';

      // Always re-stamp preview from store
      var i = Number(row.getAttribute('data-i'));
      var store = list._pmTracks || window.__lastPmTracks || [];
      if (!isNaN(i) && store[i]) {
        if (store[i].preview) row.setAttribute('data-preview', store[i].preview);
        if (store[i].id) row.setAttribute('data-id', store[i].id);
      }

      // Block row select when interacting with controls
      if (!row.__rowGuard) {
        row.__rowGuard = true;
        row.addEventListener(
          'click',
          function (e) {
            if (e.target.closest('.cover-play, .playbtn, .favbtn, .usebtn, .cover-ico, button')) {
              e.stopPropagation();
              // do not select when control clicked
              if (e.target.closest('.cover-play, .playbtn, .cover-ico')) {
                e.preventDefault();
              }
            }
          },
          true
        );
      }

      if (row.__uxV3) {
        // re-wire cover if needed
        var c = row.querySelector('.cover-play');
        if (c && !c.__wired3) wireCover(c, row, row.querySelector('.playbtn'));
        return;
      }
      row.__uxV3 = true;

      var playBtn = row.querySelector('.playbtn');
      var existingCover = row.querySelector('.cover-play');
      if (existingCover) {
        wireCover(existingCover, row, playBtn);
        ensureArrow(row);
        if (playBtn) playBtn.style.display = 'none';
        return;
      }

      var img = row.querySelector('img');
      var cover = img ? img.getAttribute('src') : '';
      var coverBtn = document.createElement('button');
      coverBtn.type = 'button';
      coverBtn.className = 'cover-play';
      coverBtn.setAttribute('aria-label', 'Pré-ouvir');
      if (cover) {
        var im = document.createElement('img');
        im.src = cover;
        im.alt = '';
        im.style.pointerEvents = 'none';
        coverBtn.appendChild(im);
      } else {
        var ph = document.createElement('div');
        ph.className = 'cover-ph';
        coverBtn.appendChild(ph);
      }
      var ico = document.createElement('span');
      ico.className = 'cover-ico';
      ico.innerHTML = svgPlay();
      ico.style.pointerEvents = 'none';
      coverBtn.appendChild(ico);

      if (img && img.parentNode === row) img.remove();
      if (playBtn) playBtn.style.display = 'none';
      row.insertBefore(coverBtn, row.firstChild);
      wireCover(coverBtn, row, playBtn);
      ensureArrow(row);
    });
  }

  function wireCover(coverBtn, row, playBtn) {
    if (coverBtn.__wired3) return;
    coverBtn.__wired3 = true;
    coverBtn.__wired = true;

    function onPlayTap(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();

      var tr = getTrackForRow(row);
      var url = (tr && tr.preview) || row.getAttribute('data-preview') || '';

      if (!url && playBtn) {
        var idx = playBtn.getAttribute('data-play');
        var store = (document.getElementById('pmList') || {})._pmTracks || window.__lastPmTracks || [];
        if (store[Number(idx)] && store[Number(idx)].preview) {
          url = store[Number(idx)].preview;
          tr = store[Number(idx)];
        }
      }

      // Try original togglePreview without selecting
      if (!url && typeof window.__tchiloTogglePreview === 'function' && tr) {
        window.__tchiloTogglePreview(tr, coverBtn);
        return;
      }

      if (!url) {
        if (typeof showToast === 'function') showToast('Pré-visualização indisponível');
        return;
      }
      playPreview(url, (tr && tr.id) || url, coverBtn);
    }

    coverBtn.addEventListener('click', onPlayTap, true);
    coverBtn.addEventListener('touchend', onPlayTap, { capture: true, passive: false });
  }

  function ensureArrow(row) {
    if (row.querySelector('.usebtn')) return;
    var use = document.createElement('button');
    use.type = 'button';
    use.className = 'usebtn';
    use.setAttribute('aria-label', 'Usar');
    use.innerHTML = svgArrow();
    use.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
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
          stopAudio();
          return;
        }
        // fallback: only select via arrow, not via play
        var playBtn = row.querySelector('.playbtn');
        if (playBtn) {
          // temporarily allow row select by synthesizing select from data-i
        }
        try {
          var i = Number(row.getAttribute('data-i'));
          var store = (document.getElementById('pmList') || {})._pmTracks || window.__lastPmTracks || [];
          if (store[i] && typeof window.__tchiloSelectTrack === 'function') {
            window.__tchiloSelectTrack(store[i]);
          }
        } catch (e4) {}
      },
      true
    );
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
            cover: (t.album && (t.album.cover_big || t.album.cover_big || t.album.cover_medium || t.album.cover)) || '',
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
    row.__uxV3 = true;
    row.innerHTML =
      '<button type="button" class="cover-play" aria-label="Pré-ouvir">' +
      (tr.cover ? '<img src="' + String(tr.cover).replace(/"/g, '') + '" alt="" style="pointer-events:none">' : '<div class="cover-ph"></div>') +
      '<span class="cover-ico" style="pointer-events:none">' +
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
    wireCover(row.querySelector('.cover-play'), row, null);
    ensureArrow(row);
    list.appendChild(row);
  }

  window.tchiloSetPmTracks = function (tracks) {
    window.__lastPmTracks = tracks || [];
    var list = document.getElementById('pmList');
    if (list) {
      list._pmTracks = window.__lastPmTracks.slice();
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
    if (!list.__storeHook) {
      list.__storeHook = true;
      new MutationObserver(function () {
        restyleRows(list);
      }).observe(list, { childList: true });
    }
    restyleRows(list);
  }

  function watchSheet() {
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (!sheet || sheet.__uxWatch3) return;
    sheet.__uxWatch3 = true;
    new MutationObserver(function () {
      if (sheet.classList.contains('open')) {
        offset = 0;
        hasMore = true;
        loading = false;
        setTimeout(enhanceList, 50);
        setTimeout(enhanceList, 400);
      } else {
        stopAudio();
      }
    }).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  }

  function patchCatalogSide() {
    if (typeof window.tchiloCatalogFetch !== 'function' || window.tchiloCatalogFetch.__ux3) return;
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
                cover: (t.album && (t.album.cover_big || t.album.cover_big || t.album.cover_medium || t.album.cover)) || '',
                duration: t.duration || 0
              };
            });
            if (String(path).indexOf('index=') < 0 || String(path).indexOf('index=0') >= 0) {
              window.__lastPmTracks = mapped;
              setTimeout(function () {
                if (typeof window.tchiloSetPmTracks === 'function') window.tchiloSetPmTracks(mapped);
              }, 80);
            }
          }
        } catch (e) {}
        return data;
      });
    };
    window.tchiloCatalogFetch.__ux3 = true;
  }

  // Patch post-music row click to ignore cover-play
  function patchRowSelect() {
    var list = document.getElementById('pmList');
    if (!list || list.__selectPatch) return;
    list.__selectPatch = true;
    list.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.cover-play, .playbtn, .favbtn, .usebtn, .cover-ico')) {
          e.stopPropagation();
        }
      },
      true
    );
  }

  function boot() {
    patchCatalogSide();
    watchSheet();
    patchRowSelect();
    enhanceList();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(boot, 1500);
})();
