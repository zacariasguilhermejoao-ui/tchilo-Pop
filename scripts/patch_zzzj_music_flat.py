#!/usr/bin/env python3
"""Flatten music sheets: full-screen black, no neo-brutalist. Do not touch login buttons."""
from pathlib import Path
import re

FLAT_MUSIC_CSS = r'''
/* tchilo-music-flat-v1 — full screen black, no neo */
#tchiloPostMusicSheet{
  display:none!important;position:fixed!important;inset:0!important;z-index:10060!important;
  background:#000!important;align-items:stretch!important;justify-content:stretch!important;
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif!important;
}
#tchiloPostMusicSheet.open{display:flex!important;}
#tchiloPostMusicSheet .panel{
  width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;
  background:#000!important;color:#fff!important;border:0!important;border-radius:0!important;
  box-shadow:none!important;padding:12px 16px calc(16px + env(safe-area-inset-bottom))!important;
  display:flex!important;flex-direction:column!important;gap:12px!important;
}
#tchiloPostMusicSheet .head{display:flex!important;justify-content:space-between!important;align-items:center!important;
  padding-top:max(4px,env(safe-area-inset-top))!important;}
#tchiloPostMusicSheet .head b{font-size:18px!important;font-weight:700!important;color:#fff!important;font-family:system-ui,-apple-system,sans-serif!important;}
#tchiloPostMusicSheet .tabs{display:flex!important;gap:8px!important;}
#tchiloPostMusicSheet .tab{
  flex:1!important;border:0!important;border-radius:10px!important;padding:10px!important;
  font-weight:600!important;font-size:13px!important;background:rgba(255,255,255,.1)!important;
  color:#fff!important;cursor:pointer!important;box-shadow:none!important;
}
#tchiloPostMusicSheet .tab.on{background:rgba(255,255,255,.22)!important;color:#fff!important;}
#tchiloPostMusicSheet .close{
  border:0!important;background:rgba(255,255,255,.12)!important;color:#fff!important;
  border-radius:50%!important;width:36px!important;height:36px!important;font-size:18px!important;
  font-weight:600!important;cursor:pointer!important;box-shadow:none!important;line-height:1!important;
}
#tchiloPostMusicSheet .search{
  display:flex!important;gap:8px!important;align-items:center!important;
  background:rgba(255,255,255,.1)!important;border:0!important;border-radius:12px!important;
  padding:12px 14px!important;box-shadow:none!important;
}
#tchiloPostMusicSheet .search input{
  flex:1!important;border:0!important;background:transparent!important;color:#fff!important;
  font-size:15px!important;font-weight:500!important;outline:none!important;
}
#tchiloPostMusicSheet .search input::placeholder{color:rgba(255,255,255,.4)!important;}
#tchiloPostMusicSheet .list{flex:1!important;overflow:auto!important;-webkit-overflow-scrolling:touch!important;}
#tchiloPostMusicSheet .track{
  display:flex!important;align-items:center!important;gap:12px!important;padding:10px 4px!important;
  border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important;border-radius:0!important;
  background:transparent!important;box-shadow:none!important;cursor:pointer!important;color:#fff!important;
}
#tchiloPostMusicSheet .track:active{background:rgba(255,255,255,.06)!important;}
#tchiloPostMusicSheet .track img{
  width:48px!important;height:48px!important;border-radius:8px!important;object-fit:cover!important;
  border:0!important;background:#222!important;box-shadow:none!important;
}
#tchiloPostMusicSheet .track .meta{flex:1!important;min-width:0!important;}
#tchiloPostMusicSheet .track .meta b{display:block!important;font-size:14px!important;font-weight:600!important;color:#fff!important;
  white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
#tchiloPostMusicSheet .track .meta span{display:block!important;font-size:12px!important;color:rgba(255,255,255,.5)!important;
  white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
#tchiloPostMusicSheet .playbtn,#tchiloPostMusicSheet .favbtn{
  width:40px!important;height:40px!important;border-radius:50%!important;border:0!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  box-shadow:none!important;cursor:pointer!important;
}
#tchiloPostMusicSheet .playbtn{background:rgba(255,255,255,.15)!important;color:#fff!important;}
#tchiloPostMusicSheet .playbtn.playing{background:#3897f0!important;color:#fff!important;animation:none!important;}
#tchiloPostMusicSheet .favbtn{background:rgba(255,255,255,.08)!important;color:#fff!important;}
#tchiloPostMusicSheet .favbtn.on{background:rgba(255,255,255,.2)!important;color:#fff!important;}
#tchiloPostMusicSheet .badge{
  display:inline-block!important;font-size:10px!important;font-weight:600!important;
  background:rgba(255,255,255,.12)!important;border:0!important;border-radius:6px!important;
  padding:2px 6px!important;color:rgba(255,255,255,.7)!important;box-shadow:none!important;
}
#tchiloPostMusicSheet .empty{color:rgba(255,255,255,.45)!important;text-align:center!important;padding:32px 16px!important;}
/* music use sheet */
#tchiloMusicUseSheet{background:rgba(0,0,0,.55)!important;}
#tchiloMusicUseSheet .panel,
#tchiloMusicUseSheet .sheet-panel{
  background:#111!important;color:#fff!important;border:0!important;border-radius:16px 16px 0 0!important;
  box-shadow:none!important;
}
#tchiloMusicUseSheet .opt{border:0!important;box-shadow:none!important;background:transparent!important;color:#fff!important;}
#tchiloMusicUseSheet .opt:active{background:rgba(255,255,255,.08)!important;}
/* media editor music sheet */
#tchiloMediaEd .me-sheet-panel{
  background:#111!important;color:#fff!important;border:0!important;box-shadow:none!important;
}
#tchiloMediaEd .me-search{
  background:rgba(255,255,255,.1)!important;border:0!important;box-shadow:none!important;border-radius:12px!important;
}
#tchiloMediaEd .me-search input{color:#fff!important;}
#tchiloMediaEd .me-publish{
  background:#3897f0!important;color:#fff!important;border:0!important;box-shadow:none!important;
}
#tchiloMediaEd .me-iconbtn{
  border:0!important;background:rgba(255,255,255,.1)!important;color:#fff!important;box-shadow:none!important;
}
#tchiloMediaEd .me-chip.active{border-color:rgba(255,255,255,.35)!important;background:rgba(255,255,255,.12)!important;}
#tchiloMediaEd .me-tool.active{background:rgba(255,255,255,.1)!important;outline:1px solid rgba(255,255,255,.25)!important;}
#tchiloMediaEd .me-range{accent-color:#3897f0!important;}
'''

