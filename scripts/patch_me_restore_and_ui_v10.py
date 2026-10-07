#!/usr/bin/env python3
"""Restore media-editor.js from known-good commit and wire overlay + login."""
from pathlib import Path
import os
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SHA = "acac5780f3459d23c0c9dd06e46340567fbb685b"
URL = f"https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/{SHA}/native/media-editor.js"

def restore_media_editor():
    dest = ROOT / "native" / "media-editor.js"
    headers = {"User-Agent": "tchilo-ci"}
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        req = urllib.request.Request(URL, headers=headers)
        with urllib.request.urlopen(req, timeout=45) as r:
            data = r.read()
        if len(data) > 10000 and b"tchiloOpenMediaEditor" in data:
            dest.write_bytes(data)
            print("restored media-editor", len(data))
            return True
        print("invalid download", len(data), data[:80])
    except Exception as e:
        print("download failed", type(e).__name__, e)
    # last resort: keep existing if not PLACEHOLDER
    if dest.exists():
        cur = dest.read_bytes()
        if b"PLACEHOLDER" not in cur and len(cur) > 10000:
            print("keeping existing media-editor", len(cur))
            return True
    return False

def wire_index():
    idx = ROOT / "index.html"
    s = idx.read_text(encoding="utf-8")
    s2 = re.sub(
        r'<script src="native/media-editor\.js[^"]*"></script>',
        '<script src="native/media-editor.js?v=10"></script>',
        s,
    )
    # wire overlay after media-editor
    if "tchilo-media-editor-ui-v10" not in s2:
        s2 = s2.replace(
            '<script src="native/media-editor.js?v=10"></script>',
            '<script src="native/media-editor.js?v=10"></script>\n'
            '<script src="native/tchilo-media-editor-ui-v10.js?v=1"></script>',
            1,
        )
    if "tchilo-login-click-fix" not in s2:
        s2 = s2.replace(
            '<script src="native/media-editor.js?v=10"></script>',
            '<script src="native/media-editor.js?v=10"></script>\n'
            '<script src="native/tchilo-login-click-fix.js?v=3"></script>',
            1,
        )
    if s2 != s:
        idx.write_text(s2, encoding="utf-8")
        print("index wired")
    else:
        print("index unchanged")

if __name__ == "__main__":
    ok = restore_media_editor()
    print("restore_ok", ok)
    wire_index()
