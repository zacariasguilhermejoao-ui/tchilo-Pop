#!/usr/bin/env python3
"""Music list UX: play on cover, star, arrow, duration, infinite scroll."""
from pathlib import Path
import re

pm = Path('native/post-music-feed.js')
if not pm.exists():
    raise SystemExit(0)

t = pm.read_text(encoding='utf-8', errors='replace')
orig = t

# --- mapTrack: add duration ---
old_map = '''function mapTrack(t) {
    if (!t) return null;
    return {
      id: String(t.id),
      title: t.title || t.title_short || 'Música',
      artist: (t.artist && t.artist.name) || 'Artista',
      preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || ''
    };
  }'''
new_map = '''function mapTrack(t) {
    if (!t) return null;
    var dur = t.duration || t.duration_sec || 0;
    if (typeof dur === 'string') dur = parseInt(dur, 10) || 0;
    return {
      id: String(t.id),
      title: t.title || t.title_short || 'Música',
      artist: (t.artist && t.artist.name) || 'Artista',
      preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || '',
      duration: dur
    };
  }
  function formatTrackDur(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }'''
if old_map in t:
    t = t.replace(old_map, new_map, 1)
    print('mapTrack ok')
elif 'formatTrackDur' not in t:
    print('mapTrack miss')

# --- svg arrow ---
if 'function svgArrow' not in t:
    t = t.replace(
        "function svgStar(on) {",
        "function svgArrow() {\n"
        "    return '<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 18l6-6-6-6\"/></svg>';\n"
        "  }\n"
        "  function svgStar(on) {",
        1,
    )
    print('svgArrow ok')

# --- renderTracks rewrite ---
# Find and replace the function body via regex
new_render = r'''function renderTracks(tracks, isSearch, isFavTab, append) {
    var list = document.getElementById('pmList');
    if (!list) return;
    if (!tracks.length && !append) {
      list.innerHTML =
        '<div class="empty">' +
        (isFavTab ? 'Ainda não tens músicas favoritas. Guarda com a estrela.' : 'Sem resultados') +
        '</div>';
      return;
    }
    var startIdx = append ? list.querySelectorAll('.track').length : 0;
    var html = tracks
      .map(function (t, i) {
        var idx = startIdx + i;
        var fav = isFav(t.id);
        var dur = t.duration ? formatTrackDur(t.duration) : '';
        var coverInner = t.cover
          ? '<img src="' + String(t.cover).replace(/"/g, '') + '" alt="">'
          : '<div class="cover-ph"></div>';
        return (
          '<div class="track" data-i="' +
          idx +
          '">' +
          '<button type="button" class="cover-play" data-play="' +
          idx +
          '" aria-label="Pré-ouvir">' +
          coverInner +
          '<span class="cover-ico">' +
          svgPlay() +
          '</span></button>' +
          '<div class="t"><b>' +
          String(t.title || '').replace(/</g, '&lt;') +
          '</b><span>' +
          String(t.artist || '').replace(/</g, '&lt;') +
          (dur ? ' · ' + dur : '') +
          '</span></div>' +
          '<button type="button" class="favbtn' +
          (fav ? ' on' : '') +
          '" data-fav="' +
          idx +
          '" aria-label="Favorita">' +
          svgStar(fav) +
          '</button>' +
          '<button type="button" class="usebtn" data-use="' +
          idx +
          '" aria-label="Usar">' +
          svgArrow() +
          '</button></div>'
        );
      })
      .join('');

    if (append) {
      var empty = list.querySelector('.empty');
      if (empty) empty.remove();
      list.insertAdjacentHTML('beforeend', html);
    } else {
      list.innerHTML = html;
    }

    // store tracks on list for infinite handlers
    if (!append) list._pmTracks = tracks.slice();
    else list._pmTracks = (list._pmTracks || []).concat(tracks);

    function getTrack(i) {
      return (list._pmTracks || tracks)[i];
    }

    list.querySelectorAll('.cover-play').forEach(function (btn) {
      if (btn.__pmBound) return;
      btn.__pmBound = true;
      btn.onclick = function (e) {
        e.stopPropagation();
        var tr = getTrack(Number(btn.getAttribute('data-play')));
        togglePreview(tr, btn);
      };
    });
    list.querySelectorAll('.favbtn').forEach(function (btn) {
      if (btn.__pmBound) return;
      btn.__pmBound = true;
      btn.onclick = function (e) {
        e.stopPropagation();
        var tr = getTrack(Number(btn.getAttribute('data-fav')));
        var on = toggleFav(tr);
        btn.classList.toggle('on', on);
        btn.innerHTML = svgStar(on);
        if (isFavTab && !on) renderTracks(getFavs(), false, true);
        if (typeof showToast === 'function') showToast(on ? 'Guardada nas favoritas' : 'Removida das favoritas');
      };
    });
    list.querySelectorAll('.usebtn, .track').forEach(function (el) {
      if (el.__pmBound) return;
      el.__pmBound = true;
      el.onclick = function (e) {
        if (e.target.closest('.cover-play') || e.target.closest('.favbtn')) return;
        if (el.classList.contains('usebtn')) e.stopPropagation();
        var row = el.classList.contains('track') ? el : el.closest('.track');
        if (!row) return;
        selectTrack(getTrack(Number(row.getAttribute('data-i'))));
      };
    });
  }'''

