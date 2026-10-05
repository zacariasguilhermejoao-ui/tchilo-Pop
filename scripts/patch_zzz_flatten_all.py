#!/usr/bin/env python3
"""FINAL comprehensive flatten — every remaining neo-brutalist control."""
from pathlib import Path
import re

def strip_thick(t):
    """Replace thick black borders with none; yellow CTAs → ink."""
    t = re.sub(r"border:\s*3px solid[^;\"']*", "border:0", t)
    t = re.sub(r"border:\s*2\.5px solid[^;\"']*", "border:0", t)
    # keep functional 2px on tiny icons sometimes — still flatten interactive
    t = t.replace("background:#c8f560", "background:var(--ink,#0B0B0C);color:#fff")
    t = t.replace("background:#C8F560", "background:var(--ink,#0B0B0C);color:#fff")
    t = t.replace("background:#FFE566", "background:transparent")
    t = t.replace("background:#ffe566", "background:transparent")
    return t

# ---- native screens ----
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
        print("skip missing", rel)
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = strip_thick(t)
    # ads-pro specific soft cards
    if "ads-pro" in rel or "tchilo-ads.js" == rel.split("/")[-1]:
        t = t.replace("background:#c8f560", "background:var(--ink,#0B0B0C);color:#fff")
        t = t.replace(".ap-btn.primary{background:var(--ink,#0B0B0C);color:#fff}",
                      ".ap-btn.primary{background:var(--ink,#0B0B0C);color:#fff}")
        t = re.sub(
            r"#tchiloAdsPro \.ap-back,#tchiloAdsPro \.ap-x\{[^}]+\}",
            "#tchiloAdsPro .ap-back,#tchiloAdsPro .ap-x{width:36px;height:36px;border:0;border-radius:50%;background:transparent;font:600 18px system-ui,sans-serif;cursor:pointer}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloAdsPro \.ap-btn\{[^}]+\}",
            "#tchiloAdsPro .ap-btn{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:16px;border:0.5px solid rgba(11,11,12,.12);border-radius:14px;background:#fff;cursor:pointer;text-align:left;font:inherit;color:inherit;box-shadow:none}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloAdsPro \.ap-btn\.primary\{[^}]+\}",
            "#tchiloAdsPro .ap-btn.primary{background:var(--ink,#0B0B0C);color:#fff}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloAdsPro \.ap-card\{[^}]+\}",
            "#tchiloAdsPro .ap-card{border:0.5px solid rgba(11,11,12,.12);border-radius:14px;padding:14px;margin-bottom:12px;background:#fff}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloAdsPro \.ap-pay\{[^}]+\}",
            "#tchiloAdsPro .ap-pay{width:100%;margin-top:8px;padding:14px;border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select\{[^}]+\}",
            "#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select{width:100%;box-sizing:border-box;padding:12px;border:0;border-radius:12px;font:500 14px system-ui,sans-serif;background:rgba(11,11,12,.06)}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloAdsPro \.ap-chip\{[^}]+\}",
            "#tchiloAdsPro .ap-chip{padding:8px 12px;border:0;border-radius:999px;font:600 12px system-ui,sans-serif;background:rgba(11,11,12,.06);cursor:pointer}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloAdsPro \.ap-chip\.on\{[^}]+\}",
            "#tchiloAdsPro .ap-chip.on{background:var(--ink,#0B0B0C);color:#fff}",
            t, count=1,
        )
    # verified / premium backs + pay
    if "verified" in rel:
        t = t.replace(
            "#tchiloVerifiedSheet .tv-back{width:40px;height:40px;border-radius:12px;border:0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}",
            "#tchiloVerifiedSheet .tv-back{width:36px;height:36px;border-radius:50%;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}",
        )
        # after strip_thick, border is already 0
        t = re.sub(
            r"#tchiloVerifiedSheet \.tv-back\{[^}]+\}",
            "#tchiloVerifiedSheet .tv-back{width:36px;height:36px;border-radius:50%;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloVerifiedSheet \.tv-card\{[^}]+\}",
            "#tchiloVerifiedSheet .tv-card{background:#fff;border:0.5px solid rgba(11,11,12,.1);border-radius:16px;padding:16px;margin:0 0 14px;box-shadow:none;}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloVerifiedSheet \.tv-ico\{[^}]+\}",
            "#tchiloVerifiedSheet .tv-ico{width:40px;height:40px;border-radius:12px;background:#E8F5FE;border:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloVerifiedSheet \.pay\{[^}]+\}",
            "#tchiloVerifiedSheet .pay{width:100%;padding:16px;border-radius:12px;font-weight:600;font-size:16px;border:0;background:#1D9BF0;color:#fff;box-shadow:none;cursor:pointer;}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloVerifiedSheet \.close\{[^}]+\}",
            "#tchiloVerifiedSheet .close{width:100%;padding:14px;border-radius:12px;font-weight:600;font-size:15px;border:0;background:rgba(11,11,12,.06);cursor:pointer;color:var(--ink,#0B0B0C);}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloVerifiedSheet \.tv-hero-badge\{[^}]+\}",
            "#tchiloVerifiedSheet .tv-hero-badge{width:72px;height:72px;margin:0 auto 14px;border-radius:50%;background:#1D9BF0;display:flex;align-items:center;justify-content:center;border:0;box-shadow:none;}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloVerifiedSheet \.tv-price-box\{[^}]+\}",
            "#tchiloVerifiedSheet .tv-price-box{text-align:center;padding:18px 16px;background:linear-gradient(180deg,#E8F5FE 0%,#fff 100%);border:0.5px solid rgba(11,11,12,.1);border-radius:16px;margin:0 0 14px;}",
            t, count=1,
        )
        # settings inject colored icon
        t = t.replace(
            '<div class="si-icon" style="background:#1D9BF0;color:#fff">',
            '<div class="si-icon">',
        )
    if "premium" in rel:
        t = re.sub(
            r"#tchiloPremiumSheet \.tp-back\{[^}]+\}",
            "#tchiloPremiumSheet .tp-back{width:36px;height:36px;border-radius:50%;border:0;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloPremiumSheet \.tp-card\{[^}]+\}",
            "#tchiloPremiumSheet .tp-card{background:#fff;border:0.5px solid rgba(11,11,12,.1);border-radius:16px;padding:16px;margin:0 0 14px;box-shadow:none;}",
            t, count=1,
        )
        t = re.sub(
            r"#tchiloPremiumSheet \.tp-hero-icon\{[^}]+\}",
            "#tchiloPremiumSheet .tp-hero-icon{width:72px;height:72px;margin:0 auto 14px;border-radius:18px;background:rgba(11,11,12,.06);display:flex;align-items:center;justify-content:center;border:0;box-shadow:none;font-size:32px;}",
            t, count=1,
        )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("updated", rel)
    else:
        print("no change", rel)

