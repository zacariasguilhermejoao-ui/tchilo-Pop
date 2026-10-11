# Tchilo — Google Play Billing

## O que já está no código / CI

1. **Permissão** `com.android.vending.BILLING` injetada no `AndroidManifest.xml` no build Android (GitHub Actions).
2. **Plugin** `@capgo/native-purchases` no `package.json` (sync no build).
3. **JS** `native/tchilo-play-billing.js` — na app Android compra moedas via Play; no site continua Paddle.
4. **Política de loja** — moedas podem ser compradas na app; premium no browser mantém-se até criares subscrição na Play.

## O que tens de fazer na Play Console (obrigatório)

### A. Novo AAB com BILLING

1. Corre o workflow **Android app build** (push a `main` ou *Run workflow*).
2. Descarrega o artifact **tchilo-pop-android-release-aab**.
3. Upload em **Testing → Internal testing** (ou Closed testing).
4. Publica o track de teste.

Depois disto, a página *One-time products* deixa de pedir “Upload a new APK”.

### B. Criar o produto de moedas

**Monetize → Products → One-time products → Create product**

| Campo | Valor |
|--------|--------|
| Product ID | `moedas_70` |
| Name | 70 Moedas Tchilo |
| Description | Pacote de 70 moedas para presentes no Tchilo |
| Status | Active |
| Price | 1,00 USD (ou equivalente) |
| Tipo | **Consumable** (one-time, pode comprar várias vezes) |

Guarda e ativa o produto.

### C. Conta de pagamentos

Em **Settings → Payments profile** confirma que o perfil de merchant está ativo para receberes os pagamentos da Google.

## Testar compras

1. Adiciona a tua conta Google como **License tester** (Play Console → Settings → License testing).
2. Instala a app a partir do Internal testing (não um APK sideload antigo).
3. Abre **Saldo** → compra o pack de 70 moedas.
4. Deve abrir o diálogo nativo da Google Play.

## Product IDs no código

Ficheiro: `native/tchilo-play-billing.js`

```js
var PLAY_PACKS = {
  moedas_70: 70
};
```

Para mais packs, cria produtos na Play (`moedas_140`, etc.) e adiciona aqui + no sheet de saldo.

## Site vs App

| Plataforma | Pagamento |
|------------|-----------|
| Browser (tchilopop.com) | Paddle |
| App Android | Google Play Billing |
| App iOS (futuro) | App Store IAP |
