#!/usr/bin/env python3
"""
Permissões do Android para chamadas, mensagens de voz e câmara (corre no workflow depois de `npx cap add android`).
Acrescenta ao AndroidManifest.xml: RECORD_AUDIO, CAMERA, MODIFY_AUDIO_SETTINGS e as funcionalidades de câmara
e microfone como opcionais. É seguro correr mais do que uma vez.
"""
import sys
import xml.dom.minidom
from pathlib import Path

MANIFEST = Path("android/app/src/main/AndroidManifest.xml")
PERMS = [
    "android.permission.RECORD_AUDIO",
    "android.permission.CAMERA",
    "android.permission.MODIFY_AUDIO_SETTINGS",
]
FEATURES = ["android.hardware.camera", "android.hardware.microphone"]


def main():
    if not MANIFEST.is_file():
        print("ERRO: AndroidManifest.xml não encontrado")
        sys.exit(1)
    text = MANIFEST.read_text(encoding="utf-8")
    i = text.find(">", text.find("<manifest"))
    if i < 0:
        print("ERRO: <manifest> não encontrado")
        sys.exit(1)
    add = ""
    for p in PERMS:
        if p not in text:
            add += '\n    <uses-permission android:name="%s" />' % p
    for f in FEATURES:
        if 'android:name="%s"' % f not in text:
            add += '\n    <uses-feature android:name="%s" android:required="false" />' % f
    if add:
        text = text[: i + 1] + add + text[i + 1 :]
        try:
            xml.dom.minidom.parseString(text.encode("utf-8"))
        except Exception as e:  # noqa: BLE001
            print("ERRO: manifest ficaria inválido: " + str(e))
            sys.exit(1)
        MANIFEST.write_text(text, encoding="utf-8")
        print("Permissões adicionadas")
    else:
        print("Permissões já existem")
    print("Permissões Android: OK")


if __name__ == "__main__":
    main()
