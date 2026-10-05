#!/usr/bin/env python3
import base64
from pathlib import Path
parts=[]
for i in range(5):
    p=Path(f"scripts/tchilo-ads-pro_b64_{i}.txt")
    if not p.exists():
        print("missing", p)
        raise SystemExit(0)
    parts.append(p.read_text().strip())
B="".join(parts)
Path("native").mkdir(parents=True, exist_ok=True)
Path("native/tchilo-ads-pro.js").write_bytes(base64.b64decode(B))
print("restored native/tchilo-ads-pro.js", len(B))
