#!/usr/bin/env python3
"""Flatten yellow CTAs and thick borders everywhere."""
from pathlib import Path
import re

def flat(t):
    t = re.sub(r'border:\s*3px solid[^;"\'}]*', 'border:0', t)
    t = re.sub(r'border:\s*2\.5px solid[^;"\'}]*', 'border:0', t)
    t = t.replace('background:#c8f560', 'background:#0B0B0C;color:#fff')
    t = t.replace('background:#C8F560', 'background:#0B0B0C;color:#fff')
    t = t.replace('background:#FFE566', 'background:transparent')
    t = t.replace('background:#ffe566', 'background:transparent')
    t = t.replace('background:var(--yellow)}', 'background:var(--ink);color:#fff}')
    t = t.replace('background:var(--yellow)', 'background:var(--ink);color:#fff')
    t = t.replace('background:var(--yellow,#C8F560)', 'background:var(--ink,#0B0B0C);color:#fff')
    return t

for rel in ['native/tchilo-ads-pro.js','native/tchilo-ads.js','native/tchilo-ads-ui.js','native/tchilo-verified.js','native/tchilo-premium.js','native/paddle-premium.js','native/tchilo-support.js','native/tchilo-profile-share.js','native/tchilo-create-buttons.js']:
    p = Path(rel)
    if p.exists():
        t = p.read_text(encoding='utf-8', errors='replace')
        t2 = flat(t)
        if t2 != t:
            p.write_text(t2, encoding='utf-8')
            print('flat', rel)
        else:
            print('ok', rel)

p = Path('index.html')
if p.exists():
    h = p.read_text(encoding='utf-8', errors='replace')
    o = h
    h = h.replace('#tchiloModalHost .tm-actions > button.tm-primary{background:var(--yellow)}', '#tchiloModalHost .tm-actions > button.tm-primary{background:var(--ink);color:#fff}')
    h = h.replace('.saved-tab.active{background:var(--yellow)}', '.saved-tab.active{background:var(--ink);color:#fff}')
    h = h.replace('.notif-tab.active{ background:var(--yellow); }', '.notif-tab.active{ background:var(--ink);color:#fff; }')
    block = '''
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
'''
    if '/* tchilo-flat-all-v3 */' not in h:
        if '/* tchilo-flat-ctas-ig */' in h:
            h = h.replace('/* tchilo-flat-ctas-ig */', block + '\n/* tchilo-flat-ctas-ig */', 1)
        else:
            h = h.replace('</style>', block + '\n</style>', 1)
        print('injected v3')
    if h != o:
        p.write_text(h, encoding='utf-8')
        print('index written')
    else:
        print('index same')
print('done')
