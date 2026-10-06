#!/usr/bin/env python3
"""Force write compose UI v6: float music autoplay, white icons, Aa caption."""
from pathlib import Path
import base64
parts = sorted(Path("native").glob("mp6-*.txt"), key=lambda p: int(p.stem.split("-")[1]))
if not parts:
    print("no mp6 parts"); raise SystemExit(0)
data = base64.b64decode("".join(p.read_text(encoding="ascii").strip() for p in parts))
if len(data) < 30000:
    print("too small", len(data)); raise SystemExit(1)
Path("native/tchilo-media-picker.js").write_bytes(data)
print("compose UI v6 written", len(data))
for p in parts:
    try: p.unlink()
    except Exception: pass
h = Path("index.html")
if h.exists():
    t = h.read_text(encoding="utf-8", errors="replace")
    t2 = t.replace("tchilo-media-picker.js?v=9", "tchilo-media-picker.js?v=10")
    t2 = t2.replace("tchilo-media-picker.js?v=8", "tchilo-media-picker.js?v=10")
    if t2 != t:
        h.write_text(t2, encoding="utf-8")
        print("index v10")
