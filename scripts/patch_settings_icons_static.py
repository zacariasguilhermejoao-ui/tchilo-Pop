#!/usr/bin/env python3
"""Force Premium, Verified, Ads into main settings list in index.html."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

premium_btn = (
    '      <button class="settings-item" type="button" id="settings-premium-item" '
    'onclick="typeof tchiloOpenPremium===\'function\'&&tchiloOpenPremium()">\n'
    '        <div class="si-icon" style="background:var(--yellow,#C8F560)">\n'
    '          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" '
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M12 3l2.5 6.5L21 10l-5 4.2L17.5 21 12 17.5 6.5 21 8 14.2 3 10l6.5-.5L12 3z"/></svg>\n'
    '        </div>\n'
    '        <span>Tchilo Premium</span>\n'
    '        <div class="chev">›</div>\n'
    '      </button>\n'
)

verified_btn = (
    '      <button class="settings-item" type="button" id="settings-verified-item" '
    'onclick="typeof tchiloOpenVerified===\'function\'&&tchiloOpenVerified()">\n'
    '        <div class="si-icon" style="background:#1D9BF0;color:#fff">\n'
    '          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">'
    '<circle cx="12" cy="12" r="11" fill="#1D9BF0"/>'
    '<path d="M7.5 12.2l2.8 2.8 6.2-6.4" fill="none" stroke="#fff" stroke-width="2.4" '
    'stroke-linecap="round" stroke-linejoin="round"/></svg>\n'
    '        </div>\n'
    '        <span>Selo verificado</span>\n'
    '        <div class="chev">›</div>\n'
    '      </button>\n'
)

ads_btn = (
    '      <button class="settings-item" type="button" id="tchiloAdsMgrBtn" '
    'onclick="typeof tchiloOpenAdsManager===\'function\'&&tchiloOpenAdsManager()">\n'
    '        <div class="si-icon" style="background:#c8f560">\n'
    '          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" '
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/>'
    '<path d="M16 8.5a4.5 4.5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>\n'
    '        </div>\n'
    '        <span>Meus Anúncios</span>\n'
    '        <div class="chev">›</div>\n'
    '      </button>\n'
)

# Remove any previous static copies to avoid duplicates
for _id in ("settings-premium-item", "settings-verified-item", "tchiloAdsMgrBtn"):
    html = re.sub(
        rf'\s*<button class="settings-item"[^>]*id="{_id}"[\s\S]*?</button>\s*',
        '\n',
        html,
        count=3,
    )

# Find the main settings list: after screen-settings header, first settings-list
m = re.search(
    r'(id="screen-settings"[\s\S]{0,800}?<div class="settings-list">)',
    html,
)
if not m:
    print("FAIL: settings list not found")
    raise SystemExit(1)

insert_pos = m.end()
block = "\n" + premium_btn + verified_btn + ads_btn
html = html[:insert_pos] + block + html[insert_pos:]
p.write_text(html, encoding="utf-8")
print("WROTE static settings icons")
print("premium", "settings-premium-item" in html)
print("verified", "settings-verified-item" in html)
print("ads", "tchiloAdsMgrBtn" in html)
