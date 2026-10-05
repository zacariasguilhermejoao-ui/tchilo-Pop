#!/usr/bin/env python3
"""Remove neo-brutalist hard offset shadows from buttons and interactive controls."""
from pathlib import Path
import re

p = Path("index.html")
if not p.exists():
    print("index.html missing")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
orig = html
n = 0

# Hard offset shadows (neo-brutalist): Npx Npx 0 color
patterns = [
    (r"box-shadow:\s*2px 2px 0 rgba\(11,11,12,\.10\)", "box-shadow:none"),
    (r"box-shadow:\s*2px 2px 0 rgba\(0,0,0,\.35\)", "box-shadow:none"),
    (r"box-shadow:\s*2px 2px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*4px 4px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 rgba\(11,11,12,\.08\)", "box-shadow:none"),
    (r"box-shadow:\s*0 4px 0 rgba\(155,107,255,\.18\)", "box-shadow:none"),
    (r"box-shadow:\s*0 3px 0 rgba\(155,107,255,\.18\)", "box-shadow:none"),
    (
        r"box-shadow:\s*2px 2px 0 rgba\(11,11,12,\.10\),\s*0 0 0 2px var\(--violet\)",
        "box-shadow:0 0 0 2px var(--violet)",
    ),
]

for old, new in patterns:
    html2, c = re.subn(old, new, html)
    if c:
        html = html2
        n += c
        print(f"replaced {c}x: {old[:50]}...")

def kill_hard_offset(m):
    s = m.group(0)
    if re.search(r"0 0 0 \d+px", s):
        return s
    if re.search(r"rgba?\([^)]+\)\s*$", s) and re.search(r"\d+px\s+\d+px\s+\d+px", s):
        return s
    if re.search(r"box-shadow:\s*\d+px\s+\d+px\s+0\b", s):
        return "box-shadow:none"
    return s

html2, c = re.subn(r"box-shadow:\s*[^;{}]+", kill_hard_offset, html)
if c and html2 != html:
    html = html2
    print("generic hard-offset pass applied")

if html != orig:
    p.write_text(html, encoding="utf-8")
    print(f"index.html updated ({n} targeted + generic)")
else:
    print("No index.html changes needed")
