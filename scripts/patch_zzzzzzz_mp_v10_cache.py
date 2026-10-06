#!/usr/bin/env python3
from pathlib import Path
import re
p = Path("index.html")
t = p.read_text(encoding="utf-8", errors="replace")
nt = re.sub(r"tchilo-media-picker\\.js\\?v=\\d+", "tchilo-media-picker.js?v=10", t)
if nt != t:
    p.write_text(nt, encoding="utf-8")
    print("cache v10")
else:
    print("already v10 or not found")
