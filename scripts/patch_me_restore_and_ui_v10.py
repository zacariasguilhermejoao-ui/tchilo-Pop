#!/usr/bin/env python3
from pathlib import Path
import base64, re
ROOT = Path(__file__).resolve().parents[1]
chunks = sorted(ROOT.glob("scripts/me_orig_*.b64"), key=lambda p: int(p.stem.split("_")[-1]))
if chunks:
    data = "".join(p.read_text().strip() for p in chunks)
    (ROOT / "native" / "media-editor.js").write_bytes(base64.b64decode(data))
    print("restored media-editor", (ROOT/"native"/"media-editor.js").stat().st_size)
idx = ROOT / "index.html"
s = idx.read_text(encoding="utf-8")
s2 = re.sub(r'<script src="native/media-editor\.js[^"]*"></script>',
            '<script src="native/media-editor.js?v=10"></script>', s)
if "tchilo-media-editor-ui-v10" not in s2:
    s2 = s2.replace(
        '<script src="native/media-editor.js?v=10"></script>',
        '<script src="native/media-editor.js?v=10"></script>\n<script src="native/tchilo-media-editor-ui-v10.js?v=1"></script>',
        1,
    )
if "tchilo-login-click-fix" not in s2:
    s2 = s2.replace(
        '<script src="native/media-editor.js?v=10"></script>',
        '<script src="native/media-editor.js?v=10"></script>\n<script src="native/tchilo-login-click-fix.js?v=3"></script>',
        1,
    )
if s2 != s:
    idx.write_text(s2, encoding="utf-8")
    print("index wired")
else:
    print("index unchanged")
