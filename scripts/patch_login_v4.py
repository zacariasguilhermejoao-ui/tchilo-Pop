#!/usr/bin/env python3
"""Wire login fix v4 into index.html (cache-bust)."""
from pathlib import Path
import re
p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
orig = html
html = re.sub(r'tchilo-login-click-fix\.js(\?v=\d+)?', 'tchilo-login-click-fix.js?v=4', html)
if 'tchilo-login-click-fix.js' not in html:
    needle = '<script src="native/media-editor.js"></script>'
    if needle in html:
        html = html.replace(needle, needle + '\n<script src="native/tchilo-login-click-fix.js?v=4"></script>', 1)
if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index: login fix v4 wired")
else:
    print("index: no change")
