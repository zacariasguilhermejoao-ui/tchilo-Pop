# «Ver tradução»

## Como funciona na app
1. A app deteta o idioma do texto no próprio telemóvel (grátis). Só mostra o botão quando tem certeza e o idioma é diferente do idioma da app.
2. «Ver tradução» aparece por baixo da legenda do post, do comentário e da legenda dos Reels.
3. Ao tocar, a app pede a tradução à função `translate` do Supabase e mostra o texto traduzido. Toca em «Ver original» para voltar.
4. Cada tradução fica em cache no telemóvel e no Supabase (tabela `translation_cache`), por isso o mesmo texto não é pago duas vezes.

Idiomas da app: português, inglês, francês, italiano e chinês.

## Para ligar (do teu lado)
1. Supabase > SQL Editor: correr `supabase/sql/translation-cache.sql`.
2. Escolher UM serviço e criar a chave:
   - DeepL: segredo `DEEPL_API_KEY` (a chave grátis acaba em `:fx`; tem um limite mensal de caracteres).
   - Google Cloud Translation: segredo `GOOGLE_TRANSLATE_API_KEY` (API v2, paga por caracteres, com quota grátis no início).
3. Supabase > Edge Functions: publicar `supabase/functions/translate` e guardar o segredo.
4. No Google Cloud ou no DeepL, define um alerta de custo e um limite diário.

## Porque não o ML Kit no telemóvel
O ML Kit traduz sem custo e sem internet, mas pede um plugin nativo para o Capacitor e cada idioma é um download de cerca de 30 MB. A qualidade é mais básica. Se quiseres, o `tchilo-translate.js` pode passar a usá-lo mais tarde, só trocando a função `translate`.

## Limites
- Textos com menos de 14 letras ou mais de 2000 caracteres não mostram o botão.
- Só funciona com sessão iniciada e ligação à internet.
- Quando a deteção não tem certeza (frases muito curtas, só emojis, só links), não aparece o botão.
