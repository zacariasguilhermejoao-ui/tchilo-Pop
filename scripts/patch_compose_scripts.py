#!/usr/bin/env python3
"""Ensure index.html loads chat-compose-fix + chat-call-webrtc with cache-bust."""
from pathlib import Path

p = Path('index.html')
if not p.exists():
    print('no index.html')
    raise SystemExit(0)

html = p.read_text(encoding='utf-8', errors='replace')
changed = False

# Ensure chat-audio has cache-bust
old_audio = '<script src="native/chat-audio-fix.js"></script>'
new_audio = '<script src="native/chat-audio-fix.js?v=compose3"></script>'
if old_audio in html:
    html = html.replace(old_audio, new_audio, 1)
    changed = True
    print('updated chat-audio-fix cache-bust')

# Insert compose + webrtc right after chat-audio if missing
marker = 'native/chat-audio-fix.js'
if 'chat-compose-fix.js' not in html and marker in html:
    # find the script tag containing chat-audio-fix and append after it
    import re
    m = re.search(r'<script src="native/chat-audio-fix\.js[^"]*"></script>', html)
    if m:
        insert = (
            m.group(0)
            + '\n<script src="native/chat-compose-fix.js?v=3"></script>'
            + '\n<script src="native/chat-call-webrtc.js?v=3"></script>'
        )
        html = html[:m.start()] + insert + html[m.end():]
        changed = True
        print('inserted compose + webrtc scripts')
elif 'chat-compose-fix.js' in html:
    print('compose already present')

if changed:
    p.write_text(html, encoding='utf-8')
    print('wrote index.html')
else:
    print('no changes')
