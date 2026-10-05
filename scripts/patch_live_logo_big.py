#!/usr/bin/env python3
"""Make the LIVE logo in the topbar significantly larger and more visible."""
import re
from pathlib import Path

INDEX = Path("index.html")
if not INDEX.exists():
    print("index.html not found")
    raise SystemExit(0)

content = INDEX.read_text(encoding="utf-8", errors="replace")
changed = False

# 1. CSS .logo-img → much larger
css_pat = re.compile(r'\.logo-img\s*\{[^}]*\}', re.DOTALL)
new_css = """.logo-img{
    display:block;
    height:52px;
    width:auto;
    object-fit:contain;
    max-height:56px;
  }"""
if css_pat.search(content):
    content, n = css_pat.subn(new_css, content, count=1)
    if n:
        print("CSS .logo-img → 52px")
        changed = True

# 2. Inline style on the LIVE img tag
content2, n2 = re.subn(
    r'(<img class="logo-img" src="live-icon\.svg"[^>]*style=")[^"]*(")',
    r'\1cursor:pointer;height:52px;width:auto;object-fit:contain;\2',
    content,
    count=1
)
if n2:
    content = content2
    print("Inline style → 52px")
    changed = True
else:
    # fallback: any height:38px or height:30px near logo-img
    content3, n3 = re.subn(
        r'(class="logo-img"[^>]*height:)38px',
        r'\g<1>52px',
        content,
        count=1
    )
    if n3:
        content = content3
        print("height 38→52 via fallback")
        changed = True

if changed:
    INDEX.write_text(content, encoding="utf-8")
    print("index.html updated – LIVE icon now 52px")
else:
    print("No changes applied")
