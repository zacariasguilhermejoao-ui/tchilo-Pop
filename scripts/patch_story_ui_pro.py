#!/usr/bin/env python3
"""Load story-ui-pro.js + harden story media CSS in index.html"""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

if "story-ui-pro.js" not in html:
    html2, n = re.subn(
        r'(<script src="native/copy-ux-refresh\.js[^"]*"></script>)',
        r'\1\n<script src="native/story-ui-pro.js?v=1"></script>',
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print("script after copy-ux")
    else:
        html2, n = re.subn(
            r'(<script src="native/story-music\.js[^"]*"></script>)',
            r'\1\n<script src="native/story-ui-pro.js?v=1"></script>',
            html,
            count=1,
        )
        if n:
            html = html2
            changed = True
            print("script after story-music")
        elif "</body>" in html:
            html = html.replace(
                "</body>",
                '<script src="native/story-ui-pro.js?v=1"></script>\n</body>',
                1,
            )
            changed = True
            print("script before body")

# Inline CSS reinforce full-bleed (no FOUC)
marker = "/* tchilo-story-ui-pro-inline */"
if marker not in html:
    css = (
        "<style id=\"tchilo-story-ui-pro-inline\">"
        + marker
        + "#storyViewer.story-viewer{position:fixed!important;inset:0!important;z-index:200;background:#000;}"
        + "#storyViewer .story-viewer-body{position:absolute!important;inset:0!important;padding:0!important;}"
        + "#storyViewer .story-viewer-body .story-media,"
        + "#storyViewer .story-viewer-body.has-media .story-media{"
        + "position:absolute!important;inset:0!important;width:100%!important;height:100%!important;"
        + "object-fit:cover!important;border-radius:0!important;}"
        + "</style>"
    )
    if "</head>" in html:
        html = html.replace("</head>", css + "\n</head>", 1)
        changed = True
        print("inline css")

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no changes")
