#!/usr/bin/env python3
"""Load story-ui-pro.js only. CSS hide rules live in patch_story_remove_dup_css.py"""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

if "story-ui-pro.js" not in html:
    html2, n = re.subn(
        r'(<script src="native/copy-ux-refresh\.js[^"]*"></script>)',
        r'\1\n<script src="native/story-ui-pro.js?v=2"></script>',
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
            r'\1\n<script src="native/story-ui-pro.js?v=2"></script>',
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
                '<script src="native/story-ui-pro.js?v=2"></script>\n</body>',
                1,
            )
            changed = True
            print("script before body")
else:
    # ensure cache bust v2+
    if "story-ui-pro.js?v=1" in html:
        html = html.replace("story-ui-pro.js?v=1", "story-ui-pro.js?v=2")
        changed = True
        print("bump to v2")

# DO NOT inject inline CSS here (causes duplicates / covering the feed)

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no changes")
