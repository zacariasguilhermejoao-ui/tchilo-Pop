#!/usr/bin/env bash
# Prepara a pasta www/ (os ficheiros que ficam DENTRO da app nativa).
# Usado pelo Android e pelo iOS, para as duas apps terem exatamente a mesma interface do site.
#
# - Usa SEMPRE o index.html do commit atual (se estiver incompleto, a build falha — nunca usa uma versão antiga).
# - Guarda a biblioteca do Supabase dentro da app (native/vendor/supabase.js) para a app arrancar sem internet.
# - Acrescenta os scripts que só existem na app (ponte nativa, links profundos, partilha, CSS offline),
#   iguais nas duas plataformas.
set -euo pipefail

fail() { echo "ERROR: $1" >&2; exit 1; }

[ -f index.html ] || fail "index.html em falta no repositório"
BYTES=$(wc -c < index.html | tr -d ' ')
echo "index.html size=$BYTES"
[ "$BYTES" -ge 100000 ] || fail "index.html demasiado pequeno ($BYTES) — a abortar"
grep -q 'screen-feed' index.html || fail "index.html sem screen-feed"
grep -q 'loginGate' index.html || fail "index.html sem loginGate"

rm -rf www
mkdir -p www/native/vendor www/redefinir-senha www/reset-password www/resources
cp index.html www/index.html
cp -a native/. www/native/
[ -d resources ] && cp -a resources/. www/resources/ || true
[ -f redefinir-senha/index.html ] && cp redefinir-senha/index.html www/redefinir-senha/ || true
[ -f reset-password/index.html ] && cp reset-password/index.html www/reset-password/ || true
[ -f manifest.webmanifest ] && cp manifest.webmanifest www/manifest.webmanifest || true
[ -f capacitor.config.json ] && cp capacitor.config.json www/ || true

# Biblioteca do Supabase dentro da app (sem ela a app falha no arranque quando não há internet)
if [ "${TCHILO_SKIP_VENDOR:-0}" != "1" ]; then
  SUPABASE_UMD_URL="${SUPABASE_UMD_URL:-https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js}"
  ok=0
  for i in 1 2 3; do
    if curl -fsSL --max-time 60 "$SUPABASE_UMD_URL" -o www/native/vendor/supabase.js \
       && [ "$(wc -c < www/native/vendor/supabase.js | tr -d ' ')" -gt 40000 ] \
       && grep -q 'createClient' www/native/vendor/supabase.js; then
      ok=1; break
    fi
    echo "tentativa $i de descarregar o Supabase falhou"; sleep 3
  done
  [ "$ok" = "1" ] || fail "não foi possível guardar a biblioteca do Supabase dentro da app"
  echo "supabase.js guardado ($(wc -c < www/native/vendor/supabase.js | tr -d ' ') bytes)"
fi

# Ficheiros só da app (iguais no Android e no iOS). Só entram se existirem e se o index ainda não os referir.
python3 - <<'PY'
from pathlib import Path
p = Path('www/index.html')
t = p.read_text(encoding='utf-8')

def has(x): return x in t

if Path('www/native/offline-ui.css').exists() and not has('native/offline-ui.css'):
    t = t.replace('</head>', '<link rel="stylesheet" href="native/offline-ui.css"></head>', 1)
if Path('www/manifest.webmanifest').exists() and not has('manifest.webmanifest'):
    t = t.replace('</head>', '<link rel="manifest" href="/manifest.webmanifest"></head>', 1)

tags = ''
for js in ['capacitor-bridge.js', 'legal-navbar-fix.js', 'feed-names-fix.js', 'face-effects.js', 'media-editor.js',
           'feed-stable.js', 'tchilo-deeplink.js', 'tchilo-password-reset.js', 'tchilo-share-target.js']:
    if Path('www/native/' + js).exists() and not has('native/' + js):
        tags += '<script src="native/%s"></script>' % js
        print('injetado:', js)
if tags:
    i = t.rfind('</body>')
    t = (t[:i] + tags + t[i:]) if i >= 0 else (t + tags)
p.write_text(t, encoding='utf-8')
PY

echo "www contents:"
ls -la www | head -20
echo "native files: $(ls www/native | wc -l)"
test -s www/index.html
test -d www/native
