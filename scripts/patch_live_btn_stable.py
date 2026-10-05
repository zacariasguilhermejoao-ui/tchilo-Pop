#!/usr/bin/env python3
from pathlib import Path
import re

p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')
changed = False

# Static Live in renderProfile
old = ": ('<button class=\"profile-btn\" onclick=\"goTo(\\'create\\')\">Nova publicação</button>')"
new = (
    ": ('<button class=\"profile-btn\" type=\"button\" data-tchilo-live=\"1\" "
    "onclick=\"typeof tchiloOpenLiveSetup===\\'function\\'&&tchiloOpenLiveSetup()\" "
    "style=\"background:#e11d48;color:#fff;border-color:#e11d48\">Iniciar Live</button>' + "
    "'<button class=\"profile-btn\" type=\"button\" onclick=\"goTo(\\'create\\')\">Nova publicação</button>')"
)
if 'data-tchilo-live=\"1\"' not in html and old in html:
    html = html.replace(old, new, 1)
    changed = True
    print('live static in renderProfile')
elif 'data-tchilo-live' in html:
    print('live already in html')

# Load live-btn-stable.js
if 'live-btn-stable.js' not in html:
    html2, n = re.subn(
        r'(<script src="native/tchilo-live\.js[^"]*"></script>)',
        r'\1\n<script src="native/live-btn-stable.js?v=1"></script>',
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print('script added')
    else:
        html = html.replace('</body>', '<script src="native/live-btn-stable.js?v=1"></script>\n</body>', 1)
        changed = True
        print('script before body')

if changed:
    p.write_text(html, encoding='utf-8')
    print('WROTE')
else:
    print('no change')
