# Produtos para criar no Google Play Console

Onde: Play Console → a tua app → **Monetizar → Produtos → Produtos de compra única** (One-time products) → **Criar produto**.

Regras:
- O **ID do produto** tem de ser copiado exatamente (minúsculas, sem espaços). Depois de criado não se pode mudar.
- Todos são de **compra única** e **consumíveis** (o utilizador pode comprar várias vezes). O Plus é o único que se compra uma vez.
- Preço base em **USD**. Podes usar "Preencher preços automaticamente" para os outros países.
- Estado: **Ativo** (Active).

## 1) Moedas (70 moedas = 1 USD)

| ID do produto | Moedas | Preço (USD) | Título sugerido |
|---|---|---|---|
| `moedas_70` | 70 | 1,00 | 70 Moedas Tchilo |
| `moedas_280` | 280 | 4,00 | 280 Moedas Tchilo |
| `moedas_700` | 700 | 10,00 | 700 Moedas Tchilo |
| `moedas_1400` | 1400 | 20,00 | 1400 Moedas Tchilo |
| `moedas_2450` | 2450 | 35,00 | 2450 Moedas Tchilo |
| `moedas_3500` | 3500 | 50,00 | 3500 Moedas Tchilo |
| `moedas_4900` | 4900 | 70,00 | 4900 Moedas Tchilo |

Descrição sugerida (igual para todos): "Moedas para enviar presentes nas LIVEs e apoiar criadores no Tchilo."

## 2) Anúncios (1 USD por dia)

Na app Android o anúncio só pode ter 1, 3, 7, 14 ou 30 dias (cada um é um produto).

| ID do produto | Dias | Preço (USD) | Título sugerido |
|---|---|---|---|
| `anuncio_1d` | 1 | 1,00 | Anúncio Tchilo · 1 dia |
| `anuncio_3d` | 3 | 3,00 | Anúncio Tchilo · 3 dias |
| `anuncio_7d` | 7 | 7,00 | Anúncio Tchilo · 7 dias |
| `anuncio_14d` | 14 | 14,00 | Anúncio Tchilo · 14 dias |
| `anuncio_30d` | 30 | 30,00 | Anúncio Tchilo · 30 dias |

Descrição sugerida: "Publicidade no Tchilo durante o número de dias indicado."

## 3) Plano Plus (compra única, não consumível)

| ID do produto | Preço (USD) | Título sugerido |
|---|---|---|
| `tchilo_plus` | 4,00 | Tchilo Plus |

Descrição sugerida: "Mais ferramentas para criadores. Compra única."
(Já existia na conta antiga. Tens de o criar de novo na conta da empresa.)

## Depois de criar

1. Ativa todos os produtos (estado **Ativo**).
2. Em **Testes de licença**, adiciona o teu Gmail de teste.
3. Publica um AAB novo em teste interno e instala a app **a partir do Google Play** (não por APK solto).
4. Testa: uma compra de moedas, um anúncio de 1 dia e o Plus.

Nota: a Google Play exige preço mínimo; se recusar 1,00 USD, usa 0,99 USD e diz-me para ajustar as moedas.
