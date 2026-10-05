#!/usr/bin/env python3
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

# Ensure stable loads before live.js
html = re.sub(
    r'\s*<script src="native/live-btn-stable\.js[^"]*"></script>\s*',
    '\n',
    html,
)
html2, n = re.subn(
    r'(<script src="native/tchilo-live\.js[^"]*"></script>)',
    r'<script src="native/live-btn-stable.js?v=2"></script>\n\1',
    html,
    count=1,
)
if n:
    p.write_text(html2, encoding="utf-8")
    print("order fixed")
else:
    print("no live script tag")
