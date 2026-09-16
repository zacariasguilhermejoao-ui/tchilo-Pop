#!/usr/bin/env python3
from pathlib import Path
import re

p = Path("native/media-editor.js")
if not p.exists():
    print("no media-editor.js")
    raise SystemExit(0)

t = p.read_text(encoding="utf-8", errors="replace")
orig = t

# Remove entire meClipSheet HTML block
t = re.sub(
    r"'<div class=\\\"me-sheet\\\" id=\\\"meClipSheet\\\">.*?</div></div>' \+",
    "",
    t,
    count=1,
    flags=re.S,
)

# Remove meEditClip button construction
t = re.sub(
    r"'<button type=\\\"button\\\" class=\\\"me-iconbtn\\\" id=\\\"meEditClip\\\"[^']*' \+\s*ICO\.trim \+\s*'</button>' \+",
    "",
    t,
)

t = t.replace("document.getElementById('meEditClip').onclick = openClipEditor;\n", "")
t = t.replace("document.getElementById('meClipClose').onclick = function () {\n      document.getElementById('meClipSheet').classList.remove('open');\n      stopPreviewAudio();\n    };\n", "")
t = t.replace("document.getElementById('meClipSave').onclick = saveClip;\n", "")
t = t.replace("document.getElementById('meClipStart').oninput = updateClipLabels;\n", "")
t = t.replace("document.getElementById('meClipEnd').oninput = updateClipLabels;\n", "")

# Soft-disable functions
for name in ("openClipEditor", "updateClipLabels", "saveClip"):
    t = t.replace(f"function {name}(", f"function {name}_removed(")

# Light theme for music sheet panel in media-editor
t = t.replace(
    "#tchiloMediaEd .me-sheet-panel{width:min(100%,520px);max-height:78vh;background:#17171a;",
    "#tchiloMediaEd .me-sheet-panel{width:min(100%,520px);max-height:78vh;background:var(--paper,#f6f1e7);color:var(--ink,#17171a);",
)
t = t.replace(
    "#tchiloMediaEd .me-search{display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.08);border-radius:12px;padding:8px 10px;}",
    "#tchiloMediaEd .me-search{display:flex;gap:8px;align-items:center;background:#fff;border:2px solid var(--ink,#17171a);border-radius:12px;padding:8px 10px;}",
)
t = t.replace(
    "#tchiloMediaEd .me-search input{flex:1;border:0;background:transparent;color:#fff;font-size:15px;outline:none;}",
    "#tchiloMediaEd .me-search input{flex:1;border:0;background:transparent;color:var(--ink,#17171a);font-size:15px;outline:none;font-weight:600;}",
)
t = t.replace(
    "#tchiloMediaEd .me-track{display:flex;gap:10px;align-items:center;padding:10px 4px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;}",
    "#tchiloMediaEd .me-track{display:flex;gap:10px;align-items:center;padding:10px 4px;border-bottom:1px solid rgba(23,23,26,.08);cursor:pointer;color:var(--ink,#17171a);}",
)

if t != orig:
    p.write_text(t, encoding="utf-8")
    print("media-editor.js updated")
else:
    print("no changes")
