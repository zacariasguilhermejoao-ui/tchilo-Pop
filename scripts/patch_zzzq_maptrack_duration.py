#!/usr/bin/env python3
from pathlib import Path

p = Path('native/post-music-feed.js')
if not p.exists():
    raise SystemExit(0)
t = p.read_text(encoding='utf-8', errors='replace')
if 'duration: dur' in t or 'duration: t.duration' in t:
    print('already')
    raise SystemExit(0)
old = """preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || ''
    };"""
new = """preview: t.preview || '',
      cover: (t.album && (t.album.cover_medium || t.album.cover)) || '',
      duration: t.duration || 0
    };"""
if old in t:
    t = t.replace(old, new, 1)
    p.write_text(t, encoding='utf-8')
    print('duration added')
else:
    print('miss')
