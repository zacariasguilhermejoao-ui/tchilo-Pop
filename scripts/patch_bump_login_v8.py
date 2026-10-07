#!/usr/bin/env python3
from pathlib import Path
import re
p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')
orig = html
html = re.sub(r'media-editor\.js(\?v=\d+)?', 'media-editor.js?v=11', html)
html = re.sub(r'tchilo-login-session-fix\.js(\?v=\d+)?', 'tchilo-login-session-fix.js?v=8', html)
if 'tchilo-login-session-fix.js' not in html:
    tag = '<script src="native/tchilo-login-session-fix.js?v=8"></script>\n'
    html = html.replace(
        '<script src="native/media-editor.js?v=11"></script>',
        tag + '<script src="native/media-editor.js?v=11"></script>',
        1,
    )
if html != orig:
    p.write_text(html, encoding='utf-8')
    print('bumped login v8')
else:
    print('no change')