# ---- index.html ----
p = Path("index.html")
if p.exists():
    html = p.read_text(encoding="utf-8", errors="replace")
    orig = html

    # modal host
    html = re.sub(
        r"#tchiloModalHost \.tm-actions > button\{[^}]+\}",
        "#tchiloModalHost .tm-actions > button{"
        "flex:1;padding:14px 12px;border:0;border-radius:12px;"
        "font:600 15px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "cursor:pointer;background:rgba(11,11,12,.06);color:var(--ink);}",
        html, count=1,
    )
    html = re.sub(
        r"#tchiloModalHost \.tm-actions > button\.tm-primary\{[^}]+\}",
        "#tchiloModalHost .tm-actions > button.tm-primary{background:var(--ink);color:#fff}",
        html, count=1,
    )
    html = re.sub(
        r"#tchiloModalHost \.tm-option\{[^}]+\}",
        "#tchiloModalHost .tm-option{"
        "display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;"
        "padding:12px;margin:0 0 8px;border:0.5px solid rgba(11,11,12,.12);border-radius:12px;"
        "background:#fff;font:600 13.5px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "cursor:pointer;color:var(--ink);}",
        html, count=1,
    )
    html = re.sub(
        r"#tchiloModalHost \.tm-input\{[^}]+\}",
        "#tchiloModalHost .tm-input{"
        "width:100%;box-sizing:border-box;border:0;border-radius:12px;"
        "padding:13px 14px;font:500 15px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "outline:none;background:rgba(11,11,12,.06);margin-top:8px;}",
        html, count=1,
    )

    # saved tabs
    html = re.sub(
        r"\.saved-tab\{[^}]+\}",
        ".saved-tab{padding:8px 14px;border:0;border-radius:999px;background:rgba(11,11,12,.06);"
        "font:600 13px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "cursor:pointer;color:var(--ink);}",
        html, count=1,
    )
    html = re.sub(
        r"\.saved-tab\.active\{[^}]+\}",
        ".saved-tab.active{background:var(--ink);color:#fff}",
        html, count=1,
    )
    html = re.sub(
        r"\.saved-remove\{[^}]+\}",
        ".saved-remove{border:0;background:rgba(11,11,12,.06);border-radius:10px;width:34px;height:34px;cursor:pointer;font-size:17px}",
        html, count=1,
    )
    html = re.sub(
        r"\.playlist-create\{[^}]+\}",
        ".playlist-create{flex:1;padding:12px;border:0;border-radius:12px;background:var(--ink);color:#fff;"
        "font:600 13px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer}",
        html, count=1,
    )
    html = re.sub(
        r"\.playlist-card\{[^}]+\}",
        ".playlist-card{padding:14px;border:0.5px solid rgba(11,11,12,.12);border-radius:14px;background:#fff;margin-bottom:10px;cursor:pointer}",
        html, count=1,
    )
    html = re.sub(
        r"\.saved-thumb\{[^}]+\}",
        ".saved-thumb{width:72px;height:72px;flex-shrink:0;border:0;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(11,11,12,.06);font-family:Anton,sans-serif;font-size:13px;text-align:center}",
        html, count=1,
    )

    # notif tabs
    html = re.sub(
        r"\.notif-tab\.active\{[^}]+\}",
        ".notif-tab.active{background:var(--ink);color:#fff}",
        html, count=1,
    )

    # force global override block (replace old if present)
    block = """
/* tchilo-flat-all-v2 */
.back-btn,
button.back-btn,
.screen-header .back-btn,
#tchiloVerifiedSheet .tv-back,
#tchiloPremiumSheet .tp-back,
#tchiloAdsPro .ap-back,
#tchiloAdsPro .ap-x,
#tchiloSupport .su-back {
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
  background: var(--ink) !important;
  color: #fff !important;
}
#tchiloModalHost .tm-actions > button:not(.tm-primary):not(.tm-danger) {
  background: rgba(11,11,12,.06) !important;
}
#tchiloModalHost .tm-input,
#tchiloModalHost .tm-option {
  border: 0 !important;
  box-shadow: none !important;
}
.saved-tab {
  border: 0 !important;
  box-shadow: none !important;
}
.saved-tab.active {
  background: var(--ink) !important;
  color: #fff !important;
}
.saved-remove,
.playlist-create {
  border: 0 !important;
  box-shadow: none !important;
}
#tchiloAdsPro .ap-back,
#tchiloAdsPro .ap-x {
  background: transparent !important;
  border: 0 !important;
}
#tchiloAdsPro .ap-btn,
#tchiloAdsPro .ap-card,
#tchiloAdsPro .ap-chip,
#tchiloAdsPro input,
#tchiloAdsPro textarea,
#tchiloAdsPro select {
  border-color: rgba(11,11,12,.12) !important;
  box-shadow: none !important;
}
#tchiloAdsPro .ap-btn.primary,
#tchiloAdsPro .ap-pay,
#tchiloAdsPro .ap-chip.on,
#tchiloAdsPro .pv-cta {
  background: var(--ink,#0B0B0C) !important;
  color: #fff !important;
  border: 0 !important;
}
#tchiloVerifiedSheet .tv-back,
#tchiloPremiumSheet .tp-back {
  border: 0 !important;
  background: transparent !important;
}
#tchiloVerifiedSheet .tv-card,
#tchiloVerifiedSheet .tv-ico,
#tchiloVerifiedSheet .tv-price-box,
#tchiloVerifiedSheet .close,
#tchiloPremiumSheet .tp-card {
  border: 0 !important;
  box-shadow: none !important;
}
#tchiloVerifiedSheet .pay {
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 12px !important;
}
/* create / story softer controls */
.create-actions button,
.story-tools button,
.composer-actions button {
  box-shadow: none !important;
}
"""
    if "/* tchilo-flat-all-v2 */" in html:
        html = re.sub(r"/\* tchilo-flat-all-v2 \*/[\s\S]*?(?=</style>)", block, html, count=1)
        print("replaced flat-all-v2 block")
    elif "/* tchilo-flat-ctas-ig */" in html:
        html = html.replace("/* tchilo-flat-ctas-ig */", block + "\n/* tchilo-flat-ctas-ig */", 1)
        print("prepended flat-all-v2")
    else:
        html = html.replace("</style>", block + "\n</style>", 1)
        print("injected flat-all-v2")

    if html != orig:
        p.write_text(html, encoding="utf-8")
        print("index written")
    else:
        print("index unchanged")

print("flatten-all done")
