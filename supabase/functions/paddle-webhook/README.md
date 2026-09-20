# Paddle webhook — Tchilo Premium

Confirma pagamentos no servidor e define `profiles.is_premium = true`.

## 1. Deploy da função

No projeto (com [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase functions deploy paddle-webhook --no-verify-jwt
```

`--no-verify-jwt` é necessário: o Paddle não envia o JWT do Supabase.

## 2. Secrets no Supabase

Dashboard → **Project Settings → Edge Functions → Secrets** (ou CLI):

```bash
supabase secrets set PADDLE_WEBHOOK_SECRET="pdl_ntfset_..."
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já vêm injetados pelo Supabase.

**Não** uses a API key `pdl_live_apikey_...` aqui. O secret do webhook é o que o Paddle mostra ao criar o *notification destination* (`pdl_ntfset_...`).

## 3. URL do webhook

```
https://<PROJECT_REF>.supabase.co/functions/v1/paddle-webhook
```

Substitui `<PROJECT_REF>` pelo ref do teu projeto Supabase.

## 4. Destino no Paddle (Live)

1. Paddle → **Developer Tools → Notifications**
2. **New destination**
3. URL = a URL acima
4. Eventos recomendados:
   - `transaction.completed`
   - `subscription.activated` (se no futuro usares subscrição)
   - `subscription.canceled`
   - `subscription.past_due`
5. Copia o **secret** (`pdl_ntfset_...`) → grava em `PADDLE_WEBHOOK_SECRET`
6. Guarda e, se houver, envia um evento de teste

## 5. Como identifica o utilizador

1. `custom_data.user_id` (enviado pelo app no checkout)
2. Se falhar: email do customer Paddle → `auth.users` / `profiles`

## 6. Teste

1. Faz um pagamento de teste / real de **Tchilo Premium**
2. Logs: Supabase → Edge Functions → `paddle-webhook` → Logs
3. Confirma em SQL:

```sql
select id, is_premium, premium_txn, premium_updated_at
from profiles
where is_premium = true
order by premium_updated_at desc
limit 20;
```
