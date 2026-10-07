#!/usr/bin/env python3
"""Ensure login fix v5 is loaded early in index.html."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
orig = html

# bump any existing reference
html = re.sub(
    r'tchilo-login-click-fix\.js(\?v=\d+)?',
    'tchilo-login-click-fix.js?v=5',
    html,
)

if 'tchilo-login-click-fix.js' not in html:
    # inject right after <head> or before first script
    tag = '<script src="native/tchilo-login-click-fix.js?v=5"></script>\n'
    if '<script src="native/media-editor.js"' in html:
        html = html.replace(
            '<script src="native/media-editor.js"',
            tag + '<script src="native/media-editor.js"',
            1,
        )
    elif '</head>' in html:
        html = html.replace('</head>', tag + '</head>', 1)

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index: login fix v5 wired")
else:
    print("index: already has v5 or no change")
