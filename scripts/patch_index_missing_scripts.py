#!/usr/bin/env python3
"""Ensure critical product scripts are loaded from index.html."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

SCRIPTS = [
    'native/tchilo-legal-urls.js?v=2',
    'native/tchilo-profile-share.js?v=3',
    'native/tchilo-live.js?v=2',
    'native/tchilo-verified.js?v=3',
    'native/tchilo-premium.js?v=2',
    'native/paddle-premium.js?v=1',
    'native/tchilo-ads-ui.js?v=1',
]

# Insert before copy-ux-refresh or at end before </body>
block = "\n".join(f'<script src="{s}"></script>' for s in SCRIPTS)

changed = False
for s in SCRIPTS:
    base = s.split("?")[0]
    if base not in html:
        changed = True

if not changed:
    print("all present")
else:
    # remove any partial old tags without version for these files to avoid dup logic issues
    # Insert after copy-ux-refresh if present, else before </body>
    if "copy-ux-refresh.js" in html:
        html2, n = re.subn(
            r'(<script src="native/copy-ux-refresh\.js[^"]*"></script>)',
            r"\1\n" + block,
            html,
            count=1,
        )
        if n:
            html = html2
            print("inserted after copy-ux")
        else:
            html = html.replace("</body>", block + "\n</body>", 1)
            print("inserted before body")
    else:
        html = html.replace("</body>", block + "\n</body>", 1)
        print("inserted before body")
    p.write_text(html, encoding="utf-8")
    print("WROTE")

# Report
html = p.read_text(encoding="utf-8", errors="replace")
for s in SCRIPTS:
    base = s.split("?")[0]
    print(base, "OK" if base in html else "FAIL")
