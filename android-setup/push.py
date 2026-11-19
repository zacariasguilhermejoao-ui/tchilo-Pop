#!/usr/bin/env python3
"""
Notificações push no Android (corre no workflow depois de `npx cap add android`):
1) permissão POST_NOTIFICATIONS (Android 13+);
2) ícone pequeno branco das notificações (ic_stat_tchilo) + meta-data do Firebase;
É seguro correr mais do que uma vez.
"""
import shutil
import sys
import xml.dom.minidom
from pathlib import Path

MANIFEST = Path("android/app/src/main/AndroidManifest.xml")
RES_SRC = Path("native/android-push/res")
RES_DST = Path("android/app/src/main/res")
ICON_META = "com.google.firebase.messaging.default_notification_icon"


def fail(msg):
    print("ERRO: " + msg)
    sys.exit(1)


def main():
    if not MANIFEST.is_file():
        fail("AndroidManifest.xml não encontrado")
    if not RES_SRC.is_dir():
        fail("ícones em falta: " + str(RES_SRC))
    text = MANIFEST.read_text(encoding="utf-8")

    if "android.permission.POST_NOTIFICATIONS" not in text:
        i = text.find(">", text.find("<manifest"))
        if i < 0:
            fail("<manifest> não encontrado")
        text = text[: i + 1] + '\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />' + text[i + 1 :]
        print("Manifest: POST_NOTIFICATIONS adicionada")
    else:
        print("Manifest: POST_NOTIFICATIONS já existe")

    if ICON_META not in text:
        i = text.find("</application>")
        if i < 0:
            fail("</application> não encontrado")
        meta = '\n        <meta-data android:name="%s" android:resource="@drawable/ic_stat_tchilo" />\n    ' % ICON_META
        text = text[:i] + meta + text[i:]
        print("Manifest: ícone das notificações adicionado")
    else:
        print("Manifest: ícone das notificações já existe")

    try:
        xml.dom.minidom.parseString(text.encode("utf-8"))
    except Exception as e:  # noqa: BLE001
        fail("manifest ficaria inválido: " + str(e))
    MANIFEST.write_text(text, encoding="utf-8")

    n = 0
    for d in sorted(RES_SRC.iterdir()):
        if not d.is_dir():
            continue
        dst = RES_DST / d.name
        dst.mkdir(parents=True, exist_ok=True)
        for f in d.iterdir():
            shutil.copy2(f, dst / f.name)
            n += 1
    if n == 0:
        fail("nenhum ícone copiado")
    print("Ícones copiados: %d" % n)
    print("Push Android: OK")


if __name__ == "__main__":
    main()
