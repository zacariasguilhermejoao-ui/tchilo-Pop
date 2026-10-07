#!/usr/bin/env python3
"""Wire tchilo-avatar-stable.js into index and harden inline avatar onerror."""
from pathlib import Path
import re

idx = Path("index.html")
if not idx.exists():
    print("no index"); raise SystemExit(0)

t = idx.read_text(encoding="utf-8", errors="replace")
o = t

t = t.replace(
    'onerror="this.remove()"',
    'onerror="this.onerror=null;this.src=(window.tchiloDefaultAvatarSrc&&window.tchiloDefaultAvatarSrc())||\'avatar-claro.svg\';this.classList.add(\'tchilo-default-avatar\')"',
)

script = '<script src="native/tchilo-avatar-stable.js?v=1" defer></script>'
if "tchilo-avatar-stable.js" not in t:
    if "profile-avatar-cloud.js" in t:
        t = re.sub(
            r'(<script[^>]*profile-avatar-cloud\.js[^>]*></script>)',
            r'\1\n' + script,
            t,
            count=1,
        )
        print("wired after profile-avatar-cloud")
    elif "tchilo-profile-avatar-plus.js" in t:
        t = re.sub(
            r'(<script[^>]*tchilo-profile-avatar-plus\.js[^>]*></script>)',
            r'\1\n' + script,
            t,
            count=1,
        )
        print("wired after avatar-plus")
    else:
        t = t.replace("</body>", script + "\n</body>", 1)
        print("wired before body")
else:
    t = re.sub(r"tchilo-avatar-stable\.js\?v=\d+", "tchilo-avatar-stable.js?v=1", t)
    print("version bump")

if t != o:
    idx.write_text(t, encoding="utf-8")
    print("index written", len(t))
else:
    print("index unchanged")
