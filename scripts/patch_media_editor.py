#!/usr/bin/env python3
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

if "native/media-editor.js" not in html and "</body>" in html:
    html = html.replace(
        "</body>",
        '<script src="native/media-editor.js"></script>\n</body>',
        1,
    )
    changed = True
    print("Injected media-editor.js")
else:
    print("media-editor already present or no body")

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes")
