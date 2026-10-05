#!/usr/bin/env python3
"""Ensure settings mono SVG icons visible; wire settings-icons v25; bump share sheet."""
from pathlib import Path
import re

p = Path("index.html")
if not p.exists():
    raise SystemExit(0)
html = p.read_text(encoding="utf-8", errors="replace")
orig = html

extra_css = """
  /* settings mono icons visible (IG-style) */
  #screen-settings .settings-item .si-icon{
    width:24px!important;height:24px!important;min-width:24px!important;
    border:0!important;border-radius:0!important;background:transparent!important;
    display:inline-flex!important;align-items:center!important;justify-content:center!important;
    flex-shrink:0!important;color:var(--ink)!important;overflow:visible!important;
  }
  #screen-settings .settings-item .si-icon svg{
    display:block!important;visibility:visible!important;opacity:1!important;
    width:22px!important;height:22px!important;
    stroke:currentColor!important;
  }
  #screen-settings .settings-item .si-icon img{display:none!important;}
"""

if "settings mono icons visible" not in html:
    marker = ".settings-item.danger{ color:var(--pink); }"
    if marker in html:
        html = html.replace(marker, marker + "\n" + extra_css, 1)
        print("injected force-visible CSS")
    else:
        html2, c = re.subn(
            r"(\.settings-item\.danger\{[^}]+\})",
            r"\1\n" + extra_css,
            html,
            count=1,
        )
        if c:
            html = html2
            print("injected via regex")

if "tchilo-settings-icons.js" not in html:
    html = html.replace(
        '<script src="native/tchilo-profile-share.js?v=3"></script>',
        '<script src="native/tchilo-settings-icons.js?v=25"></script>\n'
        '<script src="native/tchilo-profile-share.js?v=4"></script>',
        1,
    )
    print("added settings-icons script")
else:
    html = re.sub(
        r'native/tchilo-settings-icons\.js(\?v=[^"]*)?',
        'native/tchilo-settings-icons.js?v=25',
        html,
    )
    html = re.sub(
        r'native/tchilo-profile-share\.js\?v=\d+',
        'native/tchilo-profile-share.js?v=4',
        html,
    )
    print("bumped script versions")

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index written")
else:
    print("index unchanged")
