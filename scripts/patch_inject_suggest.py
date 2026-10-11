#!/usr/bin/env python3
"""Inject native/tchilo-suggest-location-contacts.js into index.html"""
from pathlib import Path

p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')
marker = 'native/tchilo-suggest-location-contacts.js'
if marker in html:
    print('already injected')
    raise SystemExit(0)

needle = '<script src="native/tchilo-reels-icon.js?v=2" defer></script>'
inject = (
    needle
    + '\n<script src="native/tchilo-suggest-location-contacts.js?v=1" defer></script>'
)
if needle not in html:
    # fallback: last native script before </body>
    idx = html.rfind('<script src="native/')
    if idx < 0:
        raise SystemExit('no native script found')
    end = html.find('</script>', idx)
    if end < 0:
        raise SystemExit('no script end')
    end += len('</script>')
    html = html[:end] + '\n<script src="native/tchilo-suggest-location-contacts.js?v=1" defer></script>' + html[end:]
else:
    html = html.replace(needle, inject, 1)

p.write_text(html, encoding='utf-8')
print('injected ok')
