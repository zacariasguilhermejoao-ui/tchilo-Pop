#!/usr/bin/env python3
"""Flatten neo-brutalist buttons — exact string replaces (works with JS string concat)."""
from pathlib import Path
import re

# ---------- profile-share: QR modal ----------
p = Path("native/tchilo-profile-share.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    reps = [
        (
            "border:3px solid var(--ink,#0B0B0C);' +\n      'box-shadow:none;}'",
            "border:0;' +\n      'box-shadow:0 12px 40px rgba(0,0,0,.2);}'",
        ),
        (
            "border:3px solid var(--ink,#0B0B0C);",
            "border:0;",
        ),
        (
            "'border:2.5px solid var(--ink,#0B0B0C);font-size:15px;box-shadow:none;}'",
            "'border:0;font-size:15px;box-shadow:none;font-weight:600;}'",
        ),
        (
            "#tchiloQrModal .actions .primary{background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C);}",
            "#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C);color:#fff;}",
        ),
        (
            "#tchiloQrModal .actions .ghost{background:#fff;color:var(--ink,#0B0B0C);}",
            "#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C);}",
        ),
        (
            'style="width:100%;border-radius:14px;border:2.5px solid #0B0B0C"',
            'style="width:100%;border-radius:12px;border:0"',
        ),
        (
            "border:2.5px solid var(--ink,#0B0B0C)!important;",
            "border:0!important;",
        ),
    ]
    for a, b in reps:
        if a in t:
            t = t.replace(a, b)
            print("ps replaced", a[:50])
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("profile-share written")
    else:
        print("profile-share no exact match — trying regex")
        t2 = t
        t2 = t2.replace("background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C)}", "background:var(--ink,#0B0B0C);color:#fff}")
        t2 = t2.replace("background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C);", "background:var(--ink,#0B0B0C);color:#fff;")
        t2 = re.sub(r"border:3px solid var\(--ink,#0B0B0C\)", "border:0", t2)
        t2 = re.sub(r"border:2\.5px solid var\(--ink,#0B0B0C\)", "border:0", t2)
        t2 = t2.replace("background:#fff;color:var(--ink,#0B0B0C)}", "background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C)}")
        if t2 != t:
            p.write_text(t2, encoding="utf-8")
            print("profile-share regex written")

# ---------- support ----------
p = Path("native/tchilo-support.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = t.replace(
        'background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:none;cursor:pointer}',
        'background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer;border:0}',
    )
    t = t.replace("border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560",
                  "border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff")
    t = t.replace("border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#FFE566",
                  "border:0;border-radius:50%;background:transparent")
    t = t.replace("border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;padding:14px;margin-bottom:12px;background:#fff",
                  "border:0;border-radius:14px;padding:14px;margin-bottom:12px;background:rgba(11,11,12,.04)")
    t = t.replace(
        "border:2.5px solid var(--ink,#0B0B0C);border-radius:16px;background:#fff;font:800 14px Inter,sans-serif",
        "border:0;border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;background:transparent;font:400 16px system-ui,sans-serif",
    )
    t = t.replace("border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;font:600 14px Inter,sans-serif;background:#fff",
                  "border:0;border-radius:12px;font:500 14px system-ui,sans-serif;background:rgba(11,11,12,.06)")
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("support written")
    else:
        print("support no change")

