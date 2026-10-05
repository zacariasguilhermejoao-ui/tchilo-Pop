#!/usr/bin/env python3
"""Wire Instagram-style media picker into index."""
from pathlib import Path
import re

p = Path("index.html")
if not p.exists():
    print("no index")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
orig = html

SCRIPT = '<script src="native/tchilo-media-picker.js?v=2" defer></script>'
if "tchilo-media-picker.js" not in html:
    if "tchilo-settings-icons.js" in html:
        html = re.sub(
            r'(<script src="native/tchilo-settings-icons\.js[^>]+></script>)',
            r'\1\n' + SCRIPT,
            html,
            count=1,
        )
    else:
        html = html.replace("</body>", SCRIPT + "\n</body>", 1)
else:
    html = re.sub(
        r'native/tchilo-media-picker\.js\?v=\d+',
        'native/tchilo-media-picker.js?v=2',
        html,
    )

BLOCK = """
/* tchilo-media-picker-flat */
#screen-create .create-preview{border:0!important;box-shadow:none!important;border-radius:12px!important;}
#screen-create .gallery-btn{border:1px dashed rgba(11,11,12,.25)!important;box-shadow:none!important;}
#screen-create .publish-btn{border:0!important;box-shadow:none!important;background:var(--ink)!important;color:#fff!important;}
#screen-create .create-input,#screen-create input,#screen-create textarea{
  border:0!important;background:rgba(11,11,12,.06)!important;border-radius:12px!important;box-shadow:none!important;
}
.nav-post{border:0!important;box-shadow:none!important;}
"""
if "/* tchilo-media-picker-flat */" not in html:
    if "/* tchilo-system-titles" in html:
        html = html.replace("/* tchilo-system-titles", BLOCK + "\n/* tchilo-system-titles", 1)
    elif "/* tchilo-flat-all-v3" in html:
        html = html.replace("/* tchilo-flat-all-v3", BLOCK + "\n/* tchilo-flat-all-v3", 1)
    else:
        html = html.replace("</style>", BLOCK + "\n</style>", 1)

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index written", len(html))
else:
    print("index unchanged")
