#!/usr/bin/env python3
"""Permanently replace Tchilo topbar logo with the user-provided LIVE pill icon.
Also enlarge it so it is clearly visible. No flash of the old logo.
"""
import re
from pathlib import Path

INDEX = Path("index.html")
if not INDEX.exists():
    print("index.html not found")
    raise SystemExit(0)

content = INDEX.read_text(encoding="utf-8", errors="replace")
changed = False

# 1. Enlarge .logo-img CSS
css_pat = re.compile(r'\.logo-img\s*\{[^}]*\}', re.DOTALL)
new_css = """.logo-img{
    display:block;
    height:38px;
    width:auto;
    object-fit:contain;
    max-height:40px;
  }"""
if css_pat.search(content):
    content, n = css_pat.subn(new_css, content, count=1)
    if n:
        print("CSS .logo-img enlarged")
        changed = True

# 2. Replace any logo-img that is still the old Tchilo PNG or previous
new_img = (
    '<img class="logo-img" src="live-icon.svg" alt="LIVE" '
    'style="cursor:pointer;height:38px;width:auto;object-fit:contain;" '
    'onclick="if(typeof tchiloOpenLiveSetup===\'function\'){tchiloOpenLiveSetup()}'
    'else if(typeof openLiveScreen===\'function\'){openLiveScreen()}'
    'else if(typeof openSetup===\'function\'){openSetup()}'
    'else{alert(\'Lives em breve\')}" role="button" title="Lives">'
)

# Match the long base64 or any current logo-img in topbar
pat = re.compile(
    r'<img\s+class="logo-img"\s+src="(?:data:image/[^"]+|live-icon\.svg)"[^>]*>',
    re.IGNORECASE
)
content2, n = pat.subn(new_img, content, count=1)
if n == 0:
    pat2 = re.compile(r'<img\s+class="logo-img"[^>]*>', re.IGNORECASE)
    content2, n = pat2.subn(new_img, content, count=1)

if n >= 1:
    content = content2
    print(f"OK: logo-img permanently replaced with LIVE ({n})")
    changed = True
else:
    print("WARN: logo-img not found")

if changed:
    INDEX.write_text(content, encoding="utf-8")
    print("index.html written")
else:
    print("No changes needed")
