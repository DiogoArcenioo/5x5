# Deploy seguro no EasyPanel

O frontend Next.js e o backend NestJS devem se comunicar pela rede interna do EasyPanel. Somente o frontend precisa ficar publicamente acessível; mantenha o domínio do backend restrito sempre que a infraestrutura permitir.

## Backend

- build: `Dockerfile`;
- porta interna: `3000`;
- healthcheck: `/api/health`;
- Swagger: desativado em produção.

Variáveis obrigatórias:

```dotenv
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=3000
API_CORS_ORIGIN=https://cs5x5.com
FRONTEND_URL=https://cs5x5.com

DB_HOST=host-interno-do-postgres
DB_PORT=5432
DB_NAME=counter_db
DB_USER=usuario-exclusivo-da-api
DB_PASSWORD=senha-forte-e-exclusiva
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_LOGGING=false

JWT_SECRET=segredo-aleatorio-com-no-minimo-64-caracteres
JWT_ISSUER=cs5x5-api
JWT_AUDIENCE=cs5x5-web
USER_SESSION_HOURS=168
ADMIN_SESSION_HOURS=2
INTERNAL_API_KEY=outra-chave-aleatoria-com-no-minimo-48-caracteres
ENABLE_SWAGGER=false

GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REDIRECT_URI=https://cs5x5.com/api/auth/google/callback
```

Se o PostgreSQL interno não oferecer TLS, `DB_SSL=false` pode ser necessário. Não exponha a porta do banco à internet.

## Frontend

Use exatamente a mesma `INTERNAL_API_KEY` do backend:

```dotenv
BACKEND_URL=http://nome-interno-do-servico-backend:3000
SITE_URL=https://cs5x5.com
INTERNAL_API_KEY=mesma-chave-interna-configurada-no-backend
```

Depois de salvar as variáveis, faça um novo deploy dos dois serviços. Chaves de `.env.local` servem apenas para desenvolvimento e nunca devem ser copiadas de um repositório ou enviadas em mensagens.

## Validação

- `https://cs5x5.com/api/health` deve retornar `200`;
- uma rota como `/api/catalog/summary` deve funcionar pelo domínio do frontend;
- a mesma rota chamada diretamente no backend, sem a chave interna, deve retornar `401`;
- `/docs` deve permanecer indisponível em produção;
- o cookie `cs5x5_session` deve aparecer como `HttpOnly`, `Secure` e `SameSite=Strict`.
