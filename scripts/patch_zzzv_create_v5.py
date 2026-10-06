#!/usr/bin/env python3
from pathlib import Path
import re
p = Path('index.html')
if not p.exists():
    raise SystemExit(0)
t = p.read_text(encoding='utf-8', errors='replace')
o = t
t = t.replace('tchilo-media-picker.js?v=8', 'tchilo-media-picker.js?v=9')
t = t.replace('tchilo-media-picker.js?v=7', 'tchilo-media-picker.js?v=9')
t = t.replace('tchilo-light-create.css.js?v=2', 'tchilo-light-create.css.js?v=3')
t = t.replace('tchilo-light-create.css.js?v=1', 'tchilo-light-create.css.js?v=3')
t = t.replace('post-music-feed.js"', 'post-music-feed.js?v=2"')
t = t.replace('post-music-feed.js?v=1"', 'post-music-feed.js?v=2"')
t = t.replace('tchilo-create-buttons.js?v=3', 'tchilo-create-buttons.js?v=4')
if t != o:
    p.write_text(t, encoding='utf-8')
    print('index versions bumped v5')
else:
    print('index already bumped or patterns missing')
