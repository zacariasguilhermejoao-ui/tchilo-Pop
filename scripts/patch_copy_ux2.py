#!/usr/bin/env python3
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False
pairs = [
    (
        "Contacto: safety@app.local",
        "Contacto: safety@tchilopop.com",
    ),
    (
        "Utilizamos moderação manual e, em versões futuras, ferramentas automatizadas para detetar e bloquear conteúdo proibido. Tentativas de contornar estas regras resultam em banimento permanente.",
        "Combinamos revisão humana com ferramentas automáticas para detetar e remover conteúdo proibido. Contornar estas regras pode resultar em banimento permanente.",
    ),
    (
        "A app não se destina a menores de 13 anos. Não recolhemos intencionalmente dados de crianças abaixo dessa idade.",
        "O Tchilo não se destina a menores de 13 anos. Não recolhemos intencionalmente dados de crianças abaixo dessa idade.",
    ),
]
for a, b in pairs:
    if a in html:
        html = html.replace(a, b)
        changed = True
        print("ok", a[:40])
if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("none")
