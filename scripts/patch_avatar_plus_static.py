#!/usr/bin/env python3
"""Put profile avatar + button in renderProfile HTML; stop inject flicker."""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

PLUS = (
    '<button type="button" id="tchiloProfileAvatarPlus" class="tchilo-av-add" '
    'aria-label="Adicionar foto" '
    'onclick="event.preventDefault();event.stopPropagation();'
    'var i=document.getElementById(\'editAvatarInput\');'
    'if(i){i.value=\'\';i.click();}else if(typeof goTo===\'function\')goTo(\'editprofile\');">'
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" '
    'stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
    '</button>'
)

old = (
    "'<div class=\"profile-avatar\" style=\"background:' + avatarColor + ";overflow:hidden;position:relative\">' + avatarHtml + '</div>' +"
)
# Note: the string in file uses mixed quoting
old2 = "'<div class=\"profile-avatar\" style=\"background:' + avatarColor + ';overflow:hidden;position:relative\">' + avatarHtml + '</div>' +"

new2 = (
    "'<div class=\"profile-avatar\" style=\"background:' + avatarColor + ';overflow:visible;position:relative\">' + avatarHtml + "
    "(!isOther ? '" + "'" + PLUS.replace("'", "\\'") + "'" + " : '') + '</div>' +"
)
# Simpler approach with concatenation in JS:
new_js = (
    "'<div class=\"profile-avatar\" style=\"background:' + avatarColor + ';overflow:visible;position:relative\">' + avatarHtml + "
    "(isOther ? '' : '"
    + '<button type="button" id="tchiloProfileAvatarPlus" class="tchilo-av-add" aria-label="Adicionar foto" '
    + 'onclick="event.preventDefault();event.stopPropagation();var i=document.getElementById(\\\'editAvatarInput\\\');if(i){i.value=\\\'\'\';i.click();}else if(typeof goTo===\\\'function\\\')goTo(\\\'editprofile\\\');">'
    + '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>'
    + "') + '</div>' +"
)

# Actually build carefully for the JS string context:
# pattern in file:
# '<div class="profile-avatar" style="background:' + avatarColor + ';overflow:hidden;position:relative">' + avatarHtml + '</div>' +

target = "'<div class=\"profile-avatar\" style=\"background:' + avatarColor + ';overflow:hidden;position:relative\">' + avatarHtml + '</div>' +"

replacement = (
    "'<div class=\"profile-avatar\" style=\"background:' + avatarColor + ';overflow:visible;position:relative\">' + avatarHtml + "
    "(isOther ? '' : '<button type=\"button\" id=\"tchiloProfileAvatarPlus\" class=\"tchilo-av-add\" aria-label=\"Adicionar foto\" onclick=\"event.preventDefault();event.stopPropagation();var i=document.getElementById(\\'editAvatarInput\\');if(i){i.value=\\'\\';i.click();}else if(typeof goTo===\\'function\\')goTo(\\'editprofile\\');\"><svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.8\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg></button>') + '</div>' +"
)

if target in html:
    html = html.replace(target, replacement, 1)
    print('renderProfile avatar+ fixed')
elif 'id=\"tchiloProfileAvatarPlus\"' in html or "id=\"tchiloProfileAvatarPlus\"" in html:
    print('already in renderProfile')
else:
    # try alternate escape
    t2 = "'<div class=\"profile-avatar\" style=\"background:' + avatarColor + ';overflow:hidden;position:relative\">' + avatarHtml + '</div>'"
    if t2 in html:
        html = html.replace(t2, replacement.rstrip(" +").rstrip(), 1)
        print('partial match fixed')
    else:
        print('FAIL find profile-avatar line')
        # debug
        idx = html.find('profile-avatar" style')
        print(repr(html[idx:idx+120]) if idx>0 else 'no')

# CSS for + in index (stable)
css = '''
  #tchiloProfileAvatarPlus.tchilo-av-add{
    position:absolute; right:0; bottom:0; z-index:5;
    width:28px; height:28px; border-radius:50%;
    background:var(--yellow,#C8F560); color:var(--ink,#0B0B0C);
    border:2.5px solid var(--ink,#0B0B0C);
    display:flex; align-items:center; justify-content:center;
    padding:0; margin:0; cursor:pointer;
    animation:none!important; transition:none!important; transform:none!important;
    box-shadow:none;
  }
  #tchiloProfileAvatarPlus.tchilo-av-add svg{ display:block; pointer-events:none; }
  .profile-avatar{ position:relative; overflow:visible; }
'''

if 'tchiloProfileAvatarPlus.tchilo-av-add' not in html:
    # insert after .profile-avatar block
    html2, n = re.subn(
        r'(  \.profile-avatar\{[\s\S]*?\}\n)',
        r'\1' + css,
        html,
        count=1,
    )
    if n:
        html = html2
        print('css added')
    else:
        print('css miss')

# bump plus script so it becomes no-op when button already in DOM
html = re.sub(
    r'src="native/tchilo-profile-avatar-plus\.js[^"]*"',
    'src="native/tchilo-profile-avatar-plus.js?v=3"',
    html,
    count=1,
)

p.write_text(html, encoding='utf-8')
print('written')
