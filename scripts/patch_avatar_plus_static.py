#!/usr/bin/env python3
from pathlib import Path

p = Path('index.html')
html = p.read_text(encoding='utf-8', errors='replace')

# Unique short anchors
a = ";overflow:hidden;position:relative\">' + avatarHtml + '</div>' +"
b = ";overflow:visible;position:relative\">' + avatarHtml + (isOther ? '' : '<button type=\"button\" id=\"tchiloProfileAvatarPlus\" class=\"tchilo-av-add\" aria-label=\"Adicionar foto\" onclick=\"event.preventDefault();event.stopPropagation();var i=document.getElementById(\\'editAvatarInput\\');if(i){i.value=\\'\\';i.click();}else if(typeof goTo===\\'function\\')goTo(\\'editprofile\\');\"><svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.8\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg></button>') + '</div>' +"

print('anchor a', a in html)
print('already b', 'overflow:visible;position:relative' in html and 'tchiloProfileAvatarPlus' in html)

if a in html and 'tchiloProfileAvatarPlus\" class=\"tchilo-av-add' not in html:
    html = html.replace(a, b, 1)
    print('REPLACED avatar line')

# CSS
if '#tchiloProfileAvatarPlus.tchilo-av-add{' not in html:
    n = '  .profile-avatar{\n    width:90px; height:90px;'
    if n in html:
        html = html.replace(
            n,
            '  #tchiloProfileAvatarPlus.tchilo-av-add{\n    position:absolute;right:0;bottom:0;z-index:5;\n    width:28px;height:28px;border-radius:50%;\n    background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C);\n    border:2.5px solid var(--ink,#0B0B0C);\n    display:flex;align-items:center;justify-content:center;\n    padding:0;margin:0;cursor:pointer;\n    animation:none!important;transition:none!important;transform:none!important;\n  }\n  #tchiloProfileAvatarPlus.tchilo-av-add svg{display:block;pointer-events:none;}\n  .profile-avatar{\n    width:90px; height:90px;',
            1,
        )
        print('CSS')

# script version
import re
html2, n = re.subn(
    r'src="native/tchilo-profile-avatar-plus\.js[^"]*"',
    'src="native/tchilo-profile-avatar-plus.js?v=3"',
    html,
    count=1,
)
if n:
    html = html2
    print('script v3')

p.write_text(html, encoding='utf-8')
print('count plus', html.count('tchiloProfileAvatarPlus'))
