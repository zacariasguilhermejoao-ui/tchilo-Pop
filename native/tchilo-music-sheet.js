/**
 * tchilo — seletor de música Tchilo (capas, play, favoritos, seleção)
 * Substitui o picker amador do publish-fix
 */
(function () {
  'use strict';
  if (window.__tchiloMusicSheetV1) return;
  window.__tchiloMusicSheetV1 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {
      try { console.log('[Tchilo]', msg); } catch (e2) {}
    }
  }

  function openMusicPicker() {
    var native = document.getElementById('tchiloPostMusicSheet');
    if (native && native.classList.contains('open')) return;
    if (native) native.classList.remove('open');

    var overlay = document.getElementById('tchiloMusicFallback');
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'tchiloMusicFallback';
    overlay.innerHTML =
      '<style id="tchiloMusicFallbackCSS">' +
      '#tchiloMusicFallback{position:fixed;inset:0;z-index:2147483000;background:rgba(11,11,12,.55);display:flex;align-items:flex-end;justify-content:center;}' +
      '#tchiloMusicFallback .panel{width:100%;max-width:480px;max-height:82vh;background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:22px 22px 0 0;padding:14px 14px calc(18px + env(safe-area-inset-bottom));border:3px solid var(--ink,#0B0B0C);border-bottom:0;display:flex;flex-direction:column;gap:10px;font-family:Inter,system-ui,sans-serif;}' +
      '#tchiloMusicFallback .head{display:flex;align-items:center;justify-content:space-between;}' +
      '#tchiloMusicFallback .head b{font-family:Anton,Impact,sans-serif;font-size:22px;font-weight:400;letter-spacing:.02em;}' +
      '#tchiloMusicFallback .x{width:40px;height:40px;border-radius:12px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;font-weight:900;cursor:pointer;box-shadow:none;}' +
      '#tchiloMusicFallback .tabs{display:flex;gap:8px;}' +
      '#tchiloMusicFallback .tab{flex:1;padding:10px;border-radius:12px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;font-weight:800;cursor:pointer;box-shadow:none;}' +
      '#tchiloMusicFallback .tab.on{background:var(--yellow,#C8F560);}' +
      '#tchiloMusicFallback .search{width:100%;padding:12px 14px;border-radius:14px;border:2.5px solid var(--ink,#0B0B0C);font-size:15px;font-weight:600;box-sizing:border-box;background:#fff;}' +
      '#tchiloMusicFallback .list{overflow:auto;flex:1;min-height:180px;max-height:50vh;}' +
      '#tchiloMusicFallback .track{display:flex;align-items:center;gap:10px;width:100%;padding:10px;margin:0 0 8px;border-radius:14px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;cursor:pointer;text-align:left;box-shadow:none;}' +
      '#tchiloMusicFallback .track:active{transform:translate(1px,1px);box-shadow:none;}' +
      '#tchiloMusicFallback .cover{width:48px;height:48px;border-radius:10px;border:2px solid var(--ink,#0B0B0C);object-fit:cover;background:#ddd;flex-shrink:0;}' +
      '#tchiloMusicFallback .meta{flex:1;min-width:0;}' +
      '#tchiloMusicFallback .meta .t{font-weight:800;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloMusicFallback .meta .a{font-size:12px;font-weight:600;opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloMusicFallback .playbtn,#tchiloMusicFallback .favbtn{width:40px;height:40px;border-radius:50%;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;background:#fff;}' +
      '#tchiloMusicFallback .playbtn{background:var(--yellow,#C8F560);}' +
      '#tchiloMusicFallback .playbtn.playing{background:#ff6f7d;color:#fff;}' +
      '#tchiloMusicFallback .favbtn.on{background:#ffe66d;}' +
      '#tchiloMusicFallback .empty{padding:28px;text-align:center;font-weight:700;opacity:.6;}' +
      '</style>' +
      '<div class="panel" role="dialog">' +
      '<div class="head"><b>Música</b><button type="button" class="x" id="tchiloMusicClose">✕</button></div>' +
      '<div class="tabs">' +
      '<button type="button" class="tab on" id="tchiloMusicTabTop">Em destaque</button>' +
      '<button type="button" class="tab" id="tchiloMusicTabFav">Favoritas</button>' +
      '</div>' +
      '<input id="tchiloMusicQRich" class="search" type="search" placeholder="Pesquisar música ou artista" autocomplete="off"/>' +
      '<div class="list" id="tchiloMusicListRich"><div class="empty">A carregar…</div></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var list = document.getElementById('tchiloMusicListRich');
    var q = document.getElementById('tchiloMusicQRich');
    var tab = 'top';
    var audio = null;
    var playingId = null;

    function getFavs() {
      try {
        var a = JSON.parse(localStorage.getItem('tchilo_fav_music') || '[]');
        return Array.isArray(a) ? a : [];
      } catch (e) {
        return [];
      }
    }
    function saveFavs(arr) {
      try {
        localStorage.setItem('tchilo_fav_music', JSON.stringify(arr.slice(0, 80)));
      } catch (e) {}
    }
    function isFav(id) {
      return getFavs().some(function (t) {
        return String(t.id) === String(id);
      });
    }
    function toggleFav(t) {
      var arr = getFavs();
      var i = arr.findIndex(function (x) {
        return String(x.id) === String(t.id);
      });
      if (i >= 0) arr.splice(i, 1);
      else
        arr.unshift({
          id: t.id,
          title: t.title,
          artist: t.artist,
          preview: t.preview,
          cover: t.cover
        });
      saveFavs(arr);
      return i < 0;
    }
    function stopAudio() {
      if (audio) {
        try {
          audio.pause();
        } catch (e) {}
        audio = null;
      }
      playingId = null;
      list.querySelectorAll('.playbtn.playing').forEach(function (b) {
        b.classList.remove('playing');
        b.innerHTML = '▶';
      });
    }
    function close() {
      stopAudio();
      overlay.remove();
    }
    document.getElementById('tchiloMusicClose').onclick = close;
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    function selectTrack(t) {
      window._pendingMusicMeta = {
        title: t.title || '',
        artist: t.artist || '',
        preview: t.preview || '',
        cover: t.cover || '',
        id: t.id || null
      };
      window._pendingMusic =
        (t.title || '') + (t.artist ? ' · ' + t.artist : '');
      try {
        if (typeof window.updateMusicBtn === 'function') window.updateMusicBtn();
      } catch (e) {}
      try {
        if (typeof window.tchiloUpdatePostMusicBtn === 'function') window.tchiloUpdatePostMusicBtn();
      } catch (e2) {}
      toast('Música selecionada');
      close();
    }

    function render(tracks) {
      list.innerHTML = '';
      if (!(tracks || []).length) {
        list.innerHTML =
          '<div class="empty">' +
          (tab === 'fav' ? 'Ainda não tens favoritas' : 'Sem resultados') +
          '</div>';
        return;
      }
      tracks.forEach(function (t, i) {
        var row = document.createElement('div');
        row.className = 'track';
        row.setAttribute('data-i', String(i));
        var cover = t.cover
          ? '<img class="cover" src="' +
            String(t.cover).replace(/"/g, '') +
            '" alt=""/>'
          : '<div class="cover"></div>';
        var favOn = isFav(t.id);
        row.innerHTML =
          cover +
          '<div class="meta"><div class="t">' +
          String(t.title || 'Faixa').replace(/</g, '') +
          '</div><div class="a">' +
          String(t.artist || '').replace(/</g, '') +
          '</div></div>' +
          '<button type="button" class="playbtn" data-play="' +
          i +
          '" aria-label="Ouvir">▶</button>' +
          '<button type="button" class="favbtn' +
          (favOn ? ' on' : '') +
          '" data-fav="' +
          i +
          '" aria-label="Favorito">' +
          (favOn ? '★' : '☆') +
          '</button>';
        list.appendChild(row);

        row.addEventListener(
          'click',
          function (e) {
            if (e.target.closest('.playbtn') || e.target.closest('.favbtn')) return;
            e.preventDefault();
            e.stopPropagation();
            selectTrack(t);
          },
          true
        );
        row.querySelector('.playbtn').addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!t.preview) {
              toast('Pré-visualização indisponível');
              return;
            }
            var btn = e.currentTarget;
            if (playingId === t.id && audio && !audio.paused) {
              stopAudio();
              return;
            }
            stopAudio();
            audio = new Audio(t.preview);
            playingId = t.id;
            btn.classList.add('playing');
            btn.innerHTML = '❚❚';
            audio.play().catch(function () {
              stopAudio();
              toast('Não foi possível reproduzir');
            });
            audio.onended = stopAudio;
          },
          true
        );
        row.querySelector('.favbtn').addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            var on = toggleFav(t);
            e.currentTarget.classList.toggle('on', on);
            e.currentTarget.textContent = on ? '★' : '☆';
            toast(on ? 'Guardada nas favoritas' : 'Removida das favoritas');
            if (tab === 'fav' && !on) render(getFavs());
          },
          true
        );
      });
    }

    function mapTracks(data) {
      var arr = (data && data.data) || data || [];
      if (!Array.isArray(arr)) arr = [];
      return arr
        .map(function (t) {
          if (!t) return null;
          return {
            id: String(t.id),
            title: t.title || t.title_short || 'Música',
            artist:
              typeof t.artist === 'string'
                ? t.artist
                : (t.artist && t.artist.name) || '',
            preview: t.preview || '',
            cover:
              t.cover ||
              (t.album && (t.album.cover_medium || t.album.cover)) ||
              ''
          };
        })
        .filter(Boolean);
    }

    function fetchTracks(term) {
      list.innerHTML = '<div class="empty">A carregar…</div>';
      var path = term
        ? 'search?q=' + encodeURIComponent(term) + '&limit=40'
        : 'chart/0/tracks?limit=40';
      var loader =
        typeof window.tchiloSearchTracks === 'function' && term
          ? window.tchiloSearchTracks(term)
          : typeof window.tchiloLoadTopTracks === 'function' && !term
            ? window.tchiloLoadTopTracks()
            : null;
      if (loader) {
        loader
          .then(function (tracks) {
            if (tracks && tracks.length && tracks[0].title) {
              render(
                tracks.map(function (t) {
                  return {
                    id: String(t.id),
                    title: t.title,
                    artist:
                      typeof t.artist === 'string'
                        ? t.artist
                        : (t.artist && t.artist.name) || '',
                    preview: t.preview || '',
                    cover:
                      t.cover ||
                      (t.album && (t.album.cover_medium || t.album.cover)) ||
                      ''
                  };
                })
              );
            } else render([]);
          })
          .catch(function () {
            list.innerHTML =
              '<div class="empty">Não foi possível carregar músicas</div>';
          });
        return;
      }
      var cb = 'tchiloMp_' + Date.now();
      var s = document.createElement('script');
      var timer = setTimeout(function () {
        cleanup();
        list.innerHTML =
          '<div class="empty">Não foi possível carregar músicas</div>';
      }, 12000);
      function cleanup() {
        clearTimeout(timer);
        try {
          delete window[cb];
        } catch (e) {
          window[cb] = undefined;
        }
        if (s.parentNode) s.parentNode.removeChild(s);
      }
      window[cb] = function (data) {
        cleanup();
        render(mapTracks(data));
      };
      s.src =
        'https://api.deezer.com/' +
        path +
        (path.indexOf('?') >= 0 ? '&' : '?') +
        'output=jsonp&callback=' +
        cb;
      document.head.appendChild(s);
    }

    document.getElementById('tchiloMusicTabTop').onclick = function () {
      tab = 'top';
      this.classList.add('on');
      document.getElementById('tchiloMusicTabFav').classList.remove('on');
      q.style.display = '';
      fetchTracks((q.value || '').trim());
    };
    document.getElementById('tchiloMusicTabFav').onclick = function () {
      tab = 'fav';
      this.classList.add('on');
      document.getElementById('tchiloMusicTabTop').classList.remove('on');
      q.style.display = 'none';
      render(getFavs());
    };

    var timer = null;
    q.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (tab === 'top') fetchTracks((q.value || '').trim());
      }, 350);
    });
    fetchTracks('');
  }

  window.openMusicPicker = openMusicPicker;
  window.tchiloOpenMusicPicker = openMusicPicker;

  function hookBtn() {
    var btn = document.getElementById('tchiloCreateMusicBtn') || document.getElementById('postMusicBtn');
    if (btn && !btn.__richMusic) {
      btn.__richMusic = true;
      btn.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          openMusicPicker();
        },
        true
      );
    }
    document.querySelectorAll('#screen-create button').forEach(function (b) {
      var t = (b.textContent || '').toLowerCase();
      if (t.indexOf('música') >= 0 || t.indexOf('musica') >= 0) {
        if (b.__richMusic) return;
        b.__richMusic = true;
        b.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            openMusicPicker();
          },
          true
        );
      }
    });
  }

  function boot() {
    hookBtn();
  }
  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setInterval(boot, 2500);
})();
