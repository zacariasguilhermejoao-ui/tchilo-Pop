#!/usr/bin/env python3
import base64
from pathlib import Path
parts=[]
for i in range(4):
    p=Path(f"scripts/tchilo-verified_b64_{i}.txt")
    if not p.exists():
        print("missing", p)
        raise SystemExit(0)
    parts.append(p.read_text().strip())
B="".join(parts)
Path("native").mkdir(parents=True, exist_ok=True)
Path("native/tchilo-verified.js").write_bytes(base64.b64decode(B))
print("restored native/tchilo-verified.js", len(B))
