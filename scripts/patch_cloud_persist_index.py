#!/usr/bin/env python3
"""Load tchilo-cloud-persist.js in index; ensure stories reload on auth."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

if "tchilo-cloud-persist.js" not in html:
    # after cloud-hydrate or avatar-cloud
    for marker in (
        'src="native/profile-avatar-cloud.js',
        'src="native/tchilo-cloud-hydrate.js',
        'src="native/tchilo-cloud-force.js',
    ):
        if marker in html:
            html = html.replace(
                marker,
                '<script src="native/tchilo-cloud-persist.js?v=1"></script>\n<script ' + marker,
                1,
            )
            # fix double script
            html = html.replace(
                '<script <script src="native/tchilo-cloud-persist',
                '<script src="native/tchilo-cloud-persist',
            )
            # better: simple insert before </body>
            break
    if "tchilo-cloud-persist.js" not in html:
        html = html.replace(
            "</body>",
            '<script src="native/tchilo-cloud-persist.js?v=1"></script>\n</body>',
            1,
        )
    changed = True
    print("script tag added")
else:
    html2, n = re.subn(
        r'src="native/tchilo-cloud-persist\.js[^"]*"',
        'src="native/tchilo-cloud-persist.js?v=1"',
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True

# Bump avatar cloud
html2, n = re.subn(
    r'src="native/profile-avatar-cloud\.js[^"]*"',
    'src="native/profile-avatar-cloud.js?v=2"',
    html,
    count=1,
)
if n:
    html = html2
    changed = True

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no change")
print("persist in index", "tchilo-cloud-persist.js" in html)
