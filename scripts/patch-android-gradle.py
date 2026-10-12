#!/usr/bin/env python3
"""Patch android/app/build.gradle — signing estável, sem minify (evita R8 fail)."""
from pathlib import Path
import os
import re

p = Path("android/app/build.gradle")
if not p.exists():
    raise SystemExit(f"missing {p}")

t = p.read_text(encoding="utf-8")
use_upload = os.environ.get("USE_UPLOAD_KEY") == "1"

# Nunca forçar minify neste CI (causa muitos falhanços R8)
t = re.sub(r"minifyEnabled\s+true", "minifyEnabled false", t)
t = re.sub(r"shrinkResources\s+true", "shrinkResources false", t)

# Remover signingConfig debug forçado no release se vamos usar upload key
if use_upload:
    t = re.sub(r"signingConfig\s+signingConfigs\.debug", "/* debug signing removed */", t)

# Append bloco limpo no fim do ficheiro (não injeta no meio e parte a sintaxe)
extra = "\n\n// --- tchilo CI signing patch ---\n"
if use_upload:
    extra += """
android.signingConfigs {
    release {
        def ks = file('tchilo-upload.jks')
        if (ks.exists()) {
            storeFile ks
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD') ?: ''
            keyAlias System.getenv('ANDROID_KEY_ALIAS') ?: 'key0'
            keyPassword System.getenv('ANDROID_KEY_PASSWORD') ?: System.getenv('ANDROID_KEYSTORE_PASSWORD') ?: ''
        }
    }
}
android.buildTypes.release.signingConfig android.signingConfigs.release
android.buildTypes.release.minifyEnabled false
android.buildTypes.release.shrinkResources false
"""
else:
    extra += """
android.buildTypes.release.signingConfig android.signingConfigs.debug
android.buildTypes.release.minifyEnabled false
android.buildTypes.release.shrinkResources false
"""

if "tchilo CI signing patch" not in t:
    t = t + extra

p.write_text(t, encoding="utf-8")
print("Gradle patched OK, USE_UPLOAD_KEY=", use_upload)
print("--- tail build.gradle ---")
print("\n".join(t.splitlines()[-25:]))
