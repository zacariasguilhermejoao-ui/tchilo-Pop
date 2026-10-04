#!/usr/bin/env python3
"""Remove duplicate old story-ui-pro inline CSS that forces z-index:200 without hide."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

# Remove ALL tchilo-story-ui-pro-inline blocks, then insert one correct block once
html2, n = re.subn(
    r'<style id="tchilo-story-ui-pro-inline">[\s\S]*?</style>\s*',
    '',
    html,
)
print("removed", n)

good = (
    '<style id="tchilo-story-ui-pro-inline">/* tchilo-story-ui-pro-inline-v3 */'
    '#storyViewer.story-viewer{position:fixed!important;inset:0!important;background:#000;'
    'display:none!important;visibility:hidden!important;pointer-events:none!important;'
    'z-index:-1!important;opacity:0!important;}'
    '#storyViewer.story-viewer.open{display:flex!important;visibility:visible!important;'
    'pointer-events:auto!important;z-index:200!important;opacity:1!important;}'
    '#storyViewer.open .story-viewer-body{position:absolute!important;inset:0!important;padding:0!important;}'
    '#storyViewer.open .story-viewer-body .story-media,'
    '#storyViewer.open .story-viewer-body.has-media .story-media{'
    'position:absolute!important;inset:0!important;width:100%!important;height:100%!important;'
    'object-fit:cover!important;border-radius:0!important;}'
    '</style>\n'
)

if '</head>' in html2:
    html2 = html2.replace('</head>', good + '</head>', 1)
    p.write_text(html2, encoding='utf-8')
    print('WROTE clean inline')
else:
    print('no head')
