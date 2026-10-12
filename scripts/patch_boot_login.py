#!/usr/bin/env python3
"""Desativa overrides de login/criar conta — usa apenas o fluxo do index."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
orig = html
changed = []

# 1) Remover hijack: Criar conta NÃO deve abrir #tsu — usa signupPanel do index
old_hijack = (
    "  if (panel === 'signup' && typeof window.tsuOpen === 'function') "
    "{ try { window.tsuOpen(); } catch(e) { console.error(e); } return; }\n"
)
if old_hijack in html:
    html = html.replace(old_hijack, "  /* tsuOpen desativado — Criar conta usa signupPanel do index */\n", 1)
    changed.append("no-tsu-hijack")
else:
    html2, n = re.subn(
        r"if\s*\(\s*panel\s*===\s*['\"]signup['\"]\s*&&\s*typeof\s+window\.tsuOpen\s*===\s*['\"]function['\"]\s*\)\s*\{\s*try\s*\{\s*window\.tsuOpen\(\);\s*\}\s*catch\s*\(e\)\s*\{\s*console\.error\(e\);\s*\}\s*return;\s*\}",
        "/* tsuOpen desativado — Criar conta usa signupPanel do index */",
        html,
        count=1,
    )
    if n:
        html = html2
        changed.append("no-tsu-hijack-re")

# 2) Neutralizar window.tsuOpen
if "window.tsuOpen=function" in html and "__tchiloTsuDisabled" not in html:
    html = html.replace(
        "window.tsuOpen=function",
        "window.tsuOpen=function(){/* desativado: usa index */try{if(typeof showLoginPanel==='function')showLoginPanel('signup');}catch(e){}return;};window.__tchiloTsuDisabled=true;window.__tsuOpenDead=function",
        1,
    )
    changed.append("tsuOpen-noop")

# 3) Remover tags de scripts nativos de override de login
for src in [
    "native/tchilo-login-session-fix.js",
    "native/tchilo-login-gate-fix.js",
    "native/tchilo-login-click-fix.js",
    "native/tchilo-boot-login-fix.js",
]:
    pat = rf"<script[^>]*src=[\"'][^\"']*{re.escape(src)}[^\"']*[\"'][^>]*>\s*</script>\s*"
    html2, n = re.subn(pat, "", html, flags=re.I)
    if n:
        html = html2
        changed.append("rm-" + src.split("/")[-1])

if html == orig:
    print("NO_CHANGES")
else:
    p.write_text(html, encoding="utf-8")
    print("CHANGED:", ",".join(changed))
    print("SIZE:", len(html))
