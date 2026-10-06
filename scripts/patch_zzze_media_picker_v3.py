#!/usr/bin/env python3
# Assembled by CI — installs native/tchilo-media-picker.js v3
import base64, re
from pathlib import Path
# parts written next to this via second file
p = Path('scripts/_mp_v3.b64')
if not p.exists():
    print('missing _mp_v3.b64')
    raise SystemExit(0)
raw = base64.b64decode(p.read_text().strip())
Path('native/tchilo-media-picker.js').write_bytes(raw)
print('wrote picker', len(raw))
html_path = Path('index.html')
if html_path.exists():
    html = html_path.read_text(encoding='utf-8', errors='replace')
    html2 = re.sub(r'native/tchilo-media-picker\.js\?v=\d+', 'native/tchilo-media-picker.js?v=3', html)
    if html2 != html:
        html_path.write_text(html2, encoding='utf-8')
        print('index bumped to v3')
