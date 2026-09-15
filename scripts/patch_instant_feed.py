#!/usr/bin/env python3
"""Feed instant: show local cache immediately, refresh cloud in background."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

old_empty = (
    "feed.innerHTML = '<div class=\"empty\"><b>O teu feed está vazio</b>Quando existirem publicações públicas, elas aparecerão aqui.</div>';"
)
new_empty = (
    "if (window.__publicFeedLoading) {\n"
    "      feed.innerHTML = '<div class=\"empty\" style=\"opacity:.85\"><b>A atualizar…</b>A carregar publicações.</div>';\n"
    "    } else {\n"
    "      feed.innerHTML = '<div class=\"empty\"><b>O teu feed está vazio</b>Quando existirem publicações públicas, elas aparecerão aqui.</div>';\n"
    "    }"
)
if old_empty in html and "A atualizar…" not in html:
    html = html.replace(old_empty, new_empty, 1)
    changed = True
    print("empty/loading patched")
else:
    print("empty skip")

old_goto = "if (name === 'feed') { resetFeedChrome(); renderFeed(); setupFeedChromeAutoHide(); setTimeout(function(){ loadPublicFeedFromSupabase(true); }, 0); }"
new_goto = "if (name === 'feed') { resetFeedChrome(); try{renderFeed();}catch(e){} setupFeedChromeAutoHide(); setTimeout(function(){ try{ if(!window.__publicFeedLoaded) loadPublicFeedFromSupabase(true); else loadPublicFeedFromSupabase(false); }catch(e){} }, 80); }"
if old_goto in html:
    html = html.replace(old_goto, new_goto, 1)
    changed = True
    print("goTo feed patched")
else:
    print("goTo not found exact")

if "/* Cache já foi pintado" not in html:
    marker = "  if (!allowedScreens[lastScreen]) lastScreen = 'feed';\n  goTo(lastScreen);\n}"
    if marker in html:
        html = html.replace(
            marker,
            "  if (!allowedScreens[lastScreen]) lastScreen = 'feed';\n"
            "  goTo(lastScreen);\n"
            "  /* Cache já foi pintado; rede em segundo plano */\n"
            "  setTimeout(function(){\n"
            "    try { if (typeof loadPublicFeedFromSupabase === 'function') loadPublicFeedFromSupabase(true); } catch (eL) {}\n"
            "  }, 50);\n"
            "}",
            1,
        )
        changed = True
        print("bootApp background load patched")
    else:
        print("bootApp marker not found")
else:
    print("bootApp already patched")

if "earlyPaint" not in html:
    old_init_mid = (
        "  if (session && session.username) {\n"
        "    hideLoginGate();\n"
        "  } else {"
    )
    new_init_mid = (
        "  if (session && session.username) {\n"
        "    try {\n"
        "      var early = (typeof getPosts === 'function') ? getPosts() : [];\n"
        "      if (early && early.length && typeof renderFeed === 'function') {\n"
        "        var fl = document.getElementById('feedList');\n"
        "        if (fl && !fl.dataset.earlyPaint) { fl.dataset.earlyPaint = '1'; renderFeed(); }\n"
        "      }\n"
        "    } catch (eEarly) {}\n"
        "    hideLoginGate();\n"
        "  } else {"
    )
    if old_init_mid in html:
        html = html.replace(old_init_mid, new_init_mid, 1)
        changed = True
        print("init early paint patched")
    else:
        print("init mid not found")
else:
    print("init already patched")

old_filter = "    return p.cloud === true || following.indexOf(p.username) >= 0;"
new_filter = "    return p.cloud === true || following.indexOf(p.username) >= 0 || !!(p.media || p.mediaItems || p.caption);"
if old_filter in html and "p.media || p.mediaItems" not in html:
    html = html.replace(old_filter, new_filter, 1)
    changed = True
    print("feed filter relaxed for cache")

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes")
