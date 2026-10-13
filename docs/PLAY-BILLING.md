# Tchilo — Google Play Billing

## Estado atual

| Item | Estado |
|------|--------|
| Plugin `@capgo/native-purchases` | No `package.json` (sync no build Android) |
| Permissão `com.android.vending.BILLING` | Injetada no CI (`android-build.yml`) |
| Paddle | **Removido** (stub em `native/paddle-premium.js`) |
| Plus (premium) | Compra única **`tchilo_plus`** · **4 USD** · `inapp` |
| Moedas | Opcional: `moedas_70` via `native/tchilo-play-billing.js` |

## Produto Plus (já criado no Console)

| Campo | Valor |
|--------|--------|
| Tipo | **One-time product** (não assinatura) |
| Product ID | `tchilo_plus` |
| Preço | **4,00 USD** (todos os países) |
| Age rating | All ages |
| Status | **Active** |

Código (`native/tchilo-premium.js`):

```js
window.__TCHILO_PLAY_PRODUCT_ID = "tchilo_plus";   // default
window.__TCHILO_PLAY_PRODUCT_TYPE = "inapp";      // default
```

## Build Android com billing

1. GitHub → **Actions** → **Android app build** → **Run workflow** (ou push a `main`).
2. Descarrega o artifact **tchilo-pop-android-release-aab**.
3. Play Console → **Testing → Internal testing** → upload do AAB → publica o track.
4. Instala a app a partir do **Internal testing** (não sideload de APK antigo).

## Testar a compra Plus

1. Play Console → **Settings → License testing** → adiciona o Gmail de teste.
2. Abre a app (build novo) → **Definições** → banner Plus → **Comprar por 4 USD**.
3. Deve abrir o diálogo nativo da Google Play.
4. Após sucesso, o perfil fica com `is_premium` / `tchilo_premium=1`.

## Moedas (opcional)

Product ID exemplo: `moedas_70` (consumable). Ver `native/tchilo-play-billing.js`.

## Site vs App

| Plataforma | Pagamento Plus |
|------------|----------------|
| Browser (tchilopop.com) | Mensagem: compra na app Android |
| App Android | Google Play Billing (`tchilo_plus`) |
| App iOS (futuro) | App Store IAP |

## Checklist

- [x] Produto `tchilo_plus` Active no Console
- [x] Preço 4 USD
- [x] JS `inapp` + banner Plus
- [x] Plugin + BILLING no CI
- [ ] Novo AAB publicado em Internal testing
- [ ] Conta de teste em License testing
- [ ] Compra de teste bem-sucedida no dispositivo
