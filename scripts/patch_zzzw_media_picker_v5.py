#!/usr/bin/env python3
from pathlib import Path
import base64
parts = sorted(Path("native").glob("mp-v5-b64-*.txt"), key=lambda p: int(p.stem.split("-")[-1]))
if not parts:
    print("no b64 parts"); raise SystemExit(0)
data = base64.b64decode("".join(p.read_text(encoding="ascii").strip() for p in parts))
Path("native/tchilo-media-picker.js").write_bytes(data)
print("media-picker v5 written", len(data))
for p in parts:
    try: p.unlink()
    except Exception: pass
