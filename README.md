# 5x5 API

Backend do 5x5.gg construído com NestJS, TypeORM e PostgreSQL. Este repositório executa somente a API; ele não contém nem serve HTML, CSS ou JavaScript do frontend.

O frontend Next.js está no repositório separado [DiogoArcenioo/5x5-front](https://github.com/DiogoArcenioo/5x5-front).

## Executar localmente

```powershell
npm install
npm run start:dev
```

Endereços do backend:

- API: `http://localhost:3000/api`;
- saúde e banco: `http://localhost:3000/api/health`;
- Swagger: `http://localhost:3000/docs`.

A raiz `http://localhost:3000/` retorna `404` intencionalmente, pois o Nest não serve interface web.

## Banco

```powershell
npm run db:migrate
npm run db:verify
```

O TypeORM usa `synchronize: false`. Mudanças estruturais devem ser feitas por novas migrações SQL em `database/migrations`.

## API pública

- `GET /api/catalog/summary`
- `GET /api/catalog/players`
- `GET /api/catalog/players/:slug`
- `GET /api/catalog/teams`
- `GET /api/catalog/teams/:slug`
- `GET /api/catalog/seasons`
- `GET /api/catalog/tournaments`

## API administrativa

- `GET/POST /api/admin/players`
- `GET/PATCH/DELETE /api/admin/players/:id`
- `GET/POST /api/admin/coaches`
- `GET/PATCH/DELETE /api/admin/coaches/:id`
- `GET /api/admin/data/resources`
- `GET/POST/PATCH/DELETE /api/admin/data/:resource`

Os endpoints `/api/admin/*` exigem uma sessão Bearer de um usuário com papel `admin`.

## Usuários e autenticação

- `POST /api/auth/register`: cria sempre um usuário comum;
- `POST /api/auth/login`: autentica e cria uma sessão de sete dias;
- `GET /api/auth/me`: retorna o usuário da sessão;
- `POST /api/auth/logout`: revoga a sessão atual.

As senhas são armazenadas com scrypt e salt individual. Os tokens entregues ao cliente não são persistidos diretamente: o banco armazena somente o hash SHA-256 do token.

Para inicializar um administrador em um banco novo:

```powershell
npm run db:migrate
$env:ADMIN_SEED_USERNAME='admin'
$env:ADMIN_SEED_PASSWORD='defina-a-senha-fora-do-repositorio'
npm run db:seed-admin
```

## Frontend

O frontend chama URLs relativas `/api/*` e faz o encaminhamento para este serviço por meio da variável `BACKEND_URL`. Para desenvolvimento local, rode esta API na porta `3000` e o frontend na porta `3001`.

## Deploy

Consulte [DEPLOY_EASYPANEL.md](DEPLOY_EASYPANEL.md).
