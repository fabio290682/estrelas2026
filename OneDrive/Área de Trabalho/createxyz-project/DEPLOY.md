# Deploy guide

Resumo das ações para publicar os apps (mobile + web).

Required GitHub secrets
- `EAS_TOKEN` — token para EAS (Expo Application Services).
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — para deploy no Vercel via Action.
- `GOOGLE_PLAY_SERVICE_ACCOUNT` — JSON da service account (raw JSON ou base64). Usado para `eas submit`.

Mobile (apps/mobile)
- Local/manual: instalar `eas-cli` e rodar `eas build --platform all` na pasta `apps/mobile`.
	```bash
	cd apps/mobile
	npm ci
	eas build --platform android --non-interactive --profile production
	```
- Obter artefato: pegue o `.aab` pelo link do EAS CLI ou pelo dashboard do Expo (expo.dev → builds).

Enviar para Google Play (manual)
1. No Play Console, crie o app (se necessário) e preencha metadados (descrição, imagens, política, etc.).
2. Release → Internal testing / Production → Create release → upload `.aab`.
3. Complete checklist (content rating, políticas, distribuição) e envie.

Enviar automaticamente via `eas submit`
1. Crie uma service account no Play Console (Settings → API access) com permissão para gerenciar releases e faça o download do JSON.
2. No CI (GitHub Actions), adicione o JSON como segredo `GOOGLE_PLAY_SERVICE_ACCOUNT` (raw JSON ou base64).
3. Exemplo de comando local (após gerar AAB):
```bash
eas submit --platform android --latest --non-interactive --service-account-json ./android-service-account.json
```

Automatizar no GitHub Actions (build + submit)
- O repo já contém o workflow `.github/workflows/eas-build.yml` que faz build com EAS.
- Para permitir submissão automática, defina o segredo `GOOGLE_PLAY_SERVICE_ACCOUNT` no GitHub (raw JSON ou base64). O workflow irá:
	- restaurar o arquivo `apps/mobile/android-service-account.json` a partir do segredo;
	- executar `eas submit --platform android --latest`.

Trecho do workflow usado (já adicionado ao repositório):
```yaml
- name: Restore Google Play service account
	env:
		SA_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
	run: |
		python - <<'PY'
import os, json, base64
s = os.environ.get('SA_JSON', '')
out = 'apps/mobile/android-service-account.json'
try:
		json.loads(s)
		open(out, 'w', encoding='utf-8').write(s)
except Exception:
		open(out, 'wb').write(base64.b64decode(s))
PY

- name: EAS Submit Android to Google Play
	run: |
		cd apps/mobile
		eas submit --platform android --latest --non-interactive --service-account-json ./android-service-account.json
```

Notas sobre permissões
- A service account precisa estar vinculada ao projeto no Play Console e ter permissão para gerenciar releases (Release Manager ou role equivalente).
- O `package` em `apps/mobile/app.json` deve corresponder ao Application ID do app no Play Console.
- EAS geralmente gerencia a keystore automaticamente; cheque com `eas credentials --platform android`.

Web (apps/web)
- Local build: na pasta `apps/web`, rodar:
```bash
cd apps/web
npm ci
npm run build
```
- Deploy com Vercel: o workflow `.github/workflows/web-deploy.yml` usa `amondnet/vercel-action` e requer os segredos Vercel.
- Alternativa: conectar o repositório no painel do Vercel (Git integration).

Notas finais
- Configure os segredos no GitHub (Settings → Secrets) antes de disparar os workflows.
- Teste primeiro em Internal testing no Play Console antes de promover para produção.
