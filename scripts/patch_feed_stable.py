#!/usr/bin/env python3
from pathlib import Path

idx = Path("index.html")
if not idx.exists():
    raise SystemExit(0)

html = idx.read_text(encoding="utf-8", errors="replace")
changed = False

# inject feed-stable early (before other music injectors if possible)
for js in ("native/feed-stable.js",):
    tag = f'<script src="{js}"></script>'
    if js not in html and "</body>" in html:
        # put just before </body>
        html = html.replace("</body>", tag + "\n</body>", 1)
        changed = True
        print("injected", js)

if changed:
    idx.write_text(html, encoding="utf-8")
    print("done")
else:
    print("ok")
