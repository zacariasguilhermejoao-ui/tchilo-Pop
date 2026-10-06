#!/usr/bin/env python3
import base64, pathlib
parts=[pathlib.Path(f"scripts/sms_svg_{i}.txt").read_text().strip() for i in range(5)]
pathlib.Path("sms-icon.svg").write_bytes(base64.b64decode("".join(parts)))
print("sms-icon.svg", len(parts))
