#!/usr/bin/env python3
"""Restore native/tchilo-live.js from scripts/tchilo-live.b64 (no inject loop)."""
from pathlib import Path
import base64

b64_path = Path("scripts/tchilo-live.b64")
out = Path("native/tchilo-live.js")
if not b64_path.exists():
    print("no b64")
else:
    data = base64.b64decode(b64_path.read_text().strip().encode("ascii"))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(data)
    print("restored live.js", len(data))
