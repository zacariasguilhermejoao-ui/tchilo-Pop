#!/usr/bin/env python3
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

tag = '<script src="native/tchilo-profile-avatar-plus.js?v=2"></script>'
if "tchilo-profile-avatar-plus.js" not in html:
    html2, n = re.subn(
        r'(<script src="native/profile-avatar-cloud\.js[^"]*"></script>)',
        r"\1\n" + tag,
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print("added after cloud")
    else:
        html = html.replace("</body>", tag + "\n</body>", 1)
        changed = True
        print("added before body")
else:
    html2, n = re.subn(
        r'src="native/tchilo-profile-avatar-plus\.js[^"]*"',
        'src="native/tchilo-profile-avatar-plus.js?v=2"',
        html,
        count=1,
    )
    if n:
        html = html2
        changed = True
        print("bumped v2")

# static CSS in head as belt-and-suspenders
if "tchilo-avatar-plus-static" not in html:
    css = (
        '<style id="tchilo-avatar-plus-static">'
        '#tchiloProfileAvatarPlus{'
        'animation:none!important;transition:none!important;transform:none!important;' 
        '}'
        '</style>\n'
    )
    if "</head>" in html:
        html = html.replace("</head>", css + "</head>", 1)
        changed = True
        print("static css")

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no change")
