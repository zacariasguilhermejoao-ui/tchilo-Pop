#!/usr/bin/env python3
import base64
from pathlib import Path
parts = []
for i in range(3):
    p = Path(f'scripts/_pm_p{i}.b64')
    if not p.exists():
        print('missing', p)
        raise SystemExit(0)
    parts.append(p.read_text().strip())
raw = base64.b64decode(''.join(parts))
Path('native/post-music-feed.js').write_bytes(raw)
print('wrote post-music-feed', len(raw))
