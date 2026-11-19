# Google e pesquisa (SEO)

## O que já existia e está certo
- Páginas públicas geradas sozinhas (a cada 30 minutos) para utilizadores (`/u/nome`) e posts (`/post/id`), com título, descrição, `canonical`, Open Graph e dados estruturados.
- `sitemap.xml` com todas as páginas, e `sitemap-video.xml` para os vídeos. O `robots.txt` aponta para eles.
- Contas privadas ficam de fora das páginas e dos sitemaps.
- Domínio certo (tchilopop.com) e `.nojekyll` (para o GitHub servir tudo).

## O que corrigi
- A página inicial só tinha o título "Feed", sem descrição, `canonical`, imagem nem dados estruturados. Agora tem tudo isto, mais um texto para quem não corre JavaScript.
- Quem pede para eliminar a conta passa logo a conta privada: o perfil sai das páginas públicas na geração seguinte (até 30 minutos) e do Google quando ele voltar a visitar.

## O que tens de fazer (só tu podes)
1. Google Search Console (search.google.com/search-console): adicionar `tchilopop.com` como domínio e verificar com um registo TXT na Cloudflare.
2. Enviar o `sitemap.xml` e o `sitemap-video.xml` em Sitemaps.
3. Em "Inspeção de URL", pedir indexação da página inicial e de 2 ou 3 perfis e posts.
4. Passados alguns dias, ver o relatório "Páginas" para saber o que foi indexado e porquê não foi o resto.
5. Repetir no Bing Webmaster Tools.
6. Confirmar que o workflow `generate-seo` tem os segredos `SUPABASE_URL` e a chave configurados; sem eles não gera páginas novas.

## Limites
- Ninguém pode garantir que o Google mostra uma página. Páginas novas e de sites novos demoram dias ou semanas.
- Posts sem legenda ficam com título e descrição genéricos; o Google dá-lhes pouco valor.
- Quem abre uma página pública num browser é levado para a app. É comum, mas se as páginas forem muito diferentes do que a pessoa vê, o Google pode desconfiar.
