#!/usr/bin/env python3
"""Restore media-picker from known-good commit then run surgical v5."""
from pathlib import Path
import urllib.request
import runpy

url = "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/a9e590a5/native/tchilo-media-picker.js"
dest = Path("native/tchilo-media-picker.js")
print("downloading good base...")
data = urllib.request.urlopen(url, timeout=30).read()
if len(data) < 20000:
    raise SystemExit("download too small: %d" % len(data))
dest.write_bytes(data)
print("base", len(data))

surgical = Path("scripts/patch_zzzw_media_picker_v5.py")
if surgical.exists():
    print("running surgical v5...")
    runpy.run_path(str(surgical))
else:
    print("surgical missing — base only")
print("final", dest.stat().st_size)