# Replace existing renderTracks function - from function renderTracks to next function at same indent
m = re.search(r'function renderTracks\([^{]*\) \{', t)
if m:
    start = m.start()
    # brace match
    i = m.end() - 1
    depth = 0
    while i < len(t):
        if t[i] == '{':
            depth += 1
        elif t[i] == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
        i += 1
    else:
        end = None
    if end:
        t = t[:start] + new_render + t[end:]
        print('renderTracks replaced')
    else:
        print('renderTracks brace fail')
else:
    print('renderTracks not found')

# --- infinite scroll state + loadMore ---
if 'pmListOffset' not in t:
    # after topCache vars if any
    if 'var topCache' in t:
        t = t.replace(
            'var topCache',
            'var pmListOffset = 0;\n  var pmListLoading = false;\n  var pmListHasMore = true;\n  var pmScrollBound = false;\n  var topCache',
            1,
        )
    else:
        t = t.replace(
            "'use strict';",
            "'use strict';\n  var pmListOffset = 0;\n  var pmListLoading = false;\n  var pmListHasMore = true;\n  var pmScrollBound = false;",
            1,
        )
    print('scroll state')

# replace loadTopTracks to support index
old_load = "return catalogFetch('chart/0/tracks?limit=40')"
if old_load in t:
    t = t.replace(
        old_load,
        "return catalogFetch('chart/0/tracks?limit=40&index=' + (arguments[1] || 0))",
        1,
    )
    print('loadTop index')

# Better: rewrite loadTopTracks signature usage
if 'function loadTopTracks(force)' in t and 'loadTopTracks(force, offset)' not in t:
    t = t.replace(
        'function loadTopTracks(force) {
    if (!force && topCache && Date.now() - topCacheAt < TOP_TTL) {
      return Promise.resolve(topCache);
    }
    return catalogFetch(',
        'function loadTopTracks(force, offset) {
    offset = offset || 0;
    if (!force && offset === 0 && topCache && Date.now() - topCacheAt < TOP_TTL) {
      return Promise.resolve(topCache);
    }
    return catalogFetch(',
        1,
    )
    # fix chart URL if not done
    t = t.replace(
        "catalogFetch('chart/0/tracks?limit=40')",
        "catalogFetch('chart/0/tracks?limit=40&index=' + offset)",
        1,
    )
    t = t.replace(
        "catalogFetch('chart/0/tracks?limit=40&index=' + (arguments[1] || 0))",
        "catalogFetch('chart/0/tracks?limit=40&index=' + offset)",
        1,
    )
    # when offset 0 update cache
    t = t.replace(
        '''.then(function (data) {
      var list = ((data && data.data) || []).map(mapTrack).filter(Boolean);
      topCache = list;
      topCacheAt = Date.now();''',
        '''.then(function (data) {
      var list = ((data && data.data) || []).map(mapTrack).filter(Boolean);
      if (offset === 0) {
        topCache = list;
        topCacheAt = Date.now();
      }''',
        1,
    )
    print('loadTopTracks offset')

# bind infinite scroll in ensureMusicSheet or openPostMusic
scroll_hook = '''
  function bindPmInfiniteScroll() {
    var list = document.getElementById('pmList');
    if (!list || list.__pmScroll) return;
    list.__pmScroll = true;
    list.addEventListener('scroll', function () {
      if (musicTab === 'favoritas') return;
      if (pmListLoading || !pmListHasMore) return;
      var q = (document.getElementById('pmSearch') && document.getElementById('pmSearch').value) || '';
      if (q && String(q).trim()) return; // search: no infinite for now
      if (list.scrollTop + list.clientHeight < list.scrollHeight - 120) return;
      pmListLoading = true;
      pmListOffset += 40;
      loadTopTracks(true, pmListOffset)
        .then(function (tracks) {
          if (!tracks || !tracks.length) {
            pmListHasMore = false;
            return;
          }
          if (tracks.length < 40) pmListHasMore = false;
          renderTracks(tracks, false, false, true);
        })
        .catch(function () {
          pmListHasMore = false;
        })
        .finally(function () {
          pmListLoading = false;
        });
    });
  }
'''

if 'bindPmInfiniteScroll' not in t:
    t = t.replace('function openPostMusic()', scroll_hook + '\n  function openPostMusic()', 1)
    # call on open
    t = t.replace(
        "document.getElementById('tchiloPostMusicSheet').classList.add('open');",
        "document.getElementById('tchiloPostMusicSheet').classList.add('open');\n    pmListOffset = 0;\n    pmListHasMore = true;\n    bindPmInfiniteScroll();",
        1,
    )
    print('infinite scroll')

# loadList reset offset
if 'pmListOffset = 0' not in t[t.find('function loadList'):t.find('function loadList')+200]:
    t = t.replace(
        'function loadList(q) {
    if (musicTab === \'favoritas\') {',
        'function loadList(q) {
    pmListOffset = 0;
    pmListHasMore = true;
    if (musicTab === \'favoritas\') {',
        1,
    )

if t != orig:
    pm.write_text(t, encoding='utf-8')
    print('post-music-feed written', len(t))
else:
    print('unchanged')
"""
