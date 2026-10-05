#!/usr/bin/env python3
from pathlib import Path
import re
p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')
html2, n = re.subn(
    r'src="native/tchilo-verified\.js[^"]*"',
    'src="native/tchilo-verified.js?v=4"',
    html,
    count=1,
)
if n:
    p.write_text(html2, encoding='utf-8')
    print('bumped v4')
else:
    print('no match')
