#!/usr/bin/env python3
"""Restore corrupted native files and apply mono icon fix."""
from pathlib import Path
import urllib.request
import re

BASE = "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/63f0b2596be00c3238737a1d1c07cfe2a7ff87fa/native/"

def fetch(name):
    url = BASE + name
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")

# ads-ui
try:
    t = fetch("tchilo-ads-ui.js")
    if len(t) < 1000 or t.strip() == "PLACEHOLDER":
        raise RuntimeError("bad fetch ads-ui")
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
    Path("native/tchilo-ads-ui.js").write_text(t, encoding="utf-8")
    print("restored tchilo-ads-ui.js", len(t))
except Exception as e:
    print("ads-ui error", e)

# settings-icons
try:
    t = fetch("tchilo-settings-icons.js")
    if len(t) < 500 or t.strip() == "PLACEHOLDER":
        raise RuntimeError("bad fetch settings-icons")
    t = t.replace(
        "background:transparent!important;background-color:transparent!important;background-image:none!important;flex-shrink:0!important;",
        "background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;width:24px!important;height:24px!important;padding:0!important;flex-shrink:0!important;",
    )
    Path("native/tchilo-settings-icons.js").write_text(t, encoding="utf-8")
    print("restored tchilo-settings-icons.js", len(t))
except Exception as e:
    print("settings-icons error", e)
