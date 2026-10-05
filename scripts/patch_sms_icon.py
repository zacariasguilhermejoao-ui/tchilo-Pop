#!/usr/bin/env python3
"""Replace / add SMS icon in topbar with the exact user-provided SMS SVG. Remove old SMS."""
import re
from pathlib import Path

INDEX = Path("index.html")
if not INDEX.exists():
    print("index.html not found")
    raise SystemExit(0)

content = INDEX.read_text(encoding="utf-8", errors="replace")
changed = False

sms_btn = '''<div class="icon-btn" onclick="goTo('messages')" title="SMS / Mensagens" aria-label="SMS">
          <img src="sms-icon.svg" alt="SMS" style="width:28px;height:28px;object-fit:contain;display:block;">
        </div>'''

topbar_icons_pat = re.compile(
    r'(<div class="topbar-icons">\s*)(.*?)(\s*</div>\s*</div>\s*<input type="file" id="storyMediaInput")',
    re.DOTALL
)
m = topbar_icons_pat.search(content)
if m:
    inner = m.group(2)
    inner = re.sub(r'<[^>]*>SMS</[^>]*>|<button[^>]*>SMS</button>|<div[^>]*>SMS</div>|\bSMS\b', '', inner)
    if 'sms-icon.svg' not in inner:
        if 'icon-btn' in inner and "goTo('search')" in inner:
            inner = sms_btn + '\n        ' + inner.strip()
        else:
            inner = sms_btn + '\n        ' + inner
        new_block = m.group(1) + inner + m.group(3)
        content = content[:m.start()] + new_block + content[m.end():]
        print("Added SMS icon to topbar")
        changed = True
    else:
        print("SMS icon already in topbar")
else:
    print("topbar-icons block not found")

old_msg_svg = re.compile(
    r'(<button class="nav-item" data-screen="messages"[^>]*>\s*)'
    r'<svg[^>]*>.*?</svg>'
    r'(\s*<div class="dot"></div>\s*</button>)',
    re.DOTALL
)
new_msg = r'''\1<img src="sms-icon.svg" alt="SMS" style="width:34px;height:34px;object-fit:contain;display:block;">\2'''
content2, n = old_msg_svg.subn(new_msg, content, count=1)
if n:
    content = content2
    print("Replaced bottom-nav messages icon with SMS icon")
    changed = True

if changed:
    INDEX.write_text(content, encoding="utf-8")
    print("index.html updated")
else:
    print("No structural changes (or already applied)")
