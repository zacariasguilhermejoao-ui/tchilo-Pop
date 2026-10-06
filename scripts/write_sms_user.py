#!/usr/bin/env python3
import base64, pathlib
parts = []
for i in range(3):
    parts.append(pathlib.Path(f"scripts/sms_b64_{i}.txt").read_text().strip())
b64 = "".join(parts)
pathlib.Path("sms-icon.svg").write_bytes(base64.b64decode(b64))
print("wrote sms-icon.svg", len(b64))
