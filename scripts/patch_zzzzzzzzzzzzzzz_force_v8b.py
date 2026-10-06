#!/usr/bin/env python3
from pathlib import Path
import re

p = Path("native/tchilo-media-picker.js")
if p.exists() and p.stat().st_size > 15000:
    t = p.read_text(encoding="utf-8", errors="replace")
    o = t
    if "window.__tchiloSetCreateMode" not in t:
        t = t.replace(
            "function bindModeTabs() {",
            "window.__tchiloSetCreateMode = setCreateMode;\n  function bindModeTabs() {",
            1,
        )
        print("exposed")
    t2 = re.sub(
        r"'#tchiloMediaPicker \.mp-publish\{[^']*'\s*,\s*'[^']*cursor:pointer;\}'",
        "'#tchiloMediaPicker .mp-publish{border:0;border-radius:0;padding:6px 4px;margin-left:auto;"
        "font:800 18px/1.1 system-ui,-apple-system,sans-serif;letter-spacing:0.04em;text-transform:uppercase;',\n"
        "      'background:transparent;color:var(--ink,#0B0B0C);cursor:pointer;box-shadow:none;}'",
        t,
        count=1,
    )
    if t2 != t:
        t = t2
        print("publish css regex")
    t = t.replace('>Publicar</button>', '>PUBLICAR</button>')
    if t != o:
        p.write_text(t, encoding="utf-8")
        print("mp written", len(t))
    else:
        print("mp no change")

pm = Path("native/post-music-feed.js")
if pm.exists():
    t = pm.read_text(encoding="utf-8", errors="replace")
    o = t
    t = t.replace(
        "cover: (t.album && (t.album.cover_medium || t.album.cover)) || ''",
        "cover: (t.album && (t.album.cover_big || t.album.cover_medium || t.album.cover)) || ''",
    )
    if t != o:
        pm.write_text(t, encoding="utf-8")
        print("pmf covers")

ux = Path("native/tchilo-music-list-ux.js")
if ux.exists():
    t = ux.read_text(encoding="utf-8", errors="replace")
    o = t
    t = t.replace(
        "cover: (t.album && (t.album.cover_medium || t.album.cover)) || ''",
        "cover: (t.album && (t.album.cover_big || t.album.cover_medium || t.album.cover)) || ''",
    )
    if t != o:
        ux.write_text(t, encoding="utf-8")
        print("ux covers")

flat = Path("native/tchilo-music-flat.css.js")
if flat.exists():
    t = flat.read_text(encoding="utf-8", errors="replace")
    o = t
    t = t.replace("__TCHILO_MUSIC_FLAT_V4", "__TCHILO_MUSIC_FLAT_V5")
    t = t.replace("V4) return", "V5) return")
    t = t.replace("width:48px!important;height:48px!important", "width:64px!important;height:64px!important")
    t = t.replace("background:rgba(11,11,12,.06)!important;color:", "background:transparent!important;color:")
    t = t.replace("background:rgba(11,11,12,.08)!important;color:", "background:transparent!important;color:")
    if "filter:none" not in t:
        t = t.replace("box-shadow:none!important;", "box-shadow:none!important;filter:none!important;")
    if t != o:
        flat.write_text(t, encoding="utf-8")
        print("flat v5")

idx = Path("index.html")
if idx.exists():
    t = idx.read_text(encoding="utf-8", errors="replace")
    o = t
    t = t.replace("tchilo-compose-music-v8.js?v=1", "tchilo-compose-music-v8.js?v=2")
    t = re.sub(r"tchilo-media-picker\.js\?v=\d+", "tchilo-media-picker.js?v=14", t)
    t = t.replace("tchilo-music-flat.css.js?v=5", "tchilo-music-flat.css.js?v=6")
    t = t.replace("tchilo-music-flat.css.js?v=4", "tchilo-music-flat.css.js?v=6")
    t = t.replace("post-music-feed.js?v=3", "post-music-feed.js?v=4")
    t = t.replace("post-music-feed.js?v=2", "post-music-feed.js?v=4")
    t = t.replace("tchilo-music-list-ux.js?v=4", "tchilo-music-list-ux.js?v=5")
    t = t.replace("tchilo-music-list-ux.js?v=3", "tchilo-music-list-ux.js?v=5")
    if t != o:
        idx.write_text(t, encoding="utf-8")
        print("index bump")
