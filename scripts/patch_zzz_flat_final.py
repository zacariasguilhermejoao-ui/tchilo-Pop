#!/usr/bin/env python3
"""FINAL pass — flat IG buttons (runs last alphabetically)."""
from pathlib import Path
import re

def flat_ads(t):
    t = t.replace(
        "background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:none",
        "background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;border:0",
    )
    t = t.replace(
        "border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560",
        "border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff",
    )
    t = t.replace(
        "border:2px solid var(--ink,#0B0B0C)!important;border-radius:999px;background:#c8f560!important;font:800 11px Inter,system-ui,sans-serif!important;color:var(--ink,#0B0B0C)!important",
        "border:0!important;border-radius:999px;background:var(--ink,#0B0B0C)!important;font:600 11px system-ui,sans-serif!important;color:#fff!important",
    )
    t = t.replace("background:#c8f560!important", "background:var(--ink,#0B0B0C)!important;color:#fff!important")
    t = t.replace("background:#c8f560", "background:var(--ink,#0B0B0C);color:#fff")
    return t

def flat_support(t):
    t = t.replace(
        "border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer;border:0",
        "border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer",
    )
    t = t.replace("background:#c8f560", "background:var(--ink,#0B0B0C);color:#fff")
    t = t.replace("border:3px solid var(--ink,#0B0B0C)", "border:0")
    t = t.replace("border:2.5px solid var(--ink,#0B0B0C)", "border:0")
    return t

def flat_ps(t):
    t = t.replace("#tchiloQrModal .actions .primary{background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C)}",
                  "#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C);color:#fff}")
    t = t.replace("#tchiloQrModal .actions .primary{background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C);}",
                  "#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C);color:#fff;}")
    t = t.replace("#tchiloQrModal .actions .ghost{background:#fff;color:var(--ink,#0B0B0C)}",
                  "#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C)}")
    t = t.replace("#tchiloQrModal .actions .ghost{background:#fff;color:var(--ink,#0B0B0C);}",
                  "#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C);}")
    t = t.replace("border:3px solid var(--ink,#0B0B0C)", "border:0")
    t = t.replace("border:2.5px solid var(--ink,#0B0B0C)", "border:0")
    t = t.replace("border:2.5px solid #0B0B0C", "border:0")
    t = t.replace("background:var(--yellow,#C8F560)", "background:var(--ink,#0B0B0C);color:#fff")
    return t

for path, fn in [
    ("native/tchilo-ads-ui.js", flat_ads),
    ("native/tchilo-support.js", flat_support),
    ("native/tchilo-profile-share.js", flat_ps),
]:
    p = Path(path)
    if not p.exists():
        print("missing", path)
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    t2 = fn(t)
    if t2 != t:
        p.write_text(t2, encoding="utf-8")
        print("updated", path)
    else:
        print("ok", path)

# index safety net
p = Path("index.html")
if p.exists():
    html = p.read_text(encoding="utf-8", errors="replace")
    if "/* tchilo-flat-ctas-ig */" not in html:
        flat = """
/* tchilo-flat-ctas-ig */
#tchiloQrModal .card{border:0!important;box-shadow:0 12px 40px rgba(0,0,0,.2)!important;}
#tchiloQrModal .actions button{border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important;padding:14px!important;}
#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06)!important;color:var(--ink)!important;}
#tchiloQrModal img,#tchiloQrModal canvas{border:0!important;border-radius:12px!important;}
.back-btn{border:0!important;background:transparent!important;box-shadow:none!important;}
.settings-save,.su-send,.af-pay{border:0!important;background:var(--ink)!important;color:#fff!important;border-radius:12px!important;}
"""
        html = html.replace("</style>", flat + "\n</style>", 1)
        p.write_text(html, encoding="utf-8")
        print("index flat CSS injected")
    else:
        print("index already has flat CSS")

print("zzz final done")
