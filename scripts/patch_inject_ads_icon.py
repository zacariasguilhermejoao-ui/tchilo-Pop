#!/usr/bin/env python3
from pathlib import Path
p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')
marker = 'native/tchilo-ads-icon-fix.js'
if marker in html:
    print('already injected')
    raise SystemExit(0)
# Also replace inline SVG on Meus Anúncios if present
old_svg_start = 'id="tchiloAdsMgrBtn"'
if old_svg_start in html:
    # replace speaker-style path block inside that button once via regex-like simple find
    import re
    html2 = re.sub(
        r'(id="tchiloAdsMgrBtn"[\s\S]{0,400}?)<svg viewBox="0 0 24 24"[^>]*>[\s\S]*?</svg>',
        r'\1<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10v4a1 1 0 0 0 1 1h2.5L12 19V5L6.5 9H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a4.2 4.2 0 0 1 0 7"/><path d="M18 6.5a7 7 0 0 1 0 11"/><path d="M7.5 15.5v2.2a1.3 1.3 0 0 0 2.2.9l1.1-1.1"/></svg>',
        html,
        count=1,
    )
    if html2 != html:
        html = html2
        print('inline svg replaced')
for needle in [
    '<script src="native/tchilo-edit-profile-modern.js?v=1" defer></script>',
    '<script src="native/tchilo-thin-borders.css.js?v=1" defer></script>',
    '<script src="native/tchilo-ads-ui.js?v=1"></script>',
    '<script src="native/tchilo-ads-ui.js"></script>',
]:
    if needle in html and marker not in html:
        html = html.replace(needle, needle + '\n<script src="native/tchilo-ads-icon-fix.js?v=1" defer></script>', 1)
        p.write_text(html, encoding='utf-8')
        print('script injected after', needle[:55])
        raise SystemExit(0)
if marker not in html:
    idx = html.rfind('<script src="native/')
    end = html.find('</script>', idx) + len('</script>')
    html = html[:end] + '\n<script src="native/tchilo-ads-icon-fix.js?v=1" defer></script>' + html[end:]
p.write_text(html, encoding='utf-8')
print('done')
