# Share Target (receber partilhas do sistema)

O Tchilo aparece na lista "Partilhar" do telemóvel. Foto/vídeo → Postar, Story ou Mensagem. Texto e links → Mensagem.

## Android (app)
- O workflow corre `scripts/patch_android_share.py` depois de `cap add android`.
- O script acrescenta ao `AndroidManifest.xml` os filtros SEND e SEND_MULTIPLE (texto, imagem, vídeo, áudio, PDF).
- Copia `native/android-share/MainActivity.java` para o projeto Android. Este ficheiro copia os ficheiros partilhados para a cache da app e entrega-os à página (`window.TchiloAndroidShare`).
- A página lê a partilha em `native/tchilo-share-target.js`.
- Se um dia a `MainActivity.java` tiver código próprio, o script pára com erro em vez de a substituir.

## Site instalado (PWA)
- `manifest.webmanifest` (share_target) + `sw.js` (recebe o POST em /share-target).
- Ícones PNG (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`) para o Chrome aceitar instalar como app.
- Safari/iPhone não suporta Share Target no site; no iPhone só funciona na app (extensão de partilha).

## Como testar no Android
1. Instala o APK novo.
2. Na Galeria, escolhe uma foto → Partilhar → Tchilo. Deve abrir a folha "Postar / Story / Mensagem".
3. No Chrome, partilha um link → Tchilo. Deve abrir a opção de enviar por mensagem.
4. Repete com a app fechada e com a app já aberta (os dois casos usam caminhos diferentes).
