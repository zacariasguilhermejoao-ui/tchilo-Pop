#!/usr/bin/env python3
"""Wire light theme injectors; bump music flat to light. Do not alter login-button styles."""
from pathlib import Path
import re

p = Path('index.html')
if not p.exists():
    raise SystemExit(0)

html = p.read_text(encoding='utf-8', errors='replace')
orig = html

def ensure_script(src_pattern, tag):
    global html
    if src_pattern.split('?')[0] in html:
        html = re.sub(
            re.escape(src_pattern.split('?')[0]) + r'\?v=\d+',
            src_pattern,
            html,
        )
        # if no ?v= present
        if src_pattern not in html and src_pattern.split('?')[0] in html:
            html = re.sub(
                r'(<script src="' + re.escape(src_pattern.split('?')[0]) + r')(?:\?v=\d+)?("[^>]*>)',
                r'\1?' + (src_pattern.split('?v=')[-1] if '?v=' in src_pattern else '1') + r'\2',
                html,
                count=1,
            )
    else:
        # insert after music flat or post-music or body
        if 'tchilo-music-flat.css.js' in html:
            html = re.sub(
                r'(<script src="native/tchilo-music-flat\.css\.js[^>]+></script>)',
                r'\1\n' + tag,
                html,
                count=1,
            )
        elif 'post-music-feed.js' in html:
            html = re.sub(
                r'(<script src="native/post-music-feed\.js[^>]*></script>)',
                r'\1\n' + tag,
                html,
                count=1,
            )
        else:
            html = html.replace('</body>', tag + '\n</body>', 1)

# music flat already there — bump v
html = re.sub(
    r'native/tchilo-music-flat\.css\.js\?v=\d+',
    'native/tchilo-music-flat.css.js?v=2',
    html,
)
if 'tchilo-music-flat.css.js' not in html:
    ensure_script('native/tchilo-music-flat.css.js?v=2',
                  '<script src="native/tchilo-music-flat.css.js?v=2"></script>')

if 'tchilo-light-create.css.js' not in html:
    ensure_script('native/tchilo-light-create.css.js?v=1',
                  '<script src="native/tchilo-light-create.css.js?v=1"></script>')
else:
    html = re.sub(
        r'native/tchilo-light-create\.css\.js\?v=\d+',
        'native/tchilo-light-create.css.js?v=1',
        html,
    )

# Soften any leftover black create CSS block comments in index if present
if '/* tchilo-music-flat-v1' in html:
    # leave injector to win with !important; optional strip dark rules later
    pass

if html != orig:
    p.write_text(html, encoding='utf-8')
    print('index updated')
else:
    print('index unchanged')

print('light theme patch done')
