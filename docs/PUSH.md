# Notificações push (Android)

## O que faz
- `native/tchilo-push-native.js` (carregado por `native/feed-stable.js`) só corre na app Android.
- Só pede permissão e regista o telemóvel depois de haver sessão iniciada.
- Cria o canal `tchilo_default` (o mesmo que a Edge Function `send-push` usa).
- Grava o token em `device_tokens` e volta a gravar se mudar a conta ou o token. Remove o mesmo token de outras contas.
- Ao tocar numa notificação: mensagem abre Mensagens, o resto abre Notificações.

## No build (workflows Android)
- `android-setup/push.py`: permissão POST_NOTIFICATIONS (Android 13+) e ícone branco das notificações (`native/android-push/res`).
- `firebase/google-services.json` é copiado para `android/app/` (package com.tchilo.isabstudio, projeto tchilo-f981f).

## iPhone (ainda NÃO ligado)
- O iPhone entrega um token APNs; a Edge Function envia por FCM e precisa de token FCM.
- Falta: entitlement `aps-environment`, capability Push no perfil de assinatura, chave APNs no Firebase e o Firebase Messaging no AppDelegate.

## Como testar
1. Instala o APK novo, inicia sessão e aceita a permissão de notificações.
2. Confirma uma linha nova em `device_tokens` com platform android.
3. Com outra conta, envia uma mensagem ou gosta de um post: a notificação chega com a app fechada.
4. Toca na notificação: abre a secção certa.

## Notificação de chamada
- Quem liga envia também uma notificação «X está a ligar-te» (função `send-push`). Ao tocar, a app abre a conversa com essa pessoa.
- O toque para atender só funciona com a app aberta no outro lado; a notificação serve para chamar a atenção.

## Para confirmar que chega mesmo ao telemóvel (só tu podes)
1. Supabase > Edge Functions > Secrets: tem de existir `FIREBASE_SERVICE_ACCOUNT` (o JSON da conta de serviço do Firebase, do mesmo projeto `tchilo-f981f`).
2. No telemóvel, em Definições do Android > Apps > Tchilo > Notificações: ligadas, e o canal "Tchilo" com importância alta.
3. Fecha a app (desliza para fora) e, noutro telemóvel, envia uma mensagem. Deve aparecer no ecrã em segundos.
4. Se não chegar: vê os registos da função `send-push` no Supabase. Erros típicos: segredo em falta, token antigo (volta a abrir a app com sessão iniciada) ou poupança de bateria do fabricante a fechar a app (Xiaomi, Huawei, Samsung: desliga a otimização de bateria para o Tchilo).
