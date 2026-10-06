#!/usr/bin/env python3
"""Force restore full media-picker.js when missing, placeholder, or truncated."""
from pathlib import Path
import urllib.request, re

mp = Path("native/tchilo-media-picker.js")
cur = mp.read_bytes() if mp.exists() else b""
need = (not mp.exists()) or len(cur) < 20000 or b"PLACEHOLDER" in cur[:40] or b"function ensureDOM" not in cur
print("size", len(cur), "need", need)
if need:
    urls = [
        "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/d9eef54094bb2fc06cfb6fd009f39f156e873e56/native/tchilo-media-picker.js",
        "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@d9eef54094bb2fc06cfb6fd009f39f156e873e56/native/tchilo-media-picker.js",
    ]
    ok = False
    for u in urls:
        try:
            print("fetch", u)
            data = urllib.request.urlopen(u, timeout=45).read()
            if len(data) > 20000 and b"function ensureDOM" in data:
                mp.write_bytes(data)
                print("RESTORED", len(data))
                ok = True
                break
            print("bad", len(data))
        except Exception as e:
            print("fail", e)
    if not ok:
        raise SystemExit("restore failed")

idx = Path("index.html")
t = idx.read_text(encoding="utf-8", errors="replace")
nt = re.sub(r"tchilo-media-picker\.js\?v=\d+", "tchilo-media-picker.js?v=12", t)
if "tchilo-compose-music-v6.js" not in nt:
    nt = nt.replace(
        'native/tchilo-media-picker.js?v=12" defer></script>',
        'native/tchilo-media-picker.js?v=12" defer></script>\n<script src="native/tchilo-compose-music-v6.js?v=1" defer></script>',
    )
if nt != t:
    idx.write_text(nt, encoding="utf-8")
    print("index cache v12")
