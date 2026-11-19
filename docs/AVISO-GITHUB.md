# Cuidado ao enviar para o GitHub

O repositório tem workflows que correm sozinhos e reescrevem o index.html:

- `patch-index.yml` corre TODOS os scripts `scripts/patch_*.py` sempre que alguém envia algo para a pasta `scripts/`. Isso reaplica patches antigos (login, ícone SMS, tamanho do LIVE) e grava o resultado. Por isso os scripts novos do Android estão em `android-setup/` e não em `scripts/`.
- `bump-premium-script.yml` passou a ser só manual (antes voltava a pôr `?v=7g` no index.html).
- Não envies ficheiros para `scripts/` sem ter certeza de que queres correr esses patches todos.
