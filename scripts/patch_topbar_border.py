#!/usr/bin/env python3
"""Topbar border 3px -> 1px only. Does not touch .stories, .post, navbar, etc."""
from pathlib import Path
import re

INDEX = Path("index.html")
html = INDEX.read_text(encoding="utf-8")

# Only the main .topbar rule that has padding + border-bottom:3px
pattern = re.compile(
    r"(\.topbar\{"
    r"(?:(?!\.topbar\{)[^}])*?"
    r")border-bottom:3px solid var\(--line\);",
    re.DOTALL,
)

def repl(m):
    block = m.group(0)
    # safety: must look like the feed topbar (padding + max-height or flex space-between)
    if "padding:16px 18px 12px" in block or "justify-content:space-between" in block:
        return m.group(1) + "border-bottom:1px solid var(--line);"
    return block

new_html, n = pattern.subn(repl, html, count=1)
if n == 0:
    # fallback exact string
    idx = html.find(".topbar{\n    display:flex; align-items:center; justify-content:space-between;")
    if idx < 0:
        idx = html.find(".topbar{")
    if idx >= 0:
        sub = html[idx:idx+400]
        if "border-bottom:3px solid var(--line);" in sub:
            new_sub = sub.replace("border-bottom:3px solid var(--line);", "border-bottom:1px solid var(--line);", 1)
            new_html = html[:idx] + new_sub + html[idx+len(sub):]
            n = 1
        else:
            n = 0
    else:
        n = 0

if n:
    INDEX.write_text(new_html, encoding="utf-8")
    print(f"OK: topbar border -> 1px ({n})")
else:
    if "border-bottom:1px solid var(--line);" in html and html.count("border-bottom:3px solid var(--line);") >= 1:
        print("Already patched or topbar already 1px")
    else:
        print("WARN: pattern not found")
