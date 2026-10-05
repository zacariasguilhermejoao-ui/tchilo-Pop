#!/usr/bin/env python3
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

css = (
    '<style id="tchilo-chat-bar-clean">'
    '#chatScreen .chat-input-bar .chat-gif-btn,'
    '#chatScreen .chat-input-bar .chat-sticker-btn,'
    '#chatScreen .chat-input-bar [data-chat-extra="gif"],'
    '#chatScreen .chat-input-bar [data-chat-extra="sticker"],'
    '#chatScreen .chat-input-bar [data-tchilo-gif],'
    '#chatScreen .chat-input-bar [data-tchilo-sticker]{'
    'display:none!important;width:0!important;height:0!important;opacity:0!important;'
    'pointer-events:none!important;position:absolute!important;left:-9999px!important;}'
    '#chatScreen .chat-input-bar > button:not(#chatAttachBtn):not(#chatMicBtn):not(.chat-send){'
    'display:none!important;}'
    '</style>\n'
)

html = re.sub(r'<style id="tchilo-chat-bar-clean">[\s\S]*?</style>\s*', '', html)
if '</head>' in html:
    html = html.replace('</head>', css + '</head>', 1)

html = re.sub(
    r'src="native/chat-compose-fix\.js[^"]*"',
    'src="native/chat-compose-fix.js?v=4"',
    html,
    count=1,
)

p.write_text(html, encoding='utf-8')
print('WROTE chat bar clean + v4')
print('css', 'tchilo-chat-bar-clean' in html)
print('v4', 'chat-compose-fix.js?v=4' in html)
