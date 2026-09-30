#!/usr/bin/env bash
# Garante elementos de interface no index.html (SMS, ⋯ perfil, Reels na navbar)
set -euo pipefail
INDEX="${1:-index.html}"
test -f "$INDEX"

python3 - "$INDEX" << 'PY'
import sys
from pathlib import Path
path = Path(sys.argv[1])
data = path.read_text(encoding='utf-8')
orig = data

new_icons = '''      <div class="topbar-icons">
        <button type="button" class="icon-btn topbar-sms" data-top-messages="1" aria-label="Mensagens" onclick="goTo('messages')">
          <span class="nav-sms-text">SMS</span>
        </button>
        <div class="icon-btn" onclick="goTo('search')" aria-label="Pesquisar">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>
        </div>
      </div>'''

import re
if 'data-top-messages' not in data:
    m = re.search(
        r'<div class="topbar-icons">\s*<div class="icon-btn" onclick="goTo\(\'search\'\)">[\s\S]*?</div>\s*</div>',
        data,
    )
    if m:
        data = data[:m.start()] + new_icons + data[m.end():]
        print('patched topbar SMS')
    else:
        print('WARN: topbar-icons not found')
else:
    print('topbar SMS already present')

css_snip = '''
  /* Tchilo topbar: SMS + lupa (interface nativa no index) */
  .topbar-icons{ display:flex; align-items:center; gap:16px; }
  .topbar-icons .icon-btn{
    width:auto; height:auto; min-width:0;
    border:0; border-radius:0;
    background:transparent; box-shadow:none;
    padding:4px; display:inline-flex; align-items:center; justify-content:center;
  }
  .topbar-icons .icon-btn svg{ width:28px; height:28px; display:block; }
  .topbar-icons .nav-sms-text, .topbar-sms .nav-sms-text{
    display:inline-flex; align-items:center; justify-content:center;
    font:900 20px Inter,system-ui,sans-serif; letter-spacing:.03em; line-height:1;
    color:var(--ink,#0B0B0C); border:0; background:none; padding:4px 2px;
    user-select:none; -webkit-user-select:none;
  }
  #tchiloProfileMoreBtn{
    position:absolute; right:10px; top:50%; transform:translateY(-50%);
    width:44px; height:44px; border-radius:12px; border:2px solid currentColor;
    background:transparent; color:inherit; display:flex; align-items:center; justify-content:center;
    cursor:pointer; z-index:20; padding:0;
  }
  #screen-profile .screen-header{ position:relative; }
'''
if 'Tchilo topbar: SMS + lupa' not in data:
    idx = data.find('.icon-btn{')
    if idx >= 0:
        end = data.find('}', idx)
        data = data[:end+1] + css_snip + data[end+1:]
        print('css inserted')
    else:
        data = data.replace('</style>', css_snip + '</style>', 1)
        print('css before style end')
else:
    print('css already present')

new_prof = '''    <div class="screen-header">
      <button class="back-btn" onclick="goTo('feed')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h1>Perfil</h1>
      <button type="button" id="tchiloProfileMoreBtn" class="tchilo-profile-more" aria-label="Mais opções" onclick="if(window.tchiloOpenProfileShare){tchiloOpenProfileShare();}else if(navigator.share){navigator.share({title:'Tchilo',url:location.href}).catch(function(){})}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>
      </button>
    </div>
    <div class="profile-body" id="profileBody"></div>'''

if 'tchiloProfileMoreBtn' not in data:
    m = re.search(
        r'<div class="screen-header">\s*<button class="back-btn" onclick="goTo\(\'feed\'\)">\s*<svg[^>]*>[\s\S]*?</svg>\s*</button>\s*<h1>Perfil</h1>\s*</div>\s*<div class="profile-body" id="profileBody"></div>',
        data,
    )
    if m:
        data = data[:m.start()] + new_prof + data[m.end():]
        print('profile more btn')
    else:
        print('WARN: profile header not found')
else:
    print('profile more already present')

new_nav = '''    <button class="nav-item" data-screen="reels" aria-label="Reels" onclick="if(typeof openReels==='function')openReels();else goTo('reels')">
      <svg class="nav-reels-icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M7 5V3M12 5V3M17 5V3"/><path d="M10 10.5v5l4.5-2.5L10 10.5z" fill="currentColor" stroke="none"/></svg>
      <div class="dot"></div>
    </button>'''

m = re.search(
    r'<button class="nav-item" data-screen="messages" onclick="goTo\(\'messages\'\)">[\s\S]*?</button>',
    data,
)
if m:
    data = data[:m.start()] + new_nav + data[m.end():]
    print('navbar messages -> reels')
else:
    print('navbar messages pattern skip (maybe already reels)')

scripts = [
    'native/nav-layout.js?v=2',
    'native/tchilo-ui-icons-fix.js?v=2',
    'native/tchilo-profile-share.js?v=5',
]
for src in scripts:
    base = src.split('?')[0]
    if base not in data:
        tag = f'<script src="{src}"></script>\n'
        if 'native/feed-stable.js?v=8' in data:
            data = data.replace(
                '<script src="native/feed-stable.js?v=8" defer></script>',
                tag + '<script src="native/feed-stable.js?v=8" defer></script>',
                1,
            )
        else:
            data = data.replace('</body>', tag + '</body>', 1)
        print('script', src)

if data != orig:
    path.write_text(data, encoding='utf-8')
    print('WROTE', path, 'delta', len(data) - len(orig))
else:
    print('no changes needed')
PY
