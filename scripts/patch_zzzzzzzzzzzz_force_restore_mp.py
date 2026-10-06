#!/usr/bin/env python3
"""Force restore full media-picker.js from known-good commit."""
from pathlib import Path
import urllib.request

mp = Path("native/tchilo-media-picker.js")
urls = [
    "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/d9eef54094bb2fc06cfb6fd009f39f156e873e56/native/tchilo-media-picker.js",
    "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@d9eef54094bb2fc06cfb6fd009f39f156e873e56/native/tchilo-media-picker.js",
]
ok = False
for u in urls:
    try:
        print("fetch", u)
        data = urllib.request.urlopen(u, timeout=45).read()
        if len(data) > 20000 and b"function ensureDOM" in data and b"PLACEHOLDER" not in data[:30]:
            mp.write_bytes(data)
            print("RESTORED", len(data))
            ok = True
            break
        else:
            print("bad size", len(data))
    except Exception as e:
        print("fail", e)
if not ok:
    raise SystemExit("restore failed")

# Only light cache-bust index
import re
idx = Path("index.html")
t = idx.read_text(encoding="utf-8", errors="replace")
nt = re.sub(r"tchilo-media-picker\.js\?v=\d+", "tchilo-media-picker.js?v=11", t)
if "tchilo-compose-music-v6.js" not in nt:
    nt = nt.replace(
        'native/tchilo-media-picker.js?v=11" defer></script>',
        'native/tchilo-media-picker.js?v=11" defer></script>\n<script src="native/tchilo-compose-music-v6.js?v=1" defer></script>',
    )
if nt != t:
    idx.write_text(nt, encoding="utf-8")
    print("index cache v11")
