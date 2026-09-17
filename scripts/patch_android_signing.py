#!/usr/bin/env python3
"""Inject release signingConfigs into android/app/build.gradle"""
from pathlib import Path
import re
import sys

p = Path("android/app/build.gradle")
if not p.exists():
    print("android/app/build.gradle not found", file=sys.stderr)
    sys.exit(1)

t = p.read_text()

if "signingConfigs" in t and "signingConfigs.release" in t:
    print("signingConfigs already present")
    sys.exit(0)

block = """
    def keystorePropertiesFile = file("keystore.properties")
    def keystoreProperties = new Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties["storeFile"])
                storePassword keystoreProperties["storePassword"]
                keyAlias keystoreProperties["keyAlias"]
                keyPassword keystoreProperties["keyPassword"]
            }
        }
    }
"""

marker = "android {"
idx = t.find(marker)
if idx < 0:
    print("android { not found in build.gradle", file=sys.stderr)
    sys.exit(1)

t = t[: idx + len(marker)] + "\n" + block + t[idx + len(marker) :]

if "signingConfig signingConfigs.release" not in t:
    t2, n = re.subn(
        r"(release\s*\{)",
        r"\1\n            signingConfig signingConfigs.release",
        t,
        count=1,
    )
    if n:
        t = t2
    else:
        print("warning: could not attach signingConfig to release buildType")

p.write_text(t)
print("signingConfigs injected into android/app/build.gradle")
