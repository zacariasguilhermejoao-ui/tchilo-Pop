#!/usr/bin/env python3
"""Profile: keep only Live + Nova publicação; move edit/settings to ⋯ menu."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

old = """        : ('<button class="profile-btn" onclick="goTo(\'editprofile\')">Editar perfil</button>' +
           '<button class="profile-btn" onclick="goTo(\'create\')">Nova publicação</button>' +
           '<button class="profile-btn" onclick="goTo(\'settings\')">Definições</button>')"""

new = """        : ('<button class="profile-btn" onclick="goTo(\'create\')">Nova publicação</button>')"""

if old in html:
    html = html.replace(old, new, 1)
    changed = True
    print("profile actions updated")
elif "goTo('editprofile')">Editar perfil" in html or 'goTo(\'editprofile\')">Editar perfil' in html:
    # alternate escape styles
    import re
    pat = re.compile(
        r": \('\s*<button class=\"profile-btn\" onclick=\"goTo\(\\'editprofile\\'\)\"[^>]*>Editar perfil</button>'\s*\+\s*"
        r"'\s*<button class=\"profile-btn\" onclick=\"goTo\(\\'create\\'\)\"[^>]*>Nova publicação</button>'\s*\+\s*"
        r"'\s*<button class=\"profile-btn\" onclick=\"goTo\(\\'settings\\'\)\"[^>]*>Definições</button>'\s*\)",
        re.S,
    )
    m = pat.search(html)
    if m:
        html = html[: m.start()] + ": ('<button class=\"profile-btn\" onclick=\"goTo(\\'create\\')\">Nova publicação</button>')" + html[m.end() :]
        changed = True
        print("profile actions regex")
    else:
        print("MISS profile actions block")
        i = html.find("Editar perfil</button>")
        if i > 0:
            print(repr(html[i - 120 : i + 200]))
else:
    if "Editar perfil</button>" not in html or "profile-actions" in html and "Editar perfil" not in html[html.find("profile-actions") : html.find("profile-actions") + 800]:
        print("already clean or different structure")
    else:
        print("MISS")
        i = html.find("Editar perfil</button>")
        print(repr(html[max(0, i - 150) : i + 250]))

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE index.html")
else:
    print("no index change")
