#!/usr/bin/env python3
"""Remove ensureLm() do boot do camera-tiktok (evita stuck a processar)."""
from pathlib import Path

p = Path("native/camera-tiktok.js")
if not p.exists():
    print("missing camera-tiktok.js")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
changed = False

old = "function boot(){hideGal();loadImgs();ensureLm();ensureBtn();"
new = "function boot(){hideGal();loadImgs();/* ensureLm lazy */ensureBtn();"
if old in html:
    html = html.replace(old, new, 1)
    changed = True
    print("boot ensureLm removed")
else:
    print("boot already patched or not found")

old2 = "setHint('Toque foto · Mantém vídeo · Escolhe efeito');loadImgs();buildChips();ensureLm();}"
new2 = "setHint('Toque foto · Mantém vídeo · Escolhe efeito');loadImgs();buildChips();if(fxIndex>0)ensureLm();}"
# try ascii variants
for a, b in [
    ("setHint('Toque foto · Mantém vídeo · Escolhe efeito');loadImgs();buildChips();ensureLm();}",
     "setHint('Toque foto · Mantém vídeo · Escolhe efeito');loadImgs();buildChips();if(fxIndex>0)ensureLm();}"),
    ("loadImgs();buildChips();ensureLm();}\nfunction stopStream",
     "loadImgs();buildChips();if(fxIndex>0)ensureLm();}\nfunction stopStream"),
]:
    if a in html:
        html = html.replace(a, b, 1)
        changed = True
        print("startCamera lazy")
        break
else:
    print("startCamera skip")

if changed:
    p.write_text(html, encoding="utf-8")
    print("camera-tiktok.js updated")
else:
    print("No changes")
