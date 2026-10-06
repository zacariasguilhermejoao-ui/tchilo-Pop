#!/usr/bin/env python3
from pathlib import Path
import base64, runpy
parts = sorted(Path("native").glob("c6b64-*.txt"), key=lambda p: int(p.stem.split("-")[1]))
if not parts:
    print("no c6b64"); raise SystemExit(0)
code = base64.b64decode("".join(p.read_text().strip() for p in parts)).decode()
Path("scripts/_c6_run.py").write_text(code, encoding="utf-8")
runpy.run_path("scripts/_c6_run.py")
for p in list(parts)+[Path("scripts/_c6_run.py")]:
    try: p.unlink()
    except Exception: pass
