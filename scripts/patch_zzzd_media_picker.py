#!/usr/bin/env python3
"""Wire media picker v3 into index."""
from pathlib import Path
import re

p = Path("index.html")
if not p.exists():
    raise SystemExit(0)
html = p.read_text(encoding="utf-8", errors="replace")
orig = html
SCRIPT = '<script src="native/tchilo-media-picker.js?v=3" defer></script>'
if "tchilo-media-picker.js" not in html:
    if "tchilo-settings-icons.js" in html:
        html = re.sub(
            r'(<script src="native/tchilo-settings-icons\.js[^>]+></script>)',
            r'\1\n' + SCRIPT,
            html,
            count=1,
        )
    else:
        html = html.replace("</body>", SCRIPT + "\n</body>", 1)
else:
    html = re.sub(
        r'native/tchilo-media-picker\.js\?v=\d+',
        'native/tchilo-media-picker.js?v=3',
        html,
    )

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index written")
else:
    print("unchanged")
