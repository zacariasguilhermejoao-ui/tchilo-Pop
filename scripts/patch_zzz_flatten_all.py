#!/usr/bin/env python3
"""Simple global flatten — yellow CTAs and thick borders gone."""
from pathlib import Path
import re

def flatten_text(t):
    # thick borders
    t = re.sub(r"border:\s*3px solid[^;\"'}]*", "border:0", t)
    t = re.sub(r"border:\s*2\.5px solid[^;\"'}]*", "border:0", t)
    # yellow fills used as CTAs (not color pickers in HTML data attributes carefully)
    t = t.replace("background:#c8f560", "background:#0B0B0C;color:#fff")
    t = t.replace("background:#C8F560", "background:#0B0B0C;color:#fff")
    t = t.replace("background:#FFE566", "background:transparent")
    t = t.replace("background:#ffe566", "background:transparent")
    # CSS var yellow on buttons/tabs
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
        print("missing", rel)
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    t2 = flatten_text(t)
    if t2 != t:
        p.write_text(t2, encoding="utf-8")
        print("flat", rel)
    else:
        print("ok", rel)

# index
p = Path("index.html")
if p.exists():
    html = p.read_text(encoding="utf-8", errors="replace")
    orig = html

    # modal buttons
    html = html.replace(
        "#tchiloModalHost .tm-actions > button.tm-primary{background:var(--yellow)}",
        "#tchiloModalHost .tm-actions > button.tm-primary{background:var(--ink);color:#fff}",
    )
    html = html.replace(
        "border:2.5px solid var(--ink);border-radius:14px;\n  font:800 14px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;background:var(--paper);color:var(--ink);",
        "border:0;border-radius:12px;\n  font:600 15px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;background:rgba(11,11,12,.06);color:var(--ink);",
    )

    # saved tabs
    html = html.replace(".saved-tab.active{background:var(--yellow)}", ".saved-tab.active{background:var(--ink);color:#fff}")
    html = html.replace(".notif-tab.active{ background:var(--yellow); }", ".notif-tab.active{ background:var(--ink);color:#fff; }")

    # soft replace remaining interactive 2.5px borders in common button rules
    html = re.sub(
        r"(\.saved-tab\{[^}]*)border:[^;]+;",
        r"\1border:0;",
        html,
        count=1,
    )

    block = """
/* tchilo-flat-all-v3 */
.back-btn, button.back-btn, .screen-header button.back-btn {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 50% !important;
}
#tchiloModalHost .tm-actions > button {
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
}
#tchiloModalHost .tm-actions > button.tm-primary {
  background: var(--ink, #0B0B0C) !important;
  color: #fff !important;
}
#tchiloModalHost .tm-actions > button:not(.tm-primary):not(.tm-danger) {
  background: rgba(11,11,12,.06) !important;
  color: var(--ink) !important;
}
#tchiloModalHost .tm-input {
  border: 0 !important;
  background: rgba(11,11,12,.06) !important;
  border-radius: 12px !important;
}
#tchiloModalHost .tm-option {
  border: 0.5px solid rgba(11,11,12,.12) !important;
  box-shadow: none !important;
}
.saved-tab {
  border: 0 !important;
  background: rgba(11,11,12,.06) !important;
  color: var(--ink) !important;
  border-radius: 999px !important;
}
.saved-tab.active {
  background: var(--ink) !important;
  color: #fff !important;
}
.saved-remove {
  border: 0 !important;
  background: rgba(11,11,12,.06) !important;
}
.playlist-create {
  border: 0 !important;
  background: var(--ink) !important;
  color: #fff !important;
}
.notif-tab.active {
  background: var(--ink) !important;
  color: #fff !important;
}
#tchiloAdsPro .ap-back,
#tchiloAdsPro .ap-x,
#tchiloVerifiedSheet .tv-back,
#tchiloPremiumSheet .tp-back,
#tchiloSupport .su-back {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 50% !important;
}
#tchiloAdsPro .ap-btn.primary,
#tchiloAdsPro .ap-pay,
#tchiloAdsPro .ap-chip.on,
#tchiloAdsPro .pv-cta {
  background: #0B0B0C !important;
  color: #fff !important;
  border: 0 !important;
}
#tchiloAdsPro .ap-btn,
#tchiloAdsPro .ap-card {
  border: 0.5px solid rgba(11,11,12,.12) !important;
  box-shadow: none !important;
  background: #fff !important;
}
#tchiloAdsPro .ap-btn.primary {
  background: #0B0B0C !important;
  color: #fff !important;
}
#tchiloAdsPro input,
#tchiloAdsPro textarea,
#tchiloAdsPro select {
  border: 0 !important;
  background: rgba(11,11,12,.06) !important;
}
#tchiloVerifiedSheet .tv-card,
#tchiloVerifiedSheet .tv-ico,
#tchiloVerifiedSheet .tv-price-box,
#tchiloVerifiedSheet .tv-hero-badge,
#tchiloVerifiedSheet .close,
#tchiloVerifiedSheet .active-badge,
#tchiloPremiumSheet .tp-card,
#tchiloPremiumSheet .tp-hero-icon {
  border: 0 !important;
  box-shadow: none !important;
}
#tchiloVerifiedSheet .pay,
#tchiloPremiumSheet .pay {
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 12px !important;
}
"""

    # remove old blocks to avoid bloat
    html = re.sub(r"/\* tchilo-flat-all-v2 \*/[\s\S]*?(?=/\* tchilo-flat|</style>)", "", html)
    if "/* tchilo-flat-all-v3 */" not in html:
        if "/* tchilo-flat-ctas-ig */" in html:
            html = html.replace("/* tchilo-flat-ctas-ig */", block + "\n/* tchilo-flat-ctas-ig */", 1)
        else:
            html = html.replace("</style>", block + "\n</style>", 1)
        print("injected v3")
    else:
        print("v3 already present")

    if html != orig:
        p.write_text(html, encoding="utf-8")
        print("index written", len(html))
    else:
        print("index unchanged")

print("done")
