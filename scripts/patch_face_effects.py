#!/usr/bin/env python3
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

if "native/face-effects.js" not in html and "</body>" in html:
    html = html.replace(
        "</body>",
        '<script src="native/face-effects.js"></script>\n</body>',
        1,
    )
    changed = True
    print("Injected face-effects.js")
else:
    print("face-effects already present or no body")

# Button fallback in markup (in case JS inject runs late)
needle = '<button type="button" class="gallery-btn" id="galleryBtn"'
if needle in html and "faceFxOpenBtn" not in html:
    btn = (
        '<button type="button" class="gallery-btn" id="faceFxOpenBtn" '
        'onclick="if(window.openFaceEffects)openFaceEffects()">'
        "Câmara com efeitos</button>\n      "
    )
    html = html.replace(needle, btn + needle, 1)
    changed = True
    print("Inserted faceFx button in create screen")

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes")
