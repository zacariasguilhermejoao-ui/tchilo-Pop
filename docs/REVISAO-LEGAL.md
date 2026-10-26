# Revisão das políticas (24 de outubro de 2026)

Não sou advogado. Isto é uma revisão técnica do que as políticas dizem contra o que a app faz. Leva isto a um advogado antes de publicares.

## O que mudou
- Paddle removido de todas as páginas públicas e dos textos visíveis da app.
- Pagamentos descritos como Google Play (app Android). No site e no iPhone não há compras.
- Produtos alinhados com a app: Tchilo Plus (4 USD, compra única), moedas (1 a 70 USD), anúncios (1 USD por dia). O "Premium 3 USD por mês" saiu.
- Privacidade: lista de dados reais (incluindo localização, notificações push) e dos serviços usados (Supabase, Google, Deezer, Tenor, OpenStreetMap, ipapi.co).
- Termos: moedas, anúncios, denúncias, direitos de autor, lei aplicável.

## Pontos para decidir ou confirmar (podem gerar risco)
1. **Eliminar conta (novo):** a app regista o pedido e a conta é apagada automaticamente ao fim de 30 dias. Falta correr `supabase/sql/account-deletion.sql`, publicar a função `purge-deleted-accounts` e agendá-la (passos no próprio ficheiro). Nada disto foi testado na tua base de dados. Durante os 30 dias o conteúdo da pessoa continua visível a outros, a não ser que o escondas. Confirma que a função apaga mesmo todas as tabelas da app (ela procura colunas como user_id, owner_id, author_id).
2. **Prazos e promessas** que tens de confirmar que consegues cumprir: apagar dados aos 30 dias; reembolso de anúncio rejeitado antes de começar; análise de pedidos depois das 48 horas.
3. **Lei aplicável e país da empresa:** os Termos dizem "lei do país onde o prestador está estabelecido". Falta o país, a morada e o número fiscal da VENDOZA. Falta indicar a autoridade de proteção de dados competente.
4. **Idade mínima 13 anos.** Em alguns países a idade para consentir tratamento de dados é 16. Confirma com o advogado.
5. **iPhone:** compras de produtos digitais na app da Apple têm de usar o pagamento da Apple. Não está feito. Hoje o iPhone não compra nada.
6. **Formulário "Segurança dos dados" da Google Play** tem de bater com a política de privacidade (localização, identificadores, mensagens, fotos e vídeos).
7. **Deezer** passa por servidores intermediários públicos (allorigins, corsproxy). É um risco de privacidade; convém usar um servidor teu.
8. **Imagens de efeitos** estão em serviços de alojamento temporário (catbox, iili). Podem desaparecer.
9. Os produtos têm de existir na Play Console com os mesmos preços das páginas.
10. Existem textos de Termos e Privacidade dentro do index.html (ecrãs antigos) mais curtos do que os do site. Convém que a app abra sempre as páginas do site.
11. **Anúncios por zona:** a app guarda as zonas escolhidas, mas neste repositório não encontrei o código que decide a quem o anúncio aparece no feed. A função que compara a localização existe (`native/tchilo-geo.js`) mas nenhum ficheiro a carrega nem a chama. Confirma onde os anúncios são servidos e se usam as zonas. Até lá, não prometas o alcance por zona a quem paga. Os Termos já dizem que o alcance não é garantido.
