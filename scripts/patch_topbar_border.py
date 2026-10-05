#!/usr/bin/env python3
"""Topbar: remove border. Navbar: thin 1px top border. Leave stories alone."""
from pathlib import Path

INDEX = Path("index.html")
html = INDEX.read_text(encoding="utf-8")
changed = False

# topbar border -> none
for old in (
    "border-bottom:1px solid var(--line);",
    "border-bottom:3px solid var(--line);",
):
    idx = html.find(".topbar{\n    display:flex; align-items:center; justify-content:space-between;")
    if idx < 0:
        idx = html.find(".topbar{")
    if idx >= 0:
        sub = html[idx:idx+450]
        if old in sub:
            new_sub = sub.replace(old, "border-bottom:none;", 1)
            html = html[:idx] + new_sub + html[idx+len(sub):]
            changed = True
            print("OK: topbar border removed")
            break

# navbar border-top 3px -> 1px
idx = html.find(".navbar{\n    position:absolute;")
if idx < 0:
    idx = html.find(".navbar{")
if idx >= 0:
    sub = html[idx:idx+400]
    if "border-top:3px solid var(--line);" in sub:
        new_sub = sub.replace("border-top:3px solid var(--line);", "border-top:1px solid var(--line);", 1)
        html = html[:idx] + new_sub + html[idx+len(sub):]
        changed = True
        print("OK: navbar border-top -> 1px")
    elif "border-top:1px solid var(--line);" in sub:
        print("navbar already 1px")
    else:
        print("WARN: navbar border not found in expected form")

if changed:
    INDEX.write_text(html, encoding="utf-8")
    print("Wrote index.html")
else:
    print("No changes (already applied?)")
