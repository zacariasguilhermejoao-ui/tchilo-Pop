#!/usr/bin/env python3
"""Force storyCreateSheet hidden in index + bump sheets-full-fix cache."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

# Hard-hide CSS in head
marker = "tchilo-story-create-hide"
if marker not in html:
    css = (
        f'<style id="{marker}">'
        f'/* {marker} */'
        '#storyCreateSheet{display:none!important;visibility:hidden!important;pointer-events:none!important;z-index:-1!important;}'
        '#storyCreateSheet.is-open,#storyCreateSheet.open{'
        'display:flex!important;visibility:visible!important;pointer-events:auto!important;'
        'z-index:140!important;position:fixed!important;inset:0!important;'
        '}'
        '</style>\n'
    )
    if "</head>" in html:
        html = html.replace("</head>", css + "</head>", 1)
        changed = True
        print("hide css")

# Fix open/close functions to use class
old_open = "function openStoryCreateSheet(){ const el=document.getElementById('storyCreateSheet'); if(el){el.style.display='flex';} }"
new_open = (
    "function openStoryCreateSheet(){ var el=document.getElementById('storyCreateSheet'); "
    "if(el){el.classList.add('is-open','open');el.style.setProperty('display','flex','important');"
    "el.style.visibility='visible';el.style.pointerEvents='auto';} }"
)
if old_open in html:
    html = html.replace(old_open, new_open)
    changed = True
    print("open fn")

old_close = "function closeStoryCreateSheet(){ const el=document.getElementById('storyCreateSheet'); if(el){el.style.display='none';} }"
new_close = (
    "function closeStoryCreateSheet(){ var el=document.getElementById('storyCreateSheet'); "
    "if(el){el.classList.remove('is-open','open');el.style.setProperty('display','none','important');"
    "el.style.visibility='hidden';el.style.pointerEvents='none';} }"
)
if old_close in html:
    html = html.replace(old_close, new_close)
    changed = True
    print("close fn")

# bump sheets script
if "sheets-full-fix.js?v=1" in html:
    html = html.replace("sheets-full-fix.js?v=1", "sheets-full-fix.js?v=2")
    changed = True
    print("bump sheets")
elif "sheets-full-fix.js" in html and "sheets-full-fix.js?v=2" not in html:
    html = re.sub(
        r'src="native/sheets-full-fix\.js[^"]*"',
        'src="native/sheets-full-fix.js?v=2"',
        html,
        count=1,
    )
    changed = True
    print("bump sheets re")

# ensure avatar cloud script
if "profile-avatar-cloud.js" not in html:
    html2, n = re.subn(
        r'(<script src="native/story-ui-pro\.js[^"]*"></script>)',
        r'\1\n<script src="native/profile-avatar-cloud.js?v=1"></script>',
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print("avatar script")
    else:
        html = html.replace(
            "</body>",
            '<script src="native/profile-avatar-cloud.js?v=1"></script>\n</body>',
            1,
        )
        changed = True
        print("avatar script body")

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no change")
