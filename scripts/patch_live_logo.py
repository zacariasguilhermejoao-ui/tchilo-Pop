#!/usr/bin/env python3
"""Replace Tchilo topbar logo with the user-provided LIVE pill icon."""
import re
from pathlib import Path

INDEX = Path("index.html")
if not INDEX.exists():
    print("index.html not found")
    raise SystemExit(0)

content = INDEX.read_text(encoding="utf-8", errors="replace")

# The exact LIVE icon the user sent (clean SVG)
LIVE_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect x="56" y="176" width="400" height="160" rx="80" fill="#000000"/>
  <circle cx="148" cy="256" r="26" fill="#FFFFFF"/>
  <text x="290" y="284" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="84" letter-spacing="4" fill="#FFFFFF">LIVE</text>
</svg>
'''

# Prefer file reference if live-icon.svg exists, else inline data URI
live_src = "live-icon.svg"
if not Path("live-icon.svg").exists():
    import base64
    b64 = base64.b64encode(LIVE_SVG.encode()).decode()
    live_src = f"data:image/svg+xml;base64,{b64}"

new_img = (
    f'<img class="logo-img" src="{live_src}" alt="LIVE" '
    'style="cursor:pointer;height:28px;width:auto;" '
    'onclick="if(typeof tchiloOpenLiveSetup===\'function\'){tchiloOpenLiveSetup()}'
    'else if(typeof openLiveScreen===\'function\'){openLiveScreen()}'
    'else if(typeof openSetup===\'function\'){openSetup()}'
    'else{alert(\'Lives em breve\')}" role="button" title="Lives">'
)

# Match any current logo-img in the topbar area
pat = re.compile(
    r'<img\s+class="logo-img"\s+src="[^"]+"\s+alt="[^"]*"[^>]*>',
    re.IGNORECASE
)

new_content, n = pat.subn(new_img, content, count=1)
if n == 0:
    # broader
    pat2 = re.compile(r'<img\s+class="logo-img"[^>]*>', re.IGNORECASE)
    new_content, n = pat2.subn(new_img, content, count=1)

if n >= 1:
    INDEX.write_text(new_content, encoding="utf-8")
    print(f"OK: replaced logo-img ({n} occurrence)")
else:
    print("WARN: logo-img not found, no change")
