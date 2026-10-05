#!/usr/bin/env python3
"""Restore native/tchilo-live.js from split base64 parts."""
from pathlib import Path
import base64

a = Path("scripts/tchilo-live.b64.a")
b = Path("scripts/tchilo-live.b64.b")
single = Path("scripts/tchilo-live.b64")
out = Path("native/tchilo-live.js")

if a.exists() and b.exists():
    raw = (a.read_text().strip() + b.read_text().strip()).encode("ascii")
elif single.exists():
    raw = single.read_text().strip().encode("ascii")
else:
    print("no b64 parts")
    raise SystemExit(0)

data = base64.b64decode(raw)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_bytes(data)
print("restored live.js", len(data), "has interval", b"setInterval(injectProfileButton" in data)
