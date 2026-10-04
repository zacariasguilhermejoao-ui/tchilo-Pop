#!/usr/bin/env python3
"""Inline professional copy + load copy-ux-refresh.js"""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

replacements = [
    (
        "Não vendemos os teus dados. Em versões futuras com servidor, o conteúdo público do perfil e posts pode ser visível a outros utilizadores.",
        "Não vendemos os teus dados. O conteúdo que defines como público (perfil e publicações) pode ser visto por outros utilizadores do Tchilo.",
    ),
    (
        "Nesta demo, tudo permanece no browser. Podes apagar os dados limpando o armazenamento do site ou terminando sessão e removendo dados do browser.",
        "Os dados da conta e o conteúdo principal ficam associados à tua sessão e sincronizam de forma segura. Podes eliminar a conta ou o conteúdo nas definições, ou contactar privacidade@tchilopop.com.",
    ),
    (
        "Para eliminar a conta nesta demo, limpa os dados do browser ou contacta o suporte.",
        "Para eliminar a conta, usa as definições ou contacta suporte@tchilopop.com.",
    ),
    (
        "Usamos localStorage para sessão, posts e preferências. Não usamos cookies de tracking de terceiros nesta versão.",
        "Usamos armazenamento no dispositivo para manter a sessão e as tuas preferências. Não usamos cookies de publicidade de terceiros para te seguir noutros sites.",
    ),
    (
        "A app é fornecida “tal como está”. Não garantimos disponibilidade ininterrupta. Não somos responsáveis por danos indiretos resultantes do uso da plataforma.",
        "Fazemos o possível para manter o Tchilo estável e disponível. Na medida permitida por lei, a responsabilidade por danos indiretos está limitada.",
    ),
    (
        "As tuas conversas aparecerão aqui quando pessoas reais te enviarem mensagens.",
        "Quando alguém te enviar uma mensagem, a conversa aparece aqui.",
    ),
    (
        "As notificações aparecerão aqui quando houver atividade real na tua conta.",
        "Likes, comentários e novos seguidores aparecem aqui.",
    ),
    (
        'placeholder="Escreve a legenda… usa #hashtags"',
        'placeholder="Escreve uma legenda…"',
    ),
    (
        'placeholder="Texto grande (ex: EPIC NIGHT)"',
        'placeholder="Título (opcional)"',
    ),
    (
        'placeholder="Texto grande (ex: BOA VIBE)"',
        'placeholder="Título (opcional)"',
    ),
    (
        'placeholder="Escreve algo para o teu Story…"',
        'placeholder="O que queres partilhar?"',
    ),
    (
        'placeholder="Procurar pessoas, tags ou posts…"',
        'placeholder="Pesquisar"',
    ),
    (
        'placeholder="Escreve um comentário…"',
        'placeholder="Adiciona um comentário…"',
    ),
    (
        'placeholder="Mensagem…"',
        'placeholder="Mensagem"',
    ),
    (
        'placeholder="Como apareces no perfil"',
        'placeholder="Nome de apresentação"',
    ),
    (
        'placeholder="Conta algo sobre ti"',
        'placeholder="Bio"',
    ),
    (
        'placeholder="ex: Lisboa"',
        'placeholder="Cidade"',
    ),
]

for a, b in replacements:
    if a in html:
        html = html.replace(a, b)
        changed = True
        print("ok:", a[:48])

if 'copy-ux-refresh.js' not in html:
    anchor = '<script src="native/sheets-full-fix.js'
    if anchor in html:
        html = html.replace(
            '<script src="native/sheets-full-fix.js?v=1"></script>',
            '<script src="native/sheets-full-fix.js?v=1"></script>\n<script src="native/copy-ux-refresh.js?v=1"></script>',
            1,
        )
        changed = True
        print("script tag")
    else:
        # try without version
        if 'sheets-full-fix.js' in html:
            import re

            html2, n = re.subn(
                r'(<script src="native/sheets-full-fix\.js[^"]*"></script>)',
                r'\1\n<script src="native/copy-ux-refresh.js?v=1"></script>',
                html,
                count=1,
            )
            if n:
                html = html2
                changed = True
                print("script tag re")

if changed:
    p.write_text(html, encoding="utf-8")
    print("WROTE")
else:
    print("no changes")
