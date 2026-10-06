#!/usr/bin/env python3
"""LAST patch: force restore media-picker from a9e590a5 + v5 features."""
from pathlib import Path
import urllib.request
import re

url = "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/a9e590a5/native/tchilo-media-picker.js"
dest = Path("native/tchilo-media-picker.js")
print("FORCE download base...")
data = urllib.request.urlopen(url, timeout=60).read()
if len(data) < 20000:
    raise SystemExit("base too small %d" % len(data))
dest.write_bytes(data)
print("base", len(data))

# Run surgical in-process
import runpy
s = Path("scripts/patch_zzzw_media_picker_v5.py")
if s.exists() and s.stat().st_size > 500:
    runpy.run_path(str(s))
else:
    print("no surgical")

final = dest.stat().st_size
print("FINAL", final)
if final < 20000:
    raise SystemExit("still broken after restore")
