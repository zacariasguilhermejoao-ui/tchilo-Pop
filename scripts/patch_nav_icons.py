#!/usr/bin/env python3
"""Enlarge the Feed (and other) bottom-nav icons so they are more visible."""
import re
from pathlib import Path

INDEX = Path("index.html")
if not INDEX.exists():
    print("index.html not found")
    raise SystemExit(0)

content = INDEX.read_text(encoding="utf-8", errors="replace")
changed = False

# Make all nav icons larger, and feed even larger
old = """.nav-item svg{ width:30px; height:30px; }
  .nav-item[data-screen="feed"] svg{ width:32px; height:32px; }"""

new = """.nav-item svg{ width:34px; height:34px; }
  .nav-item[data-screen="feed"] svg{ width:40px; height:40px; }"""

if old in content:
    content = content.replace(old, new)
    print("Nav icons enlarged (feed=40px)")
    changed = True
else:
    # broader replace
    content2, n1 = re.subn(
        r'\.nav-item\s+svg\s*\{\s*width:\s*30px;\s*height:\s*30px;\s*\}',
        '.nav-item svg{ width:34px; height:34px; }',
        content, count=1
    )
    content3, n2 = re.subn(
        r'\.nav-item\[data-screen="feed"\]\s+svg\s*\{\s*width:\s*32px;\s*height:\s*32px;\s*\}',
        '.nav-item[data-screen="feed"] svg{ width:40px; height:40px; }',
        content2, count=1
    )
    if n1 or n2:
        content = content3
        print(f"Nav icons enlarged (broad match: {n1},{n2})")
        changed = True
    else:
        print("WARN: nav svg size rules not found")

if changed:
    INDEX.write_text(content, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes")
