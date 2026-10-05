#!/usr/bin/env python3
from pathlib import Path
import re
p = Path("native/tchilo-ads-ui.js")
if not p.exists():
    raise SystemExit(0)
t = p.read_text(encoding="utf-8", errors="replace")
orig = t
t = re.sub(
    r"#tchiloAdsMgrBtn \.si-icon\{[^}]+\}",
    "#tchiloAdsMgrBtn .si-icon{width:24px;height:24px;border:0;border-radius:0;background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--ink,#0B0B0C)}",
    t,
    count=1,
)
t = re.sub(
    r'style="background:#c8f560;color:#0B0B0C;display:flex;align-items:center;justify-content:center"',
    'style="background:transparent;color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center"',
    t,
)
if t != orig:
    p.write_text(t, encoding="utf-8")
    print("tchilo-ads-ui.js updated")
else:
    print("already ok")
