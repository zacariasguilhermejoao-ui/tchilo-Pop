#!/usr/bin/env python3
"""Wire login session fix v6 into index.html."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
orig = html

html = re.sub(
    r'tchilo-login-session-fix\.js(\?v=\d+)?',
    'tchilo-login-session-fix.js?v=6',
    html,
)
html = re.sub(
    r'tchilo-login-click-fix\.js(\?v=\d+)?',
    'tchilo-login-click-fix.js?v=5',
    html,
)

if 'tchilo-login-session-fix.js' not in html:
    tag = '<script src="native/tchilo-login-session-fix.js?v=6"></script>\n'
    if 'tchilo-login-click-fix.js' in html:
        html = re.sub(
            r'(<script src="native/tchilo-login-click-fix\.js[^>]*>\s*</script>)',
            r'\1\n' + tag,
            html,
            count=1,
        )
    elif 'native/media-editor.js' in html:
        html = re.sub(
            r'(<script src="native/media-editor\.js[^>]*>\s*</script>)',
            r'\1\n' + tag,
            html,
            count=1,
        )
    elif '</head>' in html:
        html = html.replace('</head>', tag + '</head>', 1)

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index: login session v6 wired")
else:
    print("index: no change")
