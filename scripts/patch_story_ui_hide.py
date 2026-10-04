#!/usr/bin/env python3
"""Fix inline story CSS so closed viewer never covers the app."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

old_inline = (
    '<style id="tchilo-story-ui-pro-inline">/* tchilo-story-ui-pro-inline */'
    '#storyViewer.story-viewer{position:fixed!important;inset:0!important;z-index:200;background:#000;}'
    '#storyViewer .story-viewer-body{position:absolute!important;inset:0!important;padding:0!important;}'
    '#storyViewer .story-viewer-body .story-media,'
    '#storyViewer .story-viewer-body.has-media .story-media{'
    'position:absolute!important;inset:0!important;width:100%!important;height:100%!important;'
    'object-fit:cover!important;border-radius:0!important;}</style>'
)

new_inline = (
    '<style id="tchilo-story-ui-pro-inline">/* tchilo-story-ui-pro-inline-v2 */'
    '#storyViewer.story-viewer{position:fixed!important;inset:0!important;background:#000;'
    'display:none!important;visibility:hidden!important;pointer-events:none!important;'
    'z-index:-1!important;opacity:0!important;}'
    '#storyViewer.story-viewer.open{display:flex!important;visibility:visible!important;'
    'pointer-events:auto!important;z-index:200!important;opacity:1!important;}'
    '#storyViewer.open .story-viewer-body{position:absolute!important;inset:0!important;padding:0!important;}'
    '#storyViewer.open .story-viewer-body .story-media,'
    '#storyViewer.open .story-viewer-body.has-media .story-media{'
    'position:absolute!important;inset:0!important;width:100%!important;height:100%!important;'
    'object-fit:cover!important;border-radius:0!important;}</style>'
)

if 'tchilo-story-ui-pro-inline' in html:
    html2, n = re.subn(
        r'<style id="tchilo-story-ui-pro-inline">[\s\S]*?</style>',
        new_inline,
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print("replaced inline")
elif old_inline in html:
    html = html.replace(old_inline, new_inline)
    changed = True
    print("exact replace")

# bump story-ui-pro cache bust
if 'story-ui-pro.js?v=1' in html:
    html = html.replace('story-ui-pro.js?v=1', 'story-ui-pro.js?v=2')
    changed = True
    print("bump v2")
elif 'story-ui-pro.js' in html and 'story-ui-pro.js?v=2' not in html:
    html = re.sub(
        r'src="native/story-ui-pro\.js[^"]*"',
        'src="native/story-ui-pro.js?v=2"',
        html,
        count=1,
    )
    changed = True
    print("bump v2 re")

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no change")
