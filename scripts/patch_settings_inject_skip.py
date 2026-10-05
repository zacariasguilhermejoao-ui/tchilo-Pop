#!/usr/bin/env python3
"""Make verified/premium/ads inject skip DOM rebuild when static items exist."""
from pathlib import Path

# Patch native files to bind only

def patch_verified():
    p = Path('native/tchilo-verified.js')
    if not p.exists():
        return
    s = p.read_text(encoding='utf-8')
    old = """  function injectSettings() {
    var list = document.querySelector('#screen-settings .settings-list');
    if (!list || document.getElementById('settings-verified-item')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-item';
    btn.id = 'settings-verified-item';
    btn.innerHTML =
      '<div class="si-icon" style="background:#1D9BF0;color:#fff">' +
      badgeSvg(18) +
      '</div><span>Selo verificado</span><div class="chev">›</div>';
    btn.onclick = function (e) {
      e.preventDefault();
      openVerifiedSheet();
    };
    var prem = document.getElementById('settings-premium-item');
    if (prem && prem.parentNode) prem.parentNode.insertBefore(btn, prem.nextSibling);
    else if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);
  }"""
    new = """  function injectSettings() {
    var btn = document.getElementById('settings-verified-item');
    if (btn) {
      if (!btn.__tchiloBound) {
        btn.__tchiloBound = true;
        btn.onclick = function (e) {
          e.preventDefault();
          openVerifiedSheet();
        };
      }
      return;
    }
    var list = document.querySelector('#screen-settings .settings-list');
    if (!list) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-item';
    btn.id = 'settings-verified-item';
    btn.innerHTML =
      '<div class="si-icon" style="background:#1D9BF0;color:#fff">' +
      badgeSvg(18) +
      '</div><span>Selo verificado</span><div class="chev">›</div>';
    btn.__tchiloBound = true;
    btn.onclick = function (e) {
      e.preventDefault();
      openVerifiedSheet();
    };
    var prem = document.getElementById('settings-premium-item');
    if (prem && prem.parentNode) prem.parentNode.insertBefore(btn, prem.nextSibling);
    else if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);
  }"""
    if old in s:
        p.write_text(s.replace(old, new), encoding='utf-8')
        print('verified inject patched')
    elif 'btn.__tchiloBound' in s:
        print('verified already')
    else:
        print('verified pattern miss')


def patch_premium():
    p = Path('native/tchilo-premium.js')
    if not p.exists():
        return
    s = p.read_text(encoding='utf-8')
    if 'btn.__tchiloBound' in s:
        print('premium already')
        return
    # softer: if settings-premium-item exists, just bind
    needle = 'function injectSettingsItem()'
    if needle not in s:
        print('premium no inject')
        return
    # prepend early return style by replacing start of function body
    import re
    m = re.search(r'function injectSettingsItem\(\) \{[^\n]*\n', s)
    if not m:
        print('premium no match')
        return
    insert = (
        "function injectSettingsItem() {\n"
        "    var existing = document.getElementById('settings-premium-item');\n"
        "    if (existing) {\n"
        "      if (!existing.__tchiloBound) {\n"
        "        existing.__tchiloBound = true;\n"
        "        existing.addEventListener('click', function (e) {\n"
        "          e.preventDefault();\n"
        "          openPremiumSheet();\n"
        "        });\n"
        "      }\n"
        "      window.tchiloOpenPremium = openPremiumSheet;\n"
        "      return;\n"
        "    }\n"
    )
    s2 = s[: m.start()] + insert + s[m.end() :]
    # ensure global export
    if 'window.tchiloOpenPremium' not in s2:
        s2 = s2.replace(
            'function openPremiumSheet()',
            'window.tchiloOpenPremium = openPremiumSheet;\n  function openPremiumSheet()',
            1,
        )
    p.write_text(s2, encoding='utf-8')
    print('premium inject patched')


def patch_ads():
    p = Path('native/tchilo-ads-ui.js')
    if not p.exists():
        return
    s = p.read_text(encoding='utf-8')
    if 'btn.__tchiloBound' in s or 'already static' in s:
        print('ads already')
        return
    old = '''  function injectSettings() {
    if (document.getElementById("tchiloAdsMgrBtn")) return;
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloAdsMgrBtn";
    btn.className = "settings-item";
    btn.innerHTML =
      '<div class="si-icon">A</div><span>Meus Anúncios</span><div class="chev">›</div>';'''
    new = '''  function injectSettings() {
    var btn = document.getElementById("tchiloAdsMgrBtn");
    if (btn) {
      if (!btn.__tchiloBound) {
        btn.__tchiloBound = true;
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (typeof window.tchiloOpenAdsManager === "function") window.tchiloOpenAdsManager();
        });
      }
      return;
    }
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;
    btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloAdsMgrBtn";
    btn.className = "settings-item";
    btn.innerHTML =
      '<div class="si-icon" style="background:#c8f560"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg></div><span>Meus Anúncios</span><div class="chev">›</div>';'''
    if old in s:
        p.write_text(s.replace(old, new), encoding='utf-8')
        print('ads inject patched')
    else:
        print('ads pattern miss')


patch_verified()
patch_premium()
patch_ads()
print('done')