# --- index: inject override (never touch .login-button) ---
idx = Path('index.html')
if idx.exists():
    html = idx.read_text(encoding='utf-8', errors='replace')
    if '/* tchilo-music-flat-v1' in html:
        html = re.sub(
            r'/\* tchilo-music-flat-v1[\s\S]*?(?=/\* tchilo-|</style>)',
            FLAT_MUSIC_CSS + '\n',
            html,
            count=1,
        )
        print('refreshed music flat in index')
    else:
        # place before last </style> in head-ish or first style close after flat blocks
        if '/* tchilo-system-titles' in html:
            html = html.replace('/* tchilo-system-titles', FLAT_MUSIC_CSS + '\n/* tchilo-system-titles', 1)
        elif '/* tchilo-flat-all-v3' in html:
            html = html.replace('/* tchilo-flat-all-v3', FLAT_MUSIC_CSS + '\n/* tchilo-flat-all-v3', 1)
        else:
            html = html.replace('</style>', FLAT_MUSIC_CSS + '\n</style>', 1)
        print('injected music flat in index')
    idx.write_text(html, encoding='utf-8')

# --- post-music-feed: rewrite embedded CSS strings for resilience ---
pm = Path('native/post-music-feed.js')
if pm.exists():
    t = pm.read_text(encoding='utf-8', errors='replace')
    orig = t
    replacements = [
        (
            "#tchiloPostMusicSheet{display:none;position:fixed;inset:0;z-index:290;background:rgba(0,0,0,.35);align-items:flex-end;justify-content:center;}",
            "#tchiloPostMusicSheet{display:none;position:fixed;inset:0;z-index:10060;background:#000;align-items:stretch;justify-content:stretch;}",
        ),
        (
            "#tchiloPostMusicSheet .panel{width:min(100%,520px);max-height:82vh;background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px 20px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px;border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.18);}",
            "#tchiloPostMusicSheet .panel{width:100%;max-height:none;height:100%;background:#000;color:#fff;border-radius:0;padding:12px 16px calc(16px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px;border:0;box-shadow:none;}",
        ),
        (
            "#tchiloPostMusicSheet .tab{flex:1;border:2px solid var(--ink,#0B0B0C);border-radius:12px;padding:10px;font-weight:800;font-size:13px;background:#fff;color:var(--ink,#0B0B0C);cursor:pointer;}",
            "#tchiloPostMusicSheet .tab{flex:1;border:0;border-radius:10px;padding:10px;font-weight:600;font-size:13px;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;}",
        ),
        (
            "#tchiloPostMusicSheet .tab.on{background:var(--mint,#c8f560);}",
            "#tchiloPostMusicSheet .tab.on{background:rgba(255,255,255,.22);color:#fff;}",
        ),
        (
            "#tchiloPostMusicSheet .close{border:2px solid var(--ink,#0B0B0C);background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);border-radius:12px;width:40px;height:40px;font-size:20px;font-weight:800;cursor:pointer;line-height:1;}",
            "#tchiloPostMusicSheet .close{border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:50%;width:36px;height:36px;font-size:18px;font-weight:600;cursor:pointer;line-height:1;}",
        ),
        (
            "#tchiloPostMusicSheet .search{display:flex;gap:8px;align-items:center;background:#fff;border:2px solid var(--ink,#0B0B0C);border-radius:14px;padding:10px 12px;}",
            "#tchiloPostMusicSheet .search{display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.1);border:0;border-radius:12px;padding:12px 14px;}",
        ),
        (
            "#tchiloPostMusicSheet .search input{flex:1;border:0;background:transparent;color:var(--ink,#0B0B0C);font-size:15px;font-weight:600;outline:none;}",
            "#tchiloPostMusicSheet .search input{flex:1;border:0;background:transparent;color:#fff;font-size:15px;font-weight:500;outline:none;}",
        ),
        (
            "#tchiloPostMusicSheet .track:active{background:rgba(200,245,96,.25);}",
            "#tchiloPostMusicSheet .track:active{background:rgba(255,255,255,.06);}",
        ),
        (
            "#tchiloPostMusicSheet .track img{width:52px;height:52px;border-radius:12px;object-fit:cover;border:2px solid var(--ink,#0B0B0C);background:",
            "#tchiloPostMusicSheet .track img{width:48px;height:48px;border-radius:8px;object-fit:cover;border:0;background:",
        ),
        (
            "#tchiloPostMusicSheet .playbtn,#tchiloPostMusicSheet .favbtn{width:40px;height:40px;border-radius:50%;border:2px solid var(--ink,#0B0B0C);d",
            "#tchiloPostMusicSheet .playbtn,#tchiloPostMusicSheet .favbtn{width:40px;height:40px;border-radius:50%;border:0;d",
        ),
        (
            "#tchiloPostMusicSheet .playbtn{background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);}",
            "#tchiloPostMusicSheet .playbtn{background:rgba(255,255,255,.15);color:#fff;}",
        ),
        (
            "#tchiloPostMusicSheet .playbtn.playing{background:var(--pink,#ff6f7d);color:#fff;animation:tchiloPulse 1s ease-in-out infinite;}",
            "#tchiloPostMusicSheet .playbtn.playing{background:#3897f0;color:#fff;animation:none;}",
        ),
        (
            "#tchiloPostMusicSheet .favbtn{background:#fff;color:var(--ink,#0B0B0C);}",
            "#tchiloPostMusicSheet .favbtn{background:rgba(255,255,255,.08);color:#fff;}",
        ),
        (
            "#tchiloPostMusicSheet .favbtn.on{background:var(--yellow,#ffe66d);}",
            "#tchiloPostMusicSheet .favbtn.on{background:rgba(255,255,255,.2);}",
        ),
    ]
    for a, b in replacements:
        if a in t:
            t = t.replace(a, b, 1)
            print('replaced css snippet')
        else:
            print('miss', a[:50])

    # inline track placeholder borders in render
    t = t.replace(
        'border-radius:12px;background:#ddd;border:2px solid #0B0B0C',
        'border-radius:8px;background:#222;border:0',
    )
    t = t.replace(
        "width:40px;height:40px;border-radius:50%;border:2px solid var(--ink,#0B0B0C);background:var(--mint,#c8f560);color:var(--ink);display:flex;a",
        "width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.15);color:#fff;display:flex;a",
    )
    t = t.replace(
        "border:2px solid var(--ink);background:var(--mint)",
        "border:0;background:rgba(255,255,255,.15)",
    )
    t = t.replace(
        "border:2px solid var(--ink);background:' +\n(isFav(t.id) ? 'var(--yellow)' : '#fff')",
        "border:0;background:' +\n(isFav(t.id) ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)')",
    )
    # fav toggle colors
    t = t.replace(
        "btn.style.background = on ? 'var(--yellow)' : '#fff';",
        "btn.style.background = on ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)';",
    )

    if t != orig:
        pm.write_text(t, encoding='utf-8')
        print('post-music-feed written')
    else:
        print('post-music-feed unchanged')

# soft-flatten music-use / story music sheets source
for rel in ['native/music-use-sheet.js', 'native/story-music.js']:
    p = Path(rel)
    if not p.exists():
        continue
    t = p.read_text(encoding='utf-8', errors='replace')
    o = t
    t = t.replace('border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.2);', 'border:0;box-shadow:none;')
    t = t.replace('border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -12px 40px rgba(0,0,0,.18);', 'border:0;box-shadow:none;')
    t = t.replace('.opt:active{background:var(--mint,#c8f560);}', '.opt:active{background:rgba(255,255,255,.08);}')
    if t != o:
        p.write_text(t, encoding='utf-8')
        print('flattened', rel)

print('done music flat')
