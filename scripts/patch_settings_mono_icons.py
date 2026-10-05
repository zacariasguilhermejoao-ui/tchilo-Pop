#!/usr/bin/env python3
"""Force mono settings icons — no colored boxes (Instagram-style)."""
from pathlib import Path
import re

# --- native/tchilo-ads-ui.js ---
p = Path("native/tchilo-ads-ui.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = re.sub(
        r"#tchiloAdsMgrBtn \.si-icon\{[^}]+\}",
        "#tchiloAdsMgrBtn .si-icon{width:24px;height:24px;border:0;border-radius:0;background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--ink,#0B0B0C)}",
        t,
        count=1,
    )
    t = t.replace(
        "font:700 15px Inter,system-ui,sans-serif",
        'font:400 16px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    )
    t = t.replace(
        "font:800 11px Inter,system-ui,sans-serif",
        'font:600 11px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    )
    # kill colored so-icon backgrounds injected for ads
    t = re.sub(
        r'style="background:#c8f560;color:#0B0B0C;display:flex;align-items:center;justify-content:center"',
        'style="background:transparent;color:var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center"',
        t,
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("updated native/tchilo-ads-ui.js")
    else:
        print("tchilo-ads-ui.js already ok")

# --- native/tchilo-settings-icons.js ---
p = Path("native/tchilo-settings-icons.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    # strengthen injected CSS
    t = t.replace(
        "background:transparent!important;background-color:transparent!important;background-image:none!important;flex-shrink:0!important;",
        "background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;width:24px!important;height:24px!important;padding:0!important;flex-shrink:0!important;",
    )
    t = t.replace("border-radius', '8px', 'important');", "border-radius', '0', 'important');\n      el.style.setProperty('border', '0', 'important');")
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("updated native/tchilo-settings-icons.js")
    else:
        print("tchilo-settings-icons.js already ok")

# --- index: strip remaining inline si-icon colors if any ---
p = Path("index.html")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t2, c = re.subn(r'(class="si-icon")\s+style="[^"]*"', r"\1", t)
    if c:
        t = t2
        print(f"stripped {c} inline si-icon styles from index")
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("index.html written")
"""
