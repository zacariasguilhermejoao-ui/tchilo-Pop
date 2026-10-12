#!/usr/bin/env python3
"""Patch android/app/build.gradle for release signing + ProGuard."""
from pathlib import Path
import os
import re

p = Path("android/app/build.gradle")
if not p.exists():
    raise SystemExit(f"missing {p}")

t = p.read_text(encoding="utf-8")
use_upload = os.environ.get("USE_UPLOAD_KEY") == "1"

if use_upload:
    t = re.sub(r"\n\s*signingConfig\s+signingConfigs\.debug\s*\n", "\n", t)

if use_upload and "tchilo-upload" not in t and "signingConfigs" not in t:
    inject = """
    signingConfigs {
        release {
            storeFile file('tchilo-upload.jks')
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD') ?: ''
            keyAlias System.getenv('ANDROID_KEY_ALIAS') ?: ''
            keyPassword System.getenv('ANDROID_KEY_PASSWORD') ?: System.getenv('ANDROID_KEYSTORE_PASSWORD') ?: ''
        }
    }
"""
    if re.search(r"android\s*\{", t):
        t = re.sub(r"(android\s*\{)", r"\1\n" + inject, t, count=1)

if use_upload:
    if re.search(r"release\s*\{", t) and "signingConfig signingConfigs.release" not in t:
        t = re.sub(
            r"(release\s*\{)",
            r"\1\n            signingConfig signingConfigs.release\n",
            t,
            count=1,
        )
else:
    if "signingConfig signingConfigs.debug" not in t and re.search(r"release\s*\{", t):
        t = re.sub(
            r"(release\s*\{)",
            r"\1\n            signingConfig signingConfigs.debug\n",
            t,
            count=1,
        )

t = re.sub(r"minifyEnabled\s+false", "minifyEnabled true", t)

if "minifyEnabled" not in t and re.search(r"release\s*\{", t):
    t = re.sub(
        r"(release\s*\{)",
        r"""\1
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
""",
        t,
        count=1,
    )

if "shrinkResources" not in t:
    t = re.sub(
        r"(minifyEnabled\s+true)",
        r"minifyEnabled true\n            shrinkResources true",
        t,
        count=1,
    )
else:
    t = re.sub(r"shrinkResources\s+false", "shrinkResources true", t)

p.write_text(t, encoding="utf-8")
print("Gradle patched, USE_UPLOAD_KEY=", use_upload)
