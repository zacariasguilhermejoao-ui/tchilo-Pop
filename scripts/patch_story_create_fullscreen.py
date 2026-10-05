#!/usr/bin/env python3
"""Force story create sheet to full screen in index.html."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

# Replace hide/open CSS with full-screen open styles
old_style_re = re.compile(
    r'<style id="tchilo-story-create-hide">[\s\S]*?</style>'
)
new_style = (
    '<style id="tchilo-story-create-hide">'
    '/* tchilo-story-create-full */'
    '#storyCreateSheet{'
    'display:none!important;visibility:hidden!important;pointer-events:none!important;'
    'z-index:-1!important;'
    '}'
    '#storyCreateSheet.is-open,#storyCreateSheet.open{'
    'display:flex!important;visibility:visible!important;pointer-events:auto!important;'
    'position:fixed!important;inset:0!important;z-index:200!important;'
    'align-items:stretch!important;justify-content:stretch!important;'
    'background:var(--paper,#F6F1E7)!important;'
    'padding:0!important;margin:0!important;'
    '}'
    '#storyCreateSheet.is-open > div,#storyCreateSheet.open > div{'
    'width:100%!important;max-width:none!important;min-height:100%!important;height:100%!important;'
    'border-radius:0!important;border:0!important;box-shadow:none!important;'
    'padding:16px 18px calc(24px + env(safe-area-inset-bottom))!important;'
    'background:var(--paper,#F6F1E7)!important;'
    'overflow:auto!important;'
    '}'
    '</style>'
)
if old_style_re.search(html):
    html = old_style_re.sub(new_style, html, count=1)
    changed = True
    print("css block")
elif "tchilo-story-create-hide" not in html:
    html = html.replace("</head>", new_style + "\n</head>", 1)
    changed = True
    print("css insert")

# Fix outer sheet inline style: remove flex-end bottom-sheet look
old_outer = (
    '<div class="sheet" id="storyCreateSheet" style="display:none;position:fixed;inset:0;'
    'z-index:140;background:rgba(0,0,0,.42);align-items:flex-end;justify-content:center;">'
)
new_outer = (
    '<div class="sheet" id="storyCreateSheet" style="display:none;position:fixed;inset:0;'
    'z-index:200;background:var(--paper);align-items:stretch;justify-content:stretch;">'
)
if old_outer in html:
    html = html.replace(old_outer, new_outer)
    changed = True
    print("outer html")
else:
    # looser replace
    html2, n = re.subn(
        r'<div class="sheet" id="storyCreateSheet" style="[^"]*">',
        new_outer,
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print("outer html re")

# Fix inner panel to full height (remove bottom sheet card look)
html2, n = re.subn(
    r'(<div class="sheet" id="storyCreateSheet"[^>]*>)\s*'
    r'<div style="width:min\(100%,520px\);background:var\(--paper\);border:3px solid var\(--ink\);'
    r'border-bottom:0;border-radius:20px 20px 0 0;padding:20px 18px 28px;box-shadow:0 -10px 30px rgba\(0,0,0,\.18\)">',
    r'\1\n    <div style="width:100%;height:100%;background:var(--paper);padding:20px 18px 28px;box-sizing:border-box;overflow:auto">',
    html,
    count=1,
)
if n:
    html = html2
    changed = True
    print("inner panel")

# open function: force full-screen styles
old_open = (
    "function openStoryCreateSheet(){ var el=document.getElementById('storyCreateSheet'); "
    "if(el){el.classList.add('is-open','open');el.style.setProperty('display','flex','important');"
    "el.style.visibility='visible';el.style.pointerEvents='auto';} }"
)
new_open = (
    "function openStoryCreateSheet(){ var el=document.getElementById('storyCreateSheet'); "
    "if(!el)return; el.classList.add('is-open','open'); "
    "el.style.setProperty('display','flex','important'); "
    "el.style.setProperty('align-items','stretch','important'); "
    "el.style.setProperty('justify-content','stretch','important'); "
    "el.style.setProperty('background','var(--paper)','important'); "
    "el.style.setProperty('inset','0','important'); "
    "el.style.setProperty('z-index','200','important'); "
    "el.style.visibility='visible'; el.style.pointerEvents='auto'; "
    "var panel=el.firstElementChild; if(panel){ "
    "panel.style.setProperty('width','100%','important'); "
    "panel.style.setProperty('height','100%','important'); "
    "panel.style.setProperty('max-width','none','important'); "
    "panel.style.setProperty('border-radius','0','important'); "
    "panel.style.setProperty('border','0','important'); "
    "panel.style.setProperty('box-shadow','none','important'); } }"
)
if old_open in html:
    html = html.replace(old_open, new_open)
    changed = True
    print("open fn")
elif "function openStoryCreateSheet()" in html:
    html2, n = re.subn(
        r"function openStoryCreateSheet\(\)\{[^}]+\}",
        new_open.replace("function openStoryCreateSheet()", "function openStoryCreateSheet()").rstrip(),
        html,
        count=1,
    )
    # careful - nested braces in new_open
    # just replace from function to closing of simple version
    pass

# Try simpler open replace if still old
if "align-items','stretch'" not in html and "function openStoryCreateSheet()" in html:
    html2, n = re.subn(
        r"function openStoryCreateSheet\(\)\{[^\n]+\}",
        new_open,
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print("open fn re")

# bump sheets
if "sheets-full-fix.js?v=2" in html:
    html = html.replace("sheets-full-fix.js?v=2", "sheets-full-fix.js?v=3")
    changed = True
elif "sheets-full-fix.js" in html:
    html = re.sub(
        r'src="native/sheets-full-fix\.js[^"]*"',
        'src="native/sheets-full-fix.js?v=3"',
        html,
        count=1,
    )
    changed = True

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no change")
