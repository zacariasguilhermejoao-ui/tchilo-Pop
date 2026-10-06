#!/usr/bin/env python3
from pathlib import Path
import re

idx = Path("index.html")
if not idx.exists():
    print("no index"); raise SystemExit(0)
t = idx.read_text(encoding="utf-8", errors="replace")
o = t

t = t.replace(
    'native/tchilo-compose-music-v6.js?v=1',
    'native/tchilo-compose-music-v7.js?v=1'
)
t = t.replace(
    'native/tchilo-compose-music-v6.js',
    'native/tchilo-compose-music-v7.js?v=1'
)

if 'tchilo-compose-music-v7.js' not in t and 'tchilo-compose-music' not in t:
    t = re.sub(
        r'(<script[^>]*tchilo-media-picker\.js[^>]*></script>)',
        r'\1\n<script src="native/tchilo-compose-music-v7.js?v=1" defer></script>',
        t,
        count=1
    )
elif 'tchilo-compose-music-v7.js' not in t and 'tchilo-compose-music-v6.js' in t:
    t = re.sub(
        r'<script[^>]*tchilo-compose-music-v6\.js[^>]*></script>',
        '<script src="native/tchilo-compose-music-v7.js?v=1" defer></script>',
        t,
        count=1
    )

t = re.sub(r'tchilo-media-picker\.js\?v=\d+', 'tchilo-media-picker.js?v=12', t)

if t != o:
    idx.write_text(t, encoding="utf-8")
    print("index wired v7")
else:
    print("index already ok or no match")
