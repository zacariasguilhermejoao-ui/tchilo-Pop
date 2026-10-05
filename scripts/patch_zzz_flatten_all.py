#!/usr/bin/env python3
"""Flatten native JS yellow/thick borders (index CSS handled by patch_zzzb_index_flat_css)."""
from pathlib import Path
import re

def flat(t):
    t = re.sub(r"border:\s*3px solid[^;\"'}]*", "border:0", t)
    t = re.sub(r"border:\s*2\.5px solid[^;\"'}]*", "border:0", t)
    t = t.replace("background:#c8f560", "background:#0B0B0C;color:#fff")
    t = t.replace("background:#C8F560", "background:#0B0B0C;color:#fff")
    t = t.replace("background:#FFE566", "background:transparent")
    t = t.replace("background:#ffe566", "background:transparent")
    t = t.replace("background:var(--yellow)}", "background:var(--ink);color:#fff}")
    t = t.replace("background:var(--yellow)", "background:var(--ink);color:#fff")
    t = t.replace("background:var(--yellow,#C8F560)", "background:var(--ink,#0B0B0C);color:#fff")
    return t

for rel in [
    "native/tchilo-ads-pro.js",
    "native/tchilo-ads.js",
    "native/tchilo-ads-ui.js",
    "native/tchilo-verified.js",
    "native/tchilo-premium.js",
    "native/paddle-premium.js",
    "native/tchilo-support.js",
    "native/tchilo-profile-share.js",
    "native/tchilo-create-buttons.js",
]:
    p = Path(rel)
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    t2 = flat(t)
    if t2 != t:
        p.write_text(t2, encoding="utf-8")
        print("flat", rel)
    else:
        print("ok", rel)
print("native flatten done")
