#!/usr/bin/env python3
"""Flatten neo-brutalist buttons → Instagram/TikTok clean CTAs across index + native."""
from pathlib import Path
import re

# ---------- index.html ----------
p = Path("index.html")
if p.exists():
    html = p.read_text(encoding="utf-8", errors="replace")
    orig = html

    html = re.sub(
        r"\.back-btn\{[^}]+\}",
        ".back-btn{width:36px;height:36px;border:0;border-radius:50%;background:transparent;"
        "display:flex;align-items:center;justify-content:center;cursor:pointer;}",
        html, count=1,
    )

    html = re.sub(
        r"\.share-opt\{[^}]+\}",
        ".share-opt{display:flex;align-items:center;gap:14px;padding:14px 4px;border:0;"
        "border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;background:transparent;"
        "font:400 16px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "cursor:pointer;width:100%;text-align:left;color:var(--ink);}",
        html, count=1,
    )
    html = re.sub(
        r"\.share-opt \.so-icon\{[^}]+\}",
        ".share-opt .so-icon{width:24px;height:24px;border-radius:0;border:0;background:transparent!important;"
        "display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;color:var(--ink);}",
        html, count=1,
    )

    html = re.sub(
        r"\.settings-save\{[^}]+\}",
        ".settings-save{margin:0 18px 18px;padding:14px;border:0;border-radius:12px;"
        "background:var(--ink);color:#fff;font:600 15px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "cursor:pointer;width:calc(100% - 36px);}",
        html, count=1,
    )

    html = re.sub(
        r"\.profile-action-card\{[^}]+\}",
        ".profile-action-card{width:min(100%,430px);background:var(--paper);border:0;"
        "border-top:0.5px solid rgba(11,11,12,.12);border-radius:22px 22px 0 0;"
        "padding:16px 16px 28px;box-shadow:0 -14px 40px rgba(0,0,0,.18)}",
        html, count=1,
    )
    html = re.sub(
        r"\.profile-action-card \.pac-close\{[^}]+\}",
        ".profile-action-card .pac-close{margin-left:auto;display:flex;align-items:center;justify-content:center;"
        "width:36px;height:36px;border:0;border-radius:50%;background:transparent;"
        "font-size:22px;font-weight:400;cursor:pointer;line-height:1;color:var(--ink)}",
        html, count=1,
    )

    html = re.sub(
        r"\.chat-send\{[^}]+\}",
        ".chat-send{width:42px;height:42px;border-radius:50%;background:var(--ink);color:#fff;"
        "border:0;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;}",
        html, count=1,
    )

    html = re.sub(
        r"\.sheet-input-bar button\{[^}]+\}",
        ".sheet-input-bar button{padding:0 16px;border-radius:20px;background:var(--ink);color:#fff;"
        "border:0;font:600 13px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;cursor:pointer;}",
        html, count=1,
    )
    html = re.sub(
        r"\.sheet-input-bar input\{[^}]+\}",
        ".sheet-input-bar input{flex:1;border:0;border-radius:20px;padding:10px 14px;"
        "font:500 14px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "outline:none;background:rgba(11,11,12,.06);}",
        html, count=1,
    )

    html = re.sub(
        r"\.settings-modal-fields input\{[^}]+\}",
        ".settings-modal-fields input{border:0;border-radius:12px;padding:12px 14px;"
        "font:500 14px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
        "outline:none;background:rgba(11,11,12,.06);}",
        html, count=1,
    )

    html2, c = re.subn(
        r'(class="so-icon")\s+style="background:[^"]*"',
        r'\1',
        html,
    )
    if c:
        html = html2
        print(f"stripped {c} so-icon inline backgrounds")

    if "/* tchilo-flat-ctas-ig */" not in html:
        flat = """
/* tchilo-flat-ctas-ig */
button.primary, .btn-primary, .settings-save, .login-button:not(.login-back),
.su-send, .af-pay, .pay-btn, .premium-cta, .verified-cta {
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
}
#tchiloQrModal .card {
  border: 0 !important;
  box-shadow: 0 12px 40px rgba(0,0,0,.2) !important;
  border-radius: 20px !important;
}
#tchiloQrModal .actions button {
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  padding: 14px !important;
}
#tchiloQrModal .actions .primary {
  background: var(--ink, #0B0B0C) !important;
  color: #fff !important;
}
#tchiloQrModal .actions .ghost {
  background: rgba(11,11,12,.06) !important;
  color: var(--ink, #0B0B0C) !important;
}
#tchiloQrModal img, #tchiloQrModal canvas {
  border: 0 !important;
  border-radius: 12px !important;
}
.share-opt, .opt {
  border: 0 !important;
  box-shadow: none !important;
}
"""
        if "</style>" in html:
            html = html.replace("</style>", flat + "\n</style>", 1)
            print("injected flat CTA CSS")

    if html != orig:
        p.write_text(html, encoding="utf-8")
        print("index.html updated")
    else:
        print("index unchanged")