# ---------- ads-ui ----------
p = Path("native/tchilo-ads-ui.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = t.replace(
        "border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:none",
        "border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none",
    )
    t = t.replace(
        "border:2.5px solid var(--ink,#0B0B0C);border-radius:50%;background:#ffe566;font:900 20px Inter,sans-serif",
        "border:0;border-radius:50%;background:transparent;font:600 20px system-ui,sans-serif",
    )
    t = t.replace(
        "border:2.5px solid var(--ink,#0B0B0C);border-radius:12px;font:600 14px Inter,sans-serif;background:#fff",
        "border:0;border-radius:12px;font:500 14px system-ui,sans-serif;background:rgba(11,11,12,.06)",
    )
    t = t.replace(
        "border:2px solid var(--ink,#0B0B0C)!important;border-radius:999px;background:#c8f560!important;font:800 11px Inter,system-ui,sans-serif!important;color:var(--ink,#0B0B0C)!important",
        "border:0!important;border-radius:999px;background:var(--ink,#0B0B0C)!important;font:600 11px system-ui,sans-serif!important;color:#fff!important",
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("ads-ui written")
    else:
        print("ads-ui no change")

# ---------- index ----------
p = Path("index.html")
if p.exists():
    html = p.read_text(encoding="utf-8", errors="replace")
    orig = html
    html = re.sub(
        r"\.back-btn\{[^}]+\}",
        ".back-btn{width:36px;height:36px;border:0;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;}",
        html, count=1,
    )
    html = re.sub(
        r"\.share-opt\{[^}]+\}",
        ".share-opt{display:flex;align-items:center;gap:14px;padding:14px 4px;border:0;border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;background:transparent;font:400 16px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;width:100%;text-align:left;color:var(--ink);}",
        html, count=1,
    )
    html = re.sub(
        r"\.share-opt \.so-icon\{[^}]+\}",
        ".share-opt .so-icon{width:24px;height:24px;border-radius:0;border:0;background:transparent!important;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;color:var(--ink);}",
        html, count=1,
    )
    html = re.sub(
        r"\.settings-save\{[^}]+\}",
        ".settings-save{margin:0 18px 18px;padding:14px;border:0;border-radius:12px;background:var(--ink);color:#fff;font:600 15px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;width:calc(100% - 36px);}",
        html, count=1,
    )
    html = re.sub(
        r"\.profile-action-card\{[^}]+\}",
        ".profile-action-card{width:min(100%,430px);background:var(--paper);border:0;border-top:0.5px solid rgba(11,11,12,.12);border-radius:22px 22px 0 0;padding:16px 16px 28px;box-shadow:0 -14px 40px rgba(0,0,0,.18)}",
        html, count=1,
    )
    html = re.sub(
        r"\.profile-action-card \.pac-close\{[^}]+\}",
        ".profile-action-card .pac-close{margin-left:auto;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:0;border-radius:50%;background:transparent;font-size:22px;font-weight:400;cursor:pointer;line-height:1;color:var(--ink)}",
        html, count=1,
    )
    html = re.sub(
        r"\.chat-send\{[^}]+\}",
        ".chat-send{width:42px;height:42px;border-radius:50%;background:var(--ink);color:#fff;border:0;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;}",
        html, count=1,
    )
    html2, c = re.subn(r'(class="so-icon")\s+style="background:[^"]*"', r'\1', html)
    if c:
        html = html2
        print("stripped so-icon", c)

    if "/* tchilo-flat-ctas-ig */" not in html:
        flat = """
/* tchilo-flat-ctas-ig */
#tchiloQrModal .card{border:0!important;box-shadow:0 12px 40px rgba(0,0,0,.2)!important;border-radius:20px!important;}
#tchiloQrModal .actions button{border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important;padding:14px!important;}
#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06)!important;color:var(--ink,#0B0B0C)!important;}
#tchiloQrModal img,#tchiloQrModal canvas{border:0!important;border-radius:12px!important;}
.back-btn{border:0!important;background:transparent!important;box-shadow:none!important;}
.share-opt,.opt{border:0!important;box-shadow:none!important;}
.settings-save,.su-send,.af-pay{border:0!important;box-shadow:none!important;border-radius:12px!important;background:var(--ink)!important;color:#fff!important;}
"""
        html = html.replace("</style>", flat + "\n</style>", 1)
        print("injected flat CSS")

    if html != orig:
        p.write_text(html, encoding="utf-8")
        print("index written")
    else:
        print("index unchanged")

print("DONE")
