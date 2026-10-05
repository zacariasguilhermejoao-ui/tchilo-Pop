#!/usr/bin/env python3
"""Insert Premium, Verified, Ads into settings list — unique string replace."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

if 'id="settings-premium-item"' in html and 'id="settings-verified-item"' in html:
    print("already present")
    raise SystemExit(0)

block = r'''    <div class="settings-list">
      <button class="settings-item" type="button" id="settings-premium-item" onclick="typeof tchiloOpenPremium==='function'&&tchiloOpenPremium()">
        <div class="si-icon" style="background:var(--yellow,#C8F560)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.5 6.5L21 10l-5 4.2L17.5 21 12 17.5 6.5 21 8 14.2 3 10l6.5-.5L12 3z"/></svg>
        </div>
        <span>Tchilo Premium</span>
        <div class="chev">›</div>
      </button>
      <button class="settings-item" type="button" id="settings-verified-item" onclick="typeof tchiloOpenVerified==='function'&&tchiloOpenVerified()">
        <div class="si-icon" style="background:#1D9BF0;color:#fff">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1D9BF0"/><path d="M7.5 12.2l2.8 2.8 6.2-6.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span>Selo verificado</span>
        <div class="chev">›</div>
      </button>
      <button class="settings-item" type="button" id="tchiloAdsMgrBtn" onclick="typeof tchiloOpenAdsManager==='function'&&tchiloOpenAdsManager()">
        <div class="si-icon" style="background:#c8f560">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>
        </div>
        <span>Meus Anúncios</span>
        <div class="chev">›</div>
      </button>
      <button class="settings-item" type="button" onclick="openSettingsGroup('account')">'''

# Unique: Definições header then settings-list then Conta
old = r'''    <div class="settings-list">
      <button class="settings-item" type="button" onclick="openSettingsGroup('account')">'''

# Only replace the first occurrence after Definições
pos = html.find("<h1>Definições</h1>")
if pos < 0:
    print("no Definições h1")
    raise SystemExit(1)

sub = html[pos:]
if old not in sub:
    print("old block not found after Definições")
    raise SystemExit(1)

# replace only within the settings section (first match after Definições)
new_sub = sub.replace(old, block, 1)
html = html[:pos] + new_sub
p.write_text(html, encoding="utf-8")
print("WROTE")
print("premium", html.count('id="settings-premium-item"'))
print("verified", html.count('id="settings-verified-item"'))
print("ads", html.count('id="tchiloAdsMgrBtn"'))
