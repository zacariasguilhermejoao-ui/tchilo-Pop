#!/usr/bin/env python3
"""Unified professional + button for story, nav create, and chat attach."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

PLUS_SVG = (
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" '
    'stroke="currentColor" stroke-width="2.8" stroke-linecap="round">'
    '<path d="M12 5v14M5 12h14"/></svg>'
)

# Shared professional plus styles
pro_css = '''
  /* ── Tchilo + profissional (story / postar / mensagem) ── */
  .story-card-plus,
  .nav-post,
  .chat-attach-btn,
  #chatAttachBtn{
    width:52px;
    height:52px;
    min-width:52px;
    min-height:52px;
    border-radius:16px;
    border:3px solid var(--ink,#0B0B0C);
    background:var(--yellow,#C8F560);
    color:var(--ink,#0B0B0C);
    box-shadow:3px 3px 0 var(--ink,#0B0B0C);
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    padding:0;
    margin:0;
    flex-shrink:0;
    font-size:0;
    line-height:0;
    -webkit-tap-highlight-color:transparent;
    transition:transform .12s ease, box-shadow .12s ease;
  }
  .story-card-plus svg,
  .nav-post svg,
  .chat-attach-btn svg,
  #chatAttachBtn svg{
    width:24px;
    height:24px;
    display:block;
    pointer-events:none;
  }
  .story-card-plus:active,
  .nav-post:active,
  .chat-attach-btn:active,
  #chatAttachBtn:active{
    transform:translate(2px,2px);
    box-shadow:1px 1px 0 var(--ink,#0B0B0C);
  }
  /* story card: slightly larger presence */
  .story-card-plus{
    width:56px;
    height:56px;
    min-width:56px;
    min-height:56px;
    border-radius:18px;
  }
  .story-card-plus svg{ width:26px; height:26px; }
  /* chat: fit input bar */
  .chat-attach-btn,
  #chatAttachBtn{
    width:46px;
    height:46px;
    min-width:46px;
    min-height:46px;
    border-radius:14px;
  }
  .chat-attach-btn svg,
  #chatAttachBtn svg{ width:22px; height:22px; }
  .chat-attach-btn::before,
  #chatAttachBtn::before{ content:none!important; display:none!important; }
  .nav-post{
    width:52px;
    height:52px;
    border-radius:16px;
    font-family:inherit;
  }
'''

# Remove previous pro block if any
html = re.sub(
    r'/\* ── Tchilo \+ profissional[\s\S]*?\.nav-post\{[\s\S]*?\}\n',
    '',
    html,
    count=1,
)

# Inject after .story-card-plus old block — replace old rules
old_story = re.compile(
    r'  \.story-card-plus\{[\s\S]*?\}\n'
    r'  \.story-card-create-inner > span:last-child\{[\s\S]*?\}\n',
    re.M,
)

def story_repl(m):
    return pro_css + '  .story-card-create-inner > span:last-child{\n    font-size:12px; font-weight:800; color:var(--ink);\n  }\n'

if old_story.search(html):
    html = old_story.sub(story_repl, html, count=1)
    print('story css replaced')
else:
    # inject before .navbar or in head style
    if 'Tchilo + profissional' not in html:
        html = html.replace('  .nav-post{', pro_css + '  .nav-post{', 1)
        print('pro css inserted before nav-post')

# Neutralize conflicting .nav-post and .chat-attach-btn blocks (keep structure, override via pro)
# Update nav HTML to use SVG
old_nav = '<button class="nav-post" onclick="goTo(\'create\')">+</button>'
new_nav = (
    '<button class="nav-post" type="button" onclick="goTo(\'create\')" '
    'aria-label="Nova publicação">' + PLUS_SVG + '</button>'
)
if old_nav in html:
    html = html.replace(old_nav, new_nav)
    print('nav html svg')
elif 'class="nav-post"' in html and 'nav-post" type="button"' not in html:
    html2, n = re.subn(
        r'<button class="nav-post"[^>]*>\+</button>',
        new_nav,
        html,
        count=1,
    )
    if n:
        html = html2
        print('nav html re')

# Story card plus HTML
old_sp = '<div class="story-card-plus">+</div>'
new_sp = '<div class="story-card-plus" aria-hidden="true">' + PLUS_SVG + '</div>'
if old_sp in html:
    html = html.replace(old_sp, new_sp)
    print('story plus html')

# JS that rebuilds story create card
old_js = "createEl.innerHTML='<div class=\"story-card-create-inner\"><div class=\"story-card-plus\">+</div><span>Criar story</span></div>';"
new_js = (
    "createEl.innerHTML='<div class=\"story-card-create-inner\"><div class=\"story-card-plus\" aria-hidden=\"true\">"
    + PLUS_SVG.replace("'", "\\'")
    + "</div><span>Criar story</span></div>';"
)
# simpler replace
if 'story-card-plus\">+</div>' in html or "story-card-plus\">+</div>" in html:
    html = html.replace(
        '<div class=\"story-card-plus\">+</div>',
        '<div class=\"story-card-plus\" aria-hidden=\"true\">' + PLUS_SVG + '</div>',
    )
    print('js story plus')

# Chat attach button: ensure has SVG not empty
old_chat = (
    '<button type="button" class="chat-attach-btn" id="chatAttachBtn" '
    'onclick="openChatAttachMenu()" aria-label="Anexar" title="Anexar"></button>'
)
new_chat = (
    '<button type="button" class="chat-attach-btn" id="chatAttachBtn" '
    'onclick="openChatAttachMenu()" aria-label="Anexar" title="Anexar">'
    + PLUS_SVG
    + '</button>'
)
if old_chat in html:
    html = html.replace(old_chat, new_chat)
    print('chat html svg')
else:
    html2, n = re.subn(
        r'<button type="button" class="chat-attach-btn" id="chatAttachBtn"[^>]*></button>',
        new_chat,
        html,
        count=1,
    )
    if n:
        html = html2
        print('chat html re')

# Override chat-attach CSS that uses ::before icon
html = re.sub(
    r'  \.chat-attach-btn\{[\s\S]*?\}\n  \.chat-attach-btn::before\{[\s\S]*?\}\n  \.chat-attach-btn:active\{[\s\S]*?\}\n',
    '  /* chat-attach-btn styles unified in Tchilo + profissional */\n',
    html,
    count=1,
)

# Override old nav-post size rules partially - the pro_css already sets
html = re.sub(
    r'  \.nav-post\{\n    width:44px; height:44px;[\s\S]*?cursor:pointer;\n  \}\n',
    '  /* nav-post unified in Tchilo + profissional */\n',
    html,
    count=1,
)

p.write_text(html, encoding='utf-8')
print('DONE')
print('pro', 'Tchilo + profissional' in html)
print('nav svg', 'nav-post' in html and 'M12 5v14' in html)
