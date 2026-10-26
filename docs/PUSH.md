# Notificações push (Android)

## O que faz
- `native/tchilo-push-native.js` (carregado por `native/feed-stable.js`) só corre na app Android.
- Só pede permissão e regista o telemóvel depois de haver sessão iniciada.
- Cria o canal `tchilo_default` (o mesmo que a Edge Function `send-push` usa).
- Grava o token em `device_tokens` e volta a gravar se mudar a conta ou o token. Remove o mesmo token de outras contas.
- Ao tocar numa notificação: mensagem abre Mensagens, o resto abre Notificações.

## No build (workflows Android)
- `scripts/patch_android_push.py`: permissão POST_NOTIFICATIONS (Android 13+) e ícone branco das notificações (`native/android-push/res`).
- `firebase/google-services.json` é copiado para `android/app/` (package com.tchilo.isabstudio, projeto tchilo-f981f).

## iPhone (ainda NÃO ligado)
- O iPhone entrega um token APNs; a Edge Function envia por FCM e precisa de token FCM.
- Falta: entitlement `aps-environment`, capability Push no perfil de assinatura, chave APNs no Firebase e o Firebase Messaging no AppDelegate.

## Como testar
1. Instala o APK novo, inicia sessão e aceita a permissão de notificações.
2. Confirma uma linha nova em `device_tokens` com platform android.
3. Com outra conta, envia uma mensagem ou gosta de um post: a notificação chega com a app fechada.
4. Toca na notificação: abre a secção certa.
