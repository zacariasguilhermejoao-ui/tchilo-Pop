#!/usr/bin/env python3
from pathlib import Path
import base64
parts = sorted(Path("native").glob("mpv6-*.txt"), key=lambda p: int(p.stem.split("-")[1]))
if not parts:
    print("no mpv6 parts"); raise SystemExit(0)
raw = base64.b64decode("".join(p.read_text().strip() for p in parts))
Path("native/tchilo-media-picker.js").write_bytes(raw)
print("wrote media-picker", len(raw))
for p in parts:
    try: p.unlink()
    except Exception: pass
import re
idx = Path("index.html")
t = idx.read_text(encoding="utf-8", errors="replace")
nt = re.sub(r"tchilo-media-picker\\.js\\?v=\\d+", "tchilo-media-picker.js?v=10", t)
if nt != t:
    idx.write_text(nt, encoding="utf-8")
    print("cache v10")
