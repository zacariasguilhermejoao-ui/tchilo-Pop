#!/usr/bin/env python3
from pathlib import Path
import re
p = Path("index.html")
t = p.read_text(encoding="utf-8", errors="replace")
if "tchilo-compose-music-v6.js" not in t:
    t2 = t.replace(
        'native/tchilo-media-picker.js?v=10" defer></script>',
        'native/tchilo-media-picker.js?v=10" defer></script>\n<script src="native/tchilo-compose-music-v6.js?v=1" defer></script>'
    )
    if t2 == t:
        t2 = t.replace(
            'native/tchilo-media-picker.js?v=9" defer></script>',
            'native/tchilo-media-picker.js?v=10" defer></script>\n<script src="native/tchilo-compose-music-v6.js?v=1" defer></script>'
        )
    if t2 == t:
        t2 = t.replace('</body>', '<script src="native/tchilo-compose-music-v6.js?v=1" defer></script></body>')
    p.write_text(t2, encoding="utf-8")
    print("injected compose v6")
else:
    print("already injected")
