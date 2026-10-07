#!/usr/bin/env python3
"""Restore media-editor.js from known-good commit and wire overlay + login."""
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SHA = "acac5780f3459d23c0c9dd06e46340567fbb685b"
URL = f"https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/{SHA}/native/media-editor.js"

def restore_media_editor():
    dest = ROOT / "native" / "media-editor.js"
    try:
        with urllib.request.urlopen(URL, timeout=30) as r:
            data = r.read()
        if len(data) > 10000 and b"tchiloOpenMediaEditor" in data:
            dest.write_bytes(data)
            print("restored media-editor from", SHA, len(data))
            return True
        print("download looked invalid", len(data))
    except Exception as e:
        print("download failed", e)
    return False

def wire_index():
    idx = ROOT / "index.html"
    s = idx.read_text(encoding="utf-8")
    s2 = re.sub(
        r'<script src="native/media-editor\.js[^"]*"></script>',
        '<script src="native/media-editor.js?v=10"></script>',
        s,
    )
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
    restore_media_editor()
    wire_index()
