#!/usr/bin/env python3
from pathlib import Path
import runpy
a = Path("native/c6-part-a.txt")
b = Path("native/c6-part-b.txt")
if a.exists() and b.exists():
    Path("scripts/_c6_run.py").write_text(a.read_text(encoding="utf-8")+b.read_text(encoding="utf-8"), encoding="utf-8")
    runpy.run_path("scripts/_c6_run.py")
    for p in [a,b,Path("scripts/_c6_run.py")]:
        try: p.unlink()
        except Exception: pass
else:
    print("c6 parts missing")
