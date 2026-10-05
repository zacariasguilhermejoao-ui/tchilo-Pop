#!/usr/bin/env python3
"""Hide GIF/sticker from chat input bar; only +, mic, send."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

css = (
    '<style id="tchilo-chat-bar-clean">'
    '/* tchilo-chat-bar-clean */'
    '#chatScreen .chat-input-bar .chat-gif-btn,'
    '#chatScreen .chat-input-bar .chat-sticker-btn,'
    '#chatScreen .chat-input-bar [data-chat-extra="gif"],'
    '#chatScreen .chat-input-bar [data-chat-extra="sticker"],'
    '#chatScreen .chat-input-bar [data-tchilo-gif],'
    '#chatScreen .chat-input-bar [data-tchilo-sticker]{'
    'display:none!important;width:0!important;height:0!important;'
    'opacity:0!important;pointer-events:none!important;overflow:hidden!important;'
    'position:absolute!important;left:-9999px!important;'
    '}'
    /* only allow known controls */
    '#chatScreen .chat-input-bar > button:not(#chatAttachBtn):not(#chatMicBtn):not(.chat-send){'
    'display:none!important;'
    '}'
    '</style>\n'
)

if 'tchilo-chat-bar-clean' not in html:
    if '</head>' in html:
        html = html.replace('</head>', css + '</head>', 1)
        changed = True
        print('css')
else:
    html2, n = re.subn(
        r'<style id="tchilo-chat-bar-clean">[\s\S]*?</style>\s*',
        css,
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print('css updated')

# bump compose script
if 'chat-compose-fix.js?v=3' in html:
    html = html.replace('chat-compose-fix.js?v=3', 'chat-compose-fix.js?v=4')
    changed = True
elif 'chat-compose-fix.js' in html:
    html = re.sub(
        r'src="native/chat-compose-fix\.js[^"]*"',
        'src="native/chat-compose-fix.js?v=4"',
        html,
        count=1,
    )
    changed = True

if changed:
    p.write_text(html, encoding='utf-8')
    print('WROTE')
else:
    print('no change')
