#!/usr/bin/env python3
"""Remove ensureLm() do boot do camera-tiktok (evita stuck a processar)."""
from pathlib import Path
import re

p = Path("native/camera-tiktok.js")
if not p.exists():
    print("missing camera-tiktok.js")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
changed = False

if "loadImgs();ensureLm();ensureBtn();" in html:
    html = html.replace("loadImgs();ensureLm();ensureBtn();", "loadImgs();/* ensureLm lazy */ensureBtn();", 1)
    changed = True
    print("boot ensureLm removed")
else:
    print("boot already patched or not found")

# startCamera: ensureLm só se houver efeito
pat = re.compile(r"(loadImgs\(\);buildChips\(\);)ensureLm\(\);")
if pat.search(html):
    html, n = pat.subn(r"\1if(fxIndex>0)ensureLm();", html, count=1)
    if n:
        changed = True
        print("startCamera lazy")
else:
    print("startCamera skip")

if changed:
    p.write_text(html, encoding="utf-8")
    print("camera-tiktok.js updated")
else:
    print("No changes")
