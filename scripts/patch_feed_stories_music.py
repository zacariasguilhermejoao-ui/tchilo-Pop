#!/usr/bin/env python3
from pathlib import Path

idx = Path("index.html")
if not idx.exists():
    raise SystemExit(0)

html = idx.read_text(encoding="utf-8", errors="replace")
changed = False

for js in ("native/feed-stories-scroll.js", "native/music-use-sheet.js", "native/story-music.js", "native/feed-music-play.js"):
    if js not in html and "</body>" in html:
        html = html.replace("</body>", f'<script src="{js}"></script>\n</body>', 1)
        changed = True
        print("injected", js)

# Neutralize chrome-hidden collapsing stories in CSS (backup if JS late)
old = """  #appFrame.chrome-hidden .stories{
    max-height:0; height:0; padding-top:0; padding-bottom:0; border-bottom-width:0;
    opacity:0; pointer-events:none; overflow:hidden;
  }"""
new = """  /* stories scroll with feed — do not collapse on chrome-hidden */
  #appFrame.chrome-hidden .stories{
    /* kept visible; unified scroll handles position */
  }"""
if old in html:
    html = html.replace(old, new, 1)
    changed = True
    print("chrome-hidden stories neutralized")

if changed:
    idx.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("no changes")
