#!/usr/bin/env python3
"""Put Premium, Verified, Ads settings items in index HTML (no late inject flash)."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

premium_btn = '''      <button class="settings-item" type="button" id="settings-premium-item" onclick="typeof tchiloOpenPremium==='function'&&tchiloOpenPremium()">
        <div class="si-icon" style="background:var(--yellow,#C8F560)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 6.5L21 10l-5 4.2L17.5 21 12 17.5 6.5 21 8 14.2 3 10l6.5-.5L12 3z"/></svg>
        </div>
        <span>Tchilo Premium</span>
        <div class="chev">›</div>
      </button>
'''

verified_btn = '''      <button class="settings-item" type="button" id="settings-verified-item" onclick="typeof tchiloOpenVerified==='function'&&tchiloOpenVerified()">
        <div class="si-icon" style="background:#1D9BF0;color:#fff">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1D9BF0"/><path d="M7.5 12.2l2.8 2.8 6.2-6.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span>Selo verificado</span>
        <div class="chev">›</div>
      </button>
'''

ads_btn = '''      <button class="settings-item" type="button" id="tchiloAdsMgrBtn" onclick="typeof tchiloOpenAdsManager==='function'&&tchiloOpenAdsManager()">
        <div class="si-icon" style="background:#c8f560">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>
        </div>
        <span>Meus Anúncios</span>
        <div class="chev">›</div>
      </button>
'''

# Insert after <div class="settings-list"> of main settings screen only
marker = '<div class="screen" id="screen-settings">'
idx = html.find(marker)
if idx < 0:
    print('no settings screen')
else:
    list_start = html.find('<div class="settings-list">', idx)
    if list_start < 0:
        print('no list')
    else:
        insert_at = html.find('>', list_start) + 1
        block = ''
        if 'id="settings-premium-item"' not in html[idx:idx+4000]:
            block += '\n' + premium_btn
            print('add premium')
        if 'id="settings-verified-item"' not in html[idx:idx+4000]:
            block += verified_btn
            print('add verified')
        if 'id="tchiloAdsMgrBtn"' not in html[idx:idx+5000]:
            block += ads_btn
            print('add ads')
        if block:
            html = html[:insert_at] + block + html[insert_at:]
            changed = True

# Fallback onclick names - premium may export differently
if 'window.tchiloOpenPremium' not in html and 'tchiloOpenPremium' in html:
    pass

if changed:
    p.write_text(html, encoding='utf-8')
    print('WROTE')
else:
    print('no change or already present')
