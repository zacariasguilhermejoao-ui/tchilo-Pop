#!/usr/bin/env python3
from pathlib import Path
p = Path('index.html')
h = p.read_text(encoding='utf-8')
old = 'native/profile-menu-fix.js?v=1'
new = 'native/profile-menu-fix.js?v=3'
if old in h:
    h = h.replace(old, new)
    p.write_text(h, encoding='utf-8')
    print('bumped to v=3')
elif 'profile-menu-fix.js?v=3' in h:
    print('already v3')
else:
    print('pattern not found')
