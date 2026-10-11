#!/usr/bin/env python3
from pathlib import Path
p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')
marker = 'native/tchilo-thin-borders.css.js'
if marker in html:
    print('already injected')
    raise SystemExit(0)
# prefer after suggest script, else after reels-icon
for needle in [
    '<script src="native/tchilo-suggest-location-contacts.js?v=1" defer></script>',
    '<script src="native/tchilo-reels-icon.js?v=2" defer></script>',
]:
    if needle in html:
        html = html.replace(needle, needle + '\n<script src="native/tchilo-thin-borders.css.js?v=1" defer></script>', 1)
        p.write_text(html, encoding='utf-8')
        print('injected after', needle[:40])
        raise SystemExit(0)
idx = html.rfind('<script src="native/')
if idx < 0:
    raise SystemExit('no native script')
end = html.find('</script>', idx) + len('</script>')
html = html[:end] + '\n<script src="native/tchilo-thin-borders.css.js?v=1" defer></script>' + html[end:]
p.write_text(html, encoding='utf-8')
print('injected ok')
