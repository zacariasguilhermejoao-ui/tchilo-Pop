#!/usr/bin/env python3
import base64, pathlib
parts = [pathlib.Path(f"scripts/fee_sms_js_{i}.txt").read_text().strip() for i in range(7)]
pathlib.Path("native/fee-sms-final.js").write_bytes(base64.b64decode("".join(parts)))
print("wrote fee-sms-final.js")
