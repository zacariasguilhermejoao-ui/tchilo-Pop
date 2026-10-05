#!/usr/bin/env python3
import base64
from pathlib import Path
b64 = open('/home/workdir/artifacts/scripts/write_sms_icon.py').read().split('b64 = "')[1].split('"')[0] if False else ''
# FIXED BELOW
