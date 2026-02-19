Rápido guia para rodar o backend localmente

1) Copie `.env.example` para `.env` e atualize `DATABASE_URL`.

2) Instale dependências:

```bash
cd "c:/Users/Super economico/Downloads/estrelas-backend"
npm install
```

3) Gerar client Prisma e rodar migrations (local):

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4) Rodar seed:

```bash
npm run seed
```

5) Iniciar servidor:

```bash
npm run dev
# ou
npm start
```

Endpoint principal:
- POST /api/athletes (multipart/form-data)
  - campos: `fullName`, `cpf`, `birthDate` (YYYY-MM-DD), `gender`, `whatsapp`, `weight`, `height`, `shirt`, `shoe`, `position`, `foot`, `nis`, `photo` (file), endereço: `street`, `number`, `neighborhood`, `city`, `uf`, escolaridade: `school`, `grade`, `shift`, médico: `medicalRestriction` (Y/N), `allergies` (Y/N), `bloodType`, `emergencyContact`, `emergencyPhone`, responsável: `guardianName`, `guardianCpf`, `guardianPhone`.

Observações
- Este é um backend minimal para integração local. Em produção: habilitar validação server-side, verificação de CPF, upload seguro (S3), proteção CSRF, autenticação e rate-limiting.
