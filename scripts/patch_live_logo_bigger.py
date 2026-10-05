#!/usr/bin/env python3
"""Make the LIVE logo in the topbar even larger (really big and visible)."""
import re
from pathlib import Path

INDEX = Path("index.html")
if not INDEX.exists():
    print("index.html not found")
    raise SystemExit(0)

content = INDEX.read_text(encoding="utf-8", errors="replace")
changed = False

# Target size: 68px so it dominates the topbar
TARGET = "68px"
MAXH = "72px"

# 1. CSS .logo-img
css_pat = re.compile(r'\.logo-img\s*\{[^}]*\}', re.DOTALL)
new_css = f""".logo-img{{
    display:block;
    height:{TARGET};
    width:auto;
    object-fit:contain;
    max-height:{MAXH};
  }}"""
if css_pat.search(content):
    content, n = css_pat.subn(new_css, content, count=1)
    if n:
        print(f"CSS .logo-img → {TARGET}")
        changed = True

# 2. Inline style on the LIVE img
content2, n2 = re.subn(
    r'(<img class="logo-img" src="live-icon\.svg"[^>]*style=")[^"]*(")',
    rf'\1cursor:pointer;height:{TARGET};width:auto;object-fit:contain;\2',
    content,
    count=1
)
if n2:
    content = content2
    print(f"Inline style → {TARGET}")
    changed = True
else:
    # fallback any previous height
    for old in ("52px", "38px", "30px", "28px"):
        content3, n3 = re.subn(
            rf'(class="logo-img"[^>]*height:){old}',
            rf'\g<1>{TARGET}',
            content,
            count=1
        )
        if n3:
            content = content3
            print(f"height {old}→{TARGET}")
            changed = True
            break

if changed:
    INDEX.write_text(content, encoding="utf-8")
    print(f"index.html updated – LIVE icon now {TARGET}")
else:
    print("No changes applied")
