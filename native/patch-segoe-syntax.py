#!/usr/bin/env python3
from pathlib import Path
import subprocess
root = Path('native')
fixed = []
for p in sorted(root.rglob('*.js')):
    t = p.read_text(encoding='utf-8', errors='replace')
    t2 = t
    t2 = t2.replace('BlinkMacSystemFont,"Segoe UI",Roboto', 'BlinkMacSystemFont,Segoe UI,Roboto')
    t2 = t2.replace("BlinkMacSystemFont,'Segoe UI',Roboto", 'BlinkMacSystemFont,Segoe UI,Roboto')
    t2 = t2.replace('"Segoe UI"', 'Segoe UI')
    t2 = t2.replace("'Segoe UI'", 'Segoe UI')
    if t2 != t:
        p.write_text(t2, encoding='utf-8')
        fixed.append(str(p))
print('fixed:', fixed)
for f in fixed:
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
    print(f, 'OK' if r.returncode == 0 else r.stderr.split(chr(10))[0][:100])
