#!/usr/bin/env python3
from pathlib import Path

SCRIPT = '<script src="native/feed-music-play.js"></script>'

def inject_html(path: Path):
    if not path.exists():
        return
    html = path.read_text(encoding="utf-8", errors="replace")
    if "native/feed-music-play.js" in html:
        print(path, "already has feed-music-play")
        return
    if "</body>" in html:
        path.write_text(html.replace("</body>", SCRIPT + "\n</body>", 1), encoding="utf-8")
        print(path, "injected")
    else:
        print(path, "no body")

inject_html(Path("index.html"))

# android workflow
for wf in [Path(".github/workflows/android-build.yml"), Path(".github/workflows/ios-prepare.yml")]:
    if not wf.exists():
        continue
    t = wf.read_text(encoding="utf-8", errors="replace")
    if "feed-music-play.js" in t:
        print(wf, "ok")
        continue
    t2 = t.replace(
        "media-editor.js post-music-feed.js",
        "media-editor.js post-music-feed.js feed-music-play.js",
    )
    t2 = t2.replace(
        "face-effects.js media-editor.js",
        "face-effects.js media-editor.js post-music-feed.js feed-music-play.js",
    )
    if t2 != t:
        wf.write_text(t2, encoding="utf-8")
        print(wf, "updated")
    else:
        print(wf, "no pattern")
