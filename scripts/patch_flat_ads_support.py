#!/usr/bin/env python3
from pathlib import Path

p = Path("native/tchilo-ads-ui.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = t.replace(
        '#tchiloAdsFallback .af-pay{width:100%;margin-top:16px;padding:14px;border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:none}',
        '#tchiloAdsFallback .af-pay{width:100%;margin-top:16px;padding:14px;border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none}',
    )
    t = t.replace(
        'border:2px solid var(--ink,#0B0B0C)!important;border-radius:999px;background:#c8f560!important;font:800 11px Inter,system-ui,sans-serif!important;color:var(--ink,#0B0B0C)!important',
        'border:0!important;border-radius:999px;background:var(--ink,#0B0B0C)!important;font:600 11px system-ui,sans-serif!important;color:#fff!important',
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("ads-ui fixed")
    else:
        print("ads-ui no change")

p = Path("native/tchilo-support.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = t.replace(
        "border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer;border:0",
        "border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer",
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("support cleaned")
    else:
        print("support no change")

# QR ghost + card leftover borders in profile-share
p = Path("native/tchilo-profile-share.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = t.replace("border:3px solid var(--ink,#0B0B0C)", "border:0")
    t = t.replace("border:2.5px solid var(--ink,#0B0B0C)", "border:0")
    t = t.replace("border:2.5px solid #0B0B0C", "border:0")
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("profile-share borders cleared")
    else:
        print("profile-share no change")
