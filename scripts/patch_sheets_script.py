#!/usr/bin/env python3
"""Ensure index.html loads sheets-full-fix.js"""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
if "sheets-full-fix.js" in html:
    print("already present")
else:
    m = re.search(r'<script src="native/profile-menu-fix\.js[^"]*"></script>', html)
    if not m:
        m = re.search(r'<script src="native/chat-call-webrtc\.js[^"]*"></script>', html)
    if m:
        insert = m.group(0) + '\n<script src="native/sheets-full-fix.js?v=1"></script>'
        html = html[: m.start()] + insert + html[m.end() :]
        p.write_text(html, encoding="utf-8")
        print("WROTE script tag")
    else:
        print("MISS anchor")
