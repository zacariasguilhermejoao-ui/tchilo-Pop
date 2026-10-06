#!/usr/bin/env python3
"""Play never selects; compose preview fills screen; wire index."""
from pathlib import Path
import re

# --- index cache bust ---
p = Path('index.html')
if p.exists():
    html = p.read_text(encoding='utf-8', errors='replace')
    o = html
    html = re.sub(r'tchilo-music-list-ux\.js\?v=\d+', 'tchilo-music-list-ux.js?v=3', html)
    if 'tchilo-music-list-ux.js' not in html:
        html = re.sub(
            r'(<script src="native/tchilo-music-flat\.css\.js[^>]+></script>)',
            r'\1\n<script src="native/tchilo-music-list-ux.js?v=3" defer></script>',
            html,
            count=1,
        )
    html = re.sub(r'tchilo-media-picker\.js\?v=\d+', 'tchilo-media-picker.js?v=6', html)
    if html != o:
        p.write_text(html, encoding='utf-8')
        print('index ok')

# --- post-music: row click ignores cover-play ---
pm = Path('native/post-music-feed.js')
if pm.exists():
    t = pm.read_text(encoding='utf-8', errors='replace')
    o = t
    t = t.replace(
        "if (e.target.closest('.playbtn') || e.target.closest('.favbtn')) return;",
        "if (e.target.closest('.playbtn') || e.target.closest('.favbtn') || e.target.closest('.cover-play') || e.target.closest('.usebtn') || e.target.closest('.cover-ico')) return;",
    )
    if 'window.__lastPmTracks' not in t and 'list.innerHTML = tracks' in t:
        t = t.replace(
            'list.innerHTML = tracks',
            "try { window.__lastPmTracks = tracks.slice(); list._pmTracks = tracks.slice(); if (typeof window.tchiloSetPmTracks==='function') window.tchiloSetPmTracks(tracks); } catch(e) {}\n    list.innerHTML = tracks",
            1,
        )
    # expose selectTrack / togglePreview for UX
    if 'window.__tchiloSelectTrack' not in t and 'function selectTrack' in t:
        t = t.replace(
            'function selectTrack(t) {',
            'window.__tchiloSelectTrack = selectTrack;\n  window.__tchiloTogglePreview = togglePreview;\n  function selectTrack(t) {',
            1,
        )
    if t != o:
        pm.write_text(t, encoding='utf-8')
        print('pm patched')

# --- media picker: preview fills screen ---
mp = Path('native/tchilo-media-picker.js')
if mp.exists():
    t = mp.read_text(encoding='utf-8', errors='replace')
    o = t
    t = t.replace(
        "#tchiloMediaPicker .mp-preview img,#tchiloMediaPicker .mp-preview video{max-width:100%;max-height:100%;object-fit:contain;}",
        "#tchiloMediaPicker .mp-preview img,#tchiloMediaPicker .mp-preview video{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:cover;}",
    )
    t = t.replace(
        "#tchiloMediaPicker .mp-preview{flex:1;min-height:0;background:#000;display:flex;align-items:center;justify-content:center;position:relative",
        "#tchiloMediaPicker .mp-preview{flex:1;min-height:0;background:#000;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden",
    )
    # paintCompose: ensure full size styles on elements
    if 'v.style.width' not in t and 'paintCompose' in t:
        t = t.replace(
            "v.setAttribute('playsinline', '');",
            "v.setAttribute('playsinline', '');\n"
            "      v.style.width='100%';v.style.height='100%';v.style.objectFit='cover';",
            1,
        )
    if "img.style.width='100%'" not in t and 'paintCompose' in t:
        # after creating image in compose
        if 'box.appendChild' in t:
            pass
        # generic: after img src in paintCompose
        t = re.sub(
            r"(img\.src = m\.url;)",
            r"\1\n      img.style.width='100%';img.style.height='100%';img.style.objectFit='cover';",
            t,
            count=1,
        )
    if t != o:
        mp.write_text(t, encoding='utf-8')
        print('picker fill')
    else:
        print('picker unchanged')

print('done')
