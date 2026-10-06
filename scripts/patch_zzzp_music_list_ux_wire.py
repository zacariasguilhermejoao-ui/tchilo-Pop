#!/usr/bin/env python3
from pathlib import Path
import re

p = Path('index.html')
if not p.exists():
    raise SystemExit(0)
html = p.read_text(encoding='utf-8', errors='replace')
orig = html
tag = '<script src="native/tchilo-music-list-ux.js?v=1" defer></script>'
if 'tchilo-music-list-ux.js' not in html:
    if 'tchilo-music-flat.css.js' in html:
        html = re.sub(
            r'(<script src="native/tchilo-music-flat\.css\.js[^>]+></script>)',
            r'\1\n' + tag,
            html,
            count=1,
        )
    elif 'post-music-feed.js' in html:
        html = re.sub(
            r'(<script src="native/post-music-feed\.js[^>]*></script>)',
            r'\1\n' + tag,
            html,
            count=1,
        )
    else:
        html = html.replace('</body>', tag + '\n</body>', 1)
else:
    html = re.sub(r'tchilo-music-list-ux\.js\?v=\d+', 'tchilo-music-list-ux.js?v=1', html)

html = re.sub(r'tchilo-music-flat\.css\.js\?v=\d+', 'tchilo-music-flat.css.js?v=3', html)

if html != orig:
    p.write_text(html, encoding='utf-8')
    print('index wired')
else:
    print('index ok')
