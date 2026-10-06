#!/usr/bin/env python3
from pathlib import Path
import base64
parts = sorted(Path("native").glob("mp5-*.txt"), key=lambda p: int(p.stem.split("-")[1]))
if not parts:
    print("no parts"); raise SystemExit(0)
raw = "".join(p.read_text(encoding="ascii").strip() for p in parts)
data = base64.b64decode(raw)
if len(data) < 30000:
    print("too small", len(data)); raise SystemExit(1)
Path("native/tchilo-media-picker.js").write_bytes(data)
print("RESTORED", len(data))
for p in parts:
    try: p.unlink()
    except Exception: pass
