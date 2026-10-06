#!/usr/bin/env python3
"""Convert media-picker embedded dark CSS to light paper theme."""
from pathlib import Path

p = Path('native/tchilo-media-picker.js')
if not p.exists():
    raise SystemExit(0)

t = p.read_text(encoding='utf-8', errors='replace')
o = t

# bulk dark → light in picker CSS strings
repls = [
    ("background:#0B0B0C;color:#fff;", "background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);"),
    ("background:#0B0B0C", "background:var(--paper,#F3F1E9)"),
    ("color:#fff;", "color:var(--ink,#0B0B0C);"),
    ("background:rgba(255,255,255,.1)", "background:rgba(11,11,12,.06)"),
    ("background:rgba(255,255,255,.12)", "background:rgba(11,11,12,.08)"),
    ("background:rgba(255,255,255,.14)", "background:rgba(11,11,12,.1)"),
    ("background:rgba(255,255,255,.16)", "background:rgba(11,11,12,.12)"),
    ("background:rgba(255,255,255,.08)", "background:rgba(11,11,12,.05)"),
    ("color:rgba(255,255,255,.45)", "color:rgba(11,11,12,.45)"),
    ("color:rgba(255,255,255,.55)", "color:rgba(11,11,12,.5)"),
    ("color:rgba(255,255,255,.4)", "color:rgba(11,11,12,.4)"),
    ("background:#111", "background:rgba(11,11,12,.06)"),
    ("background:#1a1a1a", "background:rgba(11,11,12,.04)"),
    ("background:#0a0a0a", "background:var(--paper,#F3F1E9)"),
    ("background:#0d0d0d", "background:rgba(11,11,12,.06)"),
    ("stroke:#fff", "stroke:var(--ink,#0B0B0C)"),
    ("background:#3897f0", "background:var(--ink,#0B0B0C)"),
    ("border-top-color:#3897f0", "border-top-color:var(--ink,#0B0B0C)"),
    ("border-top:1px solid rgba(255,255,255,.08)", "border-top:1px solid rgba(11,11,12,.08)"),
    ("background:rgba(255,255,255,.08)", "background:#fff"),
]
for a, b in repls:
    if a in t:
        t = t.replace(a, b)

# chip on state: dark bg white text is ok for selected
t = t.replace(
    ".mp-chip.on{background:var(--ink,#0B0B0C);color:var(--ink,#0B0B0C);}",
    ".mp-chip.on{background:var(--ink,#0B0B0C);color:#fff;}",
)
# fix over-replaced publish text color
t = t.replace(
    ".mp-publish{border:0;border-radius:999px;padding:8px 16px;font:700 14px system-ui,sans-serif;"
    "background:var(--ink,#0B0B0C);color:var(--ink,#0B0B0C);cursor:pointer;}",
    ".mp-publish{border:0;border-radius:999px;padding:8px 16px;font:700 14px system-ui,sans-serif;"
    "background:var(--ink,#0B0B0C);color:#fff;cursor:pointer;}",
)

if t != o:
    p.write_text(t, encoding='utf-8')
    print('picker lightened', len(t))
else:
    print('picker unchanged')
