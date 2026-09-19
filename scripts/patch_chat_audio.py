#!/usr/bin/env python3
"""Injeta chat-audio-fix.js e chat-send-fix.js no index.html."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

SCRIPTS = [
    "native/chat-send-fix.js",
    "native/chat-audio-fix.js",
]

for src in SCRIPTS:
    tag = f'<script src="{src}"></script>'
    if src in html:
        continue
    if "</body>" in html:
        html = html.replace("</body>", tag + "\n</body>", 1)
        changed = True
        print(f"injected {src}")
    else:
        print(f"no </body> for {src}")

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("already present")
