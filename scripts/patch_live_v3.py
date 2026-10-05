#!/usr/bin/env python3
import re
from pathlib import Path
p = Path("index.html")
c = p.read_text(encoding="utf-8", errors="replace")
c2, n = re.subn(r'live-btn-stable\.js\?v=\d+', 'live-btn-stable.js?v=3', c, count=1)
if n:
    p.write_text(c2, encoding="utf-8")
    print("bumped live-btn-stable to v=3")
else:
    print("version not found")
