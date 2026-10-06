#!/usr/bin/env python3
from pathlib import Path
import re

# index bumps
p = Path('index.html')
if p.exists():
    html = p.read_text(encoding='utf-8', errors='replace')
    o = html
    html = re.sub(r'tchilo-music-flat\.css\.js\?v=\d+', 'tchilo-music-flat.css.js?v=4', html)
    html = re.sub(r'tchilo-music-list-ux\.js\?v=\d+', 'tchilo-music-list-ux.js?v=2', html)
    if 'tchilo-music-list-ux.js' not in html:
        html = re.sub(
            r'(<script src="native/tchilo-music-flat\.css\.js[^>]+></script>)',
            r'\1\n<script src="native/tchilo-music-list-ux.js?v=2" defer></script>',
            html,
            count=1,
        )
    if html != o:
        p.write_text(html, encoding='utf-8')
        print('index bumped')

# post-music: store tracks globally after render
pm = Path('native/post-music-feed.js')
if pm.exists():
    t = pm.read_text(encoding='utf-8', errors='replace')
    o = t
    if 'window.__lastPmTracks' not in t:
        # after list.innerHTML = tracks.map in renderTracks — inject store
        needle = 'list.innerHTML = tracks'
        if needle in t:
            t = t.replace(
                needle,
                'try { window.__lastPmTracks = tracks.slice(); list._pmTracks = tracks.slice(); if (typeof window.tchiloSetPmTracks===\'function\') window.tchiloSetPmTracks(tracks); } catch(e) {}\n    list.innerHTML = tracks',
                1,
            )
            print('store tracks')
    # remove residual yellow tab if any left in source
    t = t.replace(".tab.on{background:var(--mint,#c8f560);}", ".tab.on{background:rgba(11,11,12,.12);color:var(--ink,#0B0B0C);}")
    t = t.replace(".tab.on{background:var(--mint,#c8f560)}", ".tab.on{background:rgba(11,11,12,.12);color:var(--ink,#0B0B0C)}")
    # track borders in embedded css
    t = t.replace(
        "#tchiloPostMusicSheet .track{display:flex;gap:10px;align-items:center;padding:12px 4px;border-bottom:1px solid rgba(23,23,26,.08);cursor:pointer;}",
        "#tchiloPostMusicSheet .track{display:flex;gap:12px;align-items:center;padding:12px 0;border:0;border-bottom:1px solid rgba(11,11,12,.08);border-radius:0;background:transparent;box-shadow:none;cursor:pointer;}",
    )
    t = t.replace(
        "#tchiloPostMusicSheet .track img{width:48px;height:48px;border-radius:8px;object-fit:cover;border:0;background:#ddd;}",
        "#tchiloPostMusicSheet .track img{width:48px;height:48px;border-radius:10px;object-fit:cover;border:0;background:transparent;}",
    )
    if t != o:
        pm.write_text(t, encoding='utf-8')
        print('pm written')
    else:
        print('pm unchanged')
"""
