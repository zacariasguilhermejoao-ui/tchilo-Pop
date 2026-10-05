#!/usr/bin/env python3
"""Restore PLACEHOLDER-corrupted native JS files from known good commit, then mono-icon fix."""
from pathlib import Path
import urllib.request
import re
import ssl

GOOD = "63f0b2596be00c3238737a1d1c07cfe2a7ff87fa"
BASE = f"https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/{GOOD}/native/"

ctx = ssl.create_default_context()

def download(name):
    url = BASE + name
    print("fetch", url)
    req = urllib.request.Request(url, headers={"User-Agent": "tchilo-restore"})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
        data = r.read()
    text = data.decode("utf-8", errors="replace")
    if len(text) < 500 or text.strip() == "PLACEHOLDER":
        raise RuntimeError(f"bad download {name} size={len(text)}")
    return text

# ads-ui
try:
    t = download("tchilo-ads-ui.js")
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
    Path("native").mkdir(parents=True, exist_ok=True)
    Path("native/tchilo-ads-ui.js").write_text(t, encoding="utf-8")
    print("OK tchilo-ads-ui.js", len(t))
except Exception as e:
    print("FAIL ads-ui", e)

# settings-icons
try:
    t = download("tchilo-settings-icons.js")
    t = t.replace(
        "background:transparent!important;background-color:transparent!important;background-image:none!important;flex-shrink:0!important;",
        "background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;width:24px!important;height:24px!important;padding:0!important;flex-shrink:0!important;",
    )
    Path("native/tchilo-settings-icons.js").write_text(t, encoding="utf-8")
    print("OK tchilo-settings-icons.js", len(t))
except Exception as e:
    print("FAIL settings-icons", e)