# ---------- native: profile-share ----------
p = Path("native/tchilo-profile-share.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = re.sub(
        r"#tchiloQrModal \.card\{[^}]+\}",
        "#tchiloQrModal .card{background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px;"
        "padding:18px;max-width:360px;width:100%;border:0;"
        "box-shadow:0 12px 40px rgba(0,0,0,.2);}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloQrModal \.actions button\{[^}]+\}",
        "#tchiloQrModal .actions button{padding:14px;border-radius:12px;font-weight:600;cursor:pointer;"
        "border:0;font-size:15px;box-shadow:none;}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloQrModal \.actions \.primary\{[^}]+\}",
        "#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C);color:#fff;}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloQrModal \.actions \.ghost\{[^}]+\}",
        "#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C);}",
        t, count=1,
    )
    t = t.replace(
        'style="width:100%;border-radius:14px;border:2.5px solid #0B0B0C"',
        'style="width:100%;border-radius:12px;border:0"',
    )
    t = re.sub(
        r"border-radius:12px!important;border:2\.5px solid var\(--ink,#0B0B0C\)!important;",
        "border-radius:12px!important;border:0!important;",
        t,
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("profile-share QR buttons flattened")
    else:
        print("profile-share no change")

# ---------- native: support ----------
p = Path("native/tchilo-support.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = re.sub(
        r"#tchiloSupport \.su-back\{[^}]+\}",
        "#tchiloSupport .su-back{width:36px;height:36px;border:0;border-radius:50%;background:transparent;"
        "font:600 18px system-ui,sans-serif;cursor:pointer;color:var(--ink,#0B0B0C)}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloSupport \.su-btn\{[^}]+\}",
        "#tchiloSupport .su-btn{display:flex;align-items:center;gap:14px;width:100%;padding:14px 4px;"
        "margin-bottom:0;border:0;border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;"
        "background:transparent;font:400 16px system-ui,sans-serif;text-align:left;cursor:pointer;"
        "box-shadow:none;color:inherit}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloSupport \.su-send\{[^}]+\}",
        "#tchiloSupport .su-send{width:100%;margin-top:12px;padding:14px;border:0;border-radius:12px;"
        "background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloSupport \.su-card\{[^}]+\}",
        "#tchiloSupport .su-card{border:0;border-radius:14px;padding:14px;margin-bottom:12px;"
        "background:rgba(11,11,12,.04)}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloSupport input,#tchiloSupport textarea\{[^}]+\}",
        "#tchiloSupport input,#tchiloSupport textarea{width:100%;box-sizing:border-box;padding:12px;"
        "border:0;border-radius:12px;font:500 14px system-ui,sans-serif;background:rgba(11,11,12,.06)}",
        t, count=1,
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("support flattened")
    else:
        print("support no change")

# ---------- native: ads-ui ----------
p = Path("native/tchilo-ads-ui.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t = re.sub(
        r"#tchiloAdsFallback \.af-top button\{[^}]+\}",
        "#tchiloAdsFallback .af-top button{width:36px;height:36px;border:0;border-radius:50%;"
        "background:transparent;font:600 20px system-ui,sans-serif}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloAdsFallback input,#tchiloAdsFallback textarea,#tchiloAdsFallback select\{[^}]+\}",
        "#tchiloAdsFallback input,#tchiloAdsFallback textarea,#tchiloAdsFallback select{width:100%;box-sizing:border-box;"
        "padding:12px;border:0;border-radius:12px;font:500 14px system-ui,sans-serif;background:rgba(11,11,12,.06)}",
        t, count=1,
    )
    t = re.sub(
        r"#tchiloAdsFallback \.af-pay\{[^}]+\}",
        "#tchiloAdsFallback .af-pay{width:100%;margin-top:16px;padding:14px;border:0;border-radius:12px;"
        "background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none}",
        t, count=1,
    )
    t = re.sub(
        r"\.post-boost-btn\{[^}]+\}",
        ".post-boost-btn{display:inline-flex!important;align-items:center;justify-content:center;flex-shrink:0;"
        "margin-left:6px;padding:6px 12px;border:0!important;border-radius:999px;"
        "background:var(--ink,#0B0B0C)!important;font:600 11px system-ui,sans-serif!important;"
        "color:#fff!important;cursor:pointer;line-height:1;white-space:nowrap;"
        "visibility:visible!important;opacity:1!important;z-index:2}",
        t, count=1,
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("ads-ui flattened")
    else:
        print("ads-ui no change")

for name in ("native/tchilo-premium.js", "native/tchilo-verified.js", "native/paddle-premium.js"):
    p = Path(name)
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    orig = t
    t2 = re.sub(r"border:\s*3px solid[^;\"']*;", "border:0;", t)
    t2 = re.sub(r"border:\s*2\.5px solid[^;\"']*;", "border:0;", t2)
    t2 = re.sub(r"background:\s*#c8f560", "background:var(--ink,#0B0B0C);color:#fff", t2, flags=re.I)
    t2 = re.sub(r"background:\s*var\(--yellow[^)]*\)", "background:var(--ink,#0B0B0C);color:#fff", t2)
    if t2 != orig:
        p.write_text(t2, encoding="utf-8")
        print(f"flattened {name}")
    else:
        print(f"no change {name}")

print("DONE")
