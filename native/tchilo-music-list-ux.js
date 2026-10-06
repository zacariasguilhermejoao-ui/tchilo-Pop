/**
 * Music list UX: play on cover, star, arrow, duration, infinite scroll
 * (does not copy WhatsApp chrome — only list interaction patterns)
 */
(function () {
  'use strict';
  if (window.__TCHILO_MUSIC_LIST_UX_V1) return;
  window.__TCHILO_MUSIC_LIST_UX_V1 = true;

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

  function enhanceList() {
    var list = document.getElementById('pmList');
    if (!list) return;
    if (!list.__uxEnh) {
      list.__uxEnh = true;
      var obs = new MutationObserver(function () {
        restyleRows(list);
      });
      obs.observe(list, { childList: true });
      list.addEventListener('scroll', function () {
        if (loading || !hasMore) return;
        var q = document.getElementById('pmSearch');
        if (q && q.value && String(q.value).trim()) return;
        if (list.scrollTop + list.clientHeight < list.scrollHeight - 140) return;
        loadMore(list);
      });
    }
    restyleRows(list);
  }

  function restyleRows(list) {
    list.querySelectorAll('.track').forEach(function (row) {
      if (row.__uxDone) return;
      row.__uxDone = true;
      if (row.querySelector('.cover-play')) return;

      var img = row.querySelector('img');
      var playBtn = row.querySelector('.playbtn');
      var favBtn = row.querySelector('.favbtn');
      var meta = row.querySelector('.t') || row.children[1];
      var cover = img ? img.getAttribute('src') : '';

      // Move play onto cover
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

      coverBtn.onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (playBtn) {
          playBtn.click();
          setTimeout(function () {
            if (playBtn.classList.contains('playing')) {
              coverBtn.classList.add('playing');
              ico.innerHTML = svgPause();
            } else {
              coverBtn.classList.remove('playing');
              ico.innerHTML = svgPlay();
            }
          }, 30);
          return;
        }
        // fallback own audio if data-preview on row
        var prev = row.getAttribute('data-preview');
        if (!prev) return;
        try {
          if (window.__pmUxAudio) {
            window.__pmUxAudio.pause();
            window.__pmUxAudio = null;
            coverBtn.classList.remove('playing');
            ico.innerHTML = svgPlay();
            return;
          }
          var a = new Audio(prev);
          window.__pmUxAudio = a;
          coverBtn.classList.add('playing');
          ico.innerHTML = svgPause();
          a.play().catch(function () {});
          a.onended = function () {
            coverBtn.classList.remove('playing');
            ico.innerHTML = svgPlay();
            window.__pmUxAudio = null;
          };
        } catch (err) {}
      };

      if (img && img.parentNode === row) img.remove();
      if (playBtn) playBtn.style.display = 'none';
      row.insertBefore(coverBtn, row.firstChild);

      // duration: try from Deezer id if we stored it — append placeholder via data
      // Arrow
      if (!row.querySelector('.usebtn')) {
        var use = document.createElement('button');
        use.type = 'button';
        use.className = 'usebtn';
        use.setAttribute('aria-label', 'Usar');
        use.innerHTML = svgArrow();
        use.onclick = function (e) {
          e.stopPropagation();
          row.click();
        };
        row.appendChild(use);
      }

      // Ensure star outline style (favbtn already exists)
      if (favBtn && !favBtn.innerHTML) favBtn.innerHTML = svgStar(favBtn.classList.contains('on'));
    });
  }

  function loadMore(list) {
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
        arr.forEach(function (tr) {
          appendRow(list, tr);
        });
      })
      .catch(function () {
        hasMore = false;
      })
      .finally(function () {
        loading = false;
      });
  }

  function appendRow(list, tr) {
    var dur = tr.duration ? formatTrackDur(tr.duration) : '';
    var row = document.createElement('div');
    row.className = 'track';
    row.setAttribute('data-preview', tr.preview || '');
    row.__uxDone = true;
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
      '</button>' +
      '<button type="button" class="usebtn" aria-label="Usar">' +
      svgArrow() +
      '</button>';

    var coverBtn = row.querySelector('.cover-play');
    var ico = row.querySelector('.cover-ico');
    coverBtn.onclick = function (e) {
      e.stopPropagation();
      if (!tr.preview) return;
      try {
        if (window.__pmUxAudio) {
          window.__pmUxAudio.pause();
          window.__pmUxAudio = null;
          coverBtn.classList.remove('playing');
          ico.innerHTML = svgPlay();
          return;
        }
        var a = new Audio(tr.preview);
        window.__pmUxAudio = a;
        coverBtn.classList.add('playing');
        ico.innerHTML = svgPause();
        a.play().catch(function () {});
        a.onended = function () {
          coverBtn.classList.remove('playing');
          ico.innerHTML = svgPlay();
          window.__pmUxAudio = null;
        };
      } catch (err) {}
    };
    row.querySelector('.usebtn').onclick = function (e) {
      e.stopPropagation();
      window._pendingMusic = tr.title + ' · ' + tr.artist;
      window._pendingMusicMeta = {
        id: tr.id,
        title: tr.title,
        artist: tr.artist,
        preview: tr.preview,
        cover: tr.cover
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
    };
    list.appendChild(row);
  }

  // Reset infinite scroll when sheet opens
  function watchSheet() {
    var sheet = document.getElementById('tchiloPostMusicSheet');
    if (!sheet || sheet.__uxWatch) return;
    sheet.__uxWatch = true;
    var obs = new MutationObserver(function () {
      if (sheet.classList.contains('open')) {
        offset = 0;
        hasMore = true;
        loading = false;
        enhanceList();
      }
    });
    obs.observe(sheet, { attributes: true, attributeFilter: ['class'] });
  }

  function boot() {
    watchSheet();
    enhanceList();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(boot, 1200);
})();
