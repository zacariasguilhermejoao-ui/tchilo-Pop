# send-push — Edge Function

Envia notificações push (FCM) para likes, comentários e mensagens.

## 1. Secret no Supabase

Dashboard → **Project Settings → Edge Functions → Secrets**:

| Nome | Valor |
|------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Conteúdo completo do JSON da Service Account do Firebase |

### Como obter a Service Account
1. [Firebase Console](https://console.firebase.google.com) → Project **tchilo-f981f**
2. ⚙️ Project Settings → **Service accounts**
3. Clica **Generate new private key**
4. Copia o JSON inteiro e cola como secret `FIREBASE_SERVICE_ACCOUNT`

## 2. Deploy

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy send-push
```

Ou cria a função no dashboard e cola o código de `index.ts`.

## 3. Chamar a função no app

### Like
```js
await SB.functions.invoke('send-push', {
  body: {
    type: 'like',
    recipient_user_id: 'uuid-do-dono-do-post',
    actor_username: 'maria',
    actor_name: 'Maria'
  }
});
```

### Comentário
```js
await SB.functions.invoke('send-push', {
  body: {
    type: 'comment',
    recipient_user_id: 'uuid-do-dono-do-post',
    actor_username: 'joao'
  }
});
```

### Mensagem
```js
await SB.functions.invoke('send-push', {
  body: {
    type: 'message',
    recipient_user_id: 'uuid-do-destinatario',
    actor_username: 'ana',
    actor_name: 'Ana'
  }
});
```

## Payload

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `type` | sim | `like` \| `comment` \| `message` \| `follow` \| `story` \| `custom` |
| `recipient_user_id` | sim | UUID do utilizador que recebe |
| `actor_username` | não | Username de quem fez a ação |
| `actor_name` | não | Nome de quem fez a ação |
| `title` | não | Título custom |
| `body` | não | Corpo custom |
| `data` | não | Dados extra |
