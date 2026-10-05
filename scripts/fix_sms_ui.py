#!/usr/bin/env python3
"""Fix SMS icon (complete SVG) + topbar SMS button + restore messages nav icon."""
import re
from pathlib import Path

INDEX = Path("index.html")
content = INDEX.read_text(encoding="utf-8", errors="replace")
changed = False

desired_icons = '''      <div class="topbar-icons">
        <div class="icon-btn" onclick="goTo('messages')" title="SMS" aria-label="SMS" data-top-messages="1">
          <img src="sms-icon.svg" alt="SMS" width="28" height="28" style="width:28px;height:28px;object-fit:contain;display:block;">
        </div>
        <div class="icon-btn" onclick="goTo('search')" aria-label="Pesquisar">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
        </div>
      </div>'''

pat = re.compile(
    r'<div class="topbar-icons">[\s\S]*?</div>\s*(?=</div>\s*<input type="file" id="storyMediaInput"|</div>\s*<div class="stories")',
    re.DOTALL
)
m = pat.search(content)
if m:
    content = content[:m.start()] + desired_icons + "\n    " + content[m.end():]
    print("topbar-icons replaced with clean SMS icon + search")
    changed = True
else:
    print("WARN: topbar-icons not matched")

chat_svg = '''<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>'''

pat2 = re.compile(
    r'(<button class="nav-item" data-screen="messages"[^>]*>\s*)'
    r'(?:<img[^>]*>|<svg[^>]*>.*?</svg>)'
    r'(\s*<div class="dot"></div>\s*</button>)',
    re.DOTALL
)
content2, n = pat2.subn(r'\1' + chat_svg + r'\2', content, count=1)
if n:
    content = content2
    print("messages nav restored to chat SVG")
    changed = True

content3, n3 = re.subn(r'<span class="nav-sms-text">SMS</span>', '', content)
if n3:
    content = content3
    print(f"removed {n3} SMS text spans")
    changed = True

if changed:
    INDEX.write_text(content, encoding="utf-8")
    print("index.html fixed")
else:
    print("no HTML changes")
