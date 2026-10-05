#!/usr/bin/env python3
"""Remove neo-brutalist hard offset box-shadows from native JS/CSS (buttons & controls)."""
from pathlib import Path
import re

ROOT = Path(".")
targets = list((ROOT / "native").rglob("*.js")) + list((ROOT / "native").rglob("*.css"))
if (ROOT / "legal.css").exists():
    targets.append(ROOT / "legal.css")

subs = [
    (r"box-shadow:\s*4px 4px 0 var\(--ink,#0B0B0C\)", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 var\(--ink,#0B0B0C\)", "box-shadow:none"),
    (r"box-shadow:\s*2px 2px 0 var\(--ink,#0B0B0C\)", "box-shadow:none"),
    (r"box-shadow:\s*1px 1px 0 var\(--ink,#0B0B0C\)", "box-shadow:none"),
    (r"box-shadow:\s*6px 6px 0 var\(--ink,#0B0B0C\)", "box-shadow:none"),
    (r"box-shadow:\s*5px 5px 0 var\(--ink,#0B0B0C\)", "box-shadow:none"),
    (r"box-shadow:\s*4px 4px 0 #0B0B0C", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 #0B0B0C", "box-shadow:none"),
    (r"box-shadow:\s*2px 2px 0 #0B0B0C", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 rgba\(0,0,0,\.08\)", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 rgba\(11,11,12,\.08\)", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*2px 2px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*4px 4px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*5px 5px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*1px 1px 0 var\(--ink\)", "box-shadow:none"),
    (r"box-shadow:\s*3px 3px 0 var\(--ink,#0B0B0C\)!important", "box-shadow:none!important"),
    (r"box-shadow:\s*2px 2px 0 var\(--ink,#0B0B0C\)!important", "box-shadow:none!important"),
    (r"box-shadow:\s*1px 1px 0 var\(--ink,#0B0B0C\)!important", "box-shadow:none!important"),
    (r"box-shadow:\s*3px 3px 0 var\(--ink\)!important", "box-shadow:none!important"),
    (r"box-shadow:\s*2px 2px 0 var\(--ink\)!important", "box-shadow:none!important"),
    (r"box-shadow:\s*5px 5px 0 var\(--ink\)!important", "box-shadow:none!important"),
    (r"box-shadow:\s*4px 4px 0 var\(--ink\)!important", "box-shadow:none!important"),
    (r"box-shadow:\s*3px 3px 0 var\(--ink\);", "box-shadow: none;"),
    (r"box-shadow:\s*1px 1px 0 var\(--ink\);", "box-shadow: none;"),
    (r"transform:translate\(2px,2px\);box-shadow:2px 2px 0 var\(--ink,#0B0B0C\)", "opacity:.92"),
    (r"transform:translate\(2px,2px\);box-shadow:none", "opacity:.92"),
    (r"transform:translate\(1px,1px\);box-shadow:1px 1px 0 var\(--ink,#0B0B0C\)!important", "opacity:.92"),
    (r"transform:translate\(1px,1px\);box-shadow:none!important", "opacity:.92"),
    (r"box-shadow:0 0 14px rgba\(139,30,63,\.4\), 2px 2px 0 #000!important;", "box-shadow:none!important;"),
    (r"box-shadow:0 0 12px rgba\(139,30,63,\.35\), 2px 2px 0 #000!important;", "box-shadow:none!important;"),
    (r"box-shadow:0 0 16px rgba\(255,107,0,\.55\), 3px 3px 0 #000!important;", "box-shadow:none!important;"),
    (r"box-shadow:0 0 14px rgba\(255,107,0,\.45\), 3px 3px 0 #000!important;", "box-shadow:none!important;"),
    (r"box-shadow:inset 2px 2px 0 rgba\(44,24,16,\.1\)!important;", "box-shadow:none!important;"),
    (r"box-shadow:3px 3px 0 rgba\(44,24,16,\.2\)!important;", "box-shadow:none!important;"),
]

def gen(m):
    s = m.group(0)
    if re.search(r"0 0 0 \d+px", s):
        return s
    if re.search(r"\d+px\s+\d+px\s+\d{1,2}px\s+(?:rgba|#)", s):
        return s
    if re.search(r"-?\d+px\s+-?\d+px\s+0(?:px)?\b", s):
        return "box-shadow:none!important" if "!important" in s else "box-shadow:none"
    return s

changed = 0
for f in targets:
    if not f.is_file():
        continue
    text = f.read_text(encoding="utf-8", errors="replace")
    orig = text
    for old, new in subs:
        text = re.sub(old, new, text)
    text = re.sub(r"box-shadow:\s*[^;'\"}]+", gen, text)
    if text != orig:
        f.write_text(text, encoding="utf-8")
        changed += 1
        print("updated", f)

print(f"native/legal files updated: {changed}")
