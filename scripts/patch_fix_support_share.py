#!/usr/bin/env python3
"""Fix support settings icon + profile-share opt icons to mono IG style."""
from pathlib import Path
import re
import urllib.request
import ssl

ctx = ssl.create_default_context()

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "tchilo-patch"})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")

# --- support.js ---
p = Path("native/tchilo-support.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
else:
    t = fetch("https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/main/native/tchilo-support.js")

orig = t
t = t.replace(
    '<div class="si-icon" style="background:#c8f560;font:900 14px Inter,sans-serif;display:flex;align-items:center;justify-content:center">?</div>',
    '<div class="si-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/></svg></div>',
)
t = re.sub(
    r'<span class="ico" style="background:#[0-9a-fA-F]+">',
    '<span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">',
    t,
)
if t != orig:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(t, encoding="utf-8")
    print("support updated")
else:
    print("support already ok or pattern miss")

# --- profile-share.js ---
p = Path("native/tchilo-profile-share.js")
if p.exists():
    t = p.read_text(encoding="utf-8", errors="replace")
else:
    t = fetch("https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/main/native/tchilo-profile-share.js")

orig = t
t2, c = re.subn(
    r"#tchiloProfileShareSheet \.opt\{[^}]+\}",
    "#tchiloProfileShareSheet .opt{"
    "display:flex;align-items:center;gap:14px;width:100%;"
    "padding:14px 4px;margin:0;"
    "border:0;border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;"
    "background:transparent;box-shadow:none;text-align:left;"
    "font:400 16px system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;"
    "color:var(--ink,#0B0B0C);cursor:pointer;}",
    t, count=1,
)
print("opt", c)
t = t2
t2, c = re.subn(
    r"#tchiloProfileShareSheet \.opt \.ic\{[^}]+\}",
    "#tchiloProfileShareSheet .opt .ic{"
    "display:inline-flex;align-items:center;justify-content:center;"
    "width:24px;height:24px;min-width:24px;border-radius:0;"
    "border:0;background:transparent;color:var(--ink,#0B0B0C);}",
    t, count=1,
)
print("ic", c)
t = t2
t2, c = re.subn(
    r"#tchiloProfileShareSheet \.opt\.opt-close\{[^}]+\}",
    "#tchiloProfileShareSheet .opt.opt-close{background:transparent;}",
    t, count=1,
)
print("close", c)
t = t2
t2, c = re.subn(
    r"(#tchiloProfileShareSheet \.tchilo-ps-panel\{[^}]*?)border:3px solid var\(--ink,#0B0B0C\)!important;border-bottom:none!important;",
    r"\1border:0!important;border-top:0.5px solid rgba(11,11,12,.12)!important;",
    t, count=1,
)
print("panel", c)
t = t2
if t != orig:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(t, encoding="utf-8")
    print("profile-share updated")
else:
    print("profile-share unchanged")
