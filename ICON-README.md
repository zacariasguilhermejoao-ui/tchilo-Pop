# Ícone e Splash do tchilo-Pop

O ícone oficial ("t" preto + 3 pontos coloridos) deve ser usado como:

- Ícone do aplicativo (Android / iOS)
- Splash de abertura
- Logo no topbar e login da web app

## Assets gerados

Coloque os ficheiros:
- `resources/icon.png` (1024x1024)
- `resources/splash.png` (1024x1024 ou maior)

Depois execute:
```bash
npm install
npx @capacitor/assets generate
# ou copie manualmente para as pastas nativas
```

O logo web atual no `index.html` (base64) deve ser substituído pelo novo design.
