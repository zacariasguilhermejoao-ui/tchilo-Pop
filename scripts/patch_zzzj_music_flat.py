#!/usr/bin/env python3
"""Wire music flat CSS injector; flatten post-music embedded CSS. Never touch login-button."""
from pathlib import Path
import re

# index script tag
p = Path('index.html')
if p.exists():
    html = p.read_text(encoding='utf-8', errors='replace')
    tag = '<script src="native/tchilo-music-flat.css.js?v=1"></script>'
    if 'tchilo-music-flat.css.js' not in html:
        if 'post-music-feed.js' in html:
            html = re.sub(
                r'(<script src="native/post-music-feed\.js[^>]*></script>)',
                r'\1\n' + tag,
                html,
                count=1,
            )
        else:
            html = html.replace('</body>', tag + '\n</body>', 1)
        p.write_text(html, encoding='utf-8')
        print('index injector added')
    else:
        html2 = re.sub(r'tchilo-music-flat\.css\.js\?v=\d+', 'tchilo-music-flat.css.js?v=1', html)
        if html2 != html:
            p.write_text(html2, encoding='utf-8')
        print('index injector ok')

# flatten post-music-feed source CSS (best-effort)
pm = Path('native/post-music-feed.js')
if pm.exists():
    t = pm.read_text(encoding='utf-8', errors='replace')
    o = t
    pairs = [
        ('align-items:flex-end;justify-content:center;', 'align-items:stretch;justify-content:stretch;'),
        ('background:rgba(0,0,0,.35);', 'background:#000;'),
        ('max-height:82vh;', 'max-height:none;height:100%;'),
        ('background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px 20px 0 0;', 'background:#000;color:#fff;border-radius:0;'),
        ('border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.18);', 'border:0;box-shadow:none;'),
        ('border:2px solid var(--ink,#0B0B0C);border-radius:12px;padding:10px;font-weight:800;font-size:13px;background:#fff;color:var(--ink,#0B0B0C);', 'border:0;border-radius:10px;padding:10px;font-weight:600;font-size:13px;background:rgba(255,255,255,.1);color:#fff;'),
        ('.tab.on{background:var(--mint,#c8f560);}', '.tab.on{background:rgba(255,255,255,.22);color:#fff;}'),
        ('border:2px solid var(--ink,#0B0B0C);background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);border-radius:12px;width:40px;height:40px;font-size:20px;font-weight:800;', 'border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:50%;width:36px;height:36px;font-size:18px;font-weight:600;'),
        ('background:#fff;border:2px solid var(--ink,#0B0B0C);border-radius:14px;padding:10px 12px;', 'background:rgba(255,255,255,.1);border:0;border-radius:12px;padding:12px 14px;'),
        ('color:var(--ink,#0B0B0C);font-size:15px;font-weight:600;', 'color:#fff;font-size:15px;font-weight:500;'),
        ('background:rgba(200,245,96,.25);', 'background:rgba(255,255,255,.06);'),
        ('border:2px solid var(--ink,#0B0B0C);background:', 'border:0;background:'),
        ('.playbtn{background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);}', '.playbtn{background:rgba(255,255,255,.15);color:#fff;}'),
        ('.playbtn.playing{background:var(--pink,#ff6f7d);color:#fff;animation:tchiloPulse 1s ease-in-out infinite;}', '.playbtn.playing{background:#3897f0;color:#fff;animation:none;}'),
        ('.favbtn{background:#fff;color:var(--ink,#0B0B0C);}', '.favbtn{background:rgba(255,255,255,.08);color:#fff;}'),
        ('.favbtn.on{background:var(--yellow,#ffe66d);}', '.favbtn.on{background:rgba(255,255,255,.2);}'),
        ("btn.style.background = on ? 'var(--yellow)' : '#fff';", "btn.style.background = on ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)';"),
        ('border-radius:12px;background:#ddd;border:2px solid #0B0B0C', 'border-radius:8px;background:#222;border:0'),
    ]
    for a, b in pairs:
        if a in t:
            t = t.replace(a, b)
            print('ok', a[:40])
    if t != o:
        pm.write_text(t, encoding='utf-8')
        print('post-music written')
    else:
        print('post-music unchanged')

for rel in ['native/music-use-sheet.js', 'native/story-music.js']:
    f = Path(rel)
    if not f.exists():
        continue
    t = f.read_text(encoding='utf-8', errors='replace')
    o = t
    t = t.replace('border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.2);', 'border:0;box-shadow:none;')
    t = t.replace('border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.18);', 'border:0;box-shadow:none;')
    t = t.replace('.opt:active{background:var(--mint,#c8f560);}', '.opt:active{background:rgba(255,255,255,.08);}')
    if t != o:
        f.write_text(t, encoding='utf-8')
        print('flat', rel)

print('music flat patch done')
