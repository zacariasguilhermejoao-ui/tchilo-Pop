#!/usr/bin/env python3
from pathlib import Path
import re

p = Path('index.html')
if not p.exists():
    raise SystemExit(0)
html = p.read_text(encoding='utf-8', errors='replace')
orig = html

html = re.sub(
    r'native/tchilo-music-flat\.css\.js\?v=\d+',
    'native/tchilo-music-flat.css.js?v=3',
    html,
)
if 'tchilo-music-flat.css.js' not in html:
    html = html.replace(
        '</body>',
        '<script src="native/tchilo-music-flat.css.js?v=3"></script>\n</body>',
        1,
    )
if 'tchilo-light-create.css.js' not in html:
    html = re.sub(
        r'(<script src="native/tchilo-music-flat\.css\.js[^>]+></script>)',
        r'\1\n<script src="native/tchilo-light-create.css.js?v=1"></script>',
        html,
        count=1,
    )

if html != orig:
    p.write_text(html, encoding='utf-8')
    print('index bumped music flat v3')
else:
    print('index ok')
