# Chamadas de voz e vídeo

## Como funciona agora
- Quem liga toca no ícone de telefone ou de vídeo na conversa. Do outro lado aparece o ecrã **A receber chamada** com os botões **Recusar** e **Atender**. A chamada já não atende sozinha, nem abre o microfone antes de a pessoa tocar em Atender.
- Se ninguém atender em 40 segundos, a chamada termina.
- Durante a chamada há silenciar, câmara (nas videochamadas) e desligar.
- A chamada é feita diretamente entre os dois telemóveis (WebRTC). O Supabase só leva os sinais para ligar.
- Quem liga envia também uma notificação push para quem recebe.

## O que tens de ligar do teu lado
1. **Servidor TURN.** Sem ele, as chamadas falham quando as duas pessoas estão em redes móveis diferentes (muito comum). Publica a função `supabase/functions/turn-credentials` e guarda os segredos: ou `CF_TURN_KEY_ID` e `CF_TURN_API_TOKEN` (Cloudflare Realtime TURN), ou `TURN_URLS`, `TURN_USERNAME` e `TURN_CREDENTIAL` (outro servidor TURN).
2. **Permissões.** O build do Android passou a acrescentar RECORD_AUDIO, CAMERA e MODIFY_AUDIO_SETTINGS (`android-setup/permissions.py`), e o do iPhone o texto do microfone. Sem isto, o microfone nunca podia ser usado.
3. Confirma que a tabela `call_signals` existe no Supabase, se a usas (a chamada funciona também só pelo canal em tempo real).

## O que já testei
Duas simulações de telemóvel a ligar uma à outra, de voz e de vídeo, com microfone e câmara de teste: toca, atende, liga com áudio e vídeo, desliga e recusa.

## O que não consegui testar
Chamadas reais entre dois telemóveis em redes diferentes, o toque do telemóvel e a qualidade do som e do vídeo.
