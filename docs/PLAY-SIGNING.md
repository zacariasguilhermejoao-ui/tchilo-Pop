# Erro: "assinado com a chave incorreta"

## O que significa

A Play Console **já conhece** a chave de upload da app Tchilo.

| | SHA1 |
|--|------|
| **Esperado** (Play) | `0C:32:69:8F:D9:EA:C8:31:02:A1:FD:45:EB:FA:2C:...` |
| **O que enviaste** (debug CI) | `A2:29:BA:83:79:1B:78:6D:61:65:4A:85:CF:3F:16:...` |

O AAB do GitHub Actions estava a ser assinado com a chave **debug**, não com a chave de **upload** original.

## Solução

Precisas do ficheiro **keystore** (`.jks` ou `.keystore`) com que assinaste a **primeira** versão na Play.

### 1. Converter o keystore para Base64 (no teu PC)

```bash
base64 -w 0 o-teu-upload.jks > keystore.b64
# macOS:
# base64 -i o-teu-upload.jks -o keystore.b64
```

### 2. Secrets no GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Valor |
|--------|--------|
| `ANDROID_KEYSTORE_BASE64` | conteúdo completo de `keystore.b64` |
| `ANDROID_KEYSTORE_PASSWORD` | password do keystore |
| `ANDROID_KEY_ALIAS` | alias da chave (ex.: `upload` ou `key0`) |
| `ANDROID_KEY_PASSWORD` | password da chave (muitas vezes = password do keystore) |

### 3. Novo build

Actions → **Android app build** → Run workflow.

Descarrega o artifact **`tchilo-pop-android-release-aab-v1-3`** e faz upload na Play.

Versão desta linha: **1.3.0** (`versionCode` = 1300 + número do run).

## Se perdeste o keystore

1. Play Console → **Setup → App signing**
2. Se usas **Play App Signing**, podes pedir **reset da upload key** (Google gera instruções).
3. Sem a chave original **não** dá para subir updates com outra chave, salvo reset oficial da Google.

## Verificar SHA1 do teu .jks

```bash
keytool -list -v -keystore o-teu-upload.jks
```

O SHA1 deve bater com o que a Play mostra como esperado (`0C:32:69:8F:...`).
