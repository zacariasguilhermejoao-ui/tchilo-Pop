#!/usr/bin/env python3
"""Put flat UI CSS directly in index.html — no runtime injection."""
from pathlib import Path

p = Path("index.html")
if not p.exists():
    print("no index")
    raise SystemExit(0)

html = p.read_text(encoding="utf-8", errors="replace")
orig = html

# Direct style fixes
html = html.replace(
    "#tchiloModalHost .tm-actions > button.tm-primary{background:var(--yellow)}",
    "#tchiloModalHost .tm-actions > button.tm-primary{background:var(--ink);color:#fff}",
)
html = html.replace(
    ".saved-tab.active{background:var(--yellow)}",
    ".saved-tab.active{background:var(--ink);color:#fff}",
)
html = html.replace(
    ".notif-tab.active{ background:var(--yellow); }",
    ".notif-tab.active{ background:var(--ink);color:#fff; }",
)

# Bump settings-icons cache
html = html.replace(
    "native/tchilo-settings-icons.js?v=25",
    "native/tchilo-settings-icons.js?v=26",
)
html = html.replace(
    "native/tchilo-settings-icons.js?v=26",
    "native/tchilo-settings-icons.js?v=26",
)

BLOCK = """
/* tchilo-flat-all-v3 — original in index */
.back-btn,button.back-btn,.screen-header .back-btn{
  border:0!important;background:transparent!important;box-shadow:none!important;border-radius:50%!important;
}
#tchiloModalHost .tm-actions>button{
  border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important;
}
#tchiloModalHost .tm-actions>button.tm-primary{
  background:var(--ink,#0B0B0C)!important;color:#fff!important;
}
#tchiloModalHost .tm-actions>button:not(.tm-primary):not(.tm-danger){
  background:rgba(11,11,12,.06)!important;color:var(--ink)!important;
}
#tchiloModalHost .tm-input{
  border:0!important;background:rgba(11,11,12,.06)!important;border-radius:12px!important;
}
#tchiloModalHost .tm-option{
  border:0.5px solid rgba(11,11,12,.12)!important;box-shadow:none!important;
}
.saved-tab{
  border:0!important;background:rgba(11,11,12,.06)!important;border-radius:999px!important;color:var(--ink)!important;
}
.saved-tab.active{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
.saved-remove{border:0!important;background:rgba(11,11,12,.06)!important;}
.playlist-create{border:0!important;background:var(--ink,#0B0B0C)!important;color:#fff!important;}
.notif-tab.active{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
#tchiloAdsPro .ap-back,#tchiloAdsPro .ap-x,
#tchiloVerifiedSheet .tv-back,#tchiloPremiumSheet .tp-back,#tchiloSupport .su-back{
  border:0!important;background:transparent!important;border-radius:50%!important;box-shadow:none!important;
}
#tchiloAdsPro .ap-btn.primary,#tchiloAdsPro .ap-pay,#tchiloAdsPro .ap-chip.on,#tchiloAdsPro .pv-cta{
  background:#0B0B0C!important;color:#fff!important;border:0!important;
}
#tchiloAdsPro .ap-btn,#tchiloAdsPro .ap-card{
  border:0.5px solid rgba(11,11,12,.12)!important;box-shadow:none!important;background:#fff!important;
}
#tchiloAdsPro .ap-btn.primary{background:#0B0B0C!important;color:#fff!important;}
#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select{
  border:0!important;background:rgba(11,11,12,.06)!important;
}
#tchiloAdsPro .ap-chip{border:0!important;background:rgba(11,11,12,.06)!important;}
#tchiloVerifiedSheet .tv-card,#tchiloVerifiedSheet .tv-ico,#tchiloVerifiedSheet .tv-price-box,
#tchiloVerifiedSheet .tv-hero-badge,#tchiloVerifiedSheet .close,#tchiloVerifiedSheet .active-badge,
#tchiloPremiumSheet .tp-card,#tchiloPremiumSheet .tp-hero-icon{
  border:0!important;box-shadow:none!important;
}
#tchiloVerifiedSheet .pay,#tchiloPremiumSheet .pay{
  border:0!important;border-radius:12px!important;box-shadow:none!important;
}
#tchiloQrModal .card{border:0!important;box-shadow:0 12px 40px rgba(0,0,0,.2)!important;}
#tchiloQrModal .actions button{
  border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important;
}
#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C)!important;color:#fff!important;}
#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06)!important;color:var(--ink)!important;}
.settings-item .si-icon{
  width:24px!important;height:24px!important;border:0!important;border-radius:0!important;background:transparent!important;
}
.settings-item .si-icon svg{
  display:block!important;visibility:visible!important;opacity:1!important;width:22px!important;height:22px!important;
}
"""

if "/* tchilo-flat-all-v3" not in html:
    if "/* tchilo-flat-ctas-ig */" in html:
        html = html.replace("/* tchilo-flat-ctas-ig */", BLOCK + "\n/* tchilo-flat-ctas-ig */", 1)
        print("injected before ctas-ig")
    else:
        # first closing style tag
        html = html.replace("</style>", BLOCK + "\n</style>", 1)
        print("injected before first </style>")
else:
    print("v3 already in index")

if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index written", len(html))
else:
    print("index unchanged")
