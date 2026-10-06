#!/usr/bin/env python3
from pathlib import Path
import re
parts = []
for i in range(3):
    p = Path(f'scripts/_picker_v3_{i}.js')
    if not p.exists():
        print('missing', p)
        raise SystemExit(0)
    parts.append(p.read_text(encoding='utf-8'))
src = ''.join(parts)
Path('native/tchilo-media-picker.js').write_text(src, encoding='utf-8')
print('wrote picker', len(src))
h = Path('index.html')
if h.exists():
    t = h.read_text(encoding='utf-8', errors='replace')
    t2 = re.sub(r'native/tchilo-media-picker\.js\?v=\d+', 'native/tchilo-media-picker.js?v=3', t)
    if t2 != t:
        h.write_text(t2, encoding='utf-8')
        print('index v3')
