#!/usr/bin/env python3
from pathlib import Path
import re

ux = Path("native/tchilo-music-list-ux.js")
if ux.exists():
    t = ux.read_text(encoding="utf-8", errors="replace")
    o = t
    old = """if (e.target.closest('.cover-play, .playbtn, .favbtn, .usebtn, .cover-ico, button')) {
              e.stopPropagation();
              // do not select when control clicked
              if (e.target.closest('.cover-play, .playbtn, .cover-ico')) {
                e.preventDefault();
              }
            }"""
    new = """if (e.target.closest('.cover-play, .playbtn, .favbtn, .usebtn, .cover-ico, button')) {
              // only stop row-select for play controls; fav must bubble to its own handler
              if (e.target.closest('.cover-play, .playbtn, .cover-ico')) {
                e.stopPropagation();
                e.preventDefault();
              } else if (e.target.closest('.usebtn')) {
                e.stopPropagation();
              }
              // favbtn: do NOT stopPropagation here — fav handler needs the event
            }"""
    if old in t:
        t = t.replace(old, new, 1)
        print("ux fav fix")
    if t != o:
        ux.write_text(t, encoding="utf-8")
        print("ux written")

idx = Path("index.html")
if idx.exists():
    t = idx.read_text(encoding="utf-8", errors="replace")
    o = t
    t = re.sub(
        r'tchilo-compose-music-v8\.js\?v=\d+',
        'tchilo-compose-music-v9.js?v=1',
        t,
    )
    t = t.replace('tchilo-compose-music-v8.js', 'tchilo-compose-music-v9.js?v=1')
    t = re.sub(r'tchilo-music-list-ux\.js\?v=\d+', 'tchilo-music-list-ux.js?v=6', t)
    t = re.sub(r'tchilo-media-picker\.js\?v=\d+', 'tchilo-media-picker.js?v=15', t)
    if 'tchilo-compose-music-v9.js' not in t and 'tchilo-compose-music' in t:
        t = re.sub(
            r'<script[^>]*tchilo-compose-music[^>]*></script>',
            '<script src="native/tchilo-compose-music-v9.js?v=1" defer></script>',
            t,
            count=1,
        )
    if t != o:
        idx.write_text(t, encoding="utf-8")
        print("index wired v9")
    else:
        print("index unchanged")
