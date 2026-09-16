#!/usr/bin/env python3
from pathlib import Path

idx = Path("index.html")
if not idx.exists():
    raise SystemExit(0)
html = idx.read_text(encoding="utf-8", errors="replace")
if "native/feed-noflicker.js" not in html and "</body>" in html:
    html = html.replace("</body>", '<script src="native/feed-noflicker.js"></script>\n</body>', 1)
    idx.write_text(html, encoding="utf-8")
    print("injected feed-noflicker.js")
else:
    print("ok")
