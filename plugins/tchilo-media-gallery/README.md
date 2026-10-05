# TchiloMediaGallery

Plugin nativo Capacitor para a galeria do Tchilo.

- **iOS:** PhotoKit (`PHAsset` / `PHPhotoLibrary`)
- **Android:** MediaStore (`MediaStore.Files` + thumbnails)

## API

```js
const { TchiloMediaGallery } = Capacitor.Plugins;

await TchiloMediaGallery.requestPermissions();
const { items, limited } = await TchiloMediaGallery.getRecentMedia({ limit: 60, offset: 0 });
const { albums } = await TchiloMediaGallery.getAlbums();
const album = await TchiloMediaGallery.getAlbumMedia({ albumId: albums[0].id, limit: 60 });
```

## Integração

```bash
npm install ./plugins/tchilo-media-gallery
npx cap sync
```

### iOS — Info.plist

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>O Tchilo precisa de aceder às tuas fotos para criares publicações e stories.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>O Tchilo pode guardar media na tua galeria.</string>
<key>NSCameraUsageDescription</key>
<string>O Tchilo precisa da câmara para tirar fotos e vídeos.</string>
```

### Android — já declarado no manifest do plugin

- `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` (API 33+)
- `READ_EXTERNAL_STORAGE` (API ≤ 32)
