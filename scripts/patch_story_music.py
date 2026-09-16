#!/usr/bin/env python3
from pathlib import Path
import re

# inject script
idx = Path("index.html")
if idx.exists():
    html = idx.read_text(encoding="utf-8", errors="replace")
    if "native/story-music.js" not in html and "</body>" in html:
        html = html.replace("</body>", '<script src="native/story-music.js"></script>\n</body>', 1)
        print("injected story-music.js")
    # persist music on publishStory item
    old = "const item={\n    text:data.text||'',\n    media:data.media||null,\n    mediaType:data.mediaType||null,\n    color:data.media?null:(data.color||'m1'),\n    createdAt:Date.now()\n  };"
    new = "const item={\n    text:data.text||'',\n    media:data.media||null,\n    mediaType:data.mediaType||null,\n    color:data.media?null:(data.color||'m1'),\n    music:data.music||data.musicMeta||null,\n    musicMeta:(data.musicMeta||data.music||null),\n    createdAt:Date.now()\n  };"
    if old in html:
        html = html.replace(old, new, 1)
        print("publishStory item music fields")
    elif "musicMeta:(data.musicMeta" in html:
        print("publishStory already has music")
    else:
        # try single-line variant
        m = re.search(r"const item=\{[^}]*createdAt:Date\.now\(\)\s*\};", html)
        if m and "musicMeta" not in m.group(0):
            rep = m.group(0).replace(
                "createdAt:Date.now()\n  };",
                "music:data.music||data.musicMeta||null,musicMeta:(data.musicMeta||data.music||null),createdAt:Date.now()\n  };",
            )
            if rep == m.group(0):
                rep = m.group(0).replace(
                    "createdAt:Date.now()};",
                    "music:data.music||data.musicMeta||null,musicMeta:(data.musicMeta||data.music||null),createdAt:Date.now()};",
                )
            html = html.replace(m.group(0), rep, 1)
            print("publishStory regex patched")
        else:
            print("publishStory pattern not found")
    idx.write_text(html, encoding="utf-8")

# workflows
for wf in [Path(".github/workflows/android-build.yml"), Path(".github/workflows/ios-prepare.yml")]:
    if not wf.exists():
        continue
    t = wf.read_text(encoding="utf-8", errors="replace")
    if "story-music.js" in t:
        print(wf.name, "ok")
        continue
    t2 = t.replace(
        "feed-music-play.js",
        "feed-music-play.js story-music.js",
    )
    t2 = t2.replace(
        "post-music-feed.js",
        "post-music-feed.js feed-music-play.js story-music.js",
    )
    # avoid dup
    while "story-music.js story-music.js" in t2:
        t2 = t2.replace("story-music.js story-music.js", "story-music.js")
    while "feed-music-play.js feed-music-play.js" in t2:
        t2 = t2.replace("feed-music-play.js feed-music-play.js", "feed-music-play.js")
    if t2 != t:
        wf.write_text(t2, encoding="utf-8")
        print(wf.name, "updated")
