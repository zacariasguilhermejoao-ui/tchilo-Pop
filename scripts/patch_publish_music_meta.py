#!/usr/bin/env python3
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

old = "music:window._pendingMusic||null}; window._pendingMusic=null;"
new = (
    "music:window._pendingMusic||null,"
    "musicMeta:(window._pendingMusicMeta||null)};"
    "window._pendingMusic=null;window._pendingMusicMeta=null;"
)
new = "".join(new)

if old in html:
    html = html.replace(old, new, 1)
    p.write_text(html, encoding="utf-8")
    print("publish musicMeta patched")
elif "musicMeta:(window._pendingMusicMeta" in html:
    print("already patched")
else:
    print("WARNING: publish pattern not found")
