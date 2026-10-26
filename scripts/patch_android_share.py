#!/usr/bin/env python3
"""
Liga o Share Target no Android (corre no workflow depois de `npx cap add android`):
1) acrescenta ao AndroidManifest.xml os filtros de partilha (SEND / SEND_MULTIPLE);
2) copia native/android-share/MainActivity.java para o projeto Android.
É seguro correr mais do que uma vez.
"""
import json
import re
import sys
import xml.dom.minidom
from pathlib import Path

MANIFEST = Path("android/app/src/main/AndroidManifest.xml")
TEMPLATE = Path("native/android-share/MainActivity.java")

FILTERS = """
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
                <data android:mimeType="image/*" />
                <data android:mimeType="video/*" />
                <data android:mimeType="audio/*" />
                <data android:mimeType="application/pdf" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SEND_MULTIPLE" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="image/*" />
                <data android:mimeType="video/*" />
            </intent-filter>
"""


def fail(msg):
    print("ERRO: " + msg)
    sys.exit(1)


def patch_manifest():
    if not MANIFEST.is_file():
        fail("AndroidManifest.xml não encontrado: " + str(MANIFEST))
    text = MANIFEST.read_text(encoding="utf-8")

    if "android.intent.action.SEND" in text:
        print("Manifest: filtros de partilha já existem")
        return

    m = re.search(r'<activity\b[^>]*android:name="[^"]*MainActivity"[^>]*>', text)
    if not m:
        fail("activity MainActivity não encontrada no manifest")
    tag = m.group(0)
    end = text.find("</activity>", m.end())
    if end < 0:
        fail("</activity> não encontrado")

    new_tag = tag
    if "android:launchMode" not in new_tag:
        new_tag = new_tag[:-1] + ' android:launchMode="singleTask">'
    if "android:exported" not in new_tag:
        new_tag = new_tag[:-1] + ' android:exported="true">'

    text = text[: m.start()] + new_tag + text[m.end() : end] + FILTERS + "        " + text[end:]
    try:
        xml.dom.minidom.parseString(text.encode("utf-8"))
    except Exception as e:  # noqa: BLE001
        fail("manifest ficaria inválido: " + str(e))
    MANIFEST.write_text(text, encoding="utf-8")
    print("Manifest: filtros de partilha adicionados")


def patch_activity():
    if not TEMPLATE.is_file():
        fail("modelo não encontrado: " + str(TEMPLATE))
    cfg = json.loads(Path("capacitor.config.json").read_text(encoding="utf-8"))
    app_id = cfg.get("appId")
    if not app_id:
        fail("appId em falta no capacitor.config.json")

    java_dir = Path("android/app/src/main/java").joinpath(*app_id.split("."))
    target = java_dir / "MainActivity.java"
    kt = java_dir / "MainActivity.kt"
    if kt.exists():
        fail("existe MainActivity.kt; este script só trata de MainActivity.java")
    if target.exists():
        current = target.read_text(encoding="utf-8")
        if "TchiloAndroidShare" in current:
            print("MainActivity: já tem a ponte de partilha")
            return
        if "extends BridgeActivity" not in current:
            fail("MainActivity.java existente não é a padrão do Capacitor")
        body = re.sub(r"\s+", "", current)
        if "publicclassMainActivityextendsBridgeActivity{}" not in body:
            fail("MainActivity.java tem código próprio; não vou substituí-lo")
    java_dir.mkdir(parents=True, exist_ok=True)
    target.write_text(
        TEMPLATE.read_text(encoding="utf-8").replace("__PACKAGE__", app_id), encoding="utf-8"
    )
    print("MainActivity: escrita em " + str(target))


if __name__ == "__main__":
    patch_manifest()
    patch_activity()
    print("Share Target Android: OK")
