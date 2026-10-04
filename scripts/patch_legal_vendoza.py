#!/usr/bin/env python3
"""Update in-app legal screens in index.html with VENDOZA."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False
VENDOZA = "VENDOZA - COMÉRCIO GERAL E PRESTAÇÃO DE SERVIÇOS, LDA"

old_t = "<p>Ao criar uma conta e utilizar esta aplicação, aceitas estes Termos de Uso na totalidade. Se não concordares, não utilizes a app.</p>"
new_t = (
    f"<p>O serviço <strong>Tchilo</strong> (tchilopop.com e aplicações móveis) é operado por "
    f"<strong>{VENDOZA}</strong>. Ao criar uma conta e utilizar esta aplicação, aceitas estes "
    f"Termos de Uso na totalidade. Se não concordares, não utilizes a app.</p>"
)
if old_t in html:
    html = html.replace(old_t, new_t, 1)
    changed = True
    print("terms body")

old_c = "<p>Para questões sobre estes termos: suporte@app.local</p>"
new_c = (
    f"<p>Entidade: <strong>{VENDOZA}</strong><br>"
    f"Suporte: suporte@tchilopop.com<br>"
    f"Privacidade: privacidade@tchilopop.com</p>"
)
if old_c in html:
    html = html.replace(old_c, new_c, 1)
    changed = True
    print("terms contact")

old_p = "<p>Privacidade: privacidade@app.local</p>"
new_p = (
    f"<p>Entidade: <strong>{VENDOZA}</strong><br>"
    f"Privacidade: privacidade@tchilopop.com<br>"
    f"Suporte: suporte@tchilopop.com</p>"
)
if old_p in html:
    html = html.replace(old_p, new_p, 1)
    changed = True
    print("privacy contact")

old_pi = "<p>Recolhemos os dados que nos forneces no registo (nome de utilizador, email) e o conteúdo que publicas (posts, comentários, mensagens). Nesta versão de demonstração, os dados ficam guardados localmente no teu dispositivo (localStorage).</p>"
new_pi = (
    f"<p>O <strong>Tchilo</strong> é operado por <strong>{VENDOZA}</strong>. "
    f"Recolhemos os dados que nos forneces no registo (nome de utilizador, email) e o conteúdo que publicas "
    f"(posts, comentários, mensagens), armazenados de forma segura na nuvem associada à tua conta.</p>"
)
if old_pi in html:
    html = html.replace(old_pi, new_pi, 1)
    changed = True
    print("privacy intro")

old_a = "<p>Protótipo web com feed, stories, reels, mensagens, explorar e definições completas.</p>"
new_a = (
    f"<p><strong>Tchilo</strong> é a rede social operada por <strong>{VENDOZA}</strong> — "
    f"feed, stories, reels, mensagens e mais. Site: tchilopop.com</p>"
)
if old_a in html:
    html = html.replace(old_a, new_a, 1)
    changed = True
    print("about")

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE index.html")
else:
    print("no index changes")
