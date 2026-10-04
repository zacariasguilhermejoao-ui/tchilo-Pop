#!/usr/bin/env python3
"""Profile: only Nova publicação (+ Live injected); edit/settings move to ⋯."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

old = (
    ": ('<button class=\"profile-btn\" onclick=\"goTo(\\'editprofile\\')\">Editar perfil</button>' +\n"
    "           '<button class=\"profile-btn\" onclick=\"goTo(\\'create\\')\">Nova publicação</button>' +\n"
    "           '<button class=\"profile-btn\" onclick=\"goTo(\\'settings\\')\">Definições</button>')"
)
new = (
    ": ('<button class=\"profile-btn\" onclick=\"goTo(\\'create\\')\">Nova publicação</button>')"
)

if old in html:
    html = html.replace(old, new, 1)
    p.write_text(html, encoding="utf-8")
    print("WROTE index.html")
else:
    a = html.find("goTo(\\'editprofile\\')\">Editar perfil</button>")
    b = html.find("goTo(\\'settings\\')\">Definições</button>')")
    if a > 0 and b > a:
        start = html.rfind(": ('<button", 0, a)
        end = b + len("goTo(\\'settings\\')\">Definições</button>')")
        if start > 0:
            html = html[:start] + new + html[end:]
            p.write_text(html, encoding="utf-8")
            print("WROTE index.html (range)")
        else:
            print("MISS start")
    else:
        print("already done or missing", a, b)
