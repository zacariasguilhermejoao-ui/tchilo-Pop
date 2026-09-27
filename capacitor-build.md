# Tchilo — Android + iOS (app NATIVA)

A app **não** abre um site na internet.
O APK/IPA carrega os ficheiros locais em `www/`.

## Regra importante

- **Nunca** definir `server.url` no Capacitor (ex.: `https://tchilopop.com`).
- Isso faz a WebView tentar abrir o domínio e falhar com `ERR_NAME_NOT_RESOLVED`.

## Build no GitHub Actions

O workflow `.github/workflows/android-build.yml`:
1. Empacota `index.html` + `native/` em `www/`
2. Remove qualquer `server.url`
3. Gera APK e AAB assinados

Depois do build, descarrega o artifact **tchilo-pop-release-apk** e instala esse APK (não uses builds antigos).
