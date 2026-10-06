#!/usr/bin/env python3
from pathlib import Path
import re
# Source embedded
SRC = r'''PLACEHOLDER_SRC'''
# Will be replaced by next push if needed — for now load from sibling if present
p = Path('scripts/_picker_v3.js')
if p.exists():
    SRC = p.read_text(encoding='utf-8')
elif 'PLACEHOLDER' in SRC:
    print('waiting for _picker_v3.js')
    raise SystemExit(0)
Path('native/tchilo-media-picker.js').write_text(SRC, encoding='utf-8')
print('wrote', len(SRC))
h = Path('index.html')
if h.exists():
    t = h.read_text(encoding='utf-8', errors='replace')
    t2 = re.sub(r'native/tchilo-media-picker\.js\?v=\d+', 'native/tchilo-media-picker.js?v=3', t)
    if t2 != t:
        h.write_text(t2, encoding='utf-8')
        print('index v3')
