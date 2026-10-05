#!/usr/bin/env python3
from pathlib import Path
p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
orig = html
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
block = """
/* tchilo-flat-all-v3 */
.back-btn,button.back-btn,.screen-header .back-btn{border:0!important;background:transparent!important;box-shadow:none!important;border-radius:50%!important}
#tchiloModalHost .tm-actions>button{border:0!important;box-shadow:none!important;border-radius:12px!important;font-weight:600!important}
#tchiloModalHost .tm-actions>button.tm-primary{background:var(--ink,#0B0B0C)!important;color:#fff!important}
#tchiloModalHost .tm-actions>button:not(.tm-primary):not(.tm-danger){background:rgba(11,11,12,.06)!important}
#tchiloModalHost .tm-input{border:0!important;background:rgba(11,11,12,.06)!important;border-radius:12px!important}
.saved-tab{border:0!important;background:rgba(11,11,12,.06)!important;border-radius:999px!important}
.saved-tab.active{background:var(--ink)!important;color:#fff!important}
.saved-remove,.playlist-create{border:0!important}
.playlist-create{background:var(--ink)!important;color:#fff!important}
.notif-tab.active{background:var(--ink)!important;color:#fff!important}
#tchiloAdsPro .ap-back,#tchiloAdsPro .ap-x,#tchiloVerifiedSheet .tv-back,#tchiloPremiumSheet .tp-back,#tchiloSupport .su-back{border:0!important;background:transparent!important;border-radius:50%!important}
#tchiloAdsPro .ap-btn.primary,#tchiloAdsPro .ap-pay,#tchiloAdsPro .ap-chip.on,#tchiloAdsPro .pv-cta{background:#0B0B0C!important;color:#fff!important;border:0!important}
#tchiloAdsPro .ap-btn,#tchiloAdsPro .ap-card{border:0.5px solid rgba(11,11,12,.12)!important;box-shadow:none!important}
#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select{border:0!important;background:rgba(11,11,12,.06)!important}
#tchiloVerifiedSheet .tv-card,#tchiloVerifiedSheet .tv-ico,#tchiloVerifiedSheet .tv-price-box,#tchiloVerifiedSheet .tv-hero-badge,#tchiloVerifiedSheet .close,#tchiloPremiumSheet .tp-card,#tchiloPremiumSheet .tp-hero-icon{border:0!important;box-shadow:none!important}
#tchiloVerifiedSheet .pay{border:0!important;border-radius:12px!important}
"""
if "/* tchilo-flat-all-v3 */" not in html:
    if "/* tchilo-flat-ctas-ig */" in html:
        html = html.replace("/* tchilo-flat-ctas-ig */", block + "\n/* tchilo-flat-ctas-ig */", 1)
    elif "/* tchilo-flat-all-v2 */" in html:
        html = html.replace("/* tchilo-flat-all-v2 */", block + "\n/* tchilo-flat-all-v2 */", 1)
    else:
        html = html.replace("</style>", block + "\n</style>", 1)
    print("injected v3")
if html != orig:
    p.write_text(html, encoding="utf-8")
    print("index ok")
else:
    print("index same")
